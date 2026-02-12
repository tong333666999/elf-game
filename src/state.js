/**
 * 遊戲狀態管理
 * Game State Management
 */
import { CONFIG } from './config.js';

// 遊戲狀態
export const gameState = {
    score: 0,
    lives: 3,
    isRunning: false,
    isPaused: false,
    lastTime: 0,
    dotsEaten: 0,
    totalDots: 0
};

// 計時器狀態
export const timers = {
    lastMoveTime: 0,
    lastGhostMoveTime: 0
};

/**
 * 重置遊戲狀態
 * @param {boolean} fullReset - 是否完全重置（包括分數和生命）
 */
export function resetGameState(fullReset = false) {
    if (fullReset) {
        gameState.score = 0;
        gameState.lives = 3;
    }
    gameState.dotsEaten = 0;
    gameState.totalDots = 0;
    gameState.isRunning = false;
    gameState.isPaused = false;
    timers.lastMoveTime = 0;
    timers.lastGhostMoveTime = 0;
}

/**
 * 開始遊戲
 */
export function startGame() {
    gameState.isRunning = true;
}

/**
 * 暫停/繼續遊戲
 */
export function togglePause() {
    gameState.isPaused = !gameState.isPaused;
}

/**
 * 增加分數
 * @param {number} points - 要增加的分數
 */
export function addScore(points) {
    gameState.score += points;
}

/**
 * 失去生命
 * @returns {boolean} - 是否還有剩餘生命
 */
export function loseLife() {
    gameState.lives--;
    return gameState.lives > 0;
}

/**
 * 記錄吃掉豆子
 */
export function eatDot() {
    gameState.dotsEaten++;
}

/**
 * 檢查是否獲勝
 * @returns {boolean}
 */
export function checkWin() {
    return gameState.dotsEaten >= gameState.totalDots;
}
