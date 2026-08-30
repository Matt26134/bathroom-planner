# Bathroom Planner V2.2.0

Representative 3D fixtures + detached shower glass update.

## New in V2.2.0
- new **Back-to-wall D-shape bath · representative** 3D style
- product JSON can carry a `geometry3d` recipe so the 3D model uses more than a basic bounding box
- Gable GAB1500 products already in the local product library are migrated automatically to the new representative bath renderer
- the Gable model uses its 1500 × 750 × 575mm envelope, 1220 × 650mm lower outer body from the dimensional drawing, 920 × 450mm base cavity and 450mm internal depth
- bath bodies now support a tapered outer shell, continuous shaped rim, sloping inner cavity, rounded double-ended bowl, central waste and central overflow
- product editor exposes bath geometry values so the representative model can be visually tuned without editing source code
- stud walls no longer generate glass automatically
- shower trays no longer generate glass automatically
- **Plain glass panel** and **Fluted glass panel** are separate add-to-plan options
- fluted glass is represented with ridges on one face over a flat pane
- shower rain head, handset and control objects now support **Black** or **Silver** metal finishes
- a 3D toolbar Shower metal selector changes all shower hardware together; individual fittings can also override the finish in their item details
- all existing V2.1 project data is retained using the same stable browser storage key

## Update
1. Extract the ZIP.
2. Upload all files to the repo root, replacing the existing files.
3. Commit and allow GitHub Pages to publish.
4. Open Bathroom Planner and tap **Reload latest**.

The update preserves the current locally saved project. Export a `.bathplan` backup first if you want an additional recovery copy.
