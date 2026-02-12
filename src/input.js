/**
 * 輸入處理
 * Input Handling
 */
import { DIRECTIONS } from './config.js';
import { gameState } from './state.js';

// 按鍵映射
const KEY_MAP = {
    'ArrowUp': DIRECTIONS.UP,
    'w': DIRECTIONS.UP,
    'W': DIRECTIONS.UP,
    'ArrowDown': DIRECTIONS.DOWN,
    's': DIRECTIONS.DOWN,
    'S': DIRECTIONS.DOWN,
    'ArrowLeft': DIRECTIONS.LEFT,
    'a': DIRECTIONS.LEFT,
    'A': DIRECTIONS.LEFT,
    'ArrowRight': DIRECTIONS.RIGHT,
    'd': DIRECTIONS.RIGHT,
    'D': DIRECTIONS.RIGHT
};

// 按鈕ID映射
const BUTTON_MAP = {
    'upBtn': DIRECTIONS.UP,
    'downBtn': DIRECTIONS.DOWN,
    'leftBtn': DIRECTIONS.LEFT,
    'rightBtn': DIRECTIONS.RIGHT
};

/**
 * 設置鍵盤控制
 * @param {Function} onDirectionChange - 方向改變時的回調函數
 */
export function setupKeyboardControls(onDirectionChange) {
    document.addEventListener('keydown', (e) => {
        if (!gameState.isRunning) return;

        const direction = KEY_MAP[e.key];
        if (direction) {
            onDirectionChange(direction);
            e.preventDefault();
        }
    });
}

/**
 * 設置觸控按鈕控制
 * @param {Function} onDirectionChange - 方向改變時的回調函數
 */
export function setupTouchControls(onDirectionChange) {
    Object.entries(BUTTON_MAP).forEach(([id, direction]) => {
        const btn = document.getElementById(id);
        if (!btn) return;

        const handleInput = (e) => {
            e.preventDefault();
            if (gameState.isRunning) {
                onDirectionChange(direction);
            }
        };

        btn.addEventListener('touchstart', handleInput);
        btn.addEventListener('mousedown', handleInput);
    });
}

/**
 * 設置滑動控制
 * @param {HTMLElement} element - 要監聽滑動的元素
 * @param {Function} onDirectionChange - 方向改變時的回調函數
 */
export function setupSwipeControls(element, onDirectionChange) {
    let touchStartX = null;
    let touchStartY = null;

    element.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: false });

    element.addEventListener('touchmove', (e) => {
        if (!touchStartX || !touchStartY || !gameState.isRunning) return;

        const touchEndX = e.touches[0].clientX;
        const touchEndY = e.touches[0].clientY;

        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;

        // 判斷滑動方向
        if (Math.abs(dx) > Math.abs(dy)) {
            onDirectionChange(dx > 0 ? DIRECTIONS.RIGHT : DIRECTIONS.LEFT);
        } else {
            onDirectionChange(dy > 0 ? DIRECTIONS.DOWN : DIRECTIONS.UP);
        }

        // 更新起點以支援連續滑動
        touchStartX = touchEndX;
        touchStartY = touchEndY;

        e.preventDefault();
    }, { passive: false });
}

/**
 * 設置所有輸入控制
 * @param {HTMLElement} canvas - 遊戲畫布元素
 * @param {Function} onDirectionChange - 方向改變時的回調函數
 */
export function setupControls(canvas, onDirectionChange) {
    setupKeyboardControls(onDirectionChange);
    setupTouchControls(onDirectionChange);
    setupSwipeControls(canvas, onDirectionChange);
}

/**
 * 設置按鈕事件（開始、重新開始）
 * @param {Object} handlers - 按鈕事件處理器 { start, restart }
 */
export function setupButtonHandlers(handlers) {
    const startBtn = document.getElementById('startBtn');
    const restartBtn = document.getElementById('restartBtn');

    if (startBtn && handlers.start) {
        startBtn.addEventListener('click', handlers.start);
    }

    if (restartBtn && handlers.restart) {
        restartBtn.addEventListener('click', handlers.restart);
    }
}
