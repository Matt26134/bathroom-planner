# Bathroom Planner V1.7.3

Product-aware bath rendering.

Why the imported bath looked generic:
- the Product Library stored its image and real dimensions correctly
- but the V1.7 renderer only had a generic bath model
- the Lille vanity looked better because it already had a dedicated 2-drawer vanity renderer

V1.7.3 fixes that gap:
- imported bath products can now choose bath-specific 3D styles
- Straight single-ended bath · right
- Straight single-ended bath · left
- Straight double-ended bath
- Freestanding oval bath (library option prepared for later renderer extension)
- the Legend right-hand bath JSON style `straightSingleEndedRight` is now understood by 3D
- better bath rim, acrylic body, inner floor, sloping bath sides/end, waste/overflow detail
- handed end is visually differentiated
- product image remains a reference image, while type/dimensions/3D style drive geometry
- removed the teal 3D orientation arrows now that rotation has been debugged

Update:
1. Extract the ZIP.
2. Upload ALL files to the repo root.
3. Commit.
4. Tap Reload latest.
5. Existing imported Legend product should automatically render with its product-specific style.
