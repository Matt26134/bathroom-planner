# Bathroom Planner V2.3.2

Complete replacement build. Upload every file in this folder over the GitHub Pages repo root. Existing `bathroomPlannerStable` project data is migrated in place.

## V2.3 highlights
- Correct door leaf geometry: the leaf is centred inside the surveyed `door incl. frame` width. Example: 861mm frame + 760mm leaf = 50.5mm allowance at each jamb, and both 2D/3D hinge from that inset point.
- Product-aware 3D profiles recognised by SKU: Metro METCC WC, Imperia GR1208CW graphite slate tray, Milan MILF800WHAOBB fluted autumn-oak vanity, Merton 51120 curved corner bath and Arezzo ARZIM10MB black LED mirror.
- New material system: graphite slate texture, autumn oak grain, gloss ceramic/acrylic, chrome, brushed brass and matt black.
- Better model geometry: rounded Metro WC/cistern and wrap-over seat, square Imperia chrome grate, physical Milan fluting + brass handles, curved-corner Merton shell, black framed Arezzo LED mirror.
- Walkthrough mode in 3D: eye-level view, drag to look, on-screen phone arrows and WASD/arrow-key desktop movement.
- Product editor now includes a 3D fidelity profile and finish override. Automatic recognises the known SKUs.
- Existing 3D move, Under floor, joists, floor build-up, surfaces and `.bathplan` portability remain.

- Restored finish selector for independent shower fittings (matt black / silver-chrome / brushed brass).
- Strengthened Milan vanity fluting so the fluted front reads clearly again in 3D.

## V2.3.2 glass correction
- Restores a proper fluted/reeded shower-glass treatment above the half-height stud wall.
- Fluting is modelled on one face only, keeping the shower-facing side visually flat/easy-clean.
- Existing stud walls default to fluted glass if they do not already have a glass setting.
- Stud item settings now allow Fluted / Plain clear / No glass.
- Glass trim can be Matt black / Silver-chrome / Brushed brass.
- Reverted the accidental V2.3.1 change to the Milan vanity front; "fluting" in that hotfix was based on a misunderstanding.
