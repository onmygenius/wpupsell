// TEMPLATE #1: Minimalist Product (Shadcn UI Style)
// Professional, clean, centered hero with product image
// Based on Shadcn UI design principles

function generateShadcnMinimalistTemplate(product, content, storeUrl = '') {
  const { hero, description, benefits, faq } = content;
  const baseUrl = storeUrl ? storeUrl.replace(/\/$/, '') : '';
  
  return `
<!DOCTYPE html>
<html lang="ro" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hero.headline} | ${product.name}</title>
    <meta name="description" content="${hero.subheadline}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts - Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        * { font-family: 'Inter', sans-serif; }
        
        /* Shadcn-inspired CSS variables */
        :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --primary: 222.2 47.4% 11.2%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 222.2 47.4% 11.2%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --border: 214.3 31.8% 91.4%;
            --radius: 0.5rem;
        }
        
        .btn-primary {
            background: hsl(var(--primary));
            color: hsl(var(--primary-foreground));
            padding: 0.75rem 2rem;
            border-radius: var(--radius);
            font-weight: 600;
            transition: all 0.2s;
            border: none;
            cursor: pointer;
        }
        
        .btn-primary:hover {
            opacity: 0.9;
            transform: translateY(-1px);
        }
        
        .card {
            background: hsl(var(--card));
            border: 1px solid hsl(var(--border));
            border-radius: calc(var(--radius) + 2px);
            padding: 1.5rem;
            transition: all 0.2s;
        }
        
        .card:hover {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        
        .fade-in {
            animation: fadeIn 0.6s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-white text-gray-900 antialiased" data-store-url="${baseUrl}">
    
    <!-- Hero Section - Centered with Image Below (Shadcn Style) -->
    <section class="relative overflow-hidden py-20 sm:py-32">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-4xl text-center fade-in">
                <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                    ${hero.headline}
                </h1>
                <p class="mt-6 text-lg leading-8 text-gray-600">
                    ${hero.subheadline}
                </p>
                
                <!-- Product Image - SUB TITLU -->
                <div class="mt-12 flow-root">
                    <div class="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10">
                        <img src="${product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}" 
                             alt="${product.name}"
                             class="rounded-md shadow-2xl ring-1 ring-gray-900/10 w-full object-cover"
                             style="max-height: 600px;">
                    </div>
                </div>
                
                <!-- Preț + Buton pe aceeași linie -->
                <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
                    <span class="text-4xl font-bold text-gray-900">${product.price} ${product.currency || 'LEI'}</span>
                    <button onclick="addToCart('${product.id}')" 
                            class="btn-primary inline-flex items-center gap-2">
                        ${hero.cta}
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- Description Section -->
    <section class="py-16 sm:py-24 bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-5xl">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Despre Produs
                </h2>
                <p class="mt-6 text-lg leading-8 text-gray-600">
                    ${description}
                </p>
            </div>
        </div>
    </section>

    <!-- Benefits Section - 3 Column Grid (Shadcn Cards) -->
    <section class="py-16 sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center mb-16">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    De Ce Să Alegi Acest Produs?
                </h2>
            </div>
            <div class="mx-auto grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                ${benefits.map(benefit => `
                <div class="card">
                    <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-900 text-white text-2xl mb-4">
                        ${benefit.icon}
                    </div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${benefit.title}</h3>
                    <p class="text-gray-600">${benefit.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- FAQ Section - Accordion (Shadcn Style) -->
    <section class="py-16 sm:py-24 bg-gray-50">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl text-center mb-16">
                <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                    Întrebări Frecvente
                </h2>
            </div>
            <div class="mx-auto max-w-3xl divide-y divide-gray-200">
                ${faq.map((item, index) => `
                <div class="py-6">
                    <button onclick="toggleFAQ(${index})" 
                            class="flex w-full items-start justify-between text-left text-gray-900 hover:text-gray-600 transition-colors">
                        <span class="text-lg font-semibold">${item.question}</span>
                        <span class="ml-6 flex h-7 items-center">
                            <svg id="faq-icon-${index}" class="h-6 w-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </span>
                    </button>
                    <div id="faq-content-${index}" class="hidden mt-4 pr-12">
                        <p class="text-base text-gray-600">${item.answer}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA Section - Final Push -->
    <section class="py-16 sm:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="relative isolate overflow-hidden bg-gray-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                <h2 class="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Gata Să Cumperi?
                </h2>
                <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                    Comandă acum și primești produsul în cel mai scurt timp!
                </p>
                <div class="mt-10 flex items-center justify-center gap-x-6">
                    <button onclick="addToCart('${product.id}')" 
                            class="rounded-md bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm hover:bg-gray-100 transition-all">
                        ${hero.cta}
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- No Footer - WordPress will handle it -->

    <script>
        // FAQ Toggle with smooth animation
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

        // Smooth scroll for anchor links
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

module.exports = { generateShadcnMinimalistTemplate };
