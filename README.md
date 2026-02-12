# 專案說明書: 小精靈遊戲 (Elf Game / Pac-Man Clone)

**版本**: 1.0.0
**更新日期**: 2026-02-13
**作者**: Writer Agent
**審查者**: Brain Agent

---

## 📋 目錄

- [概述](#概述)
- [安裝](#安裝)
- [使用說明](#使用說明)
- [API 參考](#api-參考)
- [範例](#範例)
- [變更日誌](#變更日誌)
- [貢獻指南](#貢獻指南)

---

## 概述

### 什麼是小精靈遊戲？
這是一個使用原生 JavaScript 開發的經典小精靈 (Pac-Man) 網頁遊戲。玩家控制小精靈吃掉地圖上的所有豆子，同時躲避幽靈的追擊。

### 主要功能
- 🎮 經典小精靈玩法：吃豆子、躲避幽靈
- 👻 AI 幽靈：具有追逐邏輯的幽靈敵人
- ⚡ 能量球系統：吃掉能量球後可以反過來吃掉幽靈
- 📱 跨平台支援：桌面鍵盤 + 手機觸控操作
- 🎨 復古像素風格視覺效果
- 🔄 響應式設計：自動適應不同螢幕尺寸

### 適用場景
- 網頁遊戲娛樂
- JavaScript 遊戲開發學習範例
- 瀏覽器 Canvas API 應用展示
- 行動裝置網頁遊戲體驗

---

## 安裝

### 系統需求
- Node.js 18.0 或更高版本
- 現代瀏覽器（Chrome, Firefox, Safari, Edge）
- npm 或 yarn 套件管理器

### 安裝步驟

```bash
# 步驟 1: 克隆專案
cd /Volumes/My\ Shared\ Files/project/auto-pipeline-demo/elf-game

# 步驟 2: 安裝依賴
npm install
```

### 驗證安裝

```bash
# 執行測試套件
npm test

# 預期輸出:
# ✓ 所有 19 個測試通過
# Test Files  1 passed (1)
# Tests        19 passed (19)
```

---

## 使用說明

### 快速開始

```bash
# 方式 1: 直接開啟 HTML 檔案
open index.html

# 方式 2: 使用本地伺服器（推薦）
npx serve .
```

### 基礎玩法

#### 鍵盤控制（桌面版）
| 按鍵 | 功能 |
|------|------|
| ↑ / W | 向上移動 |
| ↓ / S | 向下移動 |
| ← / A | 向左移動 |
| → / D | 向右移動 |

**說明**: 使用方向鍵或 WASD 鍵控制小精靈移動

#### 觸控控制（手機版）
| 控制 | 功能 |
|------|------|
| ▲ 按鈕 | 向上移動 |
| ▼ 按鈕 | 向下移動 |
| ◀ 按鈕 | 向左移動 |
| ▶ 按鈕 | 向右移動 |
| 滑動 | 手指滑動控制方向 |

**說明**: 點擊方向按鈕或在遊戲畫布上滑動來控制移動

### 遊戲目標
- 吃掉所有豆子 (每個 10 分)
- 吃掉能量球 (每個 50 分) 可讓幽靈變弱
- 吃掉變弱的幽靈 (每個 200 分)
- 避免被正常狀態的幽靈抓到 (生命 -1)
- 吃完所有豆子即可通關！

### 遊戲規則
- 初始生命: 3 條
- 分數系統:
  - 普通豆子: 10 分
  - 能量球: 50 分
  - 幽靈: 200 分
- 能量球效果持續: 5 秒
- 幽靈數量: 3 隻 (紅色、粉色、青色)

---

## API 參考

### 主要類別

#### `Pacman`
小精靈實體類別

| 方法 | 參數 | 回傳值 | 說明 |
|------|------|--------|------|
| `constructor(x, y)` | x: number, y: number | Pacman | 創建小精靈實例 |
| `setNextDirection(dir)` | dir: {x, y} | void | 設置下一個移動方向 |
| `move()` | - | {x, y} | 執行移動並回傳新位置 |
| `consume()` | - | {ateDot, atePower, points} | 吃掉當前位置的豆子/能量球 |
| `reset(x, y)` | x: number, y: number | void | 重置到指定位置 |
| `getDrawAngles()` | - | {startAngle, endAngle} | 獲取繪製用的嘴巴角度 |

#### `Ghost`
幽靈實體類別

| 方法 | 參數 | 回傳值 | 說明 |
|------|------|--------|------|
| `constructor(x, y, color, name)` | x, y, color, name | Ghost | 創建幽靈實例 |
| `move(targetX, targetY)` | targetX, targetY | void | 向目標移動 |
| `checkCollision(px, py)` | px, py | boolean | 檢查是否與小精靈碰撞 |
| `getEaten()` | - | number | 被吃掉，回傳分數 |
| `frighten()` | - | void | 進入害怕狀態 |
| `calm()` | - | void | 恢復正常狀態 |
| `reset()` | - | void | 重置位置 |

### 狀態管理函數

#### `resetGameState(fullReset)`
**描述**: 重置遊戲狀態

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| fullReset | boolean | 否 | 是否完全重置（包括分數和生命）|

#### `addScore(points)`
**描述**: 增加分數

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| points | number | 是 | 要增加的分數 |

#### `loseLife()`
**描述**: 失去一條生命

**回傳值**: boolean - 是否還有剩餘生命

#### `checkWin()`
**描述**: 檢查是否獲勝（吃掉所有豆子）

**回傳值**: boolean

### 地圖函數

#### `parseMap()`
**描述**: 解析地圖字串為遊戲元素

**回傳值**:
| 欄位 | 類型 | 說明 |
|------|------|------|
| walls | Array | 牆壁位置陣列 |
| dots | Array | 豆子位置陣列 |
| powerPellets | Array | 能量球位置陣列 |
| totalDots | number | 總豆子數量 |
| pacmanStart | {x, y} | 小精靈起始位置 |

#### `canMove(x, y)`
**描述**: 檢查是否可以移動到指定位置

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| x | number | 是 | X 座標 |
| y | number | 是 | Y 座標 |

**回傳值**: boolean

#### `getAvailableDirections(x, y, excludeDir)`
**描述**: 獲取所有可用方向

**回傳值**: Array<{x, y}> - 可用方向陣列

### 渲染函數

#### `drawGame(ctx, pacman, ghosts)`
**描述**: 繪製完整遊戲畫面

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| ctx | CanvasRenderingContext2D | 是 | Canvas 2D 上下文 |
| pacman | Pacman | 是 | 小精靈實例 |
| ghosts | Array<Ghost> | 是 | 幽靈陣列 |

### 輸入控制函數

#### `setupControls(canvas, onDirectionChange)`
**描述**: 設置所有輸入控制（鍵盤、觸控、滑動）

**參數**:
| 參數名 | 類型 | 必選 | 說明 |
|--------|------|------|------|
| canvas | HTMLElement | 是 | 遊戲畫布元素 |
| onDirectionChange | Function | 是 | 方向改變時的回調函數 |

---

## 範例

### 完整範例 1: 基本遊戲初始化

```javascript
import { initGame } from './src/game.js';

// 初始化遊戲（DOMContentLoaded 時自動執行）
document.addEventListener('DOMContentLoaded', initGame);
```

**預期輸出**: 遊戲畫面初始化，顯示開始畫面

### 完整範例 2: 創建自訂小精靈

```javascript
import { Pacman } from './src/entities/pacman.js';
import { DIRECTIONS } from './src/config.js';

// 創建小精靈實例
const pacman = new Pacman(9, 17);

// 設置移動方向
pacman.setNextDirection(DIRECTIONS.RIGHT);

// 執行移動
const newPos = pacman.move();
console.log(`新位置: (${newPos.x}, ${newPos.y})`);

// 檢查並吃掉豆子
const result = pacman.consume();
if (result.ateDot) {
    console.log(`吃了豆子! 獲得 ${result.points} 分`);
}
```

**預期輸出**:
```
新位置: (10, 17)
吃了豆子! 獲得 10 分
```

### 完整範例 3: 創建幽靈並設置 AI

```javascript
import { Ghost, createGhosts } from './src/entities/ghost.js';
import { COLORS } from './src/config.js';

// 方式 1: 創建單個幽靈
const blinky = new Ghost(9, 9, COLORS.GHOST_RED, 'blinky');

// 讓幽靈向小精靈移動
blinky.move(pacman.x, pacman.y);

// 檢查碰撞
if (blinky.checkCollision(pacman.x, pacman.y)) {
    console.log('幽靈抓到小精靈了!');
}

// 方式 2: 創建所有幽靈
const ghosts = createGhosts();
ghosts.forEach(ghost => {
    console.log(`創建幽靈: ${ghost.name} at (${ghost.x}, ${ghost.y})`);
});
```

### 完整範例 4: 解析地圖

```javascript
import { parseMap, canMove, getDotAt } from './src/map.js';

// 解析地圖
const mapData = parseMap();
console.log(`地圖統計:`);
console.log(`- 牆壁數量: ${mapData.walls.length}`);
console.log(`- 豆子數量: ${mapData.dots.length}`);
console.log(`- 能量球數量: ${mapData.powerPellets.length}`);
console.log(`- 總目標: ${mapData.totalDots}`);

// 檢查位置是否可移動
console.log(`位置 (1,1) 可移動: ${canMove(1, 1)}`);
console.log(`位置 (0,0) 可移動: ${canMove(0, 0)}`); // 牆壁

// 檢查位置是否有豆子
const dot = getDotAt(1, 1);
if (dot) {
    console.log(`位置 (1,1) 有豆子`);
}
```

**預期輸出**:
```
地圖統計:
- 牆壁數量: 210
- 豆子數量: 160
- 能量球數量: 4
- 總目標: 164
位置 (1,1) 可移動: true
位置 (0,0) 可移動: false
位置 (1,1) 有豆子
```

---

## 變更日誌

### [版本 1.0.0] - 2026-02-13

#### 新增
- 基礎小精靈遊戲實現
- Pacman 類別：移動、吃豆子、動畫
- Ghost 類別：AI 追蹤、害怕狀態、碰撞檢測
- 地圖系統：解析、碰撞檢測、路徑尋找
- 渲染器：Canvas 繪製所有遊戲元素
- 輸入控制：鍵盤、觸控按鈕、滑動支援
- 遊戲狀態管理：分數、生命、勝利條件
- 能量球系統：讓幽靈變弱並可食用
- 響應式設計：適配桌面和手機
- 完整測試套件：19 個測試案例

#### 技術特性
- 使用 ES6 模組 (type: module)
- Vitest 測試框架
- JSDOM 環境測試
- 無外部運行時依賴

---

## 貢獻指南

### 如何貢獻
1. Fork 本專案
2. 創建功能分支 (`git checkout -b feature/新功能`)
3. 提交變更 (`git commit -m '新增: 某某功能'`)
4. 推送分支 (`git push origin feature/新功能`)
5. 開啟 Pull Request

### 開發規範
- 使用 ES6+ 語法
- 所有函數必須有 JSDoc 註釋
- 新功能必須包含測試
- 遵循現有程式碼風格

### 提交 PR 流程
1. 確保所有測試通過 (`npm test`)
2. 更新相關文件 (README.md, API.md)
3. 在 CHANGELOG.md 記錄變更
4. 請求 Code Review

---

## 📱 手機遊玩說明

### 支援裝置
- iOS Safari (iPhone/iPad)
- Android Chrome
- 其他現代行動瀏覽器

### 控制方式
1. **方向按鈕**: 點擊螢幕下方的 ▲▼◀▶ 按鈕
2. **滑動控制**: 在遊戲畫布上滑動手指
3. **防止誤觸**: 遊戲會阻止頁面捲動和縮放

### 遊玩建議
- 使用橫向模式獲得最佳體驗
- 確保瀏覽器允許觸控事件
- 如果按鈕過小，可以縮放頁面

### 離線遊玩
本遊戲為純前端應用，下載後可離線遊玩：
```bash
# 下載專案
git clone [專案網址]
# 直接開啟 index.html 即可遊玩
```

---

## 🧪 執行測試

```bash
# 執行所有測試
npm test

# 監視模式（開發時使用）
npx vitest --watch

# 產生測試覆蓋率報告
npx vitest --coverage
```

### 測試項目
- 移動和碰撞檢測
- 地圖解析和工具函數
- Pacman 實體行為
- Ghost 實體行為
- 遊戲狀態管理

---

*本文件遵循公司文件標準範本 v1.0.0*
