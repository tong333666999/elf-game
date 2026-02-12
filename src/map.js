/**
 * 地圖管理
 * Map Management
 */
import { CONFIG, MAP, DIRECTIONS } from './config.js';

// 地圖元素
export const mapData = {
    walls: [],
    dots: [],
    powerPellets: [],
    pacmanStart: { x: 9, y: 17 }
};

/**
 * 解析地圖字串為遊戲元素
 * @returns {Object} - 包含牆壁、豆子、能量球和總數的物件
 */
export function parseMap() {
    mapData.walls = [];
    mapData.dots = [];
    mapData.powerPellets = [];
    let totalDots = 0;

    for (let y = 0; y < MAP.length && y < CONFIG.ROWS; y++) {
        for (let x = 0; x < MAP[y].length && x < CONFIG.COLS; x++) {
            const char = MAP[y][x];
            const tile = { x, y };

            switch (char) {
                case '#':
                    mapData.walls.push(tile);
                    break;
                case '.':
                    mapData.dots.push({ ...tile, eaten: false });
                    totalDots++;
                    break;
                case 'o':
                    mapData.powerPellets.push({ ...tile, eaten: false });
                    totalDots++;
                    break;
                case 'P':
                    mapData.pacmanStart = { x, y };
                    break;
            }
        }
    }

    return {
        walls: mapData.walls,
        dots: mapData.dots,
        powerPellets: mapData.powerPellets,
        totalDots,
        pacmanStart: mapData.pacmanStart
    };
}

/**
 * 檢查位置是否在邊界內
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {boolean}
 */
export function isInBounds(x, y) {
    return x >= 0 && x < CONFIG.COLS && y >= 0 && y < CONFIG.ROWS;
}

/**
 * 檢查位置是否有牆壁
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {boolean}
 */
export function hasWall(x, y) {
    return mapData.walls.some(w => w.x === x && w.y === y);
}

/**
 * 檢查是否可以移動到指定位置
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {boolean}
 */
export function canMove(x, y) {
    if (!isInBounds(x, y)) {
        return false;
    }
    return !hasWall(x, y);
}

/**
 * 檢查位置是否有豆子
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {Object|null} - 豆子物件或null
 */
export function getDotAt(x, y) {
    return mapData.dots.find(d => d.x === x && d.y === y && !d.eaten) || null;
}

/**
 * 檢查位置是否有能量球
 * @param {number} x - X座標
 * @param {number} y - Y座標
 * @returns {Object|null} - 能量球物件或null
 */
export function getPowerPelletAt(x, y) {
    return mapData.powerPellets.find(p => p.x === x && p.y === y && !p.eaten) || null;
}

/**
 * 標記豆子為已吃掉
 * @param {Object} dot - 豆子物件
 */
export function eatDot(dot) {
    dot.eaten = true;
}

/**
 * 標記能量球為已吃掉
 * @param {Object} pellet - 能量球物件
 */
export function eatPowerPellet(pellet) {
    pellet.eaten = true;
}

/**
 * 獲取所有可用方向
 * @param {number} x - 當前X座標
 * @param {number} y - 當前Y座標
 * @param {Object} excludeDir - 要排除的方向（通常是反方向）
 * @returns {Array} - 可用方向陣列
 */
export function getAvailableDirections(x, y, excludeDir = null) {
    const directions = Object.values(DIRECTIONS).filter(d => d !== DIRECTIONS.NONE);
    
    return directions.filter(dir => {
        // 排除反向
        if (excludeDir && 
            dir.x === -excludeDir.x && 
            dir.y === -excludeDir.y) {
            return false;
        }
        return canMove(x + dir.x, y + dir.y);
    });
}

/**
 * 計算曼哈頓距離
 * @param {number} x1 - 起點X
 * @param {number} y1 - 起點Y
 * @param {number} x2 - 終點X
 * @param {number} y2 - 終點Y
 * @returns {number}
 */
export function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
