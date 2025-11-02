/**
 * Publish Landing Page to WordPress
 * 
 * This endpoint publishes an AI-generated landing page to WordPress
 * using the WordPress REST API with Application Password authentication.
 */

module.exports = async (req, res) => {
  console.log('=== PUBLISH TO WORDPRESS API CALLED ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { landingPageId, storeId } = req.body;
    
    console.log('📊 Request:', { landingPageId, storeId });
    
    if (!landingPageId || !storeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: landingPageId, storeId' 
      });
    }

    // Load Firebase
    const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                        process.env.FIREBASE_CLIENT_EMAIL && 
                        process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasFirebase) {
      console.log('⚠️  Firebase not configured');
      return res.status(500).json({
        error: 'Firebase not configured',
      });
    }

    try {
      const admin = require('firebase-admin');
      
      // Initialize Firebase Admin if not already initialized
      if (admin.apps.length === 0) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          });
        } catch (error) {
          console.error('Firebase init error:', error);
        }
      }
      
      const db = admin.firestore();
      
      // Get landing page from Firebase
      const landingPageDoc = await db
        .collection('stores')
        .doc(storeId)
        .collection('landingPages')
        .doc(landingPageId)
        .get();
      
      if (!landingPageDoc.exists) {
        return res.status(404).json({ error: 'Landing page not found' });
      }
      
      const landingPage = landingPageDoc.data();
      console.log('📄 Landing page loaded:', landingPage.pageTitle);
      
      // Get store data (WordPress credentials)
      const storeDoc = await db.collection('stores').doc(storeId).get();
      
      if (!storeDoc.exists) {
        return res.status(404).json({ error: 'Store not found' });
      }
      
      const store = storeDoc.data();
      console.log('🏪 Store loaded:', store.name);
      
      // Check if WordPress credentials exist
      if (!store.wordpressUsername || !store.wordpressPassword) {
        return res.status(400).json({ 
          error: 'WordPress credentials not configured',
          message: 'Please configure WordPress Publishing credentials in the plugin settings.'
        });
      }
      
      // Decrypt WordPress password
      const crypto = require('crypto');
      const decryptedPassword = decryptPassword(store.wordpressPassword);
      
      // Prepare WordPress REST API request
      let wordpressUrl = store.url || '';
      
      // If URL is empty, try to get it from storeId or fail gracefully
      if (!wordpressUrl || wordpressUrl === '') {
        return res.status(400).json({
          error: 'WordPress URL not configured',
          message: 'Please add your WordPress URL in Store Settings'
        });
      }
      
      wordpressUrl = wordpressUrl.replace(/\/$/, ''); // Remove trailing slash
      const apiUrl = `${wordpressUrl}/wp-json/wp/v2/pages`;
      
      // Create Basic Auth header
      const auth = Buffer.from(`${store.wordpressUsername}:${decryptedPassword}`).toString('base64');
      
      // Prepare page data
      // Sanitize HTML content for WordPress
      let htmlContent = landingPage.html || '';
      
      console.log(`📏 Original HTML length: ${htmlContent.length} characters`);
      
      // Remove any null bytes or invalid characters
      htmlContent = htmlContent.replace(/\0/g, '');
      
      // WordPress LONGTEXT field can handle up to 4GB, but we need to check byte size
      // UTF-8 characters can be 1-4 bytes each
      const byteSize = Buffer.byteLength(htmlContent, 'utf8');
      console.log(`📏 HTML byte size: ${byteSize} bytes`);
      
      // WordPress post_content is LONGTEXT (max 4GB) but some hosts limit it
      // Safe limit: 50KB (50000 bytes) to avoid issues
      const maxBytes = 50000;
      
      if (byteSize > maxBytes) {
        console.log(`⚠️ HTML too large (${byteSize} bytes), truncating to ${maxBytes} bytes`);
        
        // Truncate by bytes, not characters
        let truncated = '';
        let currentBytes = 0;
        
        for (let i = 0; i < htmlContent.length; i++) {
          const char = htmlContent[i];
          const charBytes = Buffer.byteLength(char, 'utf8');
          
          if (currentBytes + charBytes > maxBytes - 100) { // Leave room for closing tag
            break;
          }
          
          truncated += char;
          currentBytes += charBytes;
        }
        
        htmlContent = truncated + '\n<!-- Content truncated due to size limit -->';
        console.log(`✂️ Truncated to ${Buffer.byteLength(htmlContent, 'utf8')} bytes`);
      }
      
      const pageData = {
        title: landingPage.pageTitle,
        content: htmlContent,
        slug: landingPage.pageSlug,
        status: 'publish',
        meta: {
          _wp_page_template: 'page-templates/full-width.php'
        }
      };
      
      console.log('📤 Publishing to WordPress:', apiUrl);
      
      // Make request to WordPress REST API
      const fetch = require('node-fetch');
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pageData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('❌ WordPress API error:', responseData);
        return res.status(response.status).json({
          error: 'Failed to publish to WordPress',
          message: responseData.message || 'WordPress REST API error',
          details: responseData
        });
      }
      
      console.log('✅ Published to WordPress:', responseData.link);
      
      // Update landing page in Firebase
      await db
        .collection('stores')
        .doc(storeId)
        .collection('landingPages')
        .doc(landingPageId)
        .update({
          status: 'published',
          wordpressPageId: responseData.id,
          publishedUrl: responseData.link,
          publishedAt: new Date(),
          updatedAt: new Date(),
        });
      
      console.log('✅ Landing page updated in Firebase');
      
      return res.status(200).json({
        success: true,
        wordpressPageId: responseData.id,
        publishedUrl: responseData.link,
        message: 'Landing page published successfully to WordPress!',
      });
      
    } catch (error) {
      console.error('Firebase/WordPress error:', error);
      return res.status(500).json({
        error: 'Failed to publish landing page',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Publish to WordPress API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

/**
 * Decrypt password using the same method as WordPress plugin
 * Note: This should match the encryption in the plugin
 */
function decryptPassword(encryptedPassword) {
  if (!encryptedPassword) {
    return '';
  }
  
  try {
    const crypto = require('crypto');
    
    // Use a consistent key (in production, this should be from environment variables)
    // For now, we'll use a simple base64 decode as the plugin uses WordPress salts
    // which we don't have access to from Node.js
    
    // Since we can't access WordPress salts from Node.js,
    // we'll store the password in Firebase already decrypted
    // The plugin will decrypt it before sending to Firebase
    
    return encryptedPassword;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedPassword;
  }
}
