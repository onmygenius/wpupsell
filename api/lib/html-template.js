// HTML Template Generator for Landing Pages
// Generates high-converting HTML from AI-generated content

// Import templates
const { generateMinimalistTemplate } = require('../templates/minimalist-ecommerce');

// Template registry
const TEMPLATES = {
  'minimalist-ecommerce': generateMinimalistTemplate,
  // More templates will be added here
};

function generateLandingPageHTML(product, content, storeUrl = '', templateId = 'default') {
  // Check if specific template exists
  if (templateId !== 'default' && TEMPLATES[templateId]) {
    console.log(`Using template: ${templateId}`);
    return TEMPLATES[templateId](product, content, storeUrl);
  }
  
  // Use default template
  console.log('Using default template');
  return generateDefaultTemplate(product, content, storeUrl);
}

function generateDefaultTemplate(product, content, storeUrl = '') {
  const { hero, description, benefits, urgency, socialProof, features, guarantee, faq, trustBadges } = content;
  
  // Ensure storeUrl ends without trailing slash
  const baseUrl = storeUrl ? storeUrl.replace(/\/$/, '') : '';
  
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hero.headline} | ${product.name}</title>
    <meta name="description" content="${hero.subheadline}">
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f9fafb;
        }
        
        .container {
            width: 100%;
            margin: 0;
            padding: 0;
        }
        
        .content-wrapper {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        /* Hero Section */
        .hero {
            background: #ffffff;
            color: #1f2937;
            padding: 80px 20px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .hero h1 {
            font-size: 3rem;
            font-weight: 800;
            margin-bottom: 20px;
            line-height: 1.2;
            color: #1f2937;
        }
        
        .hero p {
            font-size: 1.25rem;
            margin-bottom: 30px;
            color: #6b7280;
        }
        
        .product-image {
            max-width: 500px;
            width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            margin: 30px auto;
        }
        
        .price {
            font-size: 3rem;
            font-weight: 700;
            margin: 20px 0;
        }
        
        .cta-button {
            display: inline-block;
            background: white;
            color: #1f2937;
            padding: 18px 48px;
            font-size: 1.25rem;
            font-weight: 700;
            border: 3px solid #1f2937;
            border-radius: 12px;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        
        .cta-button:hover {
            background: #1f2937;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
        }
        
        /* Urgency Banner - Hidden by default */
        .urgency {
            display: none;
        }
        
        /* Trust Badges - Hidden */
        .trust-badges {
            display: none;
        }
        
        /* Description Section */
        .description {
            background: white;
            padding: 60px 20px;
        }
        
        .description-content {
            max-width: 800px;
            margin: 0 auto;
            font-size: 1.1rem;
            line-height: 1.8;
        }
        
        /* Benefits Grid */
        .benefits {
            padding: 60px 20px;
            background: #f9fafb;
        }
        
        .section-title {
            text-align: center;
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 50px;
            color: #1f2937;
        }
        
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            max-width: 1000px;
            margin: 0 auto;
        }
        
        @media (max-width: 768px) {
            .benefits-grid {
                grid-template-columns: 1fr;
            }
        }
        
        .benefit-card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.07);
            transition: transform 0.3s;
        }
        
        .benefit-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        .benefit-icon {
            font-size: 3rem;
            margin-bottom: 15px;
        }
        
        .benefit-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .benefit-description {
            color: #6b7280;
            line-height: 1.6;
        }
        
        /* Social Proof */
        .social-proof {
            background: white;
            padding: 60px 20px;
        }
        
        .rating {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .stars {
            font-size: 2rem;
            color: #fbbf24;
            margin-bottom: 10px;
        }
        
        .rating-text {
            font-size: 1.1rem;
            color: #6b7280;
        }
        
        .testimonials {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            max-width: 900px;
            margin: 0 auto;
        }
        
        .testimonial {
            background: #f9fafb;
            padding: 30px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        
        .testimonial-text {
            font-style: italic;
            margin-bottom: 15px;
            line-height: 1.6;
        }
        
        .testimonial-author {
            font-weight: 600;
            color: #1f2937;
        }
        
        /* Features */
        .features {
            background: #f9fafb;
            padding: 60px 20px;
        }
        
        .features-list {
            max-width: 800px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .feature-item {
            display: flex;
            align-items: start;
            gap: 15px;
            background: white;
            padding: 20px;
            border-radius: 8px;
        }
        
        .feature-check {
            color: #10b981;
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        /* Guarantee - Hidden */
        .guarantee {
            display: none;
        }
        
        /* FAQ */
        .faq {
            background: white;
            padding: 60px 20px;
        }
        
        .faq-list {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .faq-item {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: all 0.3s;
        }
        
        .faq-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .faq-question {
            font-size: 1.1rem;
            font-weight: 600;
            padding: 20px;
            color: #1f2937;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
        }
        
        .faq-question:hover {
            background: #f9fafb;
        }
        
        .faq-icon {
            font-size: 1.5rem;
            color: #667eea;
            transition: transform 0.3s;
        }
        
        .faq-item.active .faq-icon {
            transform: rotate(45deg);
        }
        
        .faq-answer {
            padding: 0 20px;
            max-height: 0;
            overflow: hidden;
            transition: all 0.3s;
            color: #6b7280;
            line-height: 1.6;
        }
        
        .faq-item.active .faq-answer {
            padding: 0 20px 20px 20px;
            max-height: 500px;
        }
        
        /* Final CTA */
        .final-cta {
            background: #f9fafb;
            color: #1f2937;
            padding: 80px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .final-cta h2 {
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
            .hero h1 {
                font-size: 2rem;
            }
            
            .section-title {
                font-size: 2rem;
            }
            
            .benefits-grid,
            .features-list {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body data-store-url="${baseUrl}">
    <!-- Hero Section -->
    <section class="hero">
        <div class="content-wrapper">
            <h1>${hero.headline}</h1>
            <p>${hero.subheadline}</p>
            
            <img src="${product.image || 'https://via.placeholder.com/500'}" alt="${product.name}" class="product-image">
            
            <div class="price">${product.price} ${product.currency || 'LEI'}</div>
            
            <button class="cta-button" onclick="addToCart(${product.productId})">${hero.cta}</button>
            
            ${urgency ? `<div class="urgency">⚡ ${urgency.text}</div>` : ''}
            
            <div class="trust-badges">
                ${trustBadges.map(badge => `<div class="trust-badge">✓ ${badge}</div>`).join('')}
            </div>
        </div>
    </section>
    
    <!-- Description -->
    <section class="description">
        <div class="content-wrapper">
            <div class="description-content">
                ${description}
            </div>
        </div>
    </section>
    
    <!-- Benefits -->
    <section class="benefits">
        <div class="content-wrapper">
            <h2 class="section-title">De ce să alegi ${product.name}?</h2>
            <div class="benefits-grid">
                ${benefits.map(benefit => `
                    <div class="benefit-card">
                        <div class="benefit-icon">${benefit.icon}</div>
                        <h3 class="benefit-title">${benefit.title}</h3>
                        <p class="benefit-description">${benefit.description}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Social Proof -->
    <section class="social-proof">
        <div class="content-wrapper">
            <h2 class="section-title">Ce spun clienții noștri</h2>
            <div class="rating">
                <div class="stars">${'★'.repeat(Math.floor(socialProof.rating))}${'☆'.repeat(5 - Math.floor(socialProof.rating))}</div>
                <p class="rating-text">${socialProof.rating}/5 din ${socialProof.reviewCount} recenzii</p>
            </div>
            <div class="testimonials">
                ${socialProof.testimonials.map(t => `
                    <div class="testimonial">
                        <p class="testimonial-text">"${t.text}"</p>
                        <p class="testimonial-author">— ${t.name}</p>
                        <div class="stars" style="font-size: 1rem;">${'★'.repeat(t.rating)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Features -->
    <section class="features">
        <div class="content-wrapper">
            <h2 class="section-title">Specificații</h2>
            <div class="features-list">
                ${features.map(feature => `
                    <div class="feature-item">
                        <span class="feature-check">✓</span>
                        <span>${feature}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- FAQ -->
    <section class="faq">
        <div class="content-wrapper">
            <h2 class="section-title">Întrebări Frecvente</h2>
            <div class="faq-list">
                ${faq.map((item, index) => `
                    <div class="faq-item" id="faq-${index}">
                        <div class="faq-question" onclick="toggleFAQ(${index})">
                            <span>${item.question}</span>
                            <span class="faq-icon">+</span>
                        </div>
                        <div class="faq-answer">${item.answer}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>
    
    <!-- Final CTA -->
    <section class="final-cta">
        <div class="content-wrapper">
            <h2>Gata să comanzi?</h2>
            <p style="font-size: 1.25rem; margin-bottom: 30px;">${hero.subheadline}</p>
            <button class="cta-button" onclick="addToCart(${product.productId})">${hero.cta}</button>
        </div>
    </section>
    
    <!-- Scripts -->
    <script>
        // FAQ Accordion
        function toggleFAQ(index) {
            const item = document.getElementById('faq-' + index);
            const allItems = document.querySelectorAll('.faq-item');
            
            // Close all other items
            allItems.forEach((el, i) => {
                if (i !== index) {
                    el.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        }
        
        // WooCommerce Add to Cart
        function addToCart(productId) {
            // Get store URL from data attribute or use current domain
            const storeUrl = document.body.getAttribute('data-store-url') || window.location.origin;
            // Redirect to store with add-to-cart parameter
            window.location.href = storeUrl + '/?add-to-cart=' + productId;
        }
    </script>
</body>
</html>
  `.trim();
}

module.exports = { generateLandingPageHTML };
