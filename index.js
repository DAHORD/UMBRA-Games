document.addEventListener('DOMContentLoaded', () => {

    /**

     * Gère l'animation d'apparition des sections au défilement.

     * Utilise l'API Intersection Observer pour des performances optimales.

     */

    const revealOnScroll = () => {

        const revealElements = document.querySelectorAll('.reveal');



        const observerOptions = {

            root: null, // observe par rapport au viewport

            rootMargin: '0px',

            threshold: 0.15 // l'élément est considéré visible à 15%

        };



        const observer = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add('visible');

                    // Optionnel : arrêter d'observer l'élément une fois qu'il est visible

                    // observer.unobserve(entry.target);

                }

            });

        }, observerOptions);



        revealElements.forEach(el => {

            observer.observe(el);

        });

    };



    revealOnScroll();

});




