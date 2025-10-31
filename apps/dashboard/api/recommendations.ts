import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/firebase-admin';
import { getAIRecommendations } from '../lib/groq-client';

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

    if (!storeId || !productId || !availableProducts) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Products are sent directly from plugin - no Firestore lookup needed!
    // This makes it work immediately for any client without setup

    // Get AI recommendations from Groq
    const recommendedIds = await getAIRecommendations({
      productId,
      productName,
      productCategory: productCategory || 'general',
      productPrice: productPrice || 0,
      availableProducts,
    });

    // Get full product details for recommendations
    const recommendations = availableProducts.filter((p: any) =>
      recommendedIds.includes(p.id)
    );

    // Save recommendation to Firestore for tracking
    await db.collection('recommendations').add({
      storeId,
      productId,
      userId: userId || 'anonymous',
      recommendations: recommendedIds,
      createdAt: new Date(),
      converted: false,
    });

    // Return recommendations
    return res.status(200).json({
      success: true,
      product: {
        id: productId,
        name: productName,
      },
      recommendations: recommendations.map((r: any) => ({
        id: r.id,
        name: r.name,
        price: r.price,
        reason: 'AI recommended based on product similarity',
      })),
      algorithm: 'groq-ai',
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
