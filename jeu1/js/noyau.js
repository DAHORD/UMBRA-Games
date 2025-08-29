

class CoreSystem {

    constructor() {

        // La commande que le joueur doit mémoriser et taper

        // Elle réutilise des indices des énigmes précédentes pour récompenser l'attention !

        this.correctCommand = 'UMBRA.EXE -CONF1337 -KEY=42-CARTE';

        this.glitchChars = ['#', '%', '§', '^', ']', '!', '?', '$', '_'];

        

        // Éléments du DOM

        this.displayEl = document.getElementById('purge-command-display');

        this.inputEl = document.getElementById('command-input');

        this.formEl = document.getElementById('purge-form');

        this.timerEl = document.getElementById('core-timer');

        this.errorEl = document.getElementById('core-error');



        // Intervalles

        this.glitchInterval = null;

        this.timerInterval = null;

        this.timeLeft = 40; // 40 secondes pour réussir



        this.init();

    }



    init() {

        this.displayEl.textContent = this.correctCommand;

        this.addEventListeners();

        this.startTimer();

        this.startGlitchEffect();

        this.inputEl.focus();

    }



    addEventListeners() {

        this.formEl.addEventListener('submit', this.handleSubmit.bind(this));

        this.inputEl.addEventListener('input', this.handleInput.bind(this));

    }



    startTimer() {

        this.timerEl.textContent = `Temps restant : ${this.timeLeft}s`;

        this.timerInterval = setInterval(() => {

            this.timeLeft--;

            this.timerEl.textContent = `Temps restant : ${this.timeLeft}s`;

            if (this.timeLeft <= 0) {

                this.endGame(false); // Temps écoulé -> échec

            }

        }, 1000);

    }

    

    startGlitchEffect() {

        this.glitchInterval = setInterval(() => {

            let commandHtml = this.displayEl.innerHTML;

            const commandText = this.displayEl.textContent; // Utilise le texte brut pour la longueur

            

            const randomIndex = Math.floor(Math.random() * commandText.length);

            const randomGlitch = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)];

            

            // On remplace un caractère par un span "glitch" pour le style

            const newChar = `<span class="glitch-char">${randomGlitch}</span>`;

            

            // On reconstruit la chaîne avec le caractère corrompu

            // Ceci est une simplification. Une version plus robuste gérerait mieux les balises existantes.

            // Pour ce jeu, on remplace juste le contenu textuel progressivement.

            let textArray = commandText.split('');

            textArray[randomIndex] = newChar;

            this.displayEl.innerHTML = textArray.join('');

            

        }, 3000); // Une corruption toutes les 3 secondes

    }



    handleInput() {

        const currentInput = this.inputEl.value;

        const correctPart = this.correctCommand.substring(0, currentInput.length);



        if (currentInput === correctPart) {

            this.inputEl.classList.remove('input-error');

            this.inputEl.classList.add('input-correct');

        } else {

            this.inputEl.classList.remove('input-correct');

            this.inputEl.classList.add('input-error');

        }

    }



    handleSubmit(event) {

        event.preventDefault();

        if (this.inputEl.value === this.correctCommand) {

            this.endGame(true); // Succès

        } else {

            this.errorEl.textContent = "ERREUR SYSTÈME : La commande entrée est incorrecte.";

            this.inputEl.focus();

        }

    }



    endGame(isSuccess) {

        // Arrêter tous les processus en cours

        clearInterval(this.glitchInterval);

        clearInterval(this.timerInterval);

        this.inputEl.disabled = true;



        if (isSuccess) {

            this.errorEl.textContent = "COMMANDE ACCEPTÉE. PURGE DU SYSTÈME IMMINENTE...";

            this.errorEl.style.color = "var(--primary-color)";

            setTimeout(() => window.location.href = 'victoire.html', 2000);

        } else {

            this.errorEl.textContent = "TEMPS ÉCOULÉ. RENFORCEMENT DU NOYAU.";

            this.timerEl.textContent = "Temps restant : 0s";

            setTimeout(() => window.location.href = 'second-noyau.html', 2000);

        }

    }

}



document.addEventListener('DOMContentLoaded', () => new CoreSystem());