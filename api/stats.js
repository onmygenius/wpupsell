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
      
      conversionsSnapshot.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.price || 0;
        orders++;
      });
      
      console.log(`📊 Stats for ${storeId}: ${orders} orders, $${totalRevenue} revenue`);
      
      return res.status(200).json({
        success: true,
        stats: {
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          orders,
          conversions: orders,
          currency: 'LEI', // TODO: Get from store settings
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
