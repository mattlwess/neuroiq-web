// ============================================================================
//  data.js — Deterministic synthetic parts catalog for the AR build configurator
//
//  The whole point of this file is to model the *physical interfaces* of an
//  AR-pattern rifle so that the compatibility engine (compat.js) can decide
//  which parts actually thread / pin / seat together. Every part carries an
//  `attrs` object describing the connections that matter for fitment.
//
//  Nothing here is fetched from a server: the catalog is generated at load
//  time from a fixed seed, so the same ~34k SKUs (and therefore the same
//  compatibility graph) appear on every visit.
// ============================================================================

// ---- Seeded RNG (mulberry32) -------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x5E56A15); // "5.56 AR15"-ish seed
const rand = () => rng();
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickN = (arr, n) => {
  const c = arr.slice();
  const out = [];
  while (out.length < n && c.length) out.push(c.splice(Math.floor(rand() * c.length), 1)[0]);
  return out;
};
const chance = (p) => rand() < p;
const round = (v, step) => Math.round(v / step) * step;

// ---- Manufacturers -----------------------------------------------------------
// 85 brand names. A blend of real-sounding AR marques and invented ones so the
// catalog feels like the fragmented aftermarket it is modelling.
const MANUFACTURERS = [
  "Aero Precision", "BCM Ironworks", "Ballistic Advantage", "Faxon Firearms",
  "Radian Arms", "Geissele Automatics", "Daniel Defense", "Rainier Arms",
  "Odin Works", "V Seven", "2A Armament", "Cryptic Coatings", "SOLGW",
  "PSA Custom", "Sons of Liberty", "Battle Arms Dev", "JP Enterprises",
  "Wilson Combat", "LaRue Tactical", "Noveske", "Seekins Precision",
  "Cross Machine Tool", "Sharps Bros", "F-1 Firearms", "Grey Ghost Precision",
  "Strike Industries", "Midwest Industries", "Fortis Mfg", "Lantac USA",
  "Superlative Arms", "SLR Rifleworks", "Griffin Armament", "Dead Air",
  "SureFire", "KAK Industry", "Toolcraft", "Microbest", "Young Mfg",
  "Sionics Weapon Sys", "Expo Arms", "Anderson Mfg", "Palmetto SA",
  "Sanders Armory", "Wilde Custom", "Titanium Tactical", "Mega Arms",
  "San Tan Tactical", "Aphelion Armory", "Hodge Defense", "Centurion Arms",
  "Lead Star Arms", "Unique-ARs", "Brownells BRN", "FailZero", "WMD Guns",
  "Nickel Boron Ind", "Bootleg Inc", "Kynshot", "Sprinco USA", "Tubb Precision",
  "Magpul", "B5 Systems", "Mission First", "Ergo Grips", "Hogue Inc",
  "Bravo Company", "Vltor Weapon Sys", "Sig Sauer", "Primary Weapons",
  "Bootleg", "Cmmg Inc", "Andro Corp", "18 Inc", "Ghost Firearms",
  "Kaw Valley Prec", "Rise Armament", "Timney Triggers", "CMC Triggers",
  "Elftmann Tactical", "Hiperfire", "Trybe Defense", "Ncstar VISM",
  "Holosun", "Primary Arms", "Vortex Optics", "Trijicon",
];

// ---- Platforms & calibers ----------------------------------------------------
// The two big families of the AR platform. Small-frame ("AR-15") and
// large-frame ("AR-10 / .308"). Parts almost never cross between them.
const PLATFORMS = ["AR-15", "AR-10"];

const CALIBERS = {
  "AR-15": [
    { name: "5.56 NATO",   bolt: "MIL-5.56",  mag: "STANAG-5.56",  thread: "1/2x28" },
    { name: ".223 Wylde",  bolt: "MIL-5.56",  mag: "STANAG-5.56",  thread: "1/2x28" },
    { name: ".300 BLK",    bolt: "MIL-5.56",  mag: "STANAG-5.56",  thread: "5/8x24" },
    { name: "7.62x39",     bolt: "7.62x39",   mag: "STANAG-762x39",thread: "5/8x24" },
    { name: ".350 Legend", bolt: ".350LGND",  mag: "STANAG-.350",  thread: "1/2x28" },
    { name: "6mm ARC",     bolt: "6ARC",      mag: "STANAG-6ARC",  thread: "1/2x28" },
  ],
  "AR-10": [
    { name: ".308 Win",       bolt: "SR25", mag: "SR25/DPMS", thread: "5/8x24" },
    { name: "6.5 Creedmoor",  bolt: "SR25", mag: "SR25/DPMS", thread: "5/8x24" },
    { name: ".243 Win",       bolt: "SR25", mag: "SR25/DPMS", thread: "5/8x24" },
  ],
};

// Gas system lengths, with the approximate distance (inches) from the chamber
// to the gas port. A free-float rail must extend past that point.
const GAS_SYSTEMS = {
  Pistol:       { port: 4,  minLen: 7,  maxLen: 11.5 },
  Carbine:      { port: 7,  minLen: 10, maxLen: 18 },
  "Mid-length": { port: 9,  minLen: 14, maxLen: 20 },
  Rifle:        { port: 12, minLen: 18, maxLen: 24 },
  Intermediate: { port: 10, minLen: 16, maxLen: 22 },
};

const GAS_JOURNALS = [0.625, 0.750, 0.875]; // barrel gas seat diameter
const RAIL_INTERFACES = ["M-LOK", "KeyMod", "Picatinny Quad", "M-LOK (proprietary)"];
const BUFFER_SPECS = ["Mil-Spec", "Commercial"];
const BUFFER_CLASSES = ["Carbine", "Rifle", "Pistol"];

// ---- Category definitions ----------------------------------------------------
// The 25 part groups that make up a complete rifle. `group` buckets them for the
// UI; `count` is roughly how many SKUs to synthesize for that category.
const CATEGORIES = [
  { id: "lower_receiver", name: "Stripped Lower Receiver", group: "Lower", count: 320 },
  { id: "lower_parts",    name: "Lower Parts Kit",         group: "Lower", count: 140 },
  { id: "trigger",        name: "Trigger Group",           group: "Lower", count: 260 },
  { id: "grip",           name: "Pistol Grip",             group: "Lower", count: 190 },
  { id: "buffer_tube",    name: "Buffer Tube (Receiver Ext.)", group: "Lower", count: 150 },
  { id: "buffer",         name: "Recoil Buffer",           group: "Lower", count: 120 },
  { id: "spring",         name: "Action Spring",           group: "Lower", count: 90 },
  { id: "stock",          name: "Buttstock / Brace",       group: "Lower", count: 300 },
  { id: "castle_nut",     name: "Castle Nut & End Plate",  group: "Lower", count: 80 },
  { id: "takedown_pins",  name: "Takedown / Pivot Pins",   group: "Lower", count: 70 },
  { id: "magazine",       name: "Magazine",                group: "Feed",  count: 210 },
  { id: "upper_receiver", name: "Stripped Upper Receiver", group: "Upper", count: 300 },
  { id: "barrel",         name: "Barrel",                  group: "Upper", count: 520 },
  { id: "bcg",            name: "Bolt Carrier Group",      group: "Upper", count: 340 },
  { id: "charging_handle",name: "Charging Handle",         group: "Upper", count: 180 },
  { id: "gas_block",      name: "Gas Block",               group: "Upper", count: 160 },
  { id: "gas_tube",       name: "Gas Tube",                group: "Upper", count: 110 },
  { id: "handguard",      name: "Handguard / Free-Float Rail", group: "Upper", count: 480 },
  { id: "barrel_nut",     name: "Barrel Nut",              group: "Upper", count: 90 },
  { id: "muzzle_device",  name: "Muzzle Device",           group: "Upper", count: 300 },
  { id: "crush_washer",   name: "Muzzle Crush Washer",     group: "Upper", count: 60 },
  { id: "forward_assist", name: "Forward Assist Assembly", group: "Upper", count: 70 },
  { id: "ejection_cover", name: "Ejection Port Cover",     group: "Upper", count: 80 },
  { id: "optic",          name: "Optic / Sighting System", group: "Optics",count: 260 },
  { id: "accessory",      name: "Handstop / Rail Accessory", group: "Optics", count: 150 },
];

// ---- Helpers for names -------------------------------------------------------
const BARREL_PROFILES = [
  { name: "Pencil",        w: 0.72 }, { name: "Lightweight", w: 0.82 },
  { name: "Government",    w: 1.0 },  { name: "Medium (M4)", w: 1.05 },
  { name: "SOCOM",         w: 1.18 }, { name: "HBAR",        w: 1.35 },
  { name: "Bull / Heavy",  w: 1.55 },
];
const BARREL_MATERIALS = ["4150 CMV", "416R Stainless", "410 Stainless", "CarbonWrap", "Chromoly 4140"];
const FINISHES = ["Nitride", "Phosphate", "Hard Chrome", "Cerakote", "DLC", "NP3", "Raw"];
const RECEIVER_MATS = ["7075-T6 Billet", "7075-T6 Forged", "Ti-6Al-4V Titanium", "Polymer", "2099 Aluminum-Lithium"];

let _uid = 0;
const uid = (cat) => `${cat}-${(_uid++).toString(36)}`;
const money = (v) => Math.round(v);

// ============================================================================
//  Per-category generators. Each returns a part `attrs` bag + weight + price.
// ============================================================================
function genBarrel(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const cal = pick(CALIBERS[platform]);
  const lengths = platform === "AR-15" ? [7.5, 10.5, 11.5, 12.5, 14.5, 16, 18, 20] : [16, 18, 20, 22];
  const len = pick(lengths);
  // gas system must be physically possible for this length
  const gasOpts = Object.keys(GAS_SYSTEMS).filter((g) => len >= GAS_SYSTEMS[g].minLen && len <= GAS_SYSTEMS[g].maxLen && (platform === "AR-15" ? g !== "Intermediate" : g !== "Pistol"));
  const gas = pick(gasOpts.length ? gasOpts : ["Carbine"]);
  const journal = pick(GAS_JOURNALS);
  const profile = pick(BARREL_PROFILES);
  const material = pick(BARREL_MATERIALS);
  const isLightMat = material === "CarbonWrap";
  const baseW = (platform === "AR-15" ? 430 : 620) * (len / 16) * profile.w * (isLightMat ? 0.62 : 1);
  const weightG = round(baseW * (0.9 + rand() * 0.2), 1);
  const price = money((platform === "AR-15" ? 150 : 260) * profile.w * (isLightMat ? 2.1 : 1) + rand() * 120);
  return {
    name: `${len}" ${cal.name} ${profile.name} ${material}`,
    weightG, priceUSD: price,
    attrs: {
      platform, caliber: cal.name, bolt: cal.bolt, mag: cal.mag,
      thread: cal.thread, gas, gasPort: GAS_SYSTEMS[gas].port,
      journal, length: len, profile: profile.name, material,
    },
  };
}

function genBCG(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const bolts = [...new Set(CALIBERS[platform].map((c) => c.bolt))];
  const bolt = pick(bolts);
  const finish = pick(FINISHES);
  const light = chance(0.22);
  const base = platform === "AR-15" ? 330 : 560;
  const weightG = round(base * (light ? 0.7 : 1) * (0.92 + rand() * 0.16), 1);
  const price = money((platform === "AR-15" ? 110 : 210) * (light ? 1.8 : 1) + rand() * 90);
  return {
    name: `${platform} ${bolt} ${finish} BCG${light ? " (Lightweight)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform, bolt, finish, lightweight: light },
  };
}

function genUpper(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const mat = pick(RECEIVER_MATS);
  const fa = chance(0.6);
  const light = mat.includes("Titanium") || mat === "Polymer";
  const base = platform === "AR-15" ? 250 : 360;
  const weightG = round(base * (light ? 0.72 : 1) * (0.95 + rand() * 0.12), 1);
  const price = money((platform === "AR-15" ? 90 : 170) * (light ? 1.7 : 1) + rand() * 80);
  return {
    name: `${platform} ${mat} Upper${fa ? "" : " (Slick-side)"}`,
    weightG, priceUSD: price,
    attrs: { platform, material: mat, forwardAssist: fa, rail: "Picatinny Flat-top" },
  };
}

function genLower(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const mat = pick(RECEIVER_MATS);
  const pin = chance(0.9) ? ".154 Mil-Spec" : ".170 Colt";
  const light = mat.includes("Titanium") || mat === "Polymer";
  const magFamily = platform === "AR-15" ? "STANAG" : "SR25/DPMS";
  const base = platform === "AR-15" ? 240 : 380;
  const weightG = round(base * (light ? 0.7 : 1) * (0.95 + rand() * 0.12), 1);
  const price = money((platform === "AR-15" ? 100 : 220) * (light ? 1.8 : 1) + rand() * 90);
  return {
    name: `${platform} ${mat} Lower`,
    weightG, priceUSD: price,
    attrs: { platform, material: mat, triggerPin: pin, magFamily },
  };
}

function genTrigger(brand) {
  const pin = chance(0.9) ? ".154 Mil-Spec" : ".170 Colt";
  const types = ["Mil-Spec Single-Stage", "Enhanced Single-Stage", "2-Stage Match", "Drop-in Cassette", "Binary"];
  const type = pick(types);
  const drop = type === "Drop-in Cassette" || type === "Binary";
  const weightG = round((drop ? 90 : 70) * (0.9 + rand() * 0.2), 1);
  const price = money((type.includes("Match") || drop ? 180 : 45) + rand() * 160);
  return {
    name: `${type} Trigger`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", triggerPin: pin, type, dropIn: drop },
  };
}

function genBufferTube(brand) {
  const platform = "Multi";
  const spec = pick(BUFFER_SPECS);
  const cls = pick(BUFFER_CLASSES);
  const mat = pick(["7075 Aluminum", "6061 Aluminum", "Titanium", "7075 (Milled)"]);
  const light = mat === "Titanium";
  const weightG = round((cls === "Rifle" ? 200 : 120) * (light ? 0.6 : 1) * (0.9 + rand() * 0.2), 1);
  const price = money((cls === "Rifle" ? 40 : 30) * (light ? 3 : 1) + rand() * 40);
  return {
    name: `${cls} ${spec} Receiver Extension (${mat})`,
    weightG, priceUSD: price,
    attrs: { platform, bufferSpec: spec, bufferClass: cls, material: mat },
  };
}

function genBuffer(brand) {
  const cls = pick(BUFFER_CLASSES);
  // realistic weights per class/mass
  const carbineMasses = [
    { n: "H0 (Standard)", oz: 3.0 }, { n: "H1", oz: 3.8 },
    { n: "H2", oz: 4.7 }, { n: "H3", oz: 5.4 },
  ];
  let label, oz;
  if (cls === "Carbine" || cls === "Pistol") { const m = pick(carbineMasses); label = m.n; oz = m.oz; }
  else { label = "Rifle"; oz = 5.0 + rand() * 0.5; }
  const tungsten = chance(0.4);
  const weightG = round(oz * 28.35, 1);
  const price = money((tungsten ? 35 : 18) + rand() * 30);
  return {
    name: `${cls} Buffer ${label}${tungsten ? " (Tungsten)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", bufferClass: cls, mass: label },
  };
}

function genSpring(brand) {
  const cls = pick(BUFFER_CLASSES.filter((c) => c !== "Pistol").concat(["Carbine"]));
  const flat = chance(0.35);
  const weightG = round((cls === "Rifle" ? 35 : 22) * (0.9 + rand() * 0.2), 1);
  const price = money((flat ? 25 : 8) + rand() * 20);
  return {
    name: `${cls} Action Spring${flat ? " (Flat-wire)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", bufferClass: cls, flatWire: flat },
  };
}

function genStock(brand) {
  const cls = pick(BUFFER_CLASSES);
  const spec = cls === "Rifle" ? "Rifle-Fixed" : pick(BUFFER_SPECS);
  const isBrace = cls === "Pistol";
  const forms = cls === "Rifle" ? ["A2 Fixed", "PRS Precision"] : isBrace ? ["SBA3 Brace", "Pistol Buffer Brace"] : ["Collapsible Carbine", "Minimalist", "Precision Adjustable"];
  const form = pick(forms);
  const light = form === "Minimalist";
  const weightG = round((cls === "Rifle" ? 340 : light ? 150 : 240) * (0.9 + rand() * 0.2), 1);
  const price = money((form.includes("Precision") || form.includes("PRS") ? 180 : 55) + rand() * 90);
  return {
    name: `${form} Stock`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", bufferSpec: spec, bufferClass: cls, form },
  };
}

function genCastleNut(brand) {
  const spec = pick(BUFFER_SPECS);
  const qd = chance(0.5);
  const weightG = round(45 * (0.9 + rand() * 0.2), 1);
  const price = money(12 + rand() * 25);
  return {
    name: `Castle Nut + End Plate (${spec}${qd ? ", QD" : ""})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", bufferSpec: spec, qd },
  };
}

function genMagazine(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const cal = pick(CALIBERS[platform]);
  const cap = platform === "AR-15" ? pick([10, 20, 30, 40]) : pick([5, 10, 20, 25]);
  const mat = pick(["Polymer", "Aluminum", "Steel", "Polymer (Window)"]);
  const light = mat === "Polymer" || mat === "Polymer (Window)";
  const weightG = round((platform === "AR-15" ? 4 : 9) * cap * (light ? 1 : 1.7) + 60, 1);
  const price = money((mat === "Steel" ? 25 : 14) + rand() * 22);
  return {
    name: `${cap}rd ${cal.mag} ${mat} Magazine`,
    weightG, priceUSD: price,
    attrs: { platform, mag: cal.mag, capacity: cap, material: mat },
  };
}

function genChargingHandle(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const ambi = chance(0.6);
  const mat = pick(["7075 Aluminum", "Billet Aluminum", "Titanium", "Steel-reinforced"]);
  const light = mat === "Titanium";
  const weightG = round((platform === "AR-15" ? 55 : 80) * (light ? 0.7 : 1) * (0.9 + rand() * 0.2), 1);
  const price = money((ambi ? 70 : 25) + rand() * 90);
  return {
    name: `${platform} ${ambi ? "Ambi " : ""}Charging Handle (${mat})`,
    weightG, priceUSD: price,
    attrs: { platform, ambidextrous: ambi, material: mat },
  };
}

function genGasBlock(brand) {
  const bore = pick(GAS_JOURNALS);
  const adjustable = chance(0.45);
  const mount = pick(["Set-screw", "Clamp-on", "Dimpled Set-screw"]);
  const mat = pick(["416 Stainless", "4140 Steel", "Titanium", "Melonite Steel"]);
  const light = mat === "Titanium";
  const weightG = round(45 * (light ? 0.6 : 1) * (0.9 + rand() * 0.2), 1);
  const price = money((adjustable ? 60 : 18) + rand() * 60);
  return {
    name: `${bore}" Low-Profile Gas Block${adjustable ? " (Adjustable)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", bore, adjustable, mount, material: mat },
  };
}

function genGasTube(brand) {
  const gas = pick(Object.keys(GAS_SYSTEMS));
  const mat = pick(["416 Stainless", "Nitrided Steel", "Gold (Melonite)"]);
  const weightG = round((gas === "Rifle" ? 22 : 14) * (0.9 + rand() * 0.2), 1);
  const price = money(9 + rand() * 22);
  return {
    name: `${gas}-Length Gas Tube (${mat})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", gas, material: mat },
  };
}

function genHandguard(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const rail = pick(RAIL_INTERFACES);
  const len = pick(platform === "AR-15" ? [7, 9, 10.5, 12, 13.5, 15, 16.5] : [12, 13.5, 15, 16.5, 17]);
  const mat = pick(["6061 Aluminum", "7075 Aluminum", "CarbonFiber", "Titanium-reinforced"]);
  const light = mat === "CarbonFiber";
  // proprietary barrel-nut mounting: most free-floats ship a brand-specific nut
  const mount = chance(0.7) ? `${brand.split(" ")[0]} Proprietary` : "Mil-Spec Standard";
  const weightG = round((3.2 * len + 40) * (light ? 0.6 : 1) * (0.9 + rand() * 0.2), 1);
  const price = money((light ? 220 : 90) + len * 6 + rand() * 90);
  return {
    name: `${len}" ${rail} Free-Float Rail (${mat})`,
    weightG, priceUSD: price,
    attrs: { platform, rail, length: len, mount, material: mat },
  };
}

function genBarrelNut(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const mount = chance(0.7) ? `${brand.split(" ")[0]} Proprietary` : "Mil-Spec Standard";
  const weightG = round(70 * (0.9 + rand() * 0.2), 1);
  const price = money(15 + rand() * 40);
  return {
    name: `Barrel Nut (${mount})`,
    weightG, priceUSD: price,
    attrs: { platform, mount },
  };
}

function genMuzzle(brand) {
  const thread = pick(["1/2x28", "5/8x24", "9/16x24", "3/4x24"]);
  const type = pick(["A2 Flash Hider", "3-Prong Flash Hider", "Muzzle Brake", "Linear Comp", "Hybrid Comp", "Suppressor Mount"]);
  const mat = pick(["17-4 Stainless", "9310 Steel", "Titanium", "Nitrided Steel"]);
  const light = mat === "Titanium";
  const weightG = round((type.includes("Brake") ? 90 : 60) * (light ? 0.6 : 1) * (0.9 + rand() * 0.2), 1);
  const price = money((type.includes("Mount") || type.includes("Hybrid") ? 90 : 20) + rand() * 90);
  return {
    name: `${type} (${thread})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", thread, type, material: mat },
  };
}

function genCrushWasher(brand) {
  const thread = pick(["1/2x28", "5/8x24", "9/16x24", "3/4x24"]);
  const type = chance(0.5) ? "Crush Washer" : "Peel Shim Set";
  const weightG = round(6 * (0.9 + rand() * 0.2), 1);
  const price = money(3 + rand() * 12);
  return {
    name: `${type} (${thread})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", thread, type },
  };
}

function genForwardAssist(brand) {
  const weightG = round(28 * (0.9 + rand() * 0.2), 1);
  const price = money(10 + rand() * 25);
  return {
    name: `Forward Assist Assembly`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", requiresFACut: true },
  };
}

function genEjectionCover(brand) {
  const weightG = round(22 * (0.9 + rand() * 0.2), 1);
  const price = money(9 + rand() * 20);
  const laser = chance(0.4);
  return {
    name: `Ejection Port Cover${laser ? " (Laser-marked)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi" },
  };
}

function genGrip(brand) {
  const mat = pick(["Polymer", "Aluminum", "Rubber Overmold", "Polymer (Textured)"]);
  const angle = pick(["15°", "17°", "25°", "Vertical"]);
  const light = mat.startsWith("Polymer");
  const weightG = round((mat === "Aluminum" ? 130 : 80) * (0.9 + rand() * 0.2), 1);
  const price = money(15 + rand() * 45);
  return {
    name: `${angle} Pistol Grip (${mat})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", angle, material: mat },
  };
}

function genLowerParts(brand) {
  const incl = chance(0.5) ? "with Ambi Safety" : "Standard";
  const weightG = round(95 * (0.9 + rand() * 0.2), 1);
  const price = money(35 + rand() * 60);
  return {
    name: `Lower Parts Kit (${incl}, less trigger)`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi" },
  };
}

function genTakedown(brand) {
  const platform = chance(0.78) ? "AR-15" : "AR-10";
  const ext = chance(0.4);
  const weightG = round(18 * (0.9 + rand() * 0.2), 1);
  const price = money(10 + rand() * 30);
  return {
    name: `Takedown / Pivot Pin Set${ext ? " (Extended)" : ""}`,
    weightG, priceUSD: price,
    attrs: { platform },
  };
}

function genOptic(brand) {
  const type = pick(["Micro Red Dot", "Full-size Red Dot", "1-6x LPVO", "1-8x LPVO", "3-9x Scope", "Flip-up Iron Sights", "Prism 3x"]);
  const light = type.includes("Red Dot") || type.includes("Iron");
  const weightG = round((type.includes("LPVO") || type.includes("Scope") ? 550 : type.includes("Iron") ? 90 : 160) * (0.9 + rand() * 0.2), 1);
  const price = money((type.includes("LPVO") ? 400 : type.includes("Iron") ? 60 : 150) + rand() * 400);
  return {
    name: `${type}`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", mount: "Picatinny", type },
  };
}

function genAccessory(brand) {
  const rail = pick(["M-LOK", "KeyMod", "Picatinny"]);
  const type = pick(["Handstop", "Angled Foregrip", "Vertical Grip", "M-LOK Rail Panel", "QD Sling Mount", "Weapon Light Mount"]);
  const weightG = round(45 * (0.9 + rand() * 0.2), 1);
  const price = money(15 + rand() * 60);
  return {
    name: `${type} (${rail})`,
    weightG, priceUSD: price,
    attrs: { platform: "Multi", rail, type },
  };
}

const GENERATORS = {
  barrel: genBarrel, bcg: genBCG, upper_receiver: genUpper, lower_receiver: genLower,
  trigger: genTrigger, buffer_tube: genBufferTube, buffer: genBuffer, spring: genSpring,
  stock: genStock, castle_nut: genCastleNut, magazine: genMagazine,
  charging_handle: genChargingHandle, gas_block: genGasBlock, gas_tube: genGasTube,
  handguard: genHandguard, barrel_nut: genBarrelNut, muzzle_device: genMuzzle,
  crush_washer: genCrushWasher, forward_assist: genForwardAssist,
  ejection_cover: genEjectionCover, grip: genGrip, lower_parts: genLowerParts,
  takedown_pins: genTakedown, optic: genOptic, accessory: genAccessory,
};

// ============================================================================
//  Build the whole catalog.
// ============================================================================
// Multiplier on the per-category `count` figures above. The base numbers keep
// the relative market realistic (lots of barrels/rails, few crush washers);
// SCALE fans the whole catalog out to the tens-of-thousands the real aftermarket
// spans without hand-authoring every SKU.
const SCALE = 6;

function buildCatalog() {
  const parts = {};       // cat id -> [parts]
  const all = [];
  for (const cat of CATEGORIES) {
    const gen = GENERATORS[cat.id];
    const list = [];
    const n = Math.round(cat.count * SCALE);
    for (let i = 0; i < n; i++) {
      const brand = pick(MANUFACTURERS);
      const p = gen(brand);
      const part = {
        id: uid(cat.id),
        cat: cat.id,
        catName: cat.name,
        brand,
        name: p.name,
        fullName: `${brand} ${p.name}`,
        weightG: p.weightG,
        priceUSD: p.priceUSD,
        attrs: p.attrs,
      };
      list.push(part);
      all.push(part);
    }
    parts[cat.id] = list;
  }
  return { parts, all };
}

const CATALOG = buildCatalog();

export const catalog = CATALOG;
export const categories = CATEGORIES;
export const manufacturers = MANUFACTURERS;
export const platforms = PLATFORMS;
export const calibers = CALIBERS;
export const gasSystems = GAS_SYSTEMS;

export const stats = {
  totalParts: CATALOG.all.length,
  manufacturers: MANUFACTURERS.length,
  categories: CATEGORIES.length,
};
