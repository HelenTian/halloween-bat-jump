export const BEST_KEY = 'bat-jump-best';

// Storage can be missing or throw (private mode, blocked cookies), so every access is guarded.
export function loadBest(storage) {
  try {
    const value = Number.parseInt(storage?.getItem(BEST_KEY), 10);
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function recordBest(storage, best, score) {
  if (score <= best) return best;
  try { storage?.setItem(BEST_KEY, String(score)); } catch { /* keep playing without persistence */ }
  return score;
}
