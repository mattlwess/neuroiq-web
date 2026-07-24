// ============================================================================
//  compat.js — Fitment engine + "build me the ___ rifle" optimizer
//
//  A rifle is a chain of physical interfaces. Two parts are compatible only if
//  every interface they *share* agrees:
//     barrel  <-> bcg          : bolt face group
//     barrel  <-> magazine     : cartridge / mag well
//     barrel  <-> gas tube     : gas system length
//     barrel  <-> gas block    : gas seat (journal) diameter
//     barrel  <-> muzzle device: thread pitch
//     barrel  <-> handguard    : rail must clear the gas block, fit the length
//     handguard <-> barrel nut : proprietary mounting system
//     upper   <-> lower/bcg/CH : platform (AR-15 vs AR-10) + threads
//     buffer tube <-> stock/buffer/spring/castle nut : diameter + spring class
//     lower   <-> trigger      : pin size
//
//  The engine answers two questions the UI needs:
//    1. Given the current selection, which parts in category X still fit?
//    2. Find the lightest (or cheapest) *fully-compatible* complete rifle.
// ============================================================================

import { catalog, categories } from "./data.js";

const A = (p) => (p ? p.attrs : null);
const platMatch = (a, b) => a === "Multi" || b === "Multi" || a === b;

// ---- Pairwise rule table ----------------------------------------------------
// Each rule: given part `p` (candidate) and the current `sel` (map cat->part),
// return true if p is still allowed. Rules only fire when the relevant other
// part is actually selected, so an empty build allows everything.
const RULES = [
  // Platform coherence across the structural parts.
  (p, sel) => {
    if (A(p).platform == null) return true;
    for (const other of ["lower_receiver", "upper_receiver", "barrel", "bcg", "charging_handle", "magazine", "handguard", "barrel_nut"]) {
      if (other === p.cat) continue;
      const o = sel[other];
      if (o && A(o).platform != null && !platMatch(A(p).platform, A(o).platform)) return false;
    }
    return true;
  },

  // Bolt face group: barrel <-> BCG.
  (p, sel) => {
    if (p.cat === "bcg" && sel.barrel) return A(p).bolt === A(sel.barrel).bolt;
    if (p.cat === "barrel" && sel.bcg) return A(p).bolt === A(sel.bcg).bolt;
    return true;
  },

  // Magazine / cartridge well: barrel <-> magazine.
  (p, sel) => {
    if (p.cat === "magazine" && sel.barrel) return A(p).mag === A(sel.barrel).mag;
    if (p.cat === "barrel" && sel.magazine) return A(p).mag === A(sel.magazine).mag;
    return true;
  },

  // Gas system length: barrel <-> gas tube.
  (p, sel) => {
    if (p.cat === "gas_tube" && sel.barrel) return A(p).gas === A(sel.barrel).gas;
    if (p.cat === "barrel" && sel.gas_tube) return A(p).gas === A(sel.gas_tube).gas;
    return true;
  },

  // Gas seat diameter: barrel journal <-> gas block bore.
  (p, sel) => {
    if (p.cat === "gas_block" && sel.barrel) return A(p).bore === A(sel.barrel).journal;
    if (p.cat === "barrel" && sel.gas_block) return A(p).journal === A(sel.gas_block).bore;
    return true;
  },

  // Muzzle thread pitch: barrel <-> muzzle device <-> crush washer.
  (p, sel) => {
    const barrelThread = sel.barrel ? A(sel.barrel).thread : null;
    if (p.cat === "muzzle_device") {
      if (barrelThread && A(p).thread !== barrelThread) return false;
      if (sel.crush_washer && A(p).thread !== A(sel.crush_washer).thread) return false;
    }
    if (p.cat === "crush_washer") {
      if (barrelThread && A(p).thread !== barrelThread) return false;
      if (sel.muzzle_device && A(p).thread !== A(sel.muzzle_device).thread) return false;
    }
    if (p.cat === "barrel") {
      if (sel.muzzle_device && A(p).thread !== A(sel.muzzle_device).thread) return false;
      if (sel.crush_washer && A(p).thread !== A(sel.crush_washer).thread) return false;
    }
    return true;
  },

  // Handguard geometry: rail must reach past the gas block and fit the barrel.
  (p, sel) => {
    if (p.cat === "handguard" && sel.barrel) {
      const b = A(sel.barrel);
      if (A(p).length < b.gasPort + 0.5) return false;   // must cover the gas block
      if (A(p).length > b.length - 0.5) return false;    // can't be longer than the barrel
    }
    if (p.cat === "barrel" && sel.handguard) {
      const h = A(sel.handguard);
      if (h.length < A(p).gasPort + 0.5) return false;
      if (h.length > A(p).length - 0.5) return false;
    }
    return true;
  },

  // Handguard <-> barrel nut mounting system (proprietary vs mil-spec).
  (p, sel) => {
    if (p.cat === "barrel_nut" && sel.handguard) return A(p).mount === A(sel.handguard).mount;
    if (p.cat === "handguard" && sel.barrel_nut) return A(p).mount === A(sel.barrel_nut).mount;
    return true;
  },

  // Buffer system: tube diameter/spec and spring class must all agree.
  (p, sel) => {
    const tube = sel.buffer_tube ? A(sel.buffer_tube) : null;
    if (p.cat === "buffer" && tube) return A(p).bufferClass === tube.bufferClass;
    if (p.cat === "spring" && tube) {
      // Rifle tubes take rifle springs; carbine/pistol take carbine springs.
      const want = tube.bufferClass === "Rifle" ? "Rifle" : "Carbine";
      return A(p).bufferClass === want;
    }
    if (p.cat === "stock" && tube) {
      if (A(p).bufferClass !== tube.bufferClass) return false;
      if (tube.bufferClass !== "Rifle" && A(p).bufferSpec !== tube.bufferSpec) return false;
      return true;
    }
    if (p.cat === "castle_nut" && tube) {
      if (tube.bufferClass === "Rifle") return true; // rifle tubes don't use a castle nut
      return A(p).bufferSpec === tube.bufferSpec;
    }
    if (p.cat === "buffer_tube") {
      if (sel.buffer && A(sel.buffer).bufferClass !== A(p).bufferClass) return false;
      if (sel.spring) {
        const want = A(p).bufferClass === "Rifle" ? "Rifle" : "Carbine";
        if (A(sel.spring).bufferClass !== want) return false;
      }
      if (sel.stock) {
        if (A(sel.stock).bufferClass !== A(p).bufferClass) return false;
        if (A(p).bufferClass !== "Rifle" && A(sel.stock).bufferSpec !== A(p).bufferSpec) return false;
      }
      if (sel.castle_nut && A(p).bufferClass !== "Rifle" && A(sel.castle_nut).bufferSpec !== A(p).bufferSpec) return false;
    }
    return true;
  },

  // Trigger pin size <-> lower receiver pin size.
  (p, sel) => {
    if (p.cat === "trigger" && sel.lower_receiver) return A(p).triggerPin === A(sel.lower_receiver).triggerPin;
    if (p.cat === "lower_receiver" && sel.trigger) return A(p).triggerPin === A(sel.trigger).triggerPin;
    return true;
  },

  // Forward assist requires an upper that's cut for it.
  (p, sel) => {
    if (p.cat === "forward_assist" && sel.upper_receiver) return A(sel.upper_receiver).forwardAssist === true;
    if (p.cat === "upper_receiver" && sel.forward_assist) return A(p).forwardAssist === true;
    return true;
  },
];

// Is a single candidate part compatible with the rest of the current selection?
export function isCompatible(part, selection) {
  const sel = { ...selection };
  delete sel[part.cat]; // don't compare a category against itself
  for (const rule of RULES) if (!rule(part, sel)) return false;
  return true;
}

// For a category, split its parts into compatible / incompatible given selection.
export function compatibleParts(catId, selection) {
  const list = catalog.parts[catId] || [];
  const fit = [];
  const nofit = [];
  for (const p of list) (isCompatible(p, selection) ? fit : nofit).push(p);
  return { fit, nofit, total: list.length };
}

// Count of compatible parts per category — used to render the live badges.
export function compatibilityCounts(selection) {
  const out = {};
  for (const cat of categories) out[cat.id] = compatibleParts(cat.id, selection).fit.length;
  return out;
}

// ============================================================================
//  Optimizer — lightest / cheapest complete, compatible rifle.
//
//  Strategy: the whole compatibility graph is anchored by a handful of enum
//  "profiles" that a barrel fixes (platform, bolt, mag, gas, journal, thread).
//  For each distinct barrel profile we greedily pick the min-cost part in every
//  category that is consistent with it, then add the best self-consistent
//  buffer subsystem for that platform. We keep whichever profile yields the
//  lowest total. This is exact for this constraint structure because, once the
//  profile is fixed, every remaining category's choice is independent.
// ============================================================================
const COST = { weight: (p) => p.weightG, price: (p) => p.priceUSD };

// Categories with no meaningful hard constraint (pick global min).
const FREE = ["lower_parts", "grip", "optic", "accessory", "ejection_cover"];

// Genuinely conditional parts: a rifle-length tube uses a stock screw rather
// than a castle nut, and a forward assist only exists on an FA-cut upper. A
// build can be complete without either, so they don't count toward completeness.
export const OPTIONAL = ["forward_assist", "castle_nut"];

function minBy(list, cost) {
  let best = null;
  for (const p of list) if (!best || cost(p) < cost(best)) best = p;
  return best;
}

// Reduce a list to a Map of key -> cheapest part for that key (single pass).
function groupMin(list, keyFn, cost) {
  const m = new Map();
  for (const p of list) {
    const k = keyFn(p);
    if (k == null) continue;
    const cur = m.get(k);
    if (!cur || cost(p) < cost(cur)) m.set(k, p);
  }
  return m;
}

// Cheapest self-consistent buffer subsystem. Buffer parts here carry no
// platform constraint, so this is computed once per objective, not per profile.
function bestBufferSystem(cost) {
  const bufferMin = groupMin(catalog.parts.buffer, (p) => p.attrs.bufferClass, cost);
  const springMin = groupMin(catalog.parts.spring, (p) => p.attrs.bufferClass, cost);
  const stockMin = groupMin(catalog.parts.stock, (p) => `${p.attrs.bufferClass}|${p.attrs.bufferSpec}`, cost);
  const castleMin = groupMin(catalog.parts.castle_nut, (p) => p.attrs.bufferSpec, cost);

  let best = null;
  for (const tube of catalog.parts.buffer_tube) {
    const t = tube.attrs;
    const buffer = bufferMin.get(t.bufferClass);
    const spring = springMin.get(t.bufferClass === "Rifle" ? "Rifle" : "Carbine");
    const stock = stockMin.get(`${t.bufferClass}|${t.bufferClass === "Rifle" ? "Rifle-Fixed" : t.bufferSpec}`);
    let castle = null;
    if (t.bufferClass !== "Rifle") {
      castle = castleMin.get(t.bufferSpec);
      if (!castle) continue;
    }
    if (!buffer || !spring || !stock) continue;
    const picks = { buffer_tube: tube, buffer, spring, stock };
    if (castle) picks.castle_nut = castle;
    const total = Object.values(picks).reduce((s, p) => s + cost(p), 0);
    if (!best || total < best.total) best = { picks, total };
  }
  return best;
}

export function optimize(objective = "weight") {
  const cost = COST[objective] || COST.weight;

  // ---- Precompute every per-attribute minimum once (not per barrel profile) ----
  const bcgMin = groupMin(catalog.parts.bcg, (p) => `${p.attrs.platform}|${p.attrs.bolt}`, cost);
  const gasTubeMin = groupMin(catalog.parts.gas_tube, (p) => p.attrs.gas, cost);
  const gasBlockMin = groupMin(catalog.parts.gas_block, (p) => p.attrs.bore, cost);
  const muzzleMin = groupMin(catalog.parts.muzzle_device, (p) => p.attrs.thread, cost);
  const crushMin = groupMin(catalog.parts.crush_washer, (p) => p.attrs.thread, cost);
  const magMin = groupMin(catalog.parts.magazine, (p) => p.attrs.mag, cost);
  const lowerMin = groupMin(catalog.parts.lower_receiver, (p) => p.attrs.platform, cost);
  const upperMin = groupMin(catalog.parts.upper_receiver, (p) => p.attrs.platform, cost);
  const chMin = groupMin(catalog.parts.charging_handle, (p) => p.attrs.platform, cost);
  const takedownMin = groupMin(catalog.parts.takedown_pins, (p) => p.attrs.platform, cost);
  const triggerMin = groupMin(catalog.parts.trigger, (p) => p.attrs.triggerPin, cost);
  const nutMin = groupMin(catalog.parts.barrel_nut, (p) => `${p.attrs.platform}|${p.attrs.mount}`, cost);
  const faMin = minBy(catalog.parts.forward_assist, cost);
  const freeMin = {}; for (const c of FREE) freeMin[c] = minBy(catalog.parts[c], cost);

  // Handguards grouped by platform, each annotated with its cheapest matching nut.
  const hgByPlatform = {};
  for (const hg of catalog.parts.handguard) {
    const plat = hg.attrs.platform;
    const nut = nutMin.get(`${plat}|${hg.attrs.mount}`);
    if (!nut) continue;
    (hgByPlatform[plat] ||= []).push({ hg, nut, len: hg.attrs.length, aug: cost(hg) + cost(nut) });
  }

  const bufferSys = bestBufferSystem(cost);

  // ---- Enumerate distinct barrel profiles, keeping the cheapest barrel each ----
  const seen = new Map();
  for (const barrel of catalog.parts.barrel) {
    const a = barrel.attrs;
    const key = `${a.platform}|${a.bolt}|${a.mag}|${a.gas}|${a.journal}|${a.thread}`;
    if (!seen.has(key) || cost(barrel) < cost(seen.get(key))) seen.set(key, barrel);
  }

  let best = null;
  for (const barrel of seen.values()) {
    const a = barrel.attrs;
    const platform = a.platform;
    const picks = { barrel };

    picks.bcg = bcgMin.get(`${platform}|${a.bolt}`);
    picks.gas_tube = gasTubeMin.get(a.gas);
    picks.gas_block = gasBlockMin.get(a.journal);
    picks.muzzle_device = muzzleMin.get(a.thread);
    picks.crush_washer = crushMin.get(a.thread);
    picks.magazine = magMin.get(a.mag);
    picks.lower_receiver = lowerMin.get(platform);
    picks.upper_receiver = upperMin.get(platform);
    picks.charging_handle = chMin.get(platform);
    picks.takedown_pins = takedownMin.get(platform);

    // Handguard whose (rail + cheapest matching nut) is minimal and that fits
    // the barrel's length and reaches past the gas block.
    let bestHG = null;
    for (const cand of (hgByPlatform[platform] || [])) {
      if (cand.len < a.gasPort + 0.5 || cand.len > a.length - 0.5) continue;
      if (!bestHG || cand.aug < bestHG.aug) bestHG = cand;
    }
    if (bestHG) { picks.handguard = bestHG.hg; picks.barrel_nut = bestHG.nut; }

    // Trigger must match the lower's pin size.
    const lowerPin = picks.lower_receiver ? picks.lower_receiver.attrs.triggerPin : ".154 Mil-Spec";
    picks.trigger = triggerMin.get(lowerPin);

    // Forward assist only if the chosen upper is actually FA-cut.
    picks.forward_assist = picks.upper_receiver && picks.upper_receiver.attrs.forwardAssist ? faMin : null;

    for (const c of FREE) picks[c] = freeMin[c];
    if (bufferSys) Object.assign(picks, bufferSys.picks);

    // Require every non-optional category to be filled.
    const complete = categories.every((c) => picks[c.id] || OPTIONAL.includes(c.id));
    if (!complete) continue;

    const total = Object.values(picks).filter(Boolean).reduce((s, p) => s + cost(p), 0);
    if (!best || total < best.total) best = { picks, total };
  }

  if (!best) return null;
  const selection = {};
  for (const [k, v] of Object.entries(best.picks)) if (v) selection[k] = v;
  return { selection, total: best.total, objective };
}

// Totals for a (possibly partial) selection.
export function buildTotals(selection) {
  let weightG = 0, priceUSD = 0, count = 0;
  for (const p of Object.values(selection)) { if (!p) continue; weightG += p.weightG; priceUSD += p.priceUSD; count++; }
  return { weightG, priceUSD, count };
}
