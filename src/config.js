/**
 * 遊戲配置常數
 * Game Configuration Constants
 */

export const CONFIG = {
    CELL_SIZE: 20,
    COLS: 19,
    ROWS: 21,
    PACMAN_SPEED: 150, // 毫秒/格
    GHOST_SPEED: 200,
    FPS: 60,
    POWER_DURATION: 5000, // 能量球持續時間
    SCORE_DOT: 10,
    SCORE_POWER: 50,
    SCORE_GHOST: 200
};

// 遊戲地圖定義
export const MAP = [
    "###################",
    "#........#........#",
    "#.##.###.#.###.##.#",
    "#o##.###.#.###.##o#",
    "#.................#",
    "#.##.#.#####.#.##.#",
    "#....#...#...#....#",
    "####.###.#.###.####",
    "   #.#.......#.#   ",
    "   #.#.##.##.#.#   ",
    "####.#.#   #.#.####",
    "    ....# #....    ",
    "####.#.#####.#.####",
    "   #.#.......#.#   ",
    "   #.#.#####.#.#   ",
    "####.#...#...#.####",
    "#........#........#",
    "#.##.###.#.###.##.#",
    "#o.#.....P.....#.o#",
    "##.#.#.#####.#.#.##",
    "#....#...#...#....#",
    "#.######.#.######.#",
    "#.................#",
    "###################"
];

// 方向常數
export const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 },
    NONE: { x: 0, y: 0 }
};

// 顏色常數
export const COLORS = {
    WALL: '#2121de',
    DOT: '#ffb8ae',
    POWER_PELLET: '#ffb8ae',
    PACMAN: '#ffff00',
    GHOST_SCARED: '#2121de',
    GHOST_RED: '#ff0000',
    GHOST_PINK: '#ffb8ff',
    GHOST_CYAN: '#00ffff',
    EYE_WHITE: '#ffffff',
    EYE_BLACK: '#000000'
};

// 幽靈初始配置
export const GHOST_CONFIG = [
    { x: 9, y: 9, color: COLORS.GHOST_RED, name: 'blinky' },
    { x: 10, y: 9, color: COLORS.GHOST_PINK, name: 'pinky' },
    { x: 8, y: 9, color: COLORS.GHOST_CYAN, name: 'inky' }
];
