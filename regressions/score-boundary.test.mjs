import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, flap, advance, BAT_X, BAT_RADIUS, TOWER_WIDTH } from '../src/physics.mjs';

// One 0.1 s step moves a tower 185 * 0.1 = 18.5 px at score 0, so these start positions
// are exact in binary floating point and land the tower on a known edge.
const DT = 0.1;
const STEP = 18.5;
const tangentX = BAT_X - TOWER_WIDTH - BAT_RADIUS;
const scoreAfterStep = endX => advance({ ...flap(createGame()), velocity: 0,
  towers: [{ x: endX + STEP, gapTop: 160, passed: false }] }, DT);

test('score stays 0 when the bat circle exactly touches the tower far edge', () => {
  const next = scoreAfterStep(tangentX);
  assert.equal(next.towers[0].x, tangentX);
  assert.equal(next.status, 'running');
  assert.equal(next.score, 0);
});
test('score is 1 once the bat has just cleared the far edge', () => {
  const next = scoreAfterStep(tangentX - 0.5);
  assert.equal(next.status, 'running');
  assert.equal(next.score, 1);
  assert.equal(next.towers[0].passed, true);
});
