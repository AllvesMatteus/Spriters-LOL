
export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * clamp(t, 0, 1);

export const sortedCopy = (values: number[]): number[] =>
  [...values].sort((a, b) => a - b);


export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = sortedCopy(values);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function trimmedMean(values: number[], trimFraction = 0.1): number {
  if (values.length === 0) return 0;
  if (values.length < 5) return median(values);

  const sorted = sortedCopy(values);
  const trimCount = Math.floor(sorted.length * trimFraction);

  if (sorted.length - 2 * trimCount < 3) return mean(values);

  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  return mean(trimmed);
}

export function winsorizedMean(values: number[], trimFraction = 0.1): number {
  if (values.length === 0) return 0;
  if (values.length < 5) return median(values);

  const sorted = sortedCopy(values);
  const trimCount = Math.floor(sorted.length * trimFraction);

  if (trimCount === 0) return mean(sorted);

  const lowerBound = sorted[trimCount];
  const upperBound = sorted[sorted.length - 1 - trimCount];

  const winsorized = sorted.map(v =>
    v < lowerBound ? lowerBound : v > upperBound ? upperBound : v
  );
  return mean(winsorized);
}

export function weightedMean(values: number[], weights: number[]): number {
  if (values.length === 0 || weights.length === 0) return 0;
  const len = Math.min(values.length, weights.length);
  let sumWeightedValues = 0;
  let sumWeights = 0;
  for (let i = 0; i < len; i++) {
    sumWeightedValues += values[i] * weights[i];
    sumWeights += weights[i];
  }
  return sumWeights > 0 ? sumWeightedValues / sumWeights : 0;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const sumSqDiff = values.reduce((acc, v) => acc + (v - avg) ** 2, 0);
  return Math.sqrt(sumSqDiff / values.length);
}

export function variance(values: number[]): number {
  const sd = standardDeviation(values);
  return sd * sd;
}
export function coefficientOfVariation(values: number[]): number {
  const avg = mean(values);
  if (avg === 0) return 0;
  return standardDeviation(values) / Math.abs(avg);
}

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = sortedCopy(values);
  const pClamped = clamp(p, 0, 100);

  if (sorted.length === 1) return sorted[0];

  const index = (pClamped / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const frac = index - lower;

  return sorted[lower] + frac * (sorted[upper] - sorted[lower]);
}

export function quartiles(values: number[]): { q1: number; median: number; q3: number } {
  return {
    q1: percentile(values, 25),
    median: percentile(values, 50),
    q3: percentile(values, 75),
  };
}

export function iqr(values: number[]): number {
  const q = quartiles(values);
  return q.q3 - q.q1;
}

export function mad(values: number[]): number {
  if (values.length === 0) return 0;
  const med = median(values);
  const absDeviations = values.map(v => Math.abs(v - med));
  return median(absDeviations);
}

export function bayesianShrinkage(
  observed: number,
  prior: number,
  sampleSize: number,
  priorWeight = 8
): number {
  return (priorWeight * prior + sampleSize * observed) / (priorWeight + sampleSize);
}

export function sampleConfidence(sampleSize: number): number {
  return clamp(1 - Math.exp(-sampleSize / 7), 0, 1);
}

export function exponentialDecayWeights(count: number, halfLife = 10): number[] {
  const weights: number[] = [];
  const lambda = Math.LN2 / halfLife;
  for (let i = 0; i < count; i++) {
    weights.push(Math.exp(-lambda * i));
  }
  return weights;
}

export function normalCDF(x: number, mu: number, sigma: number): number {
  if (sigma <= 0) return x >= mu ? 1 : 0;

  const z = (x - mu) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327; // 1/√(2π)
  const p =
    d *
    Math.exp((-z * z) / 2) *
    (t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429)))));

  return z >= 0 ? 1 - p : p;
}
export function estimatePercentile(
  value: number,
  distributionMedian: number,
  distributionStd: number
): number {
  if (distributionStd <= 0) return 50;
  return clamp(normalCDF(value, distributionMedian, distributionStd) * 100, 0, 100);
}
