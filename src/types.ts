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
    gameVersion?: string;
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
      teamPosition: string;
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
      doubleKills: number;
      tripleKills: number;
      quadraKills: number;
      pentaKills: number;
      firstBloodKill: boolean;
      neutralMinionsKilledTeamJungle?: number;
      neutralMinionsKilledEnemyJungle?: number;
      visionWardsBoughtInGame: number;
      wardsPlaced: number;
      wardsKilled: number;
      detectorWardsPlaced: number;
      damageDealtToObjectives: number;
      damageDealtToTurrets: number;
      turretKills: number;
      turretTakedowns: number;
      inhibitorKills: number;
      timeCCingOthers: number;
      totalTimeCCDealt: number;
      totalHeal: number;
      totalHealsOnTeammates: number;
      totalDamageShieldedOnTeammates: number;
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
  visionPerMin: number;
  damagePerMin: number;
  goldPerMin: number;
  kp: number;
  lane?: string;
}

export const RANK_AVERAGES: Record<string, RankStats> = {
  IRON: { tier: "IRON", displayName: "FERRO", csPerMin: 4.0, kda: 1.5, visionScore: 10, visionPerMin: 0.4, damagePerMin: 350, goldPerMin: 300, kp: 35 },
  BRONZE: { tier: "BRONZE", displayName: "BRONZE", csPerMin: 4.5, kda: 1.8, visionScore: 12, visionPerMin: 0.5, damagePerMin: 400, goldPerMin: 330, kp: 40 },
  SILVER: { tier: "SILVER", displayName: "PRATA", csPerMin: 5.2, kda: 2.1, visionScore: 15, visionPerMin: 0.7, damagePerMin: 450, goldPerMin: 360, kp: 43 },
  GOLD: { tier: "GOLD", displayName: "OURO", csPerMin: 6.0, kda: 2.4, visionScore: 18, visionPerMin: 0.9, damagePerMin: 500, goldPerMin: 390, kp: 45 },
  PLATINUM: { tier: "PLATINUM", displayName: "PLATINA", csPerMin: 6.5, kda: 2.6, visionScore: 22, visionPerMin: 1.1, damagePerMin: 550, goldPerMin: 410, kp: 47 },
  EMERALD: { tier: "EMERALD", displayName: "ESMERALDA", csPerMin: 7.2, kda: 2.8, visionScore: 25, visionPerMin: 1.3, damagePerMin: 620, goldPerMin: 430, kp: 50 },
  DIAMOND: { tier: "DIAMOND", displayName: "DIAMANTE", csPerMin: 7.8, kda: 3.0, visionScore: 30, visionPerMin: 1.5, damagePerMin: 680, goldPerMin: 450, kp: 52 },
  MASTER: { tier: "MASTER", displayName: "MESTRE", csPerMin: 8.5, kda: 3.2, visionScore: 35, visionPerMin: 1.7, damagePerMin: 750, goldPerMin: 470, kp: 54 },
  GRANDMASTER: { tier: "GRANDMASTER", displayName: "GRÃO-MESTRE", csPerMin: 9.0, kda: 3.4, visionScore: 40, visionPerMin: 1.9, damagePerMin: 800, goldPerMin: 490, kp: 56 },
  CHALLENGER: { tier: "CHALLENGER", displayName: "DESAFIANTE", csPerMin: 9.5, kda: 3.6, visionScore: 45, visionPerMin: 2.1, damagePerMin: 850, goldPerMin: 510, kp: 58 },
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
    classificationConfidence?: number;
    probabilities?: Array<{ tier: string; probability: number }>;
    explainabilityText?: string;
  };
}

export type SemanticState =
  | "WELL_BELOW"
  | "BELOW"
  | "WITHIN_EXPECTED"
  | "ABOVE"
  | "EXCEPTIONAL";

export interface MetricDistribution {
  current: number;
  target: number;
  percentile: number;
  expectedRange: [number, number];
  isWithinRange: boolean;
  completion: number;
  confidence: number;
  sampleSize: number;
  semanticState?: SemanticState;
}

export interface PillarScore {
  score: number;
  distribution: MetricDistribution;
}

export interface ImprovementPriority {
  metric: string;
  label: string;
  currentValue: number;
  targetValue: number;
  distancePercent: number;
  impactScore: number;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedGain: number;
  explanation: string;
}

export interface AnalysisContext {
  region: string;
  queueId: number;
  patch: string;
  tier: string;
  division: string;
  role: string;
  championName?: string;
}

export interface EnhancedPerformanceData extends OverallPerformanceData {
  consistencyScore: number;
  overallIndex: number;
  pillars: Record<string, PillarScore>;
  improvementPriorities: ImprovementPriority[];
  rawMetrics: {
    csPerMin: number[];
    kda: number[];
    visionPerMin: number[];
    damagePerMin: number[];
    goldPerMin: number[];
    kp: number[];
    objectiveDmgPerMin: number[];
  };
  context: AnalysisContext;
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
