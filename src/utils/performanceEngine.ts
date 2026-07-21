
import { getBenchmark, getRoleWeights, type RoleBenchmark } from './benchmarks';
import {
  trimmedMean,
  weightedMean,
  exponentialDecayWeights,
  coefficientOfVariation,
  bayesianShrinkage,
  sampleConfidence,
  estimatePercentile,
  clamp,
} from './statistics';
import { globalBenchmarkProvider } from './benchmarkProvider';
import { AnalysisContext } from '../types';


export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY" | "UNKNOWN";

export interface MatchDataInput {
  matchId: string;
  win: boolean;
  position: Position;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  totalCS: number;
  csPerMin: number;
  damageToChampions: number;
  damageShare: number;
  killParticipation: number;
  visionScore: number;
  visionScorePerMin: number;
  wardsPlaced: number;
  wardsKilled: number;
  goldEarned: number;
  goldShare: number;
  objectiveDamage: number;
  objectiveDamagePerMin: number;
  gameDurationMinutes: number;
  teamAverageScore?: number;
  enemyAverageScore?: number;
}

export interface ComputePerformanceInput {
  currentTier: string;
  currentDivision: string;
  currentLP: number;
  overallWinrate: number;
  matches: MatchDataInput[];

  region?: string;
  queueId?: number;
  patch?: string;
  role?: string;
}

export interface MatchPerformance {
  matchId: string;
  playerScore: number;
  teamAverageScore: number;
  enemyAverageScore: number;
}

export interface AccountHealth {
  status: "SMURFING" | "CARRYING" | "BALANCED" | "CARRIED" | "LOSERS_Q";
  teamStrengthIndex: number;
  explanation: string;
}

export interface PerformanceRank {
  tier: string;
  division: string;
  points: number;
  averageScore: number;
  consistency: number;
  consistencyScore: number;
  accountHealth: AccountHealth;
  matchPerformances: MatchPerformance[];
  explanation: string;
  classificationConfidence?: number;
  probabilities?: Array<{ tier: string; probability: number }>;
  explainabilityText?: string;
}


const TIER_THRESHOLDS: Record<string, number> = {
  "IRON": 0,
  "BRONZE": 400,
  "SILVER": 800,
  "GOLD": 1200,
  "PLATINUM": 1600,
  "EMERALD": 2000,
  "DIAMOND": 2400,
  "MASTER": 2800,
  "GRANDMASTER": 3000,
  "CHALLENGER": 3200,
};

const DIVISIONS = ["IV", "III", "II", "I"];

function getPointsFromRank(tier: string, division: string, lp: number): number {
  const t = tier.toUpperCase();
  const d = division.toUpperCase();
  const base = TIER_THRESHOLDS[t] !== undefined ? TIER_THRESHOLDS[t] : 1200;

  if (t === "MASTER" || t === "GRANDMASTER" || t === "CHALLENGER") {
    return base + lp;
  }

  const divIndex = DIVISIONS.indexOf(d);
  const divPoints = divIndex !== -1 ? divIndex * 100 : 0;
  return base + divPoints + lp;
}

function getRankFromPoints(points: number): { tier: string; division: string } {
  const p = clamp(points, 0, 4000);
  if (p >= 3200) return { tier: "CHALLENGER", division: "I" };
  if (p >= 3000) return { tier: "GRANDMASTER", division: "I" };
  if (p >= 2800) return { tier: "MASTER", division: "I" };

  let currentTier = "IRON";
  let basePoints = 0;

  for (const [t, thresh] of Object.entries(TIER_THRESHOLDS)) {
    if (thresh <= p && thresh < 2800) {
      currentTier = t;
      basePoints = thresh;
    }
  }

  const remainder = p - basePoints;
  const divIndex = clamp(Math.floor(remainder / 100), 0, 3);
  return { tier: currentTier, division: DIVISIONS[divIndex] };
}

export function calculateMatchScore(match: MatchDataInput, playerTier: string = 'GOLD'): number {
  const role = match.position === 'UNKNOWN' ? 'MIDDLE' : match.position;
  const benchmark = getBenchmark(playerTier, role);
  const roleWeights = getRoleWeights(role);

  const scoreMetric = (val: number, benchmarkMedian: number): number => {
    if (benchmarkMedian <= 0) return 50;
    const ratio = val / benchmarkMedian;

    return clamp(100 * (1 - Math.exp(-ratio * 0.9)), 0, 100);
  };

  const kdaRatio = (match.kills + match.assists) / Math.max(1, match.deaths);

  const laningScore = match.position === 'JUNGLE'
    ? scoreMetric(match.objectiveDamagePerMin, benchmark.objectiveDmgPerMin.median)
    : scoreMetric(match.csPerMin, benchmark.csPerMin.median);

  const farmingScore = scoreMetric(match.csPerMin, benchmark.csPerMin.median);
  const objectiveScore = scoreMetric(match.objectiveDamagePerMin, benchmark.objectiveDmgPerMin.median);
  const combatScore = scoreMetric(kdaRatio, benchmark.kda.median);

  const teamfightScore = (
    scoreMetric(match.damageToChampions / Math.max(1, match.gameDurationMinutes), benchmark.damagePerMin.median) * 0.5 +
    scoreMetric(match.killParticipation * 100, benchmark.kp.median) * 0.5
  );

  const visionScore = scoreMetric(match.visionScorePerMin, benchmark.visionPerMin.median);

  const totalWeight = roleWeights.laning + roleWeights.farming + roleWeights.objectives +
    roleWeights.combat + roleWeights.teamfight + roleWeights.vision;

  let score = (
    laningScore * roleWeights.laning +
    farmingScore * roleWeights.farming +
    objectiveScore * roleWeights.objectives +
    combatScore * roleWeights.combat +
    teamfightScore * roleWeights.teamfight +
    visionScore * roleWeights.vision
  ) / totalWeight;

  if (match.kills >= 5 && match.deaths <= 2) score += 3;

  if (match.deaths > 8) {
    score -= (match.deaths - 8) * 1.5;
  }

  if (match.win) score += 2;

  return clamp(score, 0, 100);
}

export function calculateMatchPillarScores(
  match: MatchDataInput,
  playerTier: string = 'GOLD'
): { laning: number; farming: number; objectives: number; combat: number; teamfight: number; vision: number; total: number } {
  const role = match.position === 'UNKNOWN' ? 'MIDDLE' : match.position;
  const benchmark = getBenchmark(playerTier, role);

  const scoreMetric = (val: number, benchmarkMedian: number): number => {
    if (benchmarkMedian <= 0) return 50;
    const ratio = val / benchmarkMedian;
    return clamp(100 * (1 - Math.exp(-ratio * 0.9)), 0, 100);
  };

  const kdaRatio = (match.kills + match.assists) / Math.max(1, match.deaths);
  const dpm = match.damageToChampions / Math.max(1, match.gameDurationMinutes);

  const laning = match.position === 'JUNGLE'
    ? scoreMetric(match.objectiveDamagePerMin, benchmark.objectiveDmgPerMin.median)
    : scoreMetric(match.csPerMin, benchmark.csPerMin.median);
  const farming = scoreMetric(match.csPerMin, benchmark.csPerMin.median);
  const objectives = scoreMetric(match.objectiveDamagePerMin, benchmark.objectiveDmgPerMin.median);
  const combat = scoreMetric(kdaRatio, benchmark.kda.median);
  const teamfight = scoreMetric(dpm, benchmark.damagePerMin.median) * 0.5 +
    scoreMetric(match.killParticipation * 100, benchmark.kp.median) * 0.5;
  const vision = scoreMetric(match.visionScorePerMin, benchmark.visionPerMin.median);

  const total = calculateMatchScore(match, playerTier);

  return {
    laning: clamp(laning, 0, 100),
    farming: clamp(farming, 0, 100),
    objectives: clamp(objectives, 0, 100),
    combat: clamp(combat, 0, 100),
    teamfight: clamp(teamfight, 0, 100),
    vision: clamp(vision, 0, 100),
    total,
  };
}

export function calculateConsistencyScore(scores: number[]): number {
  if (scores.length < 3) return 50; // Not enough data
  const cv = coefficientOfVariation(scores);
  return clamp(100 - cv * 120, 0, 100);
}

function calculateGaussianLogPDF(x: number, mean: number, std: number): number {
  const sigma = std && !isNaN(std) && std > 0 ? std : Math.max(0.05, mean * 0.15);
  const variance = sigma * sigma;
  const exponent = -((x - mean) * (x - mean)) / (2 * variance);
  return -Math.log(sigma * Math.sqrt(2 * Math.PI)) + exponent;
}

function normalCDF(x: number, mean: number, std: number): number {
  const sigma = std && !isNaN(std) && std > 0 ? std : Math.max(0.05, mean * 0.15);
  const z = (x - mean) / sigma;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.39894228 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const cdfVal = z >= 0 ? 1 - p : p;
  return clamp(cdfVal, 0.001, 0.999);
}

export function computePerformanceRank(input: ComputePerformanceInput): PerformanceRank {
  const { currentTier, currentDivision, currentLP, matches } = input;

  if (matches.length === 0) {
    return {
      tier: currentTier,
      division: currentDivision,
      points: 0,
      averageScore: 0,
      consistency: 0,
      consistencyScore: 50,
      accountHealth: {
        status: "BALANCED",
        teamStrengthIndex: 0.5,
        explanation: "Partidas insuficientes para análise."
      },
      matchPerformances: [],
      explanation: "Sem dados de partida disponíveis.",
      classificationConfidence: 1.0,
      probabilities: [{ tier: currentTier, probability: 1.0 }],
      explainabilityText: "Sem dados suficientes para avaliar o elo."
    };
  }

  const matchPerformances: MatchPerformance[] = [];
  const scores: number[] = [];
  let strongerTeamCount = 0;

  for (const m of matches) {
    const playerScore = calculateMatchScore(m, currentTier);
    const teamAvg = m.teamAverageScore ?? (m.win ? clamp(playerScore - 5, 40, 100) : clamp(playerScore + 5, 20, 80));
    const enemyAvg = m.enemyAverageScore ?? (m.win ? clamp(teamAvg - 10, 20, 90) : clamp(teamAvg + 10, 40, 100));

    matchPerformances.push({
      matchId: m.matchId,
      playerScore,
      teamAverageScore: teamAvg,
      enemyAverageScore: enemyAvg
    });

    scores.push(playerScore);
    if (teamAvg > enemyAvg) {
      strongerTeamCount++;
    }
  }

  const recencyWeights = exponentialDecayWeights(scores.length, 10);
  const averageScore = weightedMean(
    scores.map(s => clamp(s, trimmedMean(scores) - 25, trimmedMean(scores) + 25)),
    recencyWeights
  );

  const priorScore = 50;
  const confidence = sampleConfidence(matches.length);
  const adjustedScore = bayesianShrinkage(averageScore, priorScore, matches.length, 8);

  const consistency = calculateConsistencyScore(scores);
  const consistencyScoreValue = consistency;

  const teamStrengthIndex = strongerTeamCount / matches.length;
  let healthStatus: AccountHealth["status"] = "BALANCED";
  let healthExp = "Suas partidas tiveram equipes relativamente equilibradas.";

  if (teamStrengthIndex > 0.65) {
    healthStatus = "CARRIED";
    healthExp = "Frequentemente colocado em equipes que superam naturalmente o adversário.";
  } else if (teamStrengthIndex < 0.35) {
    healthStatus = "LOSERS_Q";
    healthExp = "Frequentemente colocado em equipes mais fracas. Matchmaking desfavorável.";
  } else if (adjustedScore >= 75 && teamStrengthIndex <= 0.5) {
    healthStatus = "CARRYING";
    healthExp = "Você é a condição de vitória. Seu desempenho individual se destaca.";
  } else if (adjustedScore >= 85) {
    healthStatus = "SMURFING";
    healthExp = "Seu desempenho eclipsa fortemente o seu elo atual.";
  }

  const accountHealth: AccountHealth = {
    status: healthStatus,
    teamStrengthIndex,
    explanation: healthExp,
  };

  let currentPoints = getPointsFromRank(currentTier, currentDivision, currentLP);
  const scoreDiff = adjustedScore - 50;
  let mmrOffset = scoreDiff * 5.0;

  if (healthStatus === "LOSERS_Q" || healthStatus === "CARRYING") {
    mmrOffset += 50;
  } else if (healthStatus === "CARRIED") {
    mmrOffset -= 50;
  }

  const performancePoints = clamp(currentPoints + mmrOffset, 0, 4000);

  const TIERS = [
    'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
    'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER'
  ];

  const RANK_LABELS: Record<string, string> = {
    IRON: "Ferro",
    BRONZE: "Bronze",
    SILVER: "Prata",
    GOLD: "Ouro",
    PLATINUM: "Platina",
    EMERALD: "Esmeralda",
    DIAMOND: "Diamante",
    MASTER: "Mestre",
    GRANDMASTER: "Grão-Mestre",
    CHALLENGER: "Desafiante"
  };

  const resolvedRole = input.role || (() => {
    const roles = matches.map(m => m.position).filter(p => p && p !== 'UNKNOWN');
    if (roles.length === 0) return 'MIDDLE';
    const counts: Record<string, number> = {};
    let maxRole = 'MIDDLE';
    let maxCount = 0;
    for (const r of roles) {
      counts[r] = (counts[r] || 0) + 1;
      if (counts[r] > maxCount) {
        maxCount = counts[r];
        maxRole = r;
      }
    }
    return maxRole;
  })();

  const mapPositionToRole = (pos: string): string => {
    const p = pos.toUpperCase();
    if (p === 'BOTTOM' || p === 'ADC') return 'BOTTOM';
    if (p === 'UTILITY' || p === 'SUPPORT' || p === 'SUP') return 'UTILITY';
    if (p === 'MIDDLE' || p === 'MID') return 'MIDDLE';
    if (p === 'JUNGLE' || p === 'JG') return 'JUNGLE';
    return 'TOP';
  };
  const roleKey = mapPositionToRole(resolvedRole);

  const resolvedRegion = input.region || "BR1";
  const resolvedQueueId = input.queueId || 420;
  const resolvedPatch = input.patch || "15.14";

  const playerCSValues = matches.map(m => m.csPerMin);
  const playerKDARatios = matches.map(m => (m.kills + m.assists) / Math.max(1, m.deaths));
  const playerVisionValues = matches.map(m => m.visionScorePerMin);
  const playerDPMValues = matches.map(m => m.damageToChampions / Math.max(1, m.gameDurationMinutes));
  const playerGPMValues = matches.map(m => m.goldEarned / Math.max(1, m.gameDurationMinutes));
  const playerKPValues = matches.map(m => m.killParticipation * 100);
  const playerObjDmgValues = matches.map(m => m.objectiveDamagePerMin);

  const playerCS = trimmedMean(playerCSValues);
  const playerKDA = trimmedMean(playerKDARatios);
  const playerVision = trimmedMean(playerVisionValues);
  const playerDPM = trimmedMean(playerDPMValues);
  const playerGPM = trimmedMean(playerGPMValues);
  const playerKP = trimmedMean(playerKPValues);
  const playerObjective = trimmedMean(playerObjDmgValues);

  const actualIdx = TIERS.indexOf(currentTier.toUpperCase()) !== -1
    ? TIERS.indexOf(currentTier.toUpperCase())
    : 3;

  const priorSigma = 1.5;
  const rawPriors = TIERS.map((_, i) => {
    const diff = i - actualIdx;
    return Math.exp(-(diff * diff) / (2 * priorSigma * priorSigma));
  });
  const sumPriors = rawPriors.reduce((sum, val) => sum + val, 0);
  const priorProb = rawPriors.map(p => p / (sumPriors || 1));

  const N = matches.length;
  const alpha = clamp(0.1 + (N / 40) * 0.8, 0.1, 0.9);

  const logPosteriors = TIERS.map((tier, i) => {
    const queryContext: AnalysisContext = {
      region: resolvedRegion,
      queueId: resolvedQueueId,
      patch: resolvedPatch,
      tier,
      division: "I",
      role: roleKey
    };
    const benchmark = globalBenchmarkProvider.getRoleBenchmark(queryContext);

    let logLikelihood = 0;
    logLikelihood += calculateGaussianLogPDF(playerCS, benchmark.csPerMin.median, benchmark.csPerMin.std);
    logLikelihood += calculateGaussianLogPDF(playerKDA, benchmark.kda.median, benchmark.kda.std);
    logLikelihood += calculateGaussianLogPDF(playerVision, benchmark.visionPerMin.median, benchmark.visionPerMin.std);
    logLikelihood += calculateGaussianLogPDF(playerDPM, benchmark.damagePerMin.median, benchmark.damagePerMin.std);
    logLikelihood += calculateGaussianLogPDF(playerGPM, benchmark.goldPerMin.median, benchmark.goldPerMin.std);
    logLikelihood += calculateGaussianLogPDF(playerKP, benchmark.kp.median, benchmark.kp.std);
    logLikelihood += calculateGaussianLogPDF(playerObjective, benchmark.objectiveDmgPerMin.median, benchmark.objectiveDmgPerMin.std);

    const consistencyScaling = clamp(0.5 + (consistency / 100) * 0.5, 0.5, 1.0);
    logLikelihood *= consistencyScaling;

    return (1 - alpha) * Math.log(priorProb[i] || 0.0001) + alpha * logLikelihood;
  });

  const maxLog = Math.max(...logPosteriors);
  const exps = logPosteriors.map(lp => Math.exp(lp - maxLog));
  const sumExps = exps.reduce((sum, val) => sum + val, 0);
  const probabilities = exps.map(e => e / (sumExps || 1));
  const tierProbs = TIERS.map((tier, idx) => ({ tier, probability: probabilities[idx], idx }));
  tierProbs.sort((a, b) => b.probability - a.probability);

  let winningIdx = tierProbs[0].idx;
  let winningTier = tierProbs[0].tier;
  const confidenceVal = tierProbs[0].probability;

  if (tierProbs.length > 1 && (tierProbs[0].probability - tierProbs[1].probability) < 0.05) {
    const t1Dist = Math.abs(tierProbs[0].idx - actualIdx);
    const t2Dist = Math.abs(tierProbs[1].idx - actualIdx);
    if (t2Dist < t1Dist) {
      winningIdx = tierProbs[1].idx;
      winningTier = tierProbs[1].tier;
    }
  }

  const winningBenchmark = globalBenchmarkProvider.getRoleBenchmark({
    region: resolvedRegion,
    queueId: resolvedQueueId,
    patch: resolvedPatch,
    tier: winningTier,
    division: "I",
    role: roleKey
  });

  const percentiles = [
    normalCDF(playerCS, winningBenchmark.csPerMin.median, winningBenchmark.csPerMin.std),
    normalCDF(playerKDA, winningBenchmark.kda.median, winningBenchmark.kda.std),
    normalCDF(playerVision, winningBenchmark.visionPerMin.median, winningBenchmark.visionPerMin.std),
    normalCDF(playerDPM, winningBenchmark.damagePerMin.median, winningBenchmark.damagePerMin.std),
    normalCDF(playerGPM, winningBenchmark.goldPerMin.median, winningBenchmark.goldPerMin.std),
    normalCDF(playerKP, winningBenchmark.kp.median, winningBenchmark.kp.std),
    normalCDF(playerObjective, winningBenchmark.objectiveDmgPerMin.median, winningBenchmark.objectiveDmgPerMin.std),
  ];
  const averagePercentile = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;

  const winningDivision = ['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(winningTier)
    ? ""
    : (averagePercentile < 0.25 ? "IV" : averagePercentile < 0.50 ? "III" : averagePercentile < 0.75 ? "II" : "I");

  const metricKeys = ["Farm", "KDA", "Visão", "Dano", "Ouro", "Participação", "Objetivos"];
  let maxPct = -1;
  let minPct = 2;
  let strongestMetric = "";
  let weakestMetric = "";
  for (let idx = 0; idx < percentiles.length; idx++) {
    if (percentiles[idx] > maxPct) {
      maxPct = percentiles[idx];
      strongestMetric = metricKeys[idx];
    }
    if (percentiles[idx] < minPct) {
      minPct = percentiles[idx];
      weakestMetric = metricKeys[idx];
    }
  }

  const explainabilityText = `Seu perfil estatístico tem alta aderência com o elo ${RANK_LABELS[winningTier] || winningTier}. Seu desempenho em ${strongestMetric} se destaca como o seu ponto forte, enquanto ${weakestMetric} é sua principal área de melhoria.`;

  return {
    tier: winningTier,
    division: winningDivision,
    points: performancePoints,
    averageScore: adjustedScore,
    consistency: consistencyScoreValue,
    consistencyScore: consistencyScoreValue,
    accountHealth,
    matchPerformances,
    explanation: `Score médio: ${adjustedScore.toFixed(1)} (confiança: ${(confidence * 100).toFixed(0)}%). ` +
      `Consistência: ${consistencyScoreValue.toFixed(0)}/100. ` +
      `Elo classificado: ${winningTier} ${winningDivision}.`,
    classificationConfidence: confidenceVal,
    probabilities: tierProbs.map(tp => ({ tier: tp.tier, probability: tp.probability })),
    explainabilityText
  };
}
