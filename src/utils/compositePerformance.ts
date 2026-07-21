
import { MetricDistribution } from "../types";

export interface PerformancePillar {
  name: string;
  label: string;

  calculateScore(distributions: Record<string, MetricDistribution>): number;
}


export class EconomyPillar implements PerformancePillar {
  public name = "economy";
  public label = "Economia";

  public calculateScore(distributions: Record<string, MetricDistribution>): number {
    const csDist = distributions.csPerMin;
    const goldDist = distributions.goldPerMin;

    if (!csDist || !goldDist) return 50;

    return Math.round((csDist.completion * 0.5) + (goldDist.completion * 0.5));
  }
}

export class CombatPillar implements PerformancePillar {
  public name = "combat";
  public label = "Combate";

  public calculateScore(distributions: Record<string, MetricDistribution>): number {
    const kdaDist = distributions.kda;
    const kpDist = distributions.kp;

    if (!kdaDist || !kpDist) return 50;

    return Math.round((kdaDist.completion * 0.5) + (kpDist.completion * 0.5));
  }
}

export class VisionPillar implements PerformancePillar {
  public name = "vision";
  public label = "Visão";

  public calculateScore(distributions: Record<string, MetricDistribution>): number {
    const visionDist = distributions.visionPerMin;
    if (!visionDist) return 50;

    return Math.round(visionDist.completion);
  }
}

export class ObjectivesPillar implements PerformancePillar {
  public name = "objectives";
  public label = "Objetivos";

  public calculateScore(distributions: Record<string, MetricDistribution>): number {
    const objDist = distributions.objectiveDmgPerMin;
    if (!objDist) return 50;

    return Math.round(objDist.completion);
  }
}

export class PillarRegistry {
  private pillars: PerformancePillar[] = [];

  constructor() {
    this.registerPillar(new EconomyPillar());
    this.registerPillar(new CombatPillar());
    this.registerPillar(new VisionPillar());
    this.registerPillar(new ObjectivesPillar());
  }

  public registerPillar(pillar: PerformancePillar) {
    if (this.pillars.some(p => p.name === pillar.name)) return;
    this.pillars.push(pillar);
  }

  public getPillars(): PerformancePillar[] {
    return [...this.pillars];
  }

  public calculateOverallIndex(
    distributions: Record<string, MetricDistribution>,
    roleWeights: Record<string, number>,
    consistencyScore: number
  ): { overallIndex: number; pillarScores: Record<string, number> } {
    const pillarScores: Record<string, number> = {};

    this.pillars.forEach(pillar => {
      pillarScores[pillar.name] = pillar.calculateScore(distributions);
    });

    const economyWeight = (roleWeights.farming || 20) + (roleWeights.laning || 15);
    const combatWeight = roleWeights.combat || 25;
    const visionWeight = roleWeights.vision || 15;
    const objectivesWeight = roleWeights.objectives || 15;
    const teamfightWeight = roleWeights.teamfight || 10;

    const adjustedCombatWeight = combatWeight + (teamfightWeight / 2);
    const adjustedObjectivesWeight = objectivesWeight + (teamfightWeight / 2);

    const weights: Record<string, number> = {
      economy: Math.max(5, economyWeight),
      combat: Math.max(5, adjustedCombatWeight),
      vision: Math.max(5, visionWeight),
      objectives: Math.max(5, adjustedObjectivesWeight),
    };

    let weightedPillarsSum = 0;
    let totalPillarWeight = 0;

    for (const [name, score] of Object.entries(pillarScores)) {
      const weight = weights[name] || 20;
      weightedPillarsSum += score * weight;
      totalPillarWeight += weight;
    }

    const baseIndex = totalPillarWeight > 0 ? (weightedPillarsSum / totalPillarWeight) : 50;
    const overallIndex = Math.round((baseIndex * 0.9) + (consistencyScore * 0.1));

    return {
      overallIndex,
      pillarScores,
    };
  }
}

export const globalPillarRegistry = new PillarRegistry();
