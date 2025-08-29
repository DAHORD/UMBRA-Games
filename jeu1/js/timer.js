// js/timer.js

document.addEventListener('DOMContentLoaded', () => {
    // Crée l'élément HTML pour le chrono s'il n'existe pas
    let timerDisplay = document.getElementById('global-timer');
    if (!timerDisplay) {
        timerDisplay = document.createElement('div');
        timerDisplay.id = 'global-timer';
        document.body.appendChild(timerDisplay);
    }

    // Récupère l'heure de début depuis le localStorage
    let gameStartTime = localStorage.getItem('gameStartTime');

    // Si le jeu vient de commencer (première page), on initialise le temps
    if (!gameStartTime) {
        gameStartTime = Date.now().toString();
        localStorage.setItem('gameStartTime', gameStartTime);
    }

    // Fonction pour mettre à jour l'affichage du chrono
    function updateTimer() {
        const startTime = parseInt(gameStartTime, 10);
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // en secondes

        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');

        timerDisplay.textContent = `Temps écoulé : ${minutes}:${seconds}`;
    }

    // Met à jour le chrono toutes les secondes
    setInterval(updateTimer, 1000);
    updateTimer(); // Appel initial pour afficher sans attendre 1s
});