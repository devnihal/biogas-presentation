class PresentationApp {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 16;
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateSlideCounter();
        this.preloadImages();
    }
    
    bindEvents() {
        // Navigation zone events
        const navLeft = document.getElementById('navLeft');
        const navRight = document.getElementById('navRight');
        
        navLeft.addEventListener('click', () => this.previousSlide());
        navRight.addEventListener('click', () => this.nextSlide());
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        this.exitFullscreen();
                    }
                    break;
            }
        });
        
        // Fullscreen button
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Fullscreen change events
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('webkitfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('mozfullscreenchange', () => this.updateFullscreenButton());
        document.addEventListener('MSFullscreenChange', () => this.updateFullscreenButton());
        
        // Touch events for mobile
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (Math.abs(diffX) > 50) { // Minimum swipe distance
                    if (diffX > 0) {
                        // Swipe left - next slide
                        this.nextSlide();
                    } else {
                        // Swipe right - previous slide
                        this.previousSlide();
                    }
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    nextSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.isTransitioning) return;
        
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        if (this.isTransitioning || slideNumber === this.currentSlide) return;
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;
        
        this.isTransitioning = true;
        
        // Get current and target slides
        const currentSlideEl = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        const targetSlideEl = document.querySelector(`[data-slide="${slideNumber}"]`);
        
        if (!currentSlideEl || !targetSlideEl) {
            this.isTransitioning = false;
            return;
        }
        
        // Determine direction
        const isNext = slideNumber > this.currentSlide;
        
        // Set up target slide position
        if (isNext) {
            targetSlideEl.style.transform = 'translateX(100px)';
            targetSlideEl.style.opacity = '0';
        } else {
            targetSlideEl.style.transform = 'translateX(-100px)';
            targetSlideEl.style.opacity = '0';
        }
        
        // Remove active class from current slide
        currentSlideEl.classList.remove('active');
        
        // Add transition classes
        if (isNext) {
            currentSlideEl.classList.add('prev');
        }
        
        // Small delay to ensure styles are applied
        setTimeout(() => {
            // Start transition
            targetSlideEl.classList.add('active');
            targetSlideEl.style.transform = 'translateX(0)';
            targetSlideEl.style.opacity = '1';
            
            if (isNext) {
                currentSlideEl.style.transform = 'translateX(-100px)';
            } else {
                currentSlideEl.style.transform = 'translateX(100px)';
            }
            currentSlideEl.style.opacity = '0';
        }, 10);
        
        // Clean up after transition
        setTimeout(() => {
            currentSlideEl.classList.remove('prev');
            currentSlideEl.style.transform = '';
            currentSlideEl.style.opacity = '';
            targetSlideEl.style.transform = '';
            targetSlideEl.style.opacity = '';
            
            this.currentSlide = slideNumber;
            this.updateSlideCounter();
            this.isTransitioning = false;
            
            // Restart animations for the new slide
            this.restartSlideAnimations(targetSlideEl);
        }, 500);
    }
    
    restartSlideAnimations(slideElement) {
        // Find all animated elements in the slide
        const animatedElements = slideElement.querySelectorAll(
            '.bullet-list li, .stage, .cost-item, .case-study-card, .benefit-item, .step, .scale-card, .challenge-item, .future-item, .conclusion-box, .references-box'
        );
        
        // Remove and re-add animation classes to restart animations
        animatedElements.forEach((el, index) => {
            el.style.animation = 'none';
            el.offsetHeight; // Trigger reflow
            el.style.animation = null;
        });
    }
    
    updateSlideCounter() {
        const currentSlideEl = document.getElementById('currentSlide');
        const totalSlidesEl = document.getElementById('totalSlides');
        
        if (currentSlideEl) currentSlideEl.textContent = this.currentSlide;
        if (totalSlidesEl) totalSlidesEl.textContent = this.totalSlides;
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            this.enterFullscreen();
        } else {
            this.exitFullscreen();
        }
    }
    
    enterFullscreen() {
        const elem = document.documentElement;
        
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    updateFullscreenButton() {
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.mozFullScreenElement || 
                               document.msFullscreenElement);
        
        if (isFullscreen) {
            fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
            `;
            fullscreenBtn.title = "Exit Fullscreen";
        } else {
            fullscreenBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                </svg>
            `;
            fullscreenBtn.title = "Enter Fullscreen";
        }
    }
    
    preloadImages() {
        const images = [
            'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/632ec692-309d-4f1b-8394-b8cda1e4813a.png',
            'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/8d5dd2a4-2f3e-41fa-979a-16b90dd61edf.png',
            'https://user-gen-media-assets.s3.amazonaws.com/seedream_images/907ae5a3-da6a-46bb-bc16-05ceeda92a4c.png'
        ];
        
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Public method to go to specific slide (useful for debugging or external control)
    jumpToSlide(slideNumber) {
        this.goToSlide(slideNumber);
    }
    
    // Get current slide number
    getCurrentSlide() {
        return this.currentSlide;
    }
    
    // Get total slides
    getTotalSlides() {
        return this.totalSlides;
    }
}

// Initialize the presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.presentation = new PresentationApp();
    
    // Add some helpful keyboard shortcuts info (can be removed in production)
    console.log('Presentation Controls:');
    console.log('→ / ↓ / Space / Enter: Next slide');
    console.log('← / ↑: Previous slide');
    console.log('Home: First slide');
    console.log('End: Last slide');
    console.log('F11 / Fullscreen button: Toggle fullscreen');
    console.log('Escape: Exit fullscreen');
    console.log('\nNavigation:');
    console.log('- Click left half of screen: Previous slide');
    console.log('- Click right half of screen: Next slide');
    console.log('- Swipe left/right on mobile');
});

// Handle page visibility changes to pause/resume if needed
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is now hidden
        console.log('Presentation paused');
    } else {
        // Page is now visible
        console.log('Presentation resumed');
    }
});

// Prevent context menu on right-click to avoid interference
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Prevent default drag behavior on images
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// Handle window resize to ensure proper layout
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Force a repaint to ensure proper layout
        const slides = document.querySelectorAll('.slide');
        slides.forEach(slide => {
            slide.style.display = 'none';
            slide.offsetHeight; // Trigger reflow
            slide.style.display = '';
        });
    }, 250);
});