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

const { generateLandingPageHTML } = require('../lib/lib/html-template');

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

1. LANGUAGE DETECTION:
   - Analyze product name language (Romanian, English, etc.)
   - Generate ALL content in the SAME language
   - NO mixed languages allowed!

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

Return ONLY a JSON object with this EXACT structure:
{
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
      {"name": "Realistic Romanian/English name (based on language)", "text": "DETAILED, authentic testimonial (50-60 words). Include: 1) What problem they had, 2) Why they chose this product, 3) Specific results they got, 4) How it made them FEEL. Make it personal and believable.", "rating": 5},
      {"name": "Different realistic name", "text": "DIFFERENT detailed testimonial (50-60 words). Focus on DIFFERENT aspect of product. Include specific details and emotional impact. Make it unique from first testimonial.", "rating": 5}
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

    const landingPageContent = JSON.parse(jsonMatch[0]);
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
