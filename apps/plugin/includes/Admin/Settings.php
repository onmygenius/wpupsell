<?php
namespace UpsellAI\Admin;

class Settings {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu_page']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('wp_ajax_upsellai_test_wp_connection', [$this, 'ajax_test_wp_connection']);
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
        // Hidden settings with defaults
        register_setting('upsellai_settings', 'upsellai_enabled');
        register_setting('upsellai_settings', 'upsellai_display_location');
        register_setting('upsellai_settings', 'upsellai_max_recommendations');
        
        // WordPress Publishing settings
        register_setting('upsellai_settings', 'upsellai_wp_username');
        register_setting('upsellai_settings', 'upsellai_wp_app_password');
        register_setting('upsellai_settings', 'upsellai_wp_connected');
        register_setting('upsellai_settings', 'upsellai_wp_last_test');
        
        // Dashboard Credentials (readonly display)
        register_setting('upsellai_settings', 'upsellai_dashboard_email');
        register_setting('upsellai_settings', 'upsellai_dashboard_password');
        register_setting('upsellai_settings', 'upsellai_dashboard_url');
    }
    
    public function enqueue_admin_assets($hook) {
        if ($hook !== 'toplevel_page_upsellai-settings') {
            return;
        }
        
        wp_enqueue_style('upsellai-admin', UPSELLAI_PLUGIN_URL . 'assets/css/admin.css', [], UPSELLAI_VERSION);
        wp_enqueue_script('upsellai-admin', UPSELLAI_PLUGIN_URL . 'assets/js/admin.js', ['jquery'], UPSELLAI_VERSION, true);
        
        // Pass nonce to JavaScript for AJAX security
        wp_localize_script('upsellai-admin', 'upsellaiAdmin', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'test_connection_nonce' => wp_create_nonce('upsellai_test_wp_connection')
        ]);
    }
    
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save settings (API Key is readonly, no save needed)
        // Hidden settings are set to defaults automatically
        if (!get_option('upsellai_enabled')) {
            update_option('upsellai_enabled', '1'); // Default: enabled
        }
        if (!get_option('upsellai_display_location')) {
            update_option('upsellai_display_location', 'both'); // Default: both
        }
        if (!get_option('upsellai_max_recommendations')) {
            update_option('upsellai_max_recommendations', '1'); // Default: 1
        }
        
        // Save Credentials removed - now handled automatically by Test Connection
        
        $api_key = get_option('upsellai_api_key', '');
        // Hidden settings with defaults
        $enabled = get_option('upsellai_enabled', '1');
        $display_location = get_option('upsellai_display_location', 'both');
        $max_recommendations = get_option('upsellai_max_recommendations', '1');
        
        // WordPress Publishing settings
        $wp_username = get_option('upsellai_wp_username', '');
        $wp_app_password_encrypted = get_option('upsellai_wp_app_password', '');
        // Decrypt for display (show dots)
        $wp_app_password = !empty($wp_app_password_encrypted) ? str_repeat('•', 24) : '';
        $wp_connected = get_option('upsellai_wp_connected', false);
        $wp_last_test = get_option('upsellai_wp_last_test', 0);
        
        // Dashboard Credentials (readonly)
        $dashboard_email = get_option('upsellai_dashboard_email', '');
        $dashboard_password = get_option('upsellai_dashboard_password', '');
        $dashboard_url = get_option('upsellai_dashboard_url', 'https://wpupsell-dashboard.vercel.app/login');
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <style>
                .upsellai-settings-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    margin-top: 20px;
                }
                @media (max-width: 1200px) {
                    .upsellai-settings-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .upsellai-settings-column {
                    background: #fff;
                    border: 1px solid #ccd0d4;
                    box-shadow: 0 1px 1px rgba(0,0,0,.04);
                    padding: 20px;
                }
                .upsellai-settings-column h2 {
                    margin-top: 0;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #ddd;
                }
            </style>
            
            <div class="upsellai-settings-grid">
                <!-- Left Column: Main Settings -->
                <div class="upsellai-settings-column">
                    <h2><?php _e('🔑 API Configuration', 'upsellai'); ?></h2>
                    
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="upsellai_api_key"><?php _e('API Key', 'upsellai'); ?></label>
                            </th>
                            <td>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <input type="text" 
                                           id="upsellai_api_key" 
                                           value="<?php echo esc_attr($api_key); ?>" 
                                           class="regular-text" 
                                           readonly
                                           style="background: #f0f0f1; cursor: not-allowed;" />
                                    <button type="button" 
                                            class="button button-secondary" 
                                            onclick="navigator.clipboard.writeText(document.getElementById('upsellai_api_key').value); this.textContent='✓ Copied!'; setTimeout(() => this.textContent='📋 Copy', 2000);">
                                        📋 <?php _e('Copy', 'upsellai'); ?>
                                    </button>
                                </div>
                                <p class="description">
                                    <?php _e('Get your API key from', 'upsellai'); ?> 
                                    <a href="https://wpupsell-dashboard.vercel.app" target="_blank">UpSell AI Dashboard</a>
                                </p>
                                
                                <?php if (!empty($dashboard_email) && !empty($dashboard_password)): ?>
                                    <div style="background: #e7f3ff; border: 1px solid #2271b1; border-radius: 4px; padding: 15px; margin-top: 15px;">
                                        <p style="margin: 0 0 10px 0; font-weight: 600; color: #2271b1;">
                                            📊 <?php _e('Dashboard Login Credentials:', 'upsellai'); ?>
                                        </p>
                                        <table style="width: 100%; margin: 0;">
                                            <tr>
                                                <td style="padding: 5px 0; font-weight: 600; width: 80px;"><?php _e('Email:', 'upsellai'); ?></td>
                                                <td style="padding: 5px 0;">
                                                    <code style="background: #fff; padding: 4px 8px; border-radius: 3px; font-size: 13px;"><?php echo esc_html($dashboard_email); ?></code>
                                                    <button type="button" 
                                                            class="button button-small" 
                                                            style="margin-left: 10px; height: 24px; line-height: 22px; padding: 0 8px;"
                                                            onclick="navigator.clipboard.writeText('<?php echo esc_js($dashboard_email); ?>'); this.textContent='✓'; setTimeout(() => this.textContent='📋', 2000);">
                                                        📋
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-weight: 600;"><?php _e('Password:', 'upsellai'); ?></td>
                                                <td style="padding: 5px 0;">
                                                    <code style="background: #fff; padding: 4px 8px; border-radius: 3px; font-size: 13px;"><?php echo esc_html($dashboard_password); ?></code>
                                                    <button type="button" 
                                                            class="button button-small" 
                                                            style="margin-left: 10px; height: 24px; line-height: 22px; padding: 0 8px;"
                                                            onclick="navigator.clipboard.writeText('<?php echo esc_js($dashboard_password); ?>'); this.textContent='✓'; setTimeout(() => this.textContent='📋', 2000);">
                                                        📋
                                                    </button>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; font-weight: 600;"><?php _e('Login:', 'upsellai'); ?></td>
                                                <td style="padding: 5px 0;">
                                                    <a href="<?php echo esc_url($dashboard_url); ?>" 
                                                       target="_blank" 
                                                       class="button button-primary button-small" 
                                                       style="height: 24px; line-height: 22px; padding: 0 12px;">
                                                        🔗 <?php _e('Open Dashboard', 'upsellai'); ?>
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">
                                            💡 <?php _e('Save these credentials! You can use them to login to your UpSell AI Dashboard.', 'upsellai'); ?>
                                        </p>
                                    </div>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                    
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
                    
                    <!-- Connection Status -->
                    <h2><?php _e('🔗 Connection Status', 'upsellai'); ?></h2>
                    
                    <?php if ($wp_connected): ?>
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
                            <p style="margin: 0; color: #155724; font-weight: 600;">
                                ✅ <?php _e('Connected to UpSell AI Dashboard', 'upsellai'); ?>
                            </p>
                        </div>
                        
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php _e('Store URL', 'upsellai'); ?></th>
                                <td><strong><?php echo esc_html(get_site_url()); ?></strong></td>
                            </tr>
                            <tr>
                                <th scope="row"><?php _e('WordPress User', 'upsellai'); ?></th>
                                <td><strong><?php echo esc_html($wp_username); ?></strong></td>
                            </tr>
                            <?php if ($wp_last_test): ?>
                            <tr>
                                <th scope="row"><?php _e('Last Test', 'upsellai'); ?></th>
                                <td><?php echo date('Y-m-d H:i:s', $wp_last_test); ?></td>
                            </tr>
                            <?php endif; ?>
                        </table>
                    <?php else: ?>
                        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; padding: 15px; margin-bottom: 15px;">
                            <p style="margin: 0; color: #721c24; font-weight: 600;">
                                ❌ <?php _e('Not Connected', 'upsellai'); ?>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #721c24;">
                                <?php _e('Configure Application Password in the right panel to enable WordPress Publishing.', 'upsellai'); ?>
                            </p>
                        </div>
                    <?php endif; ?>
                    
                    <hr />
                    
                    <!-- Quick Stats -->
                    <h2><?php _e('📊 Quick Stats', 'upsellai'); ?></h2>
                    <div class="upsellai-stats">
                        <p><?php _e('View detailed analytics in your', 'upsellai'); ?> 
                           <a href="https://wpupsell-dashboard.vercel.app" target="_blank">UpSell AI Dashboard</a>
                        </p>
                    </div>
                </div>
                
                <!-- Right Column: WordPress Publishing -->
                <div class="upsellai-settings-column">
                    <h2><?php _e('WordPress Publishing', 'upsellai'); ?></h2>
                
                <!-- Info Box - Why is this needed -->
                <div class="notice notice-info inline" style="margin: 20px 0; padding: 12px; border-left-color: #2271b1;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>ℹ️ <?php _e('Why do you need this?', 'upsellai'); ?></strong>
                        <br>
                        <?php _e('This allows you to publish AI-generated landing pages directly from the UpSell AI Dashboard to your WordPress site with one click.', 'upsellai'); ?>
                        <br>
                        <?php _e('Without this, you would need to manually copy and paste the HTML for each landing page.', 'upsellai'); ?>
                    </p>
                </div>
                
                <!-- Warning Box - Application Password -->
                <div class="notice notice-warning inline" style="margin: 20px 0; padding: 12px;">
                    <p style="margin: 0; font-size: 14px;">
                        <strong>⚠️ <?php _e('Important:', 'upsellai'); ?></strong>
                        <?php _e('Use an Application Password, NOT your WordPress admin password!', 'upsellai'); ?>
                        <br>
                        <?php _e('Application Passwords are more secure and can be revoked anytime without changing your admin password.', 'upsellai'); ?>
                    </p>
                </div>
                
                <p><?php _e('To enable automatic publishing of landing pages from UpSell AI Dashboard to your WordPress site, create an Application Password below.', 'upsellai'); ?></p>
                
                <!-- Tutorial Box -->
                <div style="background: #f0f0f1; border-left: 4px solid #2271b1; padding: 15px; margin: 20px 0;">
                    <h3 style="margin-top: 0;"><?php _e('How to create an Application Password:', 'upsellai'); ?></h3>
                    <ol style="margin: 10px 0; padding-left: 20px;">
                        <li><?php _e('Go to WordPress Admin → <strong>Users → Your Profile</strong>', 'upsellai'); ?></li>
                        <li><?php _e('Scroll down to <strong>"Application Passwords"</strong> section', 'upsellai'); ?></li>
                        <li><?php _e('Enter name: <strong>"UpSell AI Landing Pages"</strong>', 'upsellai'); ?></li>
                        <li><?php _e('Click <strong>"Add New Application Password"</strong>', 'upsellai'); ?></li>
                        <li><?php _e('Copy the generated password (format: xxxx xxxx xxxx xxxx)', 'upsellai'); ?></li>
                        <li><?php _e('Paste it in the field below and click "Save Credentials"', 'upsellai'); ?></li>
                    </ol>
                    <p style="margin-bottom: 0;">
                        <strong><?php _e('Note:', 'upsellai'); ?></strong>
                        <?php _e('This password is ONLY used to publish landing pages. It\'s different from your WordPress login password and can be revoked anytime.', 'upsellai'); ?>
                    </p>
                </div>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="upsellai_wp_username"><?php _e('WordPress Username', 'upsellai'); ?></label>
                        </th>
                        <td>
                            <input type="text" 
                                   id="upsellai_wp_username" 
                                   name="upsellai_wp_username" 
                                   value="<?php echo esc_attr($wp_username); ?>" 
                                   class="regular-text" 
                                   placeholder="admin" />
                            <p class="description">
                                <?php _e('Your WordPress admin username (usually "admin")', 'upsellai'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <label for="upsellai_wp_app_password">
                                <?php _e('Application Password', 'upsellai'); ?>
                                <span style="color: #d63638;">*</span>
                            </label>
                        </th>
                        <td>
                            <input type="password" 
                                   id="upsellai_wp_app_password" 
                                   name="upsellai_wp_app_password" 
                                   value="<?php echo esc_attr($wp_app_password); ?>" 
                                   class="regular-text" 
                                   placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" 
                                   autocomplete="off" />
                            
                            <p class="description" style="color: #d63638; font-weight: 600;">
                                ⚠️ <?php _e('NOT your WordPress admin password! Use Application Password only.', 'upsellai'); ?>
                            </p>
                            
                            <p class="description">
                                <?php _e('Paste the Application Password you created above (format: xxxx xxxx xxxx xxxx)', 'upsellai'); ?>
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            <?php _e('Connection Status', 'upsellai'); ?>
                        </th>
                        <td>
                            <?php if ($wp_connected): ?>
                                <span style="color: #00a32a; font-weight: 600;">
                                    ✅ <?php _e('Connected', 'upsellai'); ?>
                                </span>
                                <?php if ($wp_last_test): ?>
                                    <p class="description">
                                        <?php _e('Last tested:', 'upsellai'); ?> 
                                        <?php echo date('Y-m-d H:i:s', $wp_last_test); ?>
                                    </p>
                                <?php endif; ?>
                            <?php else: ?>
                                <span style="color: #d63638; font-weight: 600;">
                                    ❌ <?php _e('Not Connected', 'upsellai'); ?>
                                </span>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
                
                <p class="submit">
                    <button type="button" 
                            id="upsellai_test_wp_connection" 
                            class="button button-primary">
                        <span class="dashicons dashicons-yes-alt" style="margin-top: 3px;"></span>
                        <?php _e('Test Connection & Save', 'upsellai'); ?>
                    </button>
                </p>
                
                <p class="description" style="margin-top: -10px; color: #2271b1;">
                    ℹ️ <?php _e('Testing connection will automatically save credentials if successful', 'upsellai'); ?>
                </p>
                
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Sync WordPress connection status to Firebase
     */
    private function sync_wp_connection_status_to_firebase($connected) {
        $api_key = get_option('upsellai_api_key');
        
        if (empty($api_key)) {
            return false;
        }
        
        $api_url = 'https://wpupsell-dashboard.vercel.app/api/stores';
        
        $response = wp_remote_post($api_url, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode([
                'apiKey' => $api_key,
                'wordpressConnected' => $connected,
                'wordpressLastTest' => time(),
                'action' => 'update_wp_status'
            ]),
            'timeout' => 15,
        ]);
        
        if (is_wp_error($response)) {
            error_log('Failed to sync WP status to Firebase: ' . $response->get_error_message());
            return false;
        }
        
        return true;
    }
    
    /**
     * Auto Setup Store: Create user + store + sync products in ONE request
     */
    private function auto_setup_store($wordpress_url, $wordpress_name, $wordpress_email, $username, $password, $products) {
        $api_url = 'https://wpupsell-dashboard.vercel.app/api/stores';
        
        $request_body = [
            'action' => 'auto_setup_store',
            'wordpressUrl' => $wordpress_url,
            'wordpressName' => $wordpress_name,
            'wordpressEmail' => $wordpress_email,
            'wordpressUsername' => $username,
            'wordpressPassword' => $password,
            'products' => $products
        ];
        
        error_log('🚀 AUTO SETUP STORE:');
        error_log('URL: ' . $wordpress_url);
        error_log('Name: ' . $wordpress_name);
        error_log('Email: ' . $wordpress_email);
        error_log('Products: ' . count($products));
        
        $response = wp_remote_post($api_url, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($request_body),
            'timeout' => 30, // Longer timeout for creating user + store + products
        ]);
        
        if (is_wp_error($response)) {
            error_log('❌ Auto setup failed: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        error_log('📥 Response Status: ' . $status_code);
        error_log('📥 Response Body: ' . $response_body);
        
        if ($status_code === 200) {
            $result = json_decode($response_body, true);
            error_log('✅ Auto setup successful!');
            return $result;
        } else {
            error_log('❌ Auto setup failed - Status: ' . $status_code);
            return false;
        }
    }
    
    /**
     * Sync WordPress credentials to Firebase
     */
    private function sync_wp_credentials_to_firebase($username, $password, $wordpress_url = '', $wordpress_name = '') {
        $api_key = get_option('upsellai_api_key');
        
        if (empty($api_key)) {
            error_log('❌ SYNC WP CREDENTIALS: API Key is empty!');
            return false;
        }
        
        // Get WordPress URL and name if not provided (100% dynamic)
        if (empty($wordpress_url)) {
            $wordpress_url = get_site_url();
        }
        if (empty($wordpress_name)) {
            $wordpress_name = get_bloginfo('name');
        }
        
        $api_url = 'https://wpupsell-dashboard.vercel.app/api/stores';
        
        $request_body = [
            'apiKey' => $api_key,
            'wordpressUsername' => $username,
            'wordpressPassword' => $password, // Plain text - encrypted in transit via HTTPS
            'wordpressUrl' => $wordpress_url, // WordPress site URL (100% dynamic)
            'wordpressName' => $wordpress_name, // WordPress site name (100% dynamic)
            'action' => 'update_wp_credentials'
        ];
        
        error_log('📤 SYNC WP CREDENTIALS TO FIREBASE:');
        error_log('API URL: ' . $api_url);
        error_log('API Key: ' . substr($api_key, 0, 10) . '...');
        error_log('Username: ' . $username);
        error_log('Password: ' . (empty($password) ? 'EMPTY' : 'present'));
        
        $response = wp_remote_post($api_url, [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'body' => json_encode($request_body),
            'timeout' => 15,
        ]);
        
        if (is_wp_error($response)) {
            error_log('❌ Failed to sync WP credentials to Firebase: ' . $response->get_error_message());
            return false;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        error_log('📥 Response Status: ' . $status_code);
        error_log('📥 Response Body: ' . $response_body);
        
        if ($status_code === 200) {
            error_log('✅ WordPress credentials synced to Firebase successfully!');
            return true;
        } else {
            error_log('❌ Failed to sync - Status: ' . $status_code);
            return false;
        }
    }
    
    /**
     * AJAX handler to test WordPress REST API connection
     */
    public function ajax_test_wp_connection() {
        // Verify nonce for AJAX security (works with Wordfence, iThemes, etc)
        check_ajax_referer('upsellai_test_wp_connection', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Insufficient permissions']);
            return;
        }
        
        $username = sanitize_text_field($_POST['username']);
        $password = sanitize_text_field($_POST['password']);
        
        // Remove spaces from Application Password
        $password = str_replace(' ', '', $password);
        
        if (empty($username) || empty($password)) {
            wp_send_json_error(['message' => 'Username and password are required']);
            return;
        }
        
        // Test connection to WordPress REST API
        $site_url = get_site_url();
        $api_url = $site_url . '/wp-json/wp/v2/pages';
        
        // Create Basic Auth header
        $auth = base64_encode($username . ':' . $password);
        
        $response = wp_remote_get($api_url, [
            'headers' => [
                'Authorization' => 'Basic ' . $auth,
            ],
            'timeout' => 15,
        ]);
        
        if (is_wp_error($response)) {
            wp_send_json_error([
                'message' => 'Connection failed: ' . $response->get_error_message()
            ]);
            return;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $response_body = wp_remote_retrieve_body($response);
        
        // Debug info
        error_log('WP REST API Test - URL: ' . $api_url);
        error_log('WP REST API Test - Status Code: ' . $status_code);
        error_log('WP REST API Test - Response: ' . substr($response_body, 0, 200));
        
        if ($status_code === 200) {
            // Connection successful - AUTO SETUP EVERYTHING!
            update_option('upsellai_wp_connected', true);
            update_option('upsellai_wp_last_test', time());
            
            // Save credentials locally
            $encrypted_password = $this->encrypt_password($password);
            update_option('upsellai_wp_username', $username);
            update_option('upsellai_wp_app_password', $encrypted_password);
            
            // Get all WordPress data (100% dynamic)
            $wordpress_url = get_site_url();
            $wordpress_name = get_bloginfo('name');
            $wordpress_email = get_bloginfo('admin_email');
            
            // Get all WooCommerce products
            $products = [];
            $wc_products = wc_get_products([
                'limit' => -1,
                'status' => 'publish'
            ]);
            
            foreach ($wc_products as $product) {
                $products[] = [
                    'id' => $product->get_id(),
                    'name' => $product->get_name(),
                    'price' => (float) $product->get_price(),
                    'regularPrice' => (float) $product->get_regular_price(),
                    'salePrice' => $product->get_sale_price() ? (float) $product->get_sale_price() : null,
                    'description' => $product->get_short_description(),
                    'image' => wp_get_attachment_url($product->get_image_id()),
                    'url' => get_permalink($product->get_id()),
                    'category' => $product->get_category_ids() ? implode(', ', $product->get_category_ids()) : '',
                    'stock' => $product->get_stock_quantity(),
                    'sku' => $product->get_sku(),
                    'enabled' => true
                ];
            }
            
            // AUTO SETUP: Create store + user + sync products in ONE request!
            $setup_result = $this->auto_setup_store($wordpress_url, $wordpress_name, $wordpress_email, $username, $password, $products);
            
            if ($setup_result && isset($setup_result['success']) && $setup_result['success']) {
                // Save API Key locally (readonly)
                update_option('upsellai_api_key', $setup_result['apiKey']);
                
                // Save Dashboard Credentials (readonly display)
                update_option('upsellai_dashboard_email', $setup_result['dashboardEmail']);
                update_option('upsellai_dashboard_password', $setup_result['dashboardPassword']);
                update_option('upsellai_dashboard_url', $setup_result['dashboardUrl']);
                
                // Success message with dashboard credentials
                $message = "✅ Success! Store created and products synced!\n\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                $message .= "📊 DASHBOARD CREDENTIALS:\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
                $message .= "Email: " . $setup_result['dashboardEmail'] . "\n";
                $message .= "Password: " . $setup_result['dashboardPassword'] . "\n\n";
                $message .= "🔗 Login here:\n";
                $message .= $setup_result['dashboardUrl'] . "\n\n";
                $message .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
                $message .= "✅ " . count($products) . " products synced\n";
                $message .= "✅ Store: " . $wordpress_name . "\n";
                $message .= "✅ API Key saved (readonly)\n";
                
                wp_send_json_success([
                    'message' => $message,
                    'dashboardUrl' => $setup_result['dashboardUrl'],
                    'dashboardEmail' => $setup_result['dashboardEmail'],
                    'dashboardPassword' => $setup_result['dashboardPassword']
                ]);
            } else {
                wp_send_json_error([
                    'message' => 'Connection successful but store setup failed.\n\nPlease contact support.'
                ]);
            }
        } elseif ($status_code === 401) {
            wp_send_json_error([
                'message' => 'Authentication failed!\n\nPlease check:\n1. Username is correct (not email)\n2. Application Password is correct (remove spaces!)\n3. Application Passwords are enabled in WordPress\n\nTested URL: ' . $api_url
            ]);
        } else {
            // Get more details from response
            $error_details = '';
            if (!empty($response_body)) {
                $body_data = json_decode($response_body, true);
                if (isset($body_data['message'])) {
                    $error_details = '\n\nError: ' . $body_data['message'];
                }
            }
            
            wp_send_json_error([
                'message' => 'Connection failed with status code: ' . $status_code . $error_details . '\n\nTested URL: ' . $api_url . '\n\nPlease check:\n1. WordPress REST API is enabled\n2. No security plugin blocking REST API\n3. SSL certificate is valid'
            ]);
        }
    }
    
    /**
     * Encrypt password using WordPress built-in functions
     * 
     * @param string $password Plain text password
     * @return string Encrypted password
     */
    private function encrypt_password($password) {
        if (empty($password)) {
            return '';
        }
        
        // Use WordPress salts for encryption
        $key = wp_salt('auth');
        $iv_length = openssl_cipher_iv_length('aes-256-cbc');
        $iv = openssl_random_pseudo_bytes($iv_length);
        
        $encrypted = openssl_encrypt($password, 'aes-256-cbc', $key, 0, $iv);
        
        // Combine IV and encrypted data
        return base64_encode($iv . $encrypted);
    }
    
    /**
     * Decrypt password
     * 
     * @param string $encrypted_password Encrypted password
     * @return string Plain text password
     */
    public function decrypt_password($encrypted_password) {
        if (empty($encrypted_password)) {
            return '';
        }
        
        $key = wp_salt('auth');
        $data = base64_decode($encrypted_password);
        $iv_length = openssl_cipher_iv_length('aes-256-cbc');
        
        $iv = substr($data, 0, $iv_length);
        $encrypted = substr($data, $iv_length);
        
        return openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);
    }
}
