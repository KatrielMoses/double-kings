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