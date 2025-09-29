// Smart Transportation System - Main JavaScript

// Global variables
let selectedModes = [];
let particleSystem;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeRoutePlanner();
    initializeParticles();
    initializeCharts();
    initializeCounters();
    initializeScrollEffects();
});

// Initialize text animations
function initializeAnimations() {
    // Initialize Splitting.js for text animations
    Splitting();
    
    // Typewriter effect for hero section
    const typed = new Typed('#typed-text', {
        strings: [
            'Revolutionizing urban mobility with AI-powered solutions',
            'Reducing congestion and emissions in smart cities',
            'Connecting communities through intelligent transportation',
            'Creating sustainable futures with green technology'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: true,
        cursorChar: '|'
    });
    
    // Animate hero text on load
    anime({
        targets: '[data-splitting] .char',
        translateY: [100, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: anime.stagger(30)
    });
}

// Initialize particle system for hero background
function initializeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    
    new p5(function(p) {
        let particles = [];
        const numParticles = 50;
        
        p.setup = function() {
            p.createCanvas(canvas.offsetWidth, canvas.offsetHeight);
            
            // Create particles
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    opacity: p.random(0.3, 0.8)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Update and draw particles
            particles.forEach(particle => {
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = p.width;
                if (particle.x > p.width) particle.x = 0;
                if (particle.y < 0) particle.y = p.height;
                if (particle.y > p.height) particle.y = 0;
                
                // Draw particle
                p.fill(255, 255, 255, particle.opacity * 255);
                p.noStroke();
                p.ellipse(particle.x, particle.y, particle.size);
                
                // Draw connections
                particles.forEach(other => {
                    const distance = p.dist(particle.x, particle.y, other.x, other.y);
                    if (distance < 100) {
                        p.stroke(255, 255, 255, (1 - distance / 100) * 50);
                        p.strokeWeight(1);
                        p.line(particle.x, particle.y, other.x, other.y);
                    }
                });
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(canvas.offsetWidth, canvas.offsetHeight);
        };
    }, canvas);
}

// Initialize route planner functionality
function initializeRoutePlanner() {
    const modeSelectors = document.querySelectorAll('.mode-selector');
    
    modeSelectors.forEach(selector => {
        selector.addEventListener('click', function() {
            const mode = this.dataset.mode;
            
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                selectedModes = selectedModes.filter(m => m !== mode);
            } else {
                this.classList.add('active');
                selectedModes.push(mode);
            }
            
            updateRouteResults();
        });
    });
    
    // Auto-complete for location inputs
    const fromInput = document.getElementById('from-location');
    const toInput = document.getElementById('to-location');
    
    if (fromInput && toInput) {
        fromInput.addEventListener('input', debounce(updateRouteResults, 300));
        toInput.addEventListener('input', debounce(updateRouteResults, 300));
    }
}

// Calculate and display route options
function calculateRoute() {
    const fromLocation = document.getElementById('from-location').value;
    const toLocation = document.getElementById('to-location').value;
    
    if (!fromLocation || !toLocation) {
        showNotification('Please enter both starting and destination points', 'warning');
        return;
    }
    
    if (selectedModes.length === 0) {
        showNotification('Please select at least one transport mode', 'warning');
        return;
    }
    
    // Simulate route calculation
    showLoadingState();
    
    setTimeout(() => {
        const routes = generateMockRoutes(fromLocation, toLocation, selectedModes);
        displayRouteResults(routes);
        hideLoadingState();
        showNotification('Route calculated successfully!', 'success');
    }, 1500);
}

// Generate mock route data
function generateMockRoutes(from, to, modes) {
    const routes = [];
    
    modes.forEach(mode => {
        const baseTime = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
        const baseCost = Math.floor(Math.random() * 10) + 2; // $2-12
        const carbonFootprint = mode === 'bike' || mode === 'walk' ? 0 : Math.floor(Math.random() * 50) + 10;
        
        routes.push({
            mode: mode,
            time: baseTime,
            cost: baseCost,
            carbon: carbonFootprint,
            transfers: mode === 'metro' ? Math.floor(Math.random() * 2) : 0,
            distance: Math.floor(Math.random() * 15) + 5 // 5-20 km
        });
    });
    
    return routes.sort((a, b) => a.time - b.time);
}

// Display route calculation results
function displayRouteResults(routes) {
    const resultsContainer = document.getElementById('route-results');
    if (!resultsContainer) return;
    
    let html = '<div class="space-y-4">';
    
    routes.forEach((route, index) => {
        const modeIcons = {
            bus: '🚌',
            metro: '🚇',
            bike: '🚴',
            walk: '🚶'
        };
        
        const isBest = index === 0;
        
        html += `
            <div class="p-4 border-2 ${isBest ? 'border-4ecdc4 bg-green-50' : 'border-gray-200'} rounded-lg ${isBest ? 'ring-2 ring-4ecdc4' : ''}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl">${modeIcons[route.mode]}</span>
                        <span class="font-semibold capitalize">${route.mode}</span>
                        ${isBest ? '<span class="bg-4ecdc4 text-white text-xs px-2 py-1 rounded-full">Best Option</span>' : ''}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span class="text-gray-600">Time:</span>
                        <span class="font-semibold">${route.time} min</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Cost:</span>
                        <span class="font-semibold">$${route.cost}</span>
                    </div>
                    <div>
                        <span class="text-gray-600">Distance:</span>
                        <span class="font-semibold">${route.distance} km</span>
                    </div>
                    <div>
                        <span class="text-gray-600">CO₂:</span>
                        <span class="font-semibold">${route.carbon}g</span>
                    </div>
                </div>
                ${route.transfers > 0 ? `<div class="text-xs text-gray-600 mt-1">${route.transfers} transfer${route.transfers > 1 ? 's' : ''}</div>` : ''}
            </div>
        `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
    
    // Animate results
    anime({
        targets: '#route-results > div > div',
        translateY: [20, 0],
        opacity: [0, 1],
        easing: 'easeOutExpo',
        duration: 600,
        delay: anime.stagger(100)
    });
}

// Update route results in real-time
function updateRouteResults() {
    const fromLocation = document.getElementById('from-location').value;
    const toLocation = document.getElementById('to-location').value;
    
    if (fromLocation && toLocation && selectedModes.length > 0) {
        debounce(calculateRoute, 500)();
    }
}

// Show loading state
function showLoadingState() {
    const resultsContainer = document.getElementById('route-results');
    if (resultsContainer) {
        resultsContainer.innerHTML = `
            <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-4ecdc4"></div>
                <span class="ml-3 text-gray-600">Calculating routes...</span>
            </div>
        `;
    }
}

// Hide loading state
function hideLoadingState() {
    // Loading state is replaced by results
}

// Initialize charts
function initializeCharts() {
    const chartContainer = document.getElementById('carbon-chart');
    if (!chartContainer) return;
    
    const chart = echarts.init(chartContainer);
    
    const option = {
        title: {
            text: 'Carbon Footprint Reduction',
            left: 'center',
            textStyle: {
                color: '#1e3a5f',
                fontSize: 18,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b}: {c}g CO₂ ({d}%)'
        },
        legend: {
            bottom: 10,
            left: 'center'
        },
        series: [
            {
                name: 'Transport Mode',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: [
                    { value: 120, name: 'Traditional Transport', itemStyle: { color: '#ff6b6b' } },
                    { value: 45, name: 'Smart Bus', itemStyle: { color: '#4ecdc4' } },
                    { value: 25, name: 'Metro', itemStyle: { color: '#1e3a5f' } },
                    { value: 0, name: 'Bike/Walk', itemStyle: { color: '#2ecc71' } }
                ]
            }
        ]
    };
    
    chart.setOption(option);
    
    // Animate chart on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                chart.resize();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(chartContainer);
}

// Initialize animated counters
function initializeCounters() {
    const counters = document.querySelectorAll('.stats-counter');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseFloat(counter.dataset.count);
                
                anime({
                    targets: counter,
                    innerHTML: [0, target],
                    easing: 'easeOutExpo',
                    duration: 2000,
                    round: target < 10 ? 10 : 1,
                    update: function(anim) {
                        const value = Math.round(anim.animatables[0].target.innerHTML * 10) / 10;
                        counter.innerHTML = target < 10 ? value.toFixed(1) : value;
                    }
                });
                
                observer.unobserve(counter);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Initialize scroll effects
function initializeScrollEffects() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-bg');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });
}

// Utility functions
function scrollToRoutePlanner() {
    document.getElementById('route-planner').scrollIntoView({
        behavior: 'smooth'
    });
}

function scrollToServices() {
    document.getElementById('services').scrollIntoView({
        behavior: 'smooth'
    });
}

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

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(full)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Live transit updates simulation
function simulateLiveUpdates() {
    const transitItems = document.querySelectorAll('.glass-effect .flex.justify-between');
    
    setInterval(() => {
        transitItems.forEach(item => {
            const timeElement = item.querySelector('.text-right .text-sm');
            if (timeElement && timeElement.textContent.includes('min')) {
                const currentTime = parseInt(timeElement.textContent);
                const newTime = Math.max(0, currentTime - 1);
                timeElement.textContent = `${newTime} min`;
                
                if (newTime === 0) {
                    const statusElement = item.querySelector('.font-bold');
                    if (statusElement) {
                        statusElement.textContent = 'Arrived';
                        statusElement.className = 'text-green-400 font-bold';
                    }
                }
            }
        });
    }, 30000); // Update every 30 seconds
}

// Initialize live updates
setTimeout(simulateLiveUpdates, 5000);

// Mobile menu toggle
function toggleMobileMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// Add mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.querySelector('.md\\:hidden button');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    // Reinitialize particles on resize
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        // Particle system will handle resize automatically
    }
}, 250));

// Export functions for global access
window.scrollToRoutePlanner = scrollToRoutePlanner;
window.scrollToServices = scrollToServices;
window.calculateRoute = calculateRoute;
window.toggleMobileMenu = toggleMobileMenu;