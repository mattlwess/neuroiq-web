// ============================================================================
//  scene.js — Live 3D rifle that rotates on an axis and rebuilds as parts
//  are chosen. Built from primitive geometry (no external model files) so the
//  whole thing is self-contained. Parts that haven't been selected show as a
//  translucent "ghost"; selected parts render solid and briefly flash when
//  they're added.
// ============================================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let renderer, scene, camera, controls, root, raf;
let autoRotate = true;
const groups = {}; // category id -> THREE.Group

const COL = {
  present: 0x378add,   // signal blue
  metal: 0x9fb3c8,
  dark: 0x243447,
  ghost: 0x2a3b52,
  flash: 0x85e0ff,
  accent: 0x1d9e75,
};

function mat(color, { ghost = false, metal = 0.6 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: metal,
    roughness: ghost ? 0.9 : 0.35,
    transparent: ghost,
    opacity: ghost ? 0.12 : 1,
  });
}

// A helper to add a named group that can be shown/hidden and recolored.
function group(name) {
  const g = new THREE.Group();
  g.userData.cat = name;
  groups[name] = g;
  root.add(g);
  return g;
}

function box(w, h, d, color, opts) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, opts));
  return m;
}
function cyl(rt, rb, h, color, opts, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat(color, opts));
  m.rotation.z = Math.PI / 2; // lay along X (the bore axis)
  return m;
}

// Build the static skeleton once. Everything is positioned along +X = muzzle.
function buildRifle() {
  root = new THREE.Group();
  scene.add(root);

  // ---- Lower receiver + magazine + grip + buffer assembly (rear/bottom) ----
  const lower = group("lower_receiver");
  const lowerBody = box(3.4, 1.2, 1.0, COL.dark);
  lowerBody.position.set(-1.5, -0.35, 0);
  lower.add(lowerBody);
  const magwell = box(1.1, 0.9, 0.95, COL.dark);
  magwell.position.set(-0.9, -0.9, 0);
  lower.add(magwell);

  const mag = group("magazine");
  const magBody = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 0.8), mat(COL.dark));
  magBody.position.set(-0.9, -2.2, 0);
  magBody.rotation.z = -0.18; // curved-mag lean
  mag.add(magBody);

  const grip = group("grip");
  const gripBody = box(0.7, 1.8, 0.8, COL.dark);
  gripBody.position.set(-2.7, -1.2, 0);
  gripBody.rotation.z = 0.35;
  grip.add(gripBody);

  const bufTube = group("buffer_tube");
  const tube = cyl(0.42, 0.42, 3.2, COL.metal);
  tube.position.set(-4.2, 0.15, 0);
  bufTube.add(tube);

  const stock = group("stock");
  const stockBody = box(1.6, 1.5, 1.0, COL.dark);
  stockBody.position.set(-5.4, 0.0, 0);
  const buttpad = box(0.35, 1.7, 1.05, COL.ghost);
  buttpad.position.set(-6.2, -0.05, 0);
  stock.add(stockBody, buttpad);

  // ---- Upper receiver + barrel + handguard + gas block + muzzle + optic ----
  const upper = group("upper_receiver");
  const upperBody = box(3.4, 1.0, 1.0, COL.metal);
  upperBody.position.set(-1.5, 0.55, 0);
  const railTop = box(3.2, 0.18, 0.5, COL.dark);
  railTop.position.set(-1.5, 1.14, 0);
  upper.add(upperBody, railTop);

  const ch = group("charging_handle");
  const chBody = box(0.5, 0.3, 1.4, COL.metal);
  chBody.position.set(-3.05, 0.75, 0);
  ch.add(chBody);

  const bcg = group("bcg");
  const bcgBody = cyl(0.34, 0.34, 1.6, COL.accent);
  bcgBody.position.set(-1.7, 0.55, 0);
  bcg.add(bcgBody);

  const barrel = group("barrel");
  const barBody = cyl(0.22, 0.26, 6.2, COL.metal, {}, 24);
  barBody.position.set(3.2, 0.55, 0);
  barrel.add(barBody);

  const handguard = group("handguard");
  const hgBody = cyl(0.55, 0.55, 4.6, COL.dark, {}, 8);
  hgBody.position.set(2.2, 0.55, 0);
  handguard.add(hgBody);

  const gasBlock = group("gas_block");
  const gb = box(0.5, 0.6, 0.6, COL.accent);
  gb.position.set(1.7, 0.55, 0);
  gasBlock.add(gb);

  const gasTube = group("gas_tube");
  const gt = cyl(0.06, 0.06, 3.0, COL.metal, {}, 8);
  gt.position.set(0.4, 0.85, 0);
  gasTube.add(gt);

  const muzzle = group("muzzle_device");
  const mz = cyl(0.34, 0.3, 0.9, COL.accent, {}, 16);
  mz.position.set(6.7, 0.55, 0);
  muzzle.add(mz);

  const optic = group("optic");
  const opticBody = box(1.4, 0.7, 0.7, COL.dark);
  opticBody.position.set(-1.3, 1.55, 0);
  const opticTube = cyl(0.3, 0.3, 1.6, COL.dark, {}, 16);
  opticTube.rotation.z = Math.PI / 2;
  opticTube.position.set(-1.3, 1.7, 0);
  optic.add(opticBody, opticTube);

  // Small / cosmetic parts share a subtle indicator on the receiver.
  const small = group("accessory");
  const acc = box(0.4, 0.25, 0.7, COL.accent);
  acc.position.set(3.4, 0.05, 0);
  small.add(acc);

  // Categories without dedicated geometry still get an (empty) group so the
  // app can call setPresent() uniformly.
  for (const id of ["trigger", "spring", "buffer", "castle_nut", "takedown_pins",
    "lower_parts", "barrel_nut", "crush_washer", "forward_assist", "ejection_cover"]) {
    if (!groups[id]) group(id);
  }

  // Start as ghosts.
  for (const id of Object.keys(groups)) setPresent(id, false, false);
}

// Toggle a part group between ghost and solid; optionally flash on add.
export function setPresent(catId, present, flash = true) {
  const g = groups[catId];
  if (!g) return;
  g.traverse((o) => {
    if (!o.isMesh) return;
    const baseColor = o.userData.baseColor || (o.userData.baseColor = o.material.color.getHex());
    o.material.transparent = !present;
    o.material.opacity = present ? 1 : 0.1;
    o.material.roughness = present ? 0.35 : 0.9;
    o.material.color.setHex(present ? baseColor : COL.ghost);
    o.material.needsUpdate = true;
    if (present && flash) {
      o.material.emissive = new THREE.Color(COL.flash);
      o.material.emissiveIntensity = 0.9;
      const start = performance.now();
      const fade = () => {
        const t = Math.min(1, (performance.now() - start) / 550);
        o.material.emissiveIntensity = 0.9 * (1 - t);
        if (t < 1) requestAnimationFrame(fade);
      };
      requestAnimationFrame(fade);
    }
  });
}

export function setAutoRotate(v) { autoRotate = v; }

export function initScene(container) {
  scene = new THREE.Scene();
  scene.background = null;

  const w = container.clientWidth, h = container.clientHeight;
  camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
  camera.position.set(0.5, 1.8, 12.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.75));
  const key = new THREE.DirectionalLight(0xd6e8ff, 1.3); key.position.set(6, 10, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x5f8fe6, 0.9); rim.position.set(-8, 4, -6); scene.add(rim);
  const under = new THREE.PointLight(0x1d9e75, 0.5, 40); under.position.set(0, -6, 4); scene.add(under);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 20;
  controls.target.set(0.5, -0.3, 0);
  controls.addEventListener("start", () => { autoRotate = false; });

  buildRifle();

  const clock = new THREE.Clock();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (autoRotate) root.rotation.y += clock.getDelta() * 0.35;
    else clock.getDelta();
    controls.update();
    renderer.render(scene, camera);
  };
  loop();

  const onResize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", onResize);

  return { setPresent, setAutoRotate, resetView };
}

export function resetView() {
  if (!camera) return;
  camera.position.set(0.5, 1.8, 12.5);
  controls.target.set(0.5, -0.3, 0);
  autoRotate = true;
}
