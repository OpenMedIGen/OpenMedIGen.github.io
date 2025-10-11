// Gallery JavaScript Functionality

class GalleryManager {
    constructor() {
        this.galleryGrid = document.getElementById('gallery-grid');
        this.loadingIndicator = document.getElementById('loading');
        this.errorMessage = document.getElementById('error');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.refreshBtn = document.getElementById('refreshBtn');
        this.totalImagesElement = document.getElementById('totalImages');
        this.verifiedImagesElement = document.getElementById('verifiedImages');
        this.paginationContainer = document.getElementById('paginationContainer');
        this.paginationList = document.getElementById('paginationList');
        this.pageJumpInput = document.getElementById('pageJumpInput');
        this.pageJumpBtn = document.getElementById('pageJumpBtn');
        
        this.galleryData = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        this.totalPages = 1;
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadGalleryData();
    }
    
    bindEvents() {
        // Shuffle button event
        this.shuffleBtn.addEventListener('click', () => {
            this.shuffleImages();
        });
        
        // Refresh button event
        this.refreshBtn.addEventListener('click', () => {
            this.refreshGallery();
        });
        
        // Page jump events
        this.pageJumpBtn.addEventListener('click', () => {
            this.jumpToPage();
        });
        
        this.pageJumpInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.jumpToPage();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.refreshGallery();
            } else if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.shuffleImages();
            }
        });
    }
    
    async loadGalleryData() {
        try {
            this.showLoading();
            this.hideError();
            
            // Use embedded JavaScript data instead of fetching JSON
            if (typeof window.galleryData !== 'undefined') {
                this.galleryData = window.galleryData;
                
                if (!Array.isArray(this.galleryData)) {
                    throw new Error('Invalid data format: expected array');
                }
                
                // Shuffle data initially
                this.shuffleArray(this.galleryData);
                
                // Render gallery
                this.renderGallery();
            } else {
                throw new Error('Gallery data not found. Please check if gallery-data.js is loaded correctly.');
            }
            
        } catch (error) {
            console.error('Failed to load gallery data:', error);
            this.showError('Failed to load gallery data. Please check if gallery-data.js exists and has valid format.');
        }
    }
    
    renderGallery(page = 1) {
        this.hideLoading();
        
        if (this.galleryData.length === 0) {
            this.showError('No images found in gallery data.');
            return;
        }
        
        // Update statistics
        this.updateStatistics();
        
        // Calculate pagination
        this.currentPage = page;
        this.totalPages = Math.ceil(this.galleryData.length / this.itemsPerPage);
        
        // Get current page items
        const startIndex = (page - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.galleryData.length);
        const currentPageItems = this.galleryData.slice(startIndex, endIndex);
        
        // Clear existing content
        this.galleryGrid.innerHTML = '';
        
        // Create gallery items for current page
        currentPageItems.forEach((item, index) => {
            const galleryItem = this.createGalleryItem(item, startIndex + index);
            this.galleryGrid.appendChild(galleryItem);
        });
        
        // Update pagination
        this.updatePagination();
        
        // Add fade-in animation
        this.animateGalleryItems();
    }
    
    createGalleryItem(item, index) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.setAttribute('data-index', index);
        
        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-image-container';
        
        const img = document.createElement('img');
        img.className = 'gallery-image loading';
        img.src = item.image_url;
        img.alt = item.caption || 'Research image';
        img.loading = 'lazy';
        
        // Image load event
        img.addEventListener('load', () => {
            img.classList.remove('loading');
        });
        
        // Image error event
        img.addEventListener('error', () => {
            img.classList.remove('loading');
            img.classList.add('error');
            img.alt = 'Failed to load image';
        });
        
        imageContainer.appendChild(img);
        
        // Add verified badge if verified
        if (item.verified) {
            const verifiedBadge = document.createElement('div');
            verifiedBadge.className = 'verified-badge';
            verifiedBadge.innerHTML = '<i class="fas fa-check"></i> Verified';
            imageContainer.appendChild(verifiedBadge);
        }
        
        // Add caption overlay
        if (item.caption) {
            const captionOverlay = document.createElement('div');
            captionOverlay.className = 'caption-overlay';
            
            const captionText = document.createElement('p');
            captionText.className = 'caption-text';
            captionText.textContent = item.caption;
            
            captionOverlay.appendChild(captionText);
            imageContainer.appendChild(captionOverlay);
        }
        
        galleryItem.appendChild(imageContainer);
        
        return galleryItem;
    }
    
    shuffleImages() {
        // Shuffle the data array
        this.shuffleArray(this.galleryData);
        
        // Re-render gallery with shuffled data (stay on current page)
        this.renderGallery(this.currentPage);
        
        // Add visual feedback
        this.animateShuffle();
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    refreshGallery() {
        this.loadGalleryData();
        
        // Add visual feedback
        this.animateRefresh();
    }
    
    animateGalleryItems() {
        const items = this.galleryGrid.querySelectorAll('.gallery-item');
        
        items.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    animateShuffle() {
        const items = this.galleryGrid.querySelectorAll('.gallery-item');
        
        items.forEach((item, index) => {
            item.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
            item.style.transform = 'scale(0.95)';
            item.style.opacity = '0.7';
            
            setTimeout(() => {
                item.style.transform = 'scale(1)';
                item.style.opacity = '1';
            }, index * 50 + 300);
        });
        
        // Button feedback
        this.shuffleBtn.classList.add('is-loading');
        setTimeout(() => {
            this.shuffleBtn.classList.remove('is-loading');
        }, 500);
    }
    
    animateRefresh() {
        // Button feedback
        this.refreshBtn.classList.add('is-loading');
        
        const items = this.galleryGrid.querySelectorAll('.gallery-item');
        items.forEach((item, index) => {
            item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateY(-20px)';
        });
        
        setTimeout(() => {
            this.refreshBtn.classList.remove('is-loading');
        }, 1000);
    }
    
    showLoading() {
        this.loadingIndicator.style.display = 'block';
        this.galleryGrid.style.display = 'none';
    }
    
    hideLoading() {
        this.loadingIndicator.style.display = 'none';
        this.galleryGrid.style.display = 'grid';
    }
    
    showError(message) {
        this.hideLoading();
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.galleryGrid.style.display = 'none';
    }
    
    hideError() {
        this.errorMessage.style.display = 'none';
    }
    
    updateStatistics() {
        const totalImages = this.galleryData.length;
        const verifiedImages = this.galleryData.filter(item => item.verified).length;
        
        // Update DOM elements with animation
        this.animateCounter(this.totalImagesElement, totalImages);
        this.animateCounter(this.verifiedImagesElement, verifiedImages);
    }
    
    animateCounter(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        const duration = 500; // milliseconds
        const steps = 20;
        const stepValue = (targetValue - currentValue) / steps;
        const stepTime = duration / steps;
        
        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            const newValue = Math.round(currentValue + (stepValue * currentStep));
            
            if (currentStep >= steps) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = newValue;
            }
        }, stepTime);
    }
    
    updatePagination() {
        // Show pagination if there are multiple pages
        if (this.totalPages > 1) {
            this.paginationContainer.style.display = 'block';
            this.paginationList.innerHTML = '';
            
            // Smart pagination logic
            const pages = this.generateSmartPagination();
            
            // Create pagination buttons
            pages.forEach(page => {
                const pageItem = document.createElement('li');
                
                if (page === '...') {
                    // Create ellipsis
                    const ellipsis = document.createElement('span');
                    ellipsis.className = 'pagination-ellipsis';
                    ellipsis.textContent = '...';
                    pageItem.appendChild(ellipsis);
                } else {
                    // Create page button
                    const pageLink = document.createElement('a');
                    pageLink.className = `pagination-link ${page === this.currentPage ? 'is-current' : ''}`;
                    pageLink.textContent = page;
                    pageLink.href = '#';
                    pageLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.goToPage(page);
                    });
                    pageItem.appendChild(pageLink);
                }
                
                this.paginationList.appendChild(pageItem);
            });
        } else {
            this.paginationContainer.style.display = 'none';
        }
    }
    
    generateSmartPagination() {
        const pages = [];
        const maxVisiblePages = 9; // Show max 9 page numbers
        
        if (this.totalPages <= maxVisiblePages) {
            // Show all pages if total pages <= 9
            for (let i = 1; i <= this.totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Smart pagination logic
            const current = this.currentPage;
            const total = this.totalPages;
            
            // Always show first page
            pages.push(1);
            
            if (current <= 5) {
                // Near the beginning: show 1-9 and last page minus 5
                for (let i = 2; i <= 9; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total - 5);
            } else if (current >= total - 4) {
                // Near the end: show first page, ellipsis, and last 9 pages
                pages.push('...');
                for (let i = total - 8; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                // In the middle: show first, ellipsis, current-3 to current+3, ellipsis, last-5
                pages.push('...');
                for (let i = current - 3; i <= current + 3; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(total - 5);
            }
            
            // Always show last page
            if (!pages.includes(total)) {
                pages.push('...');
                pages.push(total);
            }
        }
        
        return pages;
    }
    
    goToPage(page) {
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            this.renderGallery(page);
            
            // Scroll to top of gallery
            this.galleryGrid.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
    
    jumpToPage() {
        const pageNumber = parseInt(this.pageJumpInput.value);
        
        if (pageNumber && pageNumber >= 1 && pageNumber <= this.totalPages) {
            this.goToPage(pageNumber);
            this.pageJumpInput.value = '';
        } else {
            // Show error feedback
            this.pageJumpInput.classList.add('is-danger');
            setTimeout(() => {
                this.pageJumpInput.classList.remove('is-danger');
            }, 2000);
        }
    }
}

// Scroll to top functionality (reuse from main page)
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gallery manager
    window.galleryManager = new GalleryManager();
    
    // Add keyboard shortcut hints
    console.log('Gallery shortcuts:');
    console.log('Ctrl/Cmd + R - Refresh gallery');
    console.log('Ctrl/Cmd + S - Shuffle images');
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryManager;
}