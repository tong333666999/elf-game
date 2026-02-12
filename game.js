/**
 * 小精靈遊戲 - Pac-Man Clone
 * 使用 Vanilla JavaScript 製作
 */

// 遊戲配置
const CONFIG = {
    CELL_SIZE: 20,
    COLS: 19,
    ROWS: 21,
    PACMAN_SPEED: 150, // 毫秒/格
    GHOST_SPEED: 200,
    FPS: 60
};

// 地圖符號
const MAP = [
    "###################",
    "#........#........#",
    "#.##.###.#.###.##.#",
    "#o##.###.#.###.##o#",
    "#.................#",
    "#.##.#.#####.#.##.#",
    "#....#...#...#....#",
    "####.###.#.###.####",
    "   #.#.......#.#   ",
    "   #.#.##.##.#.#   ",
    "####.#.#   #.#.####",
    "    ....# #....    ",
    "####.#.#####.#.####",
    "   #.#.......#.#   ",
    "   #.#.#####.#.#   ",
    "####.#...#...#.####",
    "#........#........#",
    "#.##.###.#.###.##.#",
    "#o.#.....P.....#.o#",
    "##.#.#.#####.#.#.##",
    "#....#...#...#....#",
    "#.######.#.######.#",
    "#.................#",
    "###################"
];

// 遊戲狀態
let gameState = {
    score: 0,
    lives: 3,
    isRunning: false,
    isPaused: false,
    lastTime: 0,
    dotsEaten: 0,
    totalDots: 0
};

// 遊戲元素
let canvas, ctx;
let pacman = { x: 9, y: 17, dir: { x: 0, y: 0 }, nextDir: { x: 0, y: 0 }, mouthOpen: 0, mouthSpeed: 0.2 };
let ghosts = [];
let dots = [];
let walls = [];
let powerPellets = [];

// 初始化遊戲
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // 設置畫布大小
    canvas.width = CONFIG.COLS * CONFIG.CELL_SIZE;
    canvas.height = CONFIG.ROWS * CONFIG.CELL_SIZE;
    
    // 根據螢幕大小調整
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 解析地圖
    parseMap();
    
    // 設置控制
    setupControls();
    
    // 綁定按鈕事件
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', resetGame);
    
    // 開始遊戲循環
    requestAnimationFrame(gameLoop);
}

// 調整畫布大小（響應式）
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const maxWidth = Math.min(container.clientWidth - 20, CONFIG.COLS * CONFIG.CELL_SIZE);
    const scale = maxWidth / (CONFIG.COLS * CONFIG.CELL_SIZE);
    
    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (CONFIG.ROWS * CONFIG.CELL_SIZE * scale) + 'px';
}

// 解析地圖
function parseMap() {
    dots = [];
    walls = [];
    powerPellets = [];
    
    for (let y = 0; y < MAP.length && y < CONFIG.ROWS; y++) {
        for (let x = 0; x < MAP[y].length && x < CONFIG.COLS; x++) {
            const char = MAP[y][x];
            if (char === '#') {
                walls.push({ x, y });
            } else if (char === '.') {
                dots.push({ x, y, eaten: false });
                gameState.totalDots++;
            } else if (char === 'o') {
                powerPellets.push({ x, y, eaten: false });
                gameState.totalDots++;
            } else if (char === 'P') {
                pacman.x = x;
                pacman.y = y;
            }
        }
    }
    
    // 初始化幽靈
    ghosts = [
        { x: 9, y: 9, color: '#ff0000', dir: { x: 0, y: -1 }, scared: false },
        { x: 10, y: 9, color: '#ffb8ff', dir: { x: -1, y: 0 }, scared: false },
        { x: 8, y: 9, color: '#00ffff', dir: { x: 1, y: 0 }, scared: false }
    ];
}

// 設置控制
function setupControls() {
    // 鍵盤控制
    document.addEventListener('keydown', (e) => {
        if (!gameState.isRunning) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                pacman.nextDir = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                pacman.nextDir = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                pacman.nextDir = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                pacman.nextDir = { x: 1, y: 0 };
                e.preventDefault();
                break;
        }
    });
    
    // 觸控按鈕
    const btnMap = {
        'upBtn': { x: 0, y: -1 },
        'downBtn': { x: 0, y: 1 },
        'leftBtn': { x: -1, y: 0 },
        'rightBtn': { x: 1, y: 0 }
    };
    
    Object.entries(btnMap).forEach(([id, dir]) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (gameState.isRunning) {
                    pacman.nextDir = dir;
                }
            });
            btn.addEventListener('mousedown', (e) => {
                if (gameState.isRunning) {
                    pacman.nextDir = dir;
                }
            });
        }
    });
    
    // 觸控滑動支援
    let touchStartX, touchStartY;
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY || !gameState.isRunning) return;
        
        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;
        
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            pacman.nextDir = { x: dx > 0 ? 1 : -1, y: 0 };
        } else {
            pacman.nextDir = { x: 0, y: dy > 0 ? 1 : -1 };
        }
        
        touchStartX = touchEndX;
        touchStartY = touchEndY;
        e.preventDefault();
    }, { passive: false });
}

// 檢查是否可移動
function canMove(x, y) {
    if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) {
        return false;
    }
    return !walls.some(w => w.x === x && w.y === y);
}

// 移動小精靈
function movePacman() {
    // 嘗試改變方向
    if (pacman.nextDir.x !== 0 || pacman.nextDir.y !== 0) {
        const newX = pacman.x + pacman.nextDir.x;
        const newY = pacman.y + pacman.nextDir.y;
        if (canMove(newX, newY)) {
            pacman.dir = { ...pacman.nextDir };
        }
    }
    
    // 繼續當前方向
    const newX = pacman.x + pacman.dir.x;
    const newY = pacman.y + pacman.dir.y;
    
    if (canMove(newX, newY)) {
        pacman.x = newX;
        pacman.y = newY;
    }
    
    // 嘴巴動畫
    pacman.mouthOpen += pacman.mouthSpeed;
    if (pacman.mouthOpen > 1 || pacman.mouthOpen < 0) {
        pacman.mouthSpeed = -pacman.mouthSpeed;
    }
}

// 移動幽靈
function moveGhosts() {
    ghosts.forEach(ghost => {
        const directions = [
            { x: 0, y: -1 }, { x: 0, y: 1 },
            { x: -1, y: 0 }, { x: 1, y: 0 }
        ];
        
        // 簡單 AI：朝小精靈方向移動
        let bestDir = ghost.dir;
        let minDist = Infinity;
        
        directions.forEach(dir => {
            if (dir.x === -ghost.dir.x && dir.y === -ghost.dir.y) return;
            
            const newX = ghost.x + dir.x;
            const newY = ghost.y + dir.y;
            
            if (canMove(newX, newY)) {
                const dist = Math.abs(newX - pacman.x) + Math.abs(newY - pacman.y);
                if (dist < minDist) {
                    minDist = dist;
                    bestDir = dir;
                }
            }
        });
        
        ghost.dir = bestDir;
        const newX = ghost.x + ghost.dir.x;
        const newY = ghost.y + ghost.dir.y;
        
        if (canMove(newX, newY)) {
            ghost.x = newX;
            ghost.y = newY;
        }
    });
}

// 檢查碰撞
function checkCollisions() {
    // 吃豆子
    const dotIndex = dots.findIndex(d => d.x === pacman.x && d.y === pacman.y && !d.eaten);
    if (dotIndex !== -1) {
        dots[dotIndex].eaten = true;
        gameState.score += 10;
        gameState.dotsEaten++;
        updateScore();
    }
    
    // 吃能量球
    const pelletIndex = powerPellets.findIndex(p => p.x === pacman.x && p.y === pacman.y && !p.eaten);
    if (pelletIndex !== -1) {
        powerPellets[pelletIndex].eaten = true;
        gameState.score += 50;
        gameState.dotsEaten++;
        updateScore();
        // 幽靈害怕
        ghosts.forEach(g => { g.scared = true; g.color = '#2121de'; });
        setTimeout(() => {
            ghosts[0].color = '#ff0000';
            ghosts[1].color = '#ffb8ff';
            ghosts[2].color = '#00ffff';
            ghosts.forEach(g => g.scared = false);
        }, 5000);
    }
    
    // 碰撞幽靈
    const hitGhost = ghosts.find(g => g.x === pacman.x && g.y === pacman.y);
    if (hitGhost) {
        if (hitGhost.scared) {
            gameState.score += 200;
            updateScore();
            // 重置幽靈位置
            hitGhost.x = 9;
            hitGhost.y = 9;
        } else {
            loseLife();
        }
    }
    
    // 檢查勝利
    if (gameState.dotsEaten >= gameState.totalDots) {
        gameWin();
    }
}

// 失去生命
function loseLife() {
    gameState.lives--;
    updateScore();
    
    if (gameState.lives <= 0) {
        gameOver();
    } else {
        // 重置位置
        pacman.x = 9;
        pacman.y = 17;
        pacman.dir = { x: 0, y: 0 };
        pacman.nextDir = { x: 0, y: 0 };
        ghosts.forEach((g, i) => {
            g.x = 9 + (i - 1);
            g.y = 9;
        });
    }
}

// 更新分數顯示
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

// 繪製遊戲
function draw() {
    // 清空畫布
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 繪製牆壁
    ctx.fillStyle = '#2121de';
    walls.forEach(w => {
        ctx.fillRect(
            w.x * CONFIG.CELL_SIZE + 1,
            w.y * CONFIG.CELL_SIZE + 1,
            CONFIG.CELL_SIZE - 2,
            CONFIG.CELL_SIZE - 2
        );
    });
    
    // 繪製豆子
    ctx.fillStyle = '#ffb8ae';
    dots.forEach(d => {
        if (!d.eaten) {
            ctx.beginPath();
            ctx.arc(
                d.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                d.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // 繪製能量球
    powerPellets.forEach(p => {
        if (!p.eaten) {
            ctx.fillStyle = '#ffb8ae';
            ctx.beginPath();
            ctx.arc(
                p.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                p.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
                5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    });
    
    // 繪製小精靈
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    const cx = pacman.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const cy = pacman.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const radius = CONFIG.CELL_SIZE / 2 - 2;
    
    let startAngle = 0;
    let endAngle = Math.PI * 2;
    
    if (pacman.dir.x === 1) { startAngle = 0.2 * pacman.mouthOpen; endAngle = Math.PI * 2 - 0.2 * pacman.mouthOpen; }
    else if (pacman.dir.x === -1) { startAngle = Math.PI + 0.2 * pacman.mouthOpen; endAngle = Math.PI - 0.2 * pacman.mouthOpen; }
    else if (pacman.dir.y === -1) { startAngle = -Math.PI / 2 + 0.2 * pacman.mouthOpen; endAngle = -Math.PI / 2 - 0.2 * pacman.mouthOpen + Math.PI * 2; }
    else if (pacman.dir.y === 1) { startAngle = Math.PI / 2 + 0.2 * pacman.mouthOpen; endAngle = Math.PI / 2 - 0.2 * pacman.mouthOpen + Math.PI * 2; }
    
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.lineTo(cx, cy);
    ctx.fill();
    
    // 繪製幽靈
    ghosts.forEach(g => {
        ctx.fillStyle = g.color;
        const gx = g.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const gy = g.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const gr = CONFIG.CELL_SIZE / 2 - 2;
        
        ctx.beginPath();
        ctx.arc(gx, gy - 2, gr, Math.PI, 0);
        ctx.lineTo(gx + gr, gy + gr);
        for (let i = 0; i < 3; i++) {
            ctx.lineTo(gx + gr - (i + 1) * gr * 2 / 3, gy + gr - (i % 2) * 3);
        }
        ctx.lineTo(gx - gr, gy + gr);
        ctx.closePath();
        ctx.fill();
        
        // 眼睛
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(gx - 3, gy - 3, 3, 0, Math.PI * 2);
        ctx.arc(gx + 3, gy - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(gx - 3 + g.dir.x, gy - 3 + g.dir.y, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + 3 + g.dir.x, gy - 3 + g.dir.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// 遊戲循環
let lastMoveTime = 0;
let lastGhostMoveTime = 0;

function gameLoop(timestamp) {
    if (gameState.isRunning) {
        // 移動小精靈
        if (timestamp - lastMoveTime > CONFIG.PACMAN_SPEED) {
            movePacman();
            checkCollisions();
            lastMoveTime = timestamp;
        }
        
        // 移動幽靈
        if (timestamp - lastGhostMoveTime > CONFIG.GHOST_SPEED) {
            moveGhosts();
            checkCollisions();
            lastGhostMoveTime = timestamp;
        }
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// 開始遊戲
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    gameState.isRunning = true;
}

// 重置遊戲
function resetGame() {
    gameState.score = 0;
    gameState.lives = 3;
    gameState.dotsEaten = 0;
    gameState.isRunning = true;
    
    document.getElementById('gameOver').classList.add('hidden');
    
    pacman.x = 9;
    pacman.y = 17;
    pacman.dir = { x: 0, y: 0 };
    pacman.nextDir = { x: 0, y: 0 };
    
    parseMap();
    updateScore();
}

// 遊戲結束
function gameOver() {
    gameState.isRunning = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

// 遊戲勝利
function gameWin() {
    gameState.isRunning = false;
    document.getElementById('finalScore').textContent = gameState.score + ' (恭喜通關!)';
    document.getElementById('gameOver').querySelector('h2').textContent = '遊戲通關!';
    document.getElementById('gameOver').classList.remove('hidden');
}

// 導出供測試使用的函數與狀態
export {
    canMove,
    movePacman,
    moveGhosts,
    checkCollisions,
    loseLife,
    updateScore,
    parseMap,
    init,
    gameState,
    pacman,
    ghosts,
    dots,
    powerPellets,
    CONFIG,
    MAP
};

// 啟動遊戲
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', init);
}