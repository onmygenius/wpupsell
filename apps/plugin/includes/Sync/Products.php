<?php
namespace UpsellAI\Sync;

/**
 * Products Sync
 * Syncs WooCommerce products to UpSell AI API
 */
class Products {
    private $api_url;
    private $api_key;
    
    public function __construct() {
        $this->api_url = UPSELLAI_API_URL;
        $this->api_key = get_option('upsellai_api_key');
        
        // Hook into settings save
        add_action('update_option_upsellai_api_key', [$this, 'trigger_sync'], 10, 2);
        
        // Add admin action for manual sync
        add_action('admin_post_upsellai_sync_products', [$this, 'manual_sync']);
        
        // Schedule daily sync
        if (!wp_next_scheduled('upsellai_daily_sync')) {
            wp_schedule_event(time(), 'daily', 'upsellai_daily_sync');
        }
        add_action('upsellai_daily_sync', [$this, 'sync_products']);
    }
    
    /**
     * Trigger sync when API key is saved
     */
    public function trigger_sync($old_value, $new_value) {
        if ($new_value && $new_value !== $old_value) {
            error_log('UpSell AI: API key saved, triggering product sync...');
            $this->sync_products();
        }
    }
    
    /**
     * Manual sync from admin
     */
    public function manual_sync() {
        check_admin_referer('upsellai_sync_products');
        
        $result = $this->sync_products();
        
        if ($result['success']) {
            wp_redirect(add_query_arg([
                'page' => 'upsellai-settings',
                'sync' => 'success',
                'synced' => $result['synced']
            ], admin_url('admin.php')));
        } else {
            wp_redirect(add_query_arg([
                'page' => 'upsellai-settings',
                'sync' => 'error',
                'message' => urlencode($result['message'])
            ], admin_url('admin.php')));
        }
        exit;
    }
    
    /**
     * Sync all products to API
     */
    public function sync_products() {
        if (empty($this->api_key)) {
            error_log('UpSell AI: Cannot sync - API key not configured');
            return [
                'success' => false,
                'message' => 'API key or Store ID not configured'
            ];
        }
        
        error_log('UpSell AI: Starting product sync...');
        
        // Get all published products
        $args = [
            'limit' => -1,
            'status' => 'publish',
            'type' => ['simple', 'variable'],
        ];
        
        $products = wc_get_products($args);
        error_log('UpSell AI: Found ' . count($products) . ' products to sync');
        
        // Format products for API
        $formatted_products = [];
        foreach ($products as $product) {
            $formatted_products[] = [
                'id' => (string) $product->get_id(),
                'name' => $product->get_name(),
                'description' => $product->get_short_description() ?: $product->get_description(),
                'category' => $this->get_product_category($product),
                'price' => (float) $product->get_price(),
                'currency' => get_woocommerce_currency(), // Get store currency (USD, EUR, RON, etc.)
                'stock' => (int) $product->get_stock_quantity(),
                'image' => wp_get_attachment_url($product->get_image_id()),
                'url' => get_permalink($product->get_id()),
                'enabled' => true,
            ];
        }
        
        error_log('UpSell AI: Formatted ' . count($formatted_products) . ' products');
        error_log('UpSell AI: First product: ' . json_encode($formatted_products[0] ?? []));
        error_log('UpSell AI: Sending to API: ' . $this->api_url . '/products');
        
        // Send to API
        $response = wp_remote_post($this->api_url . '/products', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->api_key,
            ],
            'body' => json_encode([
                'action' => 'sync',
                'apiKey' => $this->api_key,
                'products' => $formatted_products,
            ]),
            'timeout' => 60,
        ]);
        
        if (is_wp_error($response)) {
            error_log('UpSell AI: Sync error - ' . $response->get_error_message());
            return [
                'success' => false,
                'message' => $response->get_error_message()
            ];
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($status_code === 200 && isset($body['success']) && $body['success']) {
            error_log('UpSell AI: Successfully synced ' . $body['synced'] . ' products');
            
            // Update last sync time
            update_option('upsellai_last_product_sync', time());
            
            return [
                'success' => true,
                'synced' => $body['synced'],
                'message' => 'Products synced successfully'
            ];
        } else {
            error_log('UpSell AI: Sync failed - ' . json_encode($body));
            return [
                'success' => false,
                'message' => $body['message'] ?? 'Unknown error'
            ];
        }
    }
    
    /**
     * Get product category
     */
    private function get_product_category($product) {
        $categories = $product->get_category_ids();
        
        if (empty($categories)) {
            return 'Uncategorized';
        }
        
        $category = get_term($categories[0], 'product_cat');
        return $category && !is_wp_error($category) ? $category->name : 'Uncategorized';
    }
}
