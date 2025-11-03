// Products Sync & Management API
// Handles product synchronization from WooCommerce plugin to Firebase

module.exports = async (req, res) => {
  console.log('=== PRODUCTS API CALLED ===');
  console.log('Method:', req.method);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.body || {};
    
    switch (action) {
      case 'sync':
        return await handleSync(req, res);
      case 'list':
        return await handleList(req, res);
      case 'update':
        return await handleUpdate(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};

// Handle product sync from plugin
async function handleSync(req, res) {
  const { apiKey, products } = req.body;
  
  console.log('📦 Sync request:', { apiKey: apiKey ? apiKey.substring(0, 15) + '...' : 'N/A', productsCount: products?.length });
  console.log('📦 First 3 products:', products?.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
  
  if (!apiKey || !products || !Array.isArray(products)) {
    return res.status(400).json({ 
      error: 'Missing required fields: apiKey, products (array)' 
    });
  }
  
  console.log('📦 Validation passed, products count:', products.length);

  // Load Firebase (lazy)
  const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                      process.env.FIREBASE_CLIENT_EMAIL && 
                      process.env.FIREBASE_PRIVATE_KEY;
  
  if (!hasFirebase) {
    console.log('⚠️  Firebase not configured, returning success without saving');
    return res.status(200).json({
      success: true,
      message: 'Products synced (Firebase disabled)',
      synced: products.length
    });
  }

  try {
    // Import Firebase
    const admin = require('firebase-admin');
    
    // Initialize if needed
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    const db = admin.firestore();
    
    // 1. Find store by API Key
    console.log('🔍 Searching for store with API Key:', apiKey.substring(0, 15) + '...');
    const storesSnapshot = await db.collection('stores')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();
    
    if (storesSnapshot.empty) {
      console.log('❌ No store found with this API Key');
      return res.status(401).json({ 
        error: 'Invalid API Key' 
      });
    }
    
    const storeDoc = storesSnapshot.docs[0];
    const storeId = storeDoc.id;
    
    console.log('✅ Found store:', storeId);
    
    // Update store metadata
    const batch = db.batch();
    const storeRef = db.collection('stores').doc(storeId);
    
    batch.set(storeRef, {
      lastProductSync: new Date(),
      totalProducts: products.length,
      updatedAt: new Date(),
    }, { merge: true });
    
    // Save each product in subcollection
    console.log('📦 Starting to save products to Firebase subcollection...');
    let savedCount = 0;
    for (const product of products) {
      // Save in subcollection: stores/{storeId}/products/{productId}
      const productRef = db.collection('stores').doc(storeId).collection('products').doc(product.id);
      batch.set(productRef, {
        productId: product.id,
        name: product.name,
        description: product.description || '',
        category: product.category,
        price: product.price,
        currency: product.currency || 'USD', // Save currency from WooCommerce
        stock: product.stock || 0,
        image: product.image || '',
        url: product.url || '',
        enabled: product.enabled !== false, // Default true
        syncedAt: new Date(),
      }, { merge: true });
      savedCount++;
    }
    
    console.log('📦 Added', savedCount, 'products to batch, committing...');
    await batch.commit();
    console.log('✅ Batch committed successfully!');
    
    console.log(`✅ Synced ${savedCount} products for store ${storeId}`);
    
    return res.status(200).json({
      success: true,
      message: 'Products synced successfully',
      synced: savedCount,
      storeId: storeId,
    });
  } catch (error) {
    console.error('Firebase sync error:', error);
    return res.status(500).json({
      error: 'Failed to sync products',
      message: error.message,
    });
  }
}

// Handle list products for dashboard
async function handleList(req, res) {
  const { storeId } = req.body;
  
  if (!storeId) {
    return res.status(400).json({ error: 'Missing storeId' });
  }

  // Load Firebase
  const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                      process.env.FIREBASE_CLIENT_EMAIL && 
                      process.env.FIREBASE_PRIVATE_KEY;
  
  if (!hasFirebase) {
    return res.status(200).json({
      success: true,
      products: [],
      message: 'Firebase not configured'
    });
  }

  try {
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    const db = admin.firestore();
    // Read from subcollection: stores/{storeId}/products
    const snapshot = await db.collection('stores').doc(storeId).collection('products').get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({
      success: true,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('List products error:', error);
    return res.status(500).json({
      error: 'Failed to list products',
      message: error.message,
    });
  }
}

// Handle update product settings
async function handleUpdate(req, res) {
  const { storeId, productId, enabled } = req.body;
  
  if (!storeId || !productId) {
    return res.status(400).json({ error: 'Missing storeId or productId' });
  }

  // Load Firebase
  const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                      process.env.FIREBASE_CLIENT_EMAIL && 
                      process.env.FIREBASE_PRIVATE_KEY;
  
  if (!hasFirebase) {
    return res.status(200).json({
      success: true,
      message: 'Firebase not configured'
    });
  }

  try {
    const admin = require('firebase-admin');
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    const db = admin.firestore();
    // Update in subcollection: stores/{storeId}/products/{productId}
    const productRef = db.collection('stores').doc(storeId).collection('products').doc(productId);
    
    await productRef.update({
      enabled: enabled !== false,
      updatedAt: new Date(),
    });
    
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({
      error: 'Failed to update product',
      message: error.message,
    });
  }
}
