import { MatchData } from "../types";
import { BENCHMARKS, getBenchmark as getPriorBenchmark, type RoleBenchmark, type MetricBenchmark, type TierKey, type RoleKey } from "./benchmarks";
import { median, standardDeviation, percentile, bayesianShrinkage } from "./statistics";
import { Position } from "./performanceEngine";
import { AnalysisContext } from "../types";

interface RawParticipantSample {
  csPerMin: number;
  kda: number;
  visionPerMin: number;
  damagePerMin: number;
  goldPerMin: number;
  kp: number;
  objectiveDmgPerMin: number;
}

export class BenchmarkProvider {
  private samples = new Map<string, RawParticipantSample[]>();

  constructor() {
  }

  public feedMatches(matches: MatchData[], playerTier: string, playerRank: string) {
    if (!matches || matches.length === 0) return;

    matches.forEach(match => {
      const durationMin = Math.max(1, match.info.gameDuration / 60);
      const queueId = match.info.queueId;
      const gameVersion = match.info.gameVersion || "15.1.0";
      const patchParts = gameVersion.split(".");
      const patch = patchParts.length >= 2 ? `${patchParts[0]}.${patchParts[1]}` : "15.1";
      const matchId = match.metadata.matchId || "";
      const region = matchId.split("_")[0]?.toLowerCase() || "br1";

      match.info.participants.forEach(p => {
        const role = (p.teamPosition || p.individualPosition || "UNKNOWN") as Position;
        if (role === "UNKNOWN") return;

        const championName = p.championName;
        const kills = p.kills;
        const deaths = p.deaths;
        const assists = p.assists;
        const cs = p.totalMinionsKilled + p.neutralMinionsKilled;

        const teamParticipants = match.info.participants.filter(part => part.teamId === p.teamId);
        const teamKills = Math.max(1, teamParticipants.reduce((acc, curr) => acc + curr.kills, 0));

        const sample: RawParticipantSample = {
          csPerMin: cs / durationMin,
          kda: (kills + assists) / Math.max(1, deaths),
          visionPerMin: p.visionScore / durationMin,
          damagePerMin: p.totalDamageDealtToChampions / durationMin,
          goldPerMin: p.goldEarned / durationMin,
          kp: ((kills + assists) / teamKills) * 100,
          objectiveDmgPerMin: (p.damageDealtToObjectives || 0) / durationMin
        };

        const tier = playerTier.toUpperCase();

        const keySpecific = `${tier}:${role}:${championName}`.toUpperCase();
        this.addSample(keySpecific, sample);
        const keyCoarse = `${tier}:${role}`.toUpperCase();
        this.addSample(keyCoarse, sample);
      });
    });
  }

  private addSample(key: string, sample: RawParticipantSample) {
    if (!this.samples.has(key)) {
      this.samples.set(key, []);
    }
    this.samples.get(key)!.push(sample);
  }

  public getMetricBenchmark(
    context: AnalysisContext,
    metricKey: keyof RawParticipantSample
  ): MetricBenchmark {
    const tier = context.tier.toUpperCase() as TierKey;
    const role = (context.role || "MIDDLE").toUpperCase() as RoleKey;
    const champion = context.championName || "";

    const priorBenchmark = getPriorBenchmark(tier, role);
    const priorMetric = priorBenchmark[metricKey === "objectiveDmgPerMin" ? "objectiveDmgPerMin" : metricKey === "kp" ? "kp" : metricKey === "goldPerMin" ? "goldPerMin" : metricKey === "damagePerMin" ? "damagePerMin" : metricKey === "visionPerMin" ? "visionPerMin" : metricKey === "kda" ? "kda" : "csPerMin"];

    let resolvedSamples: RawParticipantSample[] = [];

    // Check specific: Tier + Role + Champion
    const keySpecific = `${tier}:${role}:${champion}`.toUpperCase();
    const specificSamples = this.samples.get(keySpecific) || [];

    if (specificSamples.length >= 10) {
      resolvedSamples = specificSamples;
    } else {
      // Check coarse: Tier + Role
      const keyCoarse = `${tier}:${role}`.toUpperCase();
      resolvedSamples = this.samples.get(keyCoarse) || [];
    }

    const n = resolvedSamples.length;
    if (n < 3) {
      return priorMetric;
    }

    const observedValues = resolvedSamples.map(s => s[metricKey]);
    const obsMedian = median(observedValues);
    const obsStd = standardDeviation(observedValues);
    const obsQ1 = percentile(observedValues, 25);
    const obsQ3 = percentile(observedValues, 75);

    const priorWeight = 12;
    const blendedMedian = bayesianShrinkage(obsMedian, priorMetric.median, n, priorWeight);
    const blendedStd = bayesianShrinkage(obsStd, priorMetric.std, n, priorWeight);
    const blendedQ1 = bayesianShrinkage(obsQ1, priorMetric.q1, n, priorWeight);
    const blendedQ3 = bayesianShrinkage(obsQ3, priorMetric.q3, n, priorWeight);

    return {
      median: Number(blendedMedian.toFixed(3)),
      q1: Number(blendedQ1.toFixed(3)),
      q3: Number(blendedQ3.toFixed(3)),
      std: Number(blendedStd.toFixed(3))
    };
  }

  public getRoleBenchmark(context: AnalysisContext): RoleBenchmark {
    return {
      csPerMin: this.getMetricBenchmark(context, "csPerMin"),
      kda: this.getMetricBenchmark(context, "kda"),
      visionPerMin: this.getMetricBenchmark(context, "visionPerMin"),
      damagePerMin: this.getMetricBenchmark(context, "damagePerMin"),
      goldPerMin: this.getMetricBenchmark(context, "goldPerMin"),
      kp: this.getMetricBenchmark(context, "kp"),
      objectiveDmgPerMin: this.getMetricBenchmark(context, "objectiveDmgPerMin")
    };
  }

  public getSampleSize(context: AnalysisContext): number {
    const tier = context.tier.toUpperCase();
    const role = (context.role || "MIDDLE").toUpperCase();
    const champion = context.championName || "";

    const keySpecific = `${tier}:${role}:${champion}`.toUpperCase();
    const specificCount = this.samples.get(keySpecific)?.length || 0;
    if (specificCount >= 10) return specificCount;

    const keyCoarse = `${tier}:${role}`.toUpperCase();
    return this.samples.get(keyCoarse)?.length || 0;
  }
}

export const globalBenchmarkProvider = new BenchmarkProvider();
