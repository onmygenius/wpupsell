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
        // Temporarily load on all pages for debugging
        // if (!is_product()) {
        //     return;
        // }
        
        // Plugin CSS
        wp_enqueue_style('upsellai-frontend', UPSELLAI_PLUGIN_URL . 'assets/css/frontend.css', [], UPSELLAI_VERSION);
        
        // Plugin JS (Vanilla JS - no jQuery dependency needed)
        wp_enqueue_script('upsellai-frontend', UPSELLAI_PLUGIN_URL . 'assets/js/frontend.js', [], UPSELLAI_VERSION, true);
        
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
        <div id="upsellai-recommendations" class="upsellai-container">
            
            <!-- Loading State -->
            <div class="upsellai-loading" style="display: none;">
                <div class="upsellai-spinner"></div>
                <p><?php _e('Loading AI recommendations...', 'upsellai'); ?></p>
            </div>
            
            <!-- Recommendations (will be populated by JavaScript) -->
            <div class="upsellai-recommendations" style="display: none;">
                <h3 class="upsellai-title">
                    🤖 <?php _e('Customers also bought', 'upsellai'); ?>
                </h3>
                <!-- Products will be inserted here by JavaScript -->
            </div>
            
            <!-- Error State -->
            <div class="upsellai-error" style="display: none;"></div>
        </div>
        <?php
    }
    
    public function ajax_get_recommendations() {
        check_ajax_referer('upsellai_nonce', 'nonce');
        
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
        
        error_log('UpSell AI: AJAX request for product ID: ' . $product_id);
        
        if (!$product_id) {
            error_log('UpSell AI: Invalid product ID');
            wp_send_json_error(['message' => 'Invalid product ID']);
        }
        
        // Get current product details
        $current_product = wc_get_product($product_id);
        if (!$current_product) {
            error_log('UpSell AI: Product not found: ' . $product_id);
            wp_send_json_error(['message' => 'Product not found']);
        }
        
        error_log('UpSell AI: Current product: ' . $current_product->get_name());
        
        // Get all products from WooCommerce
        $all_products = wc_get_products([
            'limit' => 50,
            'status' => 'publish',
            'exclude' => [$product_id], // Exclude current product
        ]);
        
        error_log('UpSell AI: Found ' . count($all_products) . ' available products');
        
        // Format products for API
        $available_products = [];
        foreach ($all_products as $product) {
            $available_products[] = [
                'id' => (string) $product->get_id(),
                'name' => $product->get_name(),
                'price' => (float) $product->get_price(),
                'category' => $this->get_product_category($product),
            ];
        }
        
        error_log('UpSell AI: Formatted ' . count($available_products) . ' products for API');
        
        // Get recommendations from API with all products
        error_log('UpSell AI: Calling API for recommendations...');
        
        $recommendations = $this->api_client->get_recommendations(
            $product_id,
            $current_product,
            $available_products
        );
        
        if (isset($recommendations['error'])) {
            error_log('UpSell AI: API returned error: ' . $recommendations['error']);
            wp_send_json_error(['message' => $recommendations['error']]);
        }
        
        error_log('UpSell AI: API response received: ' . print_r($recommendations, true));
        
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
        
        error_log('UpSell AI: Sending ' . count($formatted) . ' formatted recommendations to frontend');
        
        wp_send_json_success([
            'recommendations' => $formatted,
            'recommendation_id' => $recommendations['recommendation_id'] ?? null,
        ]);
    }
    
    private function get_product_category($product) {
        $categories = $product->get_category_ids();
        
        if (empty($categories)) {
            return 'uncategorized';
        }
        
        $category = get_term($categories[0], 'product_cat');
        
        return $category ? $category->name : 'uncategorized';
    }
}
