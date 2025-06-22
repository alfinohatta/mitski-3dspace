/**
 * Main Application Module
 * Coordinates all functionality and provides app-wide utilities
 */

class MitskiApp {
    constructor() {
        this.isLoaded = false;
        this.scrollObserver = null;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupInteractionEffects();
        this.setupAccessibilityFeatures();
        this.setupPerformanceOptimizations();
        this.setupErrorHandling();
        
        this.isLoaded = true;
        console.log('Mitski 3D Interactive Website Loaded Successfully!');
    }

    setupScrollAnimations() {
        if (this.prefersReducedMotion) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Add staggered animation for grid items
                    if (entry.target.closest('.grid-container')) {
                        const gridItems = entry.target.closest('.grid-container').children;
                        Array.from(gridItems).forEach((item, index) => {
                            setTimeout(() => {
                                item.classList.add('animate-in');
                            }, index * 100);
                        });
                    }
                }
            });
        }, observerOptions);

        // Observe all cards for scroll animations
        document.querySelectorAll('.card').forEach(card => {
            this.scrollObserver.observe(card);
        });

        // Observe sections for reveal animations
        document.querySelectorAll('.section').forEach(section => {
            this.scrollObserver.observe(section);
        });
    }

    setupInteractionEffects() {
        this.setupCTAButton();
        this.setupCardHoverEffects();
        this.setupFormValidation();
        this.setupTooltips();
    }

    setupCTAButton() {
        const ctaButton = document.querySelector('.cta-button');
        if (!ctaButton) return;

        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add click animation
            ctaButton.style.transform = 'scale(0.95)';
            setTimeout(() => {
                ctaButton.style.transform = '';
            }, 150);

            // Smooth scroll to about section
            const aboutSection = document.querySelector('#about');
            if (aboutSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = aboutSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });

        // Add ripple effect on click
        ctaButton.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            const rect = ctaButton.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            `;
            
            ctaButton.style.position = 'relative';
            ctaButton.style.overflow = 'hidden';
            ctaButton.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    setupCardHoverEffects() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (!this.prefersReducedMotion) {
                    card.classList.add('animate-pulse');
                }
            });
            
            card.addEventListener('mouseleave', () => {
                card.classList.remove('animate-pulse');
            });

            // Add focus support for keyboard users
            card.addEventListener('focusin', () => {
                card.classList.add('focused');
            });

            card.addEventListener('focusout', () => {
                card.classList.remove('focused');
            });
        });
    }

    setupFormValidation() {
        // Setup for future contact forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
        });
    }

    setupTooltips() {
        // Add tooltips for interactive elements
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });

            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    setupAccessibilityFeatures() {
        // Add skip links
        this.addSkipLinks();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Focus management
        this.setupFocusManagement();
        
        // ARIA live regions
        this.setupLiveRegions();
    }

    addSkipLinks() {
        const skipLinks = document.createElement('div');
        skipLinks.className = 'skip-links';
        skipLinks.innerHTML = `
            <a href="#main" class="skip-link">Skip to main content</a>
            <a href="#navigation" class="skip-link">Skip to navigation</a>
        `;
        document.body.insertBefore(skipLinks, document.body.firstChild);
    }

    setupKeyboardNavigation() {
        // Trap focus in mobile menu when open
        document.addEventListener('keydown', (e) => {
            const mobileMenu = document.querySelector('.nav-menu.active');
            if (mobileMenu && e.key === 'Tab') {
                const focusableElements = mobileMenu.querySelectorAll('a, button');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch(e.key) {
                    case 'h':
                        e.preventDefault();
                        document.querySelector('#home').focus();
                        break;
                    case 'm':
                        e.preventDefault();
                        document.querySelector('#main').focus();
                        break;
                }
            }
        });
    }

    setupFocusManagement() {
        // Ensure focus is visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupLiveRegions() {
        // Add ARIA live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    setupPerformanceOptimizations() {
        // Lazy load images when they get added
        this.setupLazyLoading();
        
        // Debounce resize events
        this.setupOptimizedResize();
        
        // Preload critical resources
        this.preloadCriticalResources();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    setupOptimizedResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }

    preloadCriticalResources() {
        // Preload Three.js if not already loaded
        if (!window.THREE) {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Application error:', e.error);
            this.handleError(e.error);
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.handleError(e.reason);
        });
    }

    // Utility methods
    handleResize() {
        // Dispatch custom resize event for other modules
        window.dispatchEvent(new CustomEvent('app:resize'));
    }

    handleError(error) {
        // Log error and show user-friendly message
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = 'An error occurred. Please refresh the page if problems persist.';
        }
    }

    handleFormSubmission(form) {
        // Form submission logic would go here
        console.log('Form submitted:', form);
        
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = 'Form submitted successfully!';
        }
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.cssText = `
            position: absolute;
            top: ${rect.top - 40}px;
            left: ${rect.left + rect.width / 2}px;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 10000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    // Public API methods
    announce(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = section.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    destroy() {
        if (this.scrollObserver) {
            this.scrollObserver.disconnect();
        }
        
        // Clean up event listeners and resources
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleError);
        
        console.log('Mitski app destroyed');
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.mitskiApp = new MitskiApp();
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .skip-links {
        position: absolute;
        top: -100px;
        left: 0;
        z-index: 9999;
    }
    
    .skip-link {
        position: absolute;
        top: 0;
        left: 0;
        background: #000;
        color: #fff;
        padding: 8px 16px;
        text-decoration: none;
        transition: top 0.3s;
    }
    
    .skip-link:focus {
        top: 100px;
    }
    
    .keyboard-navigation *:focus {
        outline: 2px solid #00FFFF !important;
        outline-offset: 2px !important;
    }
    
    .card.focused {
        outline: 2px solid #00FFFF;
        outline-offset: 2px;
    }
`;
document.head.appendChild(style);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MitskiApp;
}