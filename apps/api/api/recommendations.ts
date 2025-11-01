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
    const { 
      storeId, 
      productId, 
      productName,
      productCategory,
      productPrice,
      availableProducts,
      userId 
    } = req.body;

    if (!storeId || !productId) {
      return res.status(400).json({ error: 'Missing required fields: storeId, productId' });
    }

    if (!availableProducts || !Array.isArray(availableProducts)) {
      return res.status(400).json({ error: 'Missing required field: availableProducts (array)' });
    }

    // Use product data from request (sent by plugin)
    const product = {
      productId,
      name: productName || 'Unknown Product',
      category: productCategory || 'general',
      price: productPrice || 0,
    };

    // 2. Get AI recommendations from Groq (or fallback)
    let recommendedIds: string[] = [];
    
    if (getAIRecommendations) {
      try {
        recommendedIds = await getAIRecommendations({
          productId: product.productId,
          productName: product.name,
          productCategory: product.category,
          productPrice: product.price,
          availableProducts,
        });
      } catch (error) {
        console.error('AI recommendations failed, using fallback:', error);
      }
    }
    
    // Fallback: simple rule-based recommendations
    if (recommendedIds.length === 0 && availableProducts.length > 0) {
      // Recommend products from same category or similar price range
      const sameCategoryProducts = availableProducts.filter(
        p => p.category === product.category && p.id !== product.productId
      );
      
      const similarPriceProducts = availableProducts.filter(
        p => Math.abs(p.price - product.price) < product.price * 0.5 && p.id !== product.productId
      );
      
      // Combine and take top 3
      const fallbackProducts = [...new Set([...sameCategoryProducts, ...similarPriceProducts])];
      recommendedIds = fallbackProducts.slice(0, 3).map(p => p.id);
      
      console.log('Using fallback recommendations:', recommendedIds.length);
    }

    // 3. Get full product details for recommendations
    const recommendations = availableProducts.filter(p =>
      recommendedIds.includes(p.id)
    );

    // 4. Save recommendation to Firestore for tracking (if available)
    let recommendationId = 'temp_' + Date.now();
    
    if (db) {
      try {
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
      } catch (error) {
        console.error('Failed to save to Firestore:', error);
        // Continue anyway - tracking is optional
      }
    }

    // 5. Return recommendations
    return res.status(200).json({
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
      algorithm: 'groq-ai',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
