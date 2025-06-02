/**
 * PROFESSIONAL UI INTERACTIONS
 * Enterprise-grade user experience with zero console spam
 * Smooth animations, clean forms, professional notifications
 */

class ProfessionalUI {
    constructor() {
        this.notifications = [];
        this.isReady = false;
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        this.setupNavbar();
        this.setupModals();
        this.setupForms();
        this.setupAnimations();
        this.createNotificationContainer();
        this.setupMobileMenu();
        this.setupScrollEffects();
        this.isReady = true;
    }

    // =========================================================================
    // PROFESSIONAL NAVBAR
    // =========================================================================
    setupNavbar() {
        const navbar = document.querySelector('.modern-navbar');
        if (!navbar) return;

        // Throttled scroll handler for performance
        let scrollTimeout;
        const handleScroll = () => {
            if (scrollTimeout) return;
            scrollTimeout = setTimeout(() => {
                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
                scrollTimeout = null;
            }, 16); // 60fps
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Smooth navigation
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    this.smoothScrollTo(href);
                    this.closeMobileMenu();
                }
            });
        });
    }

    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const offsetTop = element.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // =========================================================================
    // MOBILE MENU
    // =========================================================================
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const overlay = document.querySelector('.mobile-menu-overlay');

        if (!toggle) return;

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMobileMenu();
        });

        if (overlay) {
            overlay.addEventListener('click', () => this.closeMobileMenu());
        }

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
                this.closeModal();
            }
        });

        // Close mobile menu on nav link click
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });
    }

    toggleMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const isActive = toggle?.classList.contains('active');

        if (isActive) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
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
    // PROFESSIONAL MODALS
    // =========================================================================
    setupModals() {
        // Setup modal triggers with event delegation
        document.addEventListener('click', (e) => {
            const modalTrigger = e.target.closest('[data-modal]');
            if (modalTrigger) {
                e.preventDefault();
                const modalId = modalTrigger.getAttribute('data-modal');
                this.openModal(modalId);
            }

            const modalClose = e.target.closest('.modal-close');
            if (modalClose) {
                e.preventDefault();
                this.closeModal();
            }

            // Close modal on backdrop click
            if (e.target.classList.contains('modern-modal')) {
                this.closeModal();
            }
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        this.closeMobileMenu();

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Reset form if exists
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            this.clearFormErrors(form);
        }

        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }

    closeModal() {
        const activeModal = document.querySelector('.modern-modal.active');
        if (!activeModal) return;

        activeModal.classList.remove('active');
        document.body.style.overflow = '';

        // Clear any form errors
        const form = activeModal.querySelector('form');
        if (form) {
            this.clearFormErrors(form);
        }
    }

    // =========================================================================
    // PROFESSIONAL FORMS
    // =========================================================================
    setupForms() {
        document.querySelectorAll('.modern-form').forEach(form => {
            this.enhanceForm(form);
        });
    }

    enhanceForm(form) {
        const inputs = form.querySelectorAll('.form-input');
        const submitBtn = form.querySelector('.form-submit');

        // Add proper form attributes
        inputs.forEach(input => {
            this.setupFormInput(input);
        });

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form);
        });
    }

    setupFormInput(input) {
        // Add autocomplete attributes for accessibility
        if (input.type === 'email') {
            input.setAttribute('autocomplete', 'email');
        } else if (input.type === 'password') {
            input.setAttribute('autocomplete', input.name === 'password' ? 'new-password' : 'current-password');
        } else if (input.name === 'name') {
            input.setAttribute('autocomplete', 'name');
        }

        // Real-time validation
        input.addEventListener('blur', () => {
            this.validateField(input);
        });

        input.addEventListener('input', () => {
            // Clear errors as user types
            this.clearFieldError(input);
        });

        // Floating label effect
        this.setupFloatingLabel(input);
    }

    validateField(input) {
        const value = input.value.trim();
        const type = input.type;
        const required = input.hasAttribute('required');

        let isValid = true;
        let message = '';

        if (required && !value) {
            isValid = false;
            message = 'This field is required';
        } else if (type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        } else if (type === 'password' && value && value.length < 6) {
            isValid = false;
            message = 'Password must be at least 6 characters';
        }

        this.setFieldValidation(input, isValid, message);
        return isValid;
    }

    setFieldValidation(input, isValid, message) {
        if (isValid) {
            this.clearFieldError(input);
            input.classList.add('valid');
            input.classList.remove('error');
        } else {
            input.classList.add('error');
            input.classList.remove('valid');
            if (message) {
                this.showFieldError(input, message);
            }
        }
    }

    showFieldError(input, message) {
        this.clearFieldError(input);

        const group = input.closest('.form-group');
        if (!group) return;

        const errorEl = document.createElement('div');
        errorEl.className = 'field-error';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            color: var(--secondary-color);
            font-size: 0.8rem;
            margin-top: 0.5rem;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
        `;

        group.appendChild(errorEl);

        // Animate in
        requestAnimationFrame(() => {
            errorEl.style.opacity = '1';
            errorEl.style.transform = 'translateY(0)';
        });
    }

    clearFieldError(input) {
        const group = input.closest('.form-group');
        const errorEl = group?.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    clearFormErrors(form) {
        form.querySelectorAll('.field-error').forEach(error => error.remove());
        form.querySelectorAll('.form-input').forEach(input => {
            input.classList.remove('error', 'valid');
        });
    }

    setupFloatingLabel(input) {
        const placeholder = input.getAttribute('placeholder');
        if (!placeholder) return;

        const group = input.closest('.form-group');
        if (!group || group.querySelector('.floating-label')) return;

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
            z-index: 1;
        `;

        group.style.position = 'relative';
        group.appendChild(label);
        input.placeholder = '';

        const updateLabel = () => {
            if (input.value || input === document.activeElement) {
                label.style.top = '0';
                label.style.fontSize = '0.8rem';
                label.style.color = input.classList.contains('error') ? 'var(--secondary-color)' : 'var(--secondary-color)';
            } else {
                label.style.top = '50%';
                label.style.fontSize = '1rem';
                label.style.color = 'var(--text-muted)';
            }
        };

        input.addEventListener('focus', updateLabel);
        input.addEventListener('blur', updateLabel);
        input.addEventListener('input', updateLabel);

        updateLabel();
    }

    async handleFormSubmit(form) {
        const formType = form.closest('.modern-modal').id;
        const submitBtn = form.querySelector('.form-submit');

        // Validate all fields
        const inputs = form.querySelectorAll('.form-input');
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

        // Set loading state
        this.setLoadingState(submitBtn, true);

        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            let result;
            if (formType === 'login-modal') {
                result = await window.auth.signIn(data.email, data.password);
            } else if (formType === 'signup-modal') {
                result = await window.auth.signUp(data.email, data.password, data.name);
            }

            if (result.success) {
                const message = formType === 'login-modal'
                    ? `Welcome back, ${result.user.name}!`
                    : `Welcome to Double Kings Fitness, ${result.user.name}!`;

                this.showNotification(message, 'success');
                this.closeModal();
                this.updateAuthState(result.user);
            } else {
                this.showNotification(result.error, 'error');
            }
        } catch (error) {
            this.showNotification('Something went wrong. Please try again.', 'error');
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }

    setLoadingState(button, loading) {
        if (!button) return;

        if (loading) {
            button.classList.add('loading');
            button.disabled = true;

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

    // =========================================================================
    // PROFESSIONAL GOOGLE AUTH
    // =========================================================================
    async handleGoogleSignIn() {
        try {
            if (!window.auth) {
                throw new Error('Authentication service not available');
            }

            const result = await window.auth.signInWithGoogle();
            // The auth service handles all notifications and UI updates
        } catch (error) {
            this.showNotification('Google sign-in is currently unavailable', 'error');
        }
    }

    // =========================================================================
    // NOTIFICATION SYSTEM
    // =========================================================================
    createNotificationContainer() {
        if (document.querySelector('.notification-container')) return;

        const container = document.createElement('div');
        container.className = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    showNotification(message, type = 'info', duration = 5000) {
        const container = document.querySelector('.notification-container');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        notification.innerHTML = `
            <div style="
                background: rgba(0, 0, 0, 0.95);
                border: 1px solid ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
                border-radius: 12px;
                padding: 1rem 1.5rem;
                color: white;
                min-width: 300px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                backdrop-filter: blur(10px);
                pointer-events: auto;
                cursor: pointer;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.4s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
            ">
                <span style="font-size: 1.2rem;">${icons[type]}</span>
                <span>${message}</span>
            </div>
        `;

        container.appendChild(notification);
        this.notifications.push(notification);

        // Animate in
        requestAnimationFrame(() => {
            const inner = notification.firstElementChild;
            inner.style.transform = 'translateX(0)';
            inner.style.opacity = '1';
        });

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
        const inner = notification.firstElementChild;
        if (inner) {
            inner.style.transform = 'translateX(100%)';
            inner.style.opacity = '0';
        }

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            const index = this.notifications.indexOf(notification);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        }, 400);
    }

    // =========================================================================
    // ANIMATIONS & EFFECTS
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

        document.querySelectorAll('.feature-card, .hero-content').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
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

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    }

    setupParticles() {
        const hero = document.querySelector('.modern-hero');
        if (!hero || hero.querySelector('.hero-particles')) return;

        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'hero-particles';
        hero.appendChild(particlesContainer);

        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particlesContainer.appendChild(particle);
        }
    }

    setupScrollEffects() {
        let ticking = false;

        const updateScrollEffects = () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.modern-hero');

            if (hero && scrolled < window.innerHeight) {
                hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            }

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollEffects);
                ticking = true;
            }
        }, { passive: true });
    }

    // =========================================================================
    // AUTH STATE MANAGEMENT
    // =========================================================================
    updateAuthState(user) {
        const authButtons = document.querySelector('.auth-buttons');
        const mobileAuthSection = document.querySelector('.mobile-auth-section');

        if (user) {
            const userMenuHTML = `
                <div class="user-menu" style="display: flex; align-items: center; gap: 1rem;">
                    <button class="modern-btn btn-outline user-profile" style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="user-avatar">${user.name?.charAt(0) || 'U'}</span>
                        ${user.name || user.email}
                    </button>
                    <button class="modern-btn btn-outline" onclick="professionalUI.logout()">
                        Logout
                    </button>
                </div>
            `;

            if (authButtons) authButtons.innerHTML = userMenuHTML;
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = `
                    <div style="text-align: center; color: var(--text-primary); margin-bottom: 1rem;">
                        Welcome, ${user.name}!
                    </div>
                    <button class="modern-btn btn-outline" onclick="professionalUI.logout()">
                        Sign Out
                    </button>
                `;
            }
        } else {
            const authHTML = `
                <button class="modern-btn btn-outline" data-modal="login-modal">Login</button>
                <button class="modern-btn btn-primary" data-modal="signup-modal">Sign Up</button>
            `;

            if (authButtons) authButtons.innerHTML = authHTML;
            if (mobileAuthSection) {
                mobileAuthSection.innerHTML = `
                    <button class="modern-btn btn-primary" data-modal="signup-modal">Get Started</button>
                    <button class="modern-btn btn-outline" data-modal="login-modal">Sign In</button>
                `;
            }
        }
    }

    async logout() {
        try {
            const result = await window.auth.signOut();
            if (result.success) {
                this.showNotification('Successfully signed out. See you next time!', 'success');
                this.updateAuthState(null);
            }
        } catch (error) {
            this.showNotification('Sign out failed. Please try again.', 'error');
        }
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Initialize Professional UI
const professionalUI = new ProfessionalUI();

// Global access
window.professionalUI = professionalUI;

// Initialize auth state on ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.auth) {
        const currentUser = window.auth.getCurrentUser();
        professionalUI.updateAuthState(currentUser);
    }

    // Add professional styles
    const style = document.createElement('style');
    style.textContent = `
        .form-input.error {
            border-color: var(--secondary-color) !important;
            background: rgba(231, 76, 60, 0.05) !important;
        }
        
        .form-input.valid {
            border-color: #27ae60 !important;
            background: rgba(39, 174, 96, 0.05) !important;
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out !important;
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
            color: white;
        }

        @keyframes ripple {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }

        .mobile-menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
            z-index: calc(var(--z-modal) - 1);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .mobile-menu-overlay.active {
            opacity: 1;
            visibility: visible;
        }
    `;
    document.head.appendChild(style);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalUI;
} 