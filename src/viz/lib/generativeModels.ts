// Shared math for the GAN & Diffusion diagrams: a real toy 1D GAN
// convergence simulation (generator distribution closing on real data,
// discriminator's decision curve flattening toward 0.5 as it does) and a
// real DDPM-style linear noise schedule (alpha_bar_t and the forward
// process x_t = sqrt(alpha_bar_t) x0 + sqrt(1-alpha_bar_t) epsilon).
import { gaussianPdf } from './probstat';
import { sigmoid } from './calculus';

export const GAN_REAL_MU = 3;
export const GAN_REAL_SIGMA = 0.8;
export const GAN_GEN_MU0 = -2;
export const GAN_GEN_SIGMA0 = 1.6;

/** Generator distribution at a given fraction of training (0..1) --
 * its mean and spread close on the real distribution's linearly. */
export function generatorParams(progress: number): { mu: number; sigma: number } {
  return {
    mu: GAN_GEN_MU0 + (GAN_REAL_MU - GAN_GEN_MU0) * progress,
    sigma: GAN_GEN_SIGMA0 + (GAN_REAL_SIGMA - GAN_GEN_SIGMA0) * progress,
  };
}

/** Discriminator's real-vs-fake decision curve at a given training
 * progress -- a logistic boundary whose steepness decays toward 0 as the
 * generator's distribution converges on the real one, matching the
 * theoretical result that D(x) -> 0.5 everywhere at the Nash equilibrium. */
export function discriminatorCurve(x: number, progress: number): number {
  const boundary = (GAN_REAL_MU + (GAN_GEN_MU0 + (GAN_REAL_MU - GAN_GEN_MU0) * progress)) / 2;
  const steepness = 3 * (1 - progress);
  return sigmoid(steepness * (x - boundary));
}

export function ganRealPdf(x: number): number {
  return gaussianPdf(x, GAN_REAL_MU, GAN_REAL_SIGMA);
}
export function ganGenPdf(x: number, progress: number): number {
  const { mu, sigma } = generatorParams(progress);
  return gaussianPdf(x, mu, sigma);
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fixed toy "signal" standing in for an image's pixel values --
 * structured (a smooth bump), not noise, so the forward process visibly
 * destroys structure as t increases. */
export function toySignal(n: number): number[] {
  return Array.from({ length: n }, (_, i) => Math.sin((i / n) * Math.PI));
}

/** Fixed, seeded standard-normal noise the same length as the signal --
 * sampled once (Box-Muller) so every t reveals the same underlying noise
 * draw, just scaled differently by the schedule. */
export function fixedNoise(n: number, seed = 7): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: n }, () => {
    const u1 = Math.max(rand(), 1e-9);
    const u2 = rand();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  });
}

/** Linear beta schedule (DDPM's original choice): beta_t ramps linearly
 * from beta1 to betaT across T steps. Returns alpha_bar_t = prod(1-beta_k)
 * for k=1..t -- the cumulative fraction of original signal retained. */
export function alphaBarSchedule(T: number, beta1 = 1e-4, betaT = 0.02): number[] {
  const alphaBars: number[] = [];
  let cum = 1;
  for (let t = 1; t <= T; t++) {
    const beta = beta1 + ((betaT - beta1) * (t - 1)) / (T - 1);
    cum *= 1 - beta;
    alphaBars.push(cum);
  }
  return alphaBars;
}

/** The real DDPM forward-process closed form: x_t from x_0 and a fixed
 * noise draw, at a given alpha_bar_t. */
export function forwardDiffuse(x0: number[], noise: number[], alphaBarT: number): number[] {
  const a = Math.sqrt(alphaBarT);
  const b = Math.sqrt(1 - alphaBarT);
  return x0.map((v, i) => a * v + b * noise[i]);
}
