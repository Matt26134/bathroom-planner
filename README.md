# Bathroom Planner V1.9.0

V1.9 is a stability rebuild of the wall-mounted-object work, not another visual patch.

## Root cause found
V1.8.9 / V1.8.9.1 could fail only for users who already had a mirror in saved data. During startup the mirror migration called `itemDims()` before the `const itemDims = ...` declaration had been initialised. JavaScript therefore threw **Cannot access 'itemDims' before initialization** before the first plan render, leaving the plan completely blank.

This was reproduced in a browser harness with an old-style saved mirror and is fixed in V1.9 by making the geometry helpers hoisted functions and hardening state migration.

## V1.9 changes
- fixes the mirror migration startup crash
- hardens missing/older project, room, item and UI state
- re-applies the fixed shower hardware definition on upgrade:
  - rain head: left / vanity wall (wall opposite door)
  - handset: same wall
  - controls: half-height stud wall
  - finish: matte black
- shower tray remains completely independent of shower hardware
- generic mirrors are wall-mounted immediately when added
- imported mirrors migrate to a wall-mounted representation safely
- larger mobile drag target for mirrors
- mirror duplication follows the host wall instead of jumping into the room
- old backup imports are normalised by reloading them through the standard startup migration
- visible runtime diagnostic banner if a future boot error occurs instead of a silent blank canvas

## Update
1. Extract the ZIP.
2. Upload all files to the root of the existing GitHub Pages repo, replacing the old files.
3. Commit.
4. Wait for Pages to publish.
5. Open the app and tap **Reload latest**.

Existing localStorage data is preserved.
