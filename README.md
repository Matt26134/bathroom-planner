# Bathroom Planner V1.8.9

Wall-mounted fixture architecture pass.

## Shower
- shower heads are no longer children of the shower tray
- the rain head and handset are fixed to the **left room wall: the wall opposite the door and the same wall the vanity comes off**
- mixer controls are hosted by the **half-height stud wall**
- all shower fittings and the glass cap are **matte black**
- rotating/replacing/moving the shower tray does not rotate the shower fittings

## Mirror
- mirrors are now treated as wall-mounted objects rather than floor objects in 3D
- imported mirrors default to the **vanity wall (opposite the door)**
- the Grace 500mm mirror should render vertically and flat against that wall
- mirror rotation is hidden because wall orientation is automatic
- mirror plan dragging is constrained along its host wall with a much larger touch target
- mirrors snap to the vanity centre
- new **Centre over vanity** action
- exact details include **Mounted wall** and **Centre along wall**

## Existing data
Existing products, tiles, room dimensions and layout remain in the same localStorage project. V1.8.9 migrates existing mirror objects onto the vanity wall and seeds the fixed shower wall fixtures.

## Update
1. Extract the ZIP.
2. Upload all files to the repo root, replacing the old files.
3. Commit and let GitHub Pages publish.
4. Open the app and tap **Reload latest**.
