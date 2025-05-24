let auth0Client = null;
let isAuthenticated = false;

// Initialize Auth0
async function initAuth0() {
    try {
        auth0Client = await auth0.createAuth0Client({
            domain: auth0Config.domain,
            clientId: auth0Config.clientId,
            authorizationParams: {
                redirect_uri: auth0Config.redirectUri,
                scope: 'openid profile email'
            }
        });

        // Check if user is authenticated
        isAuthenticated = await auth0Client.isAuthenticated();
        updateUI();

        // Handle redirect callback
        if (window.location.search.includes("code=")) {
            await auth0Client.handleRedirectCallback();
            window.history.replaceState({}, document.title, window.location.pathname);
            isAuthenticated = await auth0Client.isAuthenticated();
            updateUI();
        }
    } catch (err) {
        console.error("Error initializing Auth0:", err);
        alert("Error initializing authentication. Please try again later.");
    }
}

// Update UI based on authentication state
async function updateUI() {
    const loginBtn = document.querySelector('.login-btn');
    const signupBtn = document.querySelector('.signup-btn');
    const userProfile = document.querySelector('.user-profile');
    const userPicture = document.getElementById('user-picture');
    const userName = document.getElementById('user-name');

    if (isAuthenticated) {
        const user = await auth0Client.getUser();
        userPicture.src = user.picture || 'https://via.placeholder.com/32';
        userName.textContent = user.name;

        loginBtn.style.display = 'none';
        signupBtn.style.display = 'none';
        userProfile.style.display = 'flex';

        // Close any open modals
        loginModal.style.display = 'none';
        signupModal.style.display = 'none';
    } else {
        loginBtn.style.display = 'inline-block';
        signupBtn.style.display = 'inline-block';
        userProfile.style.display = 'none';
    }
}

// Login with Auth0
async function login(connection = null) {
    if (!auth0Client) {
        console.error("Auth0 client not initialized");
        alert("Authentication service is still initializing. Please try again in a moment.");
        return;
    }

    try {
        const options = {
            authorizationParams: {
                redirect_uri: auth0Config.redirectUri,
                scope: 'openid profile email'
            }
        };

        if (connection) {
            options.authorizationParams.connection = connection;

            // Close modals before redirect
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';

            // Show loading state
            const btn = document.querySelector(`.${connection === 'google-oauth2' ? 'google' : 'facebook'}-btn`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

                // Reset button after 2 seconds if redirect hasn't happened
                setTimeout(() => {
                    btn.innerHTML = originalText;
                }, 2000);
            }
        }

        console.log('Redirecting with options:', options); // Debug log
        await auth0Client.loginWithRedirect(options);
    } catch (err) {
        console.error("Error during login:", err);
        alert(`Login failed: ${err.message || 'Please try again later.'}`);

        // Reset any loading states
        document.querySelectorAll('.social-login-btn').forEach(btn => {
            btn.disabled = false;
        });
    }
}

// Logout
async function logout() {
    try {
        await auth0Client.logout({
            logoutParams: {
                returnTo: window.location.origin
            }
        });
        isAuthenticated = false;
        updateUI();
    } catch (err) {
        console.error("Error during logout:", err);
    }
}

// Modal Elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginBtn = document.querySelector('.login-btn');
const signupBtn = document.querySelector('.signup-btn');
const closeBtns = document.querySelectorAll('.close');
const ctaBtn = document.querySelector('.cta-btn');
const logoutBtn = document.querySelector('.logout-btn');

// Social login buttons
const googleBtns = document.querySelectorAll('.google-btn');
const facebookBtns = document.querySelectorAll('.facebook-btn');

// Event Listeners - Add null checks before adding event listeners
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        signupModal.style.display = 'block';
    });
}

if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
        if (isAuthenticated) {
            // Handle authenticated user action
            console.log('User is already authenticated');
        } else {
            signupModal.style.display = 'block';
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

// Social login handlers - Add null checks
if (googleBtns && googleBtns.length > 0) {
    googleBtns.forEach(btn => {
        btn.addEventListener('click', () => login('google-oauth2'));
    });
}

if (facebookBtns && facebookBtns.length > 0) {
    facebookBtns.forEach(btn => {
        btn.addEventListener('click', () => login('facebook'));
    });
}

// Form Submissions
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;

        try {
            await auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.location.origin,
                    connection: 'Username-Password-Authentication',
                    username: email,
                    password: password
                }
            });
        } catch (err) {
            console.error("Error during form login:", err);
            alert('Login failed. Please check your credentials and try again.');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        const password = e.target.querySelector('input[type="password"]').value;
        const name = e.target.querySelector('input[type="text"]').value;

        try {
            await auth0Client.loginWithRedirect({
                authorizationParams: {
                    redirect_uri: window.location.origin,
                    screen_hint: 'signup',
                    connection: 'Username-Password-Authentication',
                    username: email,
                    password: password,
                    name: name
                }
            });
        } catch (err) {
            console.error("Error during form signup:", err);
            alert('Sign up failed. Please try again.');
        }
    });
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in (from localStorage)
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userName = localStorage.getItem('userName') || 'User';

    // DOM elements
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName_el = document.getElementById('user-name');
    const logoutBtn = document.getElementById('logoutBtn');
    const workoutLink = document.getElementById('workout-link');
    const loginModal = document.getElementById('loginModal');
    const closeBtns = document.querySelectorAll('.close');
    const getStartedBtn = document.getElementById('getStartedBtn');

    // Quick template elements - these were removed in the UI update
    const quickTemplateType = document.getElementById('quickTemplateType');
    const quickTemplateDay = document.getElementById('quickTemplateDay');
    const quickLoadTemplateBtn = document.getElementById('quickLoadTemplate');

    // Add event listeners only if elements exist (prevents null errors)
    if (quickTemplateType && quickTemplateDay && quickLoadTemplateBtn) {
        quickTemplateType.addEventListener('change', () => {
            // Event handler code here
        });

        quickLoadTemplateBtn.addEventListener('click', () => {
            // Event handler code here
        });
    }

    // Update UI based on login state
    function updateUI() {
        if (isLoggedIn) {
            // Update login button if it exists
            if (loginBtn) {
                loginBtn.style.display = 'none';
            }

            // Update user profile if it exists
            if (userProfile) {
                userProfile.style.display = 'flex';
            }

            // Update user name if element exists
            if (userName_el) {
                userName_el.textContent = userName;
            }

            // Enable workout logger link
            if (workoutLink) {
                workoutLink.classList.remove('disabled');
                workoutLink.style.opacity = '1';
                workoutLink.style.pointerEvents = 'all';
            }

            // Enable progress monitoring link
            const progressLink = document.getElementById('progress-link');
            if (progressLink) {
                progressLink.classList.remove('disabled');
                progressLink.style.opacity = '1';
                progressLink.style.pointerEvents = 'all';
            }
        } else {
            // Update login button if it exists
            if (loginBtn) {
                loginBtn.style.display = 'block';
            }

            // Update user profile if it exists
            if (userProfile) {
                userProfile.style.display = 'none';
            }

            // Disable workout logger link
            if (workoutLink) {
                workoutLink.classList.add('disabled');
                workoutLink.style.opacity = '0.5';
                workoutLink.style.pointerEvents = 'none';
            }

            // Disable progress monitoring link
            const progressLink = document.getElementById('progress-link');
            if (progressLink) {
                progressLink.classList.add('disabled');
                progressLink.style.opacity = '0.5';
                progressLink.style.pointerEvents = 'none';
            }
        }
    }

    // Call updateUI on page load
    updateUI();

    // Login functionality
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });
    }

    // Get Started button
    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            if (isLoggedIn) {
                window.location.href = 'workout-logger.html';
            } else {
                loginModal.style.display = 'block';
            }
        });
    }

    // Close modal functionality
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent the link from navigating
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Simulate login (in a real app, this would validate with a backend)
            const email = document.getElementById('email').value;
            const userName = email.split('@')[0]; // Use part of email as username

            // Store in localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', userName);

            // Update UI and redirect
            loginModal.style.display = 'none';
            window.location.reload();
        });
    }

    // Initialize the navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.classList.contains('disabled')) {
                e.preventDefault();
                alert('Please log in to access the Workout Logger');
            } else {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip if href is just '#'
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll effect for navigation
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Add animation class to elements when they come into view
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature');

        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
});

// Common functionality across all pages
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-color);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.error {
            background: #e74c3c;
        }
        
        .notification i {
            font-size: 18px;
        }
    `;
    document.head.appendChild(style);
} 