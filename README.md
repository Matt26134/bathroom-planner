# Bathroom Planner V3.0.6

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
Upload the contents of `bathroom-planner-v3.0.4-GITHUB-ROOT.zip` directly into the GitHub Pages repository root. The page should show `V3.0.6 · wall risers, mixed water & plumbing focus` and the 3D status should show `renderer V3.0.6`.


## V3.0.1 plumbing routes
Adds routeable hot, cold, waste and soil runs in Plan and 3D, per-route diameter/material/Z/fall, ordering allowance, approximate bend count and CSV export. Pipe routes are stored with plan variants and recovery snapshots.


## V3.0.6 plumbing wall risers and focus view
- Added Mixed water (purple) for pipework downstream of a mixer.
- Every route point can now have its own Z height.
- “Add riser/drop” creates a second point at the same X/Y so the 3D route turns truly vertical up/down a stud or shower wall.
- Route length and CSV ordering include vertical pipe length and 3D bends.
- Added Plumbing focus in 3D: room fixtures, walls and surfaces become translucent while pipework is visually prioritised. Joists/noggins remain fully solid and the deck is hidden so under-floor routing is readable.


## V3.0.6 plumbing interaction
- Select a saved pipe route and move the complete route up/down while preserving all relative node heights, risers, drops and slopes.
- Pipe routes can be selected directly in the 3D view.
- Direct 3D pipe drawing supports Level next, Vertical next and Surface point modes.
- Plan and 3D drawing share the same route model, ordering lengths and node-height editor.


## V3.0.6
- Added a permanently visible `+ Add` entry at the start of the 3D toolbar.
- Pipe routes (hot/cold/mixed/waste/soil) can now be started directly from the 3D view without going back to Build.
- Added direct 3D recess/niche placement on room walls and stud faces with width, height and depth controls.
- New 3D-created recesses can be moved along and up/down their mounting wall using the normal 3D move workflow.
- Upgraded mounted recess rendering to show a recessed back plus four internal returns rather than a flat marker.


## V3.0.6 saved pipe editing and 3D hit-testing
- Saved pipe routes can be dragged directly in Plan to translate the complete route in X/Y while preserving all Z heights, risers and slopes.
- Selected routes can also be nudged in X/Y/Z from Build and the 3D selected-pipe overlay.
- Added explicit Delete selected route / Delete pipe actions, including directly from 3D.
- The 3D Add menu now force-collapses whenever pipe drawing starts or a point is placed.
- Removed the Section X, Section Y, Door view and Window view toolbar buttons.
- Rebuilt direct 3D placement hit-testing around actual visible meshes. Stud-wall pipe points snap to the stud centre plane; room-wall pipe points are embedded slightly inside the wall rather than floating in front of the clicked face.
- Recess placement uses the same ancestor-aware wall/stud hit resolution.
