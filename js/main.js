import { auth, db, supabase } from './supabase-config.js';

let currentUser = null;

// Initialize authentication
async function initAuth() {
    try {
        currentUser = await auth.getCurrentUser();
        updateUI();

        // Listen for auth state changes
        auth.onAuthStateChange((event, session) => {
            if (session) {
                currentUser = session.user;
                updateUI();
            } else {
                currentUser = null;
                updateUI();
            }
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
        const userProfileData = await db.getUserProfile(currentUser.id);

        // Hide login/signup buttons, show user profile
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';

        // Update user name
        if (userName && userProfileData?.name) {
            userName.textContent = userProfileData.name;
        } else if (userName && currentUser.user_metadata?.name) {
            userName.textContent = currentUser.user_metadata.name;
        } else if (userName && currentUser.email) {
            userName.textContent = currentUser.email;
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
        const result = await auth.signOut();
        if (result.success || result.error?.message?.includes('not signed in')) {
            currentUser = null;
            updateUI();
            // Redirect to home page if on protected page
            if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
                window.location.href = 'index.html';
            }
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
    const getStartedBtn = document.getElementById('getStartedBtn');
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

    if (ctaBtn || getStartedBtn) {
        const startBtn = ctaBtn || getStartedBtn;
        startBtn.addEventListener('click', () => {
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
                    showNotification('Account created successfully! Please check your email to verify your account.', 'success');
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) signupModal.style.display = 'none';
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

// Setup animations
function setupAnimations() {
    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature, .template-card, .stat-card');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-in');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
}

// Notification system
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Export functions for use in other modules
export { logout, initAuth, updateUI }; 