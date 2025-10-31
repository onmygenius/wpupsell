<?php
namespace UpsellAI\Frontend;

use UpsellAI\API\Client;

class Recommendations {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new Client();
        
        // Add recommendations to product page
        add_action('woocommerce_after_single_product_summary', [$this, 'display_recommendations'], 15);
        
        // Enqueue frontend assets
        add_action('wp_enqueue_scripts', [$this, 'enqueue_assets']);
        
        // AJAX endpoint for getting recommendations
        add_action('wp_ajax_upsellai_get_recommendations', [$this, 'ajax_get_recommendations']);
        add_action('wp_ajax_nopriv_upsellai_get_recommendations', [$this, 'ajax_get_recommendations']);
    }
    
    public function enqueue_assets() {
        if (!is_product()) {
            return;
        }
        
        // Alpine.js for interactivity
        wp_enqueue_script('alpinejs', 'https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js', [], '3.0', true);
        
        // Plugin CSS
        wp_enqueue_style('upsellai-frontend', UPSELLAI_PLUGIN_URL . 'assets/css/frontend.css', [], UPSELLAI_VERSION);
        
        // Plugin JS
        wp_enqueue_script('upsellai-frontend', UPSELLAI_PLUGIN_URL . 'assets/js/frontend.js', ['jquery', 'alpinejs'], UPSELLAI_VERSION, true);
        
        // Localize script
        wp_localize_script('upsellai-frontend', 'upsellaiData', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('upsellai_nonce'),
            'productId' => get_the_ID(),
            'storeId' => get_option('upsellai_store_id'),
        ]);
    }
    
    public function display_recommendations() {
        if (!get_option('upsellai_enabled', '1')) {
            return;
        }
        
        $product_id = get_the_ID();
        
        ?>
        <div id="upsellai-recommendations" 
             x-data="upsellaiRecommendations()" 
             x-init="loadRecommendations()"
             class="upsellai-container">
            
            <!-- Loading State -->
            <div x-show="loading" class="upsellai-loading">
                <div class="upsellai-spinner"></div>
                <p><?php _e('Loading AI recommendations...', 'upsellai'); ?></p>
            </div>
            
            <!-- Recommendations -->
            <div x-show="!loading && recommendations.length > 0" 
                 x-cloak
                 class="upsellai-recommendations">
                
                <h3 class="upsellai-title">
                    🤖 <?php _e('Customers also bought', 'upsellai'); ?>
                </h3>
                
                <div class="upsellai-grid">
                    <template x-for="product in recommendations" :key="product.id">
                        <div class="upsellai-product-card">
                            <div class="upsellai-product-image">
                                <img :src="product.image" :alt="product.name" />
                            </div>
                            
                            <div class="upsellai-product-info">
                                <h4 class="upsellai-product-name" x-text="product.name"></h4>
                                <p class="upsellai-product-price" x-text="'$' + product.price"></p>
                                <p class="upsellai-product-reason" x-text="product.reason"></p>
                            </div>
                            
                            <button @click="addToCart(product)" 
                                    class="upsellai-add-to-cart"
                                    :disabled="product.adding">
                                <span x-show="!product.adding">
                                    <?php _e('Add to Cart', 'upsellai'); ?>
                                </span>
                                <span x-show="product.adding">
                                    <?php _e('Adding...', 'upsellai'); ?>
                                </span>
                            </button>
                        </div>
                    </template>
                </div>
            </div>
            
            <!-- Error State -->
            <div x-show="error" x-cloak class="upsellai-error">
                <p x-text="error"></p>
            </div>
        </div>
        <?php
    }
    
    public function ajax_get_recommendations() {
        check_ajax_referer('upsellai_nonce', 'nonce');
        
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
        
        if (!$product_id) {
            wp_send_json_error(['message' => 'Invalid product ID']);
        }
        
        // Get recommendations from API
        $recommendations = $this->api_client->get_recommendations($product_id);
        
        if (isset($recommendations['error'])) {
            wp_send_json_error(['message' => $recommendations['error']]);
        }
        
        // Format recommendations for frontend
        $formatted = [];
        
        if (isset($recommendations['recommendations'])) {
            foreach ($recommendations['recommendations'] as $rec) {
                $product = wc_get_product($rec['id']);
                
                if ($product) {
                    $formatted[] = [
                        'id' => $rec['id'],
                        'name' => $product->get_name(),
                        'price' => $product->get_price(),
                        'image' => wp_get_attachment_url($product->get_image_id()),
                        'url' => get_permalink($product->get_id()),
                        'reason' => $rec['reason'] ?? 'AI recommended',
                    ];
                }
            }
        }
        
        wp_send_json_success([
            'recommendations' => $formatted,
            'recommendation_id' => $recommendations['recommendation_id'] ?? null,
        ]);
    }
}
