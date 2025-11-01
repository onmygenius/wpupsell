import type { VercelRequest, VercelResponse } from '@vercel/node';

// Optional imports - graceful degradation
let db: any = null;
let getAIRecommendations: any = null;

try {
  const firebaseAdmin = require('../lib/firebase-admin');
  db = firebaseAdmin.db;
} catch (error) {
  console.warn('Firebase not configured, tracking disabled');
}

try {
  const groqClient = require('../lib/groq-client');
  getAIRecommendations = groqClient.getAIRecommendations;
} catch (error) {
  console.warn('Groq AI not configured, using fallback recommendations');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('=== RECOMMENDATIONS API CALLED ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS request - returning 200');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const { 
      storeId, 
      productId, 
      productName,
      productCategory,
      productPrice,
      availableProducts,
      userId 
    } = req.body;

    console.log('Parsed data:');
    console.log('- storeId:', storeId);
    console.log('- productId:', productId);
    console.log('- productName:', productName);
    console.log('- productCategory:', productCategory);
    console.log('- productPrice:', productPrice);
    console.log('- availableProducts count:', availableProducts?.length);
    console.log('- userId:', userId);

    if (!storeId || !productId) {
      console.error('Validation failed: Missing storeId or productId');
      return res.status(400).json({ error: 'Missing required fields: storeId, productId' });
    }

    if (!availableProducts || !Array.isArray(availableProducts)) {
      console.error('Validation failed: availableProducts is not an array');
      return res.status(400).json({ error: 'Missing required field: availableProducts (array)' });
    }

    console.log('Validation passed ✓');

    // Use product data from request (sent by plugin)
    const product = {
      productId,
      name: productName || 'Unknown Product',
      category: productCategory || 'general',
      price: productPrice || 0,
    };
    
    console.log('Product object created:', JSON.stringify(product, null, 2));

    // 2. Get AI recommendations from Groq (or fallback)
    let recommendedIds: string[] = [];
    
    console.log('Checking AI availability...');
    console.log('getAIRecommendations available:', !!getAIRecommendations);
    
    if (getAIRecommendations) {
      try {
        console.log('Calling Groq AI...');
        recommendedIds = await getAIRecommendations({
          productId: product.productId,
          productName: product.name,
          productCategory: product.category,
          productPrice: product.price,
          availableProducts,
        });
        console.log('AI returned IDs:', recommendedIds);
      } catch (error) {
        console.error('AI recommendations failed, using fallback:', error);
      }
    } else {
      console.log('AI not available, will use fallback');
    }
    
    // Fallback: simple rule-based recommendations
    if (recommendedIds.length === 0 && availableProducts.length > 0) {
      console.log('Using fallback recommendations...');
      
      // Recommend products from same category or similar price range
      const sameCategoryProducts = availableProducts.filter(
        p => p.category === product.category && p.id !== product.productId
      );
      console.log('Same category products:', sameCategoryProducts.length);
      
      const similarPriceProducts = availableProducts.filter(
        p => Math.abs(p.price - product.price) < product.price * 0.5 && p.id !== product.productId
      );
      console.log('Similar price products:', similarPriceProducts.length);
      
      // Combine and take top 3
      const fallbackProducts = [...new Set([...sameCategoryProducts, ...similarPriceProducts])];
      recommendedIds = fallbackProducts.slice(0, 3).map(p => p.id);
      
      console.log('Fallback recommendations:', recommendedIds);
    }

    // 3. Get full product details for recommendations
    console.log('Filtering products by recommended IDs...');
    const recommendations = availableProducts.filter(p =>
      recommendedIds.includes(p.id)
    );
    console.log('Filtered recommendations:', recommendations.length);

    // 4. Save recommendation to Firestore for tracking (if available)
    let recommendationId = 'temp_' + Date.now();
    
    console.log('Checking Firestore availability...');
    console.log('db available:', !!db);
    
    if (db) {
      try {
        console.log('Saving to Firestore...');
        const recommendationDoc = await db.collection('recommendations').add({
          storeId,
          productId,
          userId: userId || 'anonymous',
          recommendations: recommendedIds,
          productName: product.name,
          createdAt: new Date(),
          converted: false,
        });
        recommendationId = recommendationDoc.id;
        console.log('Saved to Firestore with ID:', recommendationId);
      } catch (error) {
        console.error('Failed to save to Firestore:', error);
        // Continue anyway - tracking is optional
      }
    } else {
      console.log('Firestore not available, using temp ID:', recommendationId);
    }

    // 5. Return recommendations
    const response = {
      success: true,
      recommendation_id: recommendationId,
      product: {
        id: product.productId,
        name: product.name,
      },
      recommendations: recommendations.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        reason: 'AI recommended based on product similarity',
      })),
      algorithm: getAIRecommendations ? 'groq-ai' : 'fallback',
      timestamp: new Date().toISOString(),
    };
    
    console.log('=== SENDING RESPONSE ===');
    console.log('Status: 200');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('=== ERROR OCCURRED ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
