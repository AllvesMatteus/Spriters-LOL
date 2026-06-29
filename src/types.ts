export interface SummonerData {
  account: {
    puuid: string;
    gameName: string;
    tagLine: string;
  };
  summoner: {
    id: string;
    accountId: string;
    puuid: string;
    name: string;
    profileIconId: number;
    revisionDate: number;
    summonerLevel: number;
  };
  league: Array<{
    leagueId: string;
    queueType: string;
    tier: string;
    rank: string;
    summonerId: string;
    summonerName: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }>;
}

export interface MatchData {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameDuration: number;
    gameMode: string;
    queueId: number;
    gameCreation?: number;
    gameEndTimestamp?: number;
    participants: Array<{
      puuid: string;
      summonerName: string;
      championName: string;
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
      totalMinionsKilled: number;
      neutralMinionsKilled: number;
      goldEarned: number;
      totalDamageDealtToChampions: number;
      totalDamageTaken: number;
      visionScore: number;
      // teamPosition is the official Riot field: "TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"
      teamPosition: string;
      // individualPosition is a secondary guess, less reliable
      individualPosition: string;
      teamId: number;
      champLevel: number;
      summoner1Id: number;
      summoner2Id: number;
      item0: number;
      item1: number;
      item2: number;
      item3: number;
      item4: number;
      item5: number;
      item6: number;
      // Combat
      doubleKills: number;
      tripleKills: number;
      quadraKills: number;
      pentaKills: number;
      firstBloodKill: boolean;
      // Farming
      neutralMinionsKilledTeamJungle?: number;
      neutralMinionsKilledEnemyJungle?: number;
      // Vision
      visionWardsBoughtInGame: number;
      wardsPlaced: number;
      wardsKilled: number;
      detectorWardsPlaced: number;
      // Objectives & Structures
      damageDealtToObjectives: number;   // Structures + Dragons + Baron
      damageDealtToTurrets: number;
      turretKills: number;
      turretTakedowns: number;
      inhibitorKills: number;
      // Utility / CC
      timeCCingOthers: number;           // seconds of CC applied
      totalTimeCCDealt: number;
      totalHeal: number;
      totalHealsOnTeammates: number;
      totalDamageShieldedOnTeammates: number;
      // Ranked role
      role: string;
      lane: string;
    }>;
  };
}

export interface RankStats {
  tier: string;
  displayName: string;
  csPerMin: number;
  kda: number;
  visionScore: number;
  damagePerMin: number;
  lane?: string;
}

export const RANK_AVERAGES: Record<string, RankStats> = {
  IRON: { tier: "IRON", displayName: "FERRO", csPerMin: 4.5, kda: 1.8, visionScore: 10, damagePerMin: 400 },
  BRONZE: { tier: "BRONZE", displayName: "BRONZE", csPerMin: 5.2, kda: 2.1, visionScore: 15, damagePerMin: 450 },
  SILVER: { tier: "SILVER", displayName: "PRATA", csPerMin: 5.8, kda: 2.3, visionScore: 20, damagePerMin: 500 },
  GOLD: { tier: "GOLD", displayName: "OURO", csPerMin: 6.5, kda: 2.5, visionScore: 25, damagePerMin: 550 },
  PLATINUM: { tier: "PLATINUM", displayName: "PLATINA", csPerMin: 7.2, kda: 2.8, visionScore: 30, damagePerMin: 600 },
  EMERALD: { tier: "EMERALD", displayName: "ESMERALDA", csPerMin: 7.8, kda: 3.0, visionScore: 35, damagePerMin: 650 },
  DIAMOND: { tier: "DIAMOND", displayName: "DIAMANTE", csPerMin: 8.5, kda: 3.2, visionScore: 40, damagePerMin: 700 },
  MASTER: { tier: "MASTER", displayName: "MESTRE", csPerMin: 9.0, kda: 3.5, visionScore: 45, damagePerMin: 750 },
  GRANDMASTER: { tier: "GRANDMASTER", displayName: "GRÃO-MESTRE", csPerMin: 9.2, kda: 3.7, visionScore: 50, damagePerMin: 800 },
  CHALLENGER: { tier: "CHALLENGER", displayName: "DESAFIANTE", csPerMin: 9.5, kda: 4.0, visionScore: 55, damagePerMin: 850 },
};

export interface PerformanceScores {
  laning: number;
  farming: number;
  objectives: number;
  combat: number;
  teamfight: number;
  vision: number;
  total: number;
}

export interface MatchPerformanceData {
  matchId: string;
  championName: string;
  kda: { k: number; d: number; a: number };
  win: boolean;
  gameDuration: number;
  gameCreation: number;
  pos: string;
  scores: PerformanceScores;
  teamAverageScore: number;
  enemyAverageScore: number;
}

export interface OverallPerformanceData {
  playerAverage: PerformanceScores;
  teamAverage: number;
  enemyAverage: number;
  history: MatchPerformanceData[];
  performanceRank: {
    tier: string;
    rank: string;
    points: number;
  };
}

export interface RankPointInfo {
  tier: string;
  rank: string;
  points: number;
}

export const RANKS_POINTS: RankPointInfo[] = [
  { tier: "IRON", rank: "IV", points: 0 },
  { tier: "IRON", rank: "III", points: 500 },
  { tier: "IRON", rank: "II", points: 1000 },
  { tier: "IRON", rank: "I", points: 1500 },
  { tier: "BRONZE", rank: "IV", points: 2000 },
  { tier: "BRONZE", rank: "III", points: 2500 },
  { tier: "BRONZE", rank: "II", points: 3000 },
  { tier: "BRONZE", rank: "I", points: 3500 },
  { tier: "SILVER", rank: "IV", points: 4000 },
  { tier: "SILVER", rank: "III", points: 4500 },
  { tier: "SILVER", rank: "II", points: 5000 },
  { tier: "SILVER", rank: "I", points: 5500 },
  { tier: "GOLD", rank: "IV", points: 6000 },
  { tier: "GOLD", rank: "III", points: 6500 },
  { tier: "GOLD", rank: "II", points: 7000 },
  { tier: "GOLD", rank: "I", points: 7500 },
  { tier: "PLATINUM", rank: "IV", points: 8000 },
  { tier: "PLATINUM", rank: "III", points: 8500 },
  { tier: "PLATINUM", rank: "II", points: 9000 },
  { tier: "PLATINUM", rank: "I", points: 9500 },
  { tier: "EMERALD", rank: "IV", points: 10000 },
  { tier: "EMERALD", rank: "III", points: 10500 },
  { tier: "EMERALD", rank: "II", points: 11000 },
  { tier: "EMERALD", rank: "I", points: 11500 },
  { tier: "DIAMOND", rank: "IV", points: 12000 },
  { tier: "DIAMOND", rank: "III", points: 12500 },
  { tier: "DIAMOND", rank: "II", points: 13000 },
  { tier: "DIAMOND", rank: "I", points: 13500 },
  { tier: "MASTER", rank: "I", points: 14000 },
  { tier: "GRANDMASTER", rank: "I", points: 15000 },
  { tier: "CHALLENGER", rank: "I", points: 16000 }
];
