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
        recommendationId: null
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
    
    // Render recommendations
    function renderRecommendations() {
        if (!recommendationsEl) return;
        
        hideLoading();
        
        let html = '<div class="upsellai-grid">';
        
        state.recommendations.forEach(product => {
            html += `
                <div class="upsellai-product-card" data-product-id="${product.id}">
                    <div class="upsellai-product-image">
                        <img src="${product.image}" alt="${product.name}" />
                    </div>
                    <div class="upsellai-product-info">
                        <h4 class="upsellai-product-name">${product.name}</h4>
                        <p class="upsellai-product-price">$${product.price}</p>
                        <p class="upsellai-product-reason">${product.reason}</p>
                    </div>
                    <button class="upsellai-add-to-cart" data-product-id="${product.id}" data-price="${product.price}">
                        Add to Cart
                    </button>
                </div>
            `;
        });
        
        html += '</div>';
        recommendationsEl.innerHTML = html;
        recommendationsEl.style.display = 'block';
        
        // Attach event listeners
        const buttons = recommendationsEl.querySelectorAll('.upsellai-add-to-cart');
        buttons.forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    // Handle add to cart
    async function handleAddToCart(e) {
        const button = e.target;
        if (button.disabled) return;
        
        const productId = button.dataset.productId;
        const price = button.dataset.price;
        
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
                await trackConversion(productId, price, true);
                
                if (typeof jQuery !== 'undefined') {
                    jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash]);
                }
                
                alert('✅ Product added to cart!');
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            alert('Failed to add product to cart');
        } finally {
            button.disabled = false;
            button.textContent = 'Add to Cart';
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
    
    // Track conversion
    async function trackConversion(productId, price, converted) {
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
                        product_id: productId,
                        converted: converted,
                        revenue: price,
                    }),
                });
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
