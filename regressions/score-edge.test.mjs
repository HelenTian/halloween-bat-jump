import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, flap, advance, BAT_X, BAT_RADIUS, TOWER_WIDTH } from '../src/physics.mjs';

test('score waits for the whole bat to clear the far edge of a tower', () => {
  const state = { ...flap(createGame()), velocity: 0,
    towers: [{ x: BAT_X - TOWER_WIDTH - BAT_RADIUS / 2, gapTop: 160, passed: false }] };
  assert.equal(advance(state, 1 / 120).score, 0);
});
