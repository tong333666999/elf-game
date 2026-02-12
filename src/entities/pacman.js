/**
 * 小精靈實體
 * Pacman Entity
 */
import { CONFIG, DIRECTIONS } from '../config.js';
import { canMove, getDotAt, getPowerPelletAt, eatDot, eatPowerPellet } from '../map.js';
import { addScore, eatDot as recordEatDot } from '../state.js';

export class Pacman {
    constructor(x = 9, y = 17) {
        this.x = x;
        this.y = y;
        this.direction = { ...DIRECTIONS.NONE };
        this.nextDirection = { ...DIRECTIONS.NONE };
        this.mouthOpen = 0;
        this.mouthSpeed = 0.2;
    }

    /**
     * 設置下一個移動方向
     * @param {Object} dir - 方向物件 {x, y}
     */
    setNextDirection(dir) {
        this.nextDirection = { ...dir };
    }

    /**
     * 嘗試改變方向
     */
    tryChangeDirection() {
        if (this.nextDirection.x === 0 && this.nextDirection.y === 0) {
            return;
        }

        const newX = this.x + this.nextDirection.x;
        const newY = this.y + this.nextDirection.y;

        if (canMove(newX, newY)) {
            this.direction = { ...this.nextDirection };
        }
    }

    /**
     * 執行移動
     * @returns {Object} - 新位置 {x, y}
     */
    move() {
        this.tryChangeDirection();

        const newX = this.x + this.direction.x;
        const newY = this.y + this.direction.y;

        if (canMove(newX, newY)) {
            this.x = newX;
            this.y = newY;
        }

        this.updateMouthAnimation();

        return { x: this.x, y: this.y };
    }

    /**
     * 更新嘴巴動畫
     */
    updateMouthAnimation() {
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > 1 || this.mouthOpen < 0) {
            this.mouthSpeed = -this.mouthSpeed;
        }
    }

    /**
     * 重置位置
     * @param {number} x - X座標
     * @param {number} y - Y座標
     */
    reset(x, y) {
        this.x = x;
        this.y = y;
        this.direction = { ...DIRECTIONS.NONE };
        this.nextDirection = { ...DIRECTIONS.NONE };
    }

    /**
     * 檢查並吃掉當前位置的豆子/能量球
     * @returns {Object} - { ateDot: boolean, atePower: boolean, points: number }
     */
    consume() {
        let points = 0;
        let ateDot = false;
        let atePower = false;

        // 檢查普通豆子
        const dot = getDotAt(this.x, this.y);
        if (dot) {
            eatDot(dot);
            points += CONFIG.SCORE_DOT;
            recordEatDot();
            ateDot = true;
        }

        // 檢查能量球
        const pellet = getPowerPelletAt(this.x, this.y);
        if (pellet) {
            eatPowerPellet(pellet);
            points += CONFIG.SCORE_POWER;
            recordEatDot();
            atePower = true;
        }

        if (points > 0) {
            addScore(points);
        }

        return { ateDot, atePower, points };
    }

    /**
     * 獲取繪製用的角度
     * @returns {Object} - { startAngle, endAngle }
     */
    getDrawAngles() {
        const mouthAngle = 0.2 * this.mouthOpen;
        
        // 方向到基礎角度的映射
        const baseAngles = {
            '1,0': 0,           // 右
            '-1,0': Math.PI,    // 左
            '0,-1': -Math.PI/2, // 上
            '0,1': Math.PI/2    // 下
        };
        
        const key = `${this.direction.x},${this.direction.y}`;
        const baseAngle = baseAngles[key] ?? 0; // 預設向右
        
        return {
            startAngle: baseAngle + mouthAngle,
            endAngle: baseAngle + Math.PI * 2 - mouthAngle
        };
    }
}
