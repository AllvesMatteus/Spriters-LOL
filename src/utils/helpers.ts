import { MatchData, SummonerData, RankStats, RANK_AVERAGES, PerformanceScores, MatchPerformanceData, OverallPerformanceData, RANKS_POINTS } from "../types";
import { computePerformanceRank, MatchDataInput, Position } from "./performanceEngine";

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
  if (idx === ranks.length - 1) return ranks[idx]; // Keep it Challenger if they are Challenger
  return ranks[idx + 1];
};

export const getAdjustedTargetStats = (targetRank: string, lane: string = "UNKNOWN"): RankStats => {
  const rawTargetStats = RANK_AVERAGES[targetRank] || RANK_AVERAGES.GOLD;
  const stats = { ...rawTargetStats };

  if (lane === "UTILITY") {
    stats.csPerMin = Math.max(1.0, stats.csPerMin * 0.15);
    stats.visionScore = Math.round(stats.visionScore * 1.5);
    stats.damagePerMin = Math.round(stats.damagePerMin * 0.6);
    stats.kda = Number((stats.kda * 1.1).toFixed(2));
  } else if (lane === "JUNGLE") {
    stats.csPerMin = Math.max(4.0, stats.csPerMin * 0.85);
    stats.visionScore = Math.round(stats.visionScore * 1.1);
  } else if (lane === "TOP") {
    stats.csPerMin = stats.csPerMin * 1.1;
    stats.damagePerMin = Math.round(stats.damagePerMin * 0.9);
  } else if (lane === "BOTTOM") {
    stats.csPerMin = stats.csPerMin * 1.1;
    stats.damagePerMin = Math.round(stats.damagePerMin * 1.2);
  } else if (lane === "MIDDLE") {
    stats.damagePerMin = Math.round(stats.damagePerMin * 1.1);
  }

  stats.csPerMin = Number(stats.csPerMin.toFixed(1));
  return stats;
};

export const calculateUserStats = (matches: MatchData[], summoner: SummonerData | null): RankStats => {
  if (!matches.length || !summoner) return RANK_AVERAGES.IRON;

  let totalCS = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalVision = 0;
  let totalDamage = 0;
  let totalDuration = 0;
  const laneCounts: Record<string, number> = {};

  matches.forEach((match) => {
    const p = match.info.participants.find((p) => p.puuid === summoner.account.puuid);
    if (p) {
      totalCS += p.totalMinionsKilled + p.neutralMinionsKilled;
      totalKills += p.kills;
      totalDeaths += p.deaths;
      totalAssists += p.assists;
      totalVision += p.visionScore;
      totalDamage += p.totalDamageDealtToChampions;
      totalDuration += match.info.gameDuration;

      const pos = p.teamPosition || p.individualPosition;
      if (pos && pos !== "") {
        laneCounts[pos] = (laneCounts[pos] || 0) + 1;
      }
    }
  });

  let mainLane = "UNKNOWN";
  let maxCount = 0;
  for (const [lane, count] of Object.entries(laneCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mainLane = lane;
    }
  }

  const games = matches.length;
  const durationMin = totalDuration / 60;

  const isLeagueArray = Array.isArray(summoner.league);

  return {
    tier: isLeagueArray && summoner.league[0] ? summoner.league[0].tier : "UNRANKED",
    displayName: isLeagueArray && summoner.league[0] ? summoner.league[0].tier : "SEM RANK",
    csPerMin: Number((totalCS / durationMin).toFixed(1)),
    kda: Number(((totalKills + totalAssists) / Math.max(1, totalDeaths)).toFixed(2)),
    visionScore: Number((totalVision / games).toFixed(1)),
    damagePerMin: Number((totalDamage / durationMin).toFixed(1)),
    visionPerMin: Number((totalVision / durationMin).toFixed(1)), // Estimated
    goldPerMin: 0, // Fallback if no gold data in aggregate
    kp: 0, // Fallback
    lane: mainLane !== "UNKNOWN" ? mainLane : undefined
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
  const teamParticipants = match.info.participants.filter((part) => part.teamId === p.teamId);
  const teamKills    = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));
  
  const kp           = ((p.kills + p.assists) / teamKills) * 100;
  const kdaRatio     = (p.kills + p.assists) / Math.max(1, p.deaths);
  const durationMin  = Math.max(1, match.info.gameDuration / 60);
  const cspm         = (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin;
  const visionpm     = p.visionScore / durationMin;
  const dpm          = p.totalDamageDealtToChampions / durationMin;
  const gpm          = p.goldEarned / durationMin;

  const position = (p.teamPosition && p.teamPosition !== "" && p.teamPosition !== "Invalid")
    ? p.teamPosition
    : p.individualPosition;

  // We use Platinum as a standard baseline to score against for the "OP Score", 
  // since a Platinum performance is generally considered "good" (6-7/10).
  const baseline = RANK_AVERAGES.PLATINUM || RANK_AVERAGES.GOLD; 

  let score = 0;
  
  // Percentile calculation helper (caps at 1.5x of baseline to avoid inflating too much)
  const scoreMetric = (val: number, base: number, weight: number) => {
     const ratio = Math.min(1.5, Math.max(0, val / Math.max(0.1, base)));
     return ratio * weight;
  };

  if (position === "UTILITY") {
    // Support weights: Vision 35%, KP 30%, KDA 20%, Gold/Min 15%
    score += scoreMetric(visionpm, baseline.visionPerMin * 1.5, 35);
    score += scoreMetric(kp, baseline.kp * 1.2, 30);
    score += scoreMetric(kdaRatio, baseline.kda * 1.2, 20);
    score += scoreMetric(gpm, baseline.goldPerMin * 0.7, 15);
  } else if (position === "JUNGLE") {
    // Jungle weights: KP 30%, GPM 25%, KDA 25%, Vision 20%
    score += scoreMetric(kp, baseline.kp * 1.1, 30);
    score += scoreMetric(gpm, baseline.goldPerMin * 1.0, 25);
    score += scoreMetric(kdaRatio, baseline.kda, 25);
    score += scoreMetric(visionpm, baseline.visionPerMin, 20);
  } else {
    // Laners: CS/M 30%, DPM 25%, KDA 25%, KP 20%
    score += scoreMetric(cspm, baseline.csPerMin, 30);
    score += scoreMetric(dpm, baseline.damagePerMin, 25);
    score += scoreMetric(kdaRatio, baseline.kda, 25);
    score += scoreMetric(kp, baseline.kp, 20);
  }

  // Multi-kill bonus
  if (p.pentaKills > 0) score += 10;
  else if (p.quadraKills > 0) score += 5;

  // Death penalty
  if (p.deaths > 8) score -= (p.deaths - 8) * 2;
  
  // Win bonus
  if (p.win) score += 5;

  // Scale to 0-100 (OP Score style: 80+ is MVP range, 60+ is good)
  score = Math.min(100, Math.max(0, score * 0.85)); // 0.85 multiplier to make 100 rare

  return { score, isMVP: false };
};

export const getChampionName = (name: string): string => {
  if (!name) return "";
  // Fix known ddragon inconsistencies
  if (name === "FiddleSticks") return "Fiddlesticks";
  return name;
};

// OP.GG / DEEPLOL standard Queue ID pattern mapping
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

export const calculateMatchPerformanceScores = (p: any, match: MatchData): PerformanceScores => {
  const baseline = RANK_AVERAGES.PLATINUM || RANK_AVERAGES.GOLD;
  
  const durationMin = Math.max(1, match.info.gameDuration / 60);
  const cspm = (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin;
  const dpm = p.totalDamageDealtToChampions / durationMin;
  const visionpm = p.visionScore / durationMin;
  
  const teamParticipants = match.info.participants.filter((part) => part.teamId === p.teamId);
  const teamKills = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));
  const kp = ((p.kills + p.assists) / teamKills) * 100;
  const kdaRatio = (p.kills + p.assists) / Math.max(1, p.deaths);

  const ratioToScore = (val: number, base: number) => Math.min(100, Math.max(0, (val / Math.max(0.1, base)) * 60));

  const laning = ratioToScore(cspm, baseline.csPerMin) + (p.firstBloodKill ? 20 : 0);
  const farming = ratioToScore(cspm, baseline.csPerMin);
  const objectives = ratioToScore(p.damageDealtToObjectives / durationMin, 400);
  const combat = ratioToScore(kdaRatio, baseline.kda);
  const teamfight = ratioToScore(dpm, baseline.damagePerMin) * 0.5 + ratioToScore(kp, baseline.kp) * 0.5;
  const vision = ratioToScore(visionpm, baseline.visionPerMin);

  const total = calculateAIScore(p, match).score;

  return { 
    laning: Math.min(100, laning), 
    farming: Math.min(100, farming), 
    objectives: Math.min(100, objectives), 
    combat: Math.min(100, combat), 
    teamfight: Math.min(100, teamfight), 
    vision: Math.min(100, vision), 
    total 
  };
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

export const calculateOverallPerformanceData = (
  matches: MatchData[],
  summoner: SummonerData,
  currentTier: string,
  currentRank: string
): OverallPerformanceData | null => {
  if (!matches.length || !summoner) return null;

  const myPuuid = summoner.account.puuid;
  const history: MatchPerformanceData[] = [];

  matches.forEach((match) => {
    const playerPart = match.info.participants.find(p => p.puuid === myPuuid);
    if (!playerPart) return;

    const scores = calculateMatchPerformanceScores(playerPart, match);

    const teammates = match.info.participants.filter(p => p.teamId === playerPart.teamId && p.puuid !== myPuuid);
    const teamAverageScore = teammates.length > 0
      ? Math.round(teammates.reduce((acc, p) => acc + calculateMatchPerformanceScores(p, match).total, 0) / teammates.length)
      : scores.total;

    const enemies = match.info.participants.filter(p => p.teamId !== playerPart.teamId);
    const enemyAverageScore = enemies.length > 0
      ? Math.round(enemies.reduce((acc, p) => acc + calculateMatchPerformanceScores(p, match).total, 0) / enemies.length)
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

  const playerAverage = {
    laning: Math.round(history.reduce((acc, m) => acc + m.scores.laning, 0) / history.length),
    farming: Math.round(history.reduce((acc, m) => acc + m.scores.farming, 0) / history.length),
    objectives: Math.round(history.reduce((acc, m) => acc + m.scores.objectives, 0) / history.length),
    combat: Math.round(history.reduce((acc, m) => acc + m.scores.combat, 0) / history.length),
    teamfight: Math.round(history.reduce((acc, m) => acc + m.scores.teamfight, 0) / history.length),
    vision: Math.round(history.reduce((acc, m) => acc + m.scores.vision, 0) / history.length),
    total: Math.round(history.reduce((acc, m) => acc + m.scores.total, 0) / history.length)
  };

  const teamAverage = Math.round(history.reduce((acc, m) => acc + m.teamAverageScore, 0) / history.length);
  const enemyAverage = Math.round(history.reduce((acc, m) => acc + m.enemyAverageScore, 0) / history.length);

  const winRate = history.filter(m => m.win).length / history.length;
  
  let modifiedAverages = { ...playerAverage };
  if (winRate > 0.55) {
     modifiedAverages.total = Math.min(100, modifiedAverages.total + 5);
  }

  // Use the new performance engine logic
  const engineMatches: MatchDataInput[] = matches.map(m => {
    const p = m.info.participants.find(p => p.puuid === summoner.account.puuid);
    if (!p) return null;
    return {
      matchId: m.metadata.matchId,
      win: p.win,
      position: (p.teamPosition || "UNKNOWN") as Position,
      championName: p.championName,
      kills: p.kills,
      deaths: p.deaths,
      assists: p.assists,
      totalCS: p.totalMinionsKilled + p.neutralMinionsKilled,
      csPerMin: (p.totalMinionsKilled + p.neutralMinionsKilled) / (m.info.gameDuration / 60),
      damageToChampions: p.totalDamageDealtToChampions,
      damageShare: 0.2, // Rough fallback since we don't map full team damage here easily
      killParticipation: 0.5, // Rough fallback
      visionScore: p.visionScore,
      visionScorePerMin: p.visionScore / (m.info.gameDuration / 60),
      wardsPlaced: p.wardsPlaced || 0,
      wardsKilled: p.wardsKilled || 0,
      goldEarned: p.goldEarned,
      goldShare: 0.2, // Rough fallback
      gameDurationMinutes: m.info.gameDuration / 60
    };
  }).filter(Boolean) as MatchDataInput[];

  const engineResult = computePerformanceRank({
    currentTier,
    currentDivision: currentRank,
    currentLP: 0,
    overallWinrate: winRate,
    matches: engineMatches
  });

  return {
    playerAverage,
    teamAverage,
    enemyAverage,
    history,
    performanceRank: {
      tier: engineResult.tier,
      rank: engineResult.division,
      points: engineResult.points || 0
    }
  };
};
