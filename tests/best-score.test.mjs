import test from 'node:test';
import assert from 'node:assert/strict';
import { BEST_KEY, loadBest, recordBest } from '../src/best-score.mjs';

const memory = (initial = {}) => {
  const data = { ...initial };
  return { data, getItem: key => data[key] ?? null, setItem: (key, value) => { data[key] = String(value); } };
};
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };

test('best score starts at 0 and survives a reload', () => {
  const storage = memory();
  assert.equal(loadBest(storage), 0);
  assert.equal(recordBest(storage, 0, 4), 4);
  assert.equal(loadBest(storage), 4);
});
test('a lower or equal score never replaces the best', () => {
  const storage = memory({ [BEST_KEY]: '7' });
  assert.equal(recordBest(storage, loadBest(storage), 3), 7);
  assert.equal(recordBest(storage, 7, 7), 7);
  assert.equal(storage.data[BEST_KEY], '7');
});
test('corrupt stored values are ignored', () => {
  for (const bad of ['abc', '-2', '', 'NaN']) assert.equal(loadBest(memory({ [BEST_KEY]: bad })), 0);
});
test('the game stays playable when storage is unavailable', () => {
  assert.equal(loadBest(broken), 0);
  assert.equal(recordBest(broken, 0, 5), 5);
  assert.equal(loadBest(undefined), 0);
  assert.equal(recordBest(undefined, 2, 6), 6);
});
test('a stale tab cannot lower a best that another tab saved', () => {
  const storage = memory();
  const staleBest = loadBest(storage);          // this tab loaded 0
  storage.setItem(BEST_KEY, '10');              // another tab saved 10 meanwhile
  assert.equal(recordBest(storage, staleBest, 3), 10);
  assert.equal(storage.data[BEST_KEY], '10');
});
test('a new best is persisted and a higher stored best is picked up', () => {
  const storage = memory({ [BEST_KEY]: '2' });
  assert.equal(recordBest(storage, 2, 5), 5);
  assert.equal(storage.data[BEST_KEY], '5');
  assert.equal(recordBest(memory({ [BEST_KEY]: '9' }), 2, 1), 9);
});
