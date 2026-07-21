

export interface MetricBenchmark {
  median: number;
  q1: number;
  q3: number;
  std: number;
}

export interface RoleBenchmark {
  csPerMin: MetricBenchmark;
  kda: MetricBenchmark;
  visionPerMin: MetricBenchmark;
  damagePerMin: MetricBenchmark;
  goldPerMin: MetricBenchmark;
  kp: MetricBenchmark;
  objectiveDmgPerMin: MetricBenchmark;
}

export type TierKey =
  | 'IRON' | 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
  | 'EMERALD' | 'DIAMOND' | 'MASTER' | 'GRANDMASTER' | 'CHALLENGER';

export type RoleKey = 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY';

export interface RoleWeights {
  [key: string]: number;
  laning: number;
  farming: number;
  objectives: number;
  combat: number;
  teamfight: number;
  vision: number;
}

export const ROLE_WEIGHTS: Record<RoleKey, RoleWeights> = {
  TOP: { laning: 20, farming: 22, objectives: 12, combat: 22, teamfight: 14, vision: 10 },
  JUNGLE: { laning: 5, farming: 18, objectives: 25, combat: 18, teamfight: 18, vision: 16 },
  MIDDLE: { laning: 18, farming: 20, objectives: 10, combat: 25, teamfight: 17, vision: 10 },
  BOTTOM: { laning: 18, farming: 25, objectives: 8, combat: 25, teamfight: 14, vision: 10 },
  UTILITY: { laning: 10, farming: 3, objectives: 12, combat: 10, teamfight: 25, vision: 40 },
};


function mb(median: number, q1: number, q3: number, std: number): MetricBenchmark {
  return { median, q1, q3, std };
}

export const BENCHMARKS: Record<TierKey, Record<RoleKey, RoleBenchmark>> = {

  // ────────────────────── IRON ──────────────────────
  IRON: {
    TOP: {
      csPerMin: mb(4.2, 3.2, 5.2, 1.1),
      kda: mb(1.4, 0.8, 2.2, 0.9),
      visionPerMin: mb(0.30, 0.15, 0.50, 0.18),
      damagePerMin: mb(380, 250, 520, 140),
      goldPerMin: mb(310, 250, 370, 60),
      kp: mb(32, 20, 45, 12),
      objectiveDmgPerMin: mb(180, 80, 320, 120),
    },
    JUNGLE: {
      csPerMin: mb(3.8, 2.8, 4.8, 1.0),
      kda: mb(1.5, 0.9, 2.3, 0.9),
      visionPerMin: mb(0.35, 0.18, 0.55, 0.20),
      damagePerMin: mb(340, 220, 470, 130),
      goldPerMin: mb(300, 240, 360, 60),
      kp: mb(38, 25, 52, 14),
      objectiveDmgPerMin: mb(280, 150, 430, 140),
    },
    MIDDLE: {
      csPerMin: mb(4.5, 3.5, 5.5, 1.1),
      kda: mb(1.5, 0.9, 2.3, 0.9),
      visionPerMin: mb(0.28, 0.14, 0.45, 0.16),
      damagePerMin: mb(420, 280, 570, 150),
      goldPerMin: mb(320, 260, 380, 60),
      kp: mb(35, 22, 48, 13),
      objectiveDmgPerMin: mb(140, 60, 240, 100),
    },
    BOTTOM: {
      csPerMin: mb(4.8, 3.6, 6.0, 1.2),
      kda: mb(1.6, 0.9, 2.5, 1.0),
      visionPerMin: mb(0.25, 0.12, 0.42, 0.15),
      damagePerMin: mb(440, 290, 600, 160),
      goldPerMin: mb(330, 270, 400, 65),
      kp: mb(34, 22, 48, 13),
      objectiveDmgPerMin: mb(160, 70, 280, 110),
    },
    UTILITY: {
      csPerMin: mb(0.8, 0.3, 1.5, 0.6),
      kda: mb(1.6, 0.9, 2.6, 1.0),
      visionPerMin: mb(0.55, 0.30, 0.85, 0.28),
      damagePerMin: mb(180, 100, 280, 90),
      goldPerMin: mb(220, 170, 270, 50),
      kp: mb(40, 28, 55, 14),
      objectiveDmgPerMin: mb(60, 20, 120, 55),
    },
  },

  BRONZE: {
    TOP: {
      csPerMin: mb(4.8, 3.8, 5.8, 1.0),
      kda: mb(1.7, 1.0, 2.5, 0.8),
      visionPerMin: mb(0.35, 0.18, 0.55, 0.19),
      damagePerMin: mb(420, 290, 560, 140),
      goldPerMin: mb(330, 270, 390, 60),
      kp: mb(35, 23, 48, 13),
      objectiveDmgPerMin: mb(210, 100, 350, 130),
    },
    JUNGLE: {
      csPerMin: mb(4.2, 3.2, 5.2, 1.0),
      kda: mb(1.8, 1.1, 2.7, 0.9),
      visionPerMin: mb(0.40, 0.22, 0.62, 0.20),
      damagePerMin: mb(370, 250, 510, 130),
      goldPerMin: mb(315, 255, 375, 60),
      kp: mb(42, 28, 56, 14),
      objectiveDmgPerMin: mb(320, 180, 480, 150),
    },
    MIDDLE: {
      csPerMin: mb(5.0, 4.0, 6.0, 1.0),
      kda: mb(1.8, 1.0, 2.7, 0.9),
      visionPerMin: mb(0.32, 0.16, 0.50, 0.17),
      damagePerMin: mb(460, 310, 620, 160),
      goldPerMin: mb(340, 280, 400, 60),
      kp: mb(38, 25, 52, 14),
      objectiveDmgPerMin: mb(160, 70, 270, 100),
    },
    BOTTOM: {
      csPerMin: mb(5.3, 4.2, 6.4, 1.1),
      kda: mb(1.9, 1.1, 2.9, 0.9),
      visionPerMin: mb(0.30, 0.15, 0.48, 0.17),
      damagePerMin: mb(480, 330, 650, 160),
      goldPerMin: mb(350, 290, 420, 65),
      kp: mb(37, 24, 50, 13),
      objectiveDmgPerMin: mb(180, 80, 310, 120),
    },
    UTILITY: {
      csPerMin: mb(0.9, 0.4, 1.6, 0.6),
      kda: mb(1.9, 1.1, 2.9, 1.0),
      visionPerMin: mb(0.65, 0.38, 0.95, 0.30),
      damagePerMin: mb(200, 110, 300, 95),
      goldPerMin: mb(235, 185, 285, 50),
      kp: mb(44, 30, 58, 14),
      objectiveDmgPerMin: mb(70, 25, 135, 55),
    },
  },

  SILVER: {
    TOP: {
      csPerMin: mb(5.4, 4.4, 6.4, 1.0),
      kda: mb(2.0, 1.2, 2.8, 0.8),
      visionPerMin: mb(0.42, 0.24, 0.65, 0.20),
      damagePerMin: mb(460, 330, 600, 140),
      goldPerMin: mb(355, 295, 415, 60),
      kp: mb(38, 26, 52, 13),
      objectiveDmgPerMin: mb(240, 120, 380, 130),
    },
    JUNGLE: {
      csPerMin: mb(4.6, 3.6, 5.6, 1.0),
      kda: mb(2.1, 1.3, 3.0, 0.9),
      visionPerMin: mb(0.48, 0.28, 0.72, 0.22),
      damagePerMin: mb(400, 280, 540, 130),
      goldPerMin: mb(335, 275, 395, 60),
      kp: mb(46, 32, 60, 14),
      objectiveDmgPerMin: mb(360, 210, 530, 160),
    },
    MIDDLE: {
      csPerMin: mb(5.6, 4.6, 6.6, 1.0),
      kda: mb(2.0, 1.2, 2.9, 0.9),
      visionPerMin: mb(0.38, 0.20, 0.58, 0.19),
      damagePerMin: mb(500, 350, 670, 160),
      goldPerMin: mb(360, 300, 420, 60),
      kp: mb(40, 27, 54, 14),
      objectiveDmgPerMin: mb(180, 80, 300, 110),
    },
    BOTTOM: {
      csPerMin: mb(5.8, 4.8, 6.8, 1.0),
      kda: mb(2.2, 1.3, 3.2, 1.0),
      visionPerMin: mb(0.35, 0.18, 0.55, 0.19),
      damagePerMin: mb(520, 370, 700, 165),
      goldPerMin: mb(375, 315, 440, 65),
      kp: mb(40, 27, 54, 14),
      objectiveDmgPerMin: mb(200, 100, 330, 120),
    },
    UTILITY: {
      csPerMin: mb(1.0, 0.4, 1.7, 0.6),
      kda: mb(2.2, 1.3, 3.3, 1.0),
      visionPerMin: mb(0.78, 0.48, 1.10, 0.32),
      damagePerMin: mb(220, 130, 320, 100),
      goldPerMin: mb(250, 200, 300, 50),
      kp: mb(48, 34, 62, 14),
      objectiveDmgPerMin: mb(80, 30, 150, 60),
    },
  },

  GOLD: {
    TOP: {
      csPerMin: mb(6.0, 5.0, 7.0, 1.0),
      kda: mb(2.2, 1.4, 3.2, 0.9),
      visionPerMin: mb(0.50, 0.30, 0.75, 0.22),
      damagePerMin: mb(500, 360, 650, 145),
      goldPerMin: mb(380, 320, 440, 60),
      kp: mb(40, 28, 54, 13),
      objectiveDmgPerMin: mb(270, 140, 420, 140),
    },
    JUNGLE: {
      csPerMin: mb(5.0, 4.0, 6.0, 1.0),
      kda: mb(2.4, 1.5, 3.4, 1.0),
      visionPerMin: mb(0.55, 0.34, 0.82, 0.24),
      damagePerMin: mb(430, 310, 570, 130),
      goldPerMin: mb(355, 295, 415, 60),
      kp: mb(50, 36, 64, 14),
      objectiveDmgPerMin: mb(400, 240, 580, 170),
    },
    MIDDLE: {
      csPerMin: mb(6.2, 5.2, 7.2, 1.0),
      kda: mb(2.3, 1.4, 3.3, 1.0),
      visionPerMin: mb(0.45, 0.25, 0.68, 0.22),
      damagePerMin: mb(550, 400, 720, 160),
      goldPerMin: mb(385, 325, 445, 60),
      kp: mb(43, 30, 57, 14),
      objectiveDmgPerMin: mb(200, 100, 330, 120),
    },
    BOTTOM: {
      csPerMin: mb(6.4, 5.4, 7.4, 1.0),
      kda: mb(2.5, 1.5, 3.6, 1.0),
      visionPerMin: mb(0.40, 0.22, 0.62, 0.20),
      damagePerMin: mb(570, 410, 750, 170),
      goldPerMin: mb(400, 340, 465, 65),
      kp: mb(43, 30, 56, 13),
      objectiveDmgPerMin: mb(220, 110, 360, 130),
    },
    UTILITY: {
      csPerMin: mb(1.0, 0.4, 1.8, 0.7),
      kda: mb(2.6, 1.5, 3.8, 1.2),
      visionPerMin: mb(0.92, 0.60, 1.28, 0.35),
      damagePerMin: mb(240, 150, 340, 100),
      goldPerMin: mb(265, 215, 315, 50),
      kp: mb(52, 38, 66, 14),
      objectiveDmgPerMin: mb(90, 35, 165, 65),
    },
  },

  PLATINUM: {
    TOP: {
      csPerMin: mb(6.5, 5.5, 7.5, 1.0),
      kda: mb(2.4, 1.6, 3.4, 0.9),
      visionPerMin: mb(0.58, 0.36, 0.85, 0.25),
      damagePerMin: mb(530, 390, 690, 150),
      goldPerMin: mb(400, 340, 460, 60),
      kp: mb(42, 30, 56, 13),
      objectiveDmgPerMin: mb(300, 165, 460, 150),
    },
    JUNGLE: {
      csPerMin: mb(5.4, 4.4, 6.4, 1.0),
      kda: mb(2.6, 1.7, 3.7, 1.0),
      visionPerMin: mb(0.64, 0.40, 0.92, 0.26),
      damagePerMin: mb(460, 340, 600, 130),
      goldPerMin: mb(375, 315, 435, 60),
      kp: mb(53, 40, 67, 14),
      objectiveDmgPerMin: mb(440, 270, 630, 180),
    },
    MIDDLE: {
      csPerMin: mb(6.8, 5.8, 7.8, 1.0),
      kda: mb(2.5, 1.6, 3.5, 1.0),
      visionPerMin: mb(0.52, 0.30, 0.78, 0.24),
      damagePerMin: mb(590, 430, 770, 170),
      goldPerMin: mb(405, 345, 465, 60),
      kp: mb(45, 32, 59, 14),
      objectiveDmgPerMin: mb(220, 110, 360, 125),
    },
    BOTTOM: {
      csPerMin: mb(6.9, 5.9, 7.9, 1.0),
      kda: mb(2.7, 1.7, 3.8, 1.1),
      visionPerMin: mb(0.46, 0.26, 0.70, 0.22),
      damagePerMin: mb(610, 450, 790, 170),
      goldPerMin: mb(420, 360, 485, 65),
      kp: mb(45, 32, 58, 13),
      objectiveDmgPerMin: mb(240, 120, 390, 135),
    },
    UTILITY: {
      csPerMin: mb(1.1, 0.4, 1.9, 0.7),
      kda: mb(2.8, 1.7, 4.2, 1.2),
      visionPerMin: mb(1.05, 0.70, 1.45, 0.38),
      damagePerMin: mb(260, 160, 370, 105),
      goldPerMin: mb(280, 230, 330, 50),
      kp: mb(55, 42, 68, 13),
      objectiveDmgPerMin: mb(100, 40, 180, 70),
    },
  },

  EMERALD: {
    TOP: {
      csPerMin: mb(7.0, 6.0, 8.0, 1.0),
      kda: mb(2.6, 1.8, 3.6, 0.9),
      visionPerMin: mb(0.68, 0.44, 0.96, 0.26),
      damagePerMin: mb(570, 420, 740, 160),
      goldPerMin: mb(420, 360, 480, 60),
      kp: mb(44, 32, 58, 13),
      objectiveDmgPerMin: mb(330, 190, 500, 155),
    },
    JUNGLE: {
      csPerMin: mb(5.8, 4.8, 6.8, 1.0),
      kda: mb(2.8, 1.9, 4.0, 1.0),
      visionPerMin: mb(0.74, 0.48, 1.04, 0.28),
      damagePerMin: mb(490, 360, 640, 140),
      goldPerMin: mb(395, 335, 455, 60),
      kp: mb(56, 43, 69, 13),
      objectiveDmgPerMin: mb(480, 300, 680, 190),
    },
    MIDDLE: {
      csPerMin: mb(7.2, 6.2, 8.2, 1.0),
      kda: mb(2.7, 1.8, 3.8, 1.0),
      visionPerMin: mb(0.60, 0.36, 0.88, 0.26),
      damagePerMin: mb(640, 470, 830, 180),
      goldPerMin: mb(425, 365, 485, 60),
      kp: mb(47, 34, 61, 14),
      objectiveDmgPerMin: mb(240, 125, 385, 130),
    },
    BOTTOM: {
      csPerMin: mb(7.4, 6.4, 8.4, 1.0),
      kda: mb(2.9, 1.9, 4.1, 1.1),
      visionPerMin: mb(0.52, 0.30, 0.78, 0.24),
      damagePerMin: mb(650, 490, 840, 175),
      goldPerMin: mb(440, 380, 505, 65),
      kp: mb(47, 34, 60, 13),
      objectiveDmgPerMin: mb(260, 135, 415, 140),
    },
    UTILITY: {
      csPerMin: mb(1.1, 0.4, 2.0, 0.7),
      kda: mb(3.0, 1.9, 4.5, 1.3),
      visionPerMin: mb(1.18, 0.82, 1.60, 0.40),
      damagePerMin: mb(280, 175, 400, 112),
      goldPerMin: mb(295, 245, 345, 50),
      kp: mb(58, 45, 71, 13),
      objectiveDmgPerMin: mb(110, 45, 195, 75),
    },
  },

  DIAMOND: {
    TOP: {
      csPerMin: mb(7.5, 6.5, 8.5, 1.0),
      kda: mb(2.8, 2.0, 3.8, 0.9),
      visionPerMin: mb(0.78, 0.52, 1.08, 0.28),
      damagePerMin: mb(610, 460, 780, 160),
      goldPerMin: mb(440, 380, 500, 60),
      kp: mb(46, 34, 60, 13),
      objectiveDmgPerMin: mb(360, 210, 540, 165),
    },
    JUNGLE: {
      csPerMin: mb(6.2, 5.2, 7.2, 1.0),
      kda: mb(3.0, 2.1, 4.2, 1.1),
      visionPerMin: mb(0.84, 0.56, 1.16, 0.30),
      damagePerMin: mb(520, 390, 670, 140),
      goldPerMin: mb(415, 355, 475, 60),
      kp: mb(58, 46, 71, 13),
      objectiveDmgPerMin: mb(520, 330, 730, 200),
    },
    MIDDLE: {
      csPerMin: mb(7.8, 6.8, 8.8, 1.0),
      kda: mb(2.9, 2.0, 4.0, 1.0),
      visionPerMin: mb(0.68, 0.44, 0.98, 0.27),
      damagePerMin: mb(690, 510, 890, 190),
      goldPerMin: mb(445, 385, 505, 60),
      kp: mb(49, 36, 63, 14),
      objectiveDmgPerMin: mb(260, 140, 410, 135),
    },
    BOTTOM: {
      csPerMin: mb(7.9, 6.9, 8.9, 1.0),
      kda: mb(3.1, 2.1, 4.4, 1.1),
      visionPerMin: mb(0.58, 0.35, 0.85, 0.25),
      damagePerMin: mb(700, 530, 900, 185),
      goldPerMin: mb(460, 400, 525, 65),
      kp: mb(49, 36, 62, 13),
      objectiveDmgPerMin: mb(280, 150, 440, 145),
    },
    UTILITY: {
      csPerMin: mb(1.2, 0.4, 2.1, 0.7),
      kda: mb(3.2, 2.1, 4.8, 1.3),
      visionPerMin: mb(1.32, 0.94, 1.78, 0.42),
      damagePerMin: mb(300, 190, 420, 115),
      goldPerMin: mb(310, 260, 360, 50),
      kp: mb(60, 48, 73, 13),
      objectiveDmgPerMin: mb(120, 50, 210, 80),
    },
  },

  MASTER: {
    TOP: {
      csPerMin: mb(8.0, 7.0, 9.0, 1.0),
      kda: mb(3.0, 2.2, 4.0, 0.9),
      visionPerMin: mb(0.88, 0.60, 1.20, 0.30),
      damagePerMin: mb(650, 500, 820, 160),
      goldPerMin: mb(460, 400, 520, 60),
      kp: mb(48, 36, 62, 13),
      objectiveDmgPerMin: mb(390, 235, 580, 170),
    },
    JUNGLE: {
      csPerMin: mb(6.5, 5.5, 7.5, 1.0),
      kda: mb(3.2, 2.3, 4.5, 1.1),
      visionPerMin: mb(0.94, 0.64, 1.28, 0.32),
      damagePerMin: mb(550, 420, 700, 140),
      goldPerMin: mb(435, 375, 495, 60),
      kp: mb(60, 48, 73, 13),
      objectiveDmgPerMin: mb(560, 360, 780, 210),
    },
    MIDDLE: {
      csPerMin: mb(8.2, 7.2, 9.2, 1.0),
      kda: mb(3.1, 2.2, 4.2, 1.0),
      visionPerMin: mb(0.78, 0.52, 1.08, 0.28),
      damagePerMin: mb(730, 550, 930, 190),
      goldPerMin: mb(465, 405, 525, 60),
      kp: mb(50, 38, 64, 13),
      objectiveDmgPerMin: mb(280, 155, 435, 140),
    },
    BOTTOM: {
      csPerMin: mb(8.4, 7.4, 9.4, 1.0),
      kda: mb(3.3, 2.3, 4.6, 1.1),
      visionPerMin: mb(0.64, 0.40, 0.92, 0.26),
      damagePerMin: mb(750, 570, 950, 190),
      goldPerMin: mb(480, 420, 545, 65),
      kp: mb(50, 38, 64, 13),
      objectiveDmgPerMin: mb(300, 165, 465, 150),
    },
    UTILITY: {
      csPerMin: mb(1.2, 0.5, 2.2, 0.7),
      kda: mb(3.4, 2.3, 5.0, 1.4),
      visionPerMin: mb(1.45, 1.05, 1.95, 0.45),
      damagePerMin: mb(320, 205, 450, 120),
      goldPerMin: mb(325, 275, 375, 50),
      kp: mb(62, 50, 75, 13),
      objectiveDmgPerMin: mb(130, 55, 225, 85),
    },
  },

  GRANDMASTER: {
    TOP: {
      csPerMin: mb(8.4, 7.4, 9.4, 1.0),
      kda: mb(3.2, 2.4, 4.2, 0.9),
      visionPerMin: mb(0.96, 0.66, 1.30, 0.32),
      damagePerMin: mb(680, 530, 860, 165),
      goldPerMin: mb(480, 420, 540, 60),
      kp: mb(50, 38, 64, 13),
      objectiveDmgPerMin: mb(420, 260, 610, 175),
    },
    JUNGLE: {
      csPerMin: mb(6.8, 5.8, 7.8, 1.0),
      kda: mb(3.4, 2.5, 4.7, 1.1),
      visionPerMin: mb(1.02, 0.72, 1.38, 0.33),
      damagePerMin: mb(580, 450, 730, 140),
      goldPerMin: mb(455, 395, 515, 60),
      kp: mb(62, 50, 75, 13),
      objectiveDmgPerMin: mb(600, 390, 830, 220),
    },
    MIDDLE: {
      csPerMin: mb(8.6, 7.6, 9.6, 1.0),
      kda: mb(3.3, 2.4, 4.4, 1.0),
      visionPerMin: mb(0.86, 0.58, 1.18, 0.30),
      damagePerMin: mb(770, 590, 970, 190),
      goldPerMin: mb(485, 425, 545, 60),
      kp: mb(52, 40, 66, 13),
      objectiveDmgPerMin: mb(300, 170, 460, 145),
    },
    BOTTOM: {
      csPerMin: mb(8.8, 7.8, 9.8, 1.0),
      kda: mb(3.5, 2.5, 4.8, 1.2),
      visionPerMin: mb(0.70, 0.44, 0.98, 0.27),
      damagePerMin: mb(790, 610, 1000, 195),
      goldPerMin: mb(500, 440, 565, 65),
      kp: mb(52, 40, 66, 13),
      objectiveDmgPerMin: mb(320, 180, 490, 155),
    },
    UTILITY: {
      csPerMin: mb(1.3, 0.5, 2.3, 0.7),
      kda: mb(3.6, 2.4, 5.2, 1.4),
      visionPerMin: mb(1.58, 1.14, 2.10, 0.48),
      damagePerMin: mb(340, 220, 470, 125),
      goldPerMin: mb(340, 290, 390, 50),
      kp: mb(64, 52, 77, 13),
      objectiveDmgPerMin: mb(140, 60, 240, 90),
    },
  },

  CHALLENGER: {
    TOP: {
      csPerMin: mb(8.8, 7.8, 9.8, 1.0),
      kda: mb(3.4, 2.6, 4.4, 0.9),
      visionPerMin: mb(1.04, 0.74, 1.40, 0.33),
      damagePerMin: mb(720, 560, 900, 170),
      goldPerMin: mb(500, 440, 560, 60),
      kp: mb(52, 40, 66, 13),
      objectiveDmgPerMin: mb(450, 285, 645, 180),
    },
    JUNGLE: {
      csPerMin: mb(7.0, 6.0, 8.0, 1.0),
      kda: mb(3.6, 2.7, 4.9, 1.1),
      visionPerMin: mb(1.10, 0.80, 1.48, 0.34),
      damagePerMin: mb(600, 470, 750, 140),
      goldPerMin: mb(475, 415, 535, 60),
      kp: mb(64, 52, 77, 13),
      objectiveDmgPerMin: mb(640, 420, 880, 230),
    },
    MIDDLE: {
      csPerMin: mb(9.0, 8.0, 10.0, 1.0),
      kda: mb(3.5, 2.6, 4.6, 1.0),
      visionPerMin: mb(0.94, 0.66, 1.28, 0.31),
      damagePerMin: mb(810, 630, 1010, 190),
      goldPerMin: mb(505, 445, 565, 60),
      kp: mb(54, 42, 68, 13),
      objectiveDmgPerMin: mb(320, 185, 485, 150),
    },
    BOTTOM: {
      csPerMin: mb(9.2, 8.2, 10.2, 1.0),
      kda: mb(3.7, 2.7, 5.0, 1.2),
      visionPerMin: mb(0.76, 0.50, 1.06, 0.28),
      damagePerMin: mb(830, 650, 1040, 200),
      goldPerMin: mb(520, 460, 585, 65),
      kp: mb(54, 42, 68, 13),
      objectiveDmgPerMin: mb(340, 195, 515, 160),
    },
    UTILITY: {
      csPerMin: mb(1.3, 0.5, 2.4, 0.8),
      kda: mb(3.8, 2.6, 5.4, 1.4),
      visionPerMin: mb(1.70, 1.24, 2.24, 0.50),
      damagePerMin: mb(360, 240, 500, 130),
      goldPerMin: mb(355, 305, 405, 50),
      kp: mb(66, 54, 79, 13),
      objectiveDmgPerMin: mb(150, 65, 255, 95),
    },
  },
};



export function getBenchmark(tier: string, role: string): RoleBenchmark {
  const t = (tier?.toUpperCase() || 'GOLD') as TierKey;
  const r = (role?.toUpperCase() || 'MIDDLE') as RoleKey;

  const tierData = BENCHMARKS[t] || BENCHMARKS.GOLD;
  return tierData[r] || tierData.MIDDLE;
}

export function getRoleWeights(role: string): RoleWeights {
  const r = (role?.toUpperCase() || 'MIDDLE') as RoleKey;
  return ROLE_WEIGHTS[r] || ROLE_WEIGHTS.MIDDLE;
}

export const TIER_DISPLAY_NAMES: Record<string, string> = {
  IRON: 'Ferro',
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
  PLATINUM: 'Platina',
  EMERALD: 'Esmeralda',
  DIAMOND: 'Diamante',
  MASTER: 'Mestre',
  GRANDMASTER: 'Grão-Mestre',
  CHALLENGER: 'Desafiante',
  UNRANKED: 'Sem Rank',
};


export const TIER_ORDER: TierKey[] = [
  'IRON', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM',
  'EMERALD', 'DIAMOND', 'MASTER', 'GRANDMASTER', 'CHALLENGER',
];
