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
});
