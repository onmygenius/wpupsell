import type { VercelRequest, VercelResponse } from '@vercel/node';

// Optional Firebase - graceful degradation
let db: any = null;

try {
  const firebaseAdmin = require('../lib/firebase-admin');
  db = firebaseAdmin.db;
} catch (error) {
  console.warn('Firebase not configured, conversion tracking disabled');
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
      recommendationId,
      productId,
      converted,
      revenue,
      userId,
    } = req.body;

    if (!storeId || !recommendationId || !productId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If Firebase is not configured, just log and return success
    if (!db) {
      console.log('Conversion tracked (no Firebase):', {
        storeId,
        productId,
        converted,
        revenue,
      });
      return res.status(200).json({
        success: true,
        message: 'Conversion logged (tracking disabled)',
      });
    }

    // 1. Update recommendation document
    try {
      const recDoc = await db
        .collection('recommendations')
        .doc(recommendationId)
        .get();

      if (recDoc.exists) {
        await recDoc.ref.update({
          converted: converted || false,
          convertedAt: converted ? new Date() : null,
        });
      }
    } catch (error) {
      console.error('Failed to update recommendation:', error);
    }

    // 2. Save conversion event
    try {
      await db.collection('conversions').add({
        storeId,
        recommendationId,
        productId,
        converted: converted || false,
        revenue: revenue || 0,
        userId: userId || 'anonymous',
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save conversion:', error);
    }

    // 3. Update daily analytics
    try {
      const today = new Date().toISOString().split('T')[0];
      const analyticsRef = db
        .collection('analytics_daily')
        .doc(`${storeId}_${today}`);

      const analyticsDoc = await analyticsRef.get();

      if (analyticsDoc.exists) {
        const data = analyticsDoc.data();
        await analyticsRef.update({
          impressions: (data?.impressions || 0) + 1,
          conversions: converted
            ? (data?.conversions || 0) + 1
            : data?.conversions || 0,
          upsellRevenue: converted
            ? (data?.upsellRevenue || 0) + (revenue || 0)
            : data?.upsellRevenue || 0,
          conversionRate: converted
            ? ((data?.conversions || 0) + 1) / ((data?.impressions || 0) + 1)
            : (data?.conversions || 0) / ((data?.impressions || 0) + 1),
        });
      } else {
        await analyticsRef.set({
          storeId,
          date: today,
          impressions: 1,
          conversions: converted ? 1 : 0,
          upsellRevenue: converted ? revenue || 0 : 0,
          conversionRate: converted ? 1 : 0,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Failed to update analytics:', error);
    }

    return res.status(200).json({
      success: true,
      message: 'Conversion tracked successfully',
    });
  } catch (error: any) {
    console.error('Conversion tracking error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
