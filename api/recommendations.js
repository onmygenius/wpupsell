const Groq = require('groq-sdk');
const { getDb } = require('../lib/firebase-admin');

let groqInstance = null;

function getGroq() {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqInstance;
}

// AI-powered recommendations using Groq
async function getAIRecommendations(product, availableProducts) {
  try {
    console.log('🤖 Using Groq AI for recommendations...');
    
    const prompt = `
You are an intelligent AI sales assistant with the ability to auto-detect the industry, language, and adapt your communication style.

ANALYZE these products and detect the industry/niche AND language:

Customer is viewing:
- Product: ${product.name}
- Price: ${product.price} ${product.currency || 'LEI'}
- Category: ${product.category}

Available products to recommend (with exact IDs):
${availableProducts.map(p => `- ID: "${p.id}" | ${p.name} | ${p.price} ${p.currency || 'LEI'} | Category: ${p.category}`).join('\n')}

YOUR TASK:

1. DETECT the language from product names (Romanian, English, Spanish, French, German, Italian, etc.)

2. DETECT the industry (jewelry, auto parts, fashion, tourism, electronics, construction, toys, cosmetics, sports, books, furniture, pharmacy, etc.)

3. GENERATE a unique, creative pop-up experience IN THE DETECTED LANGUAGE:
   - popupTitle: Catchy title (8-12 words) that creates excitement and matches the industry vibe
   - popupSubtitle: Persuasive subtitle (6-10 words) that explains the value

4. SELECT 3 products that complement the current product
   CRITICAL: You MUST use the EXACT product IDs from the "Available products" list above!
   The IDs are shown as: ID: "123" - Copy the ID value EXACTLY (including quotes if shown)!
   DO NOT invent IDs! DO NOT modify IDs! Use ONLY the IDs listed above!

5. For EACH product, write a UNIQUE persuasive message (10-20 words) that:
   - Uses industry-specific language and emotional triggers appropriate for the niche
   - Mentions the SPECIFIC product name or benefit
   - Creates urgency, FOMO, or desire
   - Feels personal, exclusive, and compelling
   - Is COMPLETELY DIFFERENT from other messages (no repetition!)
   - Focuses on transformation, benefits, or emotional connection

INDUSTRY-SPECIFIC TONE GUIDE (generate in detected language):

🔹 Jewelry: Elegant, luxurious, emotional
🔹 Auto Parts: Technical, reliable, compatible
🔹 Fashion: Trendy, stylish, confident
🔹 Tourism: Adventurous, exciting, memorable
🔹 Electronics: Innovative, smart, powerful
🔹 Construction: Professional, durable, quality
🔹 Toys: Fun, playful, joyful
🔹 Cosmetics: Beautiful, transformative, radiant
🔹 Pharmacy: Health-focused, caring, trusted
🔹 Sports: Energetic, performance, achievement
🔹 Books: Inspiring, educational, transformative
🔹 Furniture: Comfortable, stylish, quality

Return ONLY a JSON object with this EXACT format:
{
  "industry": "detected_industry",
  "popupTitle": "Creative catchy title with emoji",
  "popupSubtitle": "Persuasive subtitle",
  "recommendations": [
    {"id": "product_id", "reason": "Unique persuasive message"},
    {"id": "product_id", "reason": "Different unique message"},
    {"id": "product_id", "reason": "Another unique message"}
  ]
}

CRITICAL RULES:
1. ALL text (popupTitle, popupSubtitle, reasons) MUST be in the DETECTED LANGUAGE!
2. Each message MUST be unique and creative! No repetition!
3. If products are in Romanian (like "Lănțișor", "Inel", "Brățară") → Generate ALL text in ROMANIAN!
4. If products are in English → Generate ALL text in ENGLISH!
`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful e-commerce recommendation assistant. Always respond with valid JSON arrays of product IDs.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || '[]';
    console.log('🤖 Groq AI raw response:', response);
    
    // Try to extract JSON from response (AI might add extra text)
    let jsonStr = response.trim();
    
    // Find JSON object or array in response
    const jsonMatch = jsonStr.match(/\{.*\}|\[.*\]/s);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    console.log('🤖 Extracted JSON string:', jsonStr);
    
    try {
      const aiResponse = JSON.parse(jsonStr);
      console.log('🤖 Groq AI response:', aiResponse);
      
      // Check if it's the new format (object with industry, popupTitle, etc.)
      if (aiResponse.industry && aiResponse.recommendations) {
        console.log('🤖 New format detected!');
        console.log('🤖 Industry:', aiResponse.industry);
        console.log('🤖 Popup Title:', aiResponse.popupTitle);
        console.log('🤖 Popup Subtitle:', aiResponse.popupSubtitle);
        
        // Validate recommendations
        const validRecs = aiResponse.recommendations.filter(rec => rec.id && rec.reason);
        console.log(`🤖 Valid recommendations: ${validRecs.length}/${aiResponse.recommendations.length}`);
        
        return {
          industry: aiResponse.industry,
          popupTitle: aiResponse.popupTitle,
          popupSubtitle: aiResponse.popupSubtitle,
          recommendations: validRecs
        };
      }
      
      // Fallback: old format (array)
      if (Array.isArray(aiResponse)) {
        console.log('🤖 Old format detected (array)');
        const validRecs = aiResponse.filter(rec => rec.id && rec.reason);
        console.log(`🤖 Valid recommendations: ${validRecs.length}/${aiResponse.length}`);
        return { recommendations: validRecs };
      }
      
      console.error('❌ AI response format not recognized');
      return null;
    } catch (parseError) {
      console.error('❌ JSON parse failed:', parseError.message);
      console.error('❌ Attempted to parse:', jsonStr);
      return null;
    }
  } catch (error) {
    console.error('❌ Groq AI error:', error.message);
    return null; // Return null to trigger fallback
  }
}

// Simple fallback recommendation logic - no external dependencies
function getSimpleRecommendations(product, availableProducts) {
  console.log('Using simple fallback recommendations');
  console.log('Product:', product);
  console.log('Available products count:', availableProducts.length);
  
  // Filter out current product
  const otherProducts = availableProducts.filter(p => p.id !== product.id && p.id !== product.productId);
  console.log('Other products (excluding current):', otherProducts.length);
  
  if (otherProducts.length === 0) {
    console.log('⚠️ No other products available! Returning all products as fallback...');
    // Return all products if no filtering worked
    return availableProducts.slice(0, 3).map(p => p.id);
  }
  
  // Strategy 1: Same category
  const sameCategoryProducts = otherProducts.filter(
    p => p.category === product.category
  );
  console.log('Same category products:', sameCategoryProducts.length);
  
  // Strategy 2: Similar price range (±50%)
  const similarPriceProducts = otherProducts.filter(
    p => Math.abs(p.price - product.price) < product.price * 0.5
  );
  console.log('Similar price products:', similarPriceProducts.length);
  
  // Combine and deduplicate
  let recommended = [...new Set([...sameCategoryProducts, ...similarPriceProducts])];
  console.log('Combined recommendations:', recommended.length);
  
  // FALLBACK: If no matches found, return ANY 3 random products!
  if (recommended.length === 0) {
    console.log('⚠️ No matches found! Returning random products...');
    recommended = otherProducts;
  }
  
  // Shuffle and return top 3
  const shuffled = recommended.sort(() => Math.random() - 0.5);
  const final = shuffled.slice(0, 3);
  console.log('Final recommendations:', final.length);
  
  return final.map(p => p.id);
}

module.exports = async (req, res) => {
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
      apiKey, 
      productId, 
      productName,
      productCategory,
      productPrice,
      availableProducts,
      userId 
    } = req.body;

    console.log('Parsed data:');
    console.log('- apiKey:', apiKey ? apiKey.substring(0, 15) + '...' : 'N/A');
    console.log('- productId:', productId);
    console.log('- productName:', productName);
    console.log('- productCategory:', productCategory);
    console.log('- productPrice:', productPrice);
    console.log('- availableProducts count:', availableProducts?.length);
    console.log('- userId:', userId);

    if (!apiKey || !productId) {
      console.error('Validation failed: Missing apiKey or productId');
      return res.status(400).json({ error: 'Missing required fields: apiKey, productId' });
    }

    if (!availableProducts || !Array.isArray(availableProducts)) {
      console.error('Validation failed: availableProducts is not an array');
      return res.status(400).json({ error: 'Missing required field: availableProducts (array)' });
    }

    console.log('Validation passed ✓');

    // Get store by API Key to read settings
    const db = getDb();
    let storeSettings = {
      popupEnabled: true,
      maxRecommendations: 3,
      initialDelay: 2,
      cooldownTime: 10,
      sessionLimit: 999,
      exitIntentEnabled: true,
      scrollTriggerEnabled: true,
      scrollTriggerPercent: 0,
      postCartEnabled: true,
      timeTriggerEnabled: true,
      timeTriggerDelay: 2
    }; // Defaults
    let storeId = null;
    
    try {
      const storesSnapshot = await db.collection('stores')
        .where('apiKey', '==', apiKey)
        .limit(1)
        .get();
      
      if (!storesSnapshot.empty) {
        const storeDoc = storesSnapshot.docs[0];
        storeId = storeDoc.id;
        const storeData = storeDoc.data();
        
        // Get popup limit from plan limits
        const popupsLimit = storeData.limits?.popupsPerMonth || 30;
        
        if (storeData.settings) {
          storeSettings.popupEnabled = storeData.settings.popupEnabled !== false;
          storeSettings.maxRecommendations = storeData.settings.maxRecommendations || 3;
          storeSettings.initialDelay = storeData.settings.initialDelay || 2;
          storeSettings.cooldownTime = storeData.settings.cooldownTime || 10;
          storeSettings.sessionLimit = storeData.settings.sessionLimit || popupsLimit;
          storeSettings.exitIntentEnabled = storeData.settings.exitIntentEnabled !== false;
          storeSettings.scrollTriggerEnabled = storeData.settings.scrollTriggerEnabled !== false;
          storeSettings.scrollTriggerPercent = storeData.settings.scrollTriggerPercent || 0;
          storeSettings.postCartEnabled = storeData.settings.postCartEnabled !== false;
          storeSettings.timeTriggerEnabled = storeData.settings.timeTriggerEnabled !== false;
          storeSettings.timeTriggerDelay = storeData.settings.timeTriggerDelay || 2;
        } else {
          // No custom settings, use plan limit
          storeSettings.sessionLimit = popupsLimit;
        }
        
        console.log('Store settings loaded:', storeSettings);
        console.log('Session limit set to:', storeSettings.sessionLimit, '(from plan limit:', popupsLimit + ')');
      }
    } catch (error) {
      console.error('Failed to load store settings:', error);
      // Continue with defaults
    }

    // Use product data from request (sent by plugin)
    const product = {
      id: productId,
      productId,
      name: productName || 'Unknown Product',
      category: productCategory || 'general',
      price: productPrice || 0,
    };
    
    console.log('Product object created:', JSON.stringify(product, null, 2));

    // Try AI recommendations first (hybrid strategy)
    let aiResponse = null;
    let algorithm = 'simple-rules';
    let popupTitle = '🎁 Ofertă Specială Pentru Tine!';
    let popupSubtitle = 'Am găsit ceva perfect pentru tine';
    
    if (process.env.GROQ_API_KEY) {
      console.log('🤖 Groq API Key found, trying AI recommendations...');
      aiResponse = await getAIRecommendations(product, availableProducts);
      if (aiResponse && aiResponse.recommendations && aiResponse.recommendations.length > 0) {
        algorithm = 'groq-ai';
        console.log('✅ Using AI recommendations');
        
        // Use AI-generated popup title and subtitle if available
        if (aiResponse.popupTitle) {
          popupTitle = aiResponse.popupTitle;
          console.log('✅ Using AI popup title:', popupTitle);
        }
        if (aiResponse.popupSubtitle) {
          popupSubtitle = aiResponse.popupSubtitle;
          console.log('✅ Using AI popup subtitle:', popupSubtitle);
        }
      }
    } else {
      console.log('⚠️  No Groq API Key found, skipping AI');
    }
    
    // Fallback to simple rules if AI failed or no API key
    let recommendations = [];
    if (!aiResponse || !aiResponse.recommendations || aiResponse.recommendations.length === 0) {
      console.log('📊 Falling back to simple rule-based recommendations...');
      const recommendedIds = getSimpleRecommendations(product, availableProducts);
      algorithm = 'simple-rules';
      
      // Get full product details for simple recommendations
      recommendations = availableProducts
        .filter(p => recommendedIds.includes(p.id))
        .map(p => ({
          ...p,
          reason: 'Recomandat pe baza similarității produsului'
        }));
    } else {
      // Get full product details for AI recommendations with reasons
      console.log('🔍 Processing AI recommendations...');
      console.log('🔍 AI recommendations:', JSON.stringify(aiResponse.recommendations, null, 2));
      console.log('🔍 Available product IDs:', availableProducts.map(p => p.id));
      
      recommendations = aiResponse.recommendations
        .map(rec => {
          console.log(`🔍 Looking for product ID: "${rec.id}" (type: ${typeof rec.id})`);
          const product = availableProducts.find(p => {
            console.log(`  Comparing with: "${p.id}" (type: ${typeof p.id})`);
            return p.id === rec.id || p.id == rec.id; // Try both strict and loose equality
          });
          if (product) {
            console.log(`  ✅ Found product: ${product.name}`);
          } else {
            console.log(`  ❌ Product not found for ID: ${rec.id}`);
          }
          return product ? { ...product, reason: rec.reason } : null;
        })
        .filter(p => p !== null);
      
      console.log('🔍 Final recommendations count:', recommendations.length);
      
      // If AI recommendations didn't match any products, fallback to simple
      if (recommendations.length === 0) {
        console.log('⚠️ AI recommendations matched 0 products! Falling back to simple...');
        const recommendedIds = getSimpleRecommendations(product, availableProducts);
        algorithm = 'simple-rules-fallback';
        recommendations = availableProducts
          .filter(p => recommendedIds.includes(p.id))
          .map(p => ({
            ...p,
            reason: 'Recomandat pe baza similarității produsului'
          }));
      }
    }
    
    console.log('Final recommendations:', recommendations.length);

    // Generate temp recommendation ID (no Firebase)
    const recommendationId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Generated temp recommendation ID:', recommendationId);

    // Return recommendations with ALL settings
    const response = {
      success: true,
      recommendation_id: recommendationId,
      product: {
        id: product.productId,
        name: product.name,
      },
      popupTitle: popupTitle,
      popupSubtitle: popupSubtitle,
      
      // Settings
      settings: {
        popupEnabled: storeSettings.popupEnabled,
        maxRecommendations: storeSettings.maxRecommendations,
        initialDelay: storeSettings.initialDelay,
        cooldownTime: storeSettings.cooldownTime,
        sessionLimit: storeSettings.sessionLimit,
        exitIntentEnabled: storeSettings.exitIntentEnabled,
        scrollTriggerEnabled: storeSettings.scrollTriggerEnabled,
        scrollTriggerPercent: storeSettings.scrollTriggerPercent,
        postCartEnabled: storeSettings.postCartEnabled,
        timeTriggerEnabled: storeSettings.timeTriggerEnabled,
        timeTriggerDelay: storeSettings.timeTriggerDelay
      },
      
      recommendations: recommendations.slice(0, storeSettings.maxRecommendations).map(r => ({
        id: r.id,
        name: r.name,
        price: r.price,
        currency: r.currency || 'LEI',
        reason: r.reason || 'Recomandat pentru tine',
      })),
      algorithm: algorithm,
      timestamp: new Date().toISOString(),
    };
    
    console.log('=== SENDING RESPONSE ===');
    console.log('Status: 200');
    console.log('Response:', JSON.stringify(response, null, 2));
    
    return res.status(200).json(response);
  } catch (error) {
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
};
