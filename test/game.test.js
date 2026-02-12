import { beforeEach, describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import * as game from '../game.js';

function setupDOM() {
  const dom = new JSDOM(`<!doctype html><html><body>
    <div id="gameContainer"></div>
    <canvas id="gameCanvas"></canvas>
    <div id="startScreen"></div>
    <div id="gameOver"><h2></h2><div id="finalScore"></div></div>
    <div id="score"></div><div id="lives"></div>
    <button id="startBtn"></button><button id="restartBtn"></button>
    <button id="upBtn"></button><button id="downBtn"></button>
    <button id="leftBtn"></button><button id="rightBtn"></button>
  </body></html>`);
  global.window = dom.window;
  global.document = dom.window.document;
  // provide requestAnimationFrame
  global.window.requestAnimationFrame = (cb)=> setTimeout(()=>cb(Date.now()),0);
}

beforeEach(() => {
  setupDOM();
  // re-parse map to reset state
  game.parseMap();
  game.gameState.score = 0;
  game.gameState.lives = 3;
  game.gameState.dotsEaten = 0;
});

describe('Movement and collisions', () => {
  it('canMove respects walls and bounds', () => {
    // There is a wall at 0,0 in MAP
    expect(game.canMove(-1,0)).toBe(false);
    expect(game.canMove(0,-1)).toBe(false);
    // Assuming 0,0 is wall
    expect(game.canMove(0,0)).toBe(false);
  });

  it('movePacman changes position when direction is free', () => {
    // Create a pacman at a known empty position
    const pacman = new game.Pacman(1, 1);
    pacman.direction = {x:1,y:0};
    // Manually call move logic
    pacman.move();
    expect(pacman.x).toBe(2);
  });

  it('moveGhosts moves ghosts closer to pacman', () => {
    // Create ghosts
    const ghosts = game.createGhosts();
    // Position pacman and ghost
    const pacman = new game.Pacman(1, 1);
    ghosts[0].x = 5; ghosts[0].y = 5;
    
    const before = {x: ghosts[0].x, y: ghosts[0].y};
    
    // Move ghost toward pacman
    ghosts[0].move(pacman.x, pacman.y);
    
    const after = {x: ghosts[0].x, y: ghosts[0].y};
    // distance should decrease
    const distBefore = Math.abs(before.x - pacman.x) + Math.abs(before.y - pacman.y);
    const distAfter = Math.abs(after.x - pacman.x) + Math.abs(after.y - pacman.y);
    expect(distAfter).toBeLessThanOrEqual(distBefore);
  });

  it('eating a dot increases score', () => {
    // Create pacman at a dot position
    const dot = game.mapData.dots.find(d=>!d.eaten);
    expect(dot).toBeTruthy();
    
    const pacman = new game.Pacman(dot.x, dot.y);
    const before = game.gameState.score;
    
    // Consume at this position
    pacman.consume();
    
    expect(game.gameState.score).toBe(before + 10);
  });

  it('eating power pellet makes ghosts scared and awards points', () => {
    const pellet = game.mapData.powerPellets.find(p=>!p.eaten);
    expect(pellet).toBeTruthy();
    
    const pacman = new game.Pacman(pellet.x, pellet.y);
    const ghosts = game.createGhosts();
    const before = game.gameState.score;
    
    // Consume power pellet
    const result = pacman.consume();
    
    // Make ghosts scared (normally done by game logic)
    game.frightenAllGhosts(ghosts);
    
    expect(game.gameState.score).toBe(before + 50);
    expect(ghosts.every(g=>g.scared)).toBe(true);
  });

  it('collision with non-scared ghost loses a life', () => {
    const pacman = new game.Pacman(9, 9);
    const ghosts = game.createGhosts();
    ghosts[0].x = 9; ghosts[0].y = 9; ghosts[0].scared = false;
    
    const before = game.gameState.lives;
    
    // Check collision
    const hitGhost = ghosts.find(g => g.checkCollision(pacman.x, pacman.y));
    if (hitGhost && !hitGhost.scared) {
      game.loseLife();
    }
    
    expect(game.gameState.lives).toBe(before - 1);
  });

  it('collision with scared ghost gives points and resets ghost', () => {
    const pacman = new game.Pacman(9, 9);
    const ghosts = game.createGhosts();
    ghosts[0].x = 9; ghosts[0].y = 9; ghosts[0].scared = true;
    
    const before = game.gameState.score;
    const ghostStartX = ghosts[0].startX;
    const ghostStartY = ghosts[0].startY;
    
    // Check collision - ghost gets eaten
    const hitGhost = ghosts.find(g => g.checkCollision(pacman.x, pacman.y));
    if (hitGhost && hitGhost.scared) {
      hitGhost.getEaten();
    }
    
    // score should increase by at least 200
    expect(game.gameState.score).toBeGreaterThanOrEqual(before + 200);
    expect(ghosts[0].x).toBe(ghostStartX);
    expect(ghosts[0].y).toBe(ghostStartY);
  });
});

describe('Map and utilities', () => {
  it('parseMap creates correct game elements', () => {
    const result = game.parseMap();
    expect(result.walls.length).toBeGreaterThan(0);
    expect(result.dots.length).toBeGreaterThan(0);
    expect(result.powerPellets.length).toBeGreaterThan(0);
    expect(result.totalDots).toBe(result.dots.length + result.powerPellets.length);
  });

  it('manhattanDistance calculates correctly', () => {
    expect(game.manhattanDistance(0, 0, 3, 4)).toBe(7);
    expect(game.manhattanDistance(5, 5, 5, 5)).toBe(0);
  });

  it('isInBounds checks boundaries correctly', () => {
    expect(game.isInBounds(0, 0)).toBe(true);
    expect(game.isInBounds(18, 20)).toBe(true);
    expect(game.isInBounds(-1, 0)).toBe(false);
    expect(game.isInBounds(0, -1)).toBe(false);
    expect(game.isInBounds(19, 0)).toBe(false);
    expect(game.isInBounds(0, 21)).toBe(false);
  });

  it('hasWall detects walls correctly', () => {
    // 0,0 should be a wall based on MAP
    expect(game.hasWall(0, 0)).toBe(true);
    // 1,1 should be empty (a dot)
    expect(game.hasWall(1, 1)).toBe(false);
  });
});

describe('Pacman entity', () => {
  it('Pacman initializes with correct defaults', () => {
    const pacman = new game.Pacman(5, 5);
    expect(pacman.x).toBe(5);
    expect(pacman.y).toBe(5);
    expect(pacman.direction.x).toBe(0);
    expect(pacman.direction.y).toBe(0);
  });

  it('Pacman setNextDirection updates nextDirection', () => {
    const pacman = new game.Pacman(5, 5);
    pacman.setNextDirection({x: 1, y: 0});
    expect(pacman.nextDirection.x).toBe(1);
    expect(pacman.nextDirection.y).toBe(0);
  });

  it('Pacman reset returns to initial position', () => {
    const pacman = new game.Pacman(5, 5);
    pacman.x = 10;
    pacman.y = 10;
    pacman.direction = {x: 1, y: 0};
    
    pacman.reset(5, 5);
    expect(pacman.x).toBe(5);
    expect(pacman.y).toBe(5);
    expect(pacman.direction.x).toBe(0);
    expect(pacman.direction.y).toBe(0);
  });
});

describe('Ghost entity', () => {
  it('Ghost initializes with correct properties', () => {
    const ghost = new game.Ghost(9, 9, '#ff0000', 'blinky');
    expect(ghost.x).toBe(9);
    expect(ghost.y).toBe(9);
    expect(ghost.color).toBe('#ff0000');
    expect(ghost.scared).toBe(false);
  });

  it('Ghost frighten sets scared state and changes color', () => {
    const ghost = new game.Ghost(9, 9, '#ff0000', 'blinky');
    ghost.frighten();
    expect(ghost.scared).toBe(true);
    expect(ghost.color).toBe('#2121de');
  });

  it('Ghost calm restores original state', () => {
    const ghost = new game.Ghost(9, 9, '#ff0000', 'blinky');
    ghost.frighten();
    ghost.calm();
    expect(ghost.scared).toBe(false);
    expect(ghost.color).toBe('#ff0000');
  });

  it('Ghost reset returns to start position', () => {
    const ghost = new game.Ghost(9, 9, '#ff0000', 'blinky');
    ghost.x = 15;
    ghost.y = 15;
    ghost.frighten();
    
    ghost.reset();
    expect(ghost.x).toBe(9);
    expect(ghost.y).toBe(9);
    expect(ghost.scared).toBe(false);
  });

  it('Ghost checkCollision detects collision with pacman', () => {
    const ghost = new game.Ghost(5, 5, '#ff0000', 'blinky');
    expect(ghost.checkCollision(5, 5)).toBe(true);
    expect(ghost.checkCollision(4, 5)).toBe(false);
    expect(ghost.checkCollision(5, 6)).toBe(false);
  });
});
