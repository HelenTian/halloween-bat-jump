import test from 'node:test';
import assert from 'node:assert/strict';
import { BEST_KEY, loadBest, recordBest } from '../src/best-score.mjs';

const memory = (initial = {}) => {
  const data = { ...initial };
  return { data, getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = String(value); } };
};
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };

test('a higher score becomes the new best', () => {
  assert.equal(recordBest(memory(), 4), 4);
  assert.equal(recordBest(memory({ [BEST_KEY]: '2' }), 5), 5);
});
test('a lower or equal score keeps the stored best', () => {
  const storage = memory({ [BEST_KEY]: '7' });
  assert.equal(recordBest(storage, 3), 7);
  assert.equal(recordBest(storage, 7), 7);
  assert.equal(storage.data[BEST_KEY], '7');
});
test('a stale tab cannot lower a best saved by another tab', () => {
  const storage = memory({ [BEST_KEY]: '10' });
  assert.equal(recordBest(storage, 3), 10);
  assert.equal(loadBest(storage), 10);
});
test('corrupt stored values count as 0', () => {
  for (const bad of ['abc', '-2', '', 'NaN']) assert.equal(loadBest(memory({ [BEST_KEY]: bad })), 0);
});
test('the game stays playable when storage is unavailable', () => {
  assert.equal(recordBest(broken, 5), 5);
  assert.equal(recordBest(undefined, 6), 6);
});
