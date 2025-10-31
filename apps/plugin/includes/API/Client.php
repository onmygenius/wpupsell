<?php
namespace UpsellAI\API;

class Client {
    
    private $api_url;
    private $api_key;
    private $store_id;
    
    public function __construct() {
        $this->api_url = UPSELLAI_API_URL;
        $this->api_key = get_option('upsellai_api_key', '');
        $this->store_id = get_option('upsellai_store_id', '');
        
        // Sync products on product save
        add_action('woocommerce_update_product', [$this, 'sync_product'], 10, 1);
        add_action('woocommerce_new_product', [$this, 'sync_product'], 10, 1);
    }
    
    /**
     * Get AI recommendations for a product
     */
    public function get_recommendations($product_id, $current_product, $available_products, $user_id = null) {
        if (empty($this->api_key) || empty($this->store_id)) {
            return ['error' => 'API key or Store ID not configured'];
        }
        
        $response = wp_remote_post($this->api_url . '/recommendations', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => json_encode([
                'storeId' => $this->store_id,
                'productId' => (string) $product_id,
                'productName' => $current_product->get_name(),
                'productCategory' => $this->get_product_category($current_product),
                'productPrice' => (float) $current_product->get_price(),
                'availableProducts' => $available_products,
                'userId' => $user_id ?: 'guest_' . wp_generate_password(8, false),
            ]),
            'timeout' => 30, // Increased timeout for AI processing
        ]);
        
        if (is_wp_error($response)) {
            error_log('UpSell AI API Error: ' . $response->get_error_message());
            return ['error' => $response->get_error_message()];
        }
        
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        
        return $data;
    }
    
    /**
     * Track conversion
     */
    public function track_conversion($recommendation_id, $product_id, $converted = true, $revenue = 0, $user_id = null) {
        if (empty($this->api_key) || empty($this->store_id)) {
            return false;
        }
        
        $response = wp_remote_post($this->api_url . '/conversion', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => json_encode([
                'storeId' => $this->store_id,
                'recommendationId' => $recommendation_id,
                'productId' => (string) $product_id,
                'converted' => $converted,
                'revenue' => (float) $revenue,
                'userId' => $user_id ?: 'guest',
            ]),
            'timeout' => 10,
        ]);
        
        if (is_wp_error($response)) {
            error_log('UpSell AI Conversion Tracking Error: ' . $response->get_error_message());
            return false;
        }
        
        return true;
    }
    
    /**
     * Sync product to API
     */
    public function sync_product($product_id) {
        $product = wc_get_product($product_id);
        
        if (!$product) {
            return;
        }
        
        // Prepare product data
        $product_data = [
            'productId' => (string) $product_id,
            'name' => $product->get_name(),
            'price' => (float) $product->get_price(),
            'category' => $this->get_product_category($product),
            'description' => wp_trim_words($product->get_description(), 50),
            'image' => wp_get_attachment_url($product->get_image_id()),
            'url' => get_permalink($product_id),
        ];
        
        // Send to API (we'll create a sync endpoint later)
        // For now, products will be synced when recommendations are requested
        
        return $product_data;
    }
    
    /**
     * Get primary product category
     */
    private function get_product_category($product) {
        $categories = $product->get_category_ids();
        
        if (empty($categories)) {
            return 'uncategorized';
        }
        
        $category = get_term($categories[0], 'product_cat');
        
        return $category ? $category->name : 'uncategorized';
    }
    
    /**
     * Sync all products (bulk)
     */
    public function sync_all_products() {
        $products = wc_get_products([
            'limit' => -1,
            'status' => 'publish',
        ]);
        
        $synced = 0;
        
        foreach ($products as $product) {
            $this->sync_product($product->get_id());
            $synced++;
        }
        
        return $synced;
    }
}
