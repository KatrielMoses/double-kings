import { auth, db } from './supabase-config.js';

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Main app initializing...');

    // Check current authentication status
    await checkAuthStatus();

    // Set up event listeners
    setupEventListeners();
});

async function checkAuthStatus() {
    try {
        currentUser = await auth.getCurrentUser();

        if (currentUser) {
            console.log('User authenticated:', currentUser.email);
            updateUIForAuthenticatedUser();
        } else {
            console.log('No user authenticated');
            updateUIForUnauthenticatedUser();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        updateUIForUnauthenticatedUser();
    }
}

function updateUIForAuthenticatedUser() {
    const userProfile = document.getElementById('userProfile');
    const authSection = document.querySelector('.auth-section');
    const userName = document.getElementById('user-name');

    if (userProfile && authSection && userName) {
        // Show user profile, hide login/signup buttons
        userProfile.style.display = 'flex';

        // Hide the login/signup buttons
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';

        // Set user name
        userName.textContent = currentUser.email.split('@')[0];
    }
}

function updateUIForUnauthenticatedUser() {
    const userProfile = document.getElementById('userProfile');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');

    if (userProfile) {
        userProfile.style.display = 'none';
    }

    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
}

function setupEventListeners() {
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openModal('loginModal');
        });
    }

    // Signup button
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            openModal('signupModal');
        });
    }

    // Get Started button
    const getStartedBtn = document.getElementById('getStartedBtn');
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            if (currentUser) {
                window.location.href = 'workout-logger.html';
            } else {
                openModal('signupModal');
            }
        });
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Modal close buttons
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Switch between login and signup
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('loginModal');
            openModal('signupModal');
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('signupModal');
            openModal('loginModal');
        });
    }

    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Google Sign-In buttons
    const googleSigninBtn = document.getElementById('custom-google-signin');
    const googleSignupBtn = document.getElementById('custom-google-signup');

    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', handleGoogleAuth);
    }

    if (googleSignupBtn) {
        googleSignupBtn.addEventListener('click', handleGoogleAuth);
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';

        // Clear form inputs
        const inputs = modal.querySelectorAll('input');
        inputs.forEach(input => input.value = '');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const result = await auth.signInWithPassword(email, password);

        if (result.success) {
            currentUser = result.user;
            console.log('Login successful:', currentUser.email);
            updateUIForAuthenticatedUser();
            closeModal('loginModal');
            showNotification('Welcome back!', 'success');
        } else {
            showNotification(result.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    try {
        const result = await auth.signUp(email, password, { name });

        if (result.success) {
            console.log('Signup successful');
            showNotification('Account created! Please check your email to verify your account.', 'success');
            closeModal('signupModal');
        } else {
            showNotification(result.error || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
    }
}

async function handleGoogleAuth() {
    try {
        const result = await auth.signInWithGoogle();

        if (result.success) {
            currentUser = result.user;
            console.log('Google auth successful:', currentUser.email);
            updateUIForAuthenticatedUser();
            closeModal('loginModal');
            closeModal('signupModal');
            showNotification('Welcome!', 'success');
        } else {
            showNotification(result.error || 'Google authentication failed', 'error');
        }
    } catch (error) {
        console.error('Google auth error:', error);
        showNotification('Google authentication failed. Please try again.', 'error');
    }
}

async function handleLogout() {
    try {
        const result = await auth.signOut();

        if (result.success) {
            currentUser = null;
            updateUIForUnauthenticatedUser();
            showNotification('Logged out successfully', 'success');
        } else {
            showNotification('Logout failed', 'error');
        }
    } catch (error) {
        console.error('Logout error:', error);
        showNotification('Logout failed', 'error');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Export for use in other modules
export { currentUser, checkAuthStatus }; 