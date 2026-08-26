import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";

const api = window.BP3D;
const legacy = document.getElementById("threeDCanvas");
const viewMode = document.getElementById("viewMode");
const wallsToggle = document.getElementById("wallsToggle");
const elevationWrap = document.getElementById("elevationWrap");

if (!api || !legacy) {
  console.warn("Bathroom Planner 3D API not available.");
} else {
  legacy.classList.add("legacy3d-hidden");

  const canvas = document.createElement("canvas");
  canvas.id = "threeDWebgl";
  canvas.className = "threeWebgl";
  legacy.parentNode.insertBefore(canvas, legacy);

  const status = document.createElement("div");
  status.className = "threeStatus";
  status.textContent = "Visual 3D · tap a fixture to edit";
  legacy.parentNode.appendChild(status);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(1.8, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f1e9);

  const camera = new THREE.PerspectiveCamera(44, 1, 0.02, 30);
  const root = new THREE.Group();
  const wallRoot = new THREE.Group();
  const surfaceRoot = new THREE.Group();
  const itemRoot = new THREE.Group();
  const fixedRoot = new THREE.Group();
  scene.add(root, wallRoot, surfaceRoot, itemRoot, fixedRoot);

  const hemi = new THREE.HemisphereLight(0xfffbf2, 0xb8b5ab, 1.75);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff7e8, 2.4);
  key.position.set(4.5, 6.5, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 14;
  key.shadow.camera.left = -5;
  key.shadow.camera.right = 5;
  key.shadow.camera.top = 5;
  key.shadow.camera.bottom = -5;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdce9ef, 0.65);
  fill.position.set(-3, 3.5, -3);
  scene.add(fill);

  const textureLoader = new THREE.TextureLoader();
  const textureCache = new Map();

  const mats = {
    floor: new THREE.MeshStandardMaterial({ color: 0xe9e3d8, roughness: 0.92, metalness: 0 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xf1eee7, roughness: 0.92 }),
    wallSide: new THREE.MeshStandardMaterial({ color: 0xe1ddd3, roughness: 0.94 }),
    ceramic: new THREE.MeshStandardMaterial({ color: 0xf6f5f1, roughness: 0.28 }),
    ceramicInner: new THREE.MeshStandardMaterial({ color: 0xdcdedb, roughness: 0.48 }),
    oak: new THREE.MeshStandardMaterial({ color: 0xa7835e, roughness: 0.78 }),
    oakDark: new THREE.MeshStandardMaterial({ color: 0x866845, roughness: 0.82 }),
    timber: new THREE.MeshStandardMaterial({ color: 0xb39875, roughness: 0.8 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xb88943, roughness: 0.28, metalness: 0.7 }),
    metal: new THREE.MeshStandardMaterial({ color: 0xc8c8c3, roughness: 0.34, metalness: 0.68 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x5b5c57, roughness: 0.72 }),
    niche: new THREE.MeshStandardMaterial({ color: 0xb8aa96, roughness: 0.88 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xbfdce0, transmission: 0.74, transparent: true, opacity: 0.30,
      roughness: 0.08, metalness: 0, thickness: 0.012, side: THREE.DoubleSide,
      depthWrite: false
    }),
    mirror: new THREE.MeshPhysicalMaterial({
      color: 0xdde7e8, metalness: 0.58, roughness: 0.13,
      transparent: true, opacity: 0.90, side: THREE.DoubleSide
    }),
    windowGlass: new THREE.MeshPhysicalMaterial({
      color: 0xc7e2e7, transmission: 0.76, transparent: true, opacity: 0.24,
      roughness: 0.05, thickness: 0.01, side: THREE.DoubleSide, depthWrite: false
    })
  };

  let room = null;
  let wallSets = { window: [], opposite: [], left: [], right: [] };
  let surfaceSets = { floor: [], window: [], opposite: [], left: [], right: [] };
  let itemMeshes = [];
  let signature = "";
  let target = new THREE.Vector3(1.1, 0.9, 1.25);
  let radius = 4.7, theta = 0.72, phi = 1.00;
  let pointers = new Map(), drag = null, pinch = null;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const mm = v => (Number(v) || 0) / 1000;
  const itemDims = i => (i.rotation === 90 || i.rotation === 270) ? { w: i.h, d: i.w } : { w: i.w, d: i.h };

  function setItemId(obj, id) {
    obj.traverse?.(n => { n.userData.itemId = id; });
    obj.userData.itemId = id;
    return obj;
  }

  function meshBox(w, h, d, material, x=0, y=0, z=0, cast=true) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(Math.max(.004,w), Math.max(.004,h), Math.max(.004,d)), material);
    m.position.set(x,y,z);
    m.castShadow = cast;
    m.receiveShadow = true;
    return m;
  }

  function cylinder(radius, length, material, axis="y", segments=24) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, segments), material);
    if (axis === "x") m.rotation.z = Math.PI / 2;
    if (axis === "z") m.rotation.x = Math.PI / 2;
    m.castShadow = true;
    return m;
  }

  function groupForItem(i) {
    const d = itemDims(i);
    const g = new THREE.Group();
    g.position.set(mm(i.x + d.w/2), 0, mm(i.y + d.d/2));
    const angle=((Number(i.rotation)||0)%360+360)%360;
    g.rotation.y = -THREE.MathUtils.degToRad(angle);
    g.userData.itemId = i.id;
    return g;
  }

  function addWallBox(side, w,h,d,x,y,z) {
    if (w <= .002 || h <= .002 || d <= .002) return;
    const m = meshBox(w,h,d,mats.wall,x,y,z,false);
    m.receiveShadow = true;
    wallRoot.add(m);
    wallSets[side].push(m);
  }

  function buildWalls(s) {
    wallSets = { window: [], opposite: [], left: [], right: [] };
    const W=mm(s.room.width), D=mm(s.room.depth), H=mm(s.room.ceiling), T=.055;
    const win=s.room.window, wb=mm(win.before), ww=mm(win.width), sill=mm(win.sill), wh=mm(win.height);
    const wr=Math.max(0,W-wb-ww), above=Math.max(0,H-sill-wh);

    addWallBox("window", wb,H,T, wb/2,H/2,-T/2);
    addWallBox("window", wr,H,T, wb+ww+wr/2,H/2,-T/2);
    addWallBox("window", ww,sill,T, wb+ww/2,sill/2,-T/2);
    addWallBox("window", ww,above,T, wb+ww/2,sill+wh+above/2,-T/2);

    addWallBox("opposite", W,H,T, W/2,H/2,D+T/2);
    addWallBox("left", T,H,D, -T/2,H/2,D/2);

    const door=s.room.door, db=mm(door.before), dw=mm(door.width), de=db+dw, dh=mm(door.height);
    const after=Math.max(0,D-de), over=Math.max(0,H-dh);
    addWallBox("right", T,H,db, W+T/2,H/2,db/2);
    addWallBox("right", T,H,after, W+T/2,H/2,de+after/2);
    addWallBox("right", T,over,dw, W+T/2,dh+over/2,db+dw/2);

    // Visible door frame + inward-opening door leaf.
    // The wall opening remains the source of truth; the leaf is a visual aid.
    const doorFrameMat = new THREE.MeshStandardMaterial({color:0xe9e4da,roughness:.62});
    const doorLeafMat = new THREE.MeshStandardMaterial({color:0xf1eee7,roughness:.72});
    const trim=.045, leafT=.035;

    fixedRoot.add(meshBox(trim,dh+.07,.07,doorFrameMat,W-.018,(dh+.07)/2,db,false));
    fixedRoot.add(meshBox(trim,dh+.07,.07,doorFrameMat,W-.018,(dh+.07)/2,de,false));
    fixedRoot.add(meshBox(trim,dw+.09,.07,doorFrameMat,W-.018,dh+.025,db+dw/2,false));

    // Hinged at the back/lower end of the opening and shown partially open.
    // Closed leaf runs from hinge towards 'before door'; positive Y rotation swings it into the room.
    const doorPivot = new THREE.Group();
    doorPivot.position.set(W-.028,0,de);
    doorPivot.rotation.y = THREE.MathUtils.degToRad(58);
    const leaf = meshBox(leafT,dh-.03,dw-.035,doorLeafMat,-leafT/2,(dh-.03)/2,-(dw-.035)/2);
    doorPivot.add(leaf);

    const handleMat=mats.brass;
    const handleY=Math.min(1.02,dh*.52);
    const handleZ=-(dw-.035)*.78;
    const handleStem=cylinder(.012,.055,handleMat,"x",18);
    handleStem.position.set(-.045,handleY,handleZ);
    doorPivot.add(handleStem);
    const handleBar=meshBox(.018,.018,.11,handleMat,-.074,handleY,handleZ-.045,false);
    doorPivot.add(handleBar);
    fixedRoot.add(doorPivot);

    // Window frame + glass
    const frameMat = new THREE.MeshStandardMaterial({color:0xc8c2b6,roughness:.55});
    const fw=.035;
    const frame = new THREE.Group();
    frame.add(meshBox(ww,fw,.025,frameMat,wb+ww/2,sill,-.012,false));
    frame.add(meshBox(ww,fw,.025,frameMat,wb+ww/2,sill+wh,-.012,false));
    frame.add(meshBox(fw,wh,.025,frameMat,wb,sill+wh/2,-.012,false));
    frame.add(meshBox(fw,wh,.025,frameMat,wb+ww,sill+wh/2,-.012,false));
    const glass = meshBox(Math.max(.01,ww-fw*2),Math.max(.01,wh-fw*2),.008,mats.windowGlass,wb+ww/2,sill+wh/2,-.005,false);
    frame.add(glass);
    fixedRoot.add(frame);
  }

  function buildFloor(s) {
    const W=mm(s.room.width),D=mm(s.room.depth);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(W,D), mats.floor);
    floor.rotation.x = -Math.PI/2;
    floor.position.set(W/2,0,D/2);
    floor.receiveShadow = true;
    root.add(floor);

    // Fine tile/grid lines, deliberately subtle.
    const lineMat = new THREE.LineBasicMaterial({color:0xcac4b8,transparent:true,opacity:.26});
    const pts=[];
    for(let x=0;x<=W+.001;x+=.25){pts.push(new THREE.Vector3(x,.002,0),new THREE.Vector3(x,.002,D))}
    for(let z=0;z<=D+.001;z+=.25){pts.push(new THREE.Vector3(0,.002,z),new THREE.Vector3(W,.002,z))}
    const geo=new THREE.BufferGeometry().setFromPoints(pts);
    root.add(new THREE.LineSegments(geo,lineMat));
  }


  function tileById(s,id) {
    return (s.tileProducts || []).find(t => t.id === id);
  }

  function cloneTexture(src) {
    if (!src) return null;
    if (!textureCache.has(src)) {
      const base = textureLoader.load(src, () => { try { renderer.render(scene, camera); } catch(_) {} }, undefined, () => {});
      base.wrapS = base.wrapT = THREE.RepeatWrapping;
      base.colorSpace = THREE.SRGBColorSpace;
      textureCache.set(src, base);
    }
    const t = textureCache.get(src).clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  }

  function tileFallbackColor(tile) {
    const txt = ((tile?.finish || "") + " " + (tile?.name || "")).toLowerCase();
    if (txt.includes("pink")) return 0xe6b7c2;
    if (txt.includes("marble") || txt.includes("white")) return 0xf2efe8;
    return 0xe5dfd4;
  }

  function zoneMat(tile, zone, repeatX, repeatY) {
    const src = (zone.pattern === "herringbone" && tile?.patternImage) ? tile.patternImage : (tile?.image || "");
    const tex = cloneTexture(src);
    if (tex) {
      tex.repeat.set(Math.max(.25, repeatX), Math.max(.25, repeatY));
      if (zone.pattern === "brick") tex.offset.x = .5;
    }
    const gloss = ((tile?.finish || "").toLowerCase().includes("gloss"));
    return new THREE.MeshStandardMaterial({
      map: tex || null,
      color: tex ? 0xffffff : tileFallbackColor(tile),
      roughness: gloss ? .24 : .62,
      metalness: 0,
      side: THREE.DoubleSide
    });
  }

  function addSurfaceMesh(side, mesh) {
    surfaceRoot.add(mesh);
    surfaceSets[side].push(mesh);
  }

  function rectSubtract(rect, hole) {
    const x1=Math.max(rect.x1,hole.x1), x2=Math.min(rect.x2,hole.x2);
    const y1=Math.max(rect.y1,hole.y1), y2=Math.min(rect.y2,hole.y2);
    if(x2<=x1 || y2<=y1) return [rect];
    const out=[];
    if(rect.y1<y1) out.push({x1:rect.x1,x2:rect.x2,y1:rect.y1,y2:y1});
    if(y2<rect.y2) out.push({x1:rect.x1,x2:rect.x2,y1:y2,y2:rect.y2});
    if(rect.x1<x1) out.push({x1:rect.x1,x2:x1,y1:y1,y2:y2});
    if(x2<rect.x2) out.push({x1:x2,x2:rect.x2,y1:y1,y2:y2});
    return out.filter(r=>r.x2-r.x1>.003 && r.y2-r.y1>.003);
  }

  function repeatForZone(tile, zone, along, tall) {
    const tw=Math.max(1,Number(tile?.width||300));
    const th=Math.max(1,Number(tile?.height||300));

    if(zone.pattern==="herringbone"){
      // Square repeat cell sized from the long edge of the real tile.
      // This avoids the old 70 x 280 bitmap squeeze that created horizontal pink stripes.
      const cell=Math.max(tw,th)*2.15;
      return {
        x:Math.max(.2,(along*1000)/cell),
        y:Math.max(.2,(tall*1000)/cell)
      };
    }

    const landscape=(zone.orientation||"landscape")==="landscape";
    const physX=landscape?Math.max(tw,th):Math.min(tw,th);
    const physY=landscape?Math.min(tw,th):Math.max(tw,th);
    return {
      x:Math.max(.25,(along*1000)/physX),
      y:Math.max(.25,(tall*1000)/physY)
    };
  }

  function buildSurfaceZones(s) {
    surfaceSets = { floor: [], window: [], opposite: [], left: [], right: [] };
    const W = mm(s.room.width), D = mm(s.room.depth), H=mm(s.room.ceiling);
    const zones = (s.surfaceZones || []).filter(z => z.enabled !== false)
      .slice().sort((a,b)=> (a.full === b.full ? 0 : (a.full ? -1 : 1)));

    let lift=.0035;

    zones.forEach(z=>{
      const tile=tileById(s,z.tileId);

      if(z.surface==="floor"){
        const x1=mm(z.full?0:Number(z.x1||0));
        const x2=mm(z.full?s.room.width:Number(z.x2||0));
        const y1=mm(z.full?0:Number(z.y1||0));
        const y2=mm(z.full?s.room.depth:Number(z.y2||0));
        const w=Math.max(.01,x2-x1), d=Math.max(.01,y2-y1);
        const rep=repeatForZone(tile,z,w,d);
        const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),zoneMat(tile,z,rep.x,rep.y));
        mesh.rotation.x=-Math.PI/2;
        mesh.position.set(x1+w/2,lift,y1+d/2);
        mesh.receiveShadow=true;
        addSurfaceMesh("floor",mesh);
        lift+=.0008;
        return;
      }

      const span=(z.surface==="window"||z.surface==="opposite")?s.room.width:s.room.depth;
      const startM=mm(z.full?0:Number(z.start||0));
      const endM=mm(z.full?span:Number(z.end||0));
      const bottomM=mm(z.full?0:Number(z.bottom||0));
      const topM=mm(z.full?s.room.ceiling:Number(z.top||0));

      let rects=[{x1:startM,x2:endM,y1:bottomM,y2:topM}];

      // Clip tile finish around actual openings instead of wallpapering over them.
      if(z.surface==="window"){
        const wb=mm(s.room.window.before), ww=mm(s.room.window.width);
        const sill=mm(s.room.window.sill), wh=mm(s.room.window.height);
        const hole={x1:wb,x2:wb+ww,y1:sill,y2:sill+wh};
        rects=rects.flatMap(r=>rectSubtract(r,hole));
      }
      if(z.surface==="right"){
        const db=mm(s.room.door.before), dw=mm(s.room.door.width), dh=mm(s.room.door.height);
        const hole={x1:db,x2:db+dw,y1:0,y2:dh};
        rects=rects.flatMap(r=>rectSubtract(r,hole));
      }

      rects.forEach(r=>{
        const along=Math.max(.01,r.x2-r.x1), tall=Math.max(.01,r.y2-r.y1);
        const rep=repeatForZone(tile,z,along,tall);
        const mesh=new THREE.Mesh(new THREE.PlaneGeometry(along,tall),zoneMat(tile,z,rep.x,rep.y));
        mesh.receiveShadow=true;

        if(z.surface==="window"){
          mesh.position.set(r.x1+along/2,r.y1+tall/2,.004+lift);
        }else if(z.surface==="opposite"){
          mesh.rotation.y=Math.PI;
          mesh.position.set(r.x1+along/2,r.y1+tall/2,D-.004-lift);
        }else if(z.surface==="left"){
          mesh.rotation.y=Math.PI/2;
          mesh.position.set(.004+lift,r.y1+tall/2,r.x1+along/2);
        }else if(z.surface==="right"){
          mesh.rotation.y=-Math.PI/2;
          mesh.position.set(W-.004-lift,r.y1+tall/2,r.x1+along/2);
        }
        addSurfaceMesh(z.surface,mesh);
        lift+=.0005;
      });
    });
  }
  function buildBath(i,s) {
    const g=groupForItem(i), w=mm(i.w), d=mm(i.h), h=mm(i.height || 550), z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const style=prod?.style || "box";

    // Slightly warmer white acrylic than the ceramic WC/vanity basin.
    const acrylic=new THREE.MeshStandardMaterial({color:0xf8f7f3,roughness:.34});
    const panel=new THREE.MeshStandardMaterial({color:0xf1f0ec,roughness:.52});
    const inner=new THREE.MeshStandardMaterial({color:0xe8e8e4,roughness:.42});

    // Outer panels / bath body.
    const panelT=.035;
    g.add(meshBox(w,h*.78,panelT,panel,0,z+h*.39,d/2-panelT/2));
    g.add(meshBox(w,h*.78,panelT,panel,0,z+h*.39,-d/2+panelT/2));
    g.add(meshBox(panelT,h*.78,d,panel,-w/2+panelT/2,z+h*.39,0));
    g.add(meshBox(panelT,h*.78,d,panel,w/2-panelT/2,z+h*.39,0));

    // Top rim.
    const rimH=.045, rimT=Math.min(.065,Math.min(w,d)*.09);
    g.add(meshBox(w,rimH,rimT,acrylic,0,z+h-rimH/2,-d/2+rimT/2));
    g.add(meshBox(w,rimH,rimT,acrylic,0,z+h-rimH/2,d/2-rimT/2));
    g.add(meshBox(rimT,rimH,Math.max(.04,d-rimT*2),acrylic,-w/2+rimT/2,z+h-rimH/2,0));
    g.add(meshBox(rimT,rimH,Math.max(.04,d-rimT*2),acrylic,w/2-rimT/2,z+h-rimH/2,0));

    // Inner floor.
    const innerW=Math.max(.25,w-rimT*2.6), innerD=Math.max(.18,d-rimT*2.6);
    g.add(meshBox(innerW,.025,innerD,inner,0,z+h*.27,0,false));

    // Inner long side slopes.
    const longSideH=h*.50;
    const ls1=meshBox(innerW,longSideH,.025,inner,0,z+h*.54,-innerD/2,false);
    ls1.rotation.x=-0.16; g.add(ls1);
    const ls2=meshBox(innerW,longSideH,.025,inner,0,z+h*.54,innerD/2,false);
    ls2.rotation.x=0.16; g.add(ls2);

    // End profiles. Single-ended baths get one stronger backrest.
    const singleRight=style==="straightSingleEndedRight";
    const singleLeft=style==="straightSingleEndedLeft";
    const doubleEnded=style==="doubleEndedBath";
    const backH=h*.58;

    const leftEnd=meshBox(.03,backH,innerD,inner,-innerW/2,z+h*.58,0,false);
    const rightEnd=meshBox(.03,backH,innerD,inner,innerW/2,z+h*.58,0,false);

    if(singleRight){
      leftEnd.rotation.z=-0.23;
      rightEnd.rotation.z=0.04;
    }else if(singleLeft){
      leftEnd.rotation.z=-0.04;
      rightEnd.rotation.z=0.23;
    }else if(doubleEnded){
      leftEnd.rotation.z=-0.20;
      rightEnd.rotation.z=0.20;
    }else{
      leftEnd.rotation.z=-0.14;
      rightEnd.rotation.z=0.14;
    }
    g.add(leftEnd,rightEnd);

    // Waste and overflow.
    let drainX=0;
    if(singleRight) drainX=w*.23;
    if(singleLeft) drainX=-w*.23;
    const drain=cylinder(.018,.007,mats.metal,"y",26);
    drain.position.set(drainX,z+h*.295,0); g.add(drain);

    const overflow=cylinder(.012,.007,mats.metal,"x",22);
    overflow.position.set(singleRight?w*.41:singleLeft?-w*.41:0,z+h*.66,0);
    overflow.rotation.z=Math.PI/2;
    g.add(overflow);

    // Centre-deck tap holes / minimal tap placeholder when product data says centre.
    const tapLoc=(prod?.tapLocation||"").toLowerCase();
    if(tapLoc.includes("centre")){
      const tapBase=cylinder(.012,.025,mats.metal,"y",20);
      tapBase.position.set(0,z+h+.015,-d/2+rimT*.65);
      g.add(tapBase);
    }

    // A subtle bath-end marker on the "handed" end so left/right styles are visually distinct.
    if(singleRight || singleLeft){
      const marker=meshBox(.09,.012,.018,mats.brass,singleRight?w*.39:-w*.39,z+h+.012,-d/2+rimT*.62,false);
      g.add(marker);
    }

    return setItemId(g,i.id);
  }
  function buildWC(i,s) {
    const g=groupForItem(i), w=mm(i.w), d=mm(i.h), h=mm(i.height||800), z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const style=prod?.style || "wcCloseCoupledRound";

    const isBack=style==="wcBackToWallRound";
    const isHung=style==="wcWallHungRound";
    const isSquare=style==="wcCompactSquare";

    // Cistern / back body.
    if(!isHung){
      const cisH=isBack?h*.50:h*.44;
      const cisD=isBack?d*.20:d*.27;
      const cisY=isBack?-d*.38:-d*.34;
      const cis=meshBox(w*(isSquare?.88:.82),cisH,cisD,mats.ceramic,0,z+h*.72,cisY);
      g.add(cis);
      const lid=meshBox(w*.84,.025,cisD*1.04,mats.ceramic,0,z+h*.96,cisY);
      g.add(lid);
    }

    // Bowl: rounded or more squared compact form.
    if(isSquare){
      const bowl=meshBox(w*.78,h*.30,d*.54,mats.ceramic,0,z+(isHung?h*.38:h*.28),d*.10);
      bowl.scale.set(1,1,1);
      g.add(bowl);
      const seat=meshBox(w*.66,.035,d*.43,mats.ceramicInner,0,z+(isHung?h*.57:h*.50),d*.12);
      g.add(seat);
    }else{
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.5,32,20),mats.ceramic);
      bowl.scale.set(w*.78,h*.34,d*.72);
      bowl.position.set(0,z+(isHung?h*.38:h*.30),d*.08);
      bowl.castShadow=true;g.add(bowl);

      const seat=new THREE.Mesh(new THREE.TorusGeometry(Math.min(w,d)*.24,.025,12,40),mats.ceramicInner);
      seat.rotation.x=Math.PI/2;seat.scale.z=1.25;
      seat.position.set(0,z+(isHung?h*.57:h*.52),d*.10);g.add(seat);
    }

    // Wall-hung pedestal gap.
    if(isHung){
      const shadow=meshBox(w*.62,.028,d*.38,new THREE.MeshStandardMaterial({color:0xbdbbb5,transparent:true,opacity:.20}),0,z+.025,d*.08,false);
      g.add(shadow);
    }else{
      const foot=meshBox(w*.42,h*.28,d*.34,mats.ceramic,0,z+h*.14,-d*.02);
      g.add(foot);
    }

    // Flush button.
    if(!isHung){
      const flush=cylinder(.015,.006,mats.metal,"y",24);
      flush.position.set(0,z+h*.985,-d*.34);g.add(flush);
    }

    return setItemId(g,i.id);
  }
  function buildVanity(i,s) {
    const g=groupForItem(i), w=mm(i.w), d=mm(i.h), h=mm(i.height||850), z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const oak=prod?.finish?.toLowerCase().includes("oak")?mats.oak:mats.timber;
    const bodyH=Math.max(.12,h-.055);
    g.add(meshBox(w,bodyH,d,oak,0,z+bodyH/2,0));
    const frontZ=d/2+.011;
    const panelH=bodyH*.46;
    [-.25,.25].forEach((q,idx)=>{
      const panel=meshBox(w*.94,panelH,.018,idx?mats.oakDark:oak,0,z+bodyH*(idx? .25:.74),frontZ);
      g.add(panel);
      const handle=cylinder(.007,w*.28,mats.brass,"x",18);
      handle.position.set(0,z+bodyH*(idx? .30:.79),frontZ+.018);g.add(handle);
    });
    const top=meshBox(w,.05,d+.012,mats.ceramic,0,z+h-.025,.003);g.add(top);
    const bowl=new THREE.Mesh(new THREE.TorusGeometry(Math.min(w,d)*.18,.018,14,48),mats.ceramicInner);
    bowl.rotation.x=Math.PI/2;bowl.scale.z=.68;bowl.position.set(0,z+h+.006,.035);g.add(bowl);
    const drain=cylinder(.015,.006,mats.metal,"y",20);drain.position.set(0,z+h+.012,.035);g.add(drain);
    const stem=cylinder(.011,.16,mats.brass,"y",16);stem.position.set(0,z+h+.08,-d*.26);g.add(stem);
    const spout=meshBox(.025,.025,.13,mats.brass,0,z+h+.14,-d*.20);g.add(spout);
    return setItemId(g,i.id);
  }

  function buildShower(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=Math.max(.025,mm(i.height||40)),z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const style=prod?.style || "showerWalkInRain";

    // Low tray / shower floor.
    g.add(meshBox(w,h,d,mats.ceramic,0,z+h/2,0));
    const inset=meshBox(Math.max(.10,w-.07),.008,Math.max(.10,d-.07),mats.ceramicInner,0,z+h+.004,0,false);
    g.add(inset);

    // Waste positioned towards the back/outer corner, clear of the entry.
    const drain=cylinder(.032,.008,mats.metal,"y",28);
    drain.position.set(-w*.28,z+h+.012,d*.27);
    g.add(drain);

    // Check whether a separate half-height stud wall already borders the shower.
    // If it does, buildStud() supplies the glass above it, so do NOT add another
    // freestanding glass panel here.
    const showerBox={
      x1:i.x, x2:i.x+itemDims(i).w,
      y1:i.y, y2:i.y+itemDims(i).d
    };
    const nearbyStud=(s.items||[]).find(o=>{
      if(o.type!=="stud") return false;
      const od=itemDims(o), b={x1:o.x,x2:o.x+od.w,y1:o.y,y2:o.y+od.d};
      const xOverlap=Math.min(showerBox.x2,b.x2)-Math.max(showerBox.x1,b.x1);
      const yOverlap=Math.min(showerBox.y2,b.y2)-Math.max(showerBox.y1,b.y1);
      const nearFront=Math.abs(b.y2-showerBox.y1)<=.12*1000 || Math.abs(b.y1-showerBox.y1)<=.12*1000;
      return xOverlap>80 && (yOverlap>0 || nearFront);
    });

    if(!nearbyStud){
      // Generic walk-in fallback: a front-edge glass screen rather than a side
      // panel, leaving an open entry gap.
      const glassH=Math.min(2.05,Math.max(1.75,mm(s.room.ceiling)-.35));
      const panelW=Math.min(w*.66,1.00);
      const glass=meshBox(panelW,glassH,.012,mats.glass,-w/2+panelW/2,z+h+glassH/2,-d/2+.012,false);
      g.add(glass);
      const cap=meshBox(panelW,.018,.025,mats.brass,-w/2+panelW/2,z+h+glassH+.009,-d/2+.012,false);
      g.add(cap);
    }

    if(style==="showerWalkInRain"){
      // IMPORTANT: local +Z is the rear of the shower. In the current plan that
      // is the physical back wall of the room. Hardware is therefore mounted
      // against +d/2, not on the glass/stud at the entry.
      const backZ=d/2-.025;
      const headX=w*.23;
      const headY=Math.min(mm(s.room.ceiling)-.22,2.08);

      // Vertical supply/riser visibly touching the back wall.
      const riser=cylinder(.010,.72,mats.brass,"y",18);
      riser.position.set(headX,headY-.42,backZ);
      g.add(riser);

      // Wall arm comes OUT from the back wall towards the shower centre.
      const armLen=.30;
      const arm=meshBox(.018,.018,armLen,mats.brass,headX,headY,backZ-armLen/2,false);
      g.add(arm);

      // Short drop and overhead rain head.
      const drop=cylinder(.010,.07,mats.brass,"y",18);
      drop.position.set(headX,headY-.035,backZ-armLen+.015);
      g.add(drop);

      const head=new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.018,42),mats.brass);
      head.position.set(headX,headY-.075,backZ-armLen+.015);
      head.castShadow=true;
      g.add(head);

      // Handset and slide rail: also mounted on the back wall.
      const railX=-w*.22;
      const rail=cylinder(.008,.62,mats.brass,"y",16);
      rail.position.set(railX,z+h+1.27,backZ-.005);
      g.add(rail);

      const handset=cylinder(.018,.17,mats.brass,"y",18);
      handset.position.set(railX+.035,z+h+1.43,backZ-.07);
      handset.rotation.z=.25;
      g.add(handset);

      // Controls belong on the half-height stud / entry wall, facing into shower.
      // local -Z is the entry edge where the current stud wall sits.
      const frontZ=-d/2+.022;
      const controlsX=-w*.13;
      const plate=meshBox(.15,.20,.018,mats.brass,controlsX,z+h+1.03,frontZ,false);
      g.add(plate);

      const knob1=cylinder(.021,.028,mats.brass,"z",20);
      knob1.position.set(controlsX,z+h+1.09,frontZ+.022);
      g.add(knob1);

      const knob2=cylinder(.021,.028,mats.brass,"z",20);
      knob2.position.set(controlsX,z+h+.98,frontZ+.022);
      g.add(knob2);
    }

    return setItemId(g,i.id);
  }
  function buildStud(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1100),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.wallSide,0,z+h/2,0));
    const top=Math.min(mm(s.room.ceiling)-.18,2.10), glassH=Math.max(0,top-(z+h));
    if(glassH>.1){
      const glass=meshBox(w,glassH,.012,mats.glass,0,z+h+glassH/2,0,false);g.add(glass);
      const cap=meshBox(w,.018,.025,mats.brass,0,z+h+glassH+.009,0,false);g.add(cap);
    }
    return setItemId(g,i.id);
  }

  function buildStorage(i) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1800),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.timber,0,z+h/2,0));
    const front=meshBox(w*.92,h*.94,.018,mats.oak,0,z+h/2,d/2+.011);g.add(front);
    const seam=meshBox(w*.88,.012,.022,mats.oakDark,0,z+h*.52,d/2+.024);g.add(seam);
    return setItemId(g,i.id);
  }

  function buildRadiator(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1200),z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const style=prod?.style || "radiatorLadder";
    const wallLength=Math.max(w,d), alongZ=d>=w;
    const railR=.012;

    if(style==="radiatorVerticalBars"){
      const count=Math.max(4,Math.round(wallLength/.055));
      for(let n=0;n<count;n++){
        const pos=-wallLength*.42 + n*(wallLength*.84/Math.max(1,count-1));
        const bar=cylinder(.016,h,mats.metal,"y",18);
        bar.position.set(alongZ?0:pos,z+h/2,alongZ?pos:0);g.add(bar);
      }
    }else{
      const edge=wallLength*.39;
      const collector1=cylinder(railR,h,mats.metal,"y",18);
      collector1.position.set(alongZ?0:-edge,z+h/2,alongZ?-edge:0);g.add(collector1);
      const collector2=cylinder(railR,h,mats.metal,"y",18);
      collector2.position.set(alongZ?0:edge,z+h/2,alongZ?edge:0);g.add(collector2);
      for(let yy=z+.08;yy<z+h-.05;yy+=.105){
        const rail=cylinder(railR,wallLength*.78,mats.metal,alongZ?"z":"x",18);
        rail.position.set(0,yy,0);g.add(rail);
      }
    }

    // Wall stand-offs and valves.
    const standoff=meshBox(.025,.025,.055,mats.metal,0,z+h*.2,alongZ?-.04:0,false);
    g.add(standoff);
    const valve1=cylinder(.018,.055,mats.metal,alongZ?"z":"x",18);
    valve1.position.set(alongZ?0:-wallLength*.34,z-.015,alongZ?-wallLength*.34:0);g.add(valve1);
    const valve2=cylinder(.018,.055,mats.metal,alongZ?"z":"x",18);
    valve2.position.set(alongZ?0:wallLength*.34,z-.015,alongZ?wallLength*.34:0);g.add(valve2);

    return setItemId(g,i.id);
  }
  function intersects2D(a,b) {
    const A=itemDims(a),B=itemDims(b);
    return a.x < b.x+B.w && a.x+A.w > b.x && a.y < b.y+B.d && a.y+A.d > b.y;
  }

  function buildNiche(i,s) {
    const g=new THREE.Group();g.userData.itemId=i.id;
    const z0=mm(i.z||1000),hh=mm(i.height||350);
    const d=itemDims(i);
    const stud=(s.items||[]).find(o=>o.type==="stud"&&intersects2D(i,o));
    if(stud){
      const sb=itemDims(stud), horizontal=sb.w>=sb.d;
      if(horizontal){
        const width=mm(i.w), cx=mm(i.x+i.w/2), cz=mm(stud.y+sb.d/2);
        const back=meshBox(width,hh,.012,mats.niche,cx,z0+hh/2,cz,false);g.add(back);
        const frame=.025;
        g.add(meshBox(width+frame*2,frame,.025,mats.brass,cx,z0,cz+.012,false));
        g.add(meshBox(width+frame*2,frame,.025,mats.brass,cx,z0+hh,cz+.012,false));
      }
    }else{
      const R=s.room, nearLeft=i.x<120, nearRight=(i.x+d.w)>R.width-120, nearTop=i.y<120, nearBottom=(i.y+d.d)>R.depth-120;
      if(nearLeft||nearRight){
        const width=mm(d.d), cz=mm(i.y+d.d/2), x=nearLeft?.012:mm(R.width)-.012;
        const back=meshBox(.012,hh,width,mats.niche,x,z0+hh/2,cz,false);g.add(back);
      }else if(nearTop||nearBottom){
        const width=mm(d.w), cx=mm(i.x+d.w/2), z=nearTop?.012:mm(R.depth)-.012;
        const back=meshBox(width,hh,.012,mats.niche,cx,z0+hh/2,z,false);g.add(back);
      }
    }
    return setItemId(g,i.id);
  }

  function buildMirror(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=Math.max(.025,mm(i.h)),h=mm(i.height||800),z=mm(i.z||1150);
    const prod=(s.products||[]).find(p=>p.id===i.productId);
    const style=prod?.style || "mirrorRectangle";
    const brassFrame=new THREE.MeshStandardMaterial({color:0xb88943,roughness:.28,metalness:.70});

    if(style==="mirrorRound"){
      const r=Math.min(w,h)/2;
      const frame=new THREE.Mesh(new THREE.TorusGeometry(r,.015,14,64),brassFrame);
      frame.rotation.x=Math.PI/2;
      frame.position.set(0,z+h/2,0);g.add(frame);

      const face=new THREE.Mesh(new THREE.CircleGeometry(Math.max(.04,r-.022),64),mats.mirror);
      face.rotation.x=Math.PI/2;
      face.position.set(0,z+h/2,.004);g.add(face);
    }else{
      const frameT=.018;
      const top=meshBox(w,frameT,d,brassFrame,0,z+h-frameT/2,0,false);g.add(top);
      const bot=meshBox(w,frameT,d,brassFrame,0,z+frameT/2,0,false);g.add(bot);
      const l=meshBox(frameT,h,d,brassFrame,-w/2+frameT/2,z+h/2,0,false);g.add(l);
      const rgt=meshBox(frameT,h,d,brassFrame,w/2-frameT/2,z+h/2,0,false);g.add(rgt);
      const face=meshBox(Math.max(.04,w-frameT*2),Math.max(.04,h-frameT*2),.008,mats.mirror,0,z+h/2,.008,false);g.add(face);

      if(style==="mirrorArch"){
        const arch=new THREE.Mesh(new THREE.TorusGeometry(w*.36,.014,12,48,Math.PI),brassFrame);
        arch.rotation.x=Math.PI/2;arch.rotation.z=Math.PI;
        arch.position.set(0,z+h-.02,.008);g.add(arch);
      }
    }

    return setItemId(g,i.id);
  }

  function buildGeneric(i) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||900),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.timber,0,z+h/2,0));
    return setItemId(g,i.id);
  }

  function buildItem(i,s) {
    if(i.type==="niche") return buildNiche(i,s);
    if(i.type==="bath") return buildBath(i,s);
    if(i.type==="wc") return buildWC(i,s);
    if(i.type==="vanity") return buildVanity(i,s);
    if(i.type==="shower") return buildShower(i,s);
    if(i.type==="stud") return buildStud(i,s);
    if(i.type==="storage") return buildStorage(i);
    if(i.type==="radiator") return buildRadiator(i,s);
    if(i.type==="mirror") return buildMirror(i,s);
    return buildGeneric(i);
  }


  function clearGroup(g) {
    while(g.children.length){
      const o=g.children.pop();
      o.traverse?.(n=>{
        if(n.geometry) n.geometry.dispose?.();
        // Shared materials intentionally remain alive.
      });
    }
  }

  function rebuildScene(force=false) {
    const s=api.getState();
    if(!s) return;
    const sig=JSON.stringify({
      room:s.room,
      items:s.items,
      products:(s.products||[]).map(p=>({id:p.id,finish:p.finish,style:p.style,width:p.width,depth:p.depth,height:p.height})),
      tileProducts:(s.tileProducts||[]).map(t=>({id:t.id,w:t.width,h:t.height,finish:t.finish,dp:t.defaultPattern,imgKey:(t.image||"").length+":"+(t.image||"").slice(0,64),pKey:(t.patternImage||"").length+":"+(t.patternImage||"").slice(0,64)})),
      surfaceZones:(s.surfaceZones||[]).map(z=>({id:z.id,name:z.name,surface:z.surface,full:z.full,x1:z.x1,x2:z.x2,y1:z.y1,y2:z.y2,start:z.start,end:z.end,bottom:z.bottom,top:z.top,tileId:z.tileId,pattern:z.pattern,orientation:z.orientation,enabled:z.enabled,grout:z.grout,groutColor:z.groutColor,waste:z.waste}))
    });
    if(!force && sig===signature) return;
    signature=sig; room=s.room;
    clearGroup(root);clearGroup(wallRoot);clearGroup(surfaceRoot);clearGroup(itemRoot);clearGroup(fixedRoot);
    itemMeshes=[];
    buildFloor(s);buildWalls(s);buildSurfaceZones(s);
    (s.items||[]).forEach(i=>{
      const g=buildItem(i,s);
      itemRoot.add(g);
      itemMeshes.push(g);
    });
    target.set(mm(s.room.width)/2,.92,mm(s.room.depth)/2);
    updateCamera();
  }

  function updateCamera() {
    camera.position.set(
      target.x + radius*Math.sin(phi)*Math.cos(theta),
      target.y + radius*Math.cos(phi),
      target.z + radius*Math.sin(phi)*Math.sin(theta)
    );
    camera.lookAt(target);
    updateWallVisibility();
  }

  function updateWallVisibility() {
    if(!room)return;
    const W=mm(room.width),D=mm(room.depth),show=wallsToggle?.checked!==false;
    Object.values(wallSets).flat().forEach(m=>m.visible=show);
    Object.entries(surfaceSets).forEach(([side,list])=>list.forEach(m=>m.visible=(side==="floor")?true:show));
    if(!show)return;
    const margin=.06;
    if(camera.position.x < -margin){ wallSets.left.forEach(m=>m.visible=false); surfaceSets.left.forEach(m=>m.visible=false); }
    if(camera.position.x > W+margin){ wallSets.right.forEach(m=>m.visible=false); surfaceSets.right.forEach(m=>m.visible=false); }
    if(camera.position.z < -margin){ wallSets.window.forEach(m=>m.visible=false); surfaceSets.window.forEach(m=>m.visible=false); }
    if(camera.position.z > D+margin){ wallSets.opposite.forEach(m=>m.visible=false); surfaceSets.opposite.forEach(m=>m.visible=false); }
  }

  function setFromPosition(pos,tgt=null){
    if(tgt)target.copy(tgt);
    const v=pos.clone().sub(target);
    radius=Math.max(.8,v.length());
    phi=Math.acos(THREE.MathUtils.clamp(v.y/radius,-1,1));
    theta=Math.atan2(v.z,v.x);
    updateCamera();
  }

  function preset(name) {
    const s=api.getState(),W=mm(s.room.width),D=mm(s.room.depth),H=mm(s.room.ceiling);
    if(name==="door"){
      const dz=mm(s.room.door.before+s.room.door.width/2);
      setFromPosition(new THREE.Vector3(W+2.0,1.55,dz),new THREE.Vector3(W*.45,.95,D*.50));
    }else if(name==="window"){
      setFromPosition(new THREE.Vector3(W*.50,1.55,-2.05),new THREE.Vector3(W*.50,.95,D*.52));
    }else if(name==="top"){
      setFromPosition(new THREE.Vector3(W*.50,5.3,D*.50+.01),new THREE.Vector3(W*.50,0,D*.50));
    }else{
      setFromPosition(new THREE.Vector3(W+1.75,3.05,D+1.85),new THREE.Vector3(W*.48,.90,D*.50));
    }
  }

  function resize() {
    if(canvas.style.display==="none")return;
    const r=canvas.getBoundingClientRect();
    if(!r.width||!r.height)return;
    renderer.setSize(r.width,r.height,false);
    camera.aspect=r.width/r.height;
    camera.updateProjectionMatrix();
  }

  function selectAt(clientX,clientY) {
    const r=canvas.getBoundingClientRect();
    mouse.x=((clientX-r.left)/r.width)*2-1;
    mouse.y=-((clientY-r.top)/r.height)*2+1;
    raycaster.setFromCamera(mouse,camera);
    const hits=raycaster.intersectObjects(itemRoot.children,true);
    const hit=hits.find(h=>h.object.userData.itemId);
    if(hit){
      api.selectItem(hit.object.userData.itemId);
      status.textContent="Selected · edit in the panel below";
      setTimeout(()=>status.textContent="Visual 3D · tap a fixture to edit",1800);
    }
  }

  canvas.addEventListener("pointerdown",e=>{
    e.preventDefault();
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===1){
      drag={id:e.pointerId,x:e.clientX,y:e.clientY,theta,phi,moved:false};
      try{canvas.setPointerCapture(e.pointerId)}catch(_){}
    }else if(pointers.size===2){
      const p=[...pointers.values()];
      pinch={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),radius};
      drag=null;
    }
  },{passive:false});

  canvas.addEventListener("pointermove",e=>{
    if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2&&pinch){
      e.preventDefault();
      const p=[...pointers.values()],d=Math.max(20,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y));
      radius=THREE.MathUtils.clamp(pinch.radius*pinch.d/d,1.0,8.0);
      updateCamera();return;
    }
    if(drag&&drag.id===e.pointerId){
      e.preventDefault();
      const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;
      theta=drag.theta-dx*.008;
      phi=THREE.MathUtils.clamp(drag.phi-dy*.006,.12,1.52);
      updateCamera();
    }
  },{passive:false});

  function endPointer(e){
    const was=drag&&drag.id===e.pointerId?drag:null;
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinch=null;
    if(was&&!was.moved)selectAt(e.clientX,e.clientY);
    if(was)drag=null;
  }
  canvas.addEventListener("pointerup",endPointer);
  canvas.addEventListener("pointercancel",endPointer);
  canvas.addEventListener("wheel",e=>{
    e.preventDefault();
    radius=THREE.MathUtils.clamp(radius*(e.deltaY>0?1.09:.92),1.0,8.0);
    updateCamera();
  },{passive:false});

  function syncViewMode() {
    const is3d=viewMode?.value==="3d";
    canvas.style.display=is3d?"block":"none";
    status.style.display=is3d?"block":"none";
    if(is3d){
      legacy.classList.add("legacy3d-hidden");
      elevationWrap?.classList.remove("show");
      setTimeout(()=>{resize();rebuildScene(true);},30);
    }
  }

  viewMode?.addEventListener("change",()=>setTimeout(syncViewMode,0));
  document.querySelector('.tab[data-tab="threeD"]')?.addEventListener("click",()=>setTimeout(()=>{syncViewMode();resize();rebuildScene(true)},40));
  wallsToggle?.addEventListener("change",updateWallVisibility);

  document.getElementById("viewDoor")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d")preset("door")},0));
  document.getElementById("viewWindow")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d")preset("window")},0));
  document.getElementById("viewTop")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d")preset("top")},0));
  document.getElementById("viewReset")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d")preset("reset")},0));

  window.addEventListener("resize",resize);

  // Keep the renderer in sync with edits made in Plan/Product/Project.
  setInterval(()=>{
    if(viewMode?.value==="3d"){
      rebuildScene(false);
      resize();
    }
  },700);

  function animate(){
    requestAnimationFrame(animate);
    if(viewMode?.value==="3d"){
      updateWallVisibility();
      renderer.render(scene,camera);
    }
  }

  rebuildScene(true);
  preset("reset");
  syncViewMode();
  animate();
}
