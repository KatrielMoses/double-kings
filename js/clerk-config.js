/**
 * CLERK CONFIGURATION
 * 
 * To set up Clerk authentication:
 * 1. Create an account at https://clerk.com
 * 2. Create a new application
 * 3. Go to API Keys in your dashboard
 * 4. Replace the values below with your actual keys
 * 5. Update the script tag in index.html with your Frontend API URL
 */

window.ClerkConfig = {
    // Replace with your actual Clerk Publishable Key
    publishableKey: 'pk_test_cG93ZXJmdWwtbG9uZ2hvcm4tNDQuY2xlcmsuYWNjb3VudHMuZGV2JA',

    // Replace with your actual Frontend API URL
    frontendApi: 'powerful-longhorn-44.clerk.accounts.dev',

    // Appearance configuration matching your theme
    appearance: {
        theme: 'dark',
        variables: {
            colorPrimary: '#e74c3c',
            colorBackground: '#1a1a1a',
            colorInputBackground: 'rgba(255, 255, 255, 0.05)',
            colorInputText: '#ffffff',
            colorText: '#ffffff',
            colorTextSecondary: 'rgba(255, 255, 255, 0.8)',
            colorTextOnPrimaryBackground: '#ffffff',
            colorNeutral: '#ffffff',
            colorDanger: '#e74c3c',
            colorSuccess: '#27ae60',
            colorWarning: '#f39c12',
            borderRadius: '10px',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '14px',
            fontWeight: '500'
        },
        elements: {
            // Main form styling
            formButtonPrimary: {
                backgroundColor: '#e74c3c',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: '#c0392b',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(231, 76, 60, 0.3)'
                },
                '&:focus': {
                    backgroundColor: '#c0392b',
                    boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.2)'
                }
            },

            // Social buttons (Google, etc.)
            socialButtonsBlockButton: {
                backgroundColor: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '12px',
                transition: 'all 0.3s ease',
                '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    transform: 'translateY(-1px)'
                }
            },

            // Card/Modal styling
            card: {
                backgroundColor: 'rgba(26, 26, 26, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(231, 76, 60, 0.3)',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
                padding: '0'
            },

            // Header styling
            headerTitle: {
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: '700',
                textAlign: 'center',
                marginBottom: '8px'
            },

            headerSubtitle: {
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '14px',
                textAlign: 'center',
                marginBottom: '24px'
            },

            // Form inputs
            formFieldInput: {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '14px',
                padding: '12px 16px',
                transition: 'all 0.3s ease',
                '&:focus': {
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 0 3px rgba(231, 76, 60, 0.2)'
                },
                '&::placeholder': {
                    color: 'rgba(255, 255, 255, 0.6)'
                }
            },

            // Form field labels
            formFieldLabel: {
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px'
            },

            // Divider styling
            dividerLine: {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
            },

            dividerText: {
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '12px',
                fontWeight: '400'
            },

            // Footer links
            footerActionLink: {
                color: '#e74c3c',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none',
                '&:hover': {
                    color: '#c0392b',
                    textDecoration: 'underline'
                }
            },

            // Internal card content padding
            main: {
                padding: '32px 32px 24px 32px'
            },

            // Footer padding
            footer: {
                padding: '16px 32px 32px 32px'
            }
        },

        // Layout configuration
        layout: {
            socialButtonsPlacement: 'bottom',
            socialButtonsVariant: 'blockButton',
            termsPageUrl: '/terms',
            privacyPageUrl: '/privacy'
        }
    },

    // Sign-in configuration
    signIn: {
        afterSignInUrl: '/',
        redirectUrl: '/',
        appearance: {
            // Inherit from main appearance, can override specific elements
        }
    },

    // Sign-up configuration  
    signUp: {
        afterSignUpUrl: '/',
        redirectUrl: '/',
        appearance: {
            // Inherit from main appearance, can override specific elements
        }
    },

    // User button configuration
    userButton: {
        afterSignOutUrl: '/',
        showBranding: false,
        appearance: {
            elements: {
                // User button avatar styling
                userButtonAvatarBox: {
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid rgba(231, 76, 60, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: '#e74c3c',
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                    }
                },

                // User button container
                userButtonBox: {
                    flexDirection: 'row-reverse',
                    gap: '8px'
                },

                // User button trigger (the clickable area)
                userButtonTrigger: {
                    padding: '6px',
                    borderRadius: '50%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)'
                    }
                },

                // Dropdown menu/popover styling
                userButtonPopoverCard: {
                    backgroundColor: '#1a1a1a',
                    border: '2px solid rgba(231, 76, 60, 0.3)',
                    borderRadius: '12px',
                    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(231, 76, 60, 0.2)',
                    backdropFilter: 'blur(20px)',
                    marginTop: '8px'
                },

                // Dropdown menu header
                userButtonPopoverMain: {
                    padding: '16px'
                },

                // Dropdown menu footer  
                userButtonPopoverFooter: {
                    padding: '12px 16px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)'
                },

                // User info in dropdown
                userButtonPopoverMainHeader: {
                    marginBottom: '12px'
                },

                // User preview in dropdown
                userPreview: {
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: '8px 0'
                },

                // User preview text
                userPreviewMainIdentifier: {
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600'
                },

                userPreviewSecondaryIdentifier: {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px'
                },

                // Action buttons in dropdown
                userButtonPopoverActionButton: {
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        color: '#e74c3c'
                    }
                },

                // Sign out button specific styling
                userButtonPopoverActionButtonText: {
                    color: 'inherit'
                },

                // Menu items styling
                menuButton: {
                    backgroundColor: 'transparent',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        color: '#e74c3c'
                    }
                },

                // Icons in dropdown
                userButtonPopoverActionButtonIcon: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'color 0.3s ease'
                }
            }
        }
    }
};

// Helper function to check if Clerk is properly configured
window.ClerkConfig.isConfigured = function () {
    return this.publishableKey !== 'pk_test_YOUR_PUBLISHABLE_KEY_HERE' &&
        this.frontendApi !== 'YOUR_FRONTEND_API_URL';
}; 