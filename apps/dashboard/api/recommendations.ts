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
    const { storeId, productId, userId } = req.body;

    if (!storeId || !productId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Get product details from Firestore
    const productDoc = await db
      .collection('products')
      .where('storeId', '==', storeId)
      .where('productId', '==', productId)
      .limit(1)
      .get();

    if (productDoc.empty) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = productDoc.docs[0].data();

    // 2. Get all available products for this store
    const productsSnapshot = await db
      .collection('products')
      .where('storeId', '==', storeId)
      .limit(50)
      .get();

    const availableProducts = productsSnapshot.docs.map(doc => ({
      id: doc.data().productId,
      name: doc.data().name,
      category: doc.data().category || 'general',
      price: doc.data().price || 0,
    }));

    // 3. Get AI recommendations from Groq
    const recommendedIds = await getAIRecommendations({
      productId: product.productId,
      productName: product.name,
      productCategory: product.category || 'general',
      productPrice: product.price || 0,
      availableProducts,
    });

    // 4. Get full product details for recommendations
    const recommendations = availableProducts.filter(p =>
      recommendedIds.includes(p.id)
    );

    // 5. Save recommendation to Firestore for tracking
    await db.collection('recommendations').add({
      storeId,
      productId,
      userId: userId || 'anonymous',
      recommendations: recommendedIds,
      createdAt: new Date(),
      converted: false,
    });

    // 6. Return recommendations
    return res.status(200).json({
      success: true,
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
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
