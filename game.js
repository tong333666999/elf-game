/**
 * 小精靈遊戲 - Pac-Man Clone
 * 使用 Vanilla JavaScript 製作
 * 
 * 此為進入點文件，主要邏輯位於 src/ 目錄
 */

// 導出所有公開 API 供測試使用
export {
    // 配置
    CONFIG,
    MAP
} from './src/config.js';

export {
    // 狀態
    gameState,
    timers,
    resetGameState,
    startGame,
    addScore,
    loseLife,
    eatDot,
    checkWin
} from './src/state.js';

export {
    // 地圖
    mapData,
    parseMap,
    canMove,
    getDotAt,
    getPowerPelletAt,
    eatDot as eatMapDot,
    eatPowerPellet,
    getAvailableDirections,
    manhattanDistance,
    isInBounds,
    hasWall
} from './src/map.js';

export {
    // 實體
    Pacman
} from './src/entities/pacman.js';

export {
    Ghost,
    createGhosts,
    frightenAllGhosts,
    calmAllGhosts
} from './src/entities/ghost.js';

export {
    // 輸入
    setupControls,
    setupKeyboardControls,
    setupTouchControls,
    setupSwipeControls,
    setupButtonHandlers,
    setupMuteButton
} from './src/input.js';

export {
    // 渲染
    createCanvas,
    resizeCanvas,
    drawGame,
    drawBackground,
    drawWalls,
    drawDots,
    drawPowerPellets,
    drawPacman,
    drawGhosts,
    drawGhost
} from './src/renderer.js';

export {
    // 遊戲邏輯
    initGame as init,
    handlePacmanMove as movePacman,
    handleGhostsMove as moveGhosts,
    handleCollisions as checkCollisions,
    resetPositions,
    updateScoreDisplay as updateScore
} from './src/game.js';

export {
    // 音頻
    AudioManager,
    audioManager
} from './src/audio.js';

// 啟動遊戲
import { initGame } from './src/game.js';

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initGame);
}
