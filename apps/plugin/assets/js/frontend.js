/**
 * UpSell AI Frontend JavaScript
 * Pure Vanilla JS - No dependencies
 * Works with any WordPress theme
 */

(function() {
    'use strict';
    
    // State
    let state = {
        loading: false,
        recommendations: [],
        error: null,
        recommendationId: null,
        exitIntentShown: false,
        scrollTriggered: false,
        popupShown: false
    };
    
    // DOM Elements
    let container, loadingEl, recommendationsEl, errorEl;
    
    // Initialize when DOM is ready
    function init() {
        container = document.getElementById('upsellai-recommendations');
        if (!container) return;
        
        loadingEl = container.querySelector('.upsellai-loading');
        recommendationsEl = container.querySelector('.upsellai-recommendations');
        errorEl = container.querySelector('.upsellai-error');
        
        loadRecommendations();
    }
    
    // Load recommendations
    async function loadRecommendations() {
            console.log('🚀 UpSell AI: ========================================');
            console.log('🚀 UpSell AI: Starting loadRecommendations()');
            console.log('🚀 UpSell AI: AJAX URL:', upsellaiData.ajaxUrl);
            console.log('🚀 UpSell AI: Product ID:', upsellaiData.productId);
            console.log('🚀 UpSell AI: Store ID:', upsellaiData.storeId);
            console.log('🚀 UpSell AI: Nonce:', upsellaiData.nonce);
            
            state.loading = true;
            state.error = null;
            showLoading();
            
            try {
                console.log('🚀 UpSell AI: Sending AJAX request...');
                
                const requestBody = new URLSearchParams({
                    action: 'upsellai_get_recommendations',
                    nonce: upsellaiData.nonce,
                    product_id: upsellaiData.productId,
                });
                
                console.log('🚀 UpSell AI: Request body:', requestBody.toString());
                
                const response = await fetch(upsellaiData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: requestBody,
                });
                
                console.log('🚀 UpSell AI: Response received!');
                console.log('🚀 UpSell AI: Response status:', response.status);
                console.log('🚀 UpSell AI: Response statusText:', response.statusText);
                console.log('🚀 UpSell AI: Response headers:', [...response.headers.entries()]);
                
                const responseText = await response.text();
                console.log('🚀 UpSell AI: Response text (raw):', responseText);
                
                let data;
                try {
                    data = JSON.parse(responseText);
                    console.log('🚀 UpSell AI: Response JSON parsed:', data);
                } catch (e) {
                    console.error('🚀 UpSell AI: ❌ JSON parse error:', e);
                    throw new Error('Invalid JSON response: ' + responseText.substring(0, 100));
                }
                
                if (data.success) {
                    console.log('🚀 UpSell AI: ✅ Success!');
                    state.recommendations = data.data.recommendations || [];
                    state.recommendationId = data.data.recommendation_id;
                    
                    console.log('🚀 UpSell AI: Recommendations count:', state.recommendations.length);
                    console.log('🚀 UpSell AI: Recommendation ID:', state.recommendationId);
                    console.log('🚀 UpSell AI: Recommendations:', state.recommendations);
                    
                    if (state.recommendations.length > 0) {
                        console.log('🚀 UpSell AI: Rendering recommendations...');
                        renderRecommendations();
                        trackImpression();
                    } else {
                        console.log('🚀 UpSell AI: No recommendations to show');
                        hideLoading();
                    }
                } else {
                    console.error('🚀 UpSell AI: ❌ Error from server');
                    console.error('🚀 UpSell AI: Error message:', data.data?.message);
                    state.error = data.data?.message || 'Failed to load recommendations';
                    showError();
                }
            } catch (error) {
                console.error('🚀 UpSell AI: ❌ EXCEPTION CAUGHT');
                console.error('🚀 UpSell AI: Error type:', error.constructor.name);
                console.error('🚀 UpSell AI: Error message:', error.message);
                console.error('🚀 UpSell AI: Error stack:', error.stack);
                state.error = 'Failed to load recommendations: ' + error.message;
                showError();
            } finally {
                state.loading = false;
                console.log('🚀 UpSell AI: ======================================== END');
            }
    }
    
    // Frequency cap removed - no daily limit
    
    // Render recommendations with smart triggers
    function renderRecommendations() {
        hideLoading();
        
        // Check if user added to cart recently (within 10 seconds)
        const lastAddedToCart = sessionStorage.getItem('upsellai_last_added_to_cart');
        if (lastAddedToCart) {
            const timeSinceAdded = Date.now() - parseInt(lastAddedToCart);
            const cooldownTime = 10 * 1000; // 10 seconds
            
            if (timeSinceAdded < cooldownTime) {
                const remainingSeconds = Math.ceil((cooldownTime - timeSinceAdded) / 1000);
                console.log(`🚀 UpSell AI: Pop-up suppressed. Cooldown: ${remainingSeconds}s`);
                return;
            } else {
                sessionStorage.removeItem('upsellai_last_added_to_cart');
            }
        }
        
        // Setup smart triggers
        setupSmartTriggers();
    }
    
    // Setup smart triggers: Exit Intent, Scroll, Time
    function setupSmartTriggers() {
        // Exit Intent
        document.addEventListener('mouseleave', handleExitIntent);
        
        // Scroll Trigger (50%)
        window.addEventListener('scroll', handleScrollTrigger);
        
        // Fallback: Time-based (5 seconds)
        setTimeout(() => {
            if (!state.popupShown) {
                console.log('🚀 UpSell AI: Time trigger (5s)');
                showPopup();
            }
        }, 5000);
    }
    
    // Exit Intent Handler
    function handleExitIntent(e) {
        if (state.exitIntentShown || state.popupShown) return;
        
        // Check if mouse is leaving from top
        if (e.clientY <= 0) {
            state.exitIntentShown = true;
            console.log('🚀 UpSell AI: Exit intent detected!');
            showPopup('exit');
            document.removeEventListener('mouseleave', handleExitIntent);
        }
    }
    
    // Scroll Trigger Handler
    function handleScrollTrigger() {
        if (state.scrollTriggered || state.popupShown) return;
        
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent >= 50) {
            state.scrollTriggered = true;
            console.log('🚀 UpSell AI: Scroll trigger (50%)');
            showPopup('scroll');
            window.removeEventListener('scroll', handleScrollTrigger);
        }
    }
    
    // Show pop-up with recommendations
    function showPopup(trigger = 'time') {
        if (state.popupShown) return;
        
        state.popupShown = true;
        
        console.log(`🚀 UpSell AI: Showing popup (trigger: ${trigger})`);
        
        // Create pop-up overlay
        const overlay = document.createElement('div');
        overlay.className = 'upsellai-popup-overlay';
        overlay.id = 'upsellai-popup';
        
        // Build pop-up HTML
        let popupHTML = `
            <div class="upsellai-popup-container">
                <button class="upsellai-popup-close" onclick="document.getElementById('upsellai-popup').remove()">×</button>
                <div class="upsellai-popup-content">
                    <h2 class="upsellai-popup-title">🎁 Ofertă Specială Pentru Tine!</h2>
                    <p class="upsellai-popup-subtitle">Am găsit ceva perfect pentru tine</p>
        `;
        
        // Add each product
        state.recommendations.forEach(product => {
            popupHTML += `
                <div class="upsellai-popup-product">
                    <a href="${product.url}" target="_blank" style="display: block; text-decoration: none;">
                        <img src="${product.image}" alt="${product.name}" class="upsellai-popup-product-image" style="cursor: pointer;" />
                    </a>
                    <a href="${product.url}" target="_blank" style="text-decoration: none; color: inherit;">
                        <h3 class="upsellai-popup-product-name" style="cursor: pointer;">${product.name}</h3>
                    </a>
                    <p class="upsellai-popup-product-price">$${product.price}</p>
                    <p class="upsellai-popup-product-reason">${product.reason}</p>
                    <button class="upsellai-popup-add-to-cart" data-product-id="${product.id}" data-price="${product.price}">
                        Adaugă în Coș
                    </button>
                </div>
            `;
        });
        
        popupHTML += `
                </div>
            </div>
        `;
        
        overlay.innerHTML = popupHTML;
        document.body.appendChild(overlay);
        
        // Show with animation
        setTimeout(() => {
            overlay.classList.add('active');
            console.log('✅ UpSell AI: Pop-up displayed');
            
            // Track impression for each product
            state.recommendations.forEach(product => {
                trackEvent('impression', product.id, product.name);
            });
        }, 10);
        
        // Close on overlay click (just close, don't suppress future pop-ups)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        // Close button (just close, don't suppress future pop-ups)
        const closeBtn = overlay.querySelector('.upsellai-popup-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                overlay.remove();
            };
        }
        
        // Attach event listeners to buttons
        const buttons = overlay.querySelectorAll('.upsellai-popup-add-to-cart');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = button.dataset.productId;
                const price = button.dataset.price;
                
                // Track click
                const product = state.recommendations.find(r => r.id === productId);
                if (product) {
                    trackEvent('click', productId, product.name);
                }
                
                handleAddToCart(productId, price);
            });
        });
    }
    
    // Handle add to cart
    async function handleAddToCart(productId, price) {
        const button = document.querySelector(`[data-product-id="${productId}"]`);
        if (!button) return;
        
        button.disabled = true;
        button.textContent = 'Adding...';
        
        try {
            const formData = new FormData();
            formData.append('product_id', productId);
            formData.append('quantity', '1');
            formData.append('upsellai_recommendation_id', state.recommendationId);
            
            const response = await fetch('/?wc-ajax=add_to_cart', {
                method: 'POST',
                body: formData,
            });
            
            const data = await response.json();
            
            if (data.error) {
                alert('Failed to add product to cart');
            } else {
                if (typeof jQuery !== 'undefined') {
                    jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash]);
                }
                
                alert('✅ Produs adăugat în coș!');
                
                // Track conversion
                await trackConversion(productId, price, true);
                
                // Save timestamp when user added to cart
                sessionStorage.setItem('upsellai_last_added_to_cart', Date.now().toString());
                console.log('🚀 UpSell AI: User added to cart. Pop-ups suppressed for 10 seconds.');
                
                // Close pop-up
                const popup = document.getElementById('upsellai-popup');
                if (popup) {
                    popup.remove();
                }
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Eroare la adăugarea în coș');
        } finally {
            button.disabled = false;
            button.textContent = 'Adaugă în Coș';
        }
    }
    
    // Track impression
    async function trackImpression() {
            try {
                await fetch(upsellaiData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'upsellai_track_conversion',
                        nonce: upsellaiData.nonce,
                        recommendation_id: state.recommendationId,
                        product_id: upsellaiData.productId,
                        converted: false,
                        revenue: 0,
                    }),
                });
            } catch (error) {
                console.error('Track impression error:', error);
            }
    }
    
    // Track funnel events
    async function trackEvent(eventType, productId = null, productName = null) {
        try {
            console.log('📊 Tracking event:', { eventType, productId, productName });
            
            await fetch('https://wpupsell-dashboard.vercel.app/api/tracking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId: upsellaiData.storeId,
                    eventType,
                    productId: productId ? productId.toString() : null,
                    productName: productName || null,
                }),
            });
        } catch (error) {
            console.error('Track event error:', error);
        }
    }
    
    // Track conversion
    async function trackConversion(productId, price, converted) {
        try {
            console.log('📊 Tracking conversion:', { productId, price, converted });
            
            // Get product name from recommendations
            const product = state.recommendations.find(r => r.id === productId);
            const productName = product ? product.name : 'Unknown Product';
            
            // Send to our API
            const response = await fetch('https://wpupsell-dashboard.vercel.app/api/conversions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    storeId: upsellaiData.storeId,
                    productId: productId.toString(),
                    productName: productName,
                    price: parseFloat(price),
                    converted: converted,
                }),
            });
            
            const data = await response.json();
            if (data.success) {
                console.log('✅ Conversion tracked successfully');
            } else {
                console.error('❌ Failed to track conversion:', data.message);
            }
        } catch (error) {
            console.error('Track conversion error:', error);
        }
    }
    
    // UI helpers
    function showLoading() {
        if (loadingEl) loadingEl.style.display = 'block';
        if (recommendationsEl) recommendationsEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';
    }
    
    function hideLoading() {
        if (loadingEl) loadingEl.style.display = 'none';
    }
    
    function showError() {
        if (loadingEl) loadingEl.style.display = 'none';
        if (recommendationsEl) recommendationsEl.style.display = 'none';
        if (errorEl) {
            errorEl.textContent = state.error;
            errorEl.style.display = 'block';
        }
    }
    
    // Initialize when DOM is ready AND upsellaiData is available
    function tryInit() {
        // Check if upsellaiData is available
        if (typeof window.upsellaiData === 'undefined') {
            // Wait a bit and try again
            setTimeout(tryInit, 100);
            return;
        }
        
        // Data is available, initialize
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    // Start trying to initialize
    tryInit();
})();
