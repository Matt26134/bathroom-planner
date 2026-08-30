# Bathroom Planner V2.2.2
## Fixed in V2.2.2
- Glass panels now honour **0 mm above floor** in 3D. Previously, JavaScript treated `0` as false and silently substituted the 1100 mm default.
- The same explicit-zero fix is applied to other wall-mounted 3D objects with non-zero defaults (rain head, handset, shower controls, niche and mirror).
- Existing saved layouts are preserved; no re-adding of glass is required.


Representative 3D fixtures + explicit shower tray update.

## New in V2.2.2
- **Shower tray** is now an explicit Add-to-plan object (rather than the generic “Shower” label)
- new shower trays default to **1200 × 800 × 40mm** and remain fully resizable/rotatable
- existing shower-floor objects migrate in place and are relabelled **Shower tray** without changing their position or footprint
- tray finish can be changed per object: **White**, **Slate grey**, or **Black slate**
- 2D plan colour follows the selected tray finish
- 3D tray is now a low-profile rounded slab with a recessed deck and visible waste instead of a plain rectangular block
- slate finishes use a rougher stone-like material and subtle surface lines so the tray reads separately from the tiled floor
- shower glass remains completely detached: add **Plain glass panel** or **Fluted glass panel** separately
- shower rain head, handset and controls retain independent **Black / Silver** finish controls
- retains all V2.2.0 representative Gable bath geometry improvements and the same stable browser storage key

## Update
1. Extract the ZIP.
2. Upload all files to the repo root, replacing the existing files.
3. Commit and allow GitHub Pages to publish.
4. Open Bathroom Planner and tap **Reload latest**.

The update preserves the current locally saved project. Export a `.bathplan` backup first if you want an additional recovery copy.