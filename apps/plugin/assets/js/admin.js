/**
 * WPUpsell Admin JavaScript
 */

jQuery(document).ready(function($) {
    'use strict';
    
    // Copy Store ID to clipboard
    $('#wpupsell_store_id').on('click', function() {
        this.select();
        document.execCommand('copy');
        
        // Show tooltip
        const tooltip = $('<span class="wpupsell-tooltip">Copied!</span>');
        $(this).after(tooltip);
        
        setTimeout(function() {
            tooltip.fadeOut(function() {
                $(this).remove();
            });
        }, 2000);
    });
    
    // Validate API key format
    $('#wpupsell_api_key').on('blur', function() {
        const apiKey = $(this).val();
        
        if (apiKey && !apiKey.startsWith('sk_')) {
            alert('Warning: API key should start with "sk_"');
        }
    });
});
