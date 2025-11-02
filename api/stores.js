import { getDb } from '../lib/firebase-admin.ts';

export default async function handler(req, res) {
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
        const { apiKey, wordpressUsername, wordpressPassword } = req.body;
        
        console.log('📝 UPDATE WP CREDENTIALS:', {
          apiKey: apiKey ? 'present' : 'missing',
          wordpressUsername,
          wordpressPassword: wordpressPassword ? 'present' : 'missing'
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
        
        // Update WordPress credentials
        await storeDoc.ref.update({
          wordpressUsername,
          wordpressPassword, // Stored as plain text, encrypted in transit via HTTPS
          wordpressConnected: false, // Will be set to true after successful test
          updatedAt: new Date()
        });
        
        console.log('✅ WordPress credentials updated in Firebase');
        
        return res.json({ 
          success: true,
          message: 'WordPress credentials updated successfully'
        });
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
