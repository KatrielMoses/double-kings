/**
 * MODERN UI INTERACTIONS
 * Enhanced user experience with smooth animations,
 * form validation, notifications, and micro-interactions
 */

class ModernUI {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.setupNavbar();
        this.setupModals();
        this.setupForms();
        this.setupAnimations();
        this.createNotificationContainer();
        this.setupMobileMenu();
        this.setupScrollEffects();
    }

    // =========================================================================
    // NAVBAR FUNCTIONALITY
    // =========================================================================
    setupNavbar() {
        const navbar = document.querySelector('.modern-navbar');
        if (!navbar) return;

        // Scroll effect for navbar
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Smooth scroll for nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
    }

    // =========================================================================
    // MOBILE MENU
    // =========================================================================
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-nav-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!toggle) return;

        toggle.addEventListener('click', () => {
            const isActive = toggle.classList.contains('active');

            if (isActive) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        });

        // Close on overlay click
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    openMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-nav-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        toggle?.classList.add('active');
        mobileMenu?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-nav-menu');
        const overlay = document.querySelector('.mobile-menu-overlay');

        toggle?.classList.remove('active');
        mobileMenu?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = '';
    }

    // =========================================================================
    // MODAL FUNCTIONALITY
    // =========================================================================
    setupModals() {
        // Setup modal triggers
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                e.preventDefault();
                const modalId = modalTrigger.getAttribute('data-modal');
                this.openModal(modalId);
            }

            const modalClose = e.target.closest('.modal-close, .modal-overlay');
            if (modalClose) {
                this.closeModal();
            }
        });

        // Close modal on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Focus management
        const firstInput = modal.querySelector('input, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // Add entrance animation
        const container = modal.querySelector('.modal-container');
        if (container) {
            container.style.transform = 'scale(0.9) translateY(20px)';
            container.style.opacity = '0';

            setTimeout(() => {
                container.style.transform = 'scale(1) translateY(0)';
                container.style.opacity = '1';
            }, 10);
        }
    }

    closeModal() {
        const activeModal = document.querySelector('.modern-modal.active');
        if (!activeModal) return;

        const container = activeModal.querySelector('.modal-container');
        if (container) {
            container.style.transform = 'scale(0.9) translateY(20px)';
            container.style.opacity = '0';
        }

        setTimeout(() => {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }, 200);
    }

    // =========================================================================
    // FORM ENHANCEMENTS
    // =========================================================================
    setupForms() {
        document.querySelectorAll('.modern-form').forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('.form-input');
        const submitBtn = form.querySelector('.form-submit');

        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateField(input);
            });

            input.addEventListener('blur', () => {
                this.validateField(input);
            });

            // Floating label effect
            this.setupFloatingLabel(input);
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Validate all fields
            let isValid = true;
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showNotification('Please fix the errors before submitting', 'error');
                return;
            }

            // Submit with loading state
            this.setLoadingState(submitBtn, true);

            try {
                await this.handleFormSubmit(form);
            } catch (error) {
                this.showNotification(error.message, 'error');
            } finally {
                this.setLoadingState(submitBtn, false);
            }
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');

        let isValid = true;
        let message = '';

        // Required validation
        if (required && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Email validation
        else if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        }

        // Password validation
        else if (type === 'password' && value) {
            if (value.length < 6) {
                isValid = false;
                message = 'Password must be at least 6 characters';
            }
        }

        this.setFieldValidation(input, isValid, message);
        return isValid;
    }

    setFieldValidation(input, isValid, message) {
        const group = input.closest('.form-group');
        let errorEl = group?.querySelector('.field-error');

        // Remove existing error
        if (errorEl) {
            errorEl.remove();
        }

        if (isValid) {
            input.classList.remove('error');
            input.classList.add('valid');
        } else {
            input.classList.remove('valid');
            input.classList.add('error');

            // Add error message
            if (message && group) {
                errorEl = document.createElement('div');
                errorEl.className = 'field-error';
                errorEl.textContent = message;
                errorEl.style.cssText = `
                    color: var(--secondary-color);
                    font-size: 0.8rem;
                    margin-top: 0.25rem;
                    opacity: 0;
                    transform: translateY(-5px);
                    transition: all 0.3s ease;
                `;
                group.appendChild(errorEl);

                // Animate in
                setTimeout(() => {
                    errorEl.style.opacity = '1';
                    errorEl.style.transform = 'translateY(0)';
                }, 10);
            }
        }
    }

    setupFloatingLabel(input) {
        const placeholder = input.getAttribute('placeholder');
        if (!placeholder) return;

        const group = input.closest('.form-group');
        if (!group) return;

        // Create floating label
        const label = document.createElement('label');
        label.className = 'floating-label';
        label.textContent = placeholder;
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 1rem;
            transform: translateY(-50%);
            color: var(--text-muted);
            pointer-events: none;
            transition: all 0.3s ease;
            background: var(--bg-modal);
            padding: 0 0.25rem;
            font-size: 1rem;
        `;

        group.style.position = 'relative';
        group.appendChild(label);
        input.placeholder = '';

        // Handle focus/blur
        const updateLabel = () => {
            if (input.value || input === document.activeElement) {
                label.style.top = '0';
                label.style.fontSize = '0.8rem';
                label.style.color = 'var(--secondary-color)';
            } else {
                label.style.top = '50%';
                label.style.fontSize = '1rem';
                label.style.color = 'var(--text-muted)';
            }
        };

        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);

        updateLabel(); // Initial state
    }

    setLoadingState(button, loading) {
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;

            // Add spinner if not exists
            if (!button.querySelector('.loading-spinner')) {
                const spinner = document.createElement('span');
                spinner.className = 'loading-spinner';
                button.insertBefore(spinner, button.firstChild);
            }
        } else {
            button.classList.remove('loading');
            button.disabled = false;

            const spinner = button.querySelector('.loading-spinner');
            if (spinner) {
                spinner.remove();
            }
        }
    }

    async handleFormSubmit(form) {
        const formType = form.closest('.modern-modal').id;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Simulate API delay for demo
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (formType === 'login-modal') {
            // Handle login
            if (window.auth) {
                const result = await window.auth.signIn(data.email, data.password);
                if (result.success) {
                    this.showNotification('Welcome back! Successfully logged in.', 'success');
                    this.closeModal();
                    this.updateAuthState(result.user);
                } else {
                    throw new Error(result.error || 'Login failed');
                }
            }
        } else if (formType === 'signup-modal') {
            // Handle signup
            if (window.auth) {
                const result = await window.auth.signUp(data.email, data.password, data.name);
                if (result.success) {
                    this.showNotification('Account created successfully! Welcome to Double Kings Fitness.', 'success');
                    this.closeModal();
                    this.updateAuthState(result.user);
                } else {
                    throw new Error(result.error || 'Signup failed');
                }
            }
        }
    }

    // =========================================================================
    // NOTIFICATION SYSTEM
    // =========================================================================
    createNotificationContainer() {
        if (document.querySelector('.notification-container')) return;

        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const titles = {
            success: 'Success!',
            error: 'Error!',
            info: 'Info',
            warning: 'Warning!'
        };

        notification.innerHTML = `
            <div class="notification-title">${titles[type]}</div>
            <div class="notification-message">${message}</div>
        `;

        container.appendChild(notification);
        this.notifications.push(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Auto remove
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }

    removeNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 300);
    }

    // =========================================================================
    // ANIMATIONS
    // =========================================================================
    setupAnimations() {
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupParticles();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for scroll animations
        document.querySelectorAll('.hero-content, .feature-card, .class-card').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Add ripple effect to buttons
        document.querySelectorAll('.modern-btn, .form-submit, .google-signin').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.createRipple(e, btn);
            });
        });
    }

    createRipple(event, element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        // Add ripple animation keyframes if not exists
        if (!document.querySelector('#ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    setupParticles() {
        const hero = document.querySelector('.modern-hero');
        if (!hero) return;

        let particlesContainer = hero.querySelector('.hero-particles');
        if (!particlesContainer) {
            particlesContainer = document.createElement('div');
            particlesContainer.className = 'hero-particles';
            hero.appendChild(particlesContainer);
        }

        // Create floating particles
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);
        }
    }

    // =========================================================================
    // SCROLL EFFECTS
    // =========================================================================
    setupScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;

            // Parallax effect for hero
            const hero = document.querySelector('.modern-hero');
            if (hero) {
                hero.style.transform = `translateY(${rate}px)`;
            }

            ticking = false;
        };

        const requestScrollUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestScrollUpdate);
    }

    // =========================================================================
    // AUTH STATE MANAGEMENT
    // =========================================================================
    updateAuthState(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');

        if (user) {
            // User is logged in
            if (authButtons) {
                authButtons.innerHTML = `
                    <div class="user-menu">
                        <button class="modern-btn btn-outline user-profile">
                            <span class="user-avatar">${user.name?.charAt(0) || 'U'}</span>
                            ${user.name || user.email}
                        </button>
                        <button class="modern-btn btn-outline" onclick="modernUI.logout()">
                            Logout
                        </button>
                    </div>
                `;
            }
        } else {
            // User is logged out
            if (authButtons) {
                authButtons.innerHTML = `
                    <button class="modern-btn btn-outline" data-modal="login-modal">Login</button>
                    <button class="modern-btn btn-primary" data-modal="signup-modal">Sign Up</button>
                `;
            }
        }
    }

    async logout() {
        if (window.auth) {
            const result = await window.auth.signOut();
            if (result.success) {
                this.showNotification('Successfully logged out. See you next time!', 'info');
                this.updateAuthState(null);
            }
        }
    }

    // =========================================================================
    // GOOGLE AUTH INTEGRATION
    // =========================================================================
    async handleGoogleSignIn() {
        try {
            this.showNotification('Connecting to Google...', 'info');

            if (!window.auth) {
                throw new Error('Authentication service not available');
            }

            const result = await window.auth.signInWithGoogle();

            if (result.success) {
                this.showNotification('Successfully signed in with Google!', 'success');
                this.closeModal();
                this.updateAuthState(result.user);
            } else {
                throw new Error(result.error || 'Google sign-in failed');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showNotification(error.message || 'Google sign-in failed', 'error');
        }
    }
}

// Initialize Modern UI
const modernUI = new ModernUI();

// Make it globally available
window.modernUI = modernUI;

// Initialize auth state on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.auth) {
        const currentUser = window.auth.getCurrentUser();
        modernUI.updateAuthState(currentUser);
    }

    // Add CSS for form validation
    const style = document.createElement('style');
    style.textContent = `
        .form-input.error {
            border-color: var(--secondary-color);
            background: rgba(231, 76, 60, 0.05);
        }
        
        .form-input.valid {
            border-color: #27ae60;
            background: rgba(39, 174, 96, 0.05);
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out;
        }
        
        .user-menu {
            display: flex;
            align-items: center;
            gap: var(--space-sm);
        }
        
        .user-avatar {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: var(--gradient-primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 0.8rem;
            margin-right: 0.5rem;
        }
    `;
    document.head.appendChild(style);
}); 