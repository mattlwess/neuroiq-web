# RailForge — AR Build Configurator

A browser-based configurator for AR-pattern rifles. Pick from a catalog of parts
spanning ~85 manufacturers and 25 build slots; every selection filters the rest
of the catalog down to **only the parts that physically fit** — matching thread
pitch, gas-system length, caliber / bolt face, gas-journal diameter, buffer spec,
rail length and platform. A live 3D model assembles as you choose, and an
optimizer can auto-build the **lightest** (or **cheapest**) fully-compatible rifle.

Built as a demo with [Claude Code](https://claude.com/claude-code). No build step —
it's plain ES modules and can be served as static files. Live at `/builder/`.

## Try it

```bash
# from the repo root
cd builder && python3 -m http.server 8137
# open http://localhost:8137
```

(A static file server is required because the app uses ES modules; opening
`index.html` directly over `file://` won't load the modules.)

## How it's put together

| File          | Responsibility |
| ------------- | -------------- |
| `data.js`     | Deterministic, seeded generator that synthesizes the whole catalog (~30k SKUs). Every part carries an `attrs` bag describing its physical interfaces. |
| `compat.js`   | The fitment engine: pairwise interface rules that decide which parts connect, plus a lightest/cheapest full-build optimizer. |
| `scene.js`    | The Three.js 3D rifle. Parts render solid when selected, ghosted when empty, and flash when added. |
| `app.js`      | UI glue — category list, parts panel, build sheet, and the auto-build buttons. |
| `styles.css`  | Dark "armory" three-column layout. |
| `vendor/`     | Three.js, vendored locally so the 3D preview has no CDN dependency. |

## What "fits together" means here

The compatibility rules model the real interfaces of the platform, e.g.:

- **Barrel ↔ bolt carrier group** — bolt face must match the cartridge's case head
- **Barrel ↔ magazine** — cartridge / magazine well family
- **Barrel ↔ gas tube** — gas-system length (pistol / carbine / mid / rifle)
- **Barrel ↔ gas block** — gas-journal (seat) diameter
- **Barrel ↔ muzzle device** — thread pitch (e.g. 1/2×28 vs 5/8×24)
- **Handguard ↔ barrel** — the rail must clear the gas block and fit the barrel length
- **Handguard ↔ barrel nut** — proprietary vs mil-spec mounting
- **Buffer tube ↔ stock / buffer / spring / castle nut** — diameter, spec, spring class
- **Upper ↔ lower ↔ BCG ↔ charging handle** — platform (small-frame AR-15 vs large-frame AR-10)

> **Note:** The catalog is *synthetically generated* to demonstrate the fitment
> logic — it is not a database of real products, weights, or prices. Always verify
> actual part specifications and follow all applicable laws before assembling a
> real firearm.
