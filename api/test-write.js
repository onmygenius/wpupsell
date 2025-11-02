/**
 * TEST ENDPOINT: Write WordPress credentials to Firebase
 * URL: /api/test-write?apiKey=sk_live_xxx
 */

import { getDb } from '../lib/firebase-admin.ts';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey } = req.query;
  
  if (!apiKey) {
    return res.status(400).json({ error: 'apiKey required in query' });
  }

  try {
    const db = getDb();
    
    console.log('🔍 Searching for store with API Key:', apiKey);
    
    const storesSnapshot = await db.collection('stores')
      .where('apiKey', '==', apiKey)
      .limit(1)
      .get();
    
    if (storesSnapshot.empty) {
      return res.status(404).json({ 
        error: 'Store not found',
        apiKey: apiKey.substring(0, 15) + '...'
      });
    }
    
    const storeDoc = storesSnapshot.docs[0];
    console.log('✅ Store found:', storeDoc.id);
    
    // Write test credentials
    await storeDoc.ref.update({
      wordpressUsername: 'admin',
      wordpressPassword: 'test_password_123',
      wordpressConnected: true,
      wordpressLastTest: Date.now(),
      updatedAt: new Date()
    });
    
    console.log('✅ Credentials written to Firebase!');
    
    return res.json({
      success: true,
      storeId: storeDoc.id,
      message: 'WordPress credentials written successfully!',
      data: {
        wordpressUsername: 'admin',
        wordpressPassword: 'test_password_123',
        wordpressConnected: true
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: error.message
    });
  }
}
