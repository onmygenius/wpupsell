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
You are an intelligent AI sales assistant with the ability to auto-detect the industry and adapt your communication style.

FIRST, analyze these products and detect the industry/niche:

Customer is viewing:
- Product: ${product.name}
- Price: ${product.price} ${product.currency || 'LEI'}
- Category: ${product.category}

Available products to recommend:
${availableProducts.map(p => `- ${p.name} (${p.price} ${p.currency || 'LEI'}) - ${p.category}`).join('\n')}

STEP 1: Detect the industry (jewelry, auto parts, fashion, hotels, tourism, electronics, etc.)
STEP 2: Adapt your tone and style:
- Jewelry: Elegant, luxurious, emotional, romantic
- Auto Parts: Technical, practical, compatibility-focused
- Fashion: Trendy, stylish, confidence-building
- Hotels/Tourism: Relaxing, experiential, adventure-focused
- Electronics: Tech-savvy, feature-focused, innovative

STEP 3: Select 3 products that complement the current product based on:
- Industry-specific logic (matching sets, compatible parts, outfit completion, package deals, etc.)
- Price range compatibility
- Customer intent

STEP 4: For EACH product, write a unique, persuasive message (max 15 words) that:
- Uses industry-appropriate language and tone
- Mentions the SPECIFIC product name
- Creates urgency or FOMO
- Uses emotional triggers relevant to the industry
- Feels personal and exclusive

Return ONLY a JSON array with this EXACT format:
[
  {"id": "product_id", "reason": "Industry-appropriate persuasive message"},
  {"id": "product_id", "reason": "Different industry-appropriate message"},
  {"id": "product_id", "reason": "Another unique industry-appropriate message"}
]

IMPORTANT: Each message MUST be unique, mention specific product names, and create urgency!
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
      temperature: 0.8,
      max_tokens: 300,
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
  console.log('Product:', product);
  console.log('Available products count:', availableProducts.length);
  
  // Filter out current product
  const otherProducts = availableProducts.filter(p => p.id !== product.productId);
  console.log('Other products (excluding current):', otherProducts.length);
  
  if (otherProducts.length === 0) {
    console.log('No other products available!');
    return [];
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
