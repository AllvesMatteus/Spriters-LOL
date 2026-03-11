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
      visionScore: number;
      individualPosition: string;
      teamPosition: string;
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
