# Bathroom Planner V1.7.0

Complete replacement package.

V1.7 is the final major V1 feature pass before plumbing.

3D overhaul:
- new Three.js WebGL renderer for the 3D room
- no permanent floating object labels
- automatic hiding of the nearest exterior wall
- proper segmented walls around the real window and door openings
- window frame and transparent glazing
- better lighting, shadows and perspective
- recognisable bath with rim/cavity/drain
- recognisable WC with cistern, bowl and seat
- improved Lille/product vanity with antique-oak body, drawer fronts, brass handles,
  ceramic top, basin detail and tap
- shower tray and drain rather than a large transparent cuboid
- half-height stud wall with transparent glass above
- towel radiator modelled as rails rather than a box
- storage shown as cabinetry
- niches rendered as wall/stud recess panels rather than floor boxes
- touch orbit, pinch zoom and tap-to-edit
- Door / Window / Top / Reset camera presets retained
- wall toggle retained
- wall elevations retained
- 2D Plan, measurements and Product Library unchanged

The 3D renderer loads Three.js from jsDelivr when the 3D view is used, so an internet
connection is needed for the visual 3D engine. The rest of the app remains local/static.

Update:
1. Extract the ZIP.
2. Upload ALL files to the root of your existing bathroom-planner repo.
3. Commit.
4. Open the app and tap Reload latest if needed.
