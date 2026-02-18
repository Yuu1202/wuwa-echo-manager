// ============================================================
// ui.js — DOM manipulation, render, dan event handling
// ============================================================

import { CHARACTERS }                        from "../data/characters.js";
import { SUBSTAT_DATA, SUBSTAT_KEYS }        from "../data/echoes.js";
import { calcEchoScoreBreakdown, rankEchoes } from "./calculator.js";

// ----------------------------------------------------------
// STATE
// ----------------------------------------------------------
let state = {
  selectedCharacter: null,  // object dari CHARACTERS
  weights: {},              // { [statName]: 0.0 - 1.0 }
  echoList: {},             // { [characterId]: [echo objects] }
};

// ----------------------------------------------------------
// LOCALSTORAGE SAVE/LOAD
// ----------------------------------------------------------
const STORAGE_KEY = "wuwa-echo-manager-state";

function saveState() {
  const data = {
    echoList: state.echoList,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      state.echoList = data.echoList || {};
    } catch (e) {
      console.error("Failed to load state:", e);
    }
  }
}

// ----------------------------------------------------------
// JSON EXPORT/IMPORT
// ----------------------------------------------------------
function exportToJSON() {
  const data = {
    version: "1.0",
    echoList: state.echoList,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wuwa-echoes-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJSON(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.echoList) {
        state.echoList = data.echoList;
        saveState();
        renderRanking();
        alert("Data berhasil diimport!");
      }
    } catch (err) {
      alert("File JSON tidak valid!");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

// ----------------------------------------------------------
// HELPER - Get current character echo list
// ----------------------------------------------------------
function getCurrentEchoList() {
  if (!state.selectedCharacter) return [];
  const charId = state.selectedCharacter.id;
  if (!state.echoList[charId]) {
    state.echoList[charId] = [];
  }
  return state.echoList[charId];
}

// ----------------------------------------------------------
// INIT
// ----------------------------------------------------------
export function initUI() {
  loadState();
  renderCharacterSelect();
  renderWeightPanel();
  renderEchoForm();
  renderRanking();

  document.getElementById("btn-add-echo").addEventListener("click", onAddEcho);
  document.getElementById("btn-clear-all").addEventListener("click", onClearAll);
  document.getElementById("btn-export-json").addEventListener("click", exportToJSON);
  document.getElementById("btn-import-json").addEventListener("click", () => {
    document.getElementById("file-import").click();
  });
  document.getElementById("file-import").addEventListener("change", (e) => {
    if (e.target.files[0]) {
      importFromJSON(e.target.files[0]);
      e.target.value = ""; // reset input
    }
  });
}

// ----------------------------------------------------------
// CHARACTER SELECT
// ----------------------------------------------------------
function renderCharacterSelect() {
  const select = document.getElementById("char-select");
  select.innerHTML = `<option value="">-- Pilih Karakter --</option>`;

  CHARACTERS.forEach((char) => {
    const opt = document.createElement("option");
    opt.value = char.id;
    opt.textContent = char.name;
    select.appendChild(opt);
  });

  select.addEventListener("change", () => {
    const char = CHARACTERS.find((c) => c.id === select.value);
    state.selectedCharacter = char || null;
    state.weights = char ? { ...char.defaultWeight } : {};
    renderWeightPanel();
    renderBaseStatDisplay();
    renderRanking();
  });
}

// ----------------------------------------------------------
// BASE STAT DISPLAY
// ----------------------------------------------------------
function renderBaseStatDisplay() {
  const el = document.getElementById("base-stat-display");
  if (!state.selectedCharacter) {
    el.innerHTML = "";
    return;
  }
  const { HP, ATK, DEF, "Crit. Rate": cr, "Crit. DMG": cd } = state.selectedCharacter.base;
  el.innerHTML = `
    <span>HP <b>${HP.toLocaleString()}</b></span>
    <span>ATK <b>${ATK}</b></span>
    <span>DEF <b>${DEF}</b></span>
    <span>CR <b>${cr}%</b></span>
    <span>CD <b>${cd}%</b></span>
  `;
}

// ----------------------------------------------------------
// WEIGHT PANEL
// ----------------------------------------------------------
function renderWeightPanel() {
  const container = document.getElementById("weight-panel");
  container.innerHTML = "";

  if (!state.selectedCharacter) {
    container.innerHTML = `<p class="muted">Pilih karakter dulu.</p>`;
    return;
  }

  SUBSTAT_KEYS.forEach((key) => {
    const currentWeight = state.weights[key] ?? 0;
    const wrap = document.createElement("div");
    wrap.className = "weight-row";
    wrap.innerHTML = `
      <span class="weight-label">${key}</span>
      <input
        type="range"
        min="0" max="1" step="0.1"
        value="${currentWeight}"
        data-stat="${key}"
        class="weight-slider"
      />
      <span class="weight-value" id="wv-${key.replace(/[^a-z0-9]/gi, "_")}">${currentWeight.toFixed(1)}</span>
    `;
    container.appendChild(wrap);

    wrap.querySelector("input").addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      state.weights[key] = val;
      document.getElementById(`wv-${key.replace(/[^a-z0-9]/gi, "_")}`).textContent = val.toFixed(1);
      renderRanking();
    });
  });
}

// ----------------------------------------------------------
// ECHO FORM
// ----------------------------------------------------------
function renderEchoForm() {
  renderSubstatRows();

  document.getElementById("btn-add-substat").addEventListener("click", () => {
    if (getSubstatRowCount() < 5) {
      addSubstatRow();
    }
  });
}

function renderSubstatRows() {
  const container = document.getElementById("substat-rows");
  container.innerHTML = "";
  addSubstatRow();
  addSubstatRow();
}

function addSubstatRow() {
  const container = document.getElementById("substat-rows");
  const idx       = container.children.length;
  const row       = document.createElement("div");
  row.className   = "substat-row";
  row.innerHTML   = `
    <select class="substat-name">
      <option value="">-- Substat --</option>
      ${SUBSTAT_KEYS.map((k) => `<option value="${k}">${k}</option>`).join("")}
    </select>
    <input type="number" class="substat-value" placeholder="nilai" step="0.01" min="0" />
    <button class="btn-remove-sub" title="Hapus">✕</button>
  `;
  row.querySelector(".btn-remove-sub").addEventListener("click", () => {
    row.remove();
  });
  container.appendChild(row);
}

function getSubstatRowCount() {
  return document.getElementById("substat-rows").children.length;
}

// ----------------------------------------------------------
// ADD ECHO
// ----------------------------------------------------------
function onAddEcho() {
  if (!state.selectedCharacter) {
    alert("Pilih karakter dulu!");
    return;
  }

  const name = document.getElementById("echo-name").value.trim() || `Echo ${getCurrentEchoList().length + 1}`;

  // Kumpulkan substat
  const rows     = document.querySelectorAll(".substat-row");
  const substats = [];

  rows.forEach((row) => {
    const statName  = row.querySelector(".substat-name").value;
    const statValue = parseFloat(row.querySelector(".substat-value").value);

    if (statName && !isNaN(statValue) && statValue > 0) {
      substats.push({ name: statName, value: statValue });
    }
  });

  if (substats.length === 0) {
    alert("Masukkan minimal 1 substat.");
    return;
  }

  const echo = {
    id:       Date.now(),
    name,
    substats,
  };

  getCurrentEchoList().push(echo);
  saveState();
  resetEchoForm();
  renderRanking();
}

function resetEchoForm() {
  document.getElementById("echo-name").value = "";
  renderSubstatRows();
}

// ----------------------------------------------------------
// CLEAR ALL
// ----------------------------------------------------------
function onClearAll() {
  if (!state.selectedCharacter) {
    alert("Pilih karakter dulu!");
    return;
  }
  if (confirm(`Hapus semua echo untuk ${state.selectedCharacter.name}?`)) {
    const charId = state.selectedCharacter.id;
    state.echoList[charId] = [];
    saveState();
    renderRanking();
  }
}

// ----------------------------------------------------------
// RANKING
// ----------------------------------------------------------
export function renderRanking() {
  const container = document.getElementById("ranking-list");
  container.innerHTML = "";

  const echoList = getCurrentEchoList();

  if (echoList.length === 0) {
    container.innerHTML = `<p class="muted">Belum ada echo.</p>`;
    return;
  }

  if (!state.selectedCharacter) {
    container.innerHTML = `<p class="muted">Pilih karakter untuk melihat ranking.</p>`;
    return;
  }

  const ranked = rankEchoes(echoList, state.weights);
  const maxScore = ranked[0]?.totalScore || 1;

  ranked.forEach((echo, idx) => {
    const pct      = ((echo.totalScore / maxScore) * 100).toFixed(1);
    const card     = document.createElement("div");
    card.className = `echo-card rank-${idx === 0 ? "first" : idx === 1 ? "second" : idx === 2 ? "third" : "rest"}`;

    card.innerHTML = `
      <div class="echo-card-header">
        <span class="rank-badge">#${idx + 1}</span>
        <span class="echo-card-name">${echo.name}</span>
        <span class="echo-score">${echo.totalScore.toFixed(3)}</span>
        <button class="btn-delete-echo" data-id="${echo.id}" title="Hapus">✕</button>
      </div>
      <div class="score-bar-wrap">
        <div class="score-bar" style="width: ${pct}%"></div>
      </div>
      <div class="echo-breakdown">
        ${echo.breakdown.map((b) => `
          <div class="breakdown-row ${b.weight === 0 ? "dimmed" : ""}">
            <span class="b-name">${b.name}</span>
            <span class="b-value">${b.value}${SUBSTAT_DATA[b.name]?.type === "percent" ? "%" : ""}</span>
            <span class="b-eff">eff ${(b.efficiency * 100).toFixed(1)}%</span>
            <span class="b-score">+${b.score.toFixed(3)}</span>
          </div>
        `).join("")}
      </div>
    `;

    card.querySelector(".btn-delete-echo").addEventListener("click", (e) => {
      const id = parseInt(e.target.dataset.id);
      const charId = state.selectedCharacter.id;
      state.echoList[charId] = state.echoList[charId].filter((ec) => ec.id !== id);
      saveState();
      renderRanking();
    });

    container.appendChild(card);
  });
}