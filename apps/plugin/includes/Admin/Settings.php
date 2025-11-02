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
        register_setting('upsellai_settings', 'upsellai_enabled');
        register_setting('upsellai_settings', 'upsellai_display_location');
        register_setting('upsellai_settings', 'upsellai_max_recommendations');
        
        // WordPress Publishing settings
        register_setting('upsellai_settings', 'upsellai_wp_username');
        register_setting('upsellai_settings', 'upsellai_wp_app_password');
        register_setting('upsellai_settings', 'upsellai_wp_connected');
        register_setting('upsellai_settings', 'upsellai_wp_last_test');
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
        
        // Save settings
        if (isset($_POST['upsellai_save_settings'])) {
            check_admin_referer('upsellai_settings_nonce');
            
            update_option('upsellai_api_key', sanitize_text_field($_POST['upsellai_api_key']));
            update_option('upsellai_enabled', isset($_POST['upsellai_enabled']) ? '1' : '0');
            update_option('upsellai_display_location', sanitize_text_field($_POST['upsellai_display_location']));
            update_option('upsellai_max_recommendations', absint($_POST['upsellai_max_recommendations']));
            
            echo '<div class="notice notice-success"><p>' . __('Settings saved successfully!', 'upsellai') . '</p></div>';
        }
        
        // Save WordPress Publishing credentials
        if (isset($_POST['upsellai_save_wp_credentials'])) {
            check_admin_referer('upsellai_settings_nonce');
            
            $wp_username = sanitize_text_field($_POST['upsellai_wp_username']);
            $wp_app_password = sanitize_text_field($_POST['upsellai_wp_app_password']);
            
            // Remove spaces from Application Password (WordPress adds them for readability)
            $wp_app_password = str_replace(' ', '', $wp_app_password);
            
            if (!empty($wp_username) && !empty($wp_app_password)) {
                // Encrypt the Application Password before saving locally
                $encrypted_password = $this->encrypt_password($wp_app_password);
                
                update_option('upsellai_wp_username', $wp_username);
                update_option('upsellai_wp_app_password', $encrypted_password);
                
                // Send credentials to Firebase (plain text - will be encrypted in transit via HTTPS)
                $this->sync_wp_credentials_to_firebase($wp_username, $wp_app_password);
                
                echo '<div class="notice notice-success"><p>' . __('WordPress credentials saved successfully!', 'upsellai') . '</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>' . __('Please fill in both username and Application Password.', 'upsellai') . '</p></div>';
            }
        }
        
        $api_key = get_option('upsellai_api_key', '');
        $enabled = get_option('upsellai_enabled', '1');
        $display_location = get_option('upsellai_display_location', 'product_page');
        $max_recommendations = get_option('upsellai_max_recommendations', '3');
        
        // WordPress Publishing settings
        $wp_username = get_option('upsellai_wp_username', '');
        $wp_app_password = get_option('upsellai_wp_app_password', '');
        $wp_connected = get_option('upsellai_wp_connected', false);
        $wp_last_test = get_option('upsellai_wp_last_test', 0);
        
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
                    
                    <!-- Quick Stats -->
                    <h2><?php _e('Quick Stats', 'upsellai'); ?></h2>
                    <div class="upsellai-stats">
                        <p><?php _e('View detailed analytics in your', 'upsellai'); ?> 
                           <a href="https://upsellai-dashboard.vercel.app" target="_blank">UpSell AI Dashboard</a>
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
                                   value="<?php echo esc_attr($wp_app_password ? '••••••••••••••••••••••••' : ''); ?>" 
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
                            class="button button-secondary">
                        <span class="dashicons dashicons-yes-alt" style="margin-top: 3px;"></span>
                        <?php _e('Test Connection', 'upsellai'); ?>
                    </button>
                    
                    <button type="submit" 
                            name="upsellai_save_wp_credentials" 
                            class="button button-primary">
                        <?php _e('Save Credentials', 'upsellai'); ?>
                    </button>
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
     * Sync WordPress credentials to Firebase
     */
    private function sync_wp_credentials_to_firebase($username, $password) {
        $api_key = get_option('upsellai_api_key');
        
        if (empty($api_key)) {
            error_log('❌ SYNC WP CREDENTIALS: API Key is empty!');
            return false;
        }
        
        $api_url = 'https://wpupsell-dashboard.vercel.app/api/stores';
        
        $request_body = [
            'apiKey' => $api_key,
            'wordpressUsername' => $username,
            'wordpressPassword' => $password, // Plain text - encrypted in transit via HTTPS
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
            // Connection successful
            update_option('upsellai_wp_connected', true);
            update_option('upsellai_wp_last_test', time());
            
            // Sync status to Firebase (100% dynamic - uses API Key)
            $this->sync_wp_connection_status_to_firebase(true);
            
            wp_send_json_success([
                'message' => 'Successfully connected to WordPress REST API!\n\nYou can now publish landing pages from the UpSell AI Dashboard.'
            ]);
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
