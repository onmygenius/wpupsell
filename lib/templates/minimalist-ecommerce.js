// Minimalist E-commerce Template
// Clean, white space, focus on product
// Based on Flowbite components

function generateMinimalistTemplate(product, content, store = {}) {
  const { hero, description, benefits, faq } = content;
  const storeUrl = store.url || store;
  const baseUrl = (typeof storeUrl === 'string' && storeUrl) ? storeUrl.replace(/\/$/, '') : '';
  
  return `
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${hero.headline} | ${product.name}</title>
    <meta name="description" content="${hero.subheadline}">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white" data-store-url="${baseUrl}">
    
    <!-- Hero Section - Minimalist -->
    <section class="bg-white">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12 lg:grid">
            <div class="mr-auto place-self-center lg:col-span-7">
                <h1 class="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl text-gray-900">
                    ${hero.headline}
                </h1>
                <p class="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl">
                    ${hero.subheadline}
                </p>
                <div class="mb-6">
                    <span class="text-3xl font-bold text-gray-900">${product.price} ${product.currency || 'LEI'}</span>
                </div>
                <button onclick="addToCart('${product.id}')" 
                        class="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-center text-white bg-black rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all">
                    ${hero.cta}
                    <svg class="w-5 h-5 ml-2 -mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
            <div class="lg:mt-0 lg:col-span-5 lg:flex">
                <img src="${product.image || 'https://via.placeholder.com/500'}" 
                     alt="${product.name}"
                     class="rounded-lg shadow-xl">
            </div>
        </div>
    </section>

    <!-- Description Section -->
    <section class="bg-gray-50">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
            <div class="max-w-3xl mx-auto text-center">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900">
                    Despre Produs
                </h2>
                <p class="mb-6 text-gray-500 md:text-lg">
                    ${description}
                </p>
            </div>
        </div>
    </section>

    <!-- Benefits Section - 3 Columns -->
    <section class="bg-white">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
            <div class="max-w-screen-md mb-8 lg:mb-16 mx-auto text-center">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900">
                    De Ce Să Alegi Acest Produs?
                </h2>
            </div>
            <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:space-y-0">
                ${benefits.map(benefit => `
                <div class="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                    <div class="flex justify-center items-center mb-4 w-10 h-10 rounded-full bg-gray-100">
                        <span class="text-2xl">${benefit.icon}</span>
                    </div>
                    <h3 class="mb-2 text-xl font-bold text-gray-900">${benefit.title}</h3>
                    <p class="text-gray-500">${benefit.description}</p>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- FAQ Section - Accordion -->
    <section class="bg-gray-50">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
            <h2 class="mb-8 text-3xl font-extrabold tracking-tight text-center text-gray-900">
                Întrebări Frecvente
            </h2>
            <div class="max-w-3xl mx-auto">
                ${faq.map((item, index) => `
                <div class="mb-4">
                    <button onclick="toggleFAQ(${index})" 
                            class="flex justify-between items-center w-full p-5 font-medium text-left text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                        <span>${item.question}</span>
                        <svg class="w-6 h-6 shrink-0 transition-transform" id="faq-icon-${index}" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                    </button>
                    <div id="faq-content-${index}" class="hidden p-5 border border-t-0 border-gray-200 bg-white">
                        <p class="text-gray-500">${item.answer}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-white">
        <div class="max-w-screen-xl px-4 py-8 mx-auto lg:py-16">
            <div class="max-w-screen-md mx-auto text-center">
                <h2 class="mb-4 text-3xl font-extrabold tracking-tight text-gray-900">
                    Gata Să Cumperi?
                </h2>
                <p class="mb-8 text-gray-500 md:text-lg">
                    Comandă acum și primești produsul în cel mai scurt timp!
                </p>
                <button onclick="addToCart('${product.id}')" 
                        class="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-center text-white bg-black rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 transition-all">
                    ${hero.cta}
                </button>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-50">
        <div class="max-w-screen-xl px-4 py-8 mx-auto">
            <div class="text-center text-gray-500">
                <p>&copy; ${new Date().getFullYear()} Toate drepturile rezervate.</p>
            </div>
        </div>
    </footer>

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
    </script>
</body>
</html>
  `.trim();
}

module.exports = { generateMinimalistTemplate };
