// Mulberry32 - fast, simple seeded PRNG
export function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Get current date in EST timezone
export function getESTDate(): Date {
  const now = new Date();
  // Create formatter for EST timezone
  const estString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(estString);
}

// Generate a seed from a date (YYYYMMDD format)
export function getDateSeed(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return year * 10000 + month * 100 + day;
}

// Get today's puzzle seed (based on EST)
export function getTodaysPuzzleSeed(): number {
  return getDateSeed(getESTDate());
}

// Get formatted date string for display
export function getESTDateString(): string {
  const date = getESTDate();
  return date.toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });
}

// Calculate puzzle number (days since launch)
export function getPuzzleNumber(): number {
  const launchDate = new Date('2026-01-06'); // Today's date as launch
  const estDate = getESTDate();
  const diffTime = estDate.getTime() - launchDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays + 1);
}
