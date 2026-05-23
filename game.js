class CyberFruitGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.fruits = [];
        this.slices = [];
        this.particles = [];
        this.trail = [];
        this.score = 0;
        this.combo = 0;
        this.gameRunning = false;
        this.lastFruitTime = 0;
        this.fruitSpawnInterval = 1500;
        this.mouseDown = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.gameTime = 60;
        this.gameStartTime = 0;
        
        this.neonColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00'];
        
        this.fruitTypes = [
            { name: 'apple', emoji: '🍎', points: 10 },
            { name: 'pineapple', emoji: '🍍', points: 15 },
            { name: 'strawberry', emoji: '🍓', points: 20 },
            { name: 'kiwi', emoji: '🥝', points: 10 },
            { name: 'orange', emoji: '🍊', points: 10 },
            { name: 'watermelon', emoji: '🍉', points: 25 }
        ];
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        
        this.canvas.addEventListener('mousedown', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('mouseup', () => this.onTouchEnd());
        this.canvas.addEventListener('mouseleave', () => this.onTouchEnd());
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.onTouchStart(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.onTouchMove(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.onTouchEnd();
        });
    }
    
    onTouchStart(e) {
        if (!this.gameRunning) return;
        this.mouseDown = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
    }
    
    onTouchMove(e) {
        if (!this.gameRunning || !this.mouseDown) return;
        
        const currentPos = { x: e.clientX, y: e.clientY };
        this.trail.push({
            x: currentPos.x,
            y: currentPos.y,
            px: this.lastMousePos.x,
            py: this.lastMousePos.y,
            color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
            alpha: 1,
            width: 12
        });
        
        this.checkSlice(currentPos);
        this.lastMousePos = currentPos;
    }
    
    onTouchEnd() {
        this.mouseDown = false;
    }
    
    checkSlice(pos) {
        this.fruits = this.fruits.filter(fruit => {
            const dx = pos.x - fruit.x;
            const dy = pos.y - fruit.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < fruit.size * 0.8) {
                this.sliceFruit(fruit, pos);
                return false;
            }
            return true;
        });
    }
    
    sliceFruit(fruit, slicePos) {
        this.combo++;
        const comboMultiplier = Math.min(this.combo, 5);
        const points = fruit.points * comboMultiplier;
        this.score += points;
        this.updateScore();
        
        if (this.combo >= 3) {
            this.showCombo(this.combo);
            this.showScreenGlow();
        }
        
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: fruit.x + (Math.random() - 0.5) * fruit.size,
                y: fruit.y + (Math.random() - 0.5) * fruit.size,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: this.neonColors[Math.floor(Math.random() * this.neonColors.length)],
                size: Math.random() * 8 + 2,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.01,
                type: 'metal'
            });
        }
        
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: fruit.x,
                y: fruit.y,
                vx: (Math.random() - 0.5) * 15,
                vy: (Math.random() - 0.5) * 15,
                color: '#ffffff',
                size: Math.random() * 4 + 1,
                alpha: 1,
                decay: Math.random() * 0.04 + 0.02,
                type: 'spark'
            });
        }
        
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: fruit.x,
                y: fruit.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                color: '#00ffff',
                size: Math.random() * 3 + 1,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.015,
                type: 'arc'
            });
        }
        
        this.slices.push({
            x: fruit.x,
            y: fruit.y,
            vx: slicePos.x > fruit.x ? -4 : 4,
            vy: -3 + Math.random() * 3,
            rotation: (Math.random() - 0.5) * 0.4,
            currentRotation: 0,
            emoji: fruit.emoji,
            alpha: 1,
            decay: 0.015,
            side: slicePos.x > fruit.x ? 'left' : 'right',
            size: fruit.size * 0.55
        });
        
        this.slices.push({
            x: fruit.x,
            y: fruit.y,
            vx: slicePos.x > fruit.x ? 4 : -4,
            vy: -3 + Math.random() * 3,
            rotation: (Math.random() - 0.5) * 0.4,
            currentRotation: 0,
            emoji: fruit.emoji,
            alpha: 1,
            decay: 0.015,
            side: slicePos.x > fruit.x ? 'right' : 'left',
            size: fruit.size * 0.55
        });
    }
    
    showCombo(combo) {
        const comboEl = document.getElementById('combo');
        comboEl.textContent = `COMBO x${combo}`;
        comboEl.classList.remove('show');
        void comboEl.offsetWidth;
        comboEl.classList.add('show');
    }
    
    showScreenGlow() {
        const glow = document.createElement('div');
        glow.className = 'screen-glow combo';
        document.querySelector('.game-container').appendChild(glow);
        setTimeout(() => glow.remove(), 500);
    }
    
    startGame() {
        this.fruits = [];
        this.slices = [];
        this.particles = [];
        this.trail = [];
        this.score = 0;
        this.combo = 0;
        this.gameTime = 60;
        this.gameRunning = true;
        this.lastFruitTime = Date.now();
        this.gameStartTime = Date.now();
        
        this.updateScore();
        this.updateTime();
        
        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('gameOverMenu').style.display = 'none';
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverMenu').style.display = 'flex';
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateTime() {
        document.getElementById('time').textContent = Math.ceil(this.gameTime);
    }
    
    spawnFruit() {
        const now = Date.now();
        if (now - this.lastFruitTime > this.fruitSpawnInterval) {
            const fruitType = this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)];
            const size = Math.random() * 30 + 50;
            const x = Math.random() * (this.canvas.width - size * 2) + size;
            
            this.fruits.push({
                x: x,
                y: this.canvas.height + size,
                vx: (Math.random() - 0.5) * 4,
                vy: -14 - Math.random() * 4,
                size: size,
                emoji: fruitType.emoji,
                points: fruitType.points,
                rotation: 0,
                rotationSpeed: (Math.random() - 0.5) * 0.15
            });
            
            this.lastFruitTime = now;
            this.fruitSpawnInterval = Math.max(600, 1500 - this.score / 150);
        }
    }
    
    updateFruits() {
        this.fruits = this.fruits.filter(fruit => {
            fruit.vy += 0.55;
            fruit.x += fruit.vx;
            fruit.y += fruit.vy;
            fruit.rotation += fruit.rotationSpeed;
            
            if (fruit.y > this.canvas.height + fruit.size || 
                fruit.x < -fruit.size || 
                fruit.x > this.canvas.width + fruit.size) {
                this.combo = 0;
                return false;
            }
            
            return true;
        });
    }
    
    updateSlices() {
        this.slices = this.slices.filter(slice => {
            slice.x += slice.vx;
            slice.y += slice.vy;
            slice.vy += 0.35;
            slice.currentRotation += slice.rotation;
            slice.alpha -= slice.decay;
            
            return slice.alpha > 0;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.alpha -= particle.decay;
            
            if (particle.type === 'arc') {
                particle.vx *= 0.95;
                particle.vy *= 0.95;
            }
            
            return particle.alpha > 0;
        });
    }
    
    updateTrail() {
        this.trail = this.trail.filter(point => {
            point.alpha -= 0.04;
            return point.alpha > 0;
        });
    }
    
    updateGameTime() {
        if (!this.gameRunning) return;
        const elapsed = (Date.now() - this.gameStartTime) / 1000;
        this.gameTime = Math.max(0, 60 - elapsed);
        this.updateTime();
        
        if (this.gameTime <= 0) {
            this.gameOver();
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGrid();
        this.drawTrail();
        
        this.fruits.forEach(fruit => this.drawFruit(fruit));
        this.slices.forEach(slice => this.drawSlice(slice));
        this.particles.forEach(particle => this.drawParticle(particle));
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.04)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 50;
        
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawTrail() {
        this.trail.forEach(point => {
            const gradient = this.ctx.createLinearGradient(point.px, point.py, point.x, point.y);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${point.alpha * 0.4})`);
            gradient.addColorStop(0.5, `${point.color}${Math.floor(point.alpha * 255).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(1, `${point.color}00`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = point.width * point.alpha;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            
            this.ctx.shadowColor = point.color;
            this.ctx.shadowBlur = 25;
            
            this.ctx.beginPath();
            this.ctx.moveTo(point.px, point.py);
            this.ctx.lineTo(point.x, point.y);
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawFruit(fruit) {
        this.ctx.save();
        this.ctx.translate(fruit.x, fruit.y);
        this.ctx.rotate(fruit.rotation);
        
        this.ctx.shadowColor = '#00ffff';
        this.ctx.shadowBlur = 20;
        
        this.ctx.font = `${fruit.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(fruit.emoji, 0, 0);
        
        this.ctx.shadowBlur = 0;
        this.ctx.restore();
    }
    
    drawSlice(slice) {
        this.ctx.save();
        this.ctx.translate(slice.x, slice.y);
        this.ctx.rotate(slice.currentRotation);
        this.ctx.globalAlpha = slice.alpha;
        
        this.ctx.shadowColor = '#ff00ff';
        this.ctx.shadowBlur = 15;
        
        this.ctx.font = `${slice.size}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(slice.emoji, 0, 0);
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        
        this.ctx.shadowColor = particle.color;
        this.ctx.shadowBlur = particle.type === 'spark' ? 15 : 10;
        
        if (particle.type === 'arc') {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * (1 + Math.random() * 0.5), 0, Math.PI * 2);
            this.ctx.fill();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
        this.ctx.restore();
    }
    
    gameLoop() {
        if (this.gameRunning) {
            this.updateGameTime();
            this.spawnFruit();
            this.updateFruits();
            this.updateSlices();
            this.updateParticles();
            this.updateTrail();
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CyberFruitGame();
});