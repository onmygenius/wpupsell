// Conversions Tracking API
// Handles conversion tracking from plugin to Firebase

module.exports = async (req, res) => {
  console.log('=== CONVERSIONS API CALLED ===');
  console.log('Method:', req.method);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId, productId, productName, price, converted } = req.body;
    
    console.log('💰 Conversion request:', { storeId, productId, productName, price, converted });
    
    if (!storeId || !productId || !price) {
      return res.status(400).json({ 
        error: 'Missing required fields: storeId, productId, price' 
      });
    }

    // Load Firebase
    const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                        process.env.FIREBASE_CLIENT_EMAIL && 
                        process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasFirebase) {
      console.log('⚠️  Firebase not configured, returning success without saving');
      return res.status(200).json({
        success: true,
        message: 'Conversion tracked (Firebase disabled)',
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
      
      // Save conversion in subcollection: stores/{storeId}/conversions/{conversionId}
      const conversionRef = db.collection('stores').doc(storeId).collection('conversions').doc();
      
      await conversionRef.set({
        productId,
        productName: productName || 'Unknown',
        price: parseFloat(price),
        converted: converted !== false, // Default true
        createdAt: new Date(),
      });
      
      console.log(`✅ Conversion tracked: ${productName} - $${price}`);
      
      return res.status(200).json({
        success: true,
        message: 'Conversion tracked successfully',
        conversionId: conversionRef.id,
      });
    } catch (error) {
      console.error('Firebase error:', error);
      return res.status(500).json({
        error: 'Failed to track conversion',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Conversions API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
