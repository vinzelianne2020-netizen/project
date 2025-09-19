// ===== GLOBAL VARIABLES =====
let configState = {
    color: { id: 'silver', name: 'Quantum Silver', price: 0, hex: '#C0C0C0' },
    wheels: { id: 'standard', name: '19" Aero Wheels', price: 0 },
    interior: { id: 'black', name: 'Pure Black', price: 0 }
};

const basePrice = 89900;

// ===== UTILITY FUNCTIONS =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function formatPrice(price) {
    return `€${price.toLocaleString()}`;
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===== ANIMATION FUNCTIONS =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth > 768 ? 50 : 25;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.animationDuration = (3 + Math.random() * 2) + 's';
        particlesContainer.appendChild(particle);
    }
}

function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(target * easeOut);
        
        // Handle decimal numbers
        if (target < 10) {
            element.textContent = (target * easeOut).toFixed(1);
        } else {
            element.textContent = current;
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target < 10 ? target.toFixed(1) : target;
        }
    }
    
    requestAnimationFrame(update);
}

function animateCircularProgress(element, percentage) {
    const progressRing = element.querySelector('.progress-ring-fill');
    const progressText = element.querySelector('.progress-text');
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    // Animate the ring
    setTimeout(() => {
        progressRing.style.strokeDashoffset = offset;
    }, 300);
    
    // Animate the percentage text
    animateCounter(progressText, percentage, 2000);
}

// ===== SCROLL ANIMATIONS =====
function handleScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    animatedElements.forEach((element, index) => {
        if (isElementInViewport(element) && !element.classList.contains('animated')) {
            setTimeout(() => {
                element.classList.add('animated');
                
                // Animate counters for spec cards
                if (element.classList.contains('spec-card')) {
                    const numberElement = element.querySelector('.spec-number');
                    const target = parseFloat(numberElement.getAttribute('data-target'));
                    animateCounter(numberElement, target);
                }
                
                // Animate circular progress
                if (element.classList.contains('efficiency-card')) {
                    const progressElement = element.querySelector('.circular-progress');
                    const percentage = parseInt(progressElement.getAttribute('data-percentage'));
                    animateCircularProgress(progressElement, percentage);
                }
            }, index * 100);
        }
    });
}

// ===== NAVIGATION =====
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileToggle = document.getElementById('mobile-toggle');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar background on scroll
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > 50) {
            navbar.style.background = 'hsl(220, 15%, 3%, 0.95)';
        } else {
            navbar.style.background = 'hsl(220, 15%, 3%, 0.8)';
        }
    }, 10));
}

// ===== HERO INTERACTIONS =====
function initHeroInteractions() {
    const exploreBtn = document.getElementById('explore-btn');
    
    exploreBtn.addEventListener('click', () => {
        const featuresSection = document.getElementById('features');
        const offsetTop = featuresSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    });
    
    // Parallax effect for hero content
    window.addEventListener('scroll', debounce(() => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (scrolled < window.innerHeight) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
        }
    }, 10));
}

// ===== CAR CONFIGURATOR =====
function updateCarConfiguration() {
    const totalPrice = basePrice + configState.color.price + configState.wheels.price + configState.interior.price;
    
    // Update price displays
    document.getElementById('total-price').textContent = formatPrice(totalPrice);
    document.getElementById('config-price-text').textContent = formatPrice(totalPrice);
    
    // Update car overlay color
    const carOverlay = document.getElementById('car-overlay');
    carOverlay.style.backgroundColor = configState.color.hex;
    
    // Analytics tracking (placeholder)
    if (window.analytics && typeof window.analytics.track === 'function') {
        window.analytics.track('car_configured', {
            color: configState.color.name,
            wheels: configState.wheels.name,
            interior: configState.interior.name,
            totalPrice: totalPrice,
            timestamp: Date.now()
        });
    }
}

function initConfigurator() {
    // Color options
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all color options
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update configuration state
            configState.color = {
                id: option.getAttribute('data-color'),
                name: option.getAttribute('data-name'),
                price: parseInt(option.getAttribute('data-price')),
                hex: option.querySelector('.color-swatch').style.backgroundColor
            };
            
            updateCarConfiguration();
        });
    });
    
    // Wheel options
    const wheelOptions = document.querySelectorAll('.wheel-option');
    wheelOptions.forEach(option => {
        option.addEventListener('click', () => {
            wheelOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            configState.wheels = {
                id: option.getAttribute('data-name').toLowerCase().replace(/[^a-z0-9]/g, ''),
                name: option.getAttribute('data-name'),
                price: parseInt(option.getAttribute('data-price'))
            };
            
            updateCarConfiguration();
        });
    });
    
    // Interior options
    const interiorOptions = document.querySelectorAll('.interior-option');
    interiorOptions.forEach(option => {
        option.addEventListener('click', () => {
            interiorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            configState.interior = {
                id: option.getAttribute('data-name').toLowerCase().replace(/[^a-z0-9]/g, ''),
                name: option.getAttribute('data-name'),
                price: parseInt(option.getAttribute('data-price'))
            };
            
            updateCarConfiguration();
        });
    });
}

// ===== MODAL FUNCTIONALITY =====
function initModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('reservation-modal');
    const modalClose = document.getElementById('modal-close');
    const reserveButtons = document.querySelectorAll('#nav-reserve-btn, #hero-reserve-btn, #config-reserve-btn, #sticky-reserve-btn');
    const form = document.getElementById('reservation-form');
    const successMessage = document.getElementById('success-message');
    
    // Open modal
    reserveButtons.forEach(button => {
        button.addEventListener('click', () => {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Set minimum date to today
            const dateInput = document.getElementById('date');
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        });
    });
    
    // Close modal
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form after a delay
        setTimeout(() => {
            form.reset();
            form.style.display = 'flex';
            successMessage.style.display = 'none';
            clearFormErrors();
        }, 300);
    }
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // ESC key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}

// ===== FORM VALIDATION =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return re.test(phone.replace(/\s/g, ''));
}

function showFormError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.classList.add('visible');
}

function clearFormError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + '-error');
    
    field.classList.remove('error');
    errorElement.classList.remove('visible');
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.form-error');
    const inputElements = document.querySelectorAll('.form-input');
    
    errorElements.forEach(el => el.classList.remove('visible'));
    inputElements.forEach(el => el.classList.remove('error'));
}

function validateForm(formData) {
    let isValid = true;
    clearFormErrors();
    
    // Name validation
    if (!formData.name.trim()) {
        showFormError('name', 'Name is required');
        isValid = false;
    }
    
    // Email validation
    if (!formData.email.trim()) {
        showFormError('email', 'Email is required');
        isValid = false;
    } else if (!validateEmail(formData.email)) {
        showFormError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
        showFormError('phone', 'Phone number is required');
        isValid = false;
    } else if (!validatePhone(formData.phone)) {
        showFormError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Date validation
    if (!formData.date) {
        showFormError('date', 'Preferred date is required');
        isValid = false;
    } else {
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFormError('date', 'Please select a future date');
            isValid = false;
        }
    }
    
    return isValid;
}

// ===== FORM SUBMISSION =====
function initFormSubmission() {
    const form = document.getElementById('reservation-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = document.getElementById('btn-loader');
    const successMessage = document.getElementById('success-message');
    const reservationId = document.getElementById('reservation-id');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            date: document.getElementById('date').value
        };
        
        if (!validateForm(formData)) {
            return;
        }
        
        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Save to localStorage
            const existingReservations = JSON.parse(localStorage.getItem('nexus-reservations') || '[]');
            const newReservation = {
                ...formData,
                configuration: configState,
                totalPrice: basePrice + configState.color.price + configState.wheels.price + configState.interior.price,
                id: Date.now().toString(),
                timestamp: new Date().toISOString()
            };
            
            existingReservations.push(newReservation);
            localStorage.setItem('nexus-reservations', JSON.stringify(existingReservations));
            
            // Show success message
            form.style.display = 'none';
            successMessage.style.display = 'block';
            reservationId.textContent = newReservation.id.slice(-6);
            
            // Analytics tracking (placeholder)
            if (window.analytics && typeof window.analytics.track === 'function') {
                window.analytics.track('reservation_completed', {
                    reservationId: newReservation.id,
                    configuration: configState,
                    totalPrice: newReservation.totalPrice,
                    timestamp: Date.now()
                });
            }
            
            // Show success toast
            showToast('Reservation confirmed! We\'ll contact you soon.', 'success');
            
        } catch (error) {
            console.error('Error submitting reservation:', error);
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
        }
    });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Style the toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'success' ? 'hsl(120, 100%, 25%)' : 
                   type === 'error' ? 'hsl(0, 84%, 60%)' : 
                   'hsl(220, 15%, 8%)',
        color: 'white',
        padding: '1rem 2rem',
        borderRadius: '8px',
        zIndex: '9999',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        maxWidth: '400px',
        textAlign: 'center'
    });
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}

// ===== STICKY CTA =====
function initStickyCTA() {
    const stickyCTA = document.getElementById('sticky-cta');
    
    window.addEventListener('scroll', debounce(() => {
        if (window.scrollY > window.innerHeight) {
            stickyCTA.classList.add('visible');
        } else {
            stickyCTA.classList.remove('visible');
        }
    }, 100));
}

// ===== KEYBOARD NAVIGATION =====
function initKeyboardNavigation() {
    // Tab navigation for modal
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modal-overlay');
        if (modal.classList.contains('active') && e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initPerformanceOptimizations() {
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = './assets/hero-car.jpg';
    preloadLink.as = 'image';
    document.head.appendChild(preloadLink);
}

// ===== PROGRESSIVE ENHANCEMENT =====
function initProgressiveEnhancement() {
    // Check for browser support
    const hasIntersectionObserver = 'IntersectionObserver' in window;
    const hasRequestAnimationFrame = 'requestAnimationFrame' in window;
    const hasLocalStorage = 'localStorage' in window;
    
    if (!hasIntersectionObserver) {
        // Fallback for older browsers
        window.addEventListener('scroll', debounce(handleScrollAnimations, 100));
    }
    
    if (!hasRequestAnimationFrame) {
        // Disable animations for older browsers
        document.documentElement.style.setProperty('--transition', 'none');
    }
    
    if (!hasLocalStorage) {
        console.warn('LocalStorage not supported. Reservations will not be saved.');
    }
}

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initAccessibility() {
    // Add ARIA labels
    const buttons = document.querySelectorAll('button:not([aria-label])');
    buttons.forEach(button => {
        if (button.textContent.trim()) {
            button.setAttribute('aria-label', button.textContent.trim());
        }
    });
    
    // Add focus indicators
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-nav');
        }
    });
    
    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-nav');
    });
    
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: hsl(220, 15%, 8%);
        color: white;
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
        border-radius: 4px;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', () => {
        skipLink.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
}

// ===== INITIALIZATION =====
function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }
    
    try {
        // Initialize all components
        createParticles();
        initNavigation();
        initHeroInteractions();
        initConfigurator();
        initModal();
        initFormSubmission();
        initStickyCTA();
        initKeyboardNavigation();
        initPerformanceOptimizations();
        initProgressiveEnhancement();
        initAccessibility();
        
        // Set initial configuration
        updateCarConfiguration();
        
        // Initialize scroll animations
        const scrollAnimationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    
                    // Handle specific animations
                    if (entry.target.classList.contains('spec-card')) {
                        const numberElement = entry.target.querySelector('.spec-number');
                        if (numberElement) {
                            const target = parseFloat(numberElement.getAttribute('data-target'));
                            animateCounter(numberElement, target);
                        }
                    }
                    
                    if (entry.target.querySelector('.circular-progress')) {
                        const progressElement = entry.target.querySelector('.circular-progress');
                        const percentage = parseInt(progressElement.getAttribute('data-percentage'));
                        animateCircularProgress(progressElement, percentage);
                    }
                }
            });
        }, { threshold: 0.3 });
        
        // Observe animated elements
        document.querySelectorAll('[data-animate]').forEach(el => {
            scrollAnimationObserver.observe(el);
        });
        
        console.log('NEXUS website initialized successfully');
        
    } catch (error) {
        console.error('Error initializing NEXUS website:', error);
    }
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
    // You could send this to an error tracking service
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    // You could send this to an error tracking service
});

// Start initialization
init();

// ===== EXPORT FOR TESTING (if needed) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatPrice,
        validateEmail,
        validatePhone,
        configState
    };
}