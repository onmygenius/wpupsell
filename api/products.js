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
  const { storeId, products } = req.body;
  
  console.log('📦 Sync request:', { storeId, productsCount: products?.length });
  console.log('📦 First 3 products:', products?.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
  
  if (!storeId || !products || !Array.isArray(products)) {
    return res.status(400).json({ 
      error: 'Missing required fields: storeId, products (array)' 
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
    const batch = db.batch();
    
    // Update store's last sync time
    const storeRef = db.collection('stores').doc(storeId);
    batch.update(storeRef, {
      lastProductSync: new Date(),
      totalProducts: products.length,
    });
    
    // Save each product
    console.log('📦 Starting to save products to Firebase...');
    let savedCount = 0;
    for (const product of products) {
      const productRef = db.collection('products').doc(`${storeId}_${product.id}`);
      batch.set(productRef, {
        storeId,
        productId: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
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
      storeId,
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
    const snapshot = await db.collection('products')
      .where('storeId', '==', storeId)
      .get();
    
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
    const productRef = db.collection('products').doc(`${storeId}_${productId}`);
    
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
