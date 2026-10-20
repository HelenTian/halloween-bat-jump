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

// Record a finished round. Re-read the stored best first, so a second tab that
// loaded an older value can never lower a higher best saved by another tab.
// Returns the best score after this round.
export function recordBest(storage, score) {
  const stored = loadBest(storage);
  if (score <= stored) return stored;
  try { storage?.setItem(BEST_KEY, String(stored)); } catch { /* keep playing without persistence */ }
  return score;
}
