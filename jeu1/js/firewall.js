class Firewall {

    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error("Erreur critique : Canvas non trouvé !");
            return;
        }
        this.ctx = this.canvas.getContext('2d');

        this.feedbackEl = document.getElementById('firewall-feedback');
        this.keyDisplayEl = document.getElementById('key-display');
        
        this.nodes = [
            { id: 'A', x: 200, y: 350, label: 'A' },
            { id: 'E', x: 100, y: 100, label: 'E' },
            { id: 'B', x: 450, y: 150, label: 'B' },
            { id: 'C', x: 700, y: 100, label: 'C' },
            { id: 'D', x: 850, y: 350, label: 'D' },
            { id: 'F', x: 450, y: 450, label: 'F' },
            { id: 'S', x: 900, y: 550, label: 'S' }
        ];
        this.connections = [
            ['E', 'B'], ['B', 'A'], ['B', 'C'], ['A', 'F'],
            ['C', 'D'], ['D', 'F'], ['D', 'S'], ['F', 'S']
        ];
        this.correctSequence = ['D', 'A', 'F', 'E', 'S'];
        this.nodeRadius = 25;

        // Configuration de la taille virtuelle et de la transformation
        this.virtualWidth = 1000;
        this.virtualHeight = 650;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        
        // État du Jeu
        this.playerSequence = [];
        this.hoveredNode = null;
        this.accessKey = localStorage.getItem('firewallAccessKey');
        this.isGameOver = false;

        // Nouvelles variables pour le zoom et le pan
        this.isZoomed = false;
        this.isPanning = false;
        this.startX = 0;
        this.startY = 0;
        this.currentTranslateX = 0;
        this.currentTranslateY = 0;
        this.zoomToggleButton = document.querySelector('.zoom-toggle-button');

        this.init();
    }

    init() {
        this.addEventListeners();
        this.resizeCanvas();
        this.updateKeyDisplay();
    }
    
    // Méthode pour appliquer les transformations
    applyTransform() {
        const scaleValue = this.isZoomed ? 2 : 1;
        this.canvas.style.transform = `scale(${scaleValue}) translate(${this.currentTranslateX}px, ${this.currentTranslateY}px)`;
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;

        this.scale = Math.min(
            this.canvas.width / this.virtualWidth,
            this.canvas.height / this.virtualHeight
        );

        this.offsetX = (this.canvas.width - this.virtualWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.virtualHeight * this.scale) / 2;

        this.draw();
    }

    addEventListeners() {
        window.addEventListener('resize', this.resizeCanvas.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // GESTION DU ZOOM ET DU PAN EN INTÉGRATION
        if (this.zoomToggleButton) {
            this.zoomToggleButton.addEventListener('click', () => {
                this.isZoomed = !this.isZoomed;
                if (!this.isZoomed) {
                    this.currentTranslateX = 0;
                    this.currentTranslateY = 0;
                }
                this.applyTransform();
                this.zoomToggleButton.textContent = this.isZoomed ? 'Dézoomer' : 'Zoomer';
            });
        }

        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isZoomed) {
                this.isPanning = true;
                this.startX = e.clientX - this.currentTranslateX;
                this.startY = e.clientY - this.currentTranslateY;
                this.canvas.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isPanning) return;
            this.currentTranslateX = e.clientX - this.startX;
            this.currentTranslateY = e.clientY - this.startY;
            this.applyTransform();
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isPanning = false;
            if (this.isZoomed) this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isPanning = false;
            if (this.isZoomed) this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && this.isZoomed) {
                this.isPanning = true;
                this.startX = e.touches[0].clientX - this.currentTranslateX;
                this.startY = e.touches[0].clientY - this.currentTranslateY;
                e.preventDefault();
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.isPanning || e.touches.length !== 1) return;
            this.currentTranslateX = e.touches[0].clientX - this.startX;
            this.currentTranslateY = e.touches[0].clientY - this.startY;
            this.applyTransform();
        });

        this.canvas.addEventListener('touchend', () => {
            this.isPanning = false;
        });
    }
    
    /**
     * Traduit les coordonnées de la souris en tenant compte de l'échelle CSS et du décalage.
     * C'est ici que la correction est appliquée.
     */
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        
        const scaleValue = this.isZoomed ? 2 : 1;
        
        // Annulation de la translation CSS, puis de l'échelle CSS.
        const transformedX = (mouseX - this.currentTranslateX) / scaleValue;
        const transformedY = (mouseY - this.currentTranslateY) / scaleValue;

        // On applique ensuite la transformation inverse du monde virtuel (faite par le .js)
        return {
            x: (transformedX - this.offsetX) / this.scale,
            y: (transformedY - this.offsetY) / this.scale
        };
    }

    handleMouseMove(event) {
        if (this.isGameOver) return;
        const mousePos = this.getMousePos(event);
        const scaledNodeRadius = this.nodeRadius;
        
        this.hoveredNode = this.nodes.find(node => {
            const distance = Math.sqrt((mousePos.x - node.x) ** 2 + (mousePos.y - node.y) ** 2);
            return distance < scaledNodeRadius;
        }) || null;
        
        this.draw();
    }
    
    handleClick(event) {
        if (this.isGameOver || !this.hoveredNode) return;
        
        if (!this.playerSequence.includes(this.hoveredNode.id)) {
            this.playerSequence.push(this.hoveredNode.id);
            this.feedbackEl.textContent = `Séquence : ${this.playerSequence.join(' → ')}`;
            this.draw();
            this.checkSequence();
        }
    }
    
    updateKeyDisplay() {
        if (!this.keyDisplayEl) return;
        const accessKey = localStorage.getItem('firewallAccessKey');
        const keyWasCopied = localStorage.getItem('keyCopied') === 'true';

        if (!accessKey) {
            this.keyDisplayEl.innerHTML = `Clé de session : non détectée.<br><a href="salle-serveur.html">Revenir à l'étape précédente<br>pour générer la clé.</a>`;
            this.keyDisplayEl.style.color = 'var(--error-color)';
            this.keyDisplayEl.querySelector('a').style.color = '#bbbbff';
        } else if (!keyWasCopied) {
            this.keyDisplayEl.innerHTML = `Clé de session détectée :<br>${accessKey} (non copiée)<br><a href="salle-serveur.html">Revenir à l'étape précédente<br>pour copier la clé.</a>`;
            this.keyDisplayEl.style.color = '#ffa500';
            this.keyDisplayEl.querySelector('a').style.color = '#bbb';
        } else {
            this.keyDisplayEl.innerHTML = `Clé de session détectée :<br>${accessKey} (copiée)`;
            this.keyDisplayEl.style.color = 'var(--primary-color)';
        }
    }

    checkSequence() {
        const isPartialMatch = this.correctSequence.slice(0, this.playerSequence.length).every((v, i) => v === this.playerSequence[i]);
        
        if (!isPartialMatch) {
            this.isGameOver = true;
            this.feedbackEl.textContent = "SÉQUENCE INCORRECTE. Système verrouillé.";
            this.feedbackEl.style.color = 'var(--error-color)';
            setTimeout(() => {
                this.isGameOver = false;
                this.playerSequence = [];
                this.feedbackEl.textContent = 'En attente de la séquence...';
                this.feedbackEl.style.color = '';
                this.draw();
                this.updateKeyDisplay();
            }, 2000);
            this.draw();
            this.updateKeyDisplay();
            return;
        }

        if (this.playerSequence.length === this.correctSequence.length) {
            this.isGameOver = true;
            const keyIsPresent = this.accessKey;
            const keyWasCopied = localStorage.getItem('keyCopied') === 'true';

            if (keyIsPresent && keyWasCopied) {
                this.feedbackEl.textContent = "BYPASS RÉUSSI. PARE-FEU DÉSACTIVÉ !";
                this.feedbackEl.style.color = 'var(--primary-color)';
                setTimeout(() => window.location.href = 'noyau.html', 2000);
            } else if (keyIsPresent && !keyWasCopied) {
                this.feedbackEl.textContent = "CLÉ DE SESSION DÉTECTÉE, MAIS PROTOCOLE DE COPIE NON RESPECTÉ !";
                this.feedbackEl.style.color = 'var(--error-color)';
            } else {
                this.feedbackEl.textContent = "SÉQUENCE CORRECTE, MAIS CLÉ D'ACCÈS MANQUANTE !";
                this.feedbackEl.style.color = 'var(--error-color)';
            }
            this.draw();
            this.updateKeyDisplay();
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        this.ctx.lineWidth = 3;
        this.connections.forEach(conn => {
            const n1 = this.nodes.find(n => n.id === conn[0]);
            const n2 = this.nodes.find(n => n.id === conn[1]);
            this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.moveTo(n1.x, n1.y);
            this.ctx.lineTo(n2.x, n2.y);
            this.ctx.stroke();
        });
        
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = this.isGameOver && !this.accessKey ? 'var(--error-color)' : 'var(--primary-color)';
        for (let i = 0; i < this.playerSequence.length - 1; i++) {
             const n1 = this.nodes.find(n => n.id === this.playerSequence[i]);
             const n2 = this.nodes.find(n => n.id === this.playerSequence[i + 1]);
             this.ctx.beginPath();
             this.ctx.moveTo(n1.x, n1.y);
             this.ctx.lineTo(n2.x, n2.y);
             this.ctx.stroke();
        }

        this.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);

            this.ctx.shadowBlur = 0;
            let fillStyle = 'rgba(0, 255, 0, 0.3)';
            if (this.playerSequence.includes(node.id)) {
                fillStyle = 'var(--primary-color)';
            }
            if (this.hoveredNode && this.hoveredNode.id === node.id) {
                this.ctx.shadowColor = 'white';
                this.ctx.shadowBlur = 20;
            }
            if (this.isGameOver && !this.playerSequence.includes(node.id)) {
                 fillStyle = 'rgba(100, 100, 100, 0.2)';
            }
            this.ctx.fillStyle = fillStyle;
            this.ctx.fill();
            
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = '#0a0a0a';
            this.ctx.font = `bold ${this.nodeRadius * 0.8}px "Roboto Mono"`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.label, node.x, node.y);
        });

        this.ctx.restore();
        this.updateKeyDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => new Firewall('firewall-canvas'));