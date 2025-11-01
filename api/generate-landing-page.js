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

const { generateLandingPageHTML } = require('./lib/html-template');

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

STEP 1: Auto-detect the industry (jewelry, auto parts, fashion, hotels, tourism, electronics, etc.)
STEP 2: Adapt tone and style for that industry
STEP 3: Generate persuasive, conversion-focused content

Return ONLY a JSON object with this EXACT structure:
{
  "hero": {
    "headline": "Powerful, benefit-driven headline (max 10 words)",
    "subheadline": "Supporting text that creates urgency (max 20 words)",
    "cta": "Action-oriented button text (max 3 words)"
  },
  "description": "Detailed, persuasive product description (2-3 paragraphs, max 150 words). Focus on benefits, emotions, and transformation. Make it compelling and conversion-focused.",
  "benefits": [
    {"icon": "✨", "title": "Benefit 1 (max 5 words)", "description": "Detailed benefit description (max 25 words)"},
    {"icon": "💎", "title": "Benefit 2 (max 5 words)", "description": "Detailed benefit description (max 25 words)"},
    {"icon": "🎁", "title": "Benefit 3 (max 5 words)", "description": "Detailed benefit description (max 25 words)"},
    {"icon": "🚀", "title": "Benefit 4 (max 5 words)", "description": "Detailed benefit description (max 25 words)"}
  ],
  "urgency": {
    "text": "Scarcity message (e.g., 'Only 3 left in stock! Order now!')",
    "type": "stock",
    "countdown": false
  },
  "socialProof": {
    "rating": 4.8,
    "reviewCount": 127,
    "testimonials": [
      {"name": "Realistic customer name", "text": "Authentic testimonial (max 40 words)", "rating": 5},
      {"name": "Another customer name", "text": "Different authentic testimonial (max 40 words)", "rating": 5}
    ]
  },
  "features": [
    "Feature 1 - specific and measurable (e.g., 'Premium stainless steel construction')",
    "Feature 2 - specific and measurable",
    "Feature 3 - specific and measurable",
    "Feature 4 - specific and measurable",
    "Feature 5 - specific and measurable"
  ],
  "guarantee": {
    "title": "30-Day Money-Back Guarantee",
    "description": "Detailed guarantee text that removes risk (max 30 words)"
  },
  "faq": [
    {"question": "Common question 1?", "answer": "Detailed, helpful answer (max 50 words)"},
    {"question": "Common question 2?", "answer": "Detailed, helpful answer (max 50 words)"},
    {"question": "Common question 3?", "answer": "Detailed, helpful answer (max 50 words)"},
    {"question": "Common question 4?", "answer": "Detailed, helpful answer (max 50 words)"},
    {"question": "Common question 5?", "answer": "Detailed, helpful answer (max 50 words)"}
  ],
  "trustBadges": [
    "Free Shipping",
    "30-Day Returns",
    "Secure Payment",
    "24/7 Support"
  ]
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
      max_tokens: 1500,
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
    const { productId, pageTitle, pageSlug, urlPrefix, storeId } = req.body;
    
    console.log('📊 Request:', { productId, pageTitle, pageSlug, urlPrefix, storeId });
    
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
      
      // Generate HTML from content
      const html = generateLandingPageHTML(product, content);
      
      const landingPageData = {
        id: landingPageRef.id,
        productId,
        productName: product.name,
        pageTitle,
        pageSlug,
        urlPrefix: urlPrefix || '',
        fullUrl: urlPrefix ? `/${urlPrefix}/${pageSlug}` : `/${pageSlug}`,
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
