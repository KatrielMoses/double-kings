/**
 * UI Interactions - Enhanced User Experience
 * This file contains shared UI interaction enhancements across the Double Kings Fitness website
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add hover sound effects to buttons (subtle feedback)
    addButtonEffects();

    // Add enhanced smooth scroll behavior
    initializeSmoothScroll();

    // Add navbar interaction effects
    enhanceNavbar();

    // Add input field enhancements
    enhanceInputFields();

    // Add dropdown menu interaction improvements
    enhanceDropdowns();

    // Add card hover effects
    enhanceCards();

    // Initialize tooltips
    initTooltips();

    // Mobile Menu Functionality
    initializeMobileMenu();

    // Enhanced click outside functionality
    initializeClickOutside();

    // Enhanced responsive navbar with scroll animations
    initializeNavbarBackground();

    // Touch gestures for mobile
    initializeTouchGestures();

    // Viewport height fix for mobile browsers
    initializeViewportFix();

    // Prevent zoom on input focus (iOS)
    initializeInputZoomPrevention();

    // Initialize parallax effects
    initializeParallaxEffect();

    // Note: User dropdown is now handled by Clerk authentication
    // The old user profile dropdown code has been removed since we're using Clerk's built-in user button
});

/**
 * Add subtle hover effects to buttons
 */
function addButtonEffects() {
    const buttons = document.querySelectorAll('button, .btn, .action-btn, .template-btn, .cta-btn');

    buttons.forEach(button => {
        // Enhanced hover effect for desktop
        if (window.innerWidth > 768) {
            button.addEventListener('mouseenter', () => {
                button.style.transform = button.classList.contains('btn-icon')
                    ? 'scale(1.1)'
                    : 'translateY(-2px)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = '';
            });
        }

        // Touch feedback for mobile
        button.addEventListener('touchstart', function (e) {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });

        button.addEventListener('touchend', function (e) {
            setTimeout(() => {
                this.style.transform = '';
                this.style.transition = '';
            }, 150);
        }, { passive: true });

        // Active state for both desktop and mobile
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
    });
}

/**
 * Enhance navbar interactions
 */
function enhanceNavbar() {
    const navbar = document.querySelector('.navbar');
    const userProfile = document.getElementById('userProfile');

    if (!navbar) return;

    // Change navbar opacity on scroll
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            navbar.classList.add('navbar-scrolled');

            // Hide navbar when scrolling down, show when scrolling up
            if (scrollTop > lastScrollTop) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('navbar-scrolled');
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // User profile dropdown interaction
    if (userProfile) {
        userProfile.addEventListener('click', (e) => {
            e.stopPropagation();
            userProfile.classList.toggle('active');

            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!userProfile.contains(e.target)) {
                    userProfile.classList.remove('active');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    }
}

/**
 * Enhance input field interactions
 */
function enhanceInputFields() {
    const inputFields = document.querySelectorAll('input, select, textarea');

    inputFields.forEach(input => {
        // Add focus effects
        input.addEventListener('focus', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('focused');
            }
        });

        input.addEventListener('blur', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('focused');

                // Add 'filled' class if the input has a value
                if (input.value.trim() !== '') {
                    formGroup.classList.add('filled');
                } else {
                    formGroup.classList.remove('filled');
                }
            }
        });

        // Add 'filled' class initially if input has a value
        if (input.value.trim() !== '') {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('filled');
            }
        }
    });
}

/**
 * Enhance dropdown interactions
 */
function enhanceDropdowns() {
    // User dropdown is handled separately in enhanceNavbar()

    // Standard dropdowns
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const content = dropdown.querySelector('.dropdown-content');

        if (!trigger || !content) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            content.classList.toggle('show');

            // Close dropdown when clicking outside
            document.addEventListener('click', function closeDropdown(e) {
                if (!dropdown.contains(e.target)) {
                    content.classList.remove('show');
                    document.removeEventListener('click', closeDropdown);
                }
            });
        });
    });
}

/**
 * Enhance card interactions
 */
function enhanceCards() {
    const cards = document.querySelectorAll('.card, .goal-card, .template-card, .feature');

    cards.forEach(card => {
        // Add shadow and lift effect on hover
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.2)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });

        // Add active state effect on click
        card.addEventListener('mousedown', () => {
            card.style.transform = 'translateY(-2px)';
        });

        card.addEventListener('mouseup', () => {
            card.style.transform = 'translateY(-5px)';
        });
    });
}

/**
 * Initialize tooltips for elements with data-tooltip attribute
 */
function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        // Create tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = element.getAttribute('data-tooltip');

        // Add position to element for tooltip positioning
        element.style.position = 'relative';

        // Show/hide tooltip
        element.addEventListener('mouseenter', () => {
            element.appendChild(tooltip);
            setTimeout(() => tooltip.classList.add('visible'), 10);
        });

        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
            setTimeout(() => {
                if (tooltip.parentNode === element) {
                    element.removeChild(tooltip);
                }
            }, 300);
        });
    });
}

// Add CSS for these interactions
function addInteractionStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .highlight-target {
            animation: highlight 2s ease;
        }
        
        @keyframes highlight {
            0%, 100% { background-color: transparent; }
            20% { background-color: rgba(52, 152, 219, 0.2); }
        }
        
        .navbar-scrolled {
            background-color: rgba(15, 15, 26, 0.95);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .form-group.focused label {
            color: #3498db;
            transform: translateY(-5px);
        }
        
        .tooltip {
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(44, 62, 80, 0.9);
            color: #ffffff;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.85rem;
            z-index: 1000;
            white-space: nowrap;
            opacity: 0;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        .tooltip.visible {
            opacity: 1;
            top: -45px;
        }
        
        .dropdown-content.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
}

// Initialize styles
addInteractionStyles();

// Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (!mobileMenuToggle || !navLinks) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    // Toggle mobile menu
    mobileMenuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMobileMenu();
    });

    // Add touch feedback for mobile menu toggle
    mobileMenuToggle.addEventListener('touchstart', function (e) {
        this.style.transform = 'scale(0.95)';
    }, { passive: true });

    mobileMenuToggle.addEventListener('touchend', function (e) {
        setTimeout(() => {
            this.style.transform = '';
        }, 150);
    }, { passive: true });

    // Close button in mobile menu
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });

        // Touch feedback for close button
        mobileNavClose.addEventListener('touchstart', function (e) {
            this.style.transform = 'rotate(90deg) scale(0.9)';
        }, { passive: true });

        mobileNavClose.addEventListener('touchend', function (e) {
            setTimeout(() => {
                this.style.transform = 'rotate(90deg) scale(1.1)';
            }, 150);
        }, { passive: true });
    }

    // Close menu when overlay is clicked
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function () {
            closeMobileMenu();
        });

        // Touch support for overlay
        mobileMenuOverlay.addEventListener('touchstart', function (e) {
            if (e.target === this) {
                closeMobileMenu();
            }
        }, { passive: true });
    }

    // Enhanced touch support for navigation links
    navLinkItems.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 768) {
                // Add visual feedback before closing
                this.style.background = 'rgba(231, 76, 60, 0.3)';
                setTimeout(() => {
                    closeMobileMenu();
                }, 200);
            }
        });

        // Touch feedback for nav links
        link.addEventListener('touchstart', function (e) {
            this.style.background = 'rgba(231, 76, 60, 0.15)';
            this.style.transform = 'scale(0.98)';
        }, { passive: true });

        link.addEventListener('touchend', function (e) {
            setTimeout(() => {
                if (!this.classList.contains('active')) {
                    this.style.background = '';
                }
                this.style.transform = '';
            }, 150);
        }, { passive: true });
    });

    // Swipe gesture support
    navLinks.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            isDragging = true;
            navLinks.style.transition = 'none';
        }
    }, { passive: true });

    navLinks.addEventListener('touchmove', function (e) {
        if (!isDragging || e.touches.length !== 1) return;

        currentX = e.touches[0].clientX;
        const diffX = currentX - startX;

        // Only allow left swipe (closing gesture)
        if (diffX < 0) {
            const translateX = Math.max(diffX, -navLinks.offsetWidth);
            navLinks.style.transform = `translateX(${translateX}px)`;
        }
    }, { passive: true });

    navLinks.addEventListener('touchend', function (e) {
        if (!isDragging) return;

        isDragging = false;
        navLinks.style.transition = '';
        navLinks.style.transform = '';

        const diffX = currentX - startX;
        const threshold = navLinks.offsetWidth * 0.3;

        // Close menu if swiped more than 30% of the menu width
        if (diffX < -threshold) {
            closeMobileMenu();
        }
    }, { passive: true });

    // Close menu on escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Handle resize events with debouncing
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 768) {
                closeMobileMenu();
            }
        }, 250);
    });

    // Prevent body scroll when menu is open
    function preventBodyScroll(prevent) {
        if (prevent) {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.height = '';
        }
    }

    function toggleMobileMenu() {
        const isActive = navLinks.classList.contains('active');

        if (isActive) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mobileMenuToggle.classList.add('active');
        navLinks.classList.add('active');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
        }

        preventBodyScroll(true);

        // Add focus trap
        trapFocus(navLinks);

        // Animate menu items
        const menuItems = navLinks.querySelectorAll('.nav-link, .login-btn, .signup-btn');
        menuItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                item.style.transition = 'all 0.3s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 100 + (index * 50));
        });
    }

    function closeMobileMenu() {
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
        }

        preventBodyScroll(false);

        // Remove focus trap
        removeFocusTrap();

        // Reset menu items animation
        const menuItems = navLinks.querySelectorAll('.nav-link, .login-btn, .signup-btn');
        menuItems.forEach(item => {
            item.style.transition = '';
            item.style.opacity = '';
            item.style.transform = '';
        });
    }
}

// Enhanced click outside functionality
function initializeClickOutside() {
    document.addEventListener('click', function (e) {
        // Close dropdowns when clicking outside
        const dropdowns = document.querySelectorAll('.user-dropdown');
        dropdowns.forEach(dropdown => {
            const userProfile = dropdown.closest('.user-profile');
            if (userProfile && !userProfile.contains(e.target)) {
                userProfile.classList.remove('active');
            }
        });

        // Close modals when clicking outside
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }
        });
    });
}

// Responsive navbar background
function initializeNavbarBackground() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    let lastScrollTop = 0;
    let ticking = false;

    function updateNavbar() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Enhanced navbar behavior
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Smooth hide/show on mobile
        if (window.innerWidth <= 768) {
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                // Scrolling down - hide navbar
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up - show navbar
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
        ticking = false;
    }

    function requestUpdateNavbar() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }

    // Initialize scroll-triggered animations
    initializeScrollAnimations();

    window.addEventListener('scroll', requestUpdateNavbar, { passive: true });
    window.addEventListener('resize', requestUpdateNavbar);
}

// Scroll-triggered animations
function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                // Optional: Stop observing after animation
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));

    // Add animate-on-scroll class to specific elements
    setTimeout(() => {
        const sectionsToAnimate = [
            '.classes-section .section-title',
            '.features-section .feature'
        ];

        sectionsToAnimate.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, index) => {
                el.classList.add('animate-on-scroll');
                // Stagger animations
                el.style.animationDelay = `${index * 0.2}s`;
                observer.observe(el);
            });
        });
    }, 100);
}

// Enhanced smooth scrolling with easing
function initializeSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 70;
                const offsetTop = targetElement.offsetTop - navbarHeight - 20;

                // Enhanced smooth scroll with custom easing
                smoothScrollTo(offsetTop, 800);

                // Add focus ring for accessibility
                targetElement.setAttribute('tabindex', '-1');
                targetElement.focus();
                setTimeout(() => {
                    targetElement.removeAttribute('tabindex');
                }, 1000);
            }
        });
    });
}

// Custom smooth scroll function with easing
function smoothScrollTo(targetPosition, duration) {
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Easing function for smooth animation
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// Enhanced parallax effect for hero section
function initializeParallaxEffect() {
    const heroBackground = document.querySelector('.hero-background::before');
    if (!heroBackground) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;

        if (heroBackground) {
            heroBackground.style.transform = `translateY(${parallax}px)`;
        }
    }, { passive: true });
}

// Touch gestures for mobile
function initializeTouchGestures() {
    // Mobile menu edge swipe to open
    let startX = 0;
    let startTime = 0;

    document.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
        startTime = Date.now();
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        const endX = e.changedTouches[0].clientX;
        const endTime = Date.now();
        const diffX = endX - startX;
        const diffTime = endTime - startTime;

        // Swipe from left edge to open menu (only on mobile)
        if (window.innerWidth <= 768 &&
            startX < 50 &&
            diffX > 100 &&
            diffTime < 300) {

            const navLinks = document.getElementById('navLinks');
            const mobileMenuToggle = document.getElementById('mobileMenuToggle');

            if (navLinks && !navLinks.classList.contains('active')) {
                mobileMenuToggle.click();
            }
        }
    }, { passive: true });
}

// Viewport height fix for mobile browsers
function initializeViewportFix() {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setViewportHeight();

    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', function () {
        setTimeout(setViewportHeight, 500);
    });
}

// Prevent zoom on input focus (iOS)
function initializeInputZoomPrevention() {
    // Prevent zoom on input focus for iOS devices
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="url"], textarea, select');

        inputs.forEach(input => {
            // Ensure font-size is at least 16px to prevent zoom
            const computedStyle = window.getComputedStyle(input);
            const fontSize = parseFloat(computedStyle.fontSize);

            if (fontSize < 16) {
                input.style.fontSize = '16px';
            }

            // Add touch-friendly styling
            input.addEventListener('focus', function () {
                this.style.fontSize = Math.max(parseFloat(this.style.fontSize) || 16, 16) + 'px';
            });
        });
    }

    // Enhanced form validation for mobile
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input');

        inputs.forEach(input => {
            // Real-time validation feedback
            input.addEventListener('blur', function () {
                const formGroup = this.closest('.form-group');
                if (formGroup) {
                    if (this.validity.valid && this.value.trim() !== '') {
                        formGroup.classList.add('valid');
                        formGroup.classList.remove('invalid');
                    } else if (!this.validity.valid) {
                        formGroup.classList.add('invalid');
                        formGroup.classList.remove('valid');
                    }
                }
            });

            // Clear validation states on focus
            input.addEventListener('focus', function () {
                const formGroup = this.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.remove('invalid');
                }
            });
        });
    });
}

// Focus trap utility
function trapFocus(element, event) {
    const focusableElements = element.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event && event.key === 'Tab') {
        if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                event.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                event.preventDefault();
            }
        }
    } else if (!event) {
        // Initial focus
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
}

function removeFocusTrap() {
    // Remove any focus trapping
    document.removeEventListener('keydown', trapFocus);
}

// Smooth scrolling polyfill for older browsers
function initializeSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Performance optimization: Debounce function
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        const context = this;
        const args = arguments;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize smooth scroll
document.addEventListener('DOMContentLoaded', initializeSmoothScroll);

// Export functions for use in other modules
window.UIInteractions = {
    debounce,
    throttle,
    trapFocus,
    removeFocusTrap
}; 