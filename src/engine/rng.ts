export function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}

export function nextSeed(seed: number): number {
  return (Math.imul(seed, 1664525) + 1013904223) >>> 0;
}

export function randomFloat(seed: number): { seed: number; value: number } {
  const next = nextSeed(seed);
  return { seed: next, value: next / 0x100000000 };
}

export function randomInt(seed: number, maxExclusive: number): { seed: number; value: number } {
  const roll = randomFloat(seed);
  return {
    seed: roll.seed,
    value: Math.floor(roll.value * Math.max(1, maxExclusive))
  };
}

export function shuffleWithSeed<T>(items: T[], seed: number): { items: T[]; seed: number } {
  const shuffled = [...items];
  let currentSeed = seed;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const roll = randomInt(currentSeed, index + 1);
    currentSeed = roll.seed;
    [shuffled[index], shuffled[roll.value]] = [shuffled[roll.value], shuffled[index]];
  }
  return { items: shuffled, seed: currentSeed };
}
