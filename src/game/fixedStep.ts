// Rendering rate must not change the integration rate. A resumed background tab
// advances at most maxFrame seconds so it cannot trigger a long catch-up freeze.
export function createFixedStepper(step = 1 / 60, maxFrame = 0.25) {
  let accumulator = 0;
  return {
    advance(elapsed: number, update: (dt: number) => void): number {
      if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
      accumulator += Math.min(elapsed, maxFrame);
      let count = 0;
      while (accumulator + 1e-12 >= step) {
        update(step);
        accumulator = Math.max(0, accumulator - step);
        count++;
      }
      return count;
    },
    reset() { accumulator = 0; },
  };
}
