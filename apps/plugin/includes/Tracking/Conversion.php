<?php
namespace UpsellAI\Tracking;

use UpsellAI\API\Client;

class Conversion {
    
    private $api_client;
    
    public function __construct() {
        $this->api_client = new Client();
        
        // Track when product is added to cart
        add_action('woocommerce_add_to_cart', [$this, 'track_add_to_cart'], 10, 6);
        
        // Track completed orders
        add_action('woocommerce_thankyou', [$this, 'track_order_completion'], 10, 1);
        
        // AJAX endpoint for tracking
        add_action('wp_ajax_upsellai_track_conversion', [$this, 'ajax_track_conversion']);
        add_action('wp_ajax_nopriv_upsellai_track_conversion', [$this, 'ajax_track_conversion']);
    }
    
    public function track_add_to_cart($cart_item_key, $product_id, $quantity, $variation_id, $variation, $cart_item_data) {
        // Check if this was from a recommendation
        if (isset($_POST['upsellai_recommendation_id'])) {
            $recommendation_id = sanitize_text_field($_POST['upsellai_recommendation_id']);
            
            $product = wc_get_product($product_id);
            $revenue = $product ? $product->get_price() * $quantity : 0;
            
            // Track conversion
            $this->api_client->track_conversion(
                $recommendation_id,
                $product_id,
                true,
                $revenue
            );
            
            // Store in session for later
            WC()->session->set('upsellai_last_recommendation', [
                'recommendation_id' => $recommendation_id,
                'product_id' => $product_id,
                'revenue' => $revenue,
            ]);
        }
    }
    
    public function track_order_completion($order_id) {
        if (!$order_id) {
            return;
        }
        
        $order = wc_get_order($order_id);
        
        if (!$order) {
            return;
        }
        
        // Check if there was a recommendation in the session
        $last_recommendation = WC()->session->get('upsellai_last_recommendation');
        
        if ($last_recommendation) {
            // Update conversion with final order data
            $this->api_client->track_conversion(
                $last_recommendation['recommendation_id'],
                $last_recommendation['product_id'],
                true,
                $last_recommendation['revenue'],
                $order->get_customer_id()
            );
            
            // Clear session
            WC()->session->__unset('upsellai_last_recommendation');
        }
    }
    
    public function ajax_track_conversion() {
        check_ajax_referer('upsellai_nonce', 'nonce');
        
        $recommendation_id = isset($_POST['recommendation_id']) ? sanitize_text_field($_POST['recommendation_id']) : '';
        $product_id = isset($_POST['product_id']) ? absint($_POST['product_id']) : 0;
        $converted = isset($_POST['converted']) ? (bool) $_POST['converted'] : false;
        $revenue = isset($_POST['revenue']) ? floatval($_POST['revenue']) : 0;
        
        if (!$recommendation_id || !$product_id) {
            wp_send_json_error(['message' => 'Missing required parameters']);
        }
        
        $result = $this->api_client->track_conversion(
            $recommendation_id,
            $product_id,
            $converted,
            $revenue
        );
        
        if ($result) {
            wp_send_json_success(['message' => 'Conversion tracked']);
        } else {
            wp_send_json_error(['message' => 'Failed to track conversion']);
        }
    }
}
