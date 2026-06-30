/**
 * Module for calculating an unofficial "Performance Rank" inspired by mmradar.gg.
 * Analyzes recent solo matches, computes a qualitative score per match,
 * assesses account health (carrying vs being carried), and projects the performance
 * into an estimated League of Legends Tier/Division.
 */

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
  damageShare: number; // 0.0 to 1.0
  killParticipation: number; // 0.0 to 1.0
  visionScore: number;
  visionScorePerMin: number;
  wardsPlaced: number;
  wardsKilled: number;
  goldEarned: number;
  goldShare: number; // 0.0 to 1.0
  gameDurationMinutes: number;

  // Optional: Provide actual averages if available. 
  // If undefined, the engine will estimate them based on your score and win/loss.
  teamAverageScore?: number;
  enemyAverageScore?: number;
}

export interface ComputePerformanceInput {
  currentTier: string;     // e.g., "GOLD"
  currentDivision: string; // e.g., "III"
  currentLP: number;
  overallWinrate: number;  // 0.0 to 1.0
  matches: MatchDataInput[];
}

export interface MatchPerformance {
  matchId: string;
  playerScore: number;
  teamAverageScore: number;
  enemyAverageScore: number;
}

export interface AccountHealth {
  status: "SMURFING" | "CARRYING" | "BALANCED" | "CARRIED" | "LOSERS_Q";
  teamStrengthIndex: number; // Percentage of games where teamAverageScore > enemyAverageScore
  explanation: string;
}

export interface PerformanceRank {
  tier: string;
  division: string;
  points: number;
  averageScore: number;
  consistency: number; // Standard deviation of scores (lower means more consistent)
  accountHealth: AccountHealth;
  matchPerformances: MatchPerformance[];
  explanation: string;
}

/**
 * Standard benchmarks used to evaluate player statistics.
 * You can adjust these weights to give more importance to vision, damage, etc.
 */
const BENCHMARKS = {
  csPerMin: 6.5,
  damageShare: 0.20,
  killParticipation: 0.50,
  visionScorePerMin: 1.0,
  kda: 2.5,
  goldShare: 0.20,
};

/**
 * Calculates a standard deviation from an array of numbers.
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Helper to clamp values between min and max.
 */
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

/**
 * Maps a calculated MMR points value to a Tier and Division.
 * Scale: 400 points per tier (100 points per division) up to Diamond.
 */
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

const DIVISIONS = ["IV", "III", "II", "I"]; // Index maps to 0, 100, 200, 300 points respectively

function getPointsFromRank(tier: string, division: string, lp: number): number {
  const t = tier.toUpperCase();
  const d = division.toUpperCase();
  const base = TIER_THRESHOLDS[t] !== undefined ? TIER_THRESHOLDS[t] : 1200; // Default Gold
  
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

/**
 * Computes a score from 0 to 100 for a specific match.
 * Weights differ based on position.
 */
function calculateMatchScore(match: MatchDataInput): number {
  let score = 0;
  const kdaRatio = (match.kills + match.assists) / Math.max(1, match.deaths);

  // Helper metric function that normalizes a stat against its benchmark
  const scoreMetric = (val: number, base: number, weight: number) => {
    const ratio = clamp(val / Math.max(0.01, base), 0, 1.5); // Caps at 1.5x expected to prevent extreme inflation
    return ratio * weight;
  };

  switch (match.position) {
    case "UTILITY":
      // Support values Vision and Kill Participation over Farm
      score += scoreMetric(match.visionScorePerMin, BENCHMARKS.visionScorePerMin * 1.5, 35);
      score += scoreMetric(match.killParticipation, BENCHMARKS.killParticipation * 1.2, 30);
      score += scoreMetric(kdaRatio, BENCHMARKS.kda * 1.2, 20);
      score += scoreMetric(match.goldShare, BENCHMARKS.goldShare * 0.7, 15);
      break;

    case "JUNGLE":
      // Junglers value KP, Gold/Min and KDA
      score += scoreMetric(match.killParticipation, BENCHMARKS.killParticipation * 1.1, 30);
      score += scoreMetric(match.goldShare, BENCHMARKS.goldShare * 1.0, 25);
      score += scoreMetric(kdaRatio, BENCHMARKS.kda, 25);
      score += scoreMetric(match.visionScorePerMin, BENCHMARKS.visionScorePerMin, 20);
      break;

    default:
      // Laners (Top, Mid, ADC) value CSing and Damage heavily
      score += scoreMetric(match.csPerMin, BENCHMARKS.csPerMin, 30);
      score += scoreMetric(match.damageShare, BENCHMARKS.damageShare, 25);
      score += scoreMetric(kdaRatio, BENCHMARKS.kda, 25);
      score += scoreMetric(match.killParticipation, BENCHMARKS.killParticipation, 20);
      break;
  }

  // Adjustments based on performance extremity
  if (match.deaths > 8) score -= (match.deaths - 8) * 2;
  if (match.win) score += 5; // Winning adds flat value

  // Final clamp and rare scale adjustments
  return clamp(score * 0.85, 0, 100); 
}

/**
 * Main function: computes the overall Performance Rank across recent matches.
 * 
 * @param input ComputePerformanceInput containing rank state and matches
 * @returns PerformanceRank object with estimated tier, score, and explanation
 */
export function computePerformanceRank(input: ComputePerformanceInput): PerformanceRank {
  const { currentTier, currentDivision, currentLP, matches } = input;
  
  if (matches.length === 0) {
    return {
      tier: currentTier,
      division: currentDivision,
      points: 0,
      averageScore: 0,
      consistency: 0,
      accountHealth: {
         status: "BALANCED",
         teamStrengthIndex: 0.5,
         explanation: "Not enough matches to compute."
      },
      matchPerformances: [],
      explanation: "No match data available."
    };
  }

  const matchPerformances: MatchPerformance[] = [];
  const scores: number[] = [];
  let strongerTeamCount = 0;

  for (const m of matches) {
    const playerScore = calculateMatchScore(m);
    
    // Use provided averages or estimate if not given.
    // If we won, the team average is probably slightly better than enemy.
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

  // 1. Calculate Average Score & Consistency
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const consistency = calculateStandardDeviation(scores);

  // 2. Compute Account Health
  const teamStrengthIndex = strongerTeamCount / matches.length;
  let healthStatus: AccountHealth["status"] = "BALANCED";
  let healthExp = "Your matches have had relatively balanced teams.";

  if (teamStrengthIndex > 0.65) {
      healthStatus = "CARRIED";
      healthExp = "You are frequently placed in teams that outperform the enemy team naturally. You might be getting carried.";
  } else if (teamStrengthIndex < 0.35) {
      healthStatus = "LOSERS_Q";
      healthExp = "You are frequently placed in weaker teams. You're suffering from bad matchmaking (Loser's Queue).";
  } else if (averageScore >= 75 && teamStrengthIndex <= 0.5) {
      healthStatus = "CARRYING";
      healthExp = "You are the win condition. Despite average or weaker teams, your individual performance is stellar.";
  } else if (averageScore >= 85) {
      healthStatus = "SMURFING";
      healthExp = "Your performance heavily eclipses your current rank.";
  }

  const accountHealth: AccountHealth = {
    status: healthStatus,
    teamStrengthIndex,
    explanation: healthExp,
  };

  // 3. Project new Tier & Division based on Performance
  // Baseline points from current Riot rank
  let currentPoints = getPointsFromRank(currentTier, currentDivision, currentLP);

  // Normalize average score (0 to 100) to a modifier offset.
  // 50 is expected for your current rank. 
  // If you average 70+, you are performing +1 full division better (approx +100 points).
  // If you average 85+, you are performing +2-3 divisions better.
  const scoreDiff = averageScore - 50; 
  
  // Example multiplier: Every point above/below 50 translates to 5 MMR points.
  // +20 score (70 avg) = +100 points (1 Division UP)
  let mmrOffset = scoreDiff * 5.0;

  // Account Health modifies the offset.
  // If you are carrying in Loser's Q, your performance MMR is even higher.
  if (healthStatus === "LOSERS_Q" || healthStatus === "CARRYING") {
    mmrOffset += 50; 
  } else if (healthStatus === "CARRIED") {
    mmrOffset -= 50; 
  }

  const performancePoints = clamp(currentPoints + mmrOffset, 0, 4000);
  const perfRank = getRankFromPoints(performancePoints);

  return {
    tier: perfRank.tier,
    division: perfRank.division,
    points: performancePoints,
    averageScore,
    consistency,
    accountHealth,
    matchPerformances,
    explanation: `Based on your recent score of ${averageScore.toFixed(1)}, adjusted by your account health (${healthStatus}), your expected rank is ${perfRank.tier} ${perfRank.division}.`
  };
}
