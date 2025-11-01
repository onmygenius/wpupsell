// Landing Pages API - List, Update, Delete landing pages

module.exports = async (req, res) => {
  console.log('=== LANDING PAGES API CALLED ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { storeId, action, landingPageId } = req.body;
    
    console.log('📊 Request:', { storeId, action, landingPageId });
    
    if (!storeId) {
      return res.status(400).json({ 
        error: 'Missing required field: storeId' 
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
      
      // LIST landing pages
      if (action === 'list' || req.method === 'GET') {
        const snapshot = await db
          .collection('stores')
          .doc(storeId)
          .collection('landingPages')
          .get();
        
        const landingPages = [];
        snapshot.forEach(doc => {
          landingPages.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        
        console.log(`✅ Found ${landingPages.length} landing pages`);
        
        return res.status(200).json({
          success: true,
          landingPages,
        });
      }
      
      // DELETE landing page
      if (action === 'delete' && landingPageId) {
        await db
          .collection('stores')
          .doc(storeId)
          .collection('landingPages')
          .doc(landingPageId)
          .delete();
        
        console.log(`✅ Landing page deleted: ${landingPageId}`);
        
        return res.status(200).json({
          success: true,
          message: 'Landing page deleted successfully',
        });
      }
      
      // UPDATE landing page content
      if (action === 'update' && landingPageId) {
        const { content } = req.body;
        
        if (!content) {
          return res.status(400).json({ error: 'Missing content' });
        }
        
        // Get product info for HTML regeneration
        const landingPageDoc = await db
          .collection('stores')
          .doc(storeId)
          .collection('landingPages')
          .doc(landingPageId)
          .get();
        
        if (!landingPageDoc.exists) {
          return res.status(404).json({ error: 'Landing page not found' });
        }
        
        const landingPageData = landingPageDoc.data();
        
        // Get product data
        const productDoc = await db
          .collection('stores')
          .doc(storeId)
          .collection('products')
          .doc(landingPageData.productId)
          .get();
        
        const product = productDoc.exists ? productDoc.data() : {};
        
        // Get store URL
        const storeDoc = await db.collection('stores').doc(storeId).get();
        const storeData = storeDoc.exists ? storeDoc.data() : {};
        const storeUrl = storeData.url || storeData.siteUrl || '';
        
        // Regenerate HTML with updated content
        const { generateLandingPageHTML } = require('./lib/html-template');
        const html = generateLandingPageHTML(product, content, storeUrl);
        
        await db
          .collection('stores')
          .doc(storeId)
          .collection('landingPages')
          .doc(landingPageId)
          .update({
            content,
            html,
            updatedAt: new Date(),
          });
        
        console.log(`✅ Landing page updated: ${landingPageId}`);
        
        return res.status(200).json({
          success: true,
          message: 'Landing page updated successfully',
        });
      }
      
      // UPDATE landing page status
      if (action === 'updateStatus' && landingPageId) {
        const { status } = req.body;
        
        await db
          .collection('stores')
          .doc(storeId)
          .collection('landingPages')
          .doc(landingPageId)
          .update({
            status,
            updatedAt: new Date(),
          });
        
        console.log(`✅ Landing page status updated: ${landingPageId} -> ${status}`);
        
        return res.status(200).json({
          success: true,
          message: 'Status updated successfully',
        });
      }
      
      return res.status(400).json({
        error: 'Invalid action',
      });
    } catch (error) {
      console.error('Firebase error:', error);
      return res.status(500).json({
        error: 'Failed to process request',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Landing pages API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
