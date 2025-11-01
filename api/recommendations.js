const Groq = require('groq-sdk');

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
You are an AI recommendation engine for an e-commerce jewelry store.

Current Product:
- ID: ${product.productId}
- Name: ${product.name}
- Category: ${product.category}
- Price: $${product.price}

Available Products:
${availableProducts.map(p => `- ${p.id}: ${p.name} (${p.category}) - $${p.price}`).join('\n')}

Task: Recommend 3 products that would be good upsells or cross-sells for the current product.
Consider:
1. Complementary products (accessories, add-ons)
2. Higher-value alternatives (upsells)
3. Related products in same/similar category

For each recommendation, provide:
- id: product ID
- reason: A SHORT, compelling reason in Romanian (max 8 words) why this product complements the current one

Return ONLY a JSON array of objects, nothing else.
Example: [{"id": "123", "reason": "Perfect pentru a completa colecția"}, {"id": "456", "reason": "Stil similar, mai elegant"}]
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
      max_tokens: 100,
    });

    const response = completion.choices[0]?.message?.content || '[]';
    console.log('🤖 Groq AI raw response:', response);
    
    // Try to extract JSON from response (AI might add extra text)
    let jsonStr = response.trim();
    
    // Find JSON array in response
    const jsonMatch = jsonStr.match(/\[.*\]/s);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }
    
    console.log('🤖 Extracted JSON string:', jsonStr);
    
    try {
      const recommendations = JSON.parse(jsonStr);
      console.log('🤖 Groq AI recommendations:', recommendations);
      
      // Validate structure
      if (!Array.isArray(recommendations)) {
        console.error('❌ AI response is not an array');
        return null;
      }
      
      // Validate each recommendation has id and reason
      const validRecs = recommendations.filter(rec => rec.id && rec.reason);
      console.log(`🤖 Valid recommendations: ${validRecs.length}/${recommendations.length}`);
      
      return validRecs;
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
  
  // Filter out current product
  const otherProducts = availableProducts.filter(p => p.id !== product.productId);
  
  if (otherProducts.length === 0) {
    return [];
  }
  
  // Strategy 1: Same category
  const sameCategoryProducts = otherProducts.filter(
    p => p.category === product.category
  );
  
  // Strategy 2: Similar price range (±50%)
  const similarPriceProducts = otherProducts.filter(
    p => Math.abs(p.price - product.price) < product.price * 0.5
  );
  
  // Combine and deduplicate
  const recommended = [...new Set([...sameCategoryProducts, ...similarPriceProducts])];
  
  // Return top 3
  return recommended.slice(0, 3).map(p => p.id);
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

    // Try AI recommendations first (hybrid strategy)
    let aiRecommendations = null;
    let algorithm = 'simple-rules';
    
    if (process.env.GROQ_API_KEY) {
      console.log('🤖 Groq API Key found, trying AI recommendations...');
      aiRecommendations = await getAIRecommendations(product, availableProducts);
      if (aiRecommendations && aiRecommendations.length > 0) {
        algorithm = 'groq-ai';
        console.log('✅ Using AI recommendations');
      }
    } else {
      console.log('⚠️  No Groq API Key found, skipping AI');
    }
    
    // Fallback to simple rules if AI failed or no API key
    let recommendations = [];
    if (!aiRecommendations || aiRecommendations.length === 0) {
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
      console.log('🔍 AI recommendations:', JSON.stringify(aiRecommendations, null, 2));
      console.log('🔍 Available product IDs:', availableProducts.map(p => p.id));
      
      recommendations = aiRecommendations
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
    }
    
    console.log('Final recommendations:', recommendations.length);

    // Generate temp recommendation ID (no Firebase)
    const recommendationId = 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    console.log('Generated temp recommendation ID:', recommendationId);

    // Return recommendations
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
