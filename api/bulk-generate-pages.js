/**
 * Bulk Generate Promotional Pages
 * 
 * Generates 10/50/100 UNIQUE promotional pages for any store
 * Each page: unique title, persuasive content, product mentions, CTA
 * Direct publish to WordPress - NO database storage
 */

const Groq = require('groq-sdk');

// Groq instance
let groqInstance = null;

function getGroq() {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY
    });
  }
  return groqInstance;
}

// Firebase Admin
function getFirebaseDb() {
  const admin = require('firebase-admin');
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  return admin.firestore();
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { storeId, numberOfPages = 10, offset = 0 } = req.body;

    console.log('=== BULK GENERATE PAGES ===');
    console.log('Store ID:', storeId);
    console.log('Number of pages:', numberOfPages);
    console.log('Offset:', offset);

    if (!storeId) {
      return res.status(400).json({ error: 'Missing storeId' });
    }

    if (numberOfPages < 1 || numberOfPages > 100) {
      return res.status(400).json({ error: 'Number of pages must be between 1 and 100' });
    }

    // Calculate how many pages to generate in this chunk
    const remainingPages = numberOfPages - offset;
    const pagesToGenerate = Math.min(remainingPages, 3); // Max 3 pages per request
    
    console.log(`📊 Generating ${pagesToGenerate} pages (${offset + 1}-${offset + pagesToGenerate} of ${numberOfPages})`);

    // Get store data from Firestore
    const db = getFirebaseDb();
    const storeDoc = await db.collection('stores').doc(storeId).get();

    if (!storeDoc.exists) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const store = storeDoc.data();
    console.log('Store loaded:', store.name);

    // Get products from Firestore
    const productsSnapshot = await db
      .collection('stores')
      .doc(storeId)
      .collection('products')
      .limit(50) // Get up to 50 products for variety
      .get();

    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Products loaded: ${products.length}`);

    if (products.length === 0) {
      return res.status(400).json({ error: 'No products found. Please sync products first.' });
    }

    // Check WordPress credentials
    if (!store.wordpressUsername || !store.wordpressPassword) {
      return res.status(400).json({ 
        error: 'WordPress credentials not configured',
        message: 'Please configure WordPress Publishing credentials in Store Settings.'
      });
    }

    // Start generation process
    console.log(`🚀 Starting bulk generation of ${pagesToGenerate} pages...`);

    // STEP 1: Generate unique titles for all pages
    const titles = await generateUniqueTitles(store, products, pagesToGenerate);
    console.log(`✅ Generated ${titles.length} unique titles`);

    // STEP 2: Generate and publish each page
    const results = [];
    
    for (let i = 0; i < titles.length; i++) {
      const pageNumber = offset + i + 1; // Include offset in page number
      console.log(`\n📄 Generating page ${pageNumber}/${numberOfPages}: ${titles[i]}`);

      try {
        // Generate content for this page
        const content = await generatePageContent(store, products, titles[i], pageNumber);
        
        // Generate HTML
        const html = generatePageHTML(store, products, titles[i], content);
        
        // Publish to WordPress
        const publishResult = await publishToWordPress(store, titles[i], html);
        
        results.push({
          pageNumber,
          title: titles[i],
          url: publishResult.url,
          status: 'success'
        });

        console.log(`✅ Page ${pageNumber} published: ${publishResult.url}`);

      } catch (error) {
        console.error(`❌ Error generating page ${pageNumber}:`, error.message);
        results.push({
          pageNumber,
          title: titles[i],
          status: 'error',
          error: error.message
        });
      }

      // Small delay to avoid rate limits
      if (i < titles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`\n✅ Bulk generation complete: ${successCount}/${pagesToGenerate} pages published`);

    return res.status(200).json({
      success: true,
      message: `Successfully generated ${successCount} out of ${pagesToGenerate} pages`,
      totalRequested: numberOfPages,
      totalGenerated: pagesToGenerate,
      results
    });

  } catch (error) {
    console.error('❌ Bulk generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate pages',
      message: error.message
    });
  }
};

/**
 * Generate unique titles for all pages
 */
async function generateUniqueTitles(store, products, count) {
  const groq = getGroq();
  
  // Get product categories for variety
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const productNames = products.slice(0, 10).map(p => p.name);

  const prompt = `Generate ${count} UNIQUE promotional page titles for an e-commerce store.

Store name: ${store.name}
Industry: ${categories.join(', ')}
Sample products: ${productNames.join(', ')}

Requirements:
- Each title must be COMPLETELY DIFFERENT
- Focus on PROMOTION and PERSUASION
- Include emotional triggers
- Vary the angle: elegance, luxury, gift, style, quality, etc.
- Keep titles between 40-60 characters
- Make them compelling and click-worthy

Examples of good titles:
- "Descoperă luxul autentic cu ${store.name}"
- "Bijuterii care îți transformă stilul"
- "Eleganță și rafinament pentru fiecare moment"
- "Cadoul perfect care va rămâne pentru totdeauna"
- "Strălucește cu bijuterii din aur 18K"

Generate EXACTLY ${count} titles in JSON format:
{
  "titles": ["title 1", "title 2", ...]
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert copywriter specializing in e-commerce promotional content. Generate compelling, unique titles that drive conversions.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.9, // High creativity for variety
    response_format: { type: 'json_object' }
  });

  const response = completion.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(response);
  
  // Add store name to each title
  const titles = parsed.titles || [];
  return titles.map(title => `${title} | ${store.name}`);
}

/**
 * Generate content for a single page
 */
async function generatePageContent(store, products, title, pageNumber) {
  const groq = getGroq();
  
  // Select 2-3 random products to mention
  const shuffled = [...products].sort(() => 0.5 - Math.random());
  const selectedProducts = shuffled.slice(0, 3);

  // Get product categories for external links
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  const mainCategory = categories[0] || 'produse';

  const prompt = `Write promotional content for an e-commerce landing page.

Title: ${title}
Store: ${store.name}
Products to mention: ${selectedProducts.map(p => p.name).join(', ')}
Category: ${mainCategory}

Requirements:
- Write 1000-1500 words of PERSUASIVE, PROMOTIONAL content
- Focus on EMOTIONS and BENEFITS, not technical details
- Include strong CTAs throughout
- Mention the 2-3 products naturally in context
- Use "tu" form (Romanian)
- Make it compelling and conversion-focused
- Vary the structure and flow (this is page ${pageNumber}, make it unique!)

Structure:
1. Opening paragraph (150 words) - Hook the reader emotionally
2. Main benefits section (400 words) - Why choose this store
3. Product mentions (300 words) - Naturally weave in the products
4. Social proof (200 words) - Customer satisfaction, quality
5. Urgency/Scarcity (150 words) - Create FOMO
6. Final CTA (100 words) - Strong call to action

Return in JSON format:
{
  "content": "main promotional content here",
  "faq": [
    {"question": "question 1", "answer": "answer 1"},
    {"question": "question 2", "answer": "answer 2"},
    {"question": "question 3", "answer": "answer 3"}
  ]
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert copywriter specializing in persuasive e-commerce content that drives sales. Always return valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  });

  const response = completion.choices[0]?.message?.content || '{}';
  try {
    return JSON.parse(response);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return { content: response, faq: [] };
  }
}

/**
 * Generate HTML for the page
 */
function generatePageHTML(store, products, title, contentData) {
  // Select random product image for hero
  const randomProduct = products[Math.floor(Math.random() * products.length)];
  const heroImage = randomProduct.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80';

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Extract content and FAQ
  const content = contentData.content || contentData;
  const faq = contentData.faq || [];

  // Split content into paragraphs
  const paragraphs = typeof content === 'string' ? content.split('\n\n').filter(p => p.trim()) : [content];

  const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${store.name}</title>
    <meta name="description" content="${paragraphs[0].substring(0, 160)}">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Schema.org -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${title}",
      "description": "${paragraphs[0].substring(0, 200)}",
      "image": "${heroImage}",
      "author": {
        "@type": "Organization",
        "name": "${store.name}",
        "url": "${store.url}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "${store.name}",
        "url": "${store.url}"
      },
      "datePublished": "${new Date().toISOString()}"
    }
    </script>
</head>
<body class="bg-gray-50">
    
    <!-- Hero Section -->
    <section class="bg-white py-16">
        <div class="max-w-6xl mx-auto px-4">
            <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">
                ${title}
            </h1>
            
            <img src="${heroImage}" 
                 alt="${title}" 
                 class="max-w-2xl w-full h-auto rounded-2xl shadow-2xl mx-auto mb-8">
        </div>
    </section>
    
    <!-- Content -->
    <section class="bg-gray-50 py-16">
        <div class="max-w-4xl mx-auto px-4">
            <div class="prose prose-lg max-w-none">
                ${paragraphs.map(p => `<p class="text-gray-700 leading-relaxed mb-6">${p}</p>`).join('\n')}
            </div>
            
            <!-- CTA Button -->
            <div class="text-center mt-12">
                <a href="${store.url}" 
                   class="inline-block bg-gray-900 text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg">
                    Vezi Produsele
                </a>
            </div>
        </div>
    </section>
    
    <!-- Products Section -->
    <section class="bg-white py-16">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
                Produse Recomandate
            </h2>
            <div class="grid md:grid-cols-3 gap-8">
                ${products.slice(0, 3).map(product => `
                    <div class="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                        <img src="${product.image || 'https://via.placeholder.com/300'}" 
                             alt="${product.name}" 
                             class="w-full h-48 object-cover rounded-lg mb-4">
                        <h3 class="text-xl font-bold text-gray-900 mb-2">${product.name}</h3>
                        <p class="text-2xl font-bold text-gray-900 mb-4">${product.price} ${store.currency || 'LEI'}</p>
                        <a href="${product.url || store.url}" 
                           class="block text-center bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-colors">
                            Vezi Detalii
                        </a>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- FAQ Section -->
    ${faq && faq.length > 0 ? `
    <section class="bg-gray-50 py-16">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
                Întrebări Frecvente
            </h2>
            <div class="space-y-4">
                ${faq.map(item => `
                    <details class="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                        <summary class="px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center cursor-pointer list-none">
                            <span>${item.question}</span>
                            <span class="text-2xl text-blue-500 transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-6 py-4 text-gray-600 border-t border-gray-200">
                            ${item.answer}
                        </div>
                    </details>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}
    
</body>
</html>
  `.trim();

  return html;
}

/**
 * Publish page to WordPress
 */
async function publishToWordPress(store, title, html) {
  const fetch = require('node-fetch');
  const crypto = require('crypto');

  // WordPress password (already decrypted in Firebase)
  const decryptedPassword = store.wordpressPassword;

  // Generate slug
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Sanitize HTML
  let sanitizedHTML = html.replace(/\0/g, '');
  sanitizedHTML = sanitizedHTML.replace(/[\x00-\x1F\x7F]/g, '');
  
  const byteSize = Buffer.byteLength(sanitizedHTML, 'utf8');
  const maxBytes = 50000;
  
  if (byteSize > maxBytes) {
    let truncated = '';
    let currentBytes = 0;
    
    for (let i = 0; i < sanitizedHTML.length; i++) {
      const char = sanitizedHTML[i];
      const charBytes = Buffer.byteLength(char, 'utf8');
      
      if (currentBytes + charBytes > maxBytes - 100) {
        break;
      }
      
      truncated += char;
      currentBytes += charBytes;
    }
    
    sanitizedHTML = truncated + '\n<!-- Content truncated -->';
  }

  // Publish to WordPress
  const wpUrl = store.url.replace(/\/$/, '');
  const apiUrl = `${wpUrl}/wp-json/wp/v2/pages`;
  const auth = Buffer.from(`${store.wordpressUsername}:${decryptedPassword}`).toString('base64');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      content: sanitizedHTML,
      slug,
      status: 'publish'
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'WordPress publish failed');
  }

  return {
    id: data.id,
    url: data.link
  };
}
