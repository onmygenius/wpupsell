// Stats API
// Returns aggregated stats from conversions

module.exports = async (req, res) => {
  console.log('=== STATS API CALLED ===');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { storeId } = req.body || req.query;
    
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
        stats: {
          totalRevenue: 0,
          orders: 0,
          conversions: 0,
        }
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
      
      // Get conversions from subcollection
      const conversionsSnapshot = await db
        .collection('stores')
        .doc(storeId)
        .collection('conversions')
        .where('converted', '==', true)
        .get();
      
      let totalRevenue = 0;
      let orders = 0;
      const productConversions = {};
      const allConversions = [];
      
      conversionsSnapshot.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.price || 0;
        orders++;
        
        // Track conversions per product
        const productId = data.productId;
        if (!productConversions[productId]) {
          productConversions[productId] = {
            productId,
            name: data.productName || 'Unknown',
            conversions: 0,
            revenue: 0
          };
        }
        productConversions[productId].conversions++;
        productConversions[productId].revenue += data.price || 0;
        
        // Collect all conversions for sorting
        allConversions.push({
          productName: data.productName || 'Unknown',
          price: data.price || 0,
          createdAt: data.createdAt,
        });
      });
      
      // Sort by date and get last 5
      const recentConversions = allConversions
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        })
        .slice(0, 5);
      
      // Sort products by conversions
      const topProducts = Object.values(productConversions)
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 4);
      
      console.log(`📊 Stats for ${storeId}: ${orders} orders, $${totalRevenue} revenue`);
      
      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          orders,
          conversions: orders,
          currency: 'LEI', // TODO: Get from store settings
          topProducts,
          recentConversions,
        }
      });
    } catch (error) {
      console.error('Firebase error:', error);
      return res.status(500).json({
        error: 'Failed to get stats',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
