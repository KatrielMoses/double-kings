// This file handles the Google OAuth callback
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check for access token in URL
        if (window.location.hash && window.location.hash.includes('access_token=')) {
            const token = new URLSearchParams(window.location.hash.substr(1)).get('access_token');

            // Get user profile with token
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to get user profile');
                    }
                    return response.json();
                })
                .then(profile => {
                    // Send profile back to opener
                    if (window.opener) {
                        // Create a new object without the picture property
                        const { picture, ...userData } = profile;

                        window.opener.postMessage({
                            type: 'googleSignIn',
                            profile: userData
                        }, window.location.origin);

                        // Show success message and close window after a brief delay
                        document.body.innerHTML = '<div style="text-align: center; padding: 20px; font-family: Arial;">' +
                            '<h2>Sign-in Successful!</h2>' +
                            '<p>You can close this window now.</p>' +
                            '</div>';

                        setTimeout(() => {
                            window.close();
                        }, 1500);
                    } else {
                        throw new Error('Window opener not available');
                    }
                })
                .catch(error => {
                    console.error('Error handling Google callback:', error);
                    document.body.innerHTML = '<div style="text-align: center; padding: 20px; color: #e74c3c; font-family: Arial;">' +
                        '<h2>Sign-in Failed</h2>' +
                        '<p>There was an error authenticating with Google. Please try again.</p>' +
                        '<button onclick="window.close()">Close Window</button>' +
                        '</div>';
                });
        }
    } catch (error) {
        console.error('Error in Google callback:', error);
    }
}); 