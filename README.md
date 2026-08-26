# Bathroom Planner V2.0.0 — Build Foundation

V2 starts the construction-planning phase while preserving the V1 room, fixtures, products, tiles and wall-mounted objects.

## New in V2.0

### Floor build-up
- editable stack of floor layers
- enable/disable each layer
- editable thicknesses
- live total finished-floor build-up
- 0mm remains finished-floor reference, with deck/void shown below it

### Structure
- generated joist layout
- direction: window→door or left→right
- joist width, depth, centres and first offset
- editable structural deck thickness kept separately from the finish build-up
- manual noggin / obstruction rectangles
- Structure plan layer
- 3D Floor X-ray revealing deck and joists

### Underfloor-heating foundation
- Electric mat / loose cable / wet UFH planning modes
- output W/m²
- perimeter margin
- fixed-fixture exclusion option
- thermostat wall
- approximate heated-area and electrical-load calculations
- Heating plan layer
- X-ray heating layer when enabled

### Portable project file
- Export a `.bathplan` file
- Import the same file on phone, laptop or another browser
- uploaded product/tile images already stored in project state are carried with the project
- import makes a local recovery copy before replacing the current project
- readable JSON export retained for inspection/debugging

### Schema
- formal V2 schemaVersion
- project ID, created date and updated date
- migrations preserve V1 data
- Build logic isolated in `build-manager.js` instead of expanding the core renderer further

## Update
1. Extract the ZIP.
2. Upload **all files** to the root of the existing GitHub Pages repo.
3. Commit and wait for Pages to publish.
4. Open Bathroom Planner and tap **Reload latest**.
5. The app should identify itself as **V2.0.0 · build foundation**.

## Intended next steps
- V2.1: plumbing nodes, pipes, waste falls, fittings, joist-aware routing and clashes.
- V2.2: detailed UFH routing and electrical/wet-zone planning.
- V2.3: materials / shopping schedule.
