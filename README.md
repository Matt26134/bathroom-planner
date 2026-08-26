# Bathroom Planner V1.7.2

Rotation correction.

Fixed:
- objects rotate around their centre instead of their top-left corner
- 0° -> 90° -> 180° -> 270° -> 0°
- 90° and 270° swap the footprint correctly
- the 2D plan and Three.js 3D use the same angle convention
- the editor shows which wall the object's FRONT is facing
- clearer front-direction marker in 2D and a small matching marker in 3D
- removed duplicated old Product/3D code that had accumulated inside index.html

The previous version could rotate the angle but move the footprint around the wrong anchor,
which made the 2D and 3D layouts look inconsistent.

Update:
1. Extract the ZIP.
2. Upload ALL files to the root of the existing bathroom-planner repo.
3. Commit.
4. Open the app and tap Reload latest if needed.
