// ============================================================
// echoes.js — Konstanta data echo dari game Wuthering Waves
// Tidak perlu diedit kecuali ada update dari game
// ============================================================

// ----------------------------------------------------------
// MAIN STAT — Fix per cost
// ----------------------------------------------------------
export const ECHO_MAIN_STAT = {
  cost1: {
    fixed: { stat: "HP", value: 2280 },
    variable: [
      { stat: "HP%",  max: 22.8 },
      { stat: "ATK%", max: 18.0 },
      { stat: "DEF%", max: 18.0 },
    ],
  },
  cost3: {
    fixed: { stat: "ATK", value: 100 },
    variable: [
      { stat: "Attribute DMG Bonus", max: 30.0 },
      { stat: "HP%",                 max: 30.0 },
      { stat: "ATK%",                max: 30.0 },
      { stat: "DEF%",                max: 38.0 },
      { stat: "Energy Regen",        max: 32.0 },
    ],
  },
  cost4: {
    fixed: { stat: "ATK", value: 150 },
    variable: [
      { stat: "HP%",            max: 33.0 },
      { stat: "ATK%",           max: 33.0 },
      { stat: "DEF%",           max: 41.5 },
      { stat: "Crit. Rate",     max: 22.0 },
      { stat: "Crit. DMG",      max: 44.0 },
      { stat: "Healing Bonus",  max: 26.0 },
    ],
  },
};

// ----------------------------------------------------------
// SUBSTAT — Range min/max dan median tiap stat
// ----------------------------------------------------------
export const SUBSTAT_DATA = {
  "ATK": {
    min: 30,
    max: 60,
    median: 50,
    type: "flat",      // flat = nilai absolut, percent = persentase
  },
  "HP": {
    min: 320,
    max: 580,
    median: 450,
    type: "flat",
  },
  "DEF": {
    min: 40,
    max: 70,
    median: 50,
    type: "flat",
  },
  "ATK%": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
  "HP%": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
  "DEF%": {
    min: 8.1,
    max: 14.7,
    median: 11.39,
    type: "percent",
  },
  "Energy Regen": {
    min: 6.8,
    max: 12.4,
    median: 10.25,
    type: "percent",
  },
  "Crit. Rate": {
    min: 6.3,
    max: 10.5,
    median: 8.4,
    type: "percent",
  },
  "Crit. DMG": {
    min: 12.6,
    max: 21.0,
    median: 16.8,
    type: "percent",
  },
  "Basic Attack DMG Bonus": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
  "Heavy Attack DMG Bonus": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
  "Resonance Skill DMG Bonus": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
  "Resonance Liberation DMG Bonus": {
    min: 6.4,
    max: 11.6,
    median: 9.0,
    type: "percent",
  },
};

// ----------------------------------------------------------
// SUBSTAT KEYS — untuk iterasi dan validasi input
// ----------------------------------------------------------
export const SUBSTAT_KEYS = Object.keys(SUBSTAT_DATA);

// ----------------------------------------------------------
// ECHO COST OPTIONS — untuk dropdown/pilihan di UI
// ----------------------------------------------------------
export const ECHO_COSTS = [1, 3, 4];