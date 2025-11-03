// Generate Landing Page API - AI-powered landing page generator
// Creates high-converting product pages with AI-generated content

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

const { generateLandingPageHTML } = require('../lib/api-helpers/html-template');
const { incrementUsage, checkPlanLimits } = require('./lib/plan-limits');

// AI generates landing page content
async function generateLandingPageContent(product) {
  try {
    console.log('🤖 Generating landing page content with AI...');
    
    const prompt = `
You are an expert landing page copywriter and conversion optimizer.

Product Information:
- Name: ${product.name}
- Price: ${product.price} ${product.currency || 'LEI'}
- Category: ${product.category}
- Description: ${product.description || 'Premium product'}

Your task: Generate a complete, high-converting landing page structure in JSON format.

CRITICAL INSTRUCTIONS:

1. LANGUAGE DETECTION (MOST IMPORTANT!):
   - Analyze product name, description AND currency to detect language:
     * Product Name: "${product.name}"
     * Product Description: "${product.description || 'N/A'}"
     * Currency: "${product.currency || 'N/A'}"
   - Currency hints:
     * RON or LEI → Romanian language
     * EUR → check product text language
     * USD or $ → English language (default)
     * GBP or £ → English (UK)
   - Detect the language from the text + currency above
   - If currency is RON/LEI → generate ALL content in Romanian
   - If currency is USD/GBP and text is English → generate in English
   - If text is in English → generate ALL content in English
   - If text is in Romanian → generate ALL content in Romanian
   - If text is in Spanish → generate ALL content in Spanish
   - If text is in French → generate ALL content in French
   - Generate ALL content in the EXACT SAME language as the product text + currency
   - NO mixed languages allowed!
   - IGNORE the website domain (.ro, .com, .es, etc.) - ONLY analyze product text + currency!

2. INDUSTRY DETECTION:
   - Identify industry: jewelry, auto, fashion, hotels, tourism, electronics, etc.
   - Adapt tone, vocabulary, and emotional triggers

3. CONTENT QUALITY REQUIREMENTS:
   - ADVANCED copywriting techniques
   - EMOTIONAL storytelling
   - SPECIFIC details (not generic)
   - PERSUASIVE language
   - CREATE desire and urgency
   - ADDRESS objections
   - BUILD trust and credibility

4. WRITING STYLE:
   - Use power words and sensory language
   - Paint vivid pictures
   - Focus on transformation and benefits
   - Create emotional connection
   - Use social proof effectively
   - Make it feel exclusive and premium

5. JSON FORMATTING RULES (CRITICAL):
   - NEVER use double quotes (") inside string values
   - Use single quotes (') or apostrophes instead
   - Example: CORRECT: "Lanțisorul 'Inima Eternă' este frumos"
   - Example: WRONG: "Lanțisorul \"Inima Eternă\" este frumos"
   - This is CRITICAL for valid JSON parsing!

Return ONLY a JSON object with this EXACT structure:
{
  "sectionTitles": {
    "whyChoose": "Section title for benefits (e.g., English: 'Why choose', Romanian: 'De ce să alegi', Spanish: 'Por qué elegir', Italian: 'Perché scegliere', Portuguese: 'Por que escolher')",
    "customerReviews": "Section title for testimonials (e.g., English: 'What our customers say', Romanian: 'Ce spun clienții noștri', Spanish: 'Lo que dicen nuestros clientes')",
    "specifications": "Section title for features (e.g., English: 'Specifications', Romanian: 'Specificații', Spanish: 'Especificaciones')",
    "faq": "Section title for FAQ (e.g., English: 'Frequently Asked Questions', Romanian: 'Întrebări Frecvente', Spanish: 'Preguntas Frecuentes')",
    "readyToOrder": "Final CTA section title (e.g., English: 'Ready to order?', Romanian: 'Gata să comanzi?', Spanish: '¿Listo para ordenar?')"
  },
  "hero": {
    "headline": "Powerful, benefit-driven headline (max 10 words)",
    "subheadline": "Supporting text that creates urgency (max 20 words)",
    "cta": "Action-oriented button text (max 3 words)"
  },
  "description": "COMPREHENSIVE product description (MINIMUM 500 words, 5-7 paragraphs). CRITICAL: Must be AT LEAST 500 words! Requirements: 1) Start with powerful emotional hook that captures attention, 2) Paint vivid, detailed picture of ownership experience using sensory language, 3) Describe how it looks, feels, sounds, and makes the customer FEEL, 4) Tell a compelling story about transformation (before/after owning this product), 5) Include specific use cases and scenarios, 6) Address the customer's deepest desires and pain points, 7) Use metaphors and analogies to make it memorable, 8) Build anticipation and desire through detailed storytelling, 9) Include technical details woven into emotional narrative, 10) End with powerful, inspiring statement. AVOID generic phrases! Be EXTREMELY specific, detailed, and compelling. This is the MOST IMPORTANT section - make every word count!",
  "benefits": [
    {"icon": "✨", "title": "Compelling benefit title (3-5 words)", "description": "DETAILED benefit explanation (35-40 words). Focus on TRANSFORMATION and EMOTIONAL impact. Use specific examples. Explain HOW it improves their life. Make it tangible and desirable."},
    {"icon": "💎", "title": "Compelling benefit title (3-5 words)", "description": "DETAILED benefit explanation (35-40 words). Focus on TRANSFORMATION and EMOTIONAL impact. Use specific examples. Explain HOW it improves their life. Make it tangible and desirable."},
    {"icon": "🎁", "title": "Compelling benefit title (3-5 words)", "description": "DETAILED benefit explanation (35-40 words). Focus on TRANSFORMATION and EMOTIONAL impact. Use specific examples. Explain HOW it improves their life. Make it tangible and desirable."},
    {"icon": "🚀", "title": "Compelling benefit title (3-5 words)", "description": "DETAILED benefit explanation (35-40 words). Focus on TRANSFORMATION and EMOTIONAL impact. Use specific examples. Explain HOW it improves their life. Make it tangible and desirable."}
  ],
  "urgency": null,
  "socialProof": {
    "rating": 4.8,
    "reviewCount": 127,
    "testimonials": [
      {"name": "Realistic full name matching the detected language (e.g., English: 'Sarah Mitchell' or 'James Anderson', Romanian: 'Maria Popescu' or 'Andrei Ionescu', Spanish: 'Carlos García' or 'Ana Martínez', French: 'Sophie Dubois' or 'Pierre Martin', German: 'Anna Schmidt' or 'Michael Müller'). NEVER use 'John Doe' or 'Jane Smith'!", "text": "DETAILED, authentic testimonial (50-60 words). Include: 1) What problem they had, 2) Why they chose this product, 3) Specific results they got, 4) How it made them FEEL. Make it personal and believable.", "rating": 5},
      {"name": "DIFFERENT realistic full name in same language (use different first AND last name from first testimonial). NEVER repeat names!", "text": "DIFFERENT detailed testimonial (50-60 words). Focus on DIFFERENT aspect of product. Include specific details and emotional impact. Make it unique from first testimonial.", "rating": 5}
    ]
  },
  "features": [
    "SPECIFIC feature with technical details and benefit (e.g., 'Premium 18K gold-plated stainless steel - hypoallergenic and tarnish-resistant for lifetime beauty')",
    "SPECIFIC feature with measurements/specs and benefit",
    "SPECIFIC feature with quality indicators and benefit",
    "SPECIFIC feature with unique selling point and benefit",
    "SPECIFIC feature with craftsmanship detail and benefit",
    "SPECIFIC feature with warranty/guarantee detail"
  ],
  "guarantee": null,
  "faq": [
    {"question": "Industry-specific question addressing main objection", "answer": "COMPREHENSIVE answer (60-70 words). Address concern completely. Provide specific details. Build confidence. Turn objection into selling point."},
    {"question": "Question about quality/authenticity", "answer": "DETAILED answer with specifics (60-70 words). Mention certifications, materials, craftsmanship. Build trust."},
    {"question": "Question about delivery/shipping", "answer": "CLEAR answer with timeline and details (60-70 words). Remove uncertainty."},
    {"question": "Question about returns/guarantee", "answer": "REASSURING answer (60-70 words). Make it sound easy and risk-free."},
    {"question": "Question about care/maintenance", "answer": "HELPFUL answer with specific tips (60-70 words). Show you care about long-term satisfaction."}
  ],
  "trustBadges": []
}

IMPORTANT: 
- Use industry-appropriate language
- Create urgency without being pushy
- Focus on benefits, not features
- Make it feel authentic and trustworthy
`;

    const groq = getGroq();
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a landing page copywriting expert. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 3000, // Increased for 500+ word descriptions
    });

    const content = completion.choices[0]?.message?.content || '';
    console.log('🤖 AI Response:', content);

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    let jsonString = jsonMatch[0];
    
    // Clean up common JSON errors from AI
    console.log('🧹 Cleaning JSON before parsing...');
    
    // 1. Remove control characters (newlines, tabs, etc.)
    jsonString = jsonString.replace(/[\x00-\x1F\x7F]/g, '');
    
    // 2. Fix trailing commas
    jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // 3. Fix missing quotes around property names
    jsonString = jsonString.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // 4. CRITICAL FIX: Replace escaped quotes inside string values with single quotes
    // This fixes: "Lanțisorul \"Inima Eternă\"" -> "Lanțisorul 'Inima Eternă'"
    jsonString = jsonString.replace(/:\s*"([^"]*?)\\"/g, (match, before) => {
      // Replace \" with ' inside string values
      return `: "${before.replace(/\\"/g, "'")}"`;
    });
    
    // 5. Also fix any remaining \" that might break JSON
    // But preserve \" at the end of strings (those are valid)
    jsonString = jsonString.replace(/\\"(?!")/g, "'");
    
    console.log('✅ JSON cleaned, attempting parse...');
    
    let landingPageContent;
    try {
      landingPageContent = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError.message);
      console.error('📄 Problematic JSON (first 500 chars):', jsonString.substring(0, 500));
      console.error('📄 Problematic JSON (around error):', jsonString.substring(Math.max(0, 2482 - 100), Math.min(jsonString.length, 2482 + 100)));
      throw new Error(`Invalid JSON from AI: ${parseError.message}`);
    }
    
    console.log('✅ Landing page content generated successfully');

    return landingPageContent;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  console.log('=== GENERATE LANDING PAGE API CALLED ===');
  
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
    const { productId, pageTitle, pageSlug, urlPrefix, templateId, storeId } = req.body;
    
    console.log('📊 Request:', { productId, pageTitle, pageSlug, urlPrefix, templateId, storeId });
    
    if (!productId || !pageTitle || !pageSlug || !storeId) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, pageTitle, pageSlug, storeId' 
      });
    }

    // ✅ CHECK PLAN LIMITS BEFORE GENERATION
    try {
      const limitCheck = await checkPlanLimits(storeId, 'generate_page', 1);
      if (!limitCheck.allowed) {
        console.log('❌ Plan limit reached:', limitCheck.message);
        return res.status(403).json({
          error: 'Plan limit reached',
          message: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit,
          upgradeMessage: limitCheck.upgradeMessage,
          upgradePlan: limitCheck.upgradePlan,
          upgradeUrl: '/pricing'
        });
      }
      console.log('✅ Plan limit check passed');
    } catch (error) {
      console.error('⚠️ Plan limit check failed:', error);
      // Continue anyway if check fails (graceful degradation)
    }

    // Load Firebase
    const hasFirebase = process.env.FIREBASE_PROJECT_ID && 
                        process.env.FIREBASE_CLIENT_EMAIL && 
                        process.env.FIREBASE_PRIVATE_KEY;
    
    if (!hasFirebase) {
      console.log('⚠️  Firebase not configured');
      return res.status(500).json({
        error: 'Firebase not configured',
      });
    }

    try {
      const admin = require('firebase-admin');
      
      // Initialize Firebase Admin if not already initialized
      if (admin.apps.length === 0) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert({
              projectId: process.env.FIREBASE_PROJECT_ID,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
              privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
          });
        } catch (error) {
          console.error('Firebase init error:', error);
        }
      }
      
      const db = admin.firestore();
      
      // Get product from Firebase
      const productDoc = await db
        .collection('stores')
        .doc(storeId)
        .collection('products')
        .doc(productId)
        .get();
      
      if (!productDoc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      const product = productDoc.data();
      console.log('📦 Product loaded:', product.name);
      
      // Generate landing page content with AI
      const content = await generateLandingPageContent(product);
      
      // Create landing page record in Firebase
      const landingPageRef = db
        .collection('stores')
        .doc(storeId)
        .collection('landingPages')
        .doc();
      
      // Get store data from Firebase
      const storeDoc = await db.collection('stores').doc(storeId).get();
      const storeData = storeDoc.exists ? storeDoc.data() : {};
      const store = {
        id: storeId,
        name: storeData.name || 'Store',
        url: storeData.url || storeData.siteUrl || '',
        currency: storeData.currency || 'RON',
        ...storeData
      };
      
      // Add currency to product for template
      const productWithCurrency = {
        ...product,
        currency: store.currency
      };
      
      // Generate HTML from content
      const html = generateLandingPageHTML(productWithCurrency, content, store, templateId || 'default');
      
      const landingPageData = {
        id: landingPageRef.id,
        productId,
        productName: product.name,
        pageTitle,
        pageSlug,
        urlPrefix: urlPrefix || '',
        fullUrl: urlPrefix ? `/${urlPrefix}/${pageSlug}` : `/${pageSlug}`,
        templateId: templateId || 'default',
        content,
        html,
        status: 'draft',
        views: 0,
        addToCarts: 0,
        conversions: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await landingPageRef.set(landingPageData);
      
      console.log('✅ Landing page created:', landingPageRef.id);
      
      // ✅ INCREMENT USAGE AFTER SUCCESSFUL GENERATION
      try {
        await incrementUsage(storeId, 'pagesGenerated', 1);
        console.log('✅ Usage incremented: +1 page');
      } catch (error) {
        console.error('⚠️ Failed to increment usage:', error);
        // Don't fail the request if usage increment fails
      }
      
      return res.status(200).json({
        success: true,
        landingPage: landingPageData,
        message: 'Landing page generated successfully',
      });
    } catch (error) {
      console.error('Firebase error:', error);
      return res.status(500).json({
        error: 'Failed to generate landing page',
        message: error.message,
      });
    }
  } catch (error) {
    console.error('Generate landing page API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
};
