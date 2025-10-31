<?php
namespace WPUpsell\Admin;

class Settings {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }
    
    public function add_menu_page() {
        add_menu_page(
            __('WPUpsell Settings', 'wpupsell'),
            __('WPUpsell', 'wpupsell'),
            'manage_options',
            'wpupsell-settings',
            [$this, 'render_settings_page'],
            'dashicons-chart-line',
            56
        );
    }
    
    public function register_settings() {
        register_setting('wpupsell_settings', 'wpupsell_api_key');
        register_setting('wpupsell_settings', 'wpupsell_store_id');
        register_setting('wpupsell_settings', 'wpupsell_enabled');
        register_setting('wpupsell_settings', 'wpupsell_display_location');
        register_setting('wpupsell_settings', 'wpupsell_max_recommendations');
    }
    
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_wpupsell-settings') {
            return;
        }
        
        wp_enqueue_style('wpupsell-admin', WPUPSELL_PLUGIN_URL . 'assets/css/admin.css', [], WPUPSELL_VERSION);
        wp_enqueue_script('wpupsell-admin', WPUPSELL_PLUGIN_URL . 'assets/js/admin.js', ['jquery'], WPUPSELL_VERSION, true);
    }
    
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save settings
        if (isset($_POST['wpupsell_save_settings'])) {
            check_admin_referer('wpupsell_settings_nonce');
            
            update_option('wpupsell_api_key', sanitize_text_field($_POST['wpupsell_api_key']));
            update_option('wpupsell_enabled', isset($_POST['wpupsell_enabled']) ? '1' : '0');
            update_option('wpupsell_display_location', sanitize_text_field($_POST['wpupsell_display_location']));
            update_option('wpupsell_max_recommendations', absint($_POST['wpupsell_max_recommendations']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'wpupsell') . '</p></div>';
        }
        
        $api_key = get_option('wpupsell_api_key', '');
        $store_id = get_option('wpupsell_store_id', '');
        $enabled = get_option('wpupsell_enabled', '1');
        $display_location = get_option('wpupsell_display_location', 'product_page');
        $max_recommendations = get_option('wpupsell_max_recommendations', '3');
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="wpupsell-settings-container">
                <form method="post" action="">
                    <?php wp_nonce_field('wpupsell_settings_nonce'); ?>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="wpupsell_api_key"><?php _e('API Key', 'wpupsell'); ?></label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="wpupsell_api_key" 
                                       name="wpupsell_api_key" 
                                       value="<?php echo esc_attr($api_key); ?>" 
                                       class="regular-text" 
                                       placeholder="sk_live_..." />
                                <p class="description">
                                    <?php _e('Get your API key from', 'wpupsell'); ?> 
                                    <a href="https://wpupsell-dashboard.vercel.app/settings" target="_blank">WPUpsell Dashboard</a>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="wpupsell_store_id"><?php _e('Store ID', 'wpupsell'); ?></label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="wpupsell_store_id" 
                                       name="wpupsell_store_id" 
                                       value="<?php echo esc_attr($store_id); ?>" 
                                       class="regular-text" 
                                       readonly />
                                <p class="description">
                                    <?php _e('Your unique store identifier (auto-generated)', 'wpupsell'); ?>
                                </p>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="wpupsell_enabled"><?php _e('Enable Recommendations', 'wpupsell'); ?></label>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" 
                                           id="wpupsell_enabled" 
                                           name="wpupsell_enabled" 
                                           value="1" 
                                           <?php checked($enabled, '1'); ?> />
                                    <?php _e('Show AI recommendations to customers', 'wpupsell'); ?>
                                </label>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="wpupsell_display_location"><?php _e('Display Location', 'wpupsell'); ?></label>
                            </th>
                            <td>
                                <select id="wpupsell_display_location" name="wpupsell_display_location">
                                    <option value="product_page" <?php selected($display_location, 'product_page'); ?>>
                                        <?php _e('Product Page', 'wpupsell'); ?>
                                    </option>
                                    <option value="cart_page" <?php selected($display_location, 'cart_page'); ?>>
                                        <?php _e('Cart Page', 'wpupsell'); ?>
                                    </option>
                                    <option value="both" <?php selected($display_location, 'both'); ?>>
                                        <?php _e('Both', 'wpupsell'); ?>
                                    </option>
                                </select>
                            </td>
                        </tr>
                        
                        <tr>
                            <th scope="row">
                                <label for="wpupsell_max_recommendations"><?php _e('Max Recommendations', 'wpupsell'); ?></label>
                            </th>
                            <td>
                                <input type="number" 
                                       id="wpupsell_max_recommendations" 
                                       name="wpupsell_max_recommendations" 
                                       value="<?php echo esc_attr($max_recommendations); ?>" 
                                       min="1" 
                                       max="5" 
                                       class="small-text" />
                                <p class="description">
                                    <?php _e('Number of products to recommend (1-5)', 'wpupsell'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                    
                    <p class="submit">
                        <button type="submit" name="wpupsell_save_settings" class="button button-primary">
                            <?php _e('Save Settings', 'wpupsell'); ?>
                        </button>
                    </p>
                </form>
                
                <hr />
                
                <h2><?php _e('Quick Stats', 'wpupsell'); ?></h2>
                <div class="wpupsell-stats">
                    <p><?php _e('View detailed analytics in your', 'wpupsell'); ?> 
                       <a href="https://wpupsell-dashboard.vercel.app" target="_blank">WPUpsell Dashboard</a>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }
}
