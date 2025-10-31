<?php
/**
 * Plugin Name: WooBoost AI - Upsell & Cross-sell
 * Plugin URI: https://github.com/onmygenius/wpupsell
 * Description: AI-powered upsell and cross-sell recommendations for WooCommerce
 * Version: 0.1.0
 * Author: WPUpsell
 * Author URI: https://wpupsell.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: wooboost-ai
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * WC requires at least: 8.0
 * WC tested up to: 9.0
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WOOBOOST_VERSION', '0.1.0');
define('WOOBOOST_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WOOBOOST_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WOOBOOST_API_URL', 'https://api.wpupsell.com');

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p>';
        echo __('WooBoost AI requires WooCommerce to be installed and active.', 'wooboost-ai');
        echo '</p></div>';
    });
    return;
}

// Include required files
require_once WOOBOOST_PLUGIN_DIR . 'includes/class-api-client.php';
require_once WOOBOOST_PLUGIN_DIR . 'includes/class-recommendations.php';
require_once WOOBOOST_PLUGIN_DIR . 'includes/class-tracking.php';
require_once WOOBOOST_PLUGIN_DIR . 'includes/class-settings.php';

// Initialize plugin
function wooboost_init() {
    // Initialize classes
    WooBoost_API_Client::instance();
    WooBoost_Recommendations::instance();
    WooBoost_Tracking::instance();
    WooBoost_Settings::instance();
}
add_action('plugins_loaded', 'wooboost_init');

// Activation hook
register_activation_hook(__FILE__, function() {
    // Create options
    add_option('wooboost_api_key', '');
    add_option('wooboost_settings', [
        'display_type' => 'popup',
        'enable_upsell' => true,
        'enable_cross_sell' => true,
        'locations' => ['product', 'cart', 'checkout'],
        'discount_percent' => 5
    ]);
    
    flush_rewrite_rules();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
