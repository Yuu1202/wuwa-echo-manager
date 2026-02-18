// ============================================================
// calculator.js — Semua rumus kalkulasi echo
// Pure functions, tidak ada DOM manipulation di sini
// ============================================================

import { SUBSTAT_DATA } from "../data/echoes.js";

// ----------------------------------------------------------
// 1. SUBSTAT ROLL EFFICIENCY
// Seberapa tinggi roll yang didapat relatif terhadap range-nya
// Output: 0.0 (minimum) — 1.0 (maximum)
// ----------------------------------------------------------
export function calcEfficiency(statName, statValue) {
  const data = SUBSTAT_DATA[statName];
  if (!data) return 0;

  const { min, max } = data;
  if (max === min) return 0; // hindari division by zero

  const efficiency = (statValue - min) / (max - min);

  // Clamp antara 0 dan 1
  return Math.min(1, Math.max(0, efficiency));
}

// ----------------------------------------------------------
// 2. ECHO SCORE (WEIGHTED CONTRIBUTION)
// Skor total satu echo berdasarkan substat + weight karakter
// Output: angka positif, makin tinggi makin bagus
// ----------------------------------------------------------
// substats: array of { name: string, value: number }
// weights:  object  { [statName]: number (0.0 - 1.0) }
// ----------------------------------------------------------
export function calcEchoScore(substats, weights) {
  let totalScore = 0;

  for (const { name, value } of substats) {
    const weight = weights[name] ?? 0;
    if (weight === 0) continue; // skip stat yang tidak relevan

    const efficiency = calcEfficiency(name, value);
    totalScore += (1 + efficiency) * weight;
  }

  return totalScore;
}

// ----------------------------------------------------------
// 3. ECHO SCORE BREAKDOWN
// Sama seperti calcEchoScore tapi return detail per substat
// Berguna untuk ditampilkan di UI
// ----------------------------------------------------------
export function calcEchoScoreBreakdown(substats, weights) {
  const breakdown = [];
  let totalScore = 0;

  for (const { name, value } of substats) {
    const weight     = weights[name] ?? 0;
    const efficiency = calcEfficiency(name, value);
    const score      = weight === 0 ? 0 : (1 + efficiency) * weight;

    totalScore += score;

    breakdown.push({
      name,
      value,
      weight,
      efficiency: parseFloat(efficiency.toFixed(4)),
      score:      parseFloat(score.toFixed(4)),
    });
  }

  // Urutkan dari kontribusi tertinggi ke terendah
  breakdown.sort((a, b) => b.score - a.score);

  return { breakdown, totalScore: parseFloat(totalScore.toFixed(4)) };
}

// ----------------------------------------------------------
// 4. RANK ECHOES
// Urutkan array echo dari skor tertinggi ke terendah
// ----------------------------------------------------------
// echoes: array of { id, name, cost, mainStat, substats }
// weights: object { [statName]: number }
// ----------------------------------------------------------
export function rankEchoes(echoes, weights) {
  return echoes
    .map((echo) => {
      const { breakdown, totalScore } = calcEchoScoreBreakdown(
        echo.substats,
        weights
      );
      return { ...echo, breakdown, totalScore };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}