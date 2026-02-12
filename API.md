# API 文件: 小精靈遊戲

**版本**: 1.0.0
**更新日期**: 2026-02-13
**作者**: Writer Agent
**審查者**: Brain Agent

---

## 📋 目錄

- [概述](#概述)
- [配置常數](#配置常數)
- [狀態管理 API](#狀態管理-api)
- [地圖 API](#地圖-api)
- [實體 API](#實體-api)
- [輸入控制 API](#輸入控制-api)
- [渲染 API](#渲染-api)
- [遊戲邏輯 API](#遊戲邏輯-api)
- [範例](#範例)
- [變更日誌](#變更日誌)

---

## 概述

本文檔詳細說明小精靈遊戲的所有公開 API，供開發者擴展或整合遊戲功能使用。

---

## 配置常數

### `CONFIG`

遊戲核心配置物件

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `CELL_SIZE` | number | 20 | 每個格子像素大小 |
| `COLS` | number | 19 | 地圖欄數 |
| `ROWS` | number | 21 | 地圖列數 |
| `PACMAN_SPEED` | number | 150 | 小精靈移動間隔（毫秒） |
| `GHOST_SPEED` | number | 200 | 幽靈移動間隔（毫秒） |
| `FPS` | number | 60 | 目標幀率 |
| `POWER_DURATION` | number | 5000 | 能量球效果持續時間（毫秒） |
| `SCORE_DOT` | number | 10 | 普通豆子分數 |
| `SCORE_POWER` | number | 50 | 能量球分數 |
| `SCORE_GHOST` | number | 200 | 吃掉幽靈分數 |

**範例**:
```javascript
import { CONFIG } from './src/config.js';

console.log(`格子大小: ${CONFIG.CELL_SIZE}px`);
console.log(`地圖尺寸: ${CONFIG.COLS}x${CONFIG.ROWS}`);
```

### `DIRECTIONS`

方向常數物件

| 屬性 | 值 | 說明 |
|------|-----|------|
| `UP` | `{x: 0, y: -1}` | 向上 |
| `DOWN` | `{x: 0, y: 1}` | 向下 |
| `LEFT` | `{x: -1, y: 0}` | 向左 |
| `RIGHT` | `{x: 1, y: 0}` | 向右 |
| `NONE` | `{x: 0, y: 0}` | 無方向 |

**範例**:
```javascript
import { DIRECTIONS } from './src/config.js';

// 設置向上移動
pacman.setNextDirection(DIRECTIONS.UP);
```

### `COLORS`

顏色常數物件

| 屬性 | 值 | 說明 |
|------|-----|------|
| `WALL` | `#2121de` | 牆壁顏色 |
| `DOT` | `#ffb8ae` | 豆子顏色 |
| `POWER_PELLET` | `#ffb8ae` | 能量球顏色 |
| `PACMAN` | `#ffff00` | 小精靈顏色 |
| `GHOST_SCARED` | `#2121de` | 害怕幽靈顏色 |
| `GHOST_RED` | `#ff0000` | 紅色幽靈 |
| `GHOST_PINK` | `#ffb8ff` | 粉色幽靈 |
| `GHOST_CYAN` | `#00ffff` | 青色幽靈 |

---

## 狀態管理 API

### `gameState`

遊戲狀態物件（可觀察）

| 屬性 | 類型 | 說明 |
|------|------|------|
| `score` | number | 當前分數 |
| `lives` | number | 剩餘生命 |
| `isRunning` | boolean | 遊戲是否進行中 |
| `isPaused` | boolean | 是否暫停 |
| `dotsEaten` | number | 已吃豆子數 |
| `totalDots` | number | 總豆子數 |

**範例**:
```javascript
import { gameState } from './src/state.js';

console.log(`當前分數: ${gameState.score}`);
console.log(`剩餘生命: ${gameState.lives}`);
```

### `resetGameState(fullReset)`

**描述**: 重置遊戲狀態

**參數**:
| 參數名 | 類型 | 必選 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `fullReset` | boolean | 否 | false | 是否完全重置（包括分數和生命）|

**回傳值**: `void`

**範例**:
```javascript
import { resetGameState } from './src/state.js';

// 軟重置（保留分數和生命）
resetGameState();

// 硬重置（完全重置）
resetGameState(true);
```

### `startGame()`

**描述**: 開始遊戲

**回傳值**: `void`

### `togglePause()`

**描述**: 切換暫停/繼續狀態

**回傳值**: `void`

### `addScore(points)`

**描述**: 增加分數

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `points` | number | 是 | 要增加的分數 |

**回傳值**: `void`

### `loseLife()`

**描述**: 失去一條生命

**回傳值**: `boolean` - 是否還有剩餘生命

### `eatDot()`

**描述**: 記錄吃掉一個豆子

**回傳值**: `void`

### `checkWin()`

**描述**: 檢查是否獲勝

**回傳值**: `boolean` - 是否吃掉所有豆子

---

## 地圖 API

### `mapData`

地圖資料物件

| 屬性 | 類型 | 說明 |
|------|------|------|
| `walls` | Array<{x, y}> | 牆壁位置陣列 |
| `dots` | Array<{x, y, eaten}> | 豆子位置陣列 |
| `powerPellets` | Array<{x, y, eaten}> | 能量球位置陣列 |
| `pacmanStart` | {x, y} | 小精靈起始位置 |

### `parseMap()`

**描述**: 解析地圖字串為遊戲元素

**回傳值**:
| 欄位 | 類型 | 說明 |
|------|------|------|
| `walls` | Array | 牆壁位置陣列 |
| `dots` | Array | 豆子位置陣列 |
| `powerPellets` | Array | 能量球位置陣列 |
| `totalDots` | number | 總豆子數量 |
| `pacmanStart` | {x, y} | 小精靈起始位置 |

**範例**:
```javascript
import { parseMap } from './src/map.js';

const map = parseMap();
console.log(`總豆子數: ${map.totalDots}`);
console.log(`牆壁數: ${map.walls.length}`);
```

### `isInBounds(x, y)`

**描述**: 檢查位置是否在邊界內

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | X 座標 |
| `y` | number | 是 | Y 座標 |

**回傳值**: `boolean`

### `hasWall(x, y)`

**描述**: 檢查位置是否有牆壁

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | X 座標 |
| `y` | number | 是 | Y 座標 |

**回傳值**: `boolean`

### `canMove(x, y)`

**描述**: 檢查是否可以移動到指定位置

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | X 座標 |
| `y` | number | 是 | Y 座標 |

**回傳值**: `boolean`

**範例**:
```javascript
import { canMove } from './src/map.js';

if (canMove(5, 5)) {
    console.log('可以移動到 (5, 5)');
}
```

### `getDotAt(x, y)`

**描述**: 檢查位置是否有未吃的豆子

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | X 座標 |
| `y` | number | 是 | Y 座標 |

**回傳值**: `Object|null` - 豆子物件或 null

### `getPowerPelletAt(x, y)`

**描述**: 檢查位置是否有未吃的能量球

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | X 座標 |
| `y` | number | 是 | Y 座標 |

**回傳值**: `Object|null` - 能量球物件或 null

### `eatDot(dot)`

**描述**: 標記豆子為已吃掉

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `dot` | Object | 是 | 豆子物件 |

**回傳值**: `void`

### `eatPowerPellet(pellet)`

**描述**: 標記能量球為已吃掉

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `pellet` | Object | 是 | 能量球物件 |

**回傳值**: `void`

### `getAvailableDirections(x, y, excludeDir)`

**描述**: 獲取所有可用方向

**參數**:
| 參數名 | 類型 | 必選 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `x` | number | 是 | - | 當前 X 座標 |
| `y` | number | 是 | - | 當前 Y 座標 |
| `excludeDir` | Object | 否 | null | 要排除的方向（通常是反方向）|

**回傳值**: `Array<{x, y}>` - 可用方向陣列

### `manhattanDistance(x1, y1, x2, y2)`

**描述**: 計算曼哈頓距離（用於 AI 路徑計算）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x1` | number | 是 | 起點 X |
| `y1` | number | 是 | 起點 Y |
| `x2` | number | 是 | 終點 X |
| `y2` | number | 是 | 終點 Y |

**回傳值**: `number` - 曼哈頓距離

**範例**:
```javascript
import { manhattanDistance } from './src/map.js';

const dist = manhattanDistance(0, 0, 3, 4);
console.log(`曼哈頓距離: ${dist}`); // 輸出: 7
```

---

## 實體 API

### `Pacman` 類別

小精靈實體

#### Constructor

```javascript
new Pacman(x, y)
```

**參數**:
| 參數名 | 類型 | 必選 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `x` | number | 否 | 9 | 初始 X 座標 |
| `y` | number | 否 | 17 | 初始 Y 座標 |

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `x` | number | 當前 X 座標 |
| `y` | number | 當前 Y 座標 |
| `direction` | {x, y} | 當前方向 |
| `nextDirection` | {x, y} | 下一個方向（佇列）|
| `mouthOpen` | number | 嘴巴張開程度 (0-1) |

#### 方法

##### `setNextDirection(dir)`

設置下一個移動方向

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `dir` | {x, y} | 是 | 方向物件 |

##### `move()`

執行移動

**回傳值**: `{x, y}` - 新位置

##### `consume()`

檢查並吃掉當前位置的豆子/能量球

**回傳值**:
| 欄位 | 類型 | 說明 |
|------|------|------|
| `ateDot` | boolean | 是否吃了豆子 |
| `atePower` | boolean | 是否吃了能量球 |
| `points` | number | 獲得的分數 |

##### `reset(x, y)`

重置位置

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `x` | number | 是 | 新 X 座標 |
| `y` | number | 是 | 新 Y 座標 |

##### `getDrawAngles()`

獲取繪製用的嘴巴角度

**回傳值**: `{startAngle, endAngle}`

---

### `Ghost` 類別

幽靈實體

#### Constructor

```javascript
new Ghost(x, y, color, name)
```

**參數**:
| 參數名 | 類型 | 必選 | 預設值 | 說明 |
|--------|------|------|--------|------|
| `x` | number | 是 | - | 初始 X 座標 |
| `y` | number | 是 | - | 初始 Y 座標 |
| `color` | string | 是 | - | 顏色代碼 |
| `name` | string | 否 | 'ghost' | 幽靈名稱 |

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `x` | number | 當前 X 座標 |
| `y` | number | 當前 Y 座標 |
| `startX` | number | 起始 X 座標 |
| `startY` | number | 起始 Y 座標 |
| `color` | string | 當前顏色 |
| `baseColor` | string | 基礎顏色 |
| `name` | string | 名稱 |
| `direction` | {x, y} | 當前方向 |
| `scared` | boolean | 是否害怕 |

#### 方法

##### `move(targetX, targetY)`

向目標移動（AI 追蹤）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `targetX` | number | 是 | 目標 X |
| `targetY` | number | 是 | 目標 Y |

##### `checkCollision(pacmanX, pacmanY)`

檢查是否與小精靈碰撞

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `pacmanX` | number | 是 | 小精靈 X |
| `pacmanY` | number | 是 | 小精靈 Y |

**回傳值**: `boolean`

##### `getEaten()`

被吃掉（Pacman 吃了害怕的幽靈）

**回傳值**: `number` - 獲得的分數

##### `frighten()`

進入害怕狀態

**回傳值**: `void`

##### `calm()`

恢復正常狀態

**回傳值**: `void`

##### `reset()`

重置位置

**回傳值**: `void`

##### `getEyeOffset()`

獲取眼睛偏移量（根據移動方向）

**回傳值**: `{offsetX, offsetY}`

---

### `createGhosts()`

**描述**: 創建初始幽靈陣列（根據 GHOST_CONFIG）

**回傳值**: `Array<Ghost>`

**範例**:
```javascript
import { createGhosts } from './src/entities/ghost.js';

const ghosts = createGhosts();
// 回傳: [Ghost(blinky), Ghost(pinky), Ghost(inky)]
```

### `frightenAllGhosts(ghosts)`

**描述**: 讓所有幽靈進入害怕狀態

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `ghosts` | Array<Ghost> | 是 | 幽靈陣列 |

### `calmAllGhosts(ghosts)`

**描述**: 恢復所有幽靈正常狀態

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `ghosts` | Array<Ghost> | 是 | 幽靈陣列 |

---

## 輸入控制 API

### `setupKeyboardControls(onDirectionChange)`

**描述**: 設置鍵盤控制

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `onDirectionChange` | Function | 是 | 方向改變時的回調函數，接收方向物件 |

**支援按鍵**: 方向鍵、WASD

### `setupTouchControls(onDirectionChange)`

**描述**: 設置觸控按鈕控制

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `onDirectionChange` | Function | 是 | 方向改變時的回調函數 |

### `setupSwipeControls(element, onDirectionChange)`

**描述**: 設置滑動控制

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `element` | HTMLElement | 是 | 要監聽滑動的元素 |
| `onDirectionChange` | Function | 是 | 方向改變時的回調函數 |

### `setupControls(canvas, onDirectionChange)`

**描述**: 設置所有輸入控制（鍵盤 + 觸控 + 滑動）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `canvas` | HTMLElement | 是 | 遊戲畫布元素 |
| `onDirectionChange` | Function | 是 | 方向改變時的回調函數 |

**範例**:
```javascript
import { setupControls } from './src/input.js';

setupControls(canvas, (direction) => {
    pacman.setNextDirection(direction);
});
```

### `setupButtonHandlers(handlers)`

**描述**: 設置按鈕事件（開始、重新開始）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `handlers` | Object | 是 | 按鈕事件處理器 |
| `handlers.start` | Function | 否 | 開始按鈕處理器 |
| `handlers.restart` | Function | 否 | 重新開始按鈕處理器 |

---

## 渲染 API

### `createCanvas()`

**描述**: 創建並設置畫布

**回傳值**: `{canvas, ctx}`

| 欄位 | 類型 | 說明 |
|------|------|------|
| `canvas` | HTMLCanvasElement | 畫布元素 |
| `ctx` | CanvasRenderingContext2D | 2D 繪圖上下文 |

### `resizeCanvas(canvas)`

**描述**: 調整畫布大小（響應式）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `canvas` | HTMLCanvasElement | 是 | 畫布元素 |

### `drawGame(ctx, pacman, ghosts)`

**描述**: 繪製完整遊戲畫面

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| `ctx` | CanvasRenderingContext2D | 是 | 2D 繪圖上下文 |
| `pacman` | Pacman | 是 | 小精靈實例 |
| `ghosts` | Array<Ghost> | 是 | 幽靈陣列 |

### 單獨繪製函數

| 函數 | 參數 | 說明 |
|------|------|------|
| `drawBackground(ctx)` | ctx | 繪製黑色背景 |
| `drawWalls(ctx)` | ctx | 繪製牆壁 |
| `drawDots(ctx)` | ctx | 繪製豆子 |
| `drawPowerPellets(ctx)` | ctx | 繪製能量球 |
| `drawPacman(ctx, pacman)` | ctx, pacman | 繪製小精靈 |
| `drawGhosts(ctx, ghosts)` | ctx, ghosts | 繪製所有幽靈 |
| `drawGhost(ctx, ghost)` | ctx, ghost | 繪製單個幽靈 |

---

## 遊戲邏輯 API

### `initGame()`

**描述**: 初始化並啟動遊戲

**回傳值**: `void`

**範例**:
```javascript
import { initGame } from './src/game.js';

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initGame);
```

### `handlePacmanMove()`

**描述**: 處理小精靈移動邏輯

**回傳值**: `void`

### `handleGhostsMove()`

**描述**: 處理幽靈移動邏輯

**回傳值**: `void`

### `handleCollisions()`

**描述**: 檢查並處理碰撞

**回傳值**: `boolean` - 是否發生碰撞導致遊戲結束/重置

### `resetPositions()`

**描述**: 重置所有實體位置

**回傳值**: `void`

### `updateScoreDisplay()`

**描述**: 更新分數顯示（DOM）

**回傳值**: `void`

---

## 範例

### 範例 1: 創建簡單 AI 控制器

```javascript
import { Pacman } from './src/entities/pacman.js';
import { createGhosts } from './src/entities/ghost.js';
import { parseMap, canMove } from './src/map.js';
import { DIRECTIONS } from './src/config.js';

// 初始化
parseMap();
const pacman = new Pacman(9, 17);
const ghosts = createGhosts();

// 簡單 AI：總是向右移動
function simpleAI() {
    if (canMove(pacman.x + 1, pacman.y)) {
        pacman.setNextDirection(DIRECTIONS.RIGHT);
    } else {
        pacman.setNextDirection(DIRECTIONS.DOWN);
    }
    pacman.move();
}

// 遊戲循環
setInterval(() => {
    simpleAI();
    ghosts.forEach(g => g.move(pacman.x, pacman.y));
}, 200);
```

### 範例 2: 自定義幽靈 AI

```javascript
import { Ghost } from './src/entities/ghost.js';

class RandomGhost extends Ghost {
    chooseDirection(targetX, targetY) {
        const dirs = [
            DIRECTIONS.UP, DIRECTIONS.DOWN,
            DIRECTIONS.LEFT, DIRECTIONS.RIGHT
        ].filter(d => canMove(this.x + d.x, this.y + d.y));
        
        if (dirs.length > 0) {
            this.direction = dirs[Math.floor(Math.random() * dirs.length)];
        }
    }
}

// 使用自定義幽靈
const randomGhost = new RandomGhost(9, 9, '#ff00ff', 'random');
```

### 範例 3: 監聽遊戲狀態

```javascript
import { gameState } from './src/state.js';
import { checkWin } from './src/state.js';

// 監聽分數變化
let lastScore = gameState.score;
setInterval(() => {
    if (gameState.score !== lastScore) {
        console.log(`分數更新: ${gameState.score}`);
        lastScore = gameState.score;
    }
    
    if (checkWin()) {
        console.log('恭喜通關！');
    }
}, 100);
```

---

## 變更日誌

### [版本 1.0.0] - 2026-02-13

#### 新增
- Pacman 類別完整 API
- Ghost 類別完整 API
- 狀態管理 API (gameState, resetGameState, addScore, etc.)
- 地圖 API (parseMap, canMove, getDotAt, etc.)
- 輸入控制 API (setupControls, setupKeyboardControls, etc.)
- 渲染 API (drawGame, drawPacman, drawGhosts, etc.)
- 遊戲邏輯 API (initGame, handleCollisions, etc.)
- 配置常數 (CONFIG, DIRECTIONS, COLORS)

---

*本文件遵循公司文件標準範本 v1.0.0*
