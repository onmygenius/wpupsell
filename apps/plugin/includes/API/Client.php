<?php
namespace UpsellAI\API;

class Client {
    
    private $api_url;
    private $api_key;
    
    public function __construct() {
        $this->api_url = UPSELLAI_API_URL;
        $this->api_key = get_option('upsellai_api_key', '');
        
        // Sync products on product save
        add_action('woocommerce_update_product', [$this, 'sync_product'], 10, 1);
        add_action('woocommerce_new_product', [$this, 'sync_product'], 10, 1);
    }
    
    /**
     * Get AI recommendations for a product
     */
    public function get_recommendations($product_id, $current_product, $available_products, $user_id = null) {
        if (empty($this->api_key)) {
            error_log('UpSell AI: API key not configured');
            return ['error' => 'API key not configured'];
        }
        
        $request_data = [
            'apiKey' => $this->api_key,
            'productId' => (string) $product_id,
            'productName' => $current_product->get_name(),
            'productCategory' => $this->get_product_category($current_product),
            'productPrice' => (float) $current_product->get_price(),
            'availableProducts' => $available_products,
            'userId' => $user_id ?: 'guest_' . wp_generate_password(8, false),
        ];
        
        error_log('UpSell AI: ========================================');
        error_log('UpSell AI: Sending request to ' . $this->api_url . '/recommendations');
        error_log('UpSell AI: Request data - Products count: ' . count($available_products));
        error_log('UpSell AI: Full request body: ' . json_encode($request_data, JSON_PRETTY_PRINT));
        error_log('UpSell AI: API Key (first 10 chars): ' . substr($this->api_key, 0, 10) . '...');
        
        $response = wp_remote_post($this->api_url . '/recommendations', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => json_encode($request_data),
            'timeout' => 30,
        ]);
        
        error_log('UpSell AI: Request sent, waiting for response...');
        
        if (is_wp_error($response)) {
            error_log('UpSell AI API Error: ' . $response->get_error_message());
            return ['error' => $response->get_error_message()];
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_headers = wp_remote_retrieve_headers($response);
        $body = wp_remote_retrieve_body($response);
        
        error_log('UpSell AI: ========================================');
        error_log('UpSell AI: Response received!');
        error_log('UpSell AI: Response status: ' . $status_code);
        error_log('UpSell AI: Response headers: ' . print_r($response_headers->getAll(), true));
        error_log('UpSell AI: Response body (raw): ' . $body);
        error_log('UpSell AI: Response body length: ' . strlen($body) . ' bytes');
        
        if ($status_code !== 200) {
            error_log('UpSell AI: ❌ ERROR - API returned status ' . $status_code);
            error_log('UpSell AI: Error body: ' . $body);
            
            // Check for Vercel-specific errors
            if (isset($response_headers['x-vercel-error'])) {
                error_log('UpSell AI: Vercel Error: ' . $response_headers['x-vercel-error']);
            }
            if (isset($response_headers['x-vercel-id'])) {
                error_log('UpSell AI: Vercel Request ID: ' . $response_headers['x-vercel-id']);
            }
            
            return ['error' => 'API returned status ' . $status_code . ': ' . substr($body, 0, 200)];
        }
        
        error_log('UpSell AI: Attempting to decode JSON...');
        $data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('UpSell AI: ❌ JSON decode error: ' . json_last_error_msg());
            error_log('UpSell AI: Raw body that failed to decode: ' . $body);
            return ['error' => 'Invalid JSON response: ' . json_last_error_msg()];
        }
        
        error_log('UpSell AI: ✅ JSON decoded successfully');
        error_log('UpSell AI: Response data structure: ' . print_r(array_keys($data), true));
        error_log('UpSell AI: Success - Received ' . (isset($data['recommendations']) ? count($data['recommendations']) : 0) . ' recommendations');
        
        if (isset($data['recommendations'])) {
            error_log('UpSell AI: Recommendations IDs: ' . implode(', ', array_column($data['recommendations'], 'id')));
        }
        
        error_log('UpSell AI: ========================================');
        
        return $data;
    }
    
    /**
     * Track conversion
     */
    public function track_conversion($recommendation_id, $product_id, $converted = true, $revenue = 0, $user_id = null) {
        if (empty($this->api_key)) {
            error_log('UpSell AI: Cannot track conversion - API key not configured');
            return false;
        }
        
        error_log('UpSell AI: Tracking conversion - Product: ' . $product_id . ', Converted: ' . ($converted ? 'yes' : 'no') . ', Revenue: $' . $revenue);
        
        $response = wp_remote_post($this->api_url . '/conversion', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => json_encode([
                'apiKey' => $this->api_key,
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
        
        $status_code = wp_remote_retrieve_response_code($response);
        if ($status_code !== 200) {
            error_log('UpSell AI: Conversion tracking failed with status ' . $status_code);
            return false;
        }
        
        error_log('UpSell AI: Conversion tracked successfully');
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
