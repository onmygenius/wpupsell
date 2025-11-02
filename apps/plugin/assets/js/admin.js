/**
 * UpSell AI Admin JavaScript
 */

jQuery(document).ready(function($) {
    'use strict';
    
    // Admin functionality
    // Store ID removed - using API Key only
    
    // Validate API key format
    $('#upsellai_api_key').on('blur', function() {
        const apiKey = $(this).val();
        
        if (apiKey && !apiKey.startsWith('sk_')) {
            alert('Warning: API key should start with "sk_"');
        }
    });
    
    // Test WordPress Connection
    $('#upsellai_test_wp_connection').on('click', function(e) {
        e.preventDefault();
        
        const $button = $(this);
        const $buttonText = $button.find('span').last();
        const originalText = $buttonText.text();
        
        const username = $('#upsellai_wp_username').val();
        const password = $('#upsellai_wp_app_password').val();
        
        if (!username || !password) {
            alert('Please enter both WordPress Username and Application Password before testing.');
            return;
        }
        
        // Disable button and show loading
        $button.prop('disabled', true);
        $buttonText.text(' Testing...');
        
        // AJAX request to test connection
        $.ajax({
            url: upsellaiAdmin.ajax_url,
            type: 'POST',
            data: {
                action: 'upsellai_test_wp_connection',
                nonce: upsellaiAdmin.test_connection_nonce,
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    alert('✅ Connection successful!\n\n' + response.data.message);
                    
                    // Update Connection Status UI instantly
                    location.reload(); // Refresh to show updated status
                } else {
                    alert('❌ Connection failed!\n\n' + response.data.message);
                }
            },
            error: function() {
                alert('❌ Connection test failed!\n\nPlease check your credentials and try again.');
            },
            complete: function() {
                // Re-enable button
                $button.prop('disabled', false);
                $buttonText.text(originalText);
            }
        });
    });
});
