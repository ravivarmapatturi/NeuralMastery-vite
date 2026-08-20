// Real discrete-step simulation of static vs. continuous batching for LLM
// serving: static batching can't return ANY response in a batch until the
// longest sequence in it finishes; continuous batching frees a slot (and
// admits a new waiting request into it) the instant any one sequence
// completes. Real per-request completion times for both strategies.

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRequestLengths(n: number, seed: number): number[] {
  const rand = mulberry32(seed);
  // Real, realistic shape: most responses short, some genuinely long.
  return Array.from({ length: n }, () => Math.round(5 + rand() * 5 + (rand() < 0.2 ? rand() * 40 : 0)));
}

export function simulateStaticBatching(lengths: number[], batchSize: number) {
  const completionTimes: number[] = [];
  let clock = 0;
  for (let i = 0; i < lengths.length; i += batchSize) {
    const batch = lengths.slice(i, i + batchSize);
    const batchDuration = Math.max(...batch); // blocked until the longest sequence finishes
    clock += batchDuration;
    for (let j = 0; j < batch.length; j++) completionTimes.push(clock);
  }
  return completionTimes;
}

export function simulateContinuousBatching(lengths: number[], batchSize: number) {
  const n = lengths.length;
  const completionTimes: number[] = new Array(n).fill(0);
  const remaining: (number | null)[] = new Array(batchSize).fill(null); // remaining tokens per active slot
  const slotRequestId: (number | null)[] = new Array(batchSize).fill(null);
  let nextToAdmit = 0;
  let clock = 0;

  // Fill initial slots
  for (let s = 0; s < batchSize && nextToAdmit < n; s++) {
    remaining[s] = lengths[nextToAdmit];
    slotRequestId[s] = nextToAdmit;
    nextToAdmit++;
  }

  while (slotRequestId.some((id) => id !== null)) {
    clock += 1; // one real generation step -- every active slot produces one token
    for (let s = 0; s < batchSize; s++) {
      if (slotRequestId[s] === null) continue;
      remaining[s] = (remaining[s] as number) - 1;
      if (remaining[s] === 0) {
        completionTimes[slotRequestId[s] as number] = clock;
        if (nextToAdmit < n) {
          remaining[s] = lengths[nextToAdmit];
          slotRequestId[s] = nextToAdmit;
          nextToAdmit++;
        } else {
          slotRequestId[s] = null;
        }
      }
    }
  }
  return completionTimes;
}
