<?php
namespace UpsellAI\Admin;

class Settings {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }
    
    public function add_menu_page() {
        add_menu_page(
            __('UpSell AI Settings', 'upsellai'),
            __('UpSell AI', 'upsellai'),
            'manage_options',
            'upsellai-settings',
            [$this, 'render_settings_page'],
            'dashicons-chart-line',
            56
        );
    }
    
    public function register_settings() {
        register_setting('upsellai_settings', 'upsellai_api_key');
        register_setting('upsellai_settings', 'upsellai_store_id');
        register_setting('upsellai_settings', 'upsellai_enabled');
        register_setting('upsellai_settings', 'upsellai_display_location');
        register_setting('upsellai_settings', 'upsellai_max_recommendations');
    }
    
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_upsellai-settings') {
            return;
        }
        
        wp_enqueue_style('upsellai-admin', UPSELLAI_PLUGIN_URL . 'assets/css/admin.css', [], UPSELLAI_VERSION);
        wp_enqueue_script('upsellai-admin', UPSELLAI_PLUGIN_URL . 'assets/js/admin.js', ['jquery'], UPSELLAI_VERSION, true);
    }
    
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save settings
        if (isset($_POST['upsellai_save_settings'])) {
            check_admin_referer('upsellai_settings_nonce');
            
            update_option('upsellai_api_key', sanitize_text_field($_POST['upsellai_api_key']));
            update_option('upsellai_enabled', isset($_POST['upsellai_enabled']) ? '1' : '0');
            update_option('upsellai_display_location', sanitize_text_field($_POST['upsellai_display_location']));
            update_option('upsellai_max_recommendations', absint($_POST['upsellai_max_recommendations']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'upsellai') . '</p></div>';
        }
        
        $api_key = get_option('upsellai_api_key', '');
        $store_id = get_option('upsellai_store_id', '');
        $enabled = get_option('upsellai_enabled', '1');
        $display_location = get_option('upsellai_display_location', 'product_page');
        $max_recommendations = get_option('upsellai_max_recommendations', '3');
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="upsellai-settings-container">
                <form method="post" action="">
                    <?php wp_nonce_field('upsellai_settings_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="upsellai_api_key"><?php _e('API Key', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="upsellai_api_key" 
                                       name="upsellai_api_key" 
                                       value="<?php echo esc_attr($api_key); ?>" 
                                       class="regular-text" 
                                       placeholder="sk_live_..." />
                                <p class="description">
                                    <?php _e('Get your API key from', 'upsellai'); ?> 
                                    <a href="https://upsellai-dashboard.vercel.app/settings" target="_blank">UpSell AI Dashboard</a>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="upsellai_store_id"><?php _e('Store ID', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="upsellai_store_id" 
                                       name="upsellai_store_id" 
                                       value="<?php echo esc_attr($store_id); ?>" 
                                       class="regular-text" 
                                       readonly />
                                <p class="description">
                                    <?php _e('Your unique store identifier (auto-generated)', 'upsellai'); ?>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="upsellai_enabled"><?php _e('Enable Recommendations', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" 
                                           id="upsellai_enabled" 
                                           name="upsellai_enabled" 
                                           value="1" 
                                           <?php checked($enabled, '1'); ?> />
                                    <?php _e('Show AI recommendations to customers', 'upsellai'); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="upsellai_display_location"><?php _e('Display Location', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <select id="upsellai_display_location" name="upsellai_display_location">
                                    <option value="product_page" <?php selected($display_location, 'product_page'); ?>>
                                        <?php _e('Product Page', 'upsellai'); ?>
                                    </option>
                                    <option value="cart_page" <?php selected($display_location, 'cart_page'); ?>>
                                        <?php _e('Cart Page', 'upsellai'); ?>
                                    </option>
                                    <option value="both" <?php selected($display_location, 'both'); ?>>
                                        <?php _e('Both', 'upsellai'); ?>
                                    </option>
                                </select>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="upsellai_max_recommendations"><?php _e('Max Recommendations', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <input type="number" 
                                       id="upsellai_max_recommendations" 
                                       name="upsellai_max_recommendations" 
                                       value="<?php echo esc_attr($max_recommendations); ?>" 
                                       min="1" 
                                       max="5" 
                                       class="small-text" />
                                <p class="description">
                                    <?php _e('Number of products to recommend (1-5)', 'upsellai'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <p class="submit">
                        <button type="submit" name="upsellai_save_settings" class="button button-primary">
                            <?php _e('Save Settings', 'upsellai'); ?>
                        </button>
                    </p>
                </form>
                
                <hr />
                
                <!-- Product Sync Section -->
                <h2><?php _e('Product Sync', 'upsellai'); ?></h2>
                <p><?php _e('Sync your WooCommerce products with UpSell AI dashboard.', 'upsellai'); ?></p>
                
                <?php
                $last_sync = get_option('upsellai_last_product_sync');
                if ($last_sync) {
                    echo '<p><strong>' . __('Last Sync:', 'upsellai') . '</strong> ' . date('Y-m-d H:i:s', $last_sync) . '</p>';
                }
                ?>
                
                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                    <?php wp_nonce_field('upsellai_sync_products'); ?>
                    <input type="hidden" name="action" value="upsellai_sync_products" />
                    <p class="submit">
                        <button type="submit" class="button button-secondary">
                            <span class="dashicons dashicons-update" style="margin-top: 3px;"></span>
                            <?php _e('Sync Products Now', 'upsellai'); ?>
                        </button>
                    </p>
                </form>
                
                <hr />
                
                <h2><?php _e('Quick Stats', 'upsellai'); ?></h2>
                <div class="upsellai-stats">
                    <p><?php _e('View detailed analytics in your', 'upsellai'); ?> 
                       <a href="https://upsellai-dashboard.vercel.app" target="_blank">UpSell AI Dashboard</a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }
}
