const { getDb } = require('../lib/firebase-admin');

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { action, storeId, userId, ...data } = req.body;

  try {
    const db = getDb();

    switch (action) {
      case 'get': {
        // Get store by storeId
        if (!storeId) {
          return res.status(400).json({ success: false, error: 'storeId required' });
        }

        const storeDoc = await db.collection('stores').doc(storeId).get();
        
        if (!storeDoc.exists) {
          return res.status(404).json({ success: false, error: 'Store not found' });
        }

        return res.json({ 
          success: true, 
          store: storeDoc.data() 
        });
      }

      case 'update': {
        // Update store details
        if (!storeId) {
          return res.status(400).json({ success: false, error: 'storeId required' });
        }

        const updateData = {
          ...data,
          updatedAt: new Date()
        };

        // Remove undefined values
        Object.keys(updateData).forEach(key => 
          updateData[key] === undefined && delete updateData[key]
        );

        await db.collection('stores').doc(storeId).update(updateData);

        return res.json({ 
          success: true,
          message: 'Store updated successfully'
        });
      }

      case 'list': {
        // List stores for a user
        if (!userId) {
          return res.status(400).json({ success: false, error: 'userId required' });
        }

        const storesSnapshot = await db.collection('stores')
          .where('userId', '==', userId)
          .get();

        const stores = [];
        storesSnapshot.forEach(doc => {
          stores.push(doc.data());
        });

        return res.json({ 
          success: true, 
          stores 
        });
      }

      case 'update_wp_credentials': {
        // Update WordPress Publishing credentials
        const { apiKey, wordpressUsername, wordpressPassword, wordpressUrl, wordpressName } = req.body;
        
        console.log('📝 UPDATE WP CREDENTIALS:', {
          apiKey: apiKey ? 'present' : 'missing',
          wordpressUsername,
          wordpressPassword: wordpressPassword ? 'present' : 'missing',
          wordpressUrl,
          wordpressName
        });
        
        if (!apiKey) {
          return res.status(400).json({ success: false, error: 'apiKey required' });
        }
        
        // Find store by API key (100% dynamic - no hardcoded Store ID)
        const storesSnapshot = await db.collection('stores')
          .where('apiKey', '==', apiKey)
          .limit(1)
          .get();
        
        if (storesSnapshot.empty) {
          console.log('❌ Store not found for API Key');
          return res.status(404).json({ success: false, error: 'Store not found' });
        }
        
        const storeDoc = storesSnapshot.docs[0];
        console.log('✅ Store found:', storeDoc.id);
        
        // Update WordPress credentials + URL + name (100% dynamic)
        await storeDoc.ref.update({
          wordpressUsername,
          wordpressPassword, // Stored as plain text, encrypted in transit via HTTPS
          url: wordpressUrl || '', // WordPress site URL (100% dynamic from get_site_url())
          name: wordpressName || 'My Store', // WordPress site name (100% dynamic from get_bloginfo('name'))
          wordpressConnected: false, // Will be set to true after successful test
          updatedAt: new Date()
        });
        
        console.log('✅ WordPress credentials updated in Firebase');
        
        return res.json({ 
          success: true,
          message: 'WordPress credentials updated successfully'
        });
      }

      case 'auto_setup_store': {
        // Auto-setup: Create store + user + sync products in ONE request
        const { 
          wordpressUrl, 
          wordpressName, 
          wordpressEmail,
          wordpressUsername, 
          wordpressPassword,
          products 
        } = req.body;
        
        console.log('🚀 AUTO SETUP STORE:', {
          wordpressUrl,
          wordpressName,
          wordpressEmail,
          productsCount: products?.length || 0
        });
        
        if (!wordpressUrl || !wordpressEmail) {
          return res.status(400).json({ 
            success: false, 
            error: 'WordPress URL and Email required' 
          });
        }
        
        try {
          // Check if store already exists (by WordPress URL)
          const existingStoreSnapshot = await db.collection('stores')
            .where('url', '==', wordpressUrl)
            .limit(1)
            .get();
          
          let userId, storeId, apiKey, dashboardPassword;
          
          if (!existingStoreSnapshot.empty) {
            // Store exists - just update
            console.log('✅ Store exists - updating...');
            const storeDoc = existingStoreSnapshot.docs[0];
            storeId = storeDoc.id;
            userId = storeDoc.data().userId;
            apiKey = storeDoc.data().apiKey;
            
            // Update credentials
            await storeDoc.ref.update({
              name: wordpressName,
              wordpressUsername,
              wordpressPassword,
              wordpressConnected: true,
              wordpressLastTest: Date.now(),
              updatedAt: new Date()
            });
            
            // Get existing password (can't retrieve from Firebase Auth)
            dashboardPassword = 'Use your existing password';
            
          } else {
            // New store - create everything
            console.log('🆕 New store - creating user + store...');
            
            // Generate random password for dashboard
            const crypto = require('crypto');
            dashboardPassword = crypto.randomBytes(8).toString('base64').slice(0, 12);
            
            // Get Firebase Auth instance (already initialized)
            const { getAuth } = require('../lib/firebase-admin');
            const auth = getAuth();
            
            // Create user in Firebase Auth
            const userRecord = await auth.createUser({
              email: wordpressEmail,
              password: dashboardPassword,
              displayName: wordpressName
            });
            
            userId = userRecord.uid;
            console.log('✅ User created:', userId);
            
            // Generate API Key
            apiKey = 'sk_live_' + crypto.randomBytes(20).toString('hex');
            
            // Create store in Firestore
            const storeRef = db.collection('stores').doc(userId);
            await storeRef.set({
              userId,
              storeId: userId,
              name: wordpressName,
              url: wordpressUrl,
              apiKey,
              wordpressUsername,
              wordpressPassword,
              wordpressConnected: true,
              wordpressLastTest: Date.now(),
              plan: 'starter',
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              stats: {
                totalRevenue: 0,
                totalProducts: 0,
                conversions: 0,
                conversionRate: 0,
                currency: 'LEI'
              }
            });
            
            storeId = userId;
            console.log('✅ Store created:', storeId);
          }
          
          // Sync products (for both new and existing stores)
          if (products && products.length > 0) {
            console.log(`📦 Syncing ${products.length} products to store ${storeId}...`);
            console.log('📦 First product:', JSON.stringify(products[0]));
            
            try {
              const batch = db.batch();
              products.forEach((product, index) => {
                const productRef = db.collection('stores')
                  .doc(storeId)
                  .collection('products')
                  .doc(product.id.toString());
                
                console.log(`📦 Adding product ${index + 1}/${products.length}: ${product.name} (ID: ${product.id})`);
                
                batch.set(productRef, {
                  ...product,
                  syncedAt: new Date()
                });
              });
              
              await batch.commit();
              console.log('✅ Products batch committed successfully');
              
              // Update total products count
              await db.collection('stores').doc(storeId).update({
                'stats.totalProducts': products.length
              });
              
              console.log('✅ Products synced - total:', products.length);
            } catch (error) {
              console.error('❌ Error syncing products:', error);
              throw error;
            }
          } else {
            console.log('⚠️ No products to sync');
          }
          
          // Return credentials
          return res.json({
            success: true,
            apiKey,
            dashboardEmail: wordpressEmail,
            dashboardPassword,
            dashboardUrl: 'https://wpupsell-dashboard.vercel.app/login',
            message: 'Store setup complete! Products synced successfully.'
          });
          
        } catch (error) {
          console.error('❌ Auto setup error:', error);
          return res.status(500).json({
            success: false,
            error: error.message
          });
        }
      }

      case 'update_wp_status': {
        // Update WordPress connection status after test
        const { apiKey, wordpressConnected, wordpressLastTest } = req.body;
        
        if (!apiKey) {
          return res.status(400).json({ success: false, error: 'apiKey required' });
        }
        
        // Find store by API key (100% dynamic - no hardcoded Store ID)
        const storesSnapshot = await db.collection('stores')
          .where('apiKey', '==', apiKey)
          .limit(1)
          .get();
        
        if (storesSnapshot.empty) {
          return res.status(404).json({ success: false, error: 'Store not found' });
        }
        
        const storeDoc = storesSnapshot.docs[0];
        
        // Update WordPress connection status
        await storeDoc.ref.update({
          wordpressConnected,
          wordpressLastTest,
          updatedAt: new Date()
        });
        
        return res.json({ 
          success: true,
          message: 'WordPress connection status updated successfully'
        });
      }

      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action. Use: get, update, list' 
        });
    }
  } catch (error) {
    console.error('Stores API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
}
