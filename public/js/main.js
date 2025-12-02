// Main JavaScript

document.addEventListener('DOMContentLoaded', () => {
    console.log('Notivio Landing Page Loaded');

    // Initialize AOS
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });

    // Add any interactive logic here
    // For example, smooth scrolling for anchor links if not handled by CSS
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
