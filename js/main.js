// FREE TIER AUTHENTICATION - No Supabase needed!
// Uses browser localStorage for 100% FREE authentication

let currentUser = null;

// Initialize authentication
async function initAuth() {
    try {
        // Get current user from localStorage
        currentUser = auth.getCurrentUser();
        updateUI();

        // Listen for auth state changes
        auth.onAuthStateChange((event) => {
            currentUser = event.user;
            updateUI();
        });
    } catch (error) {
        console.error('Error initializing auth:', error);
    }
}

// Update UI based on authentication state
async function updateUI() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const userProfile = document.querySelector('.user-profile');
    const userName = document.getElementById('user-name');
    const workoutLink = document.getElementById('workout-link');
    const progressLink = document.getElementById('progress-link');
    const goalsLink = document.getElementById('goals-link');

    if (currentUser) {
        // Hide login/signup buttons, show user profile
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';

        // Update user name
        if (userName) {
            userName.textContent = currentUser.name || currentUser.email || 'User';
        }

        // Enable navigation links
        [workoutLink, progressLink, goalsLink].forEach(link => {
            if (link) {
                link.classList.remove('disabled');
                link.style.opacity = '1';
                link.style.pointerEvents = 'all';
            }
        });

        // Close any open modals
        const loginModal = document.getElementById('loginModal');
        const signupModal = document.getElementById('signupModal');
        if (loginModal) loginModal.style.display = 'none';
        if (signupModal) signupModal.style.display = 'none';
    } else {
        // User is not logged in
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';

        // Disable navigation links
        [workoutLink, progressLink, goalsLink].forEach(link => {
            if (link) {
                link.classList.add('disabled');
                link.style.opacity = '0.5';
                link.style.pointerEvents = 'none';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('Please log in to access this feature');
                });
            }
        });
    }
}

// Logout function
async function logout() {
    try {
        const result = auth.signOut();
        if (result.success) {
            currentUser = null;
            updateUI();
            // Redirect to home page if on protected page
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = 'index.html';
            }
            showNotification('Successfully logged out!', 'success');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    setupEventListeners();
    setupAnimations();
});

// Setup event listeners
function setupEventListeners() {
    // Modal Elements
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const closeBtns = document.querySelectorAll('.close');
    const ctaBtn = document.querySelector('.cta-btn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Event Listeners
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            if (currentUser) {
                window.location.href = 'workout-logger.html';
            } else {
                if (signupModal) signupModal.style.display = 'block';
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Modal Close Functions
    if (closeBtns && closeBtns.length > 0) {
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (loginModal) loginModal.style.display = 'none';
                if (signupModal) signupModal.style.display = 'none';
            });
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === loginModal || e.target === signupModal) {
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'none';
        }
    });

    // Switch between login and signup modals
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            if (signupModal) signupModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Google Sign-In buttons
    const googleSignInBtn = document.getElementById('custom-google-signin');
    const googleSignUpBtn = document.getElementById('custom-google-signup');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    }

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', handleGoogleSignIn);
    }

    // Form submissions
    setupFormHandlers();
}

// Setup form handlers
function setupFormHandlers() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                const result = await auth.signIn(email, password);

                if (result.success) {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'none';
                    showNotification('Successfully logged in!', 'success');
                } else {
                    showNotification('Login failed: ' + result.error, 'error');
                }
            } catch (error) {
                showNotification('Login error: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            try {
                const result = await auth.signUp(email, password, name);

                if (result.success) {
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) signupModal.style.display = 'none';
                    showNotification('Account created successfully!', 'success');
                } else {
                    showNotification('Signup failed: ' + result.error, 'error');
                }
            } catch (error) {
                showNotification('Signup error: ' + error.message, 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
}

// Google Sign-In handler
async function handleGoogleSignIn() {
    try {
        const result = await auth.signInWithGoogle();

        if (result.success) {
            // Close modals
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'none';

            showNotification('Successfully signed in with Google!', 'success');
        } else {
            showNotification('Google sign-in failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        showNotification('Google sign-in error: ' + error.message, 'error');
    }
}

// Setup animations
function setupAnimations() {
    // Intersection Observer for scroll animations
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature, .class-category');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        });

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
    };

    animateOnScroll();
}

// Notification system
export function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        font-size: 14px;
        min-width: 300px;
        max-width: 500px;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
} 