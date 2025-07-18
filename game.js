// Configuração do jogo
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar canvas para dispositivos móveis
function resizeCanvas() {
    const maxWidth = window.innerWidth - 20;
    const maxHeight = window.innerHeight - 20;
    const aspectRatio = 800 / 600;
    
    if (maxWidth / aspectRatio <= maxHeight) {
        canvas.style.width = maxWidth + 'px';
        canvas.style.height = (maxWidth / aspectRatio) + 'px';
    } else {
        canvas.style.width = (maxHeight * aspectRatio) + 'px';
        canvas.style.height = maxHeight + 'px';
    }
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Estado do jogo
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
let gameLevel = 1;
let score = 0;
let playerHealth = 100;

// Objetos do jogo
let player = {
    x: 100,
    y: canvas.height / 2,
    width: 80,
    height: 40,
    speed: 3,
    image: null
};

let bullets = [];
let enemies = [];
let explosions = [];

// Controles
let keys = {};

// Imagens
let images = {};

// Carregar imagens
function loadImages() {
    const imageFiles = [
        'player-submarine.jpg',
        'enemy-submarine1.jpg',
        'enemy-submarine2.jpg',
        'corvette.jpg',
        'frigate.jpg',
        'destroyer.jpg'
    ];
    
    let loadedImages = 0;
    
    imageFiles.forEach(file => {
        const img = new Image();
        img.onload = () => {
            loadedImages++;
            if (loadedImages === imageFiles.length) {
                console.log('Todas as imagens carregadas');
            }
        };
        img.src = file;
        images[file.split('.')[0]] = img;
    });
}

// Classe Bullet
class Bullet {
    constructor(x, y, direction = 1) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 3;
        this.speed = 3.5 * direction;
        this.direction = direction;
    }
    
    update() {
        this.x += this.speed;
    }
    
    draw() {
        ctx.fillStyle = this.direction > 0 ? '#ffff00' : '#ff4444';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Efeito de brilho
        ctx.shadowColor = this.direction > 0 ? '#ffff00' : '#ff4444';
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
    
    isOffScreen() {
        return this.x < -this.width || this.x > canvas.width + this.width;
    }
}

// Classe Enemy
class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.speed = (1 + Math.random() * 2) * 0.5;
        this.health = this.getHealthByType();
        this.maxHealth = this.health;
        this.lastShot = 0;
        this.shootInterval = 2000 + Math.random() * 3000;
        
        // Definir tamanho baseado no tipo
        switch(type) {
            case 'submarine':
                this.width = 70;
                this.height = 35;
                break;
            case 'corvette':
                this.width = 90;
                this.height = 45;
                break;
            case 'frigate':
                this.width = 110;
                this.height = 55;
                break;
            case 'destroyer':
                this.width = 130;
                this.height = 65;
                break;
        }
    }
    
    getHealthByType() {
        switch(this.type) {
            case 'submarine': return 30;
            case 'corvette': return 50;
            case 'frigate': return 80;
            case 'destroyer': return 120;
            default: return 30;
        }
    }
    
    getImageKey() {
        switch(this.type) {
            case 'submarine': return Math.random() > 0.5 ? 'enemy-submarine1' : 'enemy-submarine2';
            case 'corvette': return 'corvette';
            case 'frigate': return 'frigate';
            case 'destroyer': return 'destroyer';
            default: return 'enemy-submarine1';
        }
    }
    
    update() {
        this.x -= this.speed;
        
        // Atirar ocasionalmente
        const now = Date.now();
        if (now - this.lastShot > this.shootInterval && this.x < canvas.width - 100) {
            this.shoot();
            this.lastShot = now;
        }
    }
    
    shoot() {
        bullets.push(new Bullet(this.x, this.y + this.height / 2, -1));
    }
    
    draw() {
        const imageKey = this.getImageKey();
        if (images[imageKey]) {
            ctx.drawImage(images[imageKey], this.x, this.y, this.width, this.height);
        } else {
            // Fallback se a imagem não carregar
            ctx.fillStyle = '#666666';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // Barra de vida
        if (this.health < this.maxHealth) {
            const barWidth = this.width;
            const barHeight = 4;
            const healthPercent = this.health / this.maxHealth;
            
            ctx.fillStyle = '#333333';
            ctx.fillRect(this.x, this.y - 8, barWidth, barHeight);
            
            ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            ctx.fillRect(this.x, this.y - 8, barWidth * healthPercent, barHeight);
        }
    }
    
    takeDamage(damage) {
        this.health -= damage;
        return this.health <= 0;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// Classe Explosion
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = 30;
        this.life = 30;
        this.maxLife = 30;
    }
    
    update() {
        this.life--;
        this.radius = (this.maxRadius * (this.maxLife - this.life)) / this.maxLife;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Círculo externo (laranja)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6600';
        ctx.fill();
        
        // Círculo interno (amarelo)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0;
    }
}

// Funções de controle
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
            shoot();
        }
    }
    
    if (e.code === 'Escape') {
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Controles touch para mobile
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    touchStartX = touch.clientX - rect.left;
    touchStartY = touch.clientY - rect.top;
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState === 'playing') {
        shoot();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState === 'playing' && e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // Converter coordenadas do canvas
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        player.x = (touchX * scaleX) - player.width / 2;
        player.y = (touchY * scaleY) - player.height / 2;
        
        // Manter o jogador dentro dos limites
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
        player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    }
});

// Funções do jogo
function shoot() {
    bullets.push(new Bullet(player.x + player.width, player.y + player.height / 2));
}

function spawnEnemy() {
    const types = ['submarine', 'corvette', 'frigate', 'destroyer'];
    let availableTypes = ['submarine'];
    
    // Adicionar tipos baseado no nível
    if (gameLevel >= 2) availableTypes.push('corvette');
    if (gameLevel >= 3) availableTypes.push('frigate', 'destroyer');
    
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const y = Math.random() * (canvas.height - 100) + 50;
    
    enemies.push(new Enemy(type, canvas.width, y));
}

function updatePlayer() {
    if (gameState !== 'playing') return;
    
    // Movimento com teclado
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        player.y += player.speed;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        player.x += player.speed;
    }
    
    // Manter o jogador dentro dos limites
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        
        if (bullets[i].isOffScreen()) {
            bullets.splice(i, 1);
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].update();
        
        if (enemies[i].isOffScreen()) {
            enemies.splice(i, 1);
        }
    }
}

function updateExplosions() {
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].update();
        
        if (explosions[i].isDead()) {
            explosions.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Balas do jogador vs inimigos
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.direction < 0) continue; // Pular balas inimigas
        
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                
                // Colisão detectada
                bullets.splice(i, 1);
                
                if (enemy.takeDamage(25)) {
                    // Inimigo destruído
                    explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
                    enemies.splice(j, 1);
                    
                    // Pontuação baseada no tipo
                    switch(enemy.type) {
                        case 'submarine': score += 100; break;
                        case 'corvette': score += 200; break;
                        case 'frigate': score += 300; break;
                        case 'destroyer': score += 500; break;
                    }
                    
                    updateUI();
                }
                break;
            }
        }
    }
    
    // Balas inimigas vs jogador
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (bullet.direction > 0) continue; // Pular balas do jogador
        
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {
            
            // Jogador atingido
            bullets.splice(i, 1);
            playerHealth -= 10;
            updateUI();
            
            if (playerHealth <= 0) {
                gameOver();
            }
        }
    }
    
    // Inimigos vs jogador
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y) {
            
            // Colisão com inimigo
            explosions.push(new Explosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2));
            enemies.splice(i, 1);
            playerHealth -= 20;
            updateUI();
            
            if (playerHealth <= 0) {
                gameOver();
            }
        }
    }
}

function drawPlayer() {
    if (images['player-submarine']) {
        ctx.drawImage(images['player-submarine'], player.x, player.y, player.width, player.height);
    } else {
        // Fallback
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

function drawBackground() {
    // Gradiente do fundo do mar
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#001a33');
    gradient.addColorStop(0.5, '#004466');
    gradient.addColorStop(1, '#002244');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Efeitos de água
    ctx.save();
    ctx.globalAlpha = 0.1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 20 + 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
    }
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    
    if (gameState === 'playing' || gameState === 'paused') {
        drawPlayer();
        
        bullets.forEach(bullet => bullet.draw());
        enemies.forEach(enemy => enemy.draw());
        explosions.forEach(explosion => explosion.draw());
    }
}

function updateUI() {
    document.getElementById('health').textContent = Math.max(0, playerHealth);
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = gameLevel;
}

function gameLoop() {
    if (gameState === 'playing') {
        updatePlayer();
        updateBullets();
        updateEnemies();
        updateExplosions();
        checkCollisions();
        
        // Spawn inimigos
        if (Math.random() < 0.01 + (gameLevel * 0.0025)) {
            spawnEnemy();
        }
        
        // Verificar progressão de nível
        if (score >= gameLevel * 1000) {
            if (gameLevel < 3) {
                gameLevel++;
                updateUI();
            }
        }
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Funções de menu
function startGame() {
    gameState = 'playing';
    gameLevel = 1;
    score = 0;
    playerHealth = 100;
    
    // Limpar arrays
    bullets.length = 0;
    enemies.length = 0;
    explosions.length = 0;
    
    // Resetar posição do jogador
    player.x = 100;
    player.y = canvas.height / 2;
    
    updateUI();
    hideAllMenus();
}

function pauseGame() {
    gameState = 'paused';
    document.getElementById('pauseMenu').classList.remove('hidden');
}

function resumeGame() {
    gameState = 'playing';
    hideAllMenus();
}

function restartGame() {
    startGame();
}

function gameOver() {
    gameState = 'gameOver';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverMenu').classList.remove('hidden');
}

function hideAllMenus() {
    document.getElementById('startMenu').classList.add('hidden');
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOverMenu').classList.add('hidden');
}

// Inicialização
loadImages();
updateUI();
gameLoop();

