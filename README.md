# Bathroom Planner V2.5.1

Complete replacement build. Upload every file in this folder over the GitHub Pages repo root. Existing `bathroomPlannerStable` data migrates forward in place.

## V2.5.1 — Newham bath + Trent freestanding tap fidelity

### Plan variants
- Project now contains **Plan variants**.
- **Duplicate current plan** snapshots the current fixture/service layout and immediately switches to the copy.
- The original remains saved and can be restored from the Active plan selector.
- Each plan can be renamed or deleted (the final remaining plan cannot be deleted).
- Room dimensions, products, tiles/surfaces, floor build-up, structure and heating remain shared; fixture/service positions are stored per plan.
- Variants are included in normal local autosave, JSON backup and `.bathplan` export/import.

### Free-angle item rotation
- Floor/free-positioned items are no longer limited to 0/90/180/270 degrees.
- Item editor adds **−15°**, **+15°**, **+90°**, plus an exact **Rotation °** field.
- Rotation keeps the object's centre fixed.
- 2D uses a true rotated footprint and 3D uses the same rotation value.
- Collision/clearance checks use the rotated item's axis-aligned bounding box, so they are intentionally conservative for angled furniture.
- Wall-mounted fixtures remain controlled by their mounting wall/stud rather than free-angle rotation.

### 2D selection no longer opens the editor automatically
- Tapping/dragging an item, door/window or service point now selects it without covering the plan.
- A **Details** button appears in the Plan toolbar for the current selection.
- Dragging can therefore be used repeatedly without dismissing the object sheet every time.
- Once Details is explicitly opened, exact-detail live editing remains available.

### Door flipping
- Door data now distinguishes hinge end from swing direction.
- **Flip in / out** changes whether the leaf swings into or out of the bathroom.
- **Flip hinge end** switches between the window-side and far-side jamb.
- The same settings drive the 2D swing arc and the Three.js door.
- Existing projects migrate to the previous default: swing into the bathroom.

### Retained V2.4 / V2.2 recovery behaviour
- Free-positioned V2.2-style shower glass, including visible fluted/reeded geometry.
- Floor cutaway/Under floor view with fixtures retained and joists exposed.
- Independent rain head, handset and shower controls with selectable finishes.
- Product-aware 3D, walkthrough, 3D movement, joist mapping, floor build-up, UFH planning and phone↔laptop `.bathplan` transfer.

## Data schema
- App version: 2.5.1
- Project schema: v6
- Portable `.bathplan` format remains format 2 and carries the complete project including plan variants.


### Product fidelity fix
- Bathroom Mountain Newham C51092 now uses a dedicated rounded/capsule freestanding bath shell with hollow basin, rolled rim, internal floor, reclining end walls, centre waste and overflow. It no longer renders as a rectangular generic bath.
- Bathroom Mountain Trent 12004 now uses a dedicated floor-mounted chrome mixer model with circular base, slim riser, mixer body, curved swan-neck spout, lever, hand shower and hanging hose. It no longer renders as a generic box.
- Known SKU recognition now overrides old `generic` render profiles for these two products, so products already imported from the previous JSONs upgrade automatically.
