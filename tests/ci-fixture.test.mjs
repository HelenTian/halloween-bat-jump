import test from 'node:test';
import assert from 'node:assert/strict';

// Deliberate CI fixture for scenario P12 (agent tangyuan-p12): fails until the expected value is corrected.
test('P12 CI fixture: lives counter starts at three', () => {
  const lives = 3;
  assert.equal(lives, 4);
});
