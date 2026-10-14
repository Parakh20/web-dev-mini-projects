class PitchDeck {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 10;
        this.slides = document.querySelectorAll('.slide');
        this.currentSlideElement = document.getElementById('current-slide');
        this.totalSlidesElement = document.getElementById('total-slides');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.isTransitioning = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateSlideCounter();
        this.updateNavButtons();
        this.preloadImages();
        
        // Set initial slide
        this.showSlide(this.currentSlide);
        
        // Initialize progress indicator
        this.updateProgressIndicator();
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.previousSlide();
        });
        
        this.nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.nextSlide();
        });
        
        // Keyboard navigation with improved handling
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for navigation keys
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Home', 'End'].includes(e.key)) {
                e.preventDefault();
            }
            
            // Don't handle keyboard events if transitioning
            if (this.isTransitioning) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ':
                    this.nextSlide();
                    break;
                case 'Home':
                    this.goToSlide(1);
                    break;
                case 'End':
                    this.goToSlide(this.totalSlides);
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // Touch/swipe support with improved handling
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    handleSwipe(startX, startY, endX, endY) {
        if (this.isTransitioning) return;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        // Check if horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        }
    }
    
    handleResize() {
        // Ensure slides maintain proper positioning on resize
        this.showSlide(this.currentSlide);
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
        if (slideNumber < 1 || slideNumber > this.totalSlides || this.isTransitioning) {
            return;
        }
        
        if (slideNumber === this.currentSlide) {
            return;
        }
        
        this.isTransitioning = true;
        const previousSlide = this.currentSlide;
        this.currentSlide = slideNumber;
        
        // Update slide classes with proper timing
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index + 1 === this.currentSlide) {
                slide.classList.add('active');
            } else if (index + 1 < this.currentSlide) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });
        
        // Update UI elements
        this.updateSlideCounter();
        this.updateNavButtons();
        this.updateProgressIndicator();
        
        // Reset transition flag after animation completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 600);
        
        // Track slide views
        this.trackSlideView(slideNumber);
    }
    
    showSlide(slideNumber) {
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next');
            
            if (index + 1 === slideNumber) {
                slide.classList.add('active');
            } else if (index + 1 < slideNumber) {
                slide.classList.add('prev');
            } else {
                slide.classList.add('next');
            }
        });
    }
    
    updateSlideCounter() {
        if (this.currentSlideElement && this.totalSlidesElement) {
            this.currentSlideElement.textContent = this.currentSlide;
            this.totalSlidesElement.textContent = this.totalSlides;
        }
    }
    
    updateNavButtons() {
        if (this.prevBtn && this.nextBtn) {
            this.prevBtn.disabled = this.currentSlide === 1;
            this.nextBtn.disabled = this.currentSlide === this.totalSlides;
            
            // Visual feedback
            this.prevBtn.style.opacity = this.currentSlide === 1 ? '0.4' : '1';
            this.nextBtn.style.opacity = this.currentSlide === this.totalSlides ? '0.4' : '1';
        }
    }
    
    updateProgressIndicator() {
        const progress = (this.currentSlide / this.totalSlides) * 100;
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }
    
    preloadImages() {
        const imageUrls = [
            'https://pplx-res.cloudinary.com/image/upload/v1751645815/pplx_code_interpreter/db089e63_mjgciu.jpg',
            'https://pplx-res.cloudinary.com/image/upload/v1751645888/pplx_code_interpreter/5c3699c9_vw6vce.jpg',
            'https://pplx-res.cloudinary.com/image/upload/v1751645968/pplx_code_interpreter/a49daf8e_psa1q6.jpg',
            'https://pplx-res.cloudinary.com/image/upload/v1751646043/pplx_code_interpreter/a240e37f_vjcpgf.jpg',
            'https://pplx-res.cloudinary.com/image/upload/v1751646124/pplx_code_interpreter/a59d2a0a_n0q9tu.jpg'
        ];
        
        imageUrls.forEach(url => {
            const img = new Image();
            img.onload = () => {
                console.log(`Loaded: ${url}`);
            };
            img.onerror = () => {
                console.warn(`Failed to load: ${url}`);
            };
            img.src = url;
        });
    }
    
    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn('Could not enter fullscreen:', err);
            });
        }
    }
    
    trackSlideView(slideNumber) {
        console.log(`Viewing slide ${slideNumber}`);
    }
}

// Progress indicator
class ProgressIndicator {
    constructor() {
        this.createProgressBar();
    }
    
    createProgressBar() {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress-fill"></div>';
        document.body.appendChild(progressBar);
        
        const style = document.createElement('style');
        style.textContent = `
            .progress-bar {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 4px;
                background: rgba(255, 255, 255, 0.3);
                z-index: 1000;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
                transition: width 0.6s ease;
                width: 0%;
            }
        `;
        document.head.appendChild(style);
    }
}

// Keyboard shortcuts help
class KeyboardShortcuts {
    constructor() {
        this.createHelpModal();
        this.setupEventListeners();
    }
    
    createHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <div class="shortcuts-content">
                <h3>Keyboard Shortcuts</h3>
                <div class="shortcuts-list">
                    <div class="shortcut-item">
                        <span class="shortcut-key">←/↑</span>
                        <span class="shortcut-desc">Previous slide</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">→/↓/Space</span>
                        <span class="shortcut-desc">Next slide</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">Home</span>
                        <span class="shortcut-desc">First slide</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">End</span>
                        <span class="shortcut-desc">Last slide</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">F</span>
                        <span class="shortcut-desc">Toggle fullscreen</span>
                    </div>
                    <div class="shortcut-item">
                        <span class="shortcut-key">?</span>
                        <span class="shortcut-desc">Show/hide this help</span>
                    </div>
                </div>
                <button class="close-shortcuts">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const style = document.createElement('style');
        style.textContent = `
            .shortcuts-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            
            .shortcuts-content {
                background: white;
                padding: 32px;
                border-radius: 16px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
            }
            
            .shortcuts-content h3 {
                margin-bottom: 24px;
                color: #1e40af;
                text-align: center;
                font-size: 24px;
            }
            
            .shortcuts-list {
                display: flex;
                flex-direction: column;
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8fafc;
                border-radius: 8px;
            }
            
            .shortcut-key {
                background: #1e40af;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
            }
            
            .close-shortcuts {
                width: 100%;
                padding: 12px;
                background: #1e40af;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: background 0.3s ease;
            }
            
            .close-shortcuts:hover {
                background: #1e3a8a;
            }
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
                e.preventDefault();
                this.toggleHelp();
            }
            
            if (e.key === 'Escape') {
                this.hideHelp();
            }
        });
        
        const closeBtn = document.querySelector('.close-shortcuts');
        const modal = document.querySelector('.shortcuts-modal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideHelp();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.classList.contains('shortcuts-modal')) {
                    this.hideHelp();
                }
            });
        }
    }
    
    toggleHelp() {
        const modal = document.querySelector('.shortcuts-modal');
        if (modal) {
            if (modal.style.display === 'flex') {
                this.hideHelp();
            } else {
                this.showHelp();
            }
        }
    }
    
    showHelp() {
        const modal = document.querySelector('.shortcuts-modal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    hideHelp() {
        const modal = document.querySelector('.shortcuts-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

// Image error handling
class ImageErrorHandler {
    constructor() {
        this.setupErrorHandling();
    }
    
    setupErrorHandling() {
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('.chart-image');
            images.forEach(img => {
                img.addEventListener('error', (e) => {
                    console.warn('Image failed to load:', e.target.src);
                    this.handleImageError(e.target);
                });
            });
        });
    }
    
    handleImageError(img) {
        // Create a placeholder for failed images
        const placeholder = document.createElement('div');
        placeholder.className = 'chart-placeholder';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">📊</div>
                <div class="placeholder-text">Chart Loading...</div>
            </div>
        `;
        
        // Add placeholder styles
        const style = document.createElement('style');
        style.textContent = `
            .chart-placeholder {
                width: 100%;
                height: 300px;
                background: #f8fafc;
                border: 2px dashed #e5e7eb;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 32px 0;
            }
            
            .placeholder-content {
                text-align: center;
                color: #6b7280;
            }
            
            .placeholder-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
            
            .placeholder-text {
                font-size: 16px;
                font-weight: 500;
            }
        `;
        
        if (!document.querySelector('.chart-placeholder-styles')) {
            style.className = 'chart-placeholder-styles';
            document.head.appendChild(style);
        }
        
        // Replace the broken image with placeholder
        img.parentNode.replaceChild(placeholder, img);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const pitchDeck = new PitchDeck();
    const progressIndicator = new ProgressIndicator();
    const keyboardShortcuts = new KeyboardShortcuts();
    const imageErrorHandler = new ImageErrorHandler();
    
    // Log initialization
    console.log('AgentForge Pitch Deck initialized');
    console.log('Use arrow keys or buttons to navigate');
    console.log('Press ? for keyboard shortcuts');
    console.log('Press F for fullscreen');
    
    // Make pitch deck globally available for debugging
    window.pitchDeck = pitchDeck;
    
    // Analytics tracking
    let presentationStartTime = Date.now();
    let slideStartTime = Date.now();
    
    // Track slide timing
    const originalGoToSlide = pitchDeck.goToSlide.bind(pitchDeck);
    pitchDeck.goToSlide = function(slideNumber) {
        if (slideNumber !== this.currentSlide) {
            const timeOnSlide = Math.round((Date.now() - slideStartTime) / 1000);
            console.log(`Time on slide ${this.currentSlide}: ${timeOnSlide} seconds`);
            slideStartTime = Date.now();
        }
        
        originalGoToSlide(slideNumber);
    };
    
    // Track total presentation time
    window.addEventListener('beforeunload', () => {
        const duration = Math.round((Date.now() - presentationStartTime) / 1000);
        console.log(`Total presentation time: ${duration} seconds`);
    });
    
    // Handle visibility changes (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('Presentation paused (tab hidden)');
        } else {
            console.log('Presentation resumed (tab visible)');
        }
    });
});