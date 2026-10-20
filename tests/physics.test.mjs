import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, flap, togglePause, advance, FLOOR, BAT_RADIUS, BAT_X, TOWER_WIDTH } from '../src/physics.mjs';

test('flapping starts the game and gains height', () => {
  const started = flap(createGame());
  const moved = advance(started, 1 / 60);
  assert.equal(moved.status, 'running');
  assert.ok(moved.y < started.y);
});
test('hitting the ground ends the flight and restart clears the round', () => {
  const ended = advance({ ...flap(createGame()), y: FLOOR - BAT_RADIUS, velocity: 100, score: 3 }, 1 / 60);
  assert.equal(ended.status, 'over');
  const restarted = flap(ended);
  assert.equal(restarted.status, 'running');
  assert.equal(restarted.score, 0);
  assert.deepEqual(restarted.towers, []);
});
test('pause freezes physics and flap cannot bypass it', () => {
  const paused = togglePause(flap(createGame()));
  assert.equal(paused.status, 'paused');
  assert.equal(advance(paused, 1), paused);
  assert.equal(flap(paused), paused);
  assert.equal(togglePause(paused).status, 'running');
});
test('a tower hit ends the flight; a clear gap remains playable', () => {
  const state = { ...flap(createGame()), velocity: 0, towers: [{ x: BAT_X, gapTop: 100, passed: false }] };
  assert.equal(advance({ ...state, y: 80 }, 1 / 120).status, 'over');
  assert.equal(advance({ ...state, y: 190 }, 1 / 120).status, 'running');
});
test('a cleared tower scores once', () => {
  const state = { ...flap(createGame()), velocity: 0, towers: [{ x: BAT_X - TOWER_WIDTH - 50, gapTop: 160, passed: false }] };
  const first = advance(state, 1 / 120);
  assert.equal(first.score, 1);
  assert.equal(advance(first, 1 / 120).score, 1);
});
test('spawns are reproducible from the recorded seed', () => {
  const state = { ...flap(createGame(42)), spawnIn: 0 };
  const a = advance(state, 1 / 120);
  assert.deepEqual(a, advance(state, 1 / 120));
  assert.equal(a.towers.length, 1);
  assert.deepEqual(state.towers, []);
});
