<?php
/**
 * Plugin Name: UpSell AI - AI Recommendations
 * Plugin URI: https://upsellai.net
 * Description: Increase WooCommerce sales by 25-40% with AI-powered upsell and cross-sell recommendations
 * Version: 1.0.6
 * Author: UpSell AI
 * Author URI: https://upsellai.net
 * Text Domain: upsell-ai
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * WC requires at least: 8.0
 * WC tested up to: 9.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('UPSELLAI_VERSION', '1.0.6');
define('UPSELLAI_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UPSELLAI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('UPSELLAI_API_URL', 'https://wpupsell-dashboard.vercel.app/api');

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    add_action('admin_notices', function() {
        echo '<div class="error"><p><strong>UpSell AI</strong> requires WooCommerce to be installed and active.</p></div>';
    });
    return;
}

// Autoload classes
spl_autoload_register(function ($class) {
    $prefix = 'UpsellAI\\';
    $base_dir = UPSELLAI_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

// Initialize plugin
function upsellai_init() {
    // Load text domain
    load_plugin_textdomain('upsell-ai', false, dirname(plugin_basename(__FILE__)) . '/languages');
    
    // Initialize main classes
    new UpsellAI\Admin\Settings();
    new UpsellAI\API\Client();
    new UpsellAI\Frontend\Recommendations();
    new UpsellAI\Tracking\Conversion();
    new UpsellAI\Sync\Products();
}
add_action('plugins_loaded', 'upsellai_init');

// Activation hook
register_activation_hook(__FILE__, function() {
    // Create default options
    if (!get_option('upsellai_api_key')) {
        add_option('upsellai_api_key', '');
    }
    if (!get_option('upsellai_store_id')) {
        add_option('upsellai_store_id', 'store_' . wp_generate_password(12, false));
    }
    if (!get_option('upsellai_enabled')) {
        add_option('upsellai_enabled', '1');
    }
    
    // Flush rewrite rules
    flush_rewrite_rules();
});

// Deactivation hook
register_deactivation_hook(__FILE__, function() {
    flush_rewrite_rules();
});
