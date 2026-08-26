# Bathroom Planner V1.8.9.1 Hotfix

V1.8.9 had a startup JavaScript break caused by two mirror wall-mount controls being referenced in code but accidentally omitted from the HTML.

## Fixed
- restored the missing **Mounted wall** mirror field
- restored the missing **Position along wall** mirror field
- prevents the JavaScript startup error that broke V1.8.9
- retains the V1.8.9 architecture:
  - mirror is a true wall-mounted object
  - rain head + handset are independent room-wall fixtures
  - shower controls are hosted by the half-height stud wall
  - shower hardware is matte black
  - tray rotation no longer drives shower fittings

## Update
1. Extract this ZIP.
2. Upload all files over the existing repo root.
3. Commit.
4. Open the app and tap **Reload latest**.
