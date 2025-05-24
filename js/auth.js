// Authentication System
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('user-name');
    const workoutLink = document.getElementById('workout-link');
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const getStartedBtn = document.getElementById('getStartedBtn');
    const closeBtns = document.querySelectorAll('.close');

    // Initialize auth state
    initAuth();

    // Event Listeners
    if (loginBtn) loginBtn.addEventListener('click', () => showModal(loginModal));
    if (signupBtn) signupBtn.addEventListener('click', () => showModal(signupModal));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (switchToSignup) switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(loginModal);
        showModal(signupModal);
    });
    if (switchToLogin) switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(signupModal);
        showModal(loginModal);
    });
    if (getStartedBtn) getStartedBtn.addEventListener('click', handleGetStarted);

    // Close modal with X or clicking outside
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(loginModal);
            hideModal(signupModal);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) hideModal(loginModal);
        if (e.target === signupModal) hideModal(signupModal);
    });

    // Handle Form Submissions
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Initialize Google Sign-In
    window.handleGoogleSignIn = handleGoogleSignIn;

    // Custom Google Sign-In button
    const customGoogleSignInBtn = document.getElementById('custom-google-signin');
    if (customGoogleSignInBtn) {
        customGoogleSignInBtn.addEventListener('click', handleCustomGoogleSignIn);
    }

    // Custom Google Sign-Up button
    const customGoogleSignUpBtn = document.getElementById('custom-google-signup');
    if (customGoogleSignUpBtn) {
        customGoogleSignUpBtn.addEventListener('click', handleCustomGoogleSignIn);
    }

    // Functions
    function initAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');

        if (isLoggedIn && userData) {
            updateUIAuthenticated(userData);
        } else {
            updateUIUnauthenticated();
        }
    }

    function updateUIAuthenticated(userData) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';

        if (userName && userData.name) userName.textContent = userData.name;

        // Ensure workout logger link is enabled
        if (workoutLink) {
            workoutLink.classList.remove('disabled');
            workoutLink.style.opacity = '1';
            workoutLink.style.pointerEvents = 'all';

            // Add a visual indicator that it's active
            workoutLink.style.fontWeight = 'bold';
            workoutLink.style.color = 'var(--secondary-color)';
        }
    }

    function updateUIUnauthenticated() {
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (signupBtn) signupBtn.style.display = 'inline-block';
        if (userProfile) userProfile.style.display = 'none';

        // Disable workout logger link
        if (workoutLink) {
            workoutLink.classList.add('disabled');
            workoutLink.style.opacity = '0.5';
            workoutLink.style.pointerEvents = 'none';
        }
    }

    function showModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            modal.style.justifyContent = 'center';
            modal.style.alignItems = 'center';
        }
    }

    function hideModal(modal) {
        if (modal) modal.style.display = 'none';
    }

    function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Get users from local storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            authenticateUser({
                id: user.id,
                name: user.name,
                email: user.email
            });
            hideModal(loginModal);
        } else {
            alert('Invalid email or password');
        }
    }

    function handleSignup(e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        // Get users from local storage
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if user already exists
        if (users.some(u => u.email === email)) {
            alert('User with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password
        };

        // Add to users array
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Authenticate user
        authenticateUser({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        });

        hideModal(signupModal);
    }

    function handleLogout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');
        updateUIUnauthenticated();
    }

    function handleGetStarted() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        if (isLoggedIn) {
            window.location.href = 'workout-logger.html';
        } else {
            showModal(signupModal);
        }
    }

    function authenticateUser(userData) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(userData));
        updateUIAuthenticated(userData);
    }

    function handleGoogleSignIn(response) {
        // Parse the JWT token
        const tokenPayload = parseJwt(response.credential);

        if (tokenPayload) {
            const googleUser = {
                id: tokenPayload.sub,
                name: tokenPayload.name,
                email: tokenPayload.email
            };

            // Store user in local storage if not exists
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (!users.some(u => u.email === googleUser.email)) {
                // Add Google user (without password)
                users.push({
                    ...googleUser,
                    authProvider: 'google'
                });
                localStorage.setItem('users', JSON.stringify(users));
            }

            // Authenticate user
            authenticateUser(googleUser);

            // Hide modals
            hideModal(loginModal);
            hideModal(signupModal);
        }
    }

    // Helper function to parse JWT token
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('Error parsing JWT token', e);
            return null;
        }
    }

    // Custom Google Sign-In handler
    function handleCustomGoogleSignIn() {
        try {
            // Use a popup window approach which is less affected by COOP issues
            const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=339560381414-l2c1p2759q3ben60tvt6mflsqojqo3tu.apps.googleusercontent.com&response_type=token&redirect_uri=${encodeURIComponent(window.location.origin + '/google-callback.html')}&scope=email%20profile`;

            // Show a loading indicator on the button
            const button = event.target.closest('button');
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            button.disabled = true;

            const popup = window.open(googleAuthUrl, 'googleSignIn', 'width=500,height=600');

            // Check if popup was blocked
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                // Popup was blocked or closed
                button.innerHTML = originalText;
                button.disabled = false;
                alert("Popup blocked! Please allow popups for this site to use Google Sign-In.");
                return;
            }

            // Reset button after 20 seconds (failsafe)
            const timeout = setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 20000);

            // Check for redirect with token
            const messageHandler = (event) => {
                if (event.origin === window.location.origin && event.data && event.data.type === 'googleSignIn') {
                    // Clear the timeout and listener when we get a response
                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);

                    button.innerHTML = originalText;
                    button.disabled = false;

                    const { profile } = event.data;

                    if (profile) {
                        const googleUser = {
                            id: profile.sub,
                            name: profile.name,
                            email: profile.email
                        };

                        // Store user in local storage if not exists
                        const users = JSON.parse(localStorage.getItem('users') || '[]');
                        if (!users.some(u => u.email === googleUser.email)) {
                            users.push({
                                ...googleUser,
                                authProvider: 'google'
                            });
                            localStorage.setItem('users', JSON.stringify(users));
                        }

                        // Authenticate user
                        authenticateUser(googleUser);

                        // Hide modals
                        hideModal(loginModal);
                        hideModal(signupModal);
                    }
                }
            };

            window.addEventListener('message', messageHandler);

        } catch (error) {
            console.error('Error during Google Sign-In:', error);
            alert('Google Sign-In failed. Please try again later.');
        }
    }
}); 