/**
 * FREE AUTHENTICATION SERVICE
 * Uses browser localStorage for 100% FREE authentication
 * Supports Google OAuth and local email/password auth
 * No server costs, works offline
 */

class FreeAuthService {
    constructor() {
        this.storageKeys = {
            currentUser: 'fitness_current_user',
            users: 'fitness_users'
        };
        this.currentUser = this.getCurrentUser();
        this.googleClientId = null; // Will be set when initialized
        this.initializeGoogleAuth();
    }

    // Initialize Google OAuth (Client-side only)
    async initializeGoogleAuth() {
        try {
            // Load Google Identity Services
            if (!window.google) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.onload = () => this.setupGoogleAuth();
                document.head.appendChild(script);
            } else {
                this.setupGoogleAuth();
            }
        } catch (error) {
            console.error('Google Auth initialization error:', error);
        }
    }

    setupGoogleAuth() {
        if (window.google) {
            // Get the actual Google Client ID from config
            this.googleClientId = window.GOOGLE_CONFIG ? window.GOOGLE_CONFIG.CLIENT_ID : null;

            if (this.googleClientId && this.googleClientId !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                window.google.accounts.id.initialize({
                    client_id: this.googleClientId,
                    callback: (response) => this.handleGoogleCallback(response),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    ux_mode: 'popup',
                    context: 'signin'
                });
                console.log('✅ Google OAuth initialized successfully with Client ID:', this.googleClientId);
            } else {
                console.warn('⚠️ Google Client ID not found. Please check GOOGLE_CONFIG.');
            }
        }
    }

    // Handle Google OAuth callback
    async handleGoogleCallback(response) {
        try {
            // Decode the JWT token from Google
            const payload = this.parseJwt(response.credential);

            if (!payload) {
                throw new Error('Failed to decode Google token');
            }

            const userData = {
                id: 'google_' + payload.sub,
                email: payload.email,
                name: payload.name,
                picture: payload.picture,
                provider: 'google',
                createdAt: new Date().toISOString(),
                verified: true
            };

            console.log('Google user authenticated:', userData.email);

            // Save user and log them in
            this.saveUser(userData);
            this.setCurrentUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Google auth error:', error);
            return { success: false, error: error.message };
        }
    }

    // Email/Password Authentication
    async signUp(email, password, name) {
        try {
            // Check if user already exists
            const existingUser = this.findUserByEmail(email);
            if (existingUser) {
                return { success: false, error: 'User already exists' };
            }

            // Create new user
            const userData = {
                id: this.generateId(),
                email: email,
                name: name,
                passwordHash: await this.hashPassword(password),
                provider: 'email',
                createdAt: new Date().toISOString(),
                verified: true // For demo purposes, auto-verify
            };

            this.saveUser(userData);
            this.setCurrentUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const user = this.findUserByEmail(email);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            if (user.provider === 'google') {
                return { success: false, error: 'Please sign in with Google' };
            }

            const isValidPassword = await this.verifyPassword(password, user.passwordHash);
            if (!isValidPassword) {
                return { success: false, error: 'Invalid password' };
            }

            this.setCurrentUser(user);
            return { success: true, user: user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            if (!window.google || !this.googleClientId || this.googleClientId === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
                console.error('❌ Google OAuth not properly configured');
                throw new Error('Google OAuth is not configured. Please check your Google Client ID.');
            }

            return new Promise((resolve, reject) => {
                // Use Google Identity Services popup
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                        // If prompt fails, try direct popup
                        this.triggerGooglePopup().then(resolve).catch(reject);
                    }
                });

                // Also provide a manual trigger option
                setTimeout(() => {
                    this.triggerGooglePopup().then(resolve).catch(reject);
                }, 1000);
            });
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    // Trigger Google popup sign-in
    async triggerGooglePopup() {
        return new Promise((resolve, reject) => {
            if (!window.google || !this.googleClientId) {
                reject(new Error('Google OAuth not initialized'));
                return;
            }

            window.google.accounts.oauth2.initCodeClient({
                client_id: this.googleClientId,
                scope: 'email profile',
                ux_mode: 'popup',
                callback: async (response) => {
                    if (response.code) {
                        // Exchange code for user info (simplified client-side approach)
                        try {
                            const userInfo = await this.getGoogleUserInfo(response.access_token);
                            const userData = {
                                id: 'google_' + userInfo.id,
                                email: userInfo.email,
                                name: userInfo.name,
                                picture: userInfo.picture,
                                provider: 'google',
                                createdAt: new Date().toISOString(),
                                verified: true
                            };

                            this.saveUser(userData);
                            this.setCurrentUser(userData);
                            resolve({ success: true, user: userData });
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        reject(new Error('Google authentication failed'));
                    }
                },
                error_callback: (error) => {
                    reject(new Error('Google OAuth error: ' + error.error));
                }
            }).requestCode();
        });
    }

    // Get Google user info (alternative method)
    async getGoogleUserInfo(accessToken) {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user info');
            }

            return await response.json();
        } catch (error) {
            throw new Error('Failed to get Google user info: ' + error.message);
        }
    }

    // Demo Google OAuth (fallback when not configured)
    async openGoogleAuthDemo() {
        return new Promise((resolve, reject) => {
            const mockGoogleUser = {
                id: 'google_demo_' + Date.now(),
                email: 'demo@gmail.com',
                name: 'Demo Google User',
                picture: 'https://via.placeholder.com/100',
                provider: 'google',
                createdAt: new Date().toISOString(),
                verified: true
            };

            const proceed = confirm(
                '⚠️ DEMO MODE: Google Sign-in\n\n' +
                'Google OAuth is not configured yet.\n' +
                'This will create a demo Google user.\n\n' +
                'To set up real Google OAuth:\n' +
                '1. Get Google Client ID from Cloud Console\n' +
                '2. Update the googleClientId in the code\n\n' +
                'Click OK for demo, Cancel to abort.'
            );

            if (proceed) {
                this.saveUser(mockGoogleUser);
                this.setCurrentUser(mockGoogleUser);
                resolve({ success: true, user: mockGoogleUser });
            } else {
                reject(new Error('User cancelled demo authentication'));
            }
        });
    }

    signOut() {
        this.currentUser = null;
        localStorage.removeItem(this.storageKeys.currentUser);

        // Also sign out from Google if available
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.disableAutoSelect();
            } catch (error) {
                console.log('Google sign out not available');
            }
        }

        return { success: true };
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.storageKeys.currentUser);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    // User management
    saveUser(userData) {
        const users = this.getAllUsers();
        const existingIndex = users.findIndex(u => u.id === userData.id);

        if (existingIndex >= 0) {
            users[existingIndex] = { ...users[existingIndex], ...userData };
        } else {
            users.push(userData);
        }

        localStorage.setItem(this.storageKeys.users, JSON.stringify(users));
    }

    setCurrentUser(userData) {
        // Remove sensitive data before storing
        const { passwordHash, ...safeUserData } = userData;
        this.currentUser = safeUserData;
        localStorage.setItem(this.storageKeys.currentUser, JSON.stringify(safeUserData));
    }

    findUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(u => u.email === email);
    }

    getAllUsers() {
        try {
            const users = localStorage.getItem(this.storageKeys.users);
            return users ? JSON.parse(users) : [];
        } catch (error) {
            console.error('Error getting users:', error);
            return [];
        }
    }

    // Utility methods
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async hashPassword(password) {
        // Simple hash for demo - in production use proper crypto
        return btoa(password + 'fitness_salt_2024');
    }

    async verifyPassword(password, hash) {
        const computedHash = await this.hashPassword(password);
        return computedHash === hash;
    }

    parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Error parsing JWT:', error);
            return null;
        }
    }

    // Authentication state listener
    onAuthStateChange(callback) {
        // Simple implementation - call callback when user changes
        const originalSetCurrentUser = this.setCurrentUser.bind(this);
        this.setCurrentUser = (userData) => {
            originalSetCurrentUser(userData);
            callback({ user: userData });
        };

        const originalSignOut = this.signOut.bind(this);
        this.signOut = () => {
            const result = originalSignOut();
            callback({ user: null });
            return result;
        };

        // Initial call
        callback({ user: this.currentUser });
    }

    // Update Google Client ID (call this after getting from Google Cloud Console)
    setGoogleClientId(clientId) {
        this.googleClientId = clientId;
        this.setupGoogleAuth();
        console.log('Google Client ID updated:', clientId);
    }
}

// Initialize the free auth service
const freeAuth = new FreeAuthService();

// Global auth object for compatibility
window.auth = {
    signUp: (email, password, name) => freeAuth.signUp(email, password, name),
    signIn: (email, password) => freeAuth.signIn(email, password),
    signInWithGoogle: () => freeAuth.signInWithGoogle(),
    signOut: () => freeAuth.signOut(),
    getCurrentUser: () => freeAuth.getCurrentUser(),
    onAuthStateChange: (callback) => freeAuth.onAuthStateChange(callback),
    setGoogleClientId: (clientId) => freeAuth.setGoogleClientId(clientId) // New method to set client ID
};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FreeAuthService;
} 