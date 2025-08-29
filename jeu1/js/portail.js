document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');

    const passwordInput = document.getElementById('password');

    const errorMessage = document.getElementById('error-message');



    // Le mot de passe correct, trouvé dans le commentaire HTML

    const correctPassword = 'protocol1337';



    // Ajoutez un compteur de tentatives
    let failedAttempts = 0;

    // Ajoutez une référence à l'élément indice (à créer dans votre HTML)
    const hintMessage1 = document.getElementById('hint-message1');
    const hintMessage2 = document.getElementById('hint-message2');
    const hintMessage3 = document.getElementById('hint-message3');


    loginForm.addEventListener('submit', (event) => {

        // Empêche le rechargement de la page

        event.preventDefault();



        const enteredPassword = passwordInput.value;



        if (enteredPassword === correctPassword) {

            // Mot de passe correct, redirection

            errorMessage.textContent = 'Accès autorisé... Redirection.';

            errorMessage.style.color = 'var(--primary-color)';

            

            setTimeout(() => {

                window.location.href = 'salle-serveur.html';}, 2000); // Petite attente pour l'effet

            failedAttempts = 0; // Réinitialise le compteur en cas de succès

            if (hintMessage) hintMessage.style.display = 'none'; // Cache l'indice si affiché

        } else {

            // Mot de passe incorrect

            errorMessage.textContent = 'ERREUR : Mot de passe incorrect.';

            passwordInput.value = ''; // On vide le champ

            passwordInput.focus(); // On remet le focus dessus

            failedAttempts++;

            if (failedAttempts === 3 && hintMessage1) {

                hintMessage1.style.display = 'block'; // Affiche l'indice

            }

            if (failedAttempts === 5 && hintMessage2) {

                hintMessage2.style.display = 'block'; // Affiche l'indice

            }

            if (failedAttempts === 7 && hintMessage3) {

                hintMessage3.style.display = 'block'; // Affiche l'indice

            }

        }

    });

});