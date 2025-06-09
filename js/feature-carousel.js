// Feature Carousel JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all carousels
    const carousels = document.querySelectorAll('.image-carousel');

    carousels.forEach(carousel => {
        initializeCarousel(carousel);
    });
});

function initializeCarousel(carouselElement) {
    const carouselName = carouselElement.dataset.carousel;
    const slides = carouselElement.querySelectorAll('.carousel-slide');
    const indicators = carouselElement.querySelectorAll('.indicator');
    const prevBtn = carouselElement.querySelector('.carousel-prev');
    const nextBtn = carouselElement.querySelector('.carousel-next');

    let currentSlide = 0;
    let isTransitioning = false;

    // Auto-advance slides every 5 seconds
    let autoAdvanceInterval;

    function showSlide(index) {
        if (isTransitioning) return;

        isTransitioning = true;

        // Remove active class from all slides and indicators
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
        });

        // Add active class to current slide and indicator
        slides[index].classList.add('active');
        indicators[index].classList.add('active');

        // Add prev class to previous slide for animation
        if (currentSlide !== index) {
            slides[currentSlide].classList.add('prev');
        }

        currentSlide = index;

        // Reset transition flag after animation completes
        setTimeout(() => {
            isTransitioning = false;
        }, 500);
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }

    // Event listeners for navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoAdvance();
            startAutoAdvance(); // Restart auto-advance
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoAdvance();
            startAutoAdvance(); // Restart auto-advance
        });
    }

    // Event listeners for indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (index !== currentSlide) {
                showSlide(index);
                stopAutoAdvance();
                startAutoAdvance(); // Restart auto-advance
            }
        });
    });

    // Pause auto-advance on hover
    carouselElement.addEventListener('mouseenter', stopAutoAdvance);
    carouselElement.addEventListener('mouseleave', startAutoAdvance);

    // Touch/swipe support for mobile
    let startX = 0;
    let endX = 0;
    const minSwipeDistance = 50;

    carouselElement.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        stopAutoAdvance();
    });

    carouselElement.addEventListener('touchmove', (e) => {
        // Prevent default to avoid scrolling
        e.preventDefault();
    }, { passive: false });

    carouselElement.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        handleSwipe();
        startAutoAdvance();
    });

    function handleSwipe() {
        const deltaX = endX - startX;

        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right - go to previous slide
                prevSlide();
            } else {
                // Swipe left - go to next slide
                nextSlide();
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        // Only handle keyboard navigation if this carousel is in view
        const carouselRect = carouselElement.getBoundingClientRect();
        const isInView = carouselRect.top < window.innerHeight && carouselRect.bottom > 0;

        if (isInView) {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    stopAutoAdvance();
                    startAutoAdvance();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    nextSlide();
                    stopAutoAdvance();
                    startAutoAdvance();
                    break;
            }
        }
    });

    // Intersection Observer for performance
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                startAutoAdvance();
            } else {
                stopAutoAdvance();
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(carouselElement);

    // Image lazy loading
    const images = carouselElement.querySelectorAll('img');
    images.forEach(img => {
        // Add loading error handler
        img.addEventListener('error', () => {
            // Show placeholder or fallback image
            img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIENvbWluZyBTb29uPC90ZXh0Pjwvc3ZnPg==';
            img.alt = 'Preview image coming soon';
        });

        // Add loading success handler
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    });

    // Initialize with first slide
    showSlide(0);

    // Start auto-advance if carousel is in view
    const carouselRect = carouselElement.getBoundingClientRect();
    const isInView = carouselRect.top < window.innerHeight && carouselRect.bottom > 0;

    if (isInView) {
        startAutoAdvance();
    }

    console.log(`✅ Carousel initialized: ${carouselName}`);
}

// Utility function to preload images
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Preload all carousel images when page loads
window.addEventListener('load', () => {
    const allImages = document.querySelectorAll('.carousel-slide img');
    const imageUrls = Array.from(allImages).map(img => img.src).filter(src => src);

    if (imageUrls.length > 0) {
        preloadImages(imageUrls);
    }
}); 