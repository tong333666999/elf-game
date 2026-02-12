/**
 * 遊戲主邏輯
 * Game Logic
 */
import { CONFIG } from './config.js';
import { gameState, timers, resetGameState, startGame, loseLife, checkWin } from './state.js';
import { parseMap, mapData, manhattanDistance } from './map.js';
import { Pacman } from './entities/pacman.js';
import { Ghost, createGhosts, frightenAllGhosts, calmAllGhosts } from './entities/ghost.js';
import { setupControls, setupButtonHandlers } from './input.js';
import { createCanvas, resizeCanvas, drawGame } from './renderer.js';

// 遊戲實例
let canvas, ctx;
let pacman;
let ghosts = [];
let powerModeTimer = null;

/**
 * 更新分數顯示
 */
function updateScoreDisplay() {
    const scoreEl = document.getElementById('score');
    const livesEl = document.getElementById('lives');
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (livesEl) livesEl.textContent = gameState.lives;
}

/**
 * 處理小精靈移動
 */
function handlePacmanMove() {
    pacman.move();
    const result = pacman.consume();

    // 吃到能量球
    if (result.atePower) {
        activatePowerMode();
    }
}

/**
 * 啟動能量模式
 */
function activatePowerMode() {
    frightenAllGhosts(ghosts);

    // 清除現有計時器
    if (powerModeTimer) {
        clearTimeout(powerModeTimer);
    }

    // 設置恢復計時器
    powerModeTimer = setTimeout(() => {
        calmAllGhosts(ghosts);
        powerModeTimer = null;
    }, CONFIG.POWER_DURATION);
}

/**
 * 處理幽靈移動
 */
function handleGhostsMove() {
    for (const ghost of ghosts) {
        ghost.move(pacman.x, pacman.y);
    }
}

/**
 * 檢查碰撞
 * @returns {boolean} - 是否發生碰撞導致遊戲結束/重置
 */
function handleCollisions() {
    // 檢查幽靈碰撞
    for (const ghost of ghosts) {
        if (!ghost.checkCollision(pacman.x, pacman.y)) continue;

        if (ghost.scared) {
            // 吃掉害怕的幽靈
            ghost.getEaten();
        } else {
            // 被幽靈抓到
            return handlePacmanCaught();
        }
    }

    // 檢查勝利
    if (checkWin()) {
        handleWin();
        return true;
    }

    return false;
}

/**
 * 處理小精靈被抓住
 * @returns {boolean}
 */
function handlePacmanCaught() {
    const hasLivesLeft = loseLife();
    updateScoreDisplay();

    if (!hasLivesLeft) {
        handleGameOver();
        return true;
    }

    // 重置位置
    resetPositions();
    return false;
}

/**
 * 重置位置
 */
function resetPositions() {
    pacman.reset(mapData.pacmanStart.x, mapData.pacmanStart.y);
    ghosts.forEach(ghost => ghost.reset());
}

/**
 * 設置遊戲結束畫面
 * @param {string} title - 標題文字
 * @param {string} scoreText - 分數顯示文字
 */
function setGameOverScreen(title, scoreText) {
    const gameOverEl = document.getElementById('gameOver');
    const finalScoreEl = document.getElementById('finalScore');
    const titleEl = gameOverEl?.querySelector('h2');

    if (finalScoreEl) finalScoreEl.textContent = scoreText;
    if (titleEl) titleEl.textContent = title;
    if (gameOverEl) gameOverEl.classList.remove('hidden');
}

/**
 * 處理遊戲結束
 */
function handleGameOver() {
    gameState.isRunning = false;
    setGameOverScreen('遊戲結束', String(gameState.score));
}

/**
 * 處理勝利
 */
function handleWin() {
    gameState.isRunning = false;
    setGameOverScreen('遊戲通關!', `${gameState.score} (恭喜通關!)`);
}

/**
 * 遊戲循環
 * @param {number} timestamp
 */
function gameLoop(timestamp) {
    if (gameState.isRunning) {
        // 移動小精靈
        if (timestamp - timers.lastMoveTime > CONFIG.PACMAN_SPEED) {
            handlePacmanMove();
            handleCollisions();
            updateScoreDisplay();
            timers.lastMoveTime = timestamp;
        }

        // 移動幽靈
        if (timestamp - timers.lastGhostMoveTime > CONFIG.GHOST_SPEED) {
            handleGhostsMove();
            handleCollisions();
            timers.lastGhostMoveTime = timestamp;
        }
    }

    // 繪製遊戲
    if (ctx && pacman) {
        drawGame(ctx, pacman, ghosts);
    }

    requestAnimationFrame(gameLoop);
}

/**
 * 初始化遊戲
 */
export function initGame() {
    const result = createCanvas();
    canvas = result.canvas;
    ctx = result.ctx;

    // 調整畫布大小
    resizeCanvas(canvas);
    window.addEventListener('resize', () => resizeCanvas(canvas));

    // 解析地圖
    const mapResult = parseMap();
    gameState.totalDots = mapResult.totalDots;

    // 創建實體
    pacman = new Pacman(mapResult.pacmanStart.x, mapResult.pacmanStart.y);
    ghosts = createGhosts();

    // 設置輸入控制
    setupControls(canvas, (dir) => pacman.setNextDirection(dir));

    // 設置按鈕事件
    setupButtonHandlers({
        start: () => {
            const startScreen = document.getElementById('startScreen');
            if (startScreen) startScreen.classList.add('hidden');
            startGame();
        },
        restart: () => {
            const gameOverEl = document.getElementById('gameOver');
            if (gameOverEl) gameOverEl.classList.add('hidden');

            resetGameState(true);
            parseMap();
            pacman.reset(mapResult.pacmanStart.x, mapResult.pacmanStart.y);
            ghosts = createGhosts();
            updateScoreDisplay();
            startGame();
        }
    });

    updateScoreDisplay();

    // 開始遊戲循環
    requestAnimationFrame(gameLoop);
}

// 導出供測試使用
export {
    pacman,
    ghosts,
    canvas,
    ctx,
    handlePacmanMove,
    handleGhostsMove,
    handleCollisions,
    resetPositions,
    updateScoreDisplay,
    powerModeTimer
};
