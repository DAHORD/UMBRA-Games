// js/victoire.js

document.addEventListener('DOMContentLoaded', () => {
    const finalTimeDisplay = document.getElementById('final-time');
    const gameStartTime = localStorage.getItem('gameStartTime');

    if (gameStartTime && finalTimeDisplay) {
        // 1. Calculer le temps final en secondes
        const startTime = parseInt(gameStartTime, 10);
        const finalTimeInSeconds = Math.floor((Date.now() - startTime) / 1000);

        // 2. Formater pour l'affichage (MM:SS)
        const minutes = Math.floor(finalTimeInSeconds / 60).toString().padStart(2, '0');
        const seconds = (finalTimeInSeconds % 60).toString().padStart(2, '0');
        finalTimeDisplay.textContent = `${minutes}:${seconds}`;

        // 3. Envoyer le score au serveur (AJAX/Fetch)
        fetch('../save-score.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ score: finalTimeInSeconds }),
        })
        .then(response => {
            if (!response.ok) {
                console.error('Erreur du serveur (code ' + response.status + '):', response.statusText);
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Réponse du serveur:', data);
            if (data.error) {
                console.error('Erreur de l\'API:', data.error);
            } else {
                console.log(data.success);
            }
        })
        .catch(error => {
            console.error('Erreur lors de l\'envoi du score:', error);
        });

        // 4. Nettoyer le localStorage pour la prochaine partie
        localStorage.removeItem('gameStartTime');
        
    } else if (finalTimeDisplay) {
        finalTimeDisplay.textContent = "N/A";
    }
});
