export const WIDTH = 960;
export const HEIGHT = 560;
export const FLOOR = 514;
export const BAT_X = 230;
export const BAT_RADIUS = 17;
export const TOWER_WIDTH = 72;
export const GAP_HEIGHT = 186;

export function createGame(seed = 17) {
  return { status: 'ready', y: 245, velocity: 0, score: 0, time: 0, spawnIn: 1.5, towers: [], seed: seed >>> 0 };
}

export function flap(state) {
  if (state.status === 'paused') return state;
  const next = state.status === 'running' ? state : createGame(state.seed);
  return { ...next, status: 'running', velocity: -315 };
}

export function togglePause(state) {
  if (state.status === 'running') return { ...state, status: 'paused' };
  if (state.status === 'paused') return { ...state, status: 'running' };
  return state;
}

function circleHitsRect(x, y, radius, left, top, width, height) {
  const nearestX = Math.max(left, Math.min(x, left + width));
  const nearestY = Math.max(top, Math.min(y, top + height));
  return (x - nearestX) ** 2 + (y - nearestY) ** 2 < radius ** 2;
}

export function advance(state, dt) {
  if (state.status !== 'running' || dt <= 0) return state;
  const velocity = state.velocity + 900 * dt;
  const y = state.y + velocity * dt;
  const speed = 185 + Math.min(state.score, 12) * 4;
  const towers = state.towers.map(tower => ({ ...tower, x: tower.x - speed * dt }));
  let { seed, spawnIn, score } = state;
  spawnIn -= dt;
  if (spawnIn <= 0) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    towers.push({ x: WIDTH + TOWER_WIDTH, gapTop: 95 + (seed / 2 ** 32) * 170, passed: false });
    spawnIn += 1.8;
  }
  let hit = y + BAT_RADIUS >= FLOOR || y - BAT_RADIUS <= 0;
  for (const tower of towers) {
    const gapBottom = tower.gapTop + GAP_HEIGHT;
    hit ||= circleHitsRect(BAT_X, y, BAT_RADIUS, tower.x, 0, TOWER_WIDTH, tower.gapTop)
      || circleHitsRect(BAT_X, y, BAT_RADIUS, tower.x, gapBottom, TOWER_WIDTH, FLOOR - gapBottom);
    if (!tower.passed && tower.x + TOWER_WIDTH + BAT_RADIUS < BAT_X) {
      tower.passed = true;
      score += 1;
    }
  }
  return { ...state, y, velocity, score, seed, spawnIn, time: state.time + dt,
    towers: towers.filter(tower => tower.x + TOWER_WIDTH > -20), status: hit ? 'over' : 'running' };
}
