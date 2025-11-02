// TEMPLATE #2: Luxury Brand (Dark Theme with Animations)
// Premium dark design with gradient effects and smooth animations
// Based on Shadcn UI hero1 + custom animations

function generateShadcnLuxuryTemplate(product, content, storeUrl = '') {
  const { hero, description, benefits, faq } = content;
  const baseUrl = storeUrl ? storeUrl.replace(/\/$/, '') : '';
  
  return `
<!DOCTYPE html>
<html lang="ro" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hero.headline} | ${product.name}</title>
    <meta name="description" content="${hero.subheadline}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts - Playfair Display for luxury feel -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <style>
        * { font-family: 'Inter', sans-serif; }
        h1, h2, h3 { font-family: 'Playfair Display', serif; }
        
        /* Dark theme colors */
        :root {
            --bg-dark: #0a0a0a;
            --bg-dark-lighter: #1a1a1a;
            --text-light: #ffffff;
            --text-muted: #a0a0a0;
            --accent-gold: #d4af37;
            --accent-gold-light: #f4d03f;
        }
        
        body {
            background: var(--bg-dark);
            color: var(--text-light);
        }
        
        /* Gradient animations */
        @keyframes gradient-shift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        .gradient-bg {
            background: linear-gradient(-45deg, #0a0a0a, #1a1a1a, #2a2a2a, #1a1a1a);
            background-size: 400% 400%;
            animation: gradient-shift 15s ease infinite;
        }
        
        .gradient-text {
            background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        /* Shine effect */
        @keyframes shine {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
        }
        
        .shine-effect {
            background: linear-gradient(
                90deg,
                transparent 0%,
                rgba(212, 175, 55, 0.3) 50%,
                transparent 100%
            );
            background-size: 200% 100%;
            animation: shine 3s infinite;
        }
        
        /* Fade in animation */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
        }
        
        /* Stagger animation delays */
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        
        /* Button styles */
        .btn-luxury {
            background: linear-gradient(135deg, var(--accent-gold) 0%, var(--accent-gold-light) 100%);
            color: #000;
            padding: 1rem 2.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .btn-luxury:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
        }
        
        .btn-luxury::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }
        
        .btn-luxury:hover::before {
            left: 100%;
        }
        
        /* Card hover effect */
        .luxury-card {
            background: var(--bg-dark-lighter);
            border: 1px solid rgba(212, 175, 55, 0.2);
            border-radius: 1rem;
            padding: 2rem;
            transition: all 0.3s ease;
        }
        
        .luxury-card:hover {
            transform: translateY(-5px);
            border-color: var(--accent-gold);
            box-shadow: 0 20px 40px rgba(212, 175, 55, 0.1);
        }
        
        /* Image glow effect */
        .image-glow {
            box-shadow: 0 0 60px rgba(212, 175, 55, 0.2);
            transition: all 0.3s ease;
        }
        
        .image-glow:hover {
            box-shadow: 0 0 80px rgba(212, 175, 55, 0.4);
        }
    </style>
</head>
<body class="gradient-bg" data-store-url="${baseUrl}">
    
    <!-- Hero Section - Luxury Dark -->
    <section class="relative overflow-hidden py-20 sm:py-32">
        <!-- Decorative gradient orbs -->
        <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-yellow-600/10 to-transparent rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-yellow-600/10 to-transparent rounded-full blur-3xl"></div>
        
        <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-4xl text-center">
                <!-- Badge -->
                <div class="fade-in-up delay-100 inline-flex items-center gap-2 rounded-full border border-yellow-600/20 bg-yellow-600/10 px-4 py-2 text-sm mb-8">
                    <span class="text-yellow-500">✨</span>
                    <span class="text-yellow-100">Premium Collection</span>
                </div>
                
                <!-- Headline -->
                <h1 class="fade-in-up delay-200 text-5xl font-bold tracking-tight sm:text-7xl mb-6">
                    <span class="gradient-text">${hero.headline}</span>
                </h1>
                
                <!-- Subheadline -->
                <p class="fade-in-up delay-300 mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
                    ${hero.subheadline}
                </p>
                
                <!-- Product Image with glow -->
                <div class="fade-in-up delay-400 mt-16 flow-root">
                    <div class="relative">
                        <img src="${product.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'}" 
                             alt="${product.name}"
                             class="image-glow rounded-2xl w-full object-cover mx-auto"
                             style="max-height: 600px; max-width: 800px;">
                        <!-- Shine overlay -->
                        <div class="absolute inset-0 shine-effect rounded-2xl pointer-events-none"></div>
                    </div>
                </div>
                
                <!-- Price + Button -->
                <div class="fade-in-up delay-400 mt-12 flex flex-col sm:flex-row items-center justify-center gap-8">
                    <div class="text-center">
                        <div class="text-sm text-gray-400 mb-1">Preț Special</div>
                        <span class="text-5xl font-bold gradient-text">${product.price} ${product.currency || 'LEI'}</span>
                    </div>
                    <button onclick="addToCart('${product.id}')" 
                            class="btn-luxury inline-flex items-center gap-2">
                        ${hero.cta}
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Description Section - LUXURY CARD with Shadow & Glassmorphism -->
    <section class="py-16 sm:py-24 relative">
        <!-- Floating orbs background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-600/20 rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
        </div>
        
        <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <!-- Glassmorphism Card -->
            <div class="luxury-glass-card p-12 rounded-3xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl hover:shadow-yellow-500/20 transition-all duration-500 hover:scale-[1.02]">
                <div class="flex items-start gap-6 mb-8">
                    <div class="flex-shrink-0">
                        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center text-3xl shadow-lg shadow-yellow-500/50">
                            💎
                        </div>
                    </div>
                    <div>
                        <h2 class="text-4xl font-bold tracking-tight mb-2">
                            <span class="gradient-text">Despre Produs</span>
                        </h2>
                        <p class="text-yellow-500/80 text-sm uppercase tracking-wider">Premium Quality</p>
                    </div>
                </div>
                
                <div class="text-lg leading-8 text-gray-200 space-y-6 relative">
                    <!-- Decorative line -->
                    <div class="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-yellow-600 via-yellow-500 to-transparent rounded-full"></div>
                    <div class="pl-8">
                        ${description.split('\n\n').map(para => `<p class="hover:text-white transition-colors">${para}</p>`).join('')}
                    </div>
                </div>
                
                <!-- Bottom accent -->
                <div class="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                        <span class="text-sm text-gray-400">Calitate Verificată</span>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style="animation-delay: 0.5s;"></div>
                        <span class="text-sm text-gray-400">Premium Collection</span>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Benefits Section - 3D ANIMATED CARDS -->
    <section class="py-16 sm:py-24 bg-black/30">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center mb-16">
                <h2 class="text-5xl font-bold tracking-tight mb-4">
                    <span class="gradient-text">De Ce Să Alegi Acest Produs?</span>
                </h2>
                <p class="text-gray-400 text-lg">Beneficii premium care fac diferența</p>
            </div>
            
            <!-- Bento Grid Layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${benefits.map((benefit, index) => `
                <div class="group relative fade-in-up delay-${(index + 1) * 100}">
                    <!-- 3D Card with perspective -->
                    <div class="benefit-card-3d relative h-full p-8 rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-2">
                        <!-- Animated background gradient -->
                        <div class="absolute inset-0 bg-gradient-to-br from-yellow-600/0 via-yellow-500/0 to-yellow-600/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                        
                        <!-- Floating icon -->
                        <div class="relative mb-6">
                            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center text-4xl shadow-lg shadow-yellow-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                ${benefit.icon}
                            </div>
                            <!-- Glow effect -->
                            <div class="absolute inset-0 w-20 h-20 rounded-2xl bg-yellow-500/50 blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
                        </div>
                        
                        <!-- Content -->
                        <h3 class="text-2xl font-bold mb-4 text-white group-hover:text-yellow-100 transition-colors">
                            ${benefit.title}
                        </h3>
                        <p class="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                            ${benefit.description}
                        </p>
                        
                        <!-- Bottom accent line -->
                        <div class="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-yellow-600 to-yellow-500 group-hover:w-full transition-all duration-500"></div>
                        
                        <!-- Corner decoration -->
                        <div class="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-yellow-500/0 group-hover:border-yellow-500/50 transition-all duration-500"></div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- FAQ Section - Dark Accordion -->
    <section class="py-16 sm:py-24 bg-black/50">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center mb-16">
                <h2 class="text-4xl font-bold tracking-tight">
                    <span class="gradient-text">Întrebări Frecvente</span>
                </h2>
            </div>
            <div class="mx-auto max-w-3xl divide-y divide-gray-800">
                ${faq.map((item, index) => `
                <div class="py-6">
                    <button onclick="toggleFAQ(${index})" 
                            class="flex w-full items-start justify-between text-left text-white hover:text-yellow-500 transition-colors">
                        <span class="text-xl font-semibold">${item.question}</span>
                        <span class="ml-6 flex h-7 items-center">
                            <svg id="faq-icon-${index}" class="h-6 w-6 transition-transform text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </span>
                    </button>
                    <div id="faq-content-${index}" class="hidden mt-4 pr-12">
                        <p class="text-base text-gray-400 leading-relaxed">${item.answer}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA Section - Luxury Gradient -->
    <section class="py-16 sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="relative isolate overflow-hidden rounded-3xl px-6 py-24 text-center shadow-2xl"
                 style="background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);">
                <!-- Decorative elements -->
                <div class="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl">
                    <div class="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-yellow-600 to-yellow-400 opacity-20"></div>
                </div>
                
                <h2 class="mx-auto max-w-2xl text-4xl font-bold tracking-tight mb-6">
                    <span class="gradient-text">Gata Să Cumperi?</span>
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                    Comandă acum și bucură-te de eleganță premium!
                </p>
                <div class="mt-10 flex items-center justify-center gap-x-6">
                    <button onclick="addToCart('${product.id}')" 
                            class="btn-luxury">
                        ${hero.cta}
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- No Footer - WordPress will handle it -->

    <script>
        // FAQ Toggle
        function toggleFAQ(index) {
            const content = document.getElementById('faq-content-' + index);
            const icon = document.getElementById('faq-icon-' + index);
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
            }
        }

        // WooCommerce Add to Cart
        function addToCart(productId) {
            const storeUrl = document.body.getAttribute('data-store-url') || window.location.origin;
            window.location.href = storeUrl + '/?add-to-cart=' + productId;
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>
  `.trim();
}

module.exports = { generateShadcnLuxuryTemplate };
