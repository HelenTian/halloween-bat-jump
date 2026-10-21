import { loadBest, recordBest } from './best-score.mjs';
import { WIDTH, HEIGHT, FLOOR, BAT_X, BAT_RADIUS, TOWER_WIDTH, GAP_HEIGHT, createGame, flap, togglePause, advance } from './physics.mjs';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const score = document.querySelector('#score');
const bestEl = document.querySelector('#best');
let storage;
try { storage = window.localStorage; } catch { storage = undefined; }
let best = loadBest(storage);
const overlay = document.querySelector('#overlay');
const play = document.querySelector('#play');
const pause = document.querySelector('#pause');
const status = document.querySelector('#status');
let game = createGame();
let lastTime;
let accumulator = 0;
let sceneryTime = 0;

function sync() {
  if (game.status === 'over') best = recordBest(storage, best, game.score);
  score.textContent = String(game.score).padStart(2, '0');
  bestEl.textContent = String(best).padStart(2, '0');
  overlay.hidden = game.status === 'running';
  pause.hidden = game.status !== 'running';
  const headline = document.querySelector('#headline');
  const message = document.querySelector('#message');
  const badge = document.querySelector('#badge');
  if (game.status === 'over') {
    headline.textContent = 'One more moonlit flight?';
    message.textContent = `You passed ${game.score} ${game.score === 1 ? 'tower' : 'towers'}. Pip believes in you.`;
    badge.textContent = 'A LITTLE TUMBLE. A FRESH START.';
    play.innerHTML = 'Try again <span aria-hidden="true">↗</span>';
    status.textContent = `Flight ended. Score ${game.score}. Press Space or Try again to restart.`;
  } else if (game.status === 'paused') {
    headline.textContent = 'Taking a little bat break.';
    message.textContent = 'Your midnight adventure will be right here.';
    badge.textContent = 'FLIGHT PAUSED';
    play.innerHTML = 'Keep flying <span aria-hidden="true">↗</span>';
    status.textContent = 'Game paused.';
  } else if (game.status === 'running') {
    status.textContent = 'Flying. Space or Arrow Up to flap. P to pause.';
  }
}

function fly() {
  game = game.status === 'paused' ? togglePause(game) : flap(game);
  sync();
  canvas.focus({ preventScroll: true });
}
play.addEventListener('click', fly);
canvas.addEventListener('pointerdown', event => { event.preventDefault(); fly(); });
pause.addEventListener('click', () => { game = togglePause(game); sync(); play.focus(); });
document.addEventListener('keydown', event => {
  if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
  if (['Space', 'ArrowUp'].includes(event.code)) {
    event.preventDefault();
    if (!event.repeat) fly();
  } else if (event.code === 'KeyP' && !event.repeat) {
    game = togglePause(game); sync();
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.status === 'running') { game = togglePause(game); sync(); }
  lastTime = undefined;
  accumulator = 0;
});

function pumpkin(x, y, size = 16) {
  ctx.fillStyle = '#d8884d';
  ctx.beginPath(); ctx.ellipse(x, y, size, size * .75, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a7603f'; ctx.lineWidth = 1;
  for (const offset of [-.45, 0, .45]) { ctx.beginPath(); ctx.ellipse(x + size * offset * .5, y, size * .4, size * .74, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.fillStyle = '#59445b'; ctx.fillRect(x - 2, y - size, 4, 6);
  ctx.fillStyle = '#ffd28a';
  for (const dx of [-5, 5]) { ctx.beginPath(); ctx.moveTo(x + dx - 2, y - 2); ctx.lineTo(x + dx + 2, y - 2); ctx.lineTo(x + dx, y - 6); ctx.fill(); }
  ctx.fillRect(x - 4, y + 3, 8, 2);
}

function bat(x, y, time, angle = 0, scale = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(scale, scale);
  const wing = Math.sin(time * 13) * 8;
  ctx.fillStyle = '#9371be'; ctx.strokeStyle = '#c2a4e5'; ctx.lineWidth = 1.5;
  for (const direction of [-1, 1]) {
    ctx.save(); ctx.scale(direction, 1);
    ctx.beginPath(); ctx.moveTo(7, -3); ctx.quadraticCurveTo(27, -33 + wing, 49, -20 + wing);
    ctx.quadraticCurveTo(34, -12, 42, 6); ctx.quadraticCurveTo(25, -3, 23, 13); ctx.quadraticCurveTo(16, 3, 7, 13);
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#ac8bd0'; ctx.beginPath(); ctx.ellipse(0, 0, 15, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-12, -9); ctx.lineTo(-11, -27); ctx.lineTo(-2, -16); ctx.lineTo(7, -17); ctx.lineTo(14, -27); ctx.lineTo(13, -6); ctx.fill();
  ctx.fillStyle = '#fff4cf';
  for (const x of [-5, 6]) { ctx.beginPath(); ctx.ellipse(x, -4, 3.5, 4.5, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#342544'; ctx.fillRect(-5, -5, 2, 4); ctx.fillRect(6, -5, 2, 4);
  ctx.fillStyle = '#fff4cf'; ctx.beginPath(); ctx.moveTo(-3, 6); ctx.lineTo(-1, 10); ctx.lineTo(1, 6); ctx.fill();
  ctx.restore();
}

function tower(tower) {
  const bottom = tower.gapTop + GAP_HEIGHT;
  ctx.fillStyle = '#42324f'; ctx.strokeStyle = '#6d4c72'; ctx.lineWidth = 2;
  for (const [top, height] of [[0, tower.gapTop], [bottom, FLOOR - bottom]]) {
    ctx.fillRect(tower.x, top, TOWER_WIDTH, height); ctx.strokeRect(tower.x, top, TOWER_WIDTH, height);
    ctx.fillStyle = '#684464';
    const ledgeY = top === 0 ? height - 12 : top;
    ctx.fillRect(tower.x - 6, ledgeY, TOWER_WIDTH + 12, 12);
    ctx.fillStyle = '#42324f';
    for (let y = top + 22; y < top + height - 20; y += 42) {
      ctx.fillStyle = '#d29960'; ctx.fillRect(tower.x + 30, y, 12, 19); ctx.fillStyle = '#42324f';
      ctx.fillRect(tower.x + 35, y, 2, 19); ctx.fillRect(tower.x + 30, y + 9, 12, 2);
    }
  }
}

function draw(time) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, '#1c1937'); sky.addColorStop(.65, '#3e294d'); sky.addColorStop(1, '#62405b');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 57; i++) {
    const x = (i * 173 + 73) % WIDTH; const y = (i * 97 + 39) % 340;
    ctx.globalAlpha = .25 + (i % 4) * .12; ctx.fillStyle = '#f0d8bc'; ctx.fillRect(x, y, i % 3 === 0 ? 2 : 1, i % 3 === 0 ? 2 : 1);
  }
  ctx.globalAlpha = 1;
  const glow = ctx.createRadialGradient(748, 119, 25, 748, 119, 150);
  glow.addColorStop(0, '#ffdfaa20'); glow.addColorStop(1, '#ffdfaa00'); ctx.fillStyle = glow; ctx.fillRect(580, 0, 340, 290);
  ctx.fillStyle = '#f3d5a0'; ctx.beginPath(); ctx.arc(748, 119, 43, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#dfbd8b'; ctx.beginPath(); ctx.arc(734, 105, 9, 0, Math.PI * 2); ctx.arc(762, 132, 6, 0, Math.PI * 2); ctx.fill();
  for (let layer = 0; layer < 2; layer++) {
    ctx.fillStyle = layer === 0 ? '#332840' : '#2a2238';
    for (let i = 0; i < 17; i++) {
      const x = i * 75 - ((time * (layer + 1) * 5) % 75); const h = 35 + ((i * 37 + layer * 23) % 80);
      ctx.fillRect(x, FLOOR - h, 55, h);
      ctx.beginPath(); ctx.moveTo(x - 7, FLOOR - h); ctx.lineTo(x + 27, FLOOR - h - 22); ctx.lineTo(x + 62, FLOOR - h); ctx.fill();
    }
  }
  ctx.strokeStyle = '#281f35'; ctx.lineWidth = 8;
  for (const [x, mirror] of [[45, 1], [909, -1]]) {
    ctx.save(); ctx.translate(x, 0); ctx.scale(mirror, 1);
    ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.bezierCurveTo(-9, 380, 15, 300, -11, 234); ctx.moveTo(0, 378); ctx.lineTo(42, 337); ctx.lineTo(47, 298); ctx.moveTo(4, 347); ctx.lineTo(-31, 320); ctx.moveTo(-3, 276); ctx.lineTo(27, 255); ctx.stroke(); ctx.restore();
  }
  for (const item of game.towers) tower(item);
  ctx.fillStyle = '#241d30'; ctx.fillRect(0, FLOOR, WIDTH, HEIGHT - FLOOR);
  ctx.fillStyle = '#88604c'; ctx.fillRect(0, FLOOR, WIDTH, 2);
  for (const [x, size] of [[70, 14], [109, 11], [825, 13], [858, 18]]) pumpkin(x, FLOOR - size * .7, size);
  const idle = game.status === 'ready';
  const idleY = canvas.clientWidth < 650 ? 120 : 160;
  bat(idle ? WIDTH / 2 : BAT_X, idle ? idleY + Math.sin(time * 2) * 6 : game.y, time,
    idle ? 0 : Math.max(-.3, Math.min(.65, game.velocity / 850)), idle ? 1.18 : 1);
}

function frame(timestamp) {
  const dt = lastTime === undefined ? 0 : Math.min((timestamp - lastTime) / 1000, .05);
  lastTime = timestamp;
  if (game.status === 'running') {
    accumulator += dt;
    while (accumulator >= 1 / 120 && game.status === 'running') {
      const previousScore = game.score;
      game = advance(game, 1 / 120);
      accumulator -= 1 / 120;
      if (game.status !== 'running') { sync(); play.focus({ preventScroll: true }); }
      else if (game.score !== previousScore) score.textContent = String(game.score).padStart(2, '0');
    }
  } else accumulator = 0;
  if (game.status !== 'paused' && game.status !== 'over') sceneryTime += dt;
  draw(sceneryTime);
  requestAnimationFrame(frame);
}
sync();
requestAnimationFrame(frame);
