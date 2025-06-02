/**
 * GOOGLE OAUTH CONFIGURATION
 * Replace the CLIENT_ID with your actual Google Client ID from Google Cloud Console
 */

const GOOGLE_CONFIG = {
    // Replace this with your actual Google Client ID from Google Cloud Console
    CLIENT_ID: '339560381414-nph7i8msmv8ug2p549hhrodt8ckpkg9e.apps.googleusercontent.com',

    // These are the authorized domains (update if needed)
    AUTHORIZED_DOMAINS: [
        'https://dsw2vjo7jrzh1.cloudfront.net',
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:8000'
    ],

    // OAuth scopes
    SCOPES: 'email profile',

    // OAuth settings
    UX_MODE: 'popup',
    AUTO_SELECT: false,
    CANCEL_ON_TAP_OUTSIDE: true
};

// Make config available globally
window.GOOGLE_CONFIG = GOOGLE_CONFIG;

// Initialize Google OAuth when the config is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.auth && GOOGLE_CONFIG.CLIENT_ID && GOOGLE_CONFIG.CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        console.log('🔧 Initializing Google OAuth with Client ID:', GOOGLE_CONFIG.CLIENT_ID);
        window.auth.setGoogleClientId(GOOGLE_CONFIG.CLIENT_ID);
    } else {
        console.warn('⚠️ Google OAuth not configured. Update CLIENT_ID in js/google-config.js');
        console.log('📋 To set up Google OAuth:');
        console.log('1. Go to https://console.cloud.google.com/');
        console.log('2. Create a project and enable Google Identity API');
        console.log('3. Create OAuth 2.0 credentials');
        console.log('4. Update CLIENT_ID in js/google-config.js');
    }
});

// Export config for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GOOGLE_CONFIG;
} 