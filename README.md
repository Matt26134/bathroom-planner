# Bathroom Planner V1.8.6

This is a deeper 3D fix build following the issues you spotted in V1.8.5.

## Fixes in this build
- **Shower mount side fixed properly**
  - the shower hardware now uses the shower's adjacent **stud / vanity side** as the reference
  - **Vanity / stud-wall side** places the rain head and controls on that side
  - **Opposite side** flips them to the other side
- **Door frame hanging fix**
  - the 3D door now obeys the same right-wall visibility logic as the doorway wall,
    so the floating / hanging piece should no longer appear when that wall is hidden
- Version bump and wording cleanup for the shower-side control

## Update steps
1. Extract the ZIP.
2. Replace the full repo contents with the new files.
3. Commit and wait for GitHub Pages to publish.
4. Open the app and tap **Reload latest**.

## Where to test
- Tap the **shower** in Plan or 3D and switch **Shower mount side**.
- In your current layout, **Vanity / stud-wall side** should place the shower hardware on the side nearest the vanity half-wall.
- Orbit the 3D camera around the door side and check the door no longer leaves a hanging top/vertical piece behind.
