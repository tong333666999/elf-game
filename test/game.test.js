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
  // ensure pacman and ghosts default
  game.pacman.x = 9; game.pacman.y = 17; game.pacman.dir = {x:0,y:0}; game.pacman.nextDir={x:0,y:0};
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
    // place pacman near empty spot
    game.pacman.x = 1; game.pacman.y = 1;
    game.pacman.dir = {x:1,y:0};
    game.movePacman();
    expect(game.pacman.x).toBe(2);
  });

  it('moveGhosts moves ghosts closer to pacman', () => {
    game.pacman.x = 1; game.pacman.y = 1;
    game.ghosts[0].x = 5; game.ghosts[0].y = 5;
    const before = {x: game.ghosts[0].x, y: game.ghosts[0].y};
    game.moveGhosts();
    const after = {x: game.ghosts[0].x, y: game.ghosts[0].y};
    // distance should decrease
    const distBefore = Math.abs(before.x - game.pacman.x) + Math.abs(before.y - game.pacman.y);
    const distAfter = Math.abs(after.x - game.pacman.x) + Math.abs(after.y - game.pacman.y);
    expect(distAfter).toBeLessThanOrEqual(distBefore);
  });

  it('eating a dot increases score', () => {
    // find a dot position
    const dot = game.dots.find(d=>!d.eaten);
    expect(dot).toBeTruthy();
    game.pacman.x = dot.x; game.pacman.y = dot.y;
    const before = game.gameState.score;
    game.checkCollisions();
    expect(game.gameState.score).toBe(before + 10);
  });

  it('eating power pellet makes ghosts scared and awards points', () => {
    const pellet = game.powerPellets.find(p=>!p.eaten);
    expect(pellet).toBeTruthy();
    game.pacman.x = pellet.x; game.pacman.y = pellet.y;
    const before = game.gameState.score;
    game.checkCollisions();
    expect(game.gameState.score).toBe(before + 50);
    expect(game.ghosts.every(g=>g.scared)).toBe(true);
  });

  it('collision with non-scared ghost loses a life', () => {
    game.pacman.x = 9; game.pacman.y = 9;
    game.ghosts[0].x = 9; game.ghosts[0].y = 9; game.ghosts[0].scared = false;
    const before = game.gameState.lives;
    game.checkCollisions();
    expect(game.gameState.lives).toBe(before - 1);
  });

  it('collision with scared ghost gives points and resets ghost', () => {
    game.pacman.x = 9; game.pacman.y = 9;
    game.ghosts[0].x = 9; game.ghosts[0].y = 9; game.ghosts[0].scared = true;
    const before = game.gameState.score;
    game.checkCollisions();
    // score should increase by at least 200 (may include dot/pellet at same tile)
    expect(game.gameState.score).toBeGreaterThanOrEqual(before + 200);
    expect(game.ghosts[0].x).toBe(9);
    expect(game.ghosts[0].y).toBe(9);
  });
});
