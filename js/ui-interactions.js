/**
 * UI Interactions - Enhanced User Experience
 * This file contains shared UI interaction enhancements across the Double Kings Fitness website
 */

document.addEventListener('DOMContentLoaded', () => {
    // Add hover sound effects to buttons (subtle feedback)
    addButtonEffects();

    // Add smooth scroll behavior
    addSmoothScroll();

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

    // Enhanced Mobile Menu Functionality
    initializeMobileMenu();

    // Enhanced click outside functionality
    initializeClickOutside();

    // Responsive navbar background
    initializeNavbarBackground();

    // Enhanced modal functionality
    initializeModals();

    // Touch gestures for mobile
    initializeTouchGestures();

    // Viewport height fix for mobile browsers
    initializeViewportFix();

    // Prevent zoom on input focus (iOS)
    initializeInputZoomPrevention();

    // Initialize mobile-specific optimizations
    initializeMobileOptimizations();
});

/**
 * Add subtle hover effects to buttons
 */
function addButtonEffects() {
    const buttons = document.querySelectorAll('button, .btn, .action-btn, .template-btn');

    buttons.forEach(button => {
        // Scale effect on hover
        button.addEventListener('mouseenter', () => {
            button.style.transform = button.classList.contains('btn-icon')
                ? 'scale(1.1)'
                : 'translateY(-2px)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });

        // Add active state
        button.addEventListener('mousedown', () => {
            button.style.transform = 'translateY(1px)';
        });

        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
    });
}

/**
 * Add smooth scrolling for anchor links
 */
function addSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Add highlight effect to target element
                targetElement.classList.add('highlight-target');
                setTimeout(() => targetElement.classList.remove('highlight-target'), 2000);

                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
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

// Enhanced Mobile Menu Functionality
function initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const navLinks = document.getElementById('navLinks');
    const navLinkItems = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!mobileMenuToggle || !navLinks) return;

    let isMenuOpen = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouch = false;

    // Toggle mobile menu with improved state management
    mobileMenuToggle.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    // Enhanced close button functionality
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            closeMobileMenu();
        });
    }

    // Close menu when overlay is clicked/touched
    if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener('click', function (e) {
            if (e.target === mobileMenuOverlay) {
                closeMobileMenu();
            }
        });

        // Touch handling for overlay
        mobileMenuOverlay.addEventListener('touchstart', function (e) {
            if (e.target === mobileMenuOverlay) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                isTouch = true;
            }
        }, { passive: true });

        mobileMenuOverlay.addEventListener('touchend', function (e) {
            if (e.target === mobileMenuOverlay && isTouch) {
                const touchEndX = e.changedTouches[0].clientX;
                const touchEndY = e.changedTouches[0].clientY;
                const deltaX = Math.abs(touchEndX - touchStartX);
                const deltaY = Math.abs(touchEndY - touchStartY);

                // Only close if it's a tap, not a swipe
                if (deltaX < 10 && deltaY < 10) {
                    closeMobileMenu();
                }
            }
            isTouch = false;
        }, { passive: true });
    }

    // Close menu when nav link is clicked
    navLinkItems.forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 968 && isMenuOpen) {
                // Add a small delay to allow the link action to complete
                setTimeout(() => {
                    closeMobileMenu();
                }, 100);
            }
        });
    });

    // Enhanced keyboard support
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMobileMenu();
        }

        // Tab key navigation within menu
        if (e.key === 'Tab' && isMenuOpen) {
            handleTabNavigation(e);
        }
    });

    // Enhanced resize handling
    let resizeTimer;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            if (window.innerWidth > 968 && isMenuOpen) {
                closeMobileMenu();
            }
        }, 250);
    });

    // Orientation change handling
    window.addEventListener('orientationchange', function () {
        setTimeout(() => {
            if (isMenuOpen) {
                // Refresh menu position on orientation change
                updateMenuPosition();
            }
        }, 100);
    });

    // Swipe to close functionality
    let startX = 0;
    let currentX = 0;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    if (navLinks) {
        navLinks.addEventListener('touchstart', function (e) {
            if (e.touches.length === 1) {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                currentX = startX;
                currentY = startY;
                isDragging = false;
            }
        }, { passive: true });

        navLinks.addEventListener('touchmove', function (e) {
            if (e.touches.length === 1) {
                currentX = e.touches[0].clientX;
                currentY = e.touches[0].clientY;

                const deltaX = currentX - startX;
                const deltaY = Math.abs(currentY - startY);

                // Only handle horizontal swipes
                if (Math.abs(deltaX) > 10 && deltaY < 50) {
                    isDragging = true;

                    // Swipe left to close (negative deltaX)
                    if (deltaX < -50) {
                        e.preventDefault();
                        const translateX = Math.max(deltaX, -navLinks.offsetWidth);
                        navLinks.style.transform = `translateX(${translateX}px)`;
                    }
                }
            }
        }, { passive: false });

        navLinks.addEventListener('touchend', function (e) {
            if (isDragging) {
                const deltaX = currentX - startX;

                // If swiped left more than 30% of menu width, close menu
                if (deltaX < -(navLinks.offsetWidth * 0.3)) {
                    closeMobileMenu();
                } else {
                    // Snap back to original position
                    navLinks.style.transform = '';
                    navLinks.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                    setTimeout(() => {
                        navLinks.style.transition = '';
                    }, 300);
                }
            }

            isDragging = false;
            navLinks.style.transform = '';
        }, { passive: true });
    }

    function openMobileMenu() {
        if (isMenuOpen) return;

        isMenuOpen = true;
        mobileMenuToggle.classList.add('active');
        navLinks.classList.add('active');

        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.add('active');
        }

        // Prevent body scroll
        body.style.overflow = 'hidden';
        body.style.position = 'fixed';
        body.style.width = '100%';

        // Set focus to first focusable element in menu
        setTimeout(() => {
            const firstFocusable = navLinks.querySelector('a, button, input, [tabindex]');
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        // Add accessibility attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'true');
        navLinks.setAttribute('aria-hidden', 'false');

        // Announce to screen readers
        announceToScreenReader('Menu opened');
    }

    function closeMobileMenu() {
        if (!isMenuOpen) return;

        isMenuOpen = false;
        mobileMenuToggle.classList.remove('active');
        navLinks.classList.remove('active');

        if (mobileMenuOverlay) {
            mobileMenuOverlay.classList.remove('active');
        }

        // Restore body scroll
        body.style.overflow = '';
        body.style.position = '';
        body.style.width = '';

        // Clear any transform from swipe gesture
        navLinks.style.transform = '';

        // Return focus to menu toggle
        mobileMenuToggle.focus();

        // Update accessibility attributes
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navLinks.setAttribute('aria-hidden', 'true');

        // Announce to screen readers
        announceToScreenReader('Menu closed');
    }

    function updateMenuPosition() {
        // Ensure menu is properly positioned on orientation change
        if (isMenuOpen) {
            navLinks.style.height = `${window.innerHeight}px`;
        }
    }

    function handleTabNavigation(e) {
        const focusableElements = navLinks.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    }

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.classList.add('sr-only');
        announcement.textContent = message;
        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Public method to close menu (can be called from other scripts)
    window.closeMobileMenu = closeMobileMenu;
}

// Initialize mobile-specific optimizations
function initializeMobileOptimizations() {
    // Better touch feedback
    addTouchFeedback();

    // Fix viewport height for mobile browsers
    updateViewportHeight();

    // Handle safe areas (iPhone X and newer)
    handleSafeAreas();

    // Optimize for different pixel densities
    optimizeForRetina();
}

function addTouchFeedback() {
    const touchElements = document.querySelectorAll(
        'button, .btn, .nav-link, .class-category, .feature, a[href]'
    );

    touchElements.forEach(element => {
        element.addEventListener('touchstart', function () {
            this.classList.add('touch-active');
        }, { passive: true });

        element.addEventListener('touchend', function () {
            setTimeout(() => {
                this.classList.remove('touch-active');
            }, 150);
        }, { passive: true });

        element.addEventListener('touchcancel', function () {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
}

function updateViewportHeight() {
    function setVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', () => {
        setTimeout(setVH, 100);
    });
}

function handleSafeAreas() {
    // Add CSS custom properties for safe areas
    if (CSS.supports('padding: max(0px)')) {
        document.documentElement.classList.add('safe-area-supported');
    }
}

function optimizeForRetina() {
    // Detect high DPI displays and add class for targeting
    if (window.devicePixelRatio > 1) {
        document.documentElement.classList.add('retina');
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

        // Add background on scroll
        if (scrollTop > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.backdropFilter = 'blur(20px)';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
            navbar.style.borderBottom = 'none';
        }

        // Hide/show navbar on scroll (mobile)
        if (window.innerWidth <= 768) {
            if (scrollTop > lastScrollTop && scrollTop > 150) {
                // Scrolling down
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
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

    window.addEventListener('scroll', requestUpdateNavbar, { passive: true });
    window.addEventListener('resize', requestUpdateNavbar);
}

// Enhanced modal functionality
function initializeModals() {
    const modals = document.querySelectorAll('.modal');
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeButtons = document.querySelectorAll('.close');

    // Modal triggers
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function () {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                openModal(modal);
            }
        });
    });

    // Close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
        const activeModal = document.querySelector('.modal[style*="display: flex"], .modal[style*="display: block"]');

        if (e.key === 'Escape' && activeModal) {
            closeModal(activeModal);
        }

        if (e.key === 'Tab' && activeModal) {
            trapFocus(activeModal, e);
        }
    });

    function openModal(modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Focus first input
        const firstInput = modal.querySelector('input, button, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }

        // Add modal backdrop click listener
        modal.addEventListener('click', function (e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Touch gestures for mobile
function initializeTouchGestures() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        handleSwipeGesture();
    }, { passive: true });

    function handleSwipeGesture() {
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const minSwipeDistance = 100;

        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const navLinks = document.getElementById('navLinks');

            // Swipe right to open menu
            if (deltaX > minSwipeDistance && !navLinks.classList.contains('active')) {
                if (window.innerWidth <= 768) {
                    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.click();
                    }
                }
            }

            // Swipe left to close menu
            if (deltaX < -minSwipeDistance && navLinks.classList.contains('active')) {
                if (window.innerWidth <= 768) {
                    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.click();
                    }
                }
            }
        }
    }
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
    const inputs = document.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        input.addEventListener('focus', function () {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
                }
            }
        });

        input.addEventListener('blur', function () {
            if (window.innerWidth <= 768) {
                const viewport = document.querySelector('meta[name=viewport]');
                if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
                }
            }
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