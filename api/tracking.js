// Tracking API - Funnel Events
// Tracks impressions, clicks, add-to-cart, conversions

module.exports = async (req, res) => {
  console.log('=== TRACKING API CALLED ===');
  
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
    const { storeId, eventType, productId, productName } = req.body;
    
    console.log('📊 Tracking event:', { storeId, eventType, productId, productName });
    
    if (!storeId || !eventType) {
      return res.status(400).json({ 
        error: 'Missing required fields: storeId, eventType' 
      });
    }

    // Validate event type
    const validEvents = ['impression', 'click', 'add_to_cart', 'purchase'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).json({ 
        error: 'Invalid eventType. Must be: impression, click, add_to_cart, or purchase' 
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
        message: 'Event tracked (Firebase disabled)',
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
      
      // Save event in subcollection: stores/{storeId}/events/{eventId}
      const eventRef = db.collection('stores').doc(storeId).collection('events').doc();
      
      await eventRef.set({
        eventType,
        productId: productId || null,
        productName: productName || null,
        createdAt: new Date(),
      });
      
      console.log(`✅ Event tracked: ${eventType} - ${productName || 'N/A'}`);
      
      return res.status(200).json({
        success: true,
        message: 'Event tracked successfully',
        eventId: eventRef.id,
      });
    } catch (error) {
      console.error('Firebase error:', error);
      return res.status(500).json({
        error: 'Failed to track event',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Tracking API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
