// HTML Template Generator for Landing Pages - STARTER TEMPLATE
// Simple, modern template with Tailwind CSS CDN

function generateLandingPageHTML(product, content, store = {}, templateId = 'default') {
  return generateStarterTemplate(product, content, store);
}

// Language detection from content
function detectLanguage(content, product) {
  const text = (
    (content.hero?.headline || '') + ' ' +
    (content.hero?.subheadline || '') + ' ' +
    (content.description || '') + ' ' +
    (product.name || '')
  ).toLowerCase();
  
  // Romanian detection
  if (text.match(/\b(și|sau|pentru|este|sunt|acest|această|cu|de|la|în)\b/)) return 'ro';
  // Spanish detection
  if (text.match(/\b(y|o|para|es|son|este|esta|con|de|en|el|la)\b/)) return 'es';
  // French detection
  if (text.match(/\b(et|ou|pour|est|sont|ce|cette|avec|de|dans|le|la)\b/)) return 'fr';
  // German detection
  if (text.match(/\b(und|oder|für|ist|sind|diese|dieser|mit|von|in|der|die|das)\b/)) return 'de';
  
  // Default to English
  return 'en';
}

// Translations object
const translations = {
  en: {
    whyChoose: 'Why choose',
    customerReviews: 'What our customers say',
    specifications: 'Specifications',
    faq: 'Frequently Asked Questions',
    readyToOrder: 'Ready to order?',
    orderNow: 'Order now and enjoy premium quality!',
    buyNow: 'Buy Now'
  },
  ro: {
    whyChoose: 'De ce să alegi',
    customerReviews: 'Ce spun clienții noștri',
    specifications: 'Specificații',
    faq: 'Întrebări Frecvente',
    readyToOrder: 'Gata să comanzi?',
    orderNow: 'Comandă acum și bucură-te de calitate premium!',
    buyNow: 'Cumpără Acum'
  },
  es: {
    whyChoose: 'Por qué elegir',
    customerReviews: 'Lo que dicen nuestros clientes',
    specifications: 'Especificaciones',
    faq: 'Preguntas Frecuentes',
    readyToOrder: '¿Listo para ordenar?',
    orderNow: '¡Ordena ahora y disfruta de calidad premium!',
    buyNow: 'Comprar Ahora'
  },
  fr: {
    whyChoose: 'Pourquoi choisir',
    customerReviews: 'Ce que disent nos clients',
    specifications: 'Spécifications',
    faq: 'Questions Fréquentes',
    readyToOrder: 'Prêt à commander?',
    orderNow: 'Commandez maintenant et profitez de la qualité premium!',
    buyNow: 'Acheter Maintenant'
  },
  de: {
    whyChoose: 'Warum wählen',
    customerReviews: 'Was unsere Kunden sagen',
    specifications: 'Spezifikationen',
    faq: 'Häufig gestellte Fragen',
    readyToOrder: 'Bereit zu bestellen?',
    orderNow: 'Jetzt bestellen und Premium-Qualität genießen!',
    buyNow: 'Jetzt Kaufen'
  }
};

function generateStarterTemplate(product, content, store = {}) {
  // Detect language from content
  const lang = detectLanguage(content, product);
  const t = translations[lang] || translations.en;
  
  // Safe destructuring with fallbacks
  const hero = content.hero || { headline: product.name || 'Premium Product', subheadline: 'High quality product', cta: t.buyNow };
  const description = content.description || 'Premium quality product with excellent features.';
  const benefits = content.benefits || [];
  const socialProof = content.socialProof || { rating: 4.5, reviewCount: 100, testimonials: [] };
  const features = content.features || [];
  const faq = content.faq || [];
  
  // Extract store data
  const storeName = store.name || 'Store';
  const storeUrl = store.url || '';
  const storeCurrency = store.currency || 'LEI';
  const baseUrl = storeUrl ? storeUrl.replace(/\/$/, '') : '';
  
  // Product URL for "Add to Cart"
  const productUrl = product.url || `${baseUrl}/?add-to-cart=${product.productId || product.id}`;
  
  return `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hero.headline || product.name} | ${storeName}</title>
    <meta name="description" content="${hero.subheadline || 'Premium quality product'}">
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-gray-50">
    
    <!-- Hero Section -->
    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-4 text-center">
            <h1 class="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                ${hero.headline || product.name || 'Premium Product'}
            </h1>
            <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                ${hero.subheadline || 'High quality product with excellent features'}
            </p>
            
            <img src="${product.image || 'https://via.placeholder.com/600'}" 
                 alt="${product.name || 'Product'}" 
                 class="max-w-lg w-full h-auto rounded-2xl shadow-2xl mx-auto mb-8">
            
            <div class="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
                ${product.price || '0'} ${storeCurrency}
            </div>
            
            <a href="${productUrl}" 
               class="inline-block bg-gray-900 text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg">
                ${hero.cta || t.buyNow}
            </a>
        </div>
    </section>
    
    <!-- Description -->
    <section class="bg-gray-50 py-20">
        <div class="max-w-4xl mx-auto px-4">
            <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                ${description}
            </div>
        </div>
    </section>
    
    <!-- Benefits -->
    ${benefits && benefits.length > 0 ? `
    <section class="bg-white py-20">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                ${t.whyChoose} ${product.name || 'this product'}?
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                ${benefits.map(benefit => `
                    <div class="bg-gray-50 p-8 rounded-xl hover:shadow-lg transition-shadow">
                        <div class="text-5xl mb-4">${benefit.icon || '✨'}</div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-3">${benefit.title || 'Beneficiu'}</h3>
                        <p class="text-gray-600 leading-relaxed">${benefit.description || 'Descriere beneficiu'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}
    
    <!-- Social Proof -->
    <section class="bg-gray-50 py-20">
        <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                ${t.customerReviews}
            </h2>
            <div class="text-center mb-12">
                <div class="text-5xl text-yellow-400 mb-2">
                    ${'★'.repeat(Math.floor(socialProof.rating || 4.5))}${'☆'.repeat(5 - Math.floor(socialProof.rating || 4.5))}
                </div>
                <p class="text-xl text-gray-600">
                    ${socialProof.rating || 4.5}/5 din ${socialProof.reviewCount || 100} recenzii
                </p>
            </div>
            ${socialProof.testimonials && socialProof.testimonials.length > 0 ? `
            <div class="grid md:grid-cols-2 gap-8">
                ${socialProof.testimonials.map(t => `
                    <div class="bg-white p-8 rounded-xl border-l-4 border-blue-500 shadow-md">
                        <p class="text-gray-700 italic mb-4 leading-relaxed">"${t.text || 'Produs excelent!'}"</p>
                        <p class="font-bold text-gray-900">— ${t.name || 'Client mulțumit'}</p>
                        <div class="text-yellow-400 mt-2">${'★'.repeat(t.rating || 5)}</div>
                    </div>
                `).join('')}
            </div>
            ` : '<p class="text-center text-gray-600">Clienți mulțumiți de calitatea produsului</p>'}
        </div>
    </section>
    
    <!-- Features -->
    ${features && features.length > 0 ? `
    <section class="bg-white py-20">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                ${t.specifications}
            </h2>
            <div class="grid md:grid-cols-2 gap-4">
                ${features.map(feature => `
                    <div class="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                        <span class="text-green-500 text-2xl flex-shrink-0">✓</span>
                        <span class="text-gray-700">${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}
    
    <!-- FAQ -->
    ${faq && faq.length > 0 ? `
    <section class="bg-gray-50 py-20">
        <div class="max-w-4xl mx-auto px-4">
            <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
                ${t.faq}
            </h2>
            <div class="space-y-4">
                ${faq.map((item) => `
                    <details class="bg-white rounded-xl border border-gray-200 overflow-hidden group">
                        <summary class="px-6 py-4 font-semibold text-gray-900 hover:bg-gray-50 flex justify-between items-center cursor-pointer list-none">
                            <span>${item.question || 'Întrebare'}</span>
                            <span class="text-2xl text-blue-500 transition-transform group-open:rotate-45">+</span>
                        </summary>
                        <div class="px-6 py-4 text-gray-600 border-t border-gray-200">
                            ${item.answer || 'Răspuns'}
                        </div>
                    </details>
                `).join('')}
            </div>
        </div>
    </section>
    ` : ''}
    
    <!-- Final CTA -->
    <section class="bg-white py-20">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                ${t.readyToOrder}
            </h2>
            <p class="text-xl text-gray-600 mb-8">
                ${hero.subheadline || t.orderNow}
            </p>
            <a href="${productUrl}" 
               class="inline-block bg-gray-900 text-white px-12 py-4 rounded-xl text-xl font-bold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg">
                ${hero.cta || t.buyNow}
            </a>
        </div>
    </section>
</body>
</html>
  `.trim();
}

module.exports = { generateLandingPageHTML };
