import { auth, db, supabase } from './supabase-config.js';

let currentUser = null;

// Initialize home page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        currentUser = await auth.getCurrentUser();

        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const userProfile = document.getElementById('userProfile');
        const userName = document.getElementById('user-name');
        const logoutBtn = document.getElementById('logoutBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');

        if (currentUser) {
            // User is logged in
            const userProfileData = await db.getUserProfile(currentUser.id);

            // Hide login/signup buttons, show user profile
            loginBtn.style.display = 'none';
            signupBtn.style.display = 'none';
            userProfile.style.display = 'flex';

            // Update user name
            if (userName && userProfileData?.name) {
                userName.textContent = userProfileData.name;
            }

            // Update get started button
            getStartedBtn.textContent = 'Go to Workout Logger';
            getStartedBtn.onclick = () => {
                window.location.href = 'workout-logger.html';
            };
        } else {
            // User is not logged in
            loginBtn.style.display = 'block';
            signupBtn.style.display = 'block';
            userProfile.style.display = 'none';

            // Update get started button
            getStartedBtn.onclick = () => {
                document.getElementById('signupModal').style.display = 'block';
            };
        }

        // Modal handlers
        setupModalHandlers();

        // Logout handler
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await auth.signOut();
                window.location.reload();
            });
        }

        // Login button handler
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                document.getElementById('loginModal').style.display = 'block';
            });
        }

        // Signup button handler
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                document.getElementById('signupModal').style.display = 'block';
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
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('signupModal').style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('signupModal').style.display = 'none';
            document.getElementById('loginModal').style.display = 'block';
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
                    document.getElementById('loginModal').style.display = 'none';
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
                    alert('Account created successfully! Please check your email to verify your account.');
                    document.getElementById('signupModal').style.display = 'none';
                    // User will need to verify email before they can log in
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
} 