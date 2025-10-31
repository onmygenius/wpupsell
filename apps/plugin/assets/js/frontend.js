/**
 * WPUpsell Frontend JavaScript
 * Uses Alpine.js for reactivity
 */

function wpupsellRecommendations() {
    return {
        loading: false,
        recommendations: [],
        error: null,
        recommendationId: null,
        
        async loadRecommendations() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await fetch(wpupsellData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'wpupsell_get_recommendations',
                        nonce: wpupsellData.nonce,
                        product_id: wpupsellData.productId,
                    }),
                });
                
                const data = await response.json();
                
                if (data.success) {
                    this.recommendations = data.data.recommendations || [];
                    this.recommendationId = data.data.recommendation_id;
                    
                    // Track impression
                    if (this.recommendations.length > 0) {
                        this.trackImpression();
                    }
                } else {
                    this.error = data.data?.message || 'Failed to load recommendations';
                }
            } catch (error) {
                console.error('WPUpsell Error:', error);
                this.error = 'Failed to load recommendations';
            } finally {
                this.loading = false;
            }
        },
        
        async addToCart(product) {
            if (product.adding) return;
            
            product.adding = true;
            
            try {
                // Add to WooCommerce cart
                const formData = new FormData();
                formData.append('product_id', product.id);
                formData.append('quantity', '1');
                formData.append('wpupsell_recommendation_id', this.recommendationId);
                
                const response = await fetch('/?wc-ajax=add_to_cart', {
                    method: 'POST',
                    body: formData,
                });
                
                const data = await response.json();
                
                if (data.error) {
                    alert('Failed to add product to cart');
                } else {
                    // Track conversion
                    await this.trackConversion(product, true);
                    
                    // Trigger WooCommerce cart update
                    jQuery(document.body).trigger('added_to_cart', [data.fragments, data.cart_hash]);
                    
                    // Show success message
                    alert('✅ Product added to cart!');
                }
            } catch (error) {
                console.error('Add to cart error:', error);
                alert('Failed to add product to cart');
            } finally {
                product.adding = false;
            }
        },
        
        async trackImpression() {
            try {
                await fetch(wpupsellData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'wpupsell_track_conversion',
                        nonce: wpupsellData.nonce,
                        recommendation_id: this.recommendationId,
                        product_id: wpupsellData.productId,
                        converted: false,
                        revenue: 0,
                    }),
                });
            } catch (error) {
                console.error('Track impression error:', error);
            }
        },
        
        async trackConversion(product, converted) {
            try {
                await fetch(wpupsellData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'wpupsell_track_conversion',
                        nonce: wpupsellData.nonce,
                        recommendation_id: this.recommendationId,
                        product_id: product.id,
                        converted: converted,
                        revenue: product.price,
                    }),
                });
            } catch (error) {
                console.error('Track conversion error:', error);
            }
        }
    };
}
