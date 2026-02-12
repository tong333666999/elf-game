/**
 * 幽靈實體
 * Ghost Entity
 */
import { CONFIG, DIRECTIONS, COLORS, GHOST_CONFIG } from '../config.js';
import { canMove, getAvailableDirections, manhattanDistance } from '../map.js';
import { addScore } from '../state.js';

export class Ghost {
    constructor(x, y, color, name = 'ghost') {
        this.x = x;
        this.y = y;
        this.startX = x;
        this.startY = y;
        this.color = color;
        this.baseColor = color;
        this.name = name;
        this.direction = { x: 0, y: -1 }; // 預設向上
        this.scared = false;
    }

    /**
     * 設置為害怕狀態
     */
    frighten() {
        this.scared = true;
        this.color = COLORS.GHOST_SCARED;
    }

    /**
     * 恢復正常狀態
     */
    calm() {
        this.scared = false;
        this.color = this.baseColor;
    }

    /**
     * 重置位置
     */
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.direction = { x: 0, y: -1 };
        this.calm();
    }

    /**
     * 簡單AI：選擇使距離目標最近的方向
     * @param {number} targetX - 目標X座標
     * @param {number} targetY - 目標Y座標
     */
    chooseDirection(targetX, targetY) {
        const availableDirs = getAvailableDirections(this.x, this.y, this.direction);

        if (availableDirs.length === 0) {
            // 死胡同，只能回頭
            this.direction = { x: -this.direction.x, y: -this.direction.y };
            return;
        }

        // 選擇使距離目標最近的方向
        let bestDir = availableDirs[0];
        let minDistance = Infinity;

        for (const dir of availableDirs) {
            const newX = this.x + dir.x;
            const newY = this.y + dir.y;
            const dist = manhattanDistance(newX, newY, targetX, targetY);

            if (dist < minDistance) {
                minDistance = dist;
                bestDir = dir;
            }
        }

        this.direction = bestDir;
    }

    /**
     * 移動幽靈
     * @param {number} targetX - 目標X座標（通常是Pacman位置）
     * @param {number} targetY - 目標Y座標
     */
    move(targetX, targetY) {
        this.chooseDirection(targetX, targetY);

        const newX = this.x + this.direction.x;
        const newY = this.y + this.direction.y;

        if (canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }
    }

    /**
     * 檢查是否與小精靈碰撞
     * @param {number} pacmanX - 小精靈X座標
     * @param {number} pacmanY - 小精靈Y座標
     * @returns {boolean}
     */
    checkCollision(pacmanX, pacmanY) {
        return this.x === pacmanX && this.y === pacmanY;
    }

    /**
     * 被吃掉（Pacman吃了害怕的幽靈）
     * @returns {number} - 獲得的分數
     */
    getEaten() {
        const points = CONFIG.SCORE_GHOST;
        addScore(points);
        this.reset();
        return points;
    }

    /**
     * 獲取眼睛偏移量
     * @returns {Object} - { offsetX, offsetY }
     */
    getEyeOffset() {
        return {
            offsetX: this.direction.x,
            offsetY: this.direction.y
        };
    }
}

/**
 * 創建初始幽靈陣列
 * @returns {Array<Ghost>}
 */
export function createGhosts() {
    return GHOST_CONFIG.map(config => 
        new Ghost(config.x, config.y, config.color, config.name)
    );
}

/**
 * 讓所有幽靈害怕
 * @param {Array<Ghost>} ghosts
 */
export function frightenAllGhosts(ghosts) {
    ghosts.forEach(ghost => ghost.frighten());
}

/**
 * 恢復所有幽靈正常
 * @param {Array<Ghost>} ghosts
 */
export function calmAllGhosts(ghosts) {
    ghosts.forEach(ghost => ghost.calm());
}
