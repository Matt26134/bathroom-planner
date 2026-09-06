# Bathroom Planner V3.0.2

Major V3 rebuild based on the stable V2.5.10 project format. Existing browser projects remain on the same storage key and are migrated in place; do not reset the project when upgrading.

## V3 additions
- Scene manager with visibility, locking and smart bathroom assemblies.
- Assembly nudge/move controls and item-to-assembly assignment.
- Unified selected-item inspector additions for configuration, relationships, services and intelligent alignment.
- Data-driven product configuration metadata, including Odesa countertop / integrated double basin / double vessel options.
- Room finish palette for metalwork, sanitaryware, furniture, glass and glass trim.
- High-detail sanitaryware pass: baths, Metro/generic WCs, integrated basins, vessel basins, taps and shower glass.
- 3D quality levels: Draft, Detailed and Presentation.
- Auto / All / None wall visibility modes.
- Camera presets for vanity, bath, shower, WC, corner and eye level, plus saved camera position.
- Full-screen 3D mode.
- Two-point 3D measurement.
- X/Y section cut views.
- Design checks for collisions, room bounds, tolerance, WC side space and approximate vanity drawer zone.
- Service-aware target generation for vanities, WCs, baths, showers and shower controls.
- Live product specification schedule and CSV export.
- Plan-variant comparison with temporary 3D/plan preview.
- V3 local restore points before major V3 actions.

## Upgrade
Upload the contents of `bathroom-planner-v3.0.2-GITHUB-ROOT.zip` directly into the GitHub Pages repository root. The page should show `V3.0.2 · wall risers, mixed water & plumbing focus` and the 3D status should show `renderer V3.0.2`.


## V3.0.1 plumbing routes
Adds routeable hot, cold, waste and soil runs in Plan and 3D, per-route diameter/material/Z/fall, ordering allowance, approximate bend count and CSV export. Pipe routes are stored with plan variants and recovery snapshots.


## V3.0.2 plumbing wall risers and focus view
- Added Mixed water (purple) for pipework downstream of a mixer.
- Every route point can now have its own Z height.
- “Add riser/drop” creates a second point at the same X/Y so the 3D route turns truly vertical up/down a stud or shower wall.
- Route length and CSV ordering include vertical pipe length and 3D bends.
- Added Plumbing focus in 3D: room fixtures, walls and surfaces become translucent while pipework is visually prioritised. Joists/noggins remain fully solid and the deck is hidden so under-floor routing is readable.
