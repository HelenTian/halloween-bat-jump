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

// Record a finished round and return the best score to show. Re-read the stored value
// first: another tab may have saved a higher best since this one loaded, and a stale
// tab must never lower it. `best` is this tab's in-memory value (used when storage is unavailable).
export function recordBest(storage, best, score) {
  const known = Math.max(best, loadBest(storage));
  if (score <= known) return known;
  try { storage?.setItem(BEST_KEY, String(score)); } catch { /* keep playing without persistence */ }
  return score;
}
