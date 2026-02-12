/**
 * 渲染器
 * Renderer
 */
import { CONFIG, COLORS } from './config.js';
import { mapData } from './map.js';

/**
 * 創建並設置畫布
 * @returns {Object} - { canvas, ctx }
 */
export function createCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // 設置畫布大小
    canvas.width = CONFIG.COLS * CONFIG.CELL_SIZE;
    canvas.height = CONFIG.ROWS * CONFIG.CELL_SIZE;

    return { canvas, ctx };
}

/**
 * 調整畫布大小（響應式）
 * @param {HTMLCanvasElement} canvas
 */
export function resizeCanvas(canvas) {
    const container = document.getElementById('gameContainer');
    if (!container) return;

    const maxWidth = Math.min(container.clientWidth - 20, CONFIG.COLS * CONFIG.CELL_SIZE);
    const scale = maxWidth / (CONFIG.COLS * CONFIG.CELL_SIZE);

    canvas.style.width = maxWidth + 'px';
    canvas.style.height = (CONFIG.ROWS * CONFIG.CELL_SIZE * scale) + 'px';
}

/**
 * 繪製背景
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawBackground(ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * 繪製牆壁
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawWalls(ctx) {
    ctx.fillStyle = COLORS.WALL;
    const cellSize = CONFIG.CELL_SIZE;

    for (const wall of mapData.walls) {
        ctx.fillRect(
            wall.x * cellSize + 1,
            wall.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
        );
    }
}

/**
 * 繪製豆子
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawDots(ctx) {
    ctx.fillStyle = COLORS.DOT;
    const center = CONFIG.CELL_SIZE / 2;
    const radius = 2;

    for (const dot of mapData.dots) {
        if (dot.eaten) continue;

        ctx.beginPath();
        ctx.arc(
            dot.x * CONFIG.CELL_SIZE + center,
            dot.y * CONFIG.CELL_SIZE + center,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * 繪製能量球
 * @param {CanvasRenderingContext2D} ctx
 */
export function drawPowerPellets(ctx) {
    ctx.fillStyle = COLORS.POWER_PELLET;
    const center = CONFIG.CELL_SIZE / 2;
    const radius = 5;

    for (const pellet of mapData.powerPellets) {
        if (pellet.eaten) continue;

        ctx.beginPath();
        ctx.arc(
            pellet.x * CONFIG.CELL_SIZE + center,
            pellet.y * CONFIG.CELL_SIZE + center,
            radius,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

/**
 * 繪製小精靈
 * @param {CanvasRenderingContext2D} ctx
 * @param {Pacman} pacman
 */
export function drawPacman(ctx, pacman) {
    const cx = pacman.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const cy = pacman.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const radius = CONFIG.CELL_SIZE / 2 - 2;

    const { startAngle, endAngle } = pacman.getDrawAngles();

    ctx.fillStyle = COLORS.PACMAN;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.lineTo(cx, cy);
    ctx.fill();
}

/**
 * 繪製幽靈身體
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 中心X座標
 * @param {number} y - 中心Y座標
 * @param {number} radius - 半徑
 */
function drawGhostBody(ctx, x, y, radius) {
    ctx.beginPath();
    // 頭部半圓
    ctx.arc(x, y - 2, radius, Math.PI, 0);
    // 右側
    ctx.lineTo(x + radius, y + radius);
    // 波浪底部
    for (let i = 0; i < 3; i++) {
        ctx.lineTo(
            x + radius - (i + 1) * radius * 2 / 3,
            y + radius - (i % 2) * 3
        );
    }
    // 左側
    ctx.lineTo(x - radius, y + radius);
    ctx.closePath();
    ctx.fill();
}

/**
 * 繪製幽靈眼睛
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x - 中心X座標
 * @param {number} y - 中心Y座標
 * @param {Object} eyeOffset - 眼睛偏移量 { offsetX, offsetY }
 */
function drawGhostEyes(ctx, x, y, eyeOffset) {
    // 眼白
    ctx.fillStyle = COLORS.EYE_WHITE;
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 3, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();

    // 瞳孔
    ctx.fillStyle = COLORS.EYE_BLACK;
    ctx.beginPath();
    ctx.arc(x - 3 + eyeOffset.offsetX, y - 3 + eyeOffset.offsetY, 1.5, 0, Math.PI * 2);
    ctx.arc(x + 3 + eyeOffset.offsetX, y - 3 + eyeOffset.offsetY, 1.5, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 繪製單個幽靈
 * @param {CanvasRenderingContext2D} ctx
 * @param {Ghost} ghost
 */
export function drawGhost(ctx, ghost) {
    const gx = ghost.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const gy = ghost.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const gr = CONFIG.CELL_SIZE / 2 - 2;

    ctx.fillStyle = ghost.color;
    drawGhostBody(ctx, gx, gy, gr);
    drawGhostEyes(ctx, gx, gy, ghost.getEyeOffset());
}

/**
 * 繪製所有幽靈
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Ghost>} ghosts
 */
export function drawGhosts(ctx, ghosts) {
    for (const ghost of ghosts) {
        drawGhost(ctx, ghost);
    }
}

/**
 * 繪製完整遊戲畫面
 * @param {CanvasRenderingContext2D} ctx
 * @param {Pacman} pacman
 * @param {Array<Ghost>} ghosts
 */
export function drawGame(ctx, pacman, ghosts) {
    drawBackground(ctx);
    drawWalls(ctx);
    drawDots(ctx);
    drawPowerPellets(ctx);
    drawPacman(ctx, pacman);
    drawGhosts(ctx, ghosts);
}
