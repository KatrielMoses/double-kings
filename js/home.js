// FREE TIER AUTHENTICATION - No Supabase needed!
// Uses browser localStorage for 100% FREE authentication

let currentUser = null;

// Initialize home page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get current user from localStorage (no async needed)
        currentUser = auth.getCurrentUser();

        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logoutBtn');

        if (currentUser) {
            // User is logged in
            // Hide login/signup buttons, show user profile
            if (loginBtn) loginBtn.style.display = 'none';
            if (signupBtn) signupBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';

            // Update user name
            if (userName) {
                userName.textContent = currentUser.name || currentUser.email || 'User';
            }
        } else {
            // User is not logged in
            if (loginBtn) loginBtn.style.display = 'block';
            if (signupBtn) signupBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
        }

        // Modal handlers
        setupModalHandlers();

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                auth.signOut();
                window.location.reload();
            });
        }

        // Login button handler
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const loginModal = document.getElementById('loginModal');
                if (loginModal) loginModal.style.display = 'block';
            });
        }

        // Signup button handler
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                const signupModal = document.getElementById('signupModal');
                if (signupModal) signupModal.style.display = 'block';
            });
        }

    } catch (error) {
        console.error('Error initializing home page:', error);
    }
});

function setupModalHandlers() {
    // Modal close handlers
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            closeBtn.closest('.modal').style.display = 'none';
        });
    });

    // Click outside modal to close
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Switch between login and signup
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');

    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            const loginModal = document.getElementById('loginModal');
            const signupModal = document.getElementById('signupModal');
            if (loginModal) loginModal.style.display = 'none';
            if (signupModal) signupModal.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            const signupModal = document.getElementById('signupModal');
            const loginModal = document.getElementById('loginModal');
            if (signupModal) signupModal.style.display = 'none';
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                const result = await auth.signIn(email, password);

                if (result.success) {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Login failed: ' + result.error);
                }
            } catch (error) {
                alert('Login error: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }

    // Signup form handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';

            try {
                const result = await auth.signUp(email, password, name);

                if (result.success) {
                    alert('Account created successfully! You are now logged in.');
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) signupModal.style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Signup failed: ' + result.error);
                }
            } catch (error) {
                alert('Signup error: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }

    // Google Sign-In buttons
    const googleSignInBtn = document.getElementById('custom-google-signin');
    const googleSignUpBtn = document.getElementById('custom-google-signup');

    if (googleSignInBtn) {
        googleSignInBtn.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithGoogle();
                if (result.success) {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Google sign-in failed: ' + result.error);
                }
            } catch (error) {
                alert('Google sign-in error: ' + error.message);
            }
        });
    }

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener('click', async () => {
            try {
                const result = await auth.signInWithGoogle();
                if (result.success) {
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) signupModal.style.display = 'none';
                    window.location.reload();
                } else {
                    alert('Google sign-in failed: ' + result.error);
                }
            } catch (error) {
                alert('Google sign-in error: ' + error.message);
            }
        });
    }
} 