// ============================================================================
//  app.js — UI glue. Wires the catalog + compatibility engine + 3D scene into
//  the configurator: pick a category, see only the parts that fit, watch the
//  rifle assemble in 3D, and let the optimizer auto-build the lightest rifle.
// ============================================================================

import { catalog, categories, stats } from "./data.js";
import { compatibleParts, compatibilityCounts, optimize, buildTotals, isCompatible, OPTIONAL } from "./compat.js";
// NOTE: the 3D scene (scene.js) pulls three.js from a CDN and is loaded lazily
// in boot() so that a CDN hiccup never takes down the (network-free) configurator.

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const state = {
  selection: {},        // catId -> part
  activeCat: "barrel",  // category open in the parts panel
  search: "",
  sort: "compat",       // compat | weight-asc | price-asc | price-desc
  hideIncompatible: true,
};

let sceneApi = null;

// ---------- number helpers ----------
const grams = (g) => (g >= 1000 ? (g / 1000).toFixed(2) + " kg" : Math.round(g) + " g");
const lbs = (g) => (g / 453.592).toFixed(2) + " lb";
const usd = (v) => "$" + v.toLocaleString("en-US");

// ============================================================================
//  Left rail — category list with live compatible-count badges
// ============================================================================
function renderCategoryList() {
  const counts = compatibilityCounts(state.selection);
  const groupsOrder = ["Upper", "Lower", "Feed", "Optics"];
  const byGroup = {};
  for (const c of categories) (byGroup[c.group] ||= []).push(c);

  const wrap = $("#cat-list");
  wrap.innerHTML = "";
  for (const g of groupsOrder) {
    if (!byGroup[g]) continue;
    const head = document.createElement("div");
    head.className = "cat-group-head";
    head.textContent = g + " assembly";
    wrap.appendChild(head);
    for (const c of byGroup[g]) {
      const sel = state.selection[c.id];
      const n = counts[c.id];
      const row = document.createElement("button");
      row.className = "cat-row" + (state.activeCat === c.id ? " active" : "") + (sel ? " filled" : "") + (n === 0 && !sel ? " blocked" : "");
      row.dataset.cat = c.id;
      row.innerHTML = `
        <span class="cat-dot"></span>
        <span class="cat-main">
          <span class="cat-name">${c.name}</span>
          <span class="cat-sub">${sel ? sel.fullName : `${n} of ${catalog.parts[c.id].length} fit`}</span>
        </span>
        ${sel ? `<span class="cat-check">✓</span>` : `<span class="cat-badge${n === 0 ? " zero" : ""}">${n}</span>`}`;
      row.addEventListener("click", () => { state.activeCat = c.id; state.search = ""; render(); });
      wrap.appendChild(row);
    }
  }
}

// ============================================================================
//  Center — parts panel for the active category
// ============================================================================
function renderPartsPanel() {
  const cat = categories.find((c) => c.id === state.activeCat);
  const { fit, nofit, total } = compatibleParts(state.activeCat, state.selection);

  $("#panel-title").textContent = cat.name;
  $("#panel-sub").textContent = `${fit.length} compatible · ${total.toLocaleString()} catalogued`;

  // search + sort
  let list = state.hideIncompatible ? fit.slice() : [...fit, ...nofit];
  const q = state.search.trim().toLowerCase();
  if (q) list = list.filter((p) => p.fullName.toLowerCase().includes(q));

  const sorters = {
    "weight-asc": (a, b) => a.weightG - b.weightG,
    "price-asc": (a, b) => a.priceUSD - b.priceUSD,
    "price-desc": (a, b) => b.priceUSD - a.priceUSD,
    compat: (a, b) => a.priceUSD - b.priceUSD,
  };
  list.sort(sorters[state.sort] || sorters.compat);

  const CAP = 60;
  const shown = list.slice(0, CAP);
  const grid = $("#parts-grid");
  grid.innerHTML = "";

  if (!shown.length) {
    grid.innerHTML = `<div class="empty">No ${state.hideIncompatible ? "compatible " : ""}parts match. Try clearing a conflicting selection or your search.</div>`;
  }

  for (const p of shown) {
    const compat = isCompatible(p, state.selection);
    const selected = state.selection[state.activeCat] && state.selection[state.activeCat].id === p.id;
    const card = document.createElement("div");
    card.className = "part-card" + (selected ? " selected" : "") + (compat ? "" : " incompat");
    card.innerHTML = `
      <div class="part-top">
        <div class="part-brand">${p.brand}</div>
        ${compat ? "" : `<div class="part-flag">Doesn't fit</div>`}
      </div>
      <div class="part-name">${p.name}</div>
      <div class="part-specs">${specLine(p)}</div>
      <div class="part-foot">
        <div class="part-metrics">
          <span title="Weight">${grams(p.weightG)}</span>
          <span title="Price">${usd(p.priceUSD)}</span>
        </div>
        <button class="part-btn">${selected ? "Remove" : compat ? "Add" : "Force add"}</button>
      </div>`;
    card.querySelector(".part-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (selected) removePart(state.activeCat);
      else selectPart(p);
    });
    grid.appendChild(card);
  }

  if (list.length > CAP) {
    const more = document.createElement("div");
    more.className = "more-note";
    more.textContent = `Showing ${CAP} of ${list.length.toLocaleString()} — narrow it with search or sort.`;
    grid.appendChild(more);
  }

  // toolbar state
  $("#search").value = state.search;
  $("#sort").value = state.sort;
  $("#toggle-incompat").classList.toggle("on", !state.hideIncompatible);
}

// A compact "what interfaces does this expose" line for a part card.
function specLine(p) {
  const a = p.attrs;
  const bits = [];
  const add = (label, v) => { if (v != null && v !== "" && v !== "Multi") bits.push(`<b>${label}</b> ${v}`); };
  switch (p.cat) {
    case "barrel": add("Cal", a.caliber); add("Gas", a.gas); add("Thd", a.thread); add("Jrnl", a.journal + '"'); break;
    case "bcg": add("Plat", a.platform); add("Bolt", a.bolt); break;
    case "magazine": add("Mag", a.mag); add("Cap", a.capacity + "rd"); break;
    case "gas_tube": add("Gas", a.gas); break;
    case "gas_block": add("Bore", a.bore + '"'); add(a.adjustable ? "Adj" : "", a.adjustable ? "yes" : ""); break;
    case "muzzle_device": case "crush_washer": add("Thd", a.thread); add("Type", a.type); break;
    case "handguard": add("Len", a.length + '"'); add("Rail", a.rail); add("Mount", a.mount); break;
    case "barrel_nut": add("Mount", a.mount); add("Plat", a.platform); break;
    case "buffer_tube": add("Spec", a.bufferSpec); add("Class", a.bufferClass); break;
    case "buffer": add("Class", a.bufferClass); add("Mass", a.mass); break;
    case "spring": add("Class", a.bufferClass); break;
    case "stock": add("Class", a.bufferClass); add("Spec", a.bufferSpec); break;
    case "castle_nut": add("Spec", a.bufferSpec); break;
    case "trigger": add("Pin", a.triggerPin); add("Type", a.type); break;
    case "lower_receiver": add("Plat", a.platform); add("Pin", a.triggerPin); break;
    case "upper_receiver": add("Plat", a.platform); add("FA", a.forwardAssist ? "yes" : "slick"); break;
    case "charging_handle": add("Plat", a.platform); add(a.ambidextrous ? "Ambi" : "", a.ambidextrous ? "yes" : ""); break;
    case "optic": add("Type", a.type); add("Mount", a.mount); break;
    default:
      for (const [k, v] of Object.entries(a)) { if (bits.length >= 3) break; add(k, v); }
  }
  return bits.join(" · ") || "Universal fit";
}

// ============================================================================
//  Right rail — build summary + optimizer
// ============================================================================
const REQUIRED = categories.filter((c) => !OPTIONAL.includes(c.id));

function renderSummary() {
  const t = buildTotals(state.selection);
  const filledRequired = REQUIRED.filter((c) => state.selection[c.id]).length;
  const complete = filledRequired === REQUIRED.length;
  $("#sum-count").textContent = `${filledRequired} / ${REQUIRED.length}`;
  $("#sum-weight").textContent = grams(t.weightG);
  $("#sum-weight-lb").textContent = lbs(t.weightG);
  $("#sum-price").textContent = usd(t.priceUSD);
  $("#build-progress").style.width = (filledRequired / REQUIRED.length * 100) + "%";
  $("#complete-flag").classList.toggle("show", complete);

  // spec digest from key parts
  const b = state.selection.barrel;
  const digest = $("#spec-digest");
  if (b) {
    const a = b.attrs;
    digest.innerHTML = `
      <span class="chip">${a.platform}</span>
      <span class="chip">${a.caliber}</span>
      <span class="chip">${a.gas} gas</span>
      <span class="chip">${a.thread}</span>
      <span class="chip">${a.length}" bbl</span>`;
  } else {
    digest.innerHTML = `<span class="chip muted">Pick a barrel to anchor the build's caliber & gas system</span>`;
  }
}

// ============================================================================
//  Actions
// ============================================================================
function selectPart(p) {
  state.selection[p.cat] = p;
  // Dropping a new anchor part can invalidate downstream picks; prune them.
  pruneConflicts();
  sceneApi?.setPresent(p.cat, true, true);
  render();
}

function removePart(catId) {
  delete state.selection[catId];
  pruneConflicts();
  sceneApi?.setPresent(catId, false, false);
  render();
}

// After any change, drop selections that no longer fit the rest.
function pruneConflicts() {
  let changed = true;
  while (changed) {
    changed = false;
    for (const [catId, part] of Object.entries(state.selection)) {
      const rest = { ...state.selection };
      delete rest[catId];
      if (!isCompatible(part, rest)) {
        delete state.selection[catId];
        sceneApi?.setPresent(catId, false, false);
        changed = true;
      }
    }
  }
}

function runOptimize(objective) {
  const res = optimize(objective);
  if (!res) return;
  state.selection = res.selection;
  // refresh scene presence for all categories
  for (const c of categories) sceneApi?.setPresent(c.id, !!state.selection[c.id], false);
  // flash the ones present
  for (const c of categories) if (state.selection[c.id]) sceneApi?.setPresent(c.id, true, true);
  render();
  flashBanner(objective === "weight"
    ? `Lightest complete build assembled — ${lbs(res.total)} of compatible parts.`
    : `Cheapest complete build assembled — ${usd(res.total)} in compatible parts.`);
}

function clearAll() {
  state.selection = {};
  for (const c of categories) sceneApi?.setPresent(c.id, false, false);
  render();
}

function flashBanner(msg) {
  const el = $("#banner");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 4200);
}

// ============================================================================
//  Render + wire-up
// ============================================================================
function render() {
  renderCategoryList();
  renderPartsPanel();
  renderSummary();
}

function wireControls() {
  $("#search").addEventListener("input", (e) => { state.search = e.target.value; renderPartsPanel(); });
  $("#sort").addEventListener("change", (e) => { state.sort = e.target.value; renderPartsPanel(); });
  $("#toggle-incompat").addEventListener("click", () => { state.hideIncompatible = !state.hideIncompatible; renderPartsPanel(); });
  $("#opt-weight").addEventListener("click", () => runOptimize("weight"));
  $("#opt-price").addEventListener("click", () => runOptimize("price"));
  $("#clear").addEventListener("click", clearAll);
  $("#reset-view").addEventListener("click", () => sceneApi?.resetView?.());
}

function initStats() {
  $("#stat-parts").textContent = stats.totalParts.toLocaleString();
  $("#stat-mfg").textContent = stats.manufacturers;
  $("#stat-cats").textContent = stats.categories;
}

async function boot() {
  initStats();
  wireControls();
  render(); // core configurator is live immediately, independent of the 3D scene

  // Lazily bring up the 3D preview. If three.js (CDN) or WebGL is unavailable,
  // the configurator keeps working and we just show a friendly fallback.
  try {
    const scene = await import("./scene.js");
    sceneApi = scene.initScene($("#scene"));
    // reflect any parts already chosen (e.g. via an optimizer run during load)
    for (const c of categories) if (state.selection[c.id]) sceneApi.setPresent(c.id, true, false);
  } catch (err) {
    $("#scene").innerHTML = `<div class="scene-fallback">3D preview unavailable (needs WebGL + network). The configurator still works — pick parts on the left.</div>`;
    console.warn("3D scene failed to load:", err);
  }
}

boot();
