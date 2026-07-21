import {
  MatchData, SummonerData, RankStats, RANK_AVERAGES,
  PerformanceScores, MatchPerformanceData, OverallPerformanceData,
  RANKS_POINTS, EnhancedPerformanceData, MetricDistribution,
  PillarScore, ImprovementPriority, AnalysisContext, SemanticState
} from "../types";
import {
  computePerformanceRank, calculateMatchScore, calculateMatchPillarScores,
  calculateConsistencyScore, MatchDataInput, Position
} from "./performanceEngine";
import { getBenchmark, getRoleWeights, type RoleBenchmark, type MetricBenchmark } from "./benchmarks";
import {
  trimmedMean, weightedMean, exponentialDecayWeights,
  bayesianShrinkage, sampleConfidence, estimatePercentile,
  clamp, median as statMedian
} from "./statistics";
import { globalBenchmarkProvider } from "./benchmarkProvider";
import { globalPillarRegistry } from "./compositePerformance";

export const getWinRate = (data?: any) => {
  if (!data) return 0;
  const total = data.wins + data.losses;
  return total > 0 ? Math.round((data.wins / total) * 100) : 0;
};

export const getInitialTargetRank = (tier: string) => {
  const ranks = ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];
  const upper = tier?.toUpperCase() || "UNRANKED";
  if (upper === "UNRANKED") return "GOLD";

  const idx = ranks.indexOf(upper);
  if (idx === -1) return "GOLD";
  if (idx === ranks.length - 1) return ranks[idx];
  return ranks[idx + 1];
};

export const getAdjustedTargetStats = (targetRank: string, lane: string = "UNKNOWN"): RankStats => {
  const role = lane === "UNKNOWN" || !lane ? "MIDDLE" : lane;
  const benchmark = getBenchmark(targetRank, role);
  const fallback = RANK_AVERAGES[targetRank] || RANK_AVERAGES.GOLD;

  return {
    tier: targetRank,
    displayName: fallback.displayName,
    csPerMin: Number(benchmark.csPerMin.median.toFixed(1)),
    kda: Number(benchmark.kda.median.toFixed(2)),
    visionScore: Number((benchmark.visionPerMin.median * 30).toFixed(1)), // Approx vision score for a 30-min game
    visionPerMin: Number(benchmark.visionPerMin.median.toFixed(2)),
    damagePerMin: Number(benchmark.damagePerMin.median.toFixed(0)),
    goldPerMin: Number(benchmark.goldPerMin.median.toFixed(0)),
    kp: Number(benchmark.kp.median.toFixed(0)),
    lane: role,
  };
};

export const calculateUserStats = (matches: MatchData[], summoner: SummonerData | null): RankStats => {
  if (!matches.length || !summoner) return RANK_AVERAGES.IRON;

  const perMatch = {
    csPerMin: [] as number[],
    kda: [] as number[],
    visionScore: [] as number[],
    visionPerMin: [] as number[],
    damagePerMin: [] as number[],
    goldPerMin: [] as number[],
    kp: [] as number[],
  };
  const laneCounts: Record<string, number> = {};

  matches.forEach((match) => {
    const p = match.info.participants.find((p) => p.puuid === summoner.account.puuid);
    if (!p) return;

    const durationMin = Math.max(1, match.info.gameDuration / 60);
    const cs = p.totalMinionsKilled + p.neutralMinionsKilled;
    const teamKills = Math.max(1, match.info.participants
      .filter(tp => tp.teamId === p.teamId)
      .reduce((acc, tp) => acc + tp.kills, 0));

    perMatch.csPerMin.push(cs / durationMin);
    perMatch.kda.push((p.kills + p.assists) / Math.max(1, p.deaths));
    perMatch.visionScore.push(p.visionScore);
    perMatch.visionPerMin.push(p.visionScore / durationMin);
    perMatch.damagePerMin.push(p.totalDamageDealtToChampions / durationMin);
    perMatch.goldPerMin.push(p.goldEarned / durationMin);
    perMatch.kp.push(((p.kills + p.assists) / teamKills) * 100);

    const pos = p.teamPosition || p.individualPosition;
    if (pos && pos !== "") {
      laneCounts[pos] = (laneCounts[pos] || 0) + 1;
    }
  });

  // Find main lane
  let mainLane = "UNKNOWN";
  let maxCount = 0;
  for (const [lane, count] of Object.entries(laneCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mainLane = lane;
    }
  }

  const isLeagueArray = Array.isArray(summoner.league);

  return {
    tier: isLeagueArray && summoner.league[0] ? summoner.league[0].tier : "UNRANKED",
    displayName: isLeagueArray && summoner.league[0] ? summoner.league[0].tier : "SEM RANK",
    csPerMin: Number(trimmedMean(perMatch.csPerMin).toFixed(1)),
    kda: Number(trimmedMean(perMatch.kda).toFixed(2)),
    visionScore: Number(trimmedMean(perMatch.visionScore).toFixed(1)),
    visionPerMin: Number(trimmedMean(perMatch.visionPerMin).toFixed(2)),
    damagePerMin: Number(trimmedMean(perMatch.damagePerMin).toFixed(1)),
    goldPerMin: Number(trimmedMean(perMatch.goldPerMin).toFixed(0)),
    kp: Number(trimmedMean(perMatch.kp).toFixed(0)),
    lane: mainLane !== "UNKNOWN" ? mainLane : undefined,
  };
};


export const getStreak = (matches: MatchData[], summoner: SummonerData | null) => {
  if (matches.length === 0 || !summoner) return null;
  let streak = 0;
  const firstWin = matches[0].info.participants.find((p) => p.puuid === summoner.account.puuid)?.win;

  for (const match of matches) {
    const p = match.info.participants.find((p) => p.puuid === summoner.account.puuid);
    if (p?.win === firstWin) {
      streak++;
    } else {
      break;
    }
  }
  return { type: firstWin ? "Vitória" : "Derrota", count: streak };
};


export const SPELL_ICONS: Record<number, string> = {
  21: "SummonerBarrier",
  1: "SummonerBoost",
  14: "SummonerDot",
  3: "SummonerExhaust",
  4: "SummonerFlash",
  6: "SummonerHaste",
  7: "SummonerHeal",
  11: "SummonerSmite",
  12: "SummonerTeleport",
  32: "SummonerSnowball",
};
export const calculateAIScore = (p: any, match: MatchData): { score: number; isMVP: boolean } => {
  const durationMin = Math.max(1, match.info.gameDuration / 60);
  const teamParticipants = match.info.participants.filter((part) => part.teamId === p.teamId);
  const teamKills = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));
  const teamDamage = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.totalDamageDealtToChampions, 0));
  const teamGold = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.goldEarned, 0));

  const input: MatchDataInput = {
    matchId: match.metadata.matchId,
    win: p.win,
    position: (p.teamPosition || p.individualPosition || "UNKNOWN") as Position,
    championName: p.championName,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    totalCS: p.totalMinionsKilled + p.neutralMinionsKilled,
    csPerMin: (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin,
    damageToChampions: p.totalDamageDealtToChampions,
    damageShare: p.totalDamageDealtToChampions / teamDamage,
    killParticipation: (p.kills + p.assists) / teamKills,
    visionScore: p.visionScore,
    visionScorePerMin: p.visionScore / durationMin,
    wardsPlaced: p.wardsPlaced || 0,
    wardsKilled: p.wardsKilled || 0,
    goldEarned: p.goldEarned,
    goldShare: p.goldEarned / teamGold,
    objectiveDamage: p.damageDealtToObjectives || 0,
    objectiveDamagePerMin: (p.damageDealtToObjectives || 0) / durationMin,
    gameDurationMinutes: durationMin,
  };

  const score = calculateMatchScore(input);
  return { score, isMVP: false };
};

export const getChampionName = (name: string): string => {
  if (!name) return "";
  if (name === "FiddleSticks") return "Fiddlesticks";
  return name;
};

export const getQueueType = (queueId: number, gameMode: string): string => {
  switch (queueId) {
    case 400: return "Normal (Alternada)";
    case 420: return "Ranqueada Solo";
    case 430: return "Normal (Às Cegas)";
    case 440: return "Ranqueada Flex";
    case 450: return "ARAM";
    case 490: return "Quickplay";
    case 700: return "Clash";
    case 1700: return "Arena";
    default: return gameMode === "CLASSIC" ? "Normal" : gameMode;
  }
};

export const calculateMatchPerformanceScores = (p: any, match: MatchData, playerTier: string = 'GOLD'): PerformanceScores => {
  const durationMin = Math.max(1, match.info.gameDuration / 60);
  const teamParticipants = match.info.participants.filter((part) => part.teamId === p.teamId);
  const teamKills = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));
  const teamDamage = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.totalDamageDealtToChampions, 0));
  const teamGold = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.goldEarned, 0));

  const input: MatchDataInput = {
    matchId: match.metadata.matchId,
    win: p.win,
    position: (p.teamPosition || p.individualPosition || "UNKNOWN") as Position,
    championName: p.championName,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    totalCS: p.totalMinionsKilled + p.neutralMinionsKilled,
    csPerMin: (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin,
    damageToChampions: p.totalDamageDealtToChampions,
    damageShare: p.totalDamageDealtToChampions / teamDamage,
    killParticipation: (p.kills + p.assists) / teamKills,
    visionScore: p.visionScore,
    visionScorePerMin: p.visionScore / durationMin,
    wardsPlaced: p.wardsPlaced || 0,
    wardsKilled: p.wardsKilled || 0,
    goldEarned: p.goldEarned,
    goldShare: p.goldEarned / teamGold,
    objectiveDamage: p.damageDealtToObjectives || 0,
    objectiveDamagePerMin: (p.damageDealtToObjectives || 0) / durationMin,
    gameDurationMinutes: durationMin,
  };

  return calculateMatchPillarScores(input, playerTier);
};

export const calculatePerformanceRank = (
  avgScores: PerformanceScores,
  currentTier: string,
  currentRank: string
): { tier: string; rank: string; points: number } => {
  const score = avgScores.total;
  let estimatedTier = "GOLD";
  let estimatedRank = "IV";

  if (score < 20) { estimatedTier = "IRON"; estimatedRank = "II"; }
  else if (score < 30) { estimatedTier = "BRONZE"; estimatedRank = "II"; }
  else if (score < 45) { estimatedTier = "SILVER"; estimatedRank = "II"; }
  else if (score < 55) { estimatedTier = "GOLD"; estimatedRank = "II"; }
  else if (score < 65) { estimatedTier = "PLATINUM"; estimatedRank = "II"; }
  else if (score < 75) { estimatedTier = "EMERALD"; estimatedRank = "II"; }
  else if (score < 85) { estimatedTier = "DIAMOND"; estimatedRank = "II"; }
  else if (score < 90) { estimatedTier = "MASTER"; estimatedRank = "I"; }
  else if (score < 95) { estimatedTier = "GRANDMASTER"; estimatedRank = "I"; }
  else { estimatedTier = "CHALLENGER"; estimatedRank = "I"; }

  const matched = RANKS_POINTS.find(x => x.tier === estimatedTier && x.rank === estimatedRank) || RANKS_POINTS[12];

  return { tier: estimatedTier, rank: estimatedRank, points: matched.points };
};

function buildMetricDistribution(
  values: number[],
  benchmark: MetricBenchmark,
  recencyWeights: number[],
  sampleSize: number
): MetricDistribution {
  const n = values.length;
  const current = n > 0 ? weightedMean(values, recencyWeights.slice(0, n)) : 0;

  const adjusted = bayesianShrinkage(current, benchmark.median, n, 12);

  const evalStd = Math.max(0.05, benchmark.median * 0.15);
  const pct = estimatePercentile(adjusted, benchmark.median, evalStd);
  const confidence = sampleConfidence(sampleSize);

  const q1Eval = Number((benchmark.median - 0.524 * evalStd).toFixed(2));
  const q3Eval = Number((benchmark.median + 0.524 * evalStd).toFixed(2));
  const isWithin = adjusted >= q1Eval && adjusted <= q3Eval;

  const semanticState: SemanticState = (() => {
    if (pct < 15) return "WELL_BELOW";
    if (pct < 30) return "BELOW";
    if (pct <= 70) return "WITHIN_EXPECTED";
    if (pct <= 90) return "ABOVE";
    return "EXCEPTIONAL";
  })();

  return {
    current: Number(adjusted.toFixed(2)),
    target: benchmark.median,
    percentile: Number(pct.toFixed(1)),
    expectedRange: [q1Eval, q3Eval],
    isWithinRange: isWithin,
    completion: clamp(pct, 0, 100),
    confidence: Number(confidence.toFixed(2)),
    sampleSize: sampleSize,
    semanticState
  };
}

const METRIC_LABELS: Record<string, string> = {
  csPerMin: 'Farm (CS/min)',
  kda: 'KDA',
  visionPerMin: 'Visão/min',
  damagePerMin: 'Dano/min',
  goldPerMin: 'Ouro/min',
  kp: 'Participação em Abates',
  objectiveDmgPerMin: 'Dano em Objetivos/min',
};

const METRIC_DIFFICULTY: Record<string, 'LOW' | 'MEDIUM' | 'HIGH'> = {
  csPerMin: 'MEDIUM',
  kda: 'HIGH',
  visionPerMin: 'LOW',
  damagePerMin: 'MEDIUM',
  goldPerMin: 'MEDIUM',
  kp: 'MEDIUM',
  objectiveDmgPerMin: 'LOW',
};

const COACH_EXPLANATIONS: Record<string, (role: string, targetRank: string) => string> = {
  csPerMin: (role, rank) =>
    `Seu Farm Médio (CS/min) mede a quantidade de tropas e monstros que você abate por minuto. Priorize rotas eficientes de farm para acelerar sua compra de itens sem depender de abates arriscados no elo ${rank}.`,
  kda: (role, rank) =>
    `Seu KDA reflete a proporção de abates e assistências em relação às suas mortes. Evite mortes desnecessárias na rota de ${role} para não entregar recursos aos oponentes.`,
  visionPerMin: (role, rank) =>
    `Sua Visão por Minuto mede a quantidade de sentinelas posicionadas e reveladas a cada minuto. Compre sentinelas de controle para prevenir emboscadas e dar maior controle de mapa ao seu time.`,
  damagePerMin: (role, rank) =>
    `Seu Dano por Minuto (DPM) reflete a eficiência de seus ataques contra campeões inimigos. Posicione-se de forma mais assertiva nas lutas de equipe para maximizar seu dano nos combates.`,
  goldPerMin: (role, rank) =>
    `Seu Ouro por Minuto (GPM) indica a velocidade geral com que você acumula recursos. Otimize suas transições pelo mapa para acelerar a compra de itens no elo ${rank}.`,
  kp: (role, rank) =>
    `Sua Participação em Abates (KP%) mede a porcentagem de abates do time em que você esteve presente. Melhore sua leitura de mapa para rotacionar no tempo correto e apoiar as jogadas de combate.`,
  objectiveDmgPerMin: (role, rank) =>
    `Seu Dano em Objetivos por Minuto mede seu foco em derrubar torres e monstros neutros. Aumente essa pressão na rota de ${role} para converter suas vantagens em vitória no mapa.`
};

function buildImprovementPriorities(
  distributions: Record<string, MetricDistribution>,
  role: string,
  targetRank: string,
  consistencyScore: number
): ImprovementPriority[] {
  const weights = getRoleWeights(role);
  const weightMap: Record<string, number> = {
    csPerMin: weights.farming,
    kda: weights.combat,
    visionPerMin: weights.vision,
    damagePerMin: weights.teamfight,
    goldPerMin: (weights.farming + weights.combat) / 2,
    kp: weights.teamfight,
    objectiveDmgPerMin: weights.objectives,
  };

  const priorities: ImprovementPriority[] = [];
  const consistencyFactor = consistencyScore / 100;

  for (const [metric, dist] of Object.entries(distributions)) {
    if (!weightMap[metric]) continue;

    if (dist.percentile >= 30) continue;

    const targetPct = 75;
    const distancePercent = clamp(targetPct - dist.percentile, 0, 100);
    const impactScore = weightMap[metric];

    const estimatedGain = distancePercent > 5
      ? Number((impactScore * distancePercent / 200).toFixed(1))
      : 0;

    const baseDifficulty = METRIC_DIFFICULTY[metric] || 'MEDIUM';
    const difficulty: 'LOW' | 'MEDIUM' | 'HIGH' = (() => {
      if (consistencyFactor < 0.5 && baseDifficulty === 'MEDIUM') return 'HIGH';
      if (consistencyFactor > 0.8 && baseDifficulty === 'MEDIUM') return 'LOW';
      return baseDifficulty;
    })();

    const explanationFunc = COACH_EXPLANATIONS[metric] || (() => "Foque em aprimorar essa métrica.");
    const explanation = explanationFunc(role, targetRank);

    priorities.push({
      metric,
      label: METRIC_LABELS[metric] || metric,
      currentValue: dist.current,
      targetValue: dist.target,
      distancePercent: Number(distancePercent.toFixed(1)),
      impactScore,
      difficulty,
      estimatedGain,
      explanation,
    });
  }

  priorities.sort((a, b) => (b.impactScore * b.distancePercent) - (a.impactScore * a.distancePercent));

  return priorities;
}

export const calculateOverallPerformanceData = (
  matches: MatchData[],
  summoner: SummonerData,
  currentTier: string,
  currentRank: string,
  targetTier?: string,
  effectiveLane?: string
): EnhancedPerformanceData | null => {
  if (!matches.length || !summoner) return null;

  const myPuuid = summoner.account.puuid;
  const history: MatchPerformanceData[] = [];

  const rawMetrics = {
    csPerMin: [] as number[],
    kda: [] as number[],
    visionPerMin: [] as number[],
    damagePerMin: [] as number[],
    goldPerMin: [] as number[],
    kp: [] as number[],
    objectiveDmgPerMin: [] as number[],
  };

  const laneCounts: Record<string, number> = {};

  matches.forEach((match) => {
    const playerPart = match.info.participants.find(p => p.puuid === myPuuid);
    if (!playerPart) return;

    const durationMin = Math.max(1, match.info.gameDuration / 60);
    const teamParticipants = match.info.participants.filter(tp => tp.teamId === playerPart.teamId);
    const teamKills = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.kills, 0));
    const teamDamage = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.totalDamageDealtToChampions, 0));
    const teamGold = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.goldEarned, 0));

    const cs = playerPart.totalMinionsKilled + playerPart.neutralMinionsKilled;
    rawMetrics.csPerMin.push(cs / durationMin);
    rawMetrics.kda.push((playerPart.kills + playerPart.assists) / Math.max(1, playerPart.deaths));
    rawMetrics.visionPerMin.push(playerPart.visionScore / durationMin);
    rawMetrics.damagePerMin.push(playerPart.totalDamageDealtToChampions / durationMin);
    rawMetrics.goldPerMin.push(playerPart.goldEarned / durationMin);
    rawMetrics.kp.push(((playerPart.kills + playerPart.assists) / teamKills) * 100);
    rawMetrics.objectiveDmgPerMin.push((playerPart.damageDealtToObjectives || 0) / durationMin);

    const pos = playerPart.teamPosition || playerPart.individualPosition;
    if (pos && pos !== "") {
      laneCounts[pos] = (laneCounts[pos] || 0) + 1;
    }

    const scores = calculateMatchPerformanceScores(playerPart, match, currentTier);

    const teammates = match.info.participants.filter(p => p.teamId === playerPart.teamId && p.puuid !== myPuuid);
    const teamAverageScore = teammates.length > 0
      ? Math.round(teammates.reduce((acc, p) => acc + calculateMatchPerformanceScores(p, match, currentTier).total, 0) / teammates.length)
      : scores.total;

    const enemies = match.info.participants.filter(p => p.teamId !== playerPart.teamId);
    const enemyAverageScore = enemies.length > 0
      ? Math.round(enemies.reduce((acc, p) => acc + calculateMatchPerformanceScores(p, match, currentTier).total, 0) / enemies.length)
      : scores.total;

    history.push({
      matchId: match.metadata.matchId,
      championName: playerPart.championName,
      kda: { k: playerPart.kills, d: playerPart.deaths, a: playerPart.assists },
      win: playerPart.win,
      gameDuration: match.info.gameDuration,
      gameCreation: match.info.gameCreation || Date.now(),
      pos: playerPart.teamPosition || playerPart.individualPosition || "UNKNOWN",
      scores,
      teamAverageScore,
      enemyAverageScore
    });
  });

  if (!history.length) return null;

  globalBenchmarkProvider.feedMatches(matches, currentTier, currentRank);

  let mainLane = "MIDDLE";
  let maxCount = 0;
  for (const [lane, count] of Object.entries(laneCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mainLane = lane;
    }
  }
  const role = effectiveLane || mainLane;

  const context: AnalysisContext = {
    region: (matches[0]?.metadata?.matchId?.split("_")[0] || "br1").toLowerCase(),
    queueId: matches[0]?.info?.queueId || 420,
    patch: (() => {
      const gv = matches[0]?.info?.gameVersion || "15.1";
      const parts = gv.split(".");
      return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : "15.1";
    })(),
    tier: currentTier,
    division: currentRank,
    role,
    championName: history[0]?.championName,
  };

  const recencyWeights = exponentialDecayWeights(history.length, 10);

  const targetRank = targetTier || currentTier;
  const targetContext: AnalysisContext = { ...context, tier: targetRank };
  const targetRoleBenchmark = globalBenchmarkProvider.getRoleBenchmark(targetContext);
  const sampleSize = globalBenchmarkProvider.getSampleSize(targetContext);

  const distributions: Record<string, MetricDistribution> = {
    csPerMin: buildMetricDistribution(rawMetrics.csPerMin, targetRoleBenchmark.csPerMin, recencyWeights, sampleSize),
    kda: buildMetricDistribution(rawMetrics.kda, targetRoleBenchmark.kda, recencyWeights, sampleSize),
    visionPerMin: buildMetricDistribution(rawMetrics.visionPerMin, targetRoleBenchmark.visionPerMin, recencyWeights, sampleSize),
    damagePerMin: buildMetricDistribution(rawMetrics.damagePerMin, targetRoleBenchmark.damagePerMin, recencyWeights, sampleSize),
    goldPerMin: buildMetricDistribution(rawMetrics.goldPerMin, targetRoleBenchmark.goldPerMin, recencyWeights, sampleSize),
    kp: buildMetricDistribution(rawMetrics.kp, targetRoleBenchmark.kp, recencyWeights, sampleSize),
    objectiveDmgPerMin: buildMetricDistribution(rawMetrics.objectiveDmgPerMin, targetRoleBenchmark.objectiveDmgPerMin, recencyWeights, sampleSize),
  };

  const totalScores = history.map(m => m.scores.total);
  const consistencyScore = calculateConsistencyScore(totalScores);

  const roleWeights = getRoleWeights(role);
  const compositeResult = globalPillarRegistry.calculateOverallIndex(
    distributions,
    roleWeights,
    consistencyScore
  );

  const playerAverage: PerformanceScores = {
    laning: Math.round(weightedMean(history.map(m => m.scores.laning), recencyWeights)),
    farming: Math.round(weightedMean(history.map(m => m.scores.farming), recencyWeights)),
    objectives: Math.round(weightedMean(history.map(m => m.scores.objectives), recencyWeights)),
    combat: Math.round(weightedMean(history.map(m => m.scores.combat), recencyWeights)),
    teamfight: Math.round(weightedMean(history.map(m => m.scores.teamfight), recencyWeights)),
    vision: Math.round(weightedMean(history.map(m => m.scores.vision), recencyWeights)),
    total: Math.round(weightedMean(history.map(m => m.scores.total), recencyWeights)),
  };

  playerAverage.total = compositeResult.overallIndex;

  const teamAverage = Math.round(weightedMean(history.map(m => m.teamAverageScore), recencyWeights));
  const enemyAverage = Math.round(weightedMean(history.map(m => m.enemyAverageScore), recencyWeights));

  const pillarMetricMap: Record<string, string> = {
    laning: 'csPerMin',
    farming: 'csPerMin',
    objectives: 'objectiveDmgPerMin',
    combat: 'kda',
    teamfight: 'damagePerMin',
    vision: 'visionPerMin',
  };

  const pillars: Record<string, PillarScore> = {};
  for (const [pillar, metricKey] of Object.entries(pillarMetricMap)) {
    pillars[pillar] = {
      score: compositeResult.pillarScores[pillar === "laning" || pillar === "farming" ? "economy" : pillar === "objectives" ? "objectives" : pillar === "combat" ? "combat" : pillar === "vision" ? "vision" : "combat"] || playerAverage[pillar as keyof PerformanceScores],
      distribution: distributions[metricKey],
    };
  }
  pillars["kp"] = {
    score: playerAverage.combat,
    distribution: distributions.kp,
  };

  const improvementPriorities = buildImprovementPriorities(distributions, role, targetRank, consistencyScore);

  const winRate = history.filter(m => m.win).length / history.length;
  const engineMatches: MatchDataInput[] = matches.map(m => {
    const p = m.info.participants.find(p => p.puuid === summoner.account.puuid);
    if (!p) return null;
    const durationMin = Math.max(1, m.info.gameDuration / 60);
    const teamParticipants = m.info.participants.filter(tp => tp.teamId === p.teamId);
    const teamKills = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.kills, 0));
    const teamDamage = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.totalDamageDealtToChampions, 0));
    const teamGold = Math.max(1, teamParticipants.reduce((acc, tp) => acc + tp.goldEarned, 0));

    return {
      matchId: m.metadata.matchId,
      win: p.win,
      position: (p.teamPosition || "UNKNOWN") as Position,
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      totalCS: p.totalMinionsKilled + p.neutralMinionsKilled,
      csPerMin: (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin,
      damageToChampions: p.totalDamageDealtToChampions,
      damageShare: p.totalDamageDealtToChampions / teamDamage,
      killParticipation: (p.kills + p.assists) / teamKills,
      visionScore: p.visionScore,
      visionScorePerMin: p.visionScore / durationMin,
      wardsPlaced: p.wardsPlaced || 0,
      wardsKilled: p.wardsKilled || 0,
      goldEarned: p.goldEarned,
      goldShare: p.goldEarned / teamGold,
      objectiveDamage: p.damageDealtToObjectives || 0,
      objectiveDamagePerMin: (p.damageDealtToObjectives || 0) / durationMin,
      gameDurationMinutes: durationMin,
    };
  }).filter(Boolean) as MatchDataInput[];

  const engineResult = computePerformanceRank({
    currentTier,
    currentDivision: currentRank,
    currentLP: 0,
    overallWinrate: winRate,
    matches: engineMatches,
    region: context.region,
    queueId: context.queueId,
    patch: context.patch,
    role
  });

  return {
    playerAverage,
    teamAverage,
    enemyAverage,
    history,
    performanceRank: {
      tier: engineResult.tier,
      rank: engineResult.division,
      points: engineResult.points || 0,
      classificationConfidence: engineResult.classificationConfidence,
      probabilities: engineResult.probabilities,
      explainabilityText: engineResult.explainabilityText
    },
    consistencyScore,
    overallIndex: compositeResult.overallIndex,
    pillars,
    improvementPriorities,
    rawMetrics,
    context,
  };
};
