import { MatchData, SummonerData, RankStats, RANK_AVERAGES } from "../types";

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
  const teamKills = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));
  const teamDamage = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.totalDamageDealtToChampions, 0));

  const kp = (p.kills + p.assists) / teamKills;
  const damageShare = p.totalDamageDealtToChampions / teamDamage;

  const durationMin = Math.max(1, match.info.gameDuration / 60);
  const cspm = (p.totalMinionsKilled + p.neutralMinionsKilled) / durationMin;
  const visionpm = p.visionScore / durationMin;

  let score = 0;

  // KDA ratio and base contribution
  const kda = (p.kills + p.assists) / Math.max(1, p.deaths);
  score += Math.min(25, kda * 5); // A boa e velha relação KDA

  // High Impact actions (Vantagem pra quem carrega o jogo de verdade)
  score += p.kills * 2.2;
  score -= p.deaths * 1.8;
  score += p.assists * 1.2;

  // Participação
  score += Math.min(25, kp * 35);
  score += Math.min(20, damageShare * 50);

  // Status Role-based
  const isSupport = p.teamPosition === "UTILITY" || p.role === "SUPPORT";
  if (isSupport) {
    score += Math.min(15, visionpm * 6);
    score += (p.totalHeal + p.totalDamageShieldedOnTeammates) / 700;
  } else {
    score += Math.min(15, cspm * 2.5);
    score += Math.min(10, visionpm * 2);
  }

  // Objetivos e estruturas
  score += (p.damageDealtToObjectives / 1000) * 1.5;
  score += p.turretKills * 3;
  score += p.visionWardsBoughtInGame * 1.5;

  // Multi-kills
  if (p.pentaKills > 0) score += 12;
  else if (p.quadraKills > 0) score += 7;
  else if (p.tripleKills > 0) score += 3;
  else if (p.doubleKills > 0) score += 1;

  score = Math.min(100, Math.max(0, score));
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
