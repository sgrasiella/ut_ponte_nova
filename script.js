document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: document.querySelector('.presentation-container'),
        rootMargin: '0px',
        threshold: 0.5 // Trigger when 50% of the slide is visible
    };

    const animateElements = document.querySelectorAll('.animate-on-scroll');
    const navDots = document.querySelectorAll('.nav-dot');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Animation Trigger
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Navigation Dot Update
                const slideId = entry.target.closest('.slide').id;
                updateNavDots(slideId);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => {
        observer.observe(el);
    });

    // 2. Navigation Dots Click Handler
    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetSlide = document.getElementById(targetId);
            
            if (targetSlide) {
                targetSlide.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Helper to update active state on dots
    function updateNavDots(activeId) {
        navDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-target') === activeId) {
                dot.classList.add('active');
            }
        });
    }

});
