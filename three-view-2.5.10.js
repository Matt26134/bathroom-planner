import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js";

const api = window.BP3D;
const legacy = document.getElementById("threeDCanvas");
const viewMode = document.getElementById("viewMode");
const wallsToggle = document.getElementById("wallsToggle");
const floorXrayToggle = document.getElementById("floorXrayToggle");
const floorXrayBtn = document.getElementById("floorXrayBtn");
const done3DMoveBtn = document.getElementById("done3DMoveBtn");
const walkthroughBtn = document.getElementById("walkthroughBtn");
const walkControls = document.getElementById("walkControls");
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
  status.textContent = "Visual 3D · renderer V2.5.10 · tap a fixture to edit";
  window.BP3D_RENDERER_VERSION = "2.5.10";
  legacy.parentNode.appendChild(status);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(1.55, window.devicePixelRatio || 1));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf2eee6);

  const camera = new THREE.PerspectiveCamera(48, 1, 0.02, 30);
  const root = new THREE.Group();
  const wallRoot = new THREE.Group();
  const surfaceRoot = new THREE.Group();
  const structureRoot = new THREE.Group();
  const itemRoot = new THREE.Group();
  const fixedRoot = new THREE.Group();
  scene.add(root, wallRoot, surfaceRoot, structureRoot, itemRoot, fixedRoot);

  const hemi = new THREE.HemisphereLight(0xfffbf4, 0x9d9b94, 1.28);scene.add(hemi);
  const key = new THREE.DirectionalLight(0xfff5df, 2.7);key.position.set(3.8,5.6,2.0);key.castShadow=true;key.shadow.mapSize.set(1536,1536);key.shadow.camera.near=.1;key.shadow.camera.far=14;key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;scene.add(key);
  const fill = new THREE.DirectionalLight(0xdce8ef,.55);fill.position.set(-2.8,3.2,-3.4);scene.add(fill);
  const ceilingGlow = new THREE.PointLight(0xffefd8,6.0,5.4,1.8);ceilingGlow.position.set(1.15,2.33,1.25);scene.add(ceilingGlow);

  const textureLoader = new THREE.TextureLoader();
  const textureCache = new Map();

  function canvasTexture(kind){
    const c=document.createElement("canvas");c.width=c.height=256;const x=c.getContext("2d");
    if(kind==="slate"){x.fillStyle="#3a3b39";x.fillRect(0,0,256,256);let seed=1337;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let n=0;n<1500;n++){const v=48+Math.floor(rnd()*25);x.fillStyle=`rgba(${v},${v},${v},${.035+rnd()*.055})`;x.fillRect(rnd()*256,rnd()*256,.6+rnd()*2,.4+rnd()*1.3)}for(let n=0;n<22;n++){x.strokeStyle=`rgba(205,205,198,${.018+rnd()*.025})`;x.lineWidth=.5+rnd();x.beginPath();let py=rnd()*256;x.moveTo(0,py);for(let q=0;q<5;q++){py+=(rnd()-.5)*12;x.lineTo((q+1)*52,py)}x.stroke()}}
    else if(kind==="california-walnut"){x.fillStyle="#c49a68";x.fillRect(0,0,256,256);let seed=9876;const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);for(let n=0;n<95;n++){const px=rnd()*256;x.strokeStyle=`rgba(104,69,38,${.045+rnd()*.105})`;x.lineWidth=.35+rnd()*1.55;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+(rnd()-.5)*7,80,px+(rnd()-.5)*9,170,px+(rnd()-.5)*6,256);x.stroke()}for(let n=0;n<34;n++){x.strokeStyle=`rgba(246,221,181,${.045+rnd()*.10})`;x.lineWidth=.45+rnd()*1.0;const px=rnd()*256;x.beginPath();x.moveTo(px,0);x.lineTo(px+(rnd()-.5)*6,256);x.stroke()}}
    else{x.fillStyle="#a77d51";x.fillRect(0,0,256,256);let seed=4242;const rnd=()=>((seed=(seed*1103515245+12345)>>>0)/4294967296);for(let n=0;n<110;n++){const px=rnd()*256;x.strokeStyle=`rgba(83,52,29,${.05+rnd()*.13})`;x.lineWidth=.4+rnd()*2.2;x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px+(rnd()-.5)*10,80,px+(rnd()-.5)*12,170,px+(rnd()-.5)*8,256);x.stroke()}for(let n=0;n<28;n++){x.strokeStyle=`rgba(230,199,154,${.035+rnd()*.08})`;x.lineWidth=.5+rnd();const px=rnd()*256;x.beginPath();x.moveTo(px,0);x.lineTo(px+(rnd()-.5)*8,256);x.stroke()}}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
  }
  const slateTex=canvasTexture("slate"),oakTex=canvasTexture("oak"),californiaWalnutTex=canvasTexture("california-walnut");slateTex.repeat.set(3,2);oakTex.repeat.set(2.5,1);californiaWalnutTex.repeat.set(3.1,1);
  function fluteBumpTexture(){
    const c=document.createElement("canvas");c.width=512;c.height=32;const x=c.getContext("2d"),img=x.createImageData(c.width,c.height);
    for(let px=0;px<c.width;px++){const wave=(Math.sin((px/c.width)*Math.PI*2*32)+1)/2,v=Math.round(65+wave*150);for(let py=0;py<c.height;py++){const k=(py*c.width+px)*4;img.data[k]=img.data[k+1]=img.data[k+2]=v;img.data[k+3]=255}}
    x.putImageData(img,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
  }
  const fluteBumpTex=fluteBumpTexture();
  const mats = {
    floor:new THREE.MeshStandardMaterial({color:0xe9e3d8,roughness:.92}),wall:new THREE.MeshStandardMaterial({color:0xf1eee7,roughness:.92}),wallSide:new THREE.MeshStandardMaterial({color:0xe1ddd3,roughness:.94}),
    ceramic:new THREE.MeshPhysicalMaterial({color:0xf8f8f5,roughness:.18,clearcoat:.28,clearcoatRoughness:.18}),ceramicInner:new THREE.MeshPhysicalMaterial({color:0xe7e8e5,roughness:.34,clearcoat:.12}),acrylic:new THREE.MeshPhysicalMaterial({color:0xfbfaf7,roughness:.22,clearcoat:.34,clearcoatRoughness:.15}),
    oak:new THREE.MeshStandardMaterial({color:0xa7835e,roughness:.72,map:oakTex}),autumnOak:new THREE.MeshStandardMaterial({color:0xa87e52,roughness:.68,map:oakTex}),oakDark:new THREE.MeshStandardMaterial({color:0x80613f,roughness:.78,map:oakTex}),apexOak:new THREE.MeshStandardMaterial({color:0xb39a78,roughness:.74,map:oakTex}),apexOakDark:new THREE.MeshStandardMaterial({color:0x8d7658,roughness:.82,map:oakTex}),californiaWalnut:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.67,map:californiaWalnutTex}),californiaWalnutDark:new THREE.MeshStandardMaterial({color:0x8f6845,roughness:.86}),californiaWalnutGroove:new THREE.MeshStandardMaterial({color:0x9a744f,roughness:.92}),timber:new THREE.MeshStandardMaterial({color:0xb39875,roughness:.8}),joist:new THREE.MeshStandardMaterial({color:0x9b7857,roughness:.9}),
    heating:new THREE.MeshStandardMaterial({color:0xb95037,roughness:.7,transparent:true,opacity:.62,side:THREE.DoubleSide}),brass:new THREE.MeshStandardMaterial({color:0xb88943,roughness:.28,metalness:.7}),brushedBrass:new THREE.MeshStandardMaterial({color:0xc09a59,roughness:.34,metalness:.72}),metal:new THREE.MeshStandardMaterial({color:0xc8c8c3,roughness:.34,metalness:.68}),chrome:new THREE.MeshPhysicalMaterial({color:0xe7e8e7,roughness:.12,metalness:.96,clearcoat:.55}),
    dark:new THREE.MeshStandardMaterial({color:0x080808,roughness:.76,metalness:.12}),mattBlack:new THREE.MeshStandardMaterial({color:0x111211,roughness:.58,metalness:.35}),anthracite:new THREE.MeshStandardMaterial({color:0x34383a,roughness:.62,metalness:.52}),mproSlate:new THREE.MeshStandardMaterial({color:0x4b5051,roughness:.48,metalness:.72}),walnut:new THREE.MeshStandardMaterial({color:0x6f4b2f,roughness:.72,map:oakTex}),leafGreen:new THREE.MeshStandardMaterial({color:0x356a3f,roughness:.78}),leafGreen2:new THREE.MeshStandardMaterial({color:0x5b8a50,roughness:.82}),potBlack:new THREE.MeshStandardMaterial({color:0x171816,roughness:.72}),paperWhite:new THREE.MeshStandardMaterial({color:0xf2f0e9,roughness:.96}),cardboard:new THREE.MeshStandardMaterial({color:0x9f744d,roughness:.9}),graphiteSlate:new THREE.MeshStandardMaterial({color:0x363735,roughness:.84,map:slateTex,bumpMap:slateTex,bumpScale:.007}),niche:new THREE.MeshStandardMaterial({color:0xb8aa96,roughness:.88}),
    glass:new THREE.MeshPhysicalMaterial({color:0xbfdce0,transmission:.74,transparent:true,opacity:.30,roughness:.08,ior:1.46,thickness:.012,side:THREE.DoubleSide,depthWrite:false}),flutedGlass:new THREE.MeshPhysicalMaterial({color:0xc8dde0,transmission:.55,transparent:true,opacity:.36,roughness:.34,ior:1.46,thickness:.014,side:THREE.DoubleSide,depthWrite:false}),mirror:new THREE.MeshPhysicalMaterial({color:0xdce5e7,metalness:.72,roughness:.08,transparent:true,opacity:.94,side:THREE.DoubleSide}),windowGlass:new THREE.MeshPhysicalMaterial({color:0xc7e2e7,transmission:.80,transparent:true,opacity:.21,roughness:.04,thickness:.01,side:THREE.DoubleSide,depthWrite:false})
  };
  const sharedMaterials=new Set(Object.values(mats));


  let room = null;
  let wallSets = { window: [], opposite: [], left: [], right: [] };
  let surfaceSets = { floor: [], window: [], opposite: [], left: [], right: [] };
  let itemMeshes = [];
  let signature = "";
  let target = new THREE.Vector3(1.1, 0.9, 1.25);
  let radius = 4.7, theta = 0.72, phi = 1.00;
  let pointers = new Map(), drag = null, pinch = null;
  let moveMode=null, moveDrag=null;
  let walkMode=false,walkTimer=null;const walk={position:new THREE.Vector3(1.7,1.65,1.25),yaw:Math.PI,pitch:-.05,eye:1.65};
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const mm = v => (Number(v) || 0) / 1000;
  const itemDims = i => {const w=Number(i.w)||0,d=Number(i.h)||0,a=(((Number(i.rotation)||0)%360)+360)%360*Math.PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));return{w:w*c+d*s,d:w*s+d*c};};

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

  function cylinder(radius,length,material,axis="y",segments=24){const m=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,length,segments),material);if(axis==="x")m.rotation.z=Math.PI/2;if(axis==="z")m.rotation.x=Math.PI/2;m.castShadow=true;return m}
  function roundedRectShape(w,h,r){const x=-w/2,y=-h/2,rr=Math.min(Math.abs(r),w/2,h/2),sh=new THREE.Shape();sh.moveTo(x+rr,y);sh.lineTo(x+w-rr,y);sh.quadraticCurveTo(x+w,y,x+w,y+rr);sh.lineTo(x+w,y+h-rr);sh.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);sh.lineTo(x+rr,y+h);sh.quadraticCurveTo(x,y+h,x,y+h-rr);sh.lineTo(x,y+rr);sh.quadraticCurveTo(x,y,x+rr,y);return sh}
  function roundedBox(w,h,d,r,material,x=0,y=0,z=0,cast=true){const shape=roundedRectShape(Math.max(.01,w),Math.max(.01,h),Math.max(.002,r)),bevel=Math.min(.006,Math.max(.001,r*.12),Math.max(.001,d*.18)),geo=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.004,d),bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:bevel,bevelThickness:bevel});geo.translate(0,0,-Math.max(.004,d)/2);const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;return m}
  function roundedFootprintBox(w,h,d,r,material,x=0,y=0,z=0,cast=true){const shape=roundedRectShape(Math.max(.01,w),Math.max(.01,d),Math.max(.002,r)),bevel=Math.min(.005,Math.max(.001,r*.08),Math.max(.001,h*.08)),geo=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.004,h),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel});geo.rotateX(-Math.PI/2);const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;return m}
  function roundedRing(w,d,border,height,material,r=.08){const outer=roundedRectShape(w,d,r),inner=roundedRectShape(Math.max(.03,w-border*2),Math.max(.03,d-border*2),Math.max(.01,r-border*.45));outer.holes.push(inner);const geo=new THREE.ExtrudeGeometry(outer,{depth:height,bevelEnabled:true,bevelSegments:2,bevelSize:Math.min(.004,height*.18),bevelThickness:Math.min(.003,height*.16)});geo.rotateX(-Math.PI/2);geo.translate(0,height/2,0);const m=new THREE.Mesh(geo,material);m.castShadow=true;return m}
  function productProfile(prod){const explicit=(prod?.render3d?.profile||"").toLowerCase(),sku=(prod?.sku||"").trim().toUpperCase(),code=String(prod?.productCode||prod?.gtin||"").trim();if(explicit&&explicit!=="auto"&&explicit!=="generic")return explicit;if(sku==="METCC")return "metro-metcc";if(sku==="GR1208CW"||sku.startsWith("GR1208"))return "imperia-graphite";if(sku==="MILF800WHAOBB")return "milan-fluted-oak";if(sku==="51120")return "merton-curved-left";if(sku==="ARZIM10MB")return "arezzo-black-led";if(sku==="73483")return "jolie-73483";if(sku==="AZSLOTUWH")return "arezzo-tall-azslotuwh";if(sku==="AZ9CRVLOMW")return "arezzo-vanity-az9crvlomw";if(sku==="C82754")return "crete-c82754";if(sku==="72137")return "crete-72137";if(sku==="ODAR2X6FSFLCALWTOP")return "odesa-arc-odar2x6fsflcalwtop";if(sku==="C51092")return "newham-c51092";if(sku==="12004")return "trent-12004";if(sku==="33138")return "madrid-33138";if(sku==="PRO047T")return "crosswater-pro047t";if(sku==="FDY3STRMB")return "foundry-fdy3strmb";if(sku==="5059340670249"||code==="5059340670249")return "goodhome-cusko-5059340670249";if(sku==="6313817070598"||code==="6313817070598")return "fake-hanging-plants-6313817070598";if(sku==="ALOE-BARBADENSIS")return "aloe-vera-barbadensis";if(sku==="1269407")return "architeckt-trh-1269407";if(sku==="GENERIC-TOILET-ROLL")return "generic-toilet-roll";return "generic"}
  function renderFinish(prod){return (prod?.render3d?.finish||"auto").toLowerCase()}
  function finishMaterial(prod,fallback=mats.timber){const override=renderFinish(prod),finish=(prod?.finish||"").toLowerCase();if(override==="graphite-slate"||finish.includes("graphite")||finish.includes("slate"))return mats.graphiteSlate;if(override==="autumn-oak"||finish.includes("autumn oak"))return mats.autumnOak;if(override==="apex-oak"||finish.includes("apex oak"))return mats.apexOak;if(override==="california-walnut"||finish.includes("california walnut"))return mats.californiaWalnut;if(override==="matt-black"||finish.includes("matt black"))return mats.mattBlack;if(override==="brushed-brass"||finish.includes("brushed brass"))return mats.brushedBrass;if(override==="chrome"||override==="silver"||finish.includes("chrome")||finish.includes("silver"))return mats.chrome;if(override==="gloss-white"||finish.includes("gloss white"))return mats.ceramic;return fallback}
  function metalFinishMaterialByName(finish,fallback=mats.mattBlack){finish=String(finish||"").toLowerCase();if(finish==="chrome"||finish==="silver")return mats.chrome;if(finish==="brushed-brass")return mats.brushedBrass;if(finish==="matt-black"||finish==="black")return mats.mattBlack;return fallback}
  function globalFinishName(s){const f=String(s?.project?.globalFixtureFinish||"use-item").toLowerCase();return ["matt-black","chrome","silver","brushed-brass"].includes(f)&&f!=="use-item"?f:""}
  function fixtureFinishMaterial(item,s,fallback="matt-black"){const finish=globalFinishName(s)||(item?.finish||fallback);return metalFinishMaterialByName(finish,mats.mattBlack)}
  function trimFinishMaterial(item,s){const finish=globalFinishName(s)||(item?.glassTrimFinish||item?.finish||"matt-black");return metalFinishMaterialByName(finish,mats.mattBlack)}
  function productMetalFinishMaterial(item,s,prod,fallback="chrome"){const finish=globalFinishName(s)||(item?.finish||renderFinish(prod)||prod?.finish||fallback);return metalFinishMaterialByName(finish, fallback==="chrome"?mats.chrome:mats.mattBlack)}
  function accessoryMaterial(item,s,fallbackMat=mats.metal,prod=null){const override=globalFinishName(s);if(override)return metalFinishMaterialByName(override,fallbackMat);const finish=String(item?.finish||renderFinish(prod)||prod?.finish||"").toLowerCase();if(finish.includes("chrome")||finish.includes("silver"))return mats.chrome;if(finish.includes("brushed brass"))return mats.brushedBrass;if(finish.includes("black"))return mats.mattBlack;if(finish.includes("anthracite"))return mats.anthracite;if(finish.includes("graphite")||finish.includes("slate"))return mats.mproSlate;return fallbackMat}
  function studShowerFaceSign(i,s){
    const d=itemDims(i),cx=i.x+d.w/2,cz=i.y+d.d/2,sh=(s.items||[]).filter(o=>o.type==="shower").sort((a,b)=>{const ad=itemDims(a),bd=itemDims(b),ax=a.x+ad.w/2-cx,az=a.y+ad.d/2-cz,bx=b.x+bd.w/2-cx,bz=b.y+bd.d/2-cz;return ax*ax+az*az-(bx*bx+bz*bz)})[0];
    if(!sh)return 1;const sd=itemDims(sh),vx=mm(sh.x+sd.w/2)-mm(cx),vz=mm(sh.y+sd.d/2)-mm(cz),yaw=-THREE.MathUtils.degToRad(Number(i.rotation)||0),nx=Math.sin(yaw),nz=Math.cos(yaw);return vx*nx+vz*nz>=0?1:-1;
  }
  function glassMaterial(style="plain",privacy="light",fluted=false){
    const base=(fluted?mats.flutedGlass:mats.glass).clone();
    base.userData.bpOwned=true;
    if(privacy==="clear"){base.opacity=fluted ? .22 : .18;base.roughness=fluted ? .08 : .04}
    else if(privacy==="medium"){base.opacity=fluted ? .38 : .34;base.roughness=fluted ? .24 : .32}
    else {base.opacity=fluted ? .28 : .24;base.roughness=fluted ? .12 : .10}
    if(style==="frosted"){base.transmission=.80;base.opacity=privacy==="medium" ? .52 : .43;base.roughness=.46}
    if(fluted){base.bumpMap=fluteBumpTex;base.bumpScale=.018}
    return base;
  }
  function buildGlassPanel(width,height,style="plain",fluteFace=1,privacy="light",thickness=.010){
    const g=new THREE.Group(),th=Math.max(.006,Math.min(.015,thickness));
    if(style==="none")return g;
    const plain=glassMaterial(style,privacy,false),fluted=glassMaterial(style,privacy,style==="fluted");
    const matsByFace=[plain,plain,plain,plain,plain,plain];
    if(style==="fluted")matsByFace[fluteFace>=0?4:5]=fluted;
    else if(style==="frosted")for(let k=0;k<6;k++)matsByFace[k]=plain;
    const geo=new THREE.BoxGeometry(width,height,th),base=new THREE.Mesh(geo,matsByFace);base.castShadow=false;base.receiveShadow=true;base.renderOrder=4;g.add(base);
    return g;
  }
  function mountedGroup(i,s){
    const host=i.mountHost||i.mountWall||"left",g=new THREE.Group(),W=mm(s.room.width),D=mm(s.room.depth),along=mm(Number(i.mountAlong)||0),inset=.012;g.userData.itemId=i.id;
    if(String(host).startsWith("stud:")){
      const stud=(s.items||[]).find(x=>x.id===String(host).slice(5)&&x.type==="stud");
      if(stud){const sd=itemDims(stud),rawW=mm(Number(stud.w)||900),rawD=mm(Number(stud.h)||100),yaw=-THREE.MathUtils.degToRad(Number(stud.rotation)||0),sign=(i.mountFace==="other"?-1:1)*studShowerFaceSign(stud,s),cx=mm(stud.x+sd.w/2),cz=mm(stud.y+sd.d/2),localX=along-rawW/2,nx=Math.sin(yaw)*sign,nz=Math.cos(yaw)*sign,tx=Math.cos(yaw),tz=-Math.sin(yaw),faceOffset=i.type==="glassPanel"?0:(rawD/2+.002);g.position.set(cx+tx*localX+nx*faceOffset,0,cz+tz*localX+nz*faceOffset);g.rotation.y=i.type==="glassPanel"?yaw:yaw+(sign<0?Math.PI:0);return g}
    }
    if(host==="left"){g.position.set(inset,0,along);g.rotation.y=Math.PI/2}
    else if(host==="right"){g.position.set(W-inset,0,along);g.rotation.y=-Math.PI/2}
    else if(host==="window"){g.position.set(along,0,inset);g.rotation.y=0}
    else {g.position.set(along,0,D-inset);g.rotation.y=Math.PI}
    return g;
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
  function addWallPart(side, mesh){
    wallRoot.add(mesh);
    wallSets[side].push(mesh);
  }

  function buildWalls(s) {
    wallSets = { window: [], opposite: [], left: [], right: [] };
    const W=mm(s.room.width), D=mm(s.room.depth), H=mm(s.room.ceiling), T=.055;
    const win=s.room.window, wb=mm(win.before), ww=mm(win.width), sill=mm(win.sill), wh=mm(win.height), windowT=Math.max(.055,mm(win.depth||200));
    const wr=Math.max(0,W-wb-ww), above=Math.max(0,H-sill-wh);

    // The internal face stays at z=0. The window wall/reveal extends backwards,
    // so the sill reads as a real 200mm-deep ledge without changing room dimensions.
    addWallBox("window", wb,H,windowT, wb/2,H/2,-windowT/2);
    addWallBox("window", wr,H,windowT, wb+ww+wr/2,H/2,-windowT/2);
    addWallBox("window", ww,sill,windowT, wb+ww/2,sill/2,-windowT/2);
    addWallBox("window", ww,above,windowT, wb+ww/2,sill+wh+above/2,-windowT/2);

    addWallBox("opposite", W,H,T, W/2,H/2,D+T/2);
    addWallBox("left", T,H,D, -T/2,H/2,D/2);

    const door=s.room.door, db=mm(door.before), dw=mm(door.width), leafW=mm(Math.max(100,Math.min(Number(door.width)||100,Number(door.leafWidth)||Number(door.width)||100))), de=db+dw, dh=mm(door.height),leafInset=Math.max(0,(dw-leafW)/2);
    const after=Math.max(0,D-de), over=Math.max(0,H-dh);
    addWallBox("right", T,H,db, W+T/2,H/2,db/2);
    addWallBox("right", T,H,after, W+T/2,H/2,de+after/2);
    addWallBox("right", T,over,dw, W+T/2,dh+over/2,db+dw/2);

    // Visible but simple door model. Frame pieces follow the right wall visibility,
    // which stops the old floating top section appearing when the wall is hidden.
    const doorFrameMat = new THREE.MeshStandardMaterial({color:0xe9e4da,roughness:.62});
    const doorLeafMat = new THREE.MeshStandardMaterial({color:0xf1eee7,roughness:.72});
    const trim=.03, leafT=.028;

    // Show the real frame allowance as jamb/reveal material, then hang the leaf from the inner jamb.
    if(leafInset>.001){
      addWallPart("right", meshBox(.05,dh,leafInset,doorFrameMat,W-.020,dh/2,db+leafInset/2,false));
      addWallPart("right", meshBox(.05,dh,leafInset,doorFrameMat,W-.020,dh/2,de-leafInset/2,false));
    }
    addWallPart("right", meshBox(trim,dh+.02,.05,doorFrameMat,W-.018,(dh+.02)/2,db+leafInset,false));
    addWallPart("right", meshBox(trim,dh+.02,.05,doorFrameMat,W-.018,(dh+.02)/2,de-leafInset,false));
    addWallPart("right", meshBox(trim,.05,dw+.02,doorFrameMat,W-.018,dh+.01,db+dw/2,false));

    const hinge=(door.hinge||"bottom");
    const angle=THREE.MathUtils.degToRad(Math.max(0, Math.min(120, Number(door.openAngle ?? 26))));
    const dir=hinge==="top" ? 1 : -1;
    const swing=(hinge==="top" ? -angle : angle)*(door.swingDirection==="out"?-1:1);
    const doorPivot = new THREE.Group();
    doorPivot.position.set(W-.026,0,hinge==="top" ? db+leafInset : de-leafInset);
    doorPivot.rotation.y = swing;
    const leafDepth=Math.max(.08,leafW);
    const leaf = meshBox(leafT,dh-.025,leafDepth,doorLeafMat,-leafT/2,(dh-.025)/2,dir*leafDepth/2,false);
    doorPivot.add(leaf);

    const handleMat=mats.brass;
    const handleY=Math.min(1.02,dh*.52);
    const handleZ=dir*leafDepth*.78;
    const handleStem=cylinder(.010,.045,handleMat,"x",18);
    handleStem.position.set(-.038,handleY,handleZ);
    doorPivot.add(handleStem);
    const handleBar=meshBox(.016,.016,.09,handleMat,-.062,handleY,handleZ-(dir*.03),false);
    doorPivot.add(handleBar);
    addWallPart("right", doorPivot);

    // Window frame + glass
    const frameMat = new THREE.MeshStandardMaterial({color:0xc8c2b6,roughness:.55});
    const fw=.035, frameZ=-windowT+.018;
    const frame = new THREE.Group();
    frame.add(meshBox(ww,fw,.025,frameMat,wb+ww/2,sill,frameZ,false));
    frame.add(meshBox(ww,fw,.025,frameMat,wb+ww/2,sill+wh,frameZ,false));
    frame.add(meshBox(fw,wh,.025,frameMat,wb,sill+wh/2,frameZ,false));
    frame.add(meshBox(fw,wh,.025,frameMat,wb+ww,sill+wh/2,frameZ,false));
    const glass = meshBox(Math.max(.01,ww-fw*2),Math.max(.01,wh-fw*2),.008,mats.windowGlass,wb+ww/2,sill+wh/2,-windowT+.030,false);
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



  function floorBuildTotal(s){
    return ((s.floorBuild&&s.floorBuild.layers)||[]).filter(l=>l.enabled!==false).reduce((a,l)=>a+Math.max(0,Number(l.thickness)||0),0);
  }

  function generatedJoists(s){
    const st=s.structure||{},arr=[],spacing=Math.max(100,Number(st.spacing)||400),width=Math.max(20,Number(st.width)||47),offset=Math.max(0,Number(st.offset)||0);
    if(st.showGenerated===false)return arr;
    if(st.direction==="left-right"){
      for(let y=offset;y<s.room.depth+width;y+=spacing)arr.push({x:0,y:y-width/2,w:s.room.width,h:width});
    }else{
      for(let x=offset;x<s.room.width+width;x+=spacing)arr.push({x:x-width/2,y:0,w:width,h:s.room.depth});
    }
    return arr;
  }
  function allJoists(s){return [...generatedJoists(s),...((s.structure?.manualJoists)||[]).map(j=>({x:Number(j.x)||0,y:Number(j.y)||0,w:Math.max(20,Number(j.w)||47),h:Math.max(20,Number(j.h)||4000)}))]}
  function heatingLayerCenterMm(s){
    let down=0;for(const l of (s.floorBuild?.layers||[])){if(l.enabled===false)continue;const t=Math.max(0,Number(l.thickness)||0);if(String(l.id||"").includes("ufh")||String(l.name||"").toLowerCase().includes("ufh")||String(l.name||"").toLowerCase().includes("heating"))return down+t/2;down+=t}return 7;
  }

  function buildStructure(s){
    const aboveDeck=mm(floorBuildTotal(s)),deck=mm(Math.max(1,Number(s.structure?.deckThickness)||18)),depth=mm(Math.max(50,Number(s.structure?.depth)||195));
    const joistTop=-(aboveDeck+deck);
    allJoists(s).forEach(j=>{
      const m=meshBox(mm(j.w),depth,mm(j.h),mats.joist,mm(j.x+j.w/2),joistTop-depth/2,mm(j.y+j.h/2));
      structureRoot.add(m);
    });
    (s.structure?.noggins||[]).forEach(n=>{
      const w=Math.max(10,Number(n.w)||300),h=Math.max(10,Number(n.h)||47);
      const m=meshBox(mm(w),depth*.72,mm(h),mats.joist,mm((Number(n.x)||0)+w/2),joistTop-depth*.36,mm((Number(n.y)||0)+h/2));structureRoot.add(m);
    });
    const deckMesh=meshBox(mm(s.room.width),deck,mm(s.room.depth),mats.wallSide,mm(s.room.width)/2,-aboveDeck-deck/2,mm(s.room.depth)/2,false);
    deckMesh.userData.structureKind="deck";
    structureRoot.add(deckMesh);
    if(s.heating?.enabled){
      const margin=mm(Math.max(0,Number(s.heating.margin)||0)),W=mm(s.room.width)-margin*2,D=mm(s.room.depth)-margin*2;
      if(W>.05&&D>.05){const heatZ=heatingLayerCenterMm(s);const heat=meshBox(W,.006,D,mats.heating,mm(s.room.width)/2,-mm(heatZ),mm(s.room.depth)/2,false);heat.userData.structureKind="heating";structureRoot.add(heat)}
    }
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
  function curvedCornerShape(w,d,hand="left",inset=0){const W=Math.max(.12,w-inset*2),D=Math.max(.12,d-inset*2),x0=-W/2,x1=W/2,z0=-D/2,z1=D/2,big=Math.min(D*.42,W*.18),small=Math.min(D*.12,W*.05),yy=z=>-z,sh=new THREE.Shape();if(hand==="left"){sh.moveTo(x0,yy(z0));sh.lineTo(x1,yy(z0));sh.lineTo(x1,yy(z1-small));sh.quadraticCurveTo(x1,yy(z1),x1-small,yy(z1));sh.lineTo(x0+big,yy(z1));sh.quadraticCurveTo(x0,yy(z1),x0,yy(z1-big));sh.lineTo(x0,yy(z0))}else{sh.moveTo(x0,yy(z0));sh.lineTo(x1,yy(z0));sh.lineTo(x1,yy(z1-big));sh.quadraticCurveTo(x1,yy(z1),x1-big,yy(z1));sh.lineTo(x0+small,yy(z1));sh.quadraticCurveTo(x0,yy(z1),x0,yy(z1-small));sh.lineTo(x0,yy(z0))}return sh}
  function bathCapsuleShape(w,d,inset=0){
    const W=Math.max(.18,w-inset*2),D=Math.max(.16,d-inset*2),r=Math.min(D*.50,W*.24);
    return roundedRectShape(W,D,r);
  }
  function buildNewhamBath(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||1520),d=mm(i.h||730),h=mm(i.height||550),z=mm(i.z||0),outerMat=finishMaterial(prod,mats.acrylic),innerMat=mats.ceramicInner;
    // Continuous rounded freestanding shell: no rectangular side/panel pieces.
    const outer=bathCapsuleShape(w*.985,d*.985,0),inner=bathCapsuleShape(w*.985,d*.985,.085);outer.holes.push(inner);
    const shellGeo=new THREE.ExtrudeGeometry(outer,{depth:h*.84,steps:1,bevelEnabled:true,bevelSegments:5,bevelSize:.020,bevelThickness:.018});
    shellGeo.rotateX(-Math.PI/2);shellGeo.translate(0,z+.035,0);
    const shell=new THREE.Mesh(shellGeo,outerMat);shell.castShadow=true;shell.receiveShadow=true;g.add(shell);
    // Soft rolled top rim and inner lip.
    const rim=roundedRing(w*.985,d*.985,.060,.035,outerMat,d*.49);rim.position.y=z+h*.84;g.add(rim);
    const lip=roundedRing(w*.855,d*.755,.025,.020,innerMat,d*.37);lip.position.y=z+h*.815;g.add(lip);
    // Internal bath floor and symmetric reclining end walls.
    const floorShape=bathCapsuleShape(w*.665,d*.53,0),floorGeo=new THREE.ShapeGeometry(floorShape,48);floorGeo.rotateX(-Math.PI/2);floorGeo.translate(0,z+h*.17,0);const floor=new THREE.Mesh(floorGeo,innerMat);floor.receiveShadow=true;g.add(floor);
    const endD=d*.56,endH=h*.47;
    const leftEnd=roundedBox(.030,endH,endD,.018,innerMat,-w*.315,z+h*.43,0,false),rightEnd=roundedBox(.030,endH,endD,.018,innerMat,w*.315,z+h*.43,0,false);
    leftEnd.rotation.z=-.34;rightEnd.rotation.z=.34;g.add(leftEnd,rightEnd);
    // Integrated centre waste and overflow detail.
    const drain=cylinder(.022,.008,mats.chrome,"y",36);drain.position.set(0,z+h*.185,0);g.add(drain);
    const overflow=cylinder(.014,.009,mats.chrome,"z",30);overflow.position.set(0,z+h*.63,-d*.36);g.add(overflow);
    return setItemId(g,i.id);
  }
  function tubePath(points,radius,material,segments=40){
    const curve=new THREE.CatmullRomCurve3(points),geo=new THREE.TubeGeometry(curve,segments,radius,10,false),m=new THREE.Mesh(geo,material);m.castShadow=true;return m;
  }
  function buildTrentTap(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||200),d=mm(i.h||336),h=mm(i.height||1165),z=mm(i.z||0),mat=accessoryMaterial(i,s,mats.chrome,prod);
    // Circular floor plate and slim round riser.
    const baseR=Math.max(.070,Math.min(.105,w*.48)),base=cylinder(baseR,.020,mat,"y",48);base.position.y=z+.010;g.add(base);
    const collar=cylinder(baseR*.58,.050,mat,"y",40);collar.position.y=z+.045;g.add(collar);
    const stemH=h*.74,stem=cylinder(.027,stemH,mat,"y",36);stem.position.set(0,z+.070+stemH/2,0);g.add(stem);
    // Mixer body and small side lever.
    const mixer=cylinder(.041,.155,mat,"x",36);mixer.position.set(0,z+h*.73,0);g.add(mixer);
    const leverStem=cylinder(.008,.075,mat,"x",20);leverStem.position.set(.100,z+h*.755,0);leverStem.rotation.z=.10;g.add(leverStem);
    const leverKnob=cylinder(.014,.030,mat,"x",20);leverKnob.position.set(.135,z+h*.765,0);g.add(leverKnob);
    // Tall swan-neck fixed spout, curving over the bath and then down.
    const spout=tubePath([
      new THREE.Vector3(0,z+h*.73,.005),
      new THREE.Vector3(0,z+h*.86,.005),
      new THREE.Vector3(0,z+h*.96,.035),
      new THREE.Vector3(0,z+h*.995,.115),
      new THREE.Vector3(0,z+h*.965,.190)
    ],.020,mat,48);g.add(spout);
    const nozzle=cylinder(.023,.072,mat,"y",30);nozzle.position.set(0,z+h*.935,.190);g.add(nozzle);
    // Hand shower mounted to one side of the riser.
    const holder=cylinder(.014,.070,mat,"x",24);holder.position.set(-.060,z+h*.69,-.010);g.add(holder);
    const handGrip=cylinder(.017,.205,mat,"y",28);handGrip.position.set(-.095,z+h*.70,-.010);handGrip.rotation.z=-.10;g.add(handGrip);
    const handHead=cylinder(.034,.040,mat,"z",32);handHead.position.set(-.110,z+h*.795,-.010);g.add(handHead);
    // Flexible hose hanging in a soft U curve.
    const hoseMat=accessoryMaterial(i,s,new THREE.MeshStandardMaterial({color:0xbfc4c7,roughness:.30,metalness:.82}),prod);
    const hose=tubePath([
      new THREE.Vector3(-.060,z+h*.66,-.010),
      new THREE.Vector3(-.125,z+h*.49,-.015),
      new THREE.Vector3(-.115,z+h*.29,-.020),
      new THREE.Vector3(-.020,z+h*.22,-.015),
      new THREE.Vector3(.025,z+h*.39,-.008),
      new THREE.Vector3(.015,z+h*.60,-.004)
    ],.006,hoseMat,54);g.add(hose);
    return setItemId(g,i.id);
  }

  function buildMertonBath(i,s,prod){const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||585),z=mm(i.z||0),hand=productProfile(prod).includes("right")?"right":"left",outer=curvedCornerShape(w,d,hand,0),inner=curvedCornerShape(w,d,hand,.062);outer.holes.push(inner);const geo=new THREE.ExtrudeGeometry(outer,{depth:h*.94,steps:1,bevelEnabled:true,bevelSegments:4,bevelSize:.012,bevelThickness:.010});geo.rotateX(-Math.PI/2);geo.translate(0,z,0);const shell=new THREE.Mesh(geo,mats.acrylic);shell.castShadow=true;shell.receiveShadow=true;g.add(shell);const floorGeo=new THREE.ShapeGeometry(curvedCornerShape(w,d,hand,.105),40);floorGeo.rotateX(-Math.PI/2);floorGeo.translate(0,z+h*.24,0);g.add(new THREE.Mesh(floorGeo,mats.ceramicInner));const drain=cylinder(.019,.009,accessoryMaterial(i,s,mats.chrome,prod),"y",30);drain.position.set(hand==="left"?w*.20:-w*.20,z+h*.255,0);g.add(drain);const overflow=cylinder(.013,.008,accessoryMaterial(i,s,mats.chrome,prod),"z",24);overflow.position.set(hand==="left"?w*.38:-w*.38,z+h*.62,-d*.36);g.add(overflow);return setItemId(g,i.id)}
  function buildBath(i,s){const prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod);if(profile==="newham-c51092")return buildNewhamBath(i,s,prod);if(profile==="merton-curved-left"||profile==="merton-curved-right")return buildMertonBath(i,s,prod);const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||550),z=mm(i.z||0),style=prod?.style||"box",acrylic=finishMaterial(prod,mats.acrylic),panel=new THREE.MeshStandardMaterial({color:0xf1f0ec,roughness:.46}),inner=mats.ceramicInner,panelT=.035;g.add(meshBox(w,h*.78,panelT,panel,0,z+h*.39,d/2-panelT/2));g.add(meshBox(w,h*.78,panelT,panel,0,z+h*.39,-d/2+panelT/2));g.add(meshBox(panelT,h*.78,d,panel,-w/2+panelT/2,z+h*.39,0));g.add(meshBox(panelT,h*.78,d,panel,w/2-panelT/2,z+h*.39,0));const rimH=.045,rimT=Math.min(.065,Math.min(w,d)*.09);g.add(meshBox(w,rimH,rimT,acrylic,0,z+h-rimH/2,-d/2+rimT/2));g.add(meshBox(w,rimH,rimT,acrylic,0,z+h-rimH/2,d/2-rimT/2));g.add(meshBox(rimT,rimH,Math.max(.04,d-rimT*2),acrylic,-w/2+rimT/2,z+h-rimH/2,0));g.add(meshBox(rimT,rimH,Math.max(.04,d-rimT*2),acrylic,w/2-rimT/2,z+h-rimH/2,0));const innerW=Math.max(.25,w-rimT*2.6),innerD=Math.max(.18,d-rimT*2.6);g.add(meshBox(innerW,.025,innerD,inner,0,z+h*.27,0,false));const ls1=meshBox(innerW,h*.50,.025,inner,0,z+h*.54,-innerD/2,false),ls2=meshBox(innerW,h*.50,.025,inner,0,z+h*.54,innerD/2,false);ls1.rotation.x=-.16;ls2.rotation.x=.16;g.add(ls1,ls2);const sr=style==="straightSingleEndedRight",sl=style==="straightSingleEndedLeft",de=style==="doubleEndedBath",leftEnd=meshBox(.03,h*.58,innerD,inner,-innerW/2,z+h*.58,0,false),rightEnd=meshBox(.03,h*.58,innerD,inner,innerW/2,z+h*.58,0,false);if(sr){leftEnd.rotation.z=-.23;rightEnd.rotation.z=.04}else if(sl){leftEnd.rotation.z=-.04;rightEnd.rotation.z=.23}else if(de){leftEnd.rotation.z=-.20;rightEnd.rotation.z=.20}else{leftEnd.rotation.z=-.14;rightEnd.rotation.z=.14}g.add(leftEnd,rightEnd);const drain=cylinder(.018,.007,accessoryMaterial(i,s,mats.chrome,prod),"y",26);drain.position.set(sr?w*.23:sl?-w*.23:0,z+h*.295,0);g.add(drain);return setItemId(g,i.id)}
  function buildMetroWC(i,s,prod){const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||820),z=mm(i.z||0),panH=mm(prod?.panHeightMm||415),cisH=Math.max(.25,h-panH*.98),cisD=d*.245,cisY=-d*.365;g.add(roundedBox(w*.92,cisH,cisD,.045,mats.ceramic,0,z+panH+cisH*.50,cisY));g.add(roundedBox(w*.94,.026,cisD*1.03,.035,mats.ceramic,0,z+panH+cisH+.003,cisY,false));const flush=cylinder(.018,.008,accessoryMaterial(i,s,mats.chrome,prod),"y",30);flush.position.set(0,z+panH+cisH+.020,cisY);g.add(flush);g.add(roundedBox(w*.57,panH*.78,d*.37,.055,mats.ceramic,0,z+panH*.39,-d*.17));const bowl=new THREE.Mesh(new THREE.SphereGeometry(.5,40,26),mats.ceramic);bowl.scale.set(w*.82,panH*.32,d*.60);bowl.position.set(0,z+panH*.66,d*.105);bowl.castShadow=true;g.add(bowl);g.add(roundedBox(w*.76,panH*.18,d*.48,.095,mats.ceramic,0,z+panH*.69,-d*.02));const seat=roundedRing(w*.80,d*.49,.045,.025,mats.ceramicInner,.14);seat.position.set(0,z+panH*.955,d*.085);g.add(seat);g.add(roundedBox(w*.78,.018,d*.47,.13,new THREE.MeshPhysicalMaterial({color:0xf2f3f0,roughness:.26,clearcoat:.16}),0,z+panH*.995,d*.078,false));return setItemId(g,i.id)}
  function buildWC(i,s){const prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod);if(profile==="metro-metcc")return buildMetroWC(i,s,prod);const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||800),z=mm(i.z||0),style=prod?.style||"wcCloseCoupledRound",isBack=style==="wcBackToWallRound",isHung=style==="wcWallHungRound",isSquare=style==="wcCompactSquare";if(!isHung){const cisH=isBack?h*.50:h*.44,cisD=isBack?d*.20:d*.27,cisY=isBack?-d*.38:-d*.34;g.add(roundedBox(w*.82,cisH,cisD,.035,mats.ceramic,0,z+h*.72,cisY));g.add(roundedBox(w*.84,.025,cisD*1.04,.025,mats.ceramic,0,z+h*.96,cisY))}if(isSquare){g.add(roundedBox(w*.78,h*.30,d*.54,.07,mats.ceramic,0,z+(isHung?h*.38:h*.28),d*.10));g.add(roundedBox(w*.66,.035,d*.43,.09,mats.ceramicInner,0,z+(isHung?h*.57:h*.50),d*.12))}else{const bowl=new THREE.Mesh(new THREE.SphereGeometry(.5,32,20),mats.ceramic);bowl.scale.set(w*.78,h*.34,d*.72);bowl.position.set(0,z+(isHung?h*.38:h*.30),d*.08);bowl.castShadow=true;g.add(bowl);const seat=roundedRing(w*.68,d*.44,.04,.022,mats.ceramicInner,.12);seat.position.set(0,z+(isHung?h*.57:h*.52),d*.10);g.add(seat)}if(isHung)g.add(meshBox(w*.62,.028,d*.38,new THREE.MeshStandardMaterial({color:0xbdbbb5,transparent:true,opacity:.20}),0,z+.025,d*.08,false));else g.add(roundedBox(w*.42,h*.28,d*.34,.04,mats.ceramic,0,z+h*.14,-d*.02));if(!isHung){const flush=cylinder(.015,.006,accessoryMaterial(i,s,mats.chrome,prod),"y",24);flush.position.set(0,z+h*.985,-d*.34);g.add(flush)}return setItemId(g,i.id)}
  function buildMilanVanity(i,s,prod){const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||589),z=mm(i.z||300),bodyH=Math.max(.18,h-.055),frontZ=d/2+.010;g.add(roundedBox(w,bodyH,d,.015,mats.autumnOak,0,z+bodyH/2,0));const gap=.012,panelH=(bodyH-gap)/2;for(let row=0;row<2;row++){const cy=z+bodyH-(row+.5)*panelH-row*gap;g.add(meshBox(w*.965,panelH-.010,.016,mats.autumnOak,0,cy,frontZ,false));const count=Math.max(22,Math.round(w/.022));for(let n=0;n<count;n++){const px=-w*.46+n*(w*.92/Math.max(1,count-1));g.add(roundedBox(.007,panelH*.88,.011,.003,mats.oakDark,px,cy,frontZ+.012,false))}g.add(meshBox(w*.56,.010,.014,mats.brushedBrass,0,cy+panelH*.31,frontZ+.028,false))}g.add(roundedBox(w,.045,d+.010,.015,mats.ceramic,0,z+h-.022,.002));g.add(roundedBox(w*.58,.018,d*.48,.07,mats.ceramicInner,0,z+h+.006,.025,false));const drain=cylinder(.014,.006,accessoryMaterial(i,s,mats.chrome,prod),"y",22);drain.position.set(0,z+h+.018,.035);g.add(drain);if(prod?.tapIncluded===true){const tapMat=accessoryMaterial(i,s,mats.brushedBrass,prod);const stem=cylinder(.011,.16,tapMat,"y",16);stem.position.set(0,z+h+.08,-d*.26);g.add(stem);g.add(meshBox(.025,.025,.13,tapMat,0,z+h+.14,-d*.20))}return setItemId(g,i.id)}

  function buildArezzoVanity(i,s,prod){
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||450),z=mm(i.z||400),wood=finishMaterial(prod,mats.oak);
    const basinMat=new THREE.MeshStandardMaterial({color:0xf3f1eb,roughness:.54});
    const basinInner=new THREE.MeshPhysicalMaterial({color:0xe7e7e3,roughness:.26,clearcoat:.12});
    const bodyH=Math.max(.18,h-.075),bodyD=d*.94,frontSkin=.028,frontZ=bodyD/2+frontSkin/2+.006;
    g.add(roundedBox(w,bodyH,bodyD,.085,wood,0,z+bodyH/2,0));
    g.add(roundedBox(w*.985,bodyH*.97,frontSkin,.085,wood,0,z+bodyH/2,frontZ,false));
    const slatCount=Math.max(16,Math.round(w/.040)),span=w*.86;
    for(let n=0;n<slatCount;n++){
      const px=-span/2+n*(span/Math.max(1,slatCount-1));
      g.add(roundedBox(.015,bodyH*.84,.018,.004,mats.autumnOak,px,z+bodyH/2,frontZ+.018,false));
    }
    const seamY=z+bodyH*.56;
    g.add(meshBox(w*.72,.010,.018,new THREE.MeshStandardMaterial({color:0x816349,roughness:.82}),0,seamY,frontZ+.026,false));
    const handleY=seamY-.028;
    const handle=cylinder(.005,Math.max(.18,w*.30),mats.brushedBrass,"x",16);handle.position.set(0,handleY,frontZ+.028);g.add(handle);
    const basinH=Math.max(.055,Math.min(.090,h*.22));
    g.add(roundedBox(w,basinH,d,.10,basinMat,0,z+bodyH+basinH/2,.004));
    const bowl=roundedBox(w*.54,.022,d*.47,.09,basinInner,0,z+bodyH+basinH*.54,.026,false);g.add(bowl);
    const drain=cylinder(.014,.006,accessoryMaterial(i,s,mats.chrome,prod),"y",22);drain.position.set(0,z+bodyH+basinH*.64,.034);g.add(drain);
    const tapHole=cylinder(.009,.006,new THREE.MeshStandardMaterial({color:0x8f8f8f,roughness:.9}),"y",18);tapHole.position.set(0,z+bodyH+basinH+.002,-d*.23);g.add(tapHole);
    const shadow=meshBox(w*.88,.016,bodyD*.82,new THREE.MeshStandardMaterial({color:0x735940,roughness:.92}),0,z+.024,0,false);g.add(shadow);
    return setItemId(g,i.id)
  }


  function buildCreteC82754Vanity(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||812),d=mm(i.h||464),h=mm(i.height||849),z=mm(i.z||0),wood=mats.apexOak,dark=mats.apexOakDark;
    const basinH=Math.max(.045,Math.min(.070,h*.07)),bodyH=Math.max(.35,h-basinH),frontSkin=.026,frontZ=d/2+frontSkin/2+.004;
    // Full-height floor-standing carcass with lightly rounded front corners.
    g.add(roundedBox(w,bodyH,d,.018,wood,0,z+bodyH/2,0));
    // Two fluted drawer faces. The real Crete range has tight vertical grooves and handleless finger pulls.
    const gap=.008,panelH=(bodyH-gap)/2,slatSpan=w*.91,slatCount=Math.max(24,Math.round(w/.027));
    for(let row=0;row<2;row++){
      const cy=z+bodyH-(row+.5)*panelH-row*gap;
      g.add(roundedBox(w*.982,panelH-.006,frontSkin,.012,wood,0,cy,frontZ,false));
      for(let n=0;n<slatCount;n++){
        const px=-slatSpan/2+n*(slatSpan/Math.max(1,slatCount-1));
        g.add(roundedBox(.009,panelH*.94,.013,.003,dark,px,cy,frontZ+.019,false));
      }
      // Dark recessed shadow behind the centered scalloped/finger-pull area.
      const pullW=Math.min(.22,w*.30),pullY=cy+panelH*.40;
      g.add(roundedBox(pullW,.030,.017,.013,new THREE.MeshStandardMaterial({color:0x5f503d,roughness:.94}),0,pullY,frontZ+.027,false));
    }
    // Integrated white ceramic basin with sloped inner bowl and rear tap deck.
    const basinMat=new THREE.MeshPhysicalMaterial({color:0xf7f7f3,roughness:.18,clearcoat:.22,clearcoatRoughness:.16});
    g.add(roundedBox(w,basinH,d,.010,basinMat,0,z+bodyH+basinH/2,0));
    const innerW=w*.71,innerD=d*.54,innerY=z+bodyH+basinH*.64;
    g.add(roundedBox(innerW,.018,innerD,.040,mats.ceramicInner,0,innerY,d*.035,false));
    const backSlope=meshBox(innerW*.98,.030,innerD*.28,mats.ceramicInner,0,innerY+.012,-innerD*.30,false);backSlope.rotation.x=-.12;g.add(backSlope);
    const frontSlope=meshBox(innerW*.98,.026,innerD*.25,mats.ceramicInner,0,innerY+.008,innerD*.31,false);frontSlope.rotation.x=.10;g.add(frontSlope);
    const waste=cylinder(.020,.008,mats.chrome,"y",28);waste.position.set(0,z+bodyH+basinH*.73,d*.05);g.add(waste);
    const overflow=cylinder(.009,.006,mats.chrome,"z",22);overflow.position.set(0,z+bodyH+basinH*.69,-d*.22);g.add(overflow);
    const tapHole=cylinder(.009,.006,new THREE.MeshStandardMaterial({color:0xbababa,roughness:.55,metalness:.15}),"y",20);tapHole.position.set(0,z+bodyH+basinH+.002,-d*.32);g.add(tapHole);
    // Very small floor shadow/lip so the unit reads as floor-standing rather than floating.
    g.add(meshBox(w*.94,.010,d*.88,dark,0,z+.006,0,false));
    return setItemId(g,i.id)
  }

  function buildOdesaArc1200Vanity(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||1200),d=mm(i.h||424),h=mm(i.height||855),z=mm(i.z||0);
    const wood=mats.californiaWalnut,dark=mats.californiaWalnutDark,groove=mats.californiaWalnutGroove;
    const topH=Math.max(.024,Math.min(.034,h*.036)),plinthH=Math.max(.042,Math.min(.060,h*.067)),bodyH=Math.max(.42,h-topH-plinthH);
    const arcR=Math.max(.052,Math.min(.082,d*.19)),bodyY=z+plinthH;

    // One rounded 1200 carcass, visually divided into two 600-ish drawer banks.
    g.add(roundedFootprintBox(w,bodyH,d,arcR,wood,0,bodyY,0));
    g.add(roundedFootprintBox(w*.925,plinthH,d*.78,Math.max(.018,arcR*.46),dark,0,z,0,false));

    const frontZ=d/2+.010;
    const centreGap=Math.max(.014,Math.min(.020,w*.015));
    const rowGap=.012;
    const sideMargin=.010;
    const bankW=(w-centreGap)/2;
    const panelW=bankW-sideMargin*2;
    const panelH=(bodyH-rowGap)/2;
    const faceDepth=.015;

    // A shallow walnut-brown recess makes the four individual fronts unmistakable at normal room-view distance.
    const recessMat=new THREE.MeshStandardMaterial({color:0x775436,roughness:.95});
    g.add(roundedBox(w-arcR*1.25,bodyH*.965,.010,.010,recessMat,0,bodyY+bodyH/2,frontZ-.006,false));

    for(let col=0;col<2;col++){
      const cx=(col===0?-1:1)*(centreGap/2+bankW/2);
      for(let row=0;row<2;row++){
        const cy=bodyY+bodyH-(row+.5)*panelH-row*rowGap;
        g.add(roundedBox(panelW,panelH-.010,faceDepth,.010,wood,cx,cy,frontZ,false));

        // Fine vertical flutes. These are mid-walnut shadows, not black bars.
        const usable=panelW*.94, ribStep=.021;
        const count=Math.max(22,Math.floor(usable/ribStep));
        for(let n=0;n<=count;n++){
          const px=cx-usable/2+n*(usable/Math.max(1,count));
          g.add(roundedBox(.0036,panelH*.905,.006,.0012,groove,px,cy,frontZ+.0105,false));
        }

        // Handleless milled pull channel at the top of every drawer front.
        const pullY=cy+panelH*.426;
        g.add(roundedBox(panelW*.86,.012,.009,.004,dark,cx,pullY,frontZ+.0135,false));
      }
    }

    // Strong but still timber-coloured centre and horizontal separations: 2 columns × 2 rows.
    g.add(meshBox(centreGap*.62,bodyH*.968,.012,recessMat,0,bodyY+bodyH/2,frontZ+.010,false));
    const breakY=bodyY+bodyH*.5;
    for(const cx of [-(centreGap/2+bankW/2),(centreGap/2+bankW/2)]){
      g.add(meshBox(panelW*.985,rowGap*.62,.012,recessMat,cx,breakY,frontZ+.011,false));
    }

    // Continue the fluted language around only the two outer front Arc corners.
    const curveCount=9,cz=d/2-arcR,cxEdge=w/2-arcR;
    for(let row=0;row<2;row++){
      const cy=bodyY+bodyH-(row+.5)*panelH-row*rowGap;
      for(let n=1;n<=curveCount;n++){
        const a=(Math.PI/2)*(n/(curveCount+1));
        const zz=cz+arcR*Math.cos(a),xr=cxEdge+arcR*Math.sin(a),xl=-cxEdge-arcR*Math.sin(a);
        const rr=roundedBox(.0037,panelH*.90,.006,.0012,groove,xr,cy,zz+.008,false);rr.rotation.y=a;g.add(rr);
        const rl=roundedBox(.0037,panelH*.90,.006,.0012,groove,xl,cy,zz+.008,false);rl.rotation.y=-a;g.add(rl);
      }
    }

    const topStyle=String(i.vanityTopStyle||prod?.defaultTopStyle||"countertop").toLowerCase();
    if(topStyle==="double-basin"){
      const topY=z+plinthH+bodyH;
      const deckH=Math.max(.064,Math.min(.086,h*.096));
      const deckW=w+.018, deckD=d+.026;
      const upstandH=Math.max(.014,deckH*.21), upstandD=.022;
      const tapMat=accessoryMaterial(i,s,mats.brushedBrass,prod);
      const wasteMat=accessoryMaterial(i,s,mats.chrome,prod);
      g.add(roundedFootprintBox(deckW,deckH,deckD,arcR+.016,mats.ceramic,0,topY,0));
      // rear and side upstands reflect the integrated basin top in the reference image.
      g.add(roundedBox(deckW*.96,upstandH,upstandD,.008,mats.ceramic,0,topY+deckH-upstandH/2,-deckD/2+upstandD*.55,false));
      const sideSplashD=.013, sideSplashW=.068;
      g.add(roundedBox(sideSplashW,upstandH,sideSplashD,.006,mats.ceramic,-deckW*.455,topY+deckH-upstandH/2,-deckD*.33,false));
      g.add(roundedBox(sideSplashW,upstandH,sideSplashD,.006,mats.ceramic, deckW*.455,topY+deckH-upstandH/2,-deckD*.33,false));
      const bowlW=Math.max(.285,w*.316), bowlD=Math.max(.205,d*.495), bowlH=Math.max(.034,deckH*.58);
      const bowlY=topY+deckH*.39, bowlZ=.020;
      [-w*.242,w*.242].forEach(cx=>{
        g.add(roundedBox(bowlW*1.035,.010,bowlD*1.03,.032,mats.ceramic,cx,topY+deckH*.975,bowlZ,false));
        g.add(roundedBox(bowlW,bowlH,bowlD,.036,mats.ceramicInner,cx,bowlY,bowlZ,false));
        g.add(roundedBox(bowlW*.94,bowlH*.40,bowlD*.26,.018,mats.ceramicInner,cx,topY+deckH*.66,-bowlD*.31,false));
        g.add(roundedBox(bowlW*.88,.010,bowlD*.16,.012,mats.ceramicInner,cx,topY+deckH*.22,bowlD*.34,false));
        const drain=cylinder(.015,.006,wasteMat,"y",24);drain.position.set(cx,topY+deckH*.10,.024);g.add(drain);
        const stem=cylinder(.0105,.126,tapMat,"y",22);stem.position.set(cx,topY+deckH*.98,-deckD*.235);g.add(stem);
        const spout=tubePath([new THREE.Vector3(cx,topY+deckH*1.01,-deckD*.235),new THREE.Vector3(cx,topY+deckH*1.14,-deckD*.225),new THREE.Vector3(cx,topY+deckH*1.15,-deckD*.165),new THREE.Vector3(cx,topY+deckH*1.10,-deckD*.090)],.0105,tapMat,28);g.add(spout);
        const lever=meshBox(.016,.010,.058,tapMat,cx+.020,topY+deckH*1.07,-deckD*.245,false);g.add(lever);
      });
      // subtle front lip and a centre bridge help it read as one cast double-basin ceramic top.
      g.add(roundedBox(deckW*.92,.010,.011,.004,mats.ceramicInner,0,topY+deckH*.20,deckD/2-.014,false));
      g.add(roundedBox(w*.10,.010,.048,.014,mats.ceramic,0,topY+deckH*.88,.004,false));
    }else{
      // Matching California Walnut countertop. This SKU does not include a basin or taps.
      g.add(roundedFootprintBox(w+.010,topH,d+.010,arcR+.005,wood,0,z+plinthH+bodyH,0));
      g.add(roundedBox(w-arcR*2.10,topH*.48,.007,.003,groove,0,z+plinthH+bodyH+topH*.54,d/2+.010,false));
    }
    return setItemId(g,i.id)
  }

  function buildVanity(i,s){const prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod);if(profile==="milan-fluted-oak")return buildMilanVanity(i,s,prod);if(profile==="arezzo-vanity-az9crvlomw")return buildArezzoVanity(i,s,prod);if(profile==="crete-c82754")return buildCreteC82754Vanity(i,s,prod);if(profile==="odesa-arc-odar2x6fsflcalwtop")return buildOdesaArc1200Vanity(i,s,prod);const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||850),z=mm(i.z||0),wood=finishMaterial(prod,prod?.finish?.toLowerCase().includes("oak")?mats.oak:mats.timber),bodyH=Math.max(.12,h-.055);g.add(roundedBox(w,bodyH,d,.012,wood,0,z+bodyH/2,0));const frontZ=d/2+.011,panelH=bodyH*.46;[-.25,.25].forEach((q,idx)=>{g.add(meshBox(w*.94,panelH,.018,idx?mats.oakDark:wood,0,z+bodyH*(idx?.25:.74),frontZ));const handle=cylinder(.007,w*.28,accessoryMaterial(i,s,mats.brushedBrass,prod),"x",18);handle.position.set(0,z+bodyH*(idx?.30:.79),frontZ+.018);g.add(handle)});g.add(roundedBox(w,.05,d+.012,.012,mats.ceramic,0,z+h-.025,.003));const bowl=new THREE.Mesh(new THREE.TorusGeometry(Math.min(w,d)*.18,.018,14,48),mats.ceramicInner);bowl.rotation.x=Math.PI/2;bowl.scale.z=.68;bowl.position.set(0,z+h+.006,.035);g.add(bowl);const drain=cylinder(.015,.006,accessoryMaterial(i,s,mats.chrome,prod),"y",20);drain.position.set(0,z+h+.012,.035);g.add(drain);if(prod?.tapIncluded!==false){const tapMat=accessoryMaterial(i,s,mats.brushedBrass,prod);const stem=cylinder(.011,.16,tapMat,"y",16);stem.position.set(0,z+h+.08,-d*.26);g.add(stem);g.add(meshBox(.025,.025,.13,tapMat,0,z+h+.14,-d*.20))}return setItemId(g,i.id)}

  function buildShower(i,s){
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=Math.max(.025,mm(i.height||40)),z=mm(i.z||0),prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod),slate=profile==="imperia-graphite"||renderFinish(prod)==="graphite-slate"||(prod?.finish||"").toLowerCase().includes("graphite"),trayMat=slate?mats.graphiteSlate:finishMaterial(prod,mats.ceramic),topMat=slate?mats.graphiteSlate:mats.ceramicInner;
    g.add(roundedBox(w,h,d,.012,trayMat,0,z+h/2,0));g.add(roundedBox(Math.max(.10,w-.035),.008,Math.max(.10,d-.035),.010,topMat,0,z+h+.004,0,false));
    if(slate){const grateW=Math.min(.144,Math.min(w,d)*.24),gx=-w*.24,gz=d*.22;g.add(roundedBox(grateW,.010,grateW,.006,mats.chrome,gx,z+h+.014,gz,false));const holeMat=new THREE.MeshStandardMaterial({color:0x444542,roughness:.85});for(let xx=-2;xx<=2;xx++)for(let zz=-2;zz<=2;zz++){const hole=cylinder(.006,.004,holeMat,"y",14);hole.position.set(gx+xx*grateW*.145,z+h+.020,gz+zz*grateW*.145);g.add(hole)}}else{const drain=cylinder(.032,.008,mats.chrome,"y",28);drain.position.set(-w*.28,z+h+.012,d*.27);g.add(drain)}
    return setItemId(g,i.id)
  }

  function buildStud(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1100),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.wallSide,0,z+h/2,0));
    return setItemId(g,i.id);
  }

  function buildGlassItem(i,s){
    // V2.4.3 deliberately restores the successful V2.2 visual model: a thin free panel
    // with visible, restrained ribs on one face only. No host transform can move the panel.
    const g=groupForItem(i),w=mm(i.w||900),d=Math.max(.006,mm(i.glassThickness||i.h||10)),h=mm(i.height||1000),z=mm(i.z??1100),style=i.glassStyle||"fluted",privacy=i.glassPrivacy||"light";
    if(style==="none")return setItemId(g,i.id);
    let baseMat=(style==="fluted"?mats.flutedGlass:mats.glass).clone();baseMat.userData.bpOwned=true;
    if(style==="frosted"){baseMat=mats.glass.clone();baseMat.userData.bpOwned=true;baseMat.transmission=.54;baseMat.opacity=privacy==="medium"?.52:.44;baseMat.roughness=.48}
    else if(privacy==="clear"){baseMat.opacity=style==="fluted"?.30:.24}
    else if(privacy==="medium"){baseMat.opacity=style==="fluted"?.44:.38;baseMat.roughness=Math.max(baseMat.roughness,.30)}
    const base=meshBox(w,h,d,baseMat,0,z+h/2,0,false);base.renderOrder=3;g.add(base);
    if(style==="fluted"){
      const spacing=.030,count=Math.max(4,Math.min(42,Math.floor(w/spacing))),actual=w/count;
      const ribMat=new THREE.MeshPhysicalMaterial({color:0xc1d8dc,transmission:.40,transparent:true,opacity:privacy==="medium"?.43:.34,roughness:.46,metalness:0,side:THREE.DoubleSide,depthWrite:false});ribMat.userData.bpOwned=true;
      for(let n=1;n<count;n++){const x=-w/2+n*actual;const rib=meshBox(Math.min(.009,actual*.28),h*.985,.004,ribMat,x,z+h/2,d/2+.002,false);rib.renderOrder=4;g.add(rib)}
    }
    const trim=trimFinishMaterial(i,s),edge=.006,trimDepth=Math.max(d,.008);
    g.add(meshBox(w,edge,trimDepth,trim,0,z+h-edge/2,0,false));
    g.add(meshBox(edge,h,trimDepth,trim,-w/2+edge/2,z+h/2,0,false));
    g.add(meshBox(edge,h,trimDepth,trim,w/2-edge/2,z+h/2,0,false));
    return setItemId(g,i.id);
  }

  function buildRainHead(i,s) {
    const mat=fixtureFinishMaterial(i,s),g=mountedGroup(i,s),projection=Math.max(.12,mm(i.w||320)),headD=Math.max(.14,mm(i.h||300)),z=mm(i.z||1945),h=mm(i.height||180),top=z+h*.78;
    const rose=cylinder(.014,.035,mat,"z",20);rose.position.set(0,top,.018);g.add(rose);
    const arm=meshBox(.018,.018,projection,mat,0,top,projection/2,false);g.add(arm);
    const drop=cylinder(.010,Math.max(.055,h*.26),mat,"y",18);drop.position.set(0,top-h*.13,projection-.012);g.add(drop);
    const radius=Math.max(.07,Math.min(.17,headD*.44)),head=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,.018,48),mat);head.position.set(0,top-h*.28,projection-.012);head.castShadow=true;g.add(head);
    return setItemId(g,i.id);
  }

  function buildHandset(i,s) {
    const mat=fixtureFinishMaterial(i,s),g=mountedGroup(i,s),w=mm(i.w||90),d=mm(i.h||90),z=mm(i.z||1050),h=mm(i.height||720);
    const rail=cylinder(.009,Math.max(.18,h),mat,"y",18);rail.position.set(-w*.20,z+h/2,.018);g.add(rail);
    const handset=cylinder(.017,Math.min(.22,Math.max(.14,h*.26)),mat,"y",18);handset.position.set(w*.18,z+h*.62,.035);handset.rotation.z=.34;g.add(handset);
    const outlet=cylinder(.018,.040,mat,"z",18);outlet.position.set(-w*.18,z+.10,.020);g.add(outlet);
    const hose=new THREE.Mesh(new THREE.TorusGeometry(Math.max(.035,d*.35),.006,10,32,Math.PI),mat);hose.position.set(w*.02,z+h*.34,.045);g.add(hose);
    return setItemId(g,i.id);
  }

  function buildShowerControls(i,s) {
    const mat=fixtureFinishMaterial(i,s),g=mountedGroup(i,s),w=mm(i.w||150),d=Math.max(.025,mm(i.h||40)),z=mm(i.z||950),h=mm(i.height||200);
    const plate=roundedBox(Math.max(.10,w),Math.max(.12,h),Math.max(.014,d*.45),.015,mat,0,z+h/2,d*.22,false);g.add(plate);
    const knobLen=Math.max(.025,d*.9);[-.27,.27].forEach(q=>{const k=cylinder(Math.max(.017,Math.min(.025,w*.13)),knobLen,mat,"z",20);k.position.set(w*q,z+h/2,d*.55);g.add(k)});
    return setItemId(g,i.id);
  }

  function buildArezzoTallStorage(i,s,prod){
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1380),z=mm(i.z||200),wood=finishMaterial(prod,mats.oak);
    const bodyD=d*.95,frontSkin=.026,frontZ=bodyD/2+frontSkin/2+.006;
    g.add(roundedBox(w,h,bodyD,.075,wood,0,z+h/2,0));
    g.add(roundedBox(w*.985,h*.985,frontSkin,.075,wood,0,z+h/2,frontZ,false));
    const slatCount=Math.max(10,Math.round(w/.035)),span=w*.78;
    for(let n=0;n<slatCount;n++){
      const px=-span/2+n*(span/Math.max(1,slatCount-1));
      g.add(roundedBox(.013,h*.88,.016,.004,mats.autumnOak,px,z+h/2,frontZ+.017,false));
    }
    const seamY=z+h*.51;
    g.add(meshBox(w*.72,.010,.016,new THREE.MeshStandardMaterial({color:0x7d6040,roughness:.82}),0,seamY,frontZ+.022,false));
    const handleTop=meshBox(w*.30,.010,.015,mats.oakDark,0,z+h*.72,frontZ+.024,false);g.add(handleTop);
    const handleBot=meshBox(w*.30,.010,.015,mats.oakDark,0,z+h*.30,frontZ+.024,false);g.add(handleBot);
    const shadow=meshBox(w*.84,.018,bodyD*.70,new THREE.MeshStandardMaterial({color:0x70563b,roughness:.95}),0,z+.028,0,false);g.add(shadow);
    return setItemId(g,i.id)
  }


  function buildCrete72137Tall(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||350),d=mm(i.h||300),h=mm(i.height||1400),z=mm(i.z||300),wood=mats.apexOak,dark=mats.apexOakDark;
    const bodyD=d*.96,frontSkin=.025,frontZ=bodyD/2+frontSkin/2+.004;
    // Slim wall-hung cabinet carcass.
    g.add(roundedBox(w,h,bodyD,.012,wood,0,z+h/2,0));
    const gap=.008,panelH=(h-gap)/2,slatSpan=w*.88,slatCount=Math.max(13,Math.round(w/.026));
    for(let row=0;row<2;row++){
      const cy=z+h-(row+.5)*panelH-row*gap;
      g.add(roundedBox(w*.982,panelH-.006,frontSkin,.010,wood,0,cy,frontZ,false));
      for(let n=0;n<slatCount;n++){
        const px=-slatSpan/2+n*(slatSpan/Math.max(1,slatCount-1));
        g.add(roundedBox(.008,panelH*.95,.012,.003,dark,px,cy,frontZ+.018,false));
      }
    }
    // Horizontal seam and the opposing recessed finger-pull shapes shown on the product front.
    const seamY=z+h*.5;
    g.add(meshBox(w*.84,.009,.018,new THREE.MeshStandardMaterial({color:0x78644b,roughness:.92}),0,seamY,frontZ+.024,false));
    const pullMat=new THREE.MeshStandardMaterial({color:0x5b4d3a,roughness:.96});
    g.add(roundedBox(w*.34,.032,.016,.014,pullMat,-w*.10,seamY+.026,frontZ+.030,false));
    g.add(roundedBox(w*.34,.032,.016,.014,pullMat, w*.10,seamY-.026,frontZ+.030,false));
    // Slight wall shadow/back panel clarifies that this is a suspended cabinet.
    g.add(meshBox(w*.90,h*.94,.010,new THREE.MeshStandardMaterial({color:0x6f5c45,roughness:.96}),0,z+h/2,-bodyD/2-.004,false));
    return setItemId(g,i.id)
  }

  function buildStorage(i,s) {
    const prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod);
    if(profile==="arezzo-tall-azslotuwh") return buildArezzoTallStorage(i,s,prod);
    if(profile==="crete-72137") return buildCrete72137Tall(i,s,prod);
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1800),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.timber,0,z+h/2,0));
    const front=meshBox(w*.92,h*.94,.018,mats.oak,0,z+h/2,d/2+.011);g.add(front);
    const seam=meshBox(w*.88,.012,.022,mats.oakDark,0,z+h*.52,d/2+.024);g.add(seam);
    return setItemId(g,i.id);
  }

  function buildRadiator(i,s) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||1200),z=mm(i.z||0);
    const prod=(s.products||[]).find(p=>p.id===i.productId),radMat=accessoryMaterial(i,s,mats.metal,(s.products||[]).find(p=>p.id===i.productId));
    const style=prod?.style || "radiatorLadder";
    const wallLength=Math.max(w,d), alongZ=d>=w;
    const railR=.012;

    if(style==="radiatorVerticalBars"){
      const count=Math.max(4,Math.round(wallLength/.055));
      for(let n=0;n<count;n++){
        const pos=-wallLength*.42 + n*(wallLength*.84/Math.max(1,count-1));
        const bar=cylinder(.016,h,radMat,"y",18);
        bar.position.set(alongZ?0:pos,z+h/2,alongZ?pos:0);g.add(bar);
      }
    }else{
      const edge=wallLength*.39;
      const collector1=cylinder(railR,h,radMat,"y",18);
      collector1.position.set(alongZ?0:-edge,z+h/2,alongZ?-edge:0);g.add(collector1);
      const collector2=cylinder(railR,h,radMat,"y",18);
      collector2.position.set(alongZ?0:edge,z+h/2,alongZ?edge:0);g.add(collector2);
      for(let yy=z+.08;yy<z+h-.05;yy+=.105){
        const rail=cylinder(railR,wallLength*.78,radMat,alongZ?"z":"x",18);
        rail.position.set(0,yy,0);g.add(rail);
      }
    }

    // Wall stand-offs and valves.
    const standoff=meshBox(.025,.025,.055,radMat,0,z+h*.2,alongZ?-.04:0,false);
    g.add(standoff);
    const valve1=cylinder(.018,.055,radMat,alongZ?"z":"x",18);
    valve1.position.set(alongZ?0:-wallLength*.34,z-.015,alongZ?-wallLength*.34:0);g.add(valve1);
    const valve2=cylinder(.018,.055,radMat,alongZ?"z":"x",18);
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
        const trimMat=accessoryMaterial(i,s,mats.brushedBrass);
        g.add(meshBox(width+frame*2,frame,.025,trimMat,cx,z0,cz+.012,false));
        g.add(meshBox(width+frame*2,frame,.025,trimMat,cx,z0+hh,cz+.012,false));
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

  function buildMirror(i,s){const faceW=mm(i.w||500),faceH=mm(i.height||500),proj=Math.max(.012,mm(i.h||25)),bottom=mm(i.z||1200),along=mm(i.mountAlong||1185),wall=i.mountHost||i.mountWall||"left",prod=(s.products||[]).find(p=>p.id===i.productId),style=prod?.style||"mirrorRound",profile=productProfile(prod),g=new THREE.Group(),W=mm(s.room.width),D=mm(s.room.depth),inset=.014;g.userData.itemId=i.id;if(wall==="left"){g.position.set(inset,bottom+faceH/2,along);g.rotation.y=Math.PI/2}else if(wall==="right"){g.position.set(W-inset,bottom+faceH/2,along);g.rotation.y=-Math.PI/2}else if(wall==="window"){g.position.set(along,bottom+faceH/2,inset)}else{g.position.set(along,bottom+faceH/2,D-inset);g.rotation.y=Math.PI}const arezzo=profile==="arezzo-black-led",jolie=profile==="jolie-73483",edge=arezzo?accessoryMaterial(i,s,mats.mattBlack,prod):accessoryMaterial(i,s,new THREE.MeshStandardMaterial({color:0xbfc4c2,roughness:.30,metalness:.55}),prod);if(jolie){const back=new THREE.MeshStandardMaterial({color:0xc9ced0,roughness:.34,metalness:.42}),haloMat=new THREE.MeshStandardMaterial({color:0xeff5f7,emissive:0xe7f2f3,emissiveIntensity:1.35,roughness:.18,transparent:true,opacity:.95}),frameR=Math.min(faceW,faceH)*.065;g.add(roundedBox(faceW,faceH,proj,frameR,back,0,0,proj/2));g.add(roundedBox(Math.max(.06,faceW-.05),Math.max(.06,faceH-.05),.005,Math.max(.02,frameR*.72),haloMat,0,0,proj+.006,false));g.add(roundedBox(Math.max(.05,faceW-.12),Math.max(.05,faceH-.12),.006,Math.max(.018,frameR*.56),mats.mirror,0,0,proj+.011,false));const touch=new THREE.Mesh(new THREE.CircleGeometry(Math.max(.012,Math.min(faceW,faceH)*.018),24),new THREE.MeshStandardMaterial({color:0xf5fbff,emissive:0xe7f3f7,emissiveIntensity:.55,roughness:.25}));touch.position.set(0,-faceH*.34,proj+.015);g.add(touch);const glow=new THREE.PointLight(0xf4fbff,.30,1.4,2);glow.position.set(0,0,proj+.07);g.add(glow)}else if(style==="mirrorRound"||arezzo){const r=Math.min(faceW,faceH)/2,body=new THREE.Mesh(new THREE.CylinderGeometry(r,r,proj,72),edge);body.rotation.x=Math.PI/2;body.position.z=proj/2;body.castShadow=true;g.add(body);const face=new THREE.Mesh(new THREE.CircleGeometry(Math.max(.03,r-(arezzo?.018:.012)),80),mats.mirror);face.position.z=proj+.003;g.add(face);const haloMat=new THREE.MeshStandardMaterial({color:arezzo?0xddeeff:0xf6f1df,emissive:arezzo?0xbfdcff:0xeadfbd,emissiveIntensity:arezzo?2.4:.85,roughness:.25,transparent:true,opacity:.92}),halo=new THREE.Mesh(new THREE.TorusGeometry(r*(arezzo?.94:.98),arezzo?.010:.012,14,80),haloMat);halo.position.z=proj+.007;g.add(halo);if(arezzo){const glow=new THREE.PointLight(0xdfefff,.45,1.35,2);glow.position.set(0,0,proj+.06);g.add(glow)}}else{g.add(meshBox(faceW,faceH,proj,edge,0,0,proj/2));g.add(meshBox(Math.max(.04,faceW-.025),Math.max(.04,faceH-.025),.006,mats.mirror,0,0,proj+.004,false))}return setItemId(g,i.id)}


  function buildMadridTowelRail(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||450),d=Math.max(.040,mm(i.h||57)),h=mm(i.height||1200),z=mm(i.z||500),mat=accessoryMaterial(i,s,mats.anthracite,prod);
    const sideW=Math.max(.018,w*.055),sideD=Math.min(.032,d*.62),edge=w*.43;
    g.add(meshBox(sideW,h*.94,sideD,mat,-edge,z+h*.50,0));
    g.add(meshBox(sideW,h*.94,sideD,mat, edge,z+h*.50,0));
    const rows=[.08,.145,.21,.365,.43,.495,.56,.715,.78,.845,.91];
    rows.forEach(q=>g.add(roundedBox(w*.88,.032,Math.min(.034,d*.72),.004,mat,0,z+h*q,0)));
    const bracketMat=accessoryMaterial(i,s,new THREE.MeshStandardMaterial({color:0x242829,roughness:.65,metalness:.45}),prod);
    [-1,1].forEach(side=>[.22,.75].forEach(q=>g.add(meshBox(.025,.025,d*.75,bracketMat,side*edge,z+h*q,-d*.12,false))));
    return setItemId(g,i.id);
  }

  function buildSwivelRail(i,s,prod,count=2,mat=mats.mproSlate){
    mat=accessoryMaterial(i,s,mat,prod);
    const g=groupForItem(i),w=mm(i.w||446),d=Math.max(.12,mm(i.h||100)),h=Math.max(.07,mm(i.height||100)),z=mm(i.z||1050);
    const armLen=Math.max(.30,mm(prod?.armLengthMm||prod?.productLengthMm||446)),baseH=Math.max(.07,h),baseW=.028,back=-d/2+.018;
    g.add(roundedBox(.050,baseH,.030,.010,mat,-w*.43,z+baseH/2,back,false));
    const pivotX=-w*.43, pivotZ=back+.022;
    for(let n=0;n<count;n++){
      const yy=z+baseH*(.22+(count===1?0:n*(.56/Math.max(1,count-1))));
      const angle=(n-(count-1)/2)*(count===3?.12:.10);
      const arm=new THREE.Group();arm.position.set(pivotX,yy,pivotZ);arm.rotation.y=angle;
      const hinge=cylinder(.019,.040,mat,"y",28);hinge.position.y=0;arm.add(hinge);
      const rail=cylinder(.0105,armLen,mat,"z",22);rail.position.z=armLen/2;arm.add(rail);
      const cap=cylinder(.012,.016,mat,"z",22);cap.position.z=armLen;arm.add(cap);g.add(arm);
    }
    if(count===3){
      // Subtle knurled collars echo the Foundry detailing without overloading the scene.
      for(let n=0;n<3;n++){const yy=z+baseH*(.22+n*.28),ring=new THREE.Mesh(new THREE.TorusGeometry(.020,.0028,8,22),mat);ring.rotation.x=Math.PI/2;ring.position.set(pivotX,yy,pivotZ+.012);g.add(ring)}
    }
    return setItemId(g,i.id);
  }

  function buildCuskoShelf(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||800),d=mm(i.h||235),h=Math.max(.025,mm(i.height||38)),z=mm(i.z||1450),mat=mats.walnut;
    g.add(roundedBox(w,h,d,.006,mat,0,z+h/2,0));
    const underside=new THREE.MeshStandardMaterial({color:0x5d3d28,roughness:.78});
    g.add(meshBox(w*.94,.006,d*.91,underside,0,z+.004,0,false));
    return setItemId(g,i.id);
  }

  function leafMesh(len,width,material){
    const sh=new THREE.Shape();sh.moveTo(0,0);sh.quadraticCurveTo(width*.55,len*.22,width*.32,len*.48);sh.quadraticCurveTo(width*.18,len*.76,0,len);sh.quadraticCurveTo(-width*.18,len*.76,-width*.32,len*.48);sh.quadraticCurveTo(-width*.55,len*.22,0,0);
    const geo=new THREE.ShapeGeometry(sh,12),m=new THREE.Mesh(geo,material);m.castShadow=true;return m;
  }

  function buildHangingPlants(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||620),d=mm(i.h||180),h=mm(i.height||720),z=mm(i.z||900),potMat=mats.potBlack;
    const potY=z+h*.82, spacing=w/4, styles=[0,1,0,1];
    for(let pidx=0;pidx<4;pidx++){
      const px=-w*.375+pidx*spacing, pot=new THREE.Mesh(new THREE.CylinderGeometry(.055,.045,.105,28),potMat);pot.position.set(px,potY,0);pot.castShadow=true;g.add(pot);
      const vineCount=styles[pidx]?5:4;
      for(let v=0;v<vineCount;v++){
        const phase=(pidx+1)*1.7+v*.9,drop=h*(.38+.07*((v+pidx)%3)),side=(v-(vineCount-1)/2)*.026;
        const pts=[new THREE.Vector3(px+side,potY-.035,0),new THREE.Vector3(px+side+.025*Math.sin(phase),potY-drop*.35,.012*Math.cos(phase)),new THREE.Vector3(px+side-.020*Math.cos(phase),potY-drop*.72,.018*Math.sin(phase)),new THREE.Vector3(px+side+.030*Math.sin(phase*.7),potY-drop,.010)];
        g.add(tubePath(pts,.0036,mats.leafGreen,18));
        for(let q=1;q<=5;q++){
          const t=q/6,curve=new THREE.CatmullRomCurve3(pts),pos=curve.getPoint(t),leaf=leafMesh(.042,.018,(q+pidx)%2?mats.leafGreen:mats.leafGreen2);leaf.position.copy(pos);leaf.rotation.set(-.65,phase+t*5,.18*Math.sin(phase+q));leaf.scale.setScalar(.85+.12*((q+pidx)%2));g.add(leaf);
        }
      }
    }
    return setItemId(g,i.id);
  }

  function buildAloe(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||260),d=mm(i.h||260),h=mm(i.height||400),z=mm(i.z||0),potR=Math.min(w,d)*.23,potH=h*.26;
    const pot=new THREE.Mesh(new THREE.CylinderGeometry(potR*.90,potR,potH,32),new THREE.MeshStandardMaterial({color:0x7d6c59,roughness:.88}));pot.position.y=z+potH/2;pot.castShadow=true;g.add(pot);
    const soil=new THREE.Mesh(new THREE.CylinderGeometry(potR*.82,potR*.82,.015,28),new THREE.MeshStandardMaterial({color:0x443429,roughness:1}));soil.position.y=z+potH+.004;g.add(soil);
    const leafMat=new THREE.MeshStandardMaterial({color:0x4e8b55,roughness:.72,side:THREE.DoubleSide});
    const count=13;
    for(let n=0;n<count;n++){
      const a=n/count*Math.PI*2,outer=n%2===0,leafH=h*(outer?.60:.72),leafW=Math.min(w,d)*(outer?.10:.085),leaf=leafMesh(leafH,leafW,leafMat);
      leaf.position.set(Math.cos(a)*potR*.18,z+potH*.88,Math.sin(a)*potR*.18);
      leaf.rotation.order='YXZ';leaf.rotation.y=-a+Math.PI/2;leaf.rotation.x=outer?-.38:-.18;leaf.rotation.z=(n%3-1)*.06;g.add(leaf);
    }
    return setItemId(g,i.id);
  }

  function buildToiletRollHolder(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||200),d=mm(i.h||130),h=mm(i.height||511),z=mm(i.z||0),mat=accessoryMaterial(i,s,mats.mattBlack,prod);
    const baseH=.018;g.add(roundedBox(w,baseH,d,.012,mat,0,z+baseH/2,0));
    const postX=-w*.31,post=meshBox(.018,h*.82,.018,mat,postX,z+baseH+h*.41,0);g.add(post);
    const armLen=w*.55,arm=meshBox(armLen,.018,.018,mat,postX+armLen/2,z+h*.90,0);g.add(arm);
    const lip=meshBox(.018,.045,.018,mat,postX+armLen,z+h*.885,0);g.add(lip);
    const spareX=w*.22,spare=meshBox(.014,h*.50,.014,mat,spareX,z+baseH+h*.25,0);g.add(spare);
    // Two spare rolls so the 3D object reads immediately as a toilet-roll stand.
    for(let n=0;n<2;n++){
      const rollR=Math.min(.057,d*.42),rollH=.095,roll=new THREE.Mesh(new THREE.CylinderGeometry(rollR,rollR,rollH,36),mats.paperWhite);roll.rotation.z=Math.PI/2;roll.position.set(spareX,z+.105+n*(rollR*1.7),0);roll.castShadow=true;g.add(roll);
      const core=cylinder(.020,rollH+.004,mats.cardboard,"x",28);core.position.copy(roll.position);g.add(core);
    }
    return setItemId(g,i.id);
  }

  function buildToiletRoll(i,s,prod){
    const g=groupForItem(i),w=mm(i.w||100),d=mm(i.h||120),h=mm(i.height||120),z=mm(i.z||0),r=Math.max(.035,Math.min(d,h)/2),roll=new THREE.Mesh(new THREE.CylinderGeometry(r,r,w,48),mats.paperWhite);
    roll.rotation.z=Math.PI/2;roll.position.set(0,z+r,0);roll.castShadow=true;g.add(roll);
    const core=cylinder(Math.max(.015,r*.35),w+.004,mats.cardboard,"x",32);core.position.copy(roll.position);g.add(core);
    return setItemId(g,i.id);
  }

  function buildGeneric(i) {
    const g=groupForItem(i),w=mm(i.w),d=mm(i.h),h=mm(i.height||900),z=mm(i.z||0);
    g.add(meshBox(w,h,d,mats.timber,0,z+h/2,0));
    return setItemId(g,i.id);
  }

  function buildItem(i,s) {
    const prod=(s.products||[]).find(p=>p.id===i.productId),profile=productProfile(prod);
    if(profile==="trent-12004") return buildTrentTap(i,s,prod);
    if(profile==="madrid-33138") return buildMadridTowelRail(i,s,prod);
    if(profile==="crosswater-pro047t") return buildSwivelRail(i,s,prod,2,mats.mproSlate);
    if(profile==="foundry-fdy3strmb") return buildSwivelRail(i,s,prod,3,mats.mattBlack);
    if(profile==="goodhome-cusko-5059340670249") return buildCuskoShelf(i,s,prod);
    if(profile==="fake-hanging-plants-6313817070598") return buildHangingPlants(i,s,prod);
    if(profile==="aloe-vera-barbadensis") return buildAloe(i,s,prod);
    if(profile==="architeckt-trh-1269407") return buildToiletRollHolder(i,s,prod);
    if(profile==="generic-toilet-roll") return buildToiletRoll(i,s,prod);
    if(i.type==="niche") return buildNiche(i,s);
    if(i.type==="bath") return buildBath(i,s);
    if(i.type==="wc") return buildWC(i,s);
    if(i.type==="vanity") return buildVanity(i,s);
    if(i.type==="shower") return buildShower(i,s);
    if(i.type==="stud") return buildStud(i,s);
    if(i.type==="glassPanel") return buildGlassItem(i,s);
    if(i.type==="storage") return buildStorage(i,s);
    if(i.type==="radiator") return buildRadiator(i,s);
    if(i.type==="mirror") return buildMirror(i,s);
    if(i.type==="rainHead") return buildRainHead(i,s);
    if(i.type==="handset") return buildHandset(i,s);
    if(i.type==="showerControls") return buildShowerControls(i,s);
    return buildGeneric(i);
  }


  function clearGroup(g) {
    while(g.children.length){
      const o=g.children.pop();
      o.traverse?.(n=>{
        if(n.geometry) n.geometry.dispose?.();
        const materials=Array.isArray(n.material)?n.material:(n.material?[n.material]:[]);
        [...new Set(materials)].forEach(m=>{if(m&&!sharedMaterials.has(m))m.dispose?.()});
      });
    }
  }

  function rebuildScene(force=false) {
    const s=api.getState();
    if(!s) return;
    const sig=JSON.stringify({
      room:s.room,
      items:s.items,
      products:(s.products||[]).map(p=>({id:p.id,sku:p.sku,finish:p.finish,style:p.style,render3d:p.render3d,width:p.width,depth:p.depth,height:p.height})),
      tileProducts:(s.tileProducts||[]).map(t=>({id:t.id,w:t.width,h:t.height,finish:t.finish,dp:t.defaultPattern,imgKey:(t.image||"").length+":"+(t.image||"").slice(0,64),pKey:(t.patternImage||"").length+":"+(t.patternImage||"").slice(0,64)})),
      surfaceZones:(s.surfaceZones||[]).map(z=>({id:z.id,name:z.name,surface:z.surface,full:z.full,x1:z.x1,x2:z.x2,y1:z.y1,y2:z.y2,start:z.start,end:z.end,bottom:z.bottom,top:z.top,tileId:z.tileId,pattern:z.pattern,orientation:z.orientation,enabled:z.enabled,grout:z.grout,groutColor:z.groutColor,waste:z.waste})),
      floorBuild:s.floorBuild||{},
      structure:s.structure||{},
      heating:s.heating||{}
    });
    if(!force && sig===signature) return;
    signature=sig; room=s.room;
    clearGroup(root);clearGroup(wallRoot);clearGroup(surfaceRoot);clearGroup(structureRoot);clearGroup(itemRoot);clearGroup(fixedRoot);
    itemMeshes=[];
    buildFloor(s);buildWalls(s);buildSurfaceZones(s);buildStructure(s);
    (s.items||[]).forEach(i=>{
      const g=buildItem(i,s);
      itemRoot.add(g);
      itemMeshes.push(g);
    });
    target.set(mm(s.room.width)/2,.92,mm(s.room.depth)/2);
    updateCamera();
  }

  function updateCamera(){if(walkMode){camera.position.copy(walk.position);const cp=Math.cos(walk.pitch),dir=new THREE.Vector3(cp*Math.cos(walk.yaw),Math.sin(walk.pitch),cp*Math.sin(walk.yaw));camera.lookAt(walk.position.clone().add(dir))}else{camera.position.set(target.x+radius*Math.sin(phi)*Math.cos(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.sin(theta));camera.lookAt(target)}updateWallVisibility()}

  function updateWallVisibility() {
    if(!room)return;
    const W=mm(room.width),D=mm(room.depth),show=wallsToggle?.checked!==false,xray=floorXrayToggle?.checked===true;
    // Floor cutaway: remove only the finished floor/deck. Keep the room and fixtures
    // in place so the joists can be understood in context beneath the bathroom.
    root.visible=!xray;
    structureRoot.visible=xray;
    itemRoot.visible=true;
    fixedRoot.visible=true;
    structureRoot.children.forEach(m=>{
      if(m.userData?.structureKind==="deck"||m.userData?.structureKind==="heating")m.visible=!xray;
      else m.visible=xray;
    });
    Object.values(wallSets).flat().forEach(m=>m.visible=show);
    Object.entries(surfaceSets).forEach(([side,list])=>list.forEach(m=>m.visible=(side==="floor")?!xray:show));
    if(!show)return;
    const margin=.06;
    if(camera.position.x < -margin){ wallSets.left.forEach(m=>m.visible=false); surfaceSets.left.forEach(m=>m.visible=false); }
    if(camera.position.x > W+margin){ wallSets.right.forEach(m=>m.visible=false); surfaceSets.right.forEach(m=>m.visible=false); }
    if(camera.position.z < -margin){ wallSets.window.forEach(m=>m.visible=false); surfaceSets.window.forEach(m=>m.visible=false); }
    if(camera.position.z > D+margin){ wallSets.opposite.forEach(m=>m.visible=false); surfaceSets.opposite.forEach(m=>m.visible=false); }
  }

  function clampWalk(){const st=api.getState(),W=mm(st.room.width),D=mm(st.room.depth),pad=.08;walk.position.x=THREE.MathUtils.clamp(walk.position.x,pad,Math.max(pad,W-pad));walk.position.z=THREE.MathUtils.clamp(walk.position.z,pad,Math.max(pad,D-pad));walk.position.y=walk.eye}
  function walkBlocked(pos){
    const s=api.getState(),px=pos.x*1000,pz=pos.z*1000,pad=170;
    return (s.items||[]).some(i=>{if(["mirror","rainHead","handset","showerControls","niche","glassPanel","radiator"].includes(i.type))return false;if(i.type==="shower"&&(Number(i.height)||40)<120)return false;const d=itemDims(i),top=(Number(i.z)||0)+(Number(i.height)||0);if(top<250)return false;return px>=i.x-pad&&px<=i.x+d.w+pad&&pz>=i.y-pad&&pz<=i.y+d.d+pad});
  }
  function setWalkMode(on,resetPosition=true){if(on&&moveMode)stopMoveMode(true);if(on&&floorXrayToggle?.checked)setFloorXray(false,false);walkMode=!!on;if(walkMode&&resetPosition){const st=api.getState(),W=mm(st.room.width),D=mm(st.room.depth),doorZ=mm(st.room.door.before+st.room.door.width/2);walk.position.set(Math.max(.12,W-.20),walk.eye,THREE.MathUtils.clamp(doorZ,.12,Math.max(.12,D-.12)));walk.yaw=Math.PI;walk.pitch=-.04}if(walkthroughBtn){walkthroughBtn.classList.toggle("active3d",walkMode);walkthroughBtn.setAttribute("aria-pressed",walkMode?"true":"false");walkthroughBtn.textContent=walkMode?"Exit walkthrough":"Walkthrough"}walkControls?.classList.toggle("hidden",!walkMode);camera.fov=walkMode?62:48;camera.updateProjectionMatrix();status.textContent=walkMode?"Walkthrough · drag to look · arrows/WASD to move":"Visual 3D · tap a fixture to edit";updateCamera()}
  function walkStep(kind,amount=.14){if(!walkMode)return;const f=new THREE.Vector3(Math.cos(walk.yaw),0,Math.sin(walk.yaw)),r=new THREE.Vector3(-f.z,0,f.x),next=walk.position.clone();if(kind==="forward")next.addScaledVector(f,amount);else if(kind==="back")next.addScaledVector(f,-amount);else if(kind==="left")next.addScaledVector(r,-amount);else if(kind==="right")next.addScaledVector(r,amount);const before=walk.position.clone();walk.position.copy(next);clampWalk();if(walkBlocked(walk.position))walk.position.copy(before);updateCamera()}
  function stopWalkTimer(){if(walkTimer){clearInterval(walkTimer);walkTimer=null}}
  walkthroughBtn?.addEventListener("click",()=>setWalkMode(!walkMode,true));
  walkControls?.querySelectorAll("[data-walk]").forEach(btn=>{const start=e=>{e.preventDefault();stopWalkTimer();walkStep(btn.dataset.walk,.12);walkTimer=setInterval(()=>walkStep(btn.dataset.walk,.09),90)};btn.addEventListener("pointerdown",start);btn.addEventListener("pointerup",stopWalkTimer);btn.addEventListener("pointercancel",stopWalkTimer);btn.addEventListener("pointerleave",stopWalkTimer)});
  window.addEventListener("keydown",e=>{if(!walkMode||viewMode?.value!=="3d"||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||""))return;const m={ArrowUp:"forward",w:"forward",W:"forward",ArrowDown:"back",s:"back",S:"back",ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right"};if(m[e.key]){e.preventDefault();walkStep(m[e.key],.16)}});

  function setFromPosition(pos,tgt=null){
    if(tgt)target.copy(tgt);
    const v=pos.clone().sub(target);
    radius=Math.max(.8,v.length());
    phi=Math.acos(THREE.MathUtils.clamp(v.y/radius,-1,1));
    theta=Math.atan2(v.z,v.x);
    updateCamera();
  }

  function preset(name) {
    if(walkMode)setWalkMode(false,false);
    const s=api.getState(),W=mm(s.room.width),D=mm(s.room.depth),H=mm(s.room.ceiling);
    if(name==="door"){
      const dz=mm(s.room.door.before+s.room.door.width/2);
      setFromPosition(new THREE.Vector3(W+2.0,1.55,dz),new THREE.Vector3(W*.45,.95,D*.50));
    }else if(name==="window"){
      setFromPosition(new THREE.Vector3(W*.50,1.55,-2.05),new THREE.Vector3(W*.50,.95,D*.52));
    }else if(name==="top"){
      setFromPosition(new THREE.Vector3(W*.50,5.3,D*.50+.01),new THREE.Vector3(W*.50,0,D*.50));
    }else if(name==="underfloor"){
      const depth=mm(Math.max(120,Number(s.structure?.depth)||195));
      setFromPosition(new THREE.Vector3(W*.50,-Math.max(1.05,depth*3.8),D+1.55),new THREE.Vector3(W*.50,-depth*.45,D*.50));
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

  function rayFromClient(clientX,clientY){
    const r=canvas.getBoundingClientRect();
    mouse.x=((clientX-r.left)/r.width)*2-1;
    mouse.y=-((clientY-r.top)/r.height)*2+1;
    raycaster.setFromCamera(mouse,camera);
    return raycaster.ray;
  }

  function itemGroupById(id){return itemRoot.children.find(g=>g.userData?.itemId===id)||null}
  function replaceItemVisual(id){
    const state=api.getState(),item=state?.items?.find(i=>i.id===id);if(!item)return;
    const old=itemGroupById(id);if(old){itemRoot.remove(old);old.traverse?.(n=>{n.geometry?.dispose?.();const ms=Array.isArray(n.material)?n.material:(n.material?[n.material]:[]);[...new Set(ms)].forEach(m=>{if(m&&!sharedMaterials.has(m))m.dispose?.()})})}
    itemRoot.add(buildItem(item,state));
  }

  function isWallMountedMove(item){return !!item&&(item.type==="mirror"||item.type==="rainHead"||item.type==="handset"||item.type==="showerControls")}
  function mountPlaneInfo(item,s){
    const host=item.mountHost||item.mountWall||"left",W=mm(s.room.width),D=mm(s.room.depth);
    if(String(host).startsWith("stud:")){
      const stud=(s.items||[]).find(x=>x.id===String(host).slice(5)&&x.type==="stud");if(!stud)return null;
      const sd=itemDims(stud),rawW=mm(Number(stud.w)||900),rawD=mm(Number(stud.h)||100),yaw=-THREE.MathUtils.degToRad(Number(stud.rotation)||0),sign=(item.mountFace==="other"?-1:1)*studShowerFaceSign(stud,s),center=new THREE.Vector3(mm(stud.x+sd.w/2),0,mm(stud.y+sd.d/2)),normal=new THREE.Vector3(Math.sin(yaw)*sign,0,Math.cos(yaw)*sign),tangent=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),face=item.type==="glassPanel"?center.clone():center.clone().addScaledVector(normal,rawD/2+.002),plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,face);
      return {host,plane,alongFromPoint:p=>p.clone().sub(center).dot(tangent)*1000+(Number(stud.w)||900)/2};
    }
    if(host==="left"){const plane=new THREE.Plane(new THREE.Vector3(1,0,0),-.012);return{host,plane,alongFromPoint:p=>p.z*1000}}
    if(host==="right"){const plane=new THREE.Plane(new THREE.Vector3(1,0,0),-(W-.012));return{host,plane,alongFromPoint:p=>p.z*1000}}
    if(host==="window"){const plane=new THREE.Plane(new THREE.Vector3(0,0,1),-.012);return{host,plane,alongFromPoint:p=>p.x*1000}}
    const plane=new THREE.Plane(new THREE.Vector3(0,0,1),-(D-.012));return{host:"opposite",plane,alongFromPoint:p=>p.x*1000};
  }

  function startMoveMode(id){
    const item=api.getState()?.items?.find(i=>i.id===id);
    if(!item||item.locked||item.type==="niche")return;
    if(walkMode)setWalkMode(false,false);
    setFloorXray(false,false);
    moveMode={id};moveDrag=null;api.checkpoint?.();
    if(done3DMoveBtn)done3DMoveBtn.classList.remove("hidden");
    status.textContent=isWallMountedMove(item)
      ?`Move ${item.name} · drag along/up its mounting surface · Done moving when finished`
      :`Move ${item.name} · drag the item across the room · Done moving when finished`;
  }
  function stopMoveMode(saveNow=true){
    if(saveNow)api.persist?.();
    moveMode=null;moveDrag=null;
    if(done3DMoveBtn)done3DMoveBtn.classList.add("hidden");
    status.textContent="Visual 3D · tap a fixture to edit";
    api.refresh2D?.();rebuildScene(true);
  }
  done3DMoveBtn?.addEventListener("click",()=>stopMoveMode(true));
  window.BP3DView={startMove:startMoveMode,stopMove:()=>stopMoveMode(true),refresh:()=>rebuildScene(true)};
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{if(tab.dataset.tab!=="threeD"&&moveMode)stopMoveMode(true);if(tab.dataset.tab!=="threeD"&&walkMode)setWalkMode(false,false)}));

  function selectAt(clientX,clientY) {
    rayFromClient(clientX,clientY);
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
    if(moveMode&&pointers.size===1){
      rayFromClient(e.clientX,e.clientY);
      const hits=raycaster.intersectObjects(itemRoot.children,true);
      const hit=hits.find(h=>h.object.userData.itemId===moveMode.id);
      if(hit){
        const item=api.getState()?.items?.find(i=>i.id===moveMode.id);
        if(item){
          if(isWallMountedMove(item)){
            const info=mountPlaneInfo(item,api.getState()),pt=new THREE.Vector3();
            if(info&&raycaster.ray.intersectPlane(info.plane,pt)){
              const alongNow=Number(item.mountAlong)||0,centerY=mm((Number(item.z)||0)+(Number(item.height)||0)/2),hitAlong=info.alongFromPoint(pt);
              moveDrag={pointerId:e.pointerId,kind:"wall",host:info.host,plane:info.plane,alongFromPoint:info.alongFromPoint,offAlong:alongNow-hitAlong,offY:centerY-pt.y,moved:false};
            }
          }else{
            const forward=target.clone().sub(camera.position);forward.y=0;
            if(forward.lengthSq()<.0001)forward.set(0,0,-1);forward.normalize();
            const right=forward.clone().cross(new THREE.Vector3(0,1,0)).normalize();
            const r=canvas.getBoundingClientRect(),worldPerPixel=(2*Math.max(.8,radius)*Math.tan(THREE.MathUtils.degToRad(camera.fov*.5)))/Math.max(240,r.height);
            moveDrag={pointerId:e.pointerId,kind:"floor",startClientX:e.clientX,startClientY:e.clientY,startX:Number(item.x)||0,startY:Number(item.y)||0,rightX:right.x,rightZ:right.z,forwardX:forward.x,forwardZ:forward.z,scale:worldPerPixel*1000,moved:false};
          }
          if(moveDrag){drag=null;try{canvas.setPointerCapture(e.pointerId)}catch(_){};return}
        }
      }
    }
    if(pointers.size===1){drag=walkMode?{id:e.pointerId,x:e.clientX,y:e.clientY,walkYaw:walk.yaw,walkPitch:walk.pitch,moved:false}:{id:e.pointerId,x:e.clientX,y:e.clientY,theta,phi,moved:false};try{canvas.setPointerCapture(e.pointerId)}catch(_){}
    }else if(pointers.size===2){
      const p=[...pointers.values()];
      pinch={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),radius,fov:camera.fov};
      drag=null;
    }
  },{passive:false});

  canvas.addEventListener("pointermove",e=>{
    if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(moveDrag&&moveDrag.pointerId===e.pointerId&&moveMode){
      e.preventDefault();
      const item=api.getState()?.items?.find(i=>i.id===moveMode.id);
      if(item&&moveDrag.kind==="wall"){
        rayFromClient(e.clientX,e.clientY);const p=new THREE.Vector3();
        if(raycaster.ray.intersectPlane(moveDrag.plane,p)){
          const alongHit=moveDrag.alongFromPoint(p);
          const centerY=(p.y+moveDrag.offY)*1000;
          const res=api.moveWallItem3D?.(item.id,alongHit+moveDrag.offAlong,centerY-(Number(item.height)||0)/2);
          if(res){moveDrag.moved=true;replaceItemVisual(item.id);status.textContent=`Moving ${item.name} · ${res.along} mm along wall · ${res.z} mm above floor`;}
        }
      }else if(item&&moveDrag.kind==="floor"){
        const dx=e.clientX-moveDrag.startClientX,dy=e.clientY-moveDrag.startClientY;
        const wx=(moveDrag.rightX*dx + moveDrag.forwardX*(-dy))*moveDrag.scale;
        const wz=(moveDrag.rightZ*dx + moveDrag.forwardZ*(-dy))*moveDrag.scale;
        const res=api.moveItem3D?.(item.id,moveDrag.startX+wx,moveDrag.startY+wz);
        if(res){moveDrag.moved=true;const d=itemDims(item),g=itemGroupById(item.id);if(g)g.position.set(mm(res.x+d.w/2),g.position.y,mm(res.y+d.d/2));status.textContent=`Moving ${item.name} · ${res.x} mm from left · ${res.y} mm from window wall`;}
      }
      return;
    }
    if(pointers.size===2&&pinch){e.preventDefault();const p=[...pointers.values()],d=Math.max(20,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y));if(walkMode){camera.fov=THREE.MathUtils.clamp(pinch.fov*(pinch.d/d),42,76);camera.updateProjectionMatrix()}else radius=THREE.MathUtils.clamp(pinch.radius*pinch.d/d,1,8);updateCamera();return}
    if(drag&&drag.id===e.pointerId){e.preventDefault();const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.moved=true;if(walkMode){walk.yaw=drag.walkYaw-dx*.0065;walk.pitch=THREE.MathUtils.clamp(drag.walkPitch-dy*.0048,-1.05,1.05)}else{theta=drag.theta-dx*.008;phi=THREE.MathUtils.clamp(drag.phi-dy*.006,.12,(floorXrayToggle?.checked?3.02:1.52))}updateCamera()}
  },{passive:false});

  function endPointer(e){
    if(moveDrag&&moveDrag.pointerId===e.pointerId){
      pointers.delete(e.pointerId);
      if(moveDrag.moved){api.persist?.();api.refresh2D?.();rebuildScene(true)}
      moveDrag=null;
      const item=moveMode?api.getState()?.items?.find(i=>i.id===moveMode.id):null;
      if(item)status.textContent=`Move ${item.name} · drag again or tap Done moving`;
      return;
    }
    const was=drag&&drag.id===e.pointerId?drag:null;
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinch=null;
    if(was&&!was.moved&&!moveMode)selectAt(e.clientX,e.clientY);
    if(was)drag=null;
  }
  canvas.addEventListener("pointerup",endPointer);
  canvas.addEventListener("pointercancel",endPointer);
  canvas.addEventListener("wheel",e=>{e.preventDefault();if(walkMode)walkStep(e.deltaY>0?"back":"forward",.12);else{radius=THREE.MathUtils.clamp(radius*(e.deltaY>0?1.09:.92),1,8);updateCamera()}},{passive:false});

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
  function setFloorXray(on, moveCamera=true){
    if(on&&walkMode)setWalkMode(false,false);
    if(on&&moveMode)stopMoveMode(true);
    if(floorXrayToggle) floorXrayToggle.checked=!!on;
    if(floorXrayBtn){
      floorXrayBtn.classList.toggle("active",!!on);
      floorXrayBtn.setAttribute("aria-pressed",on?"true":"false");
      floorXrayBtn.textContent=on?"Restore floor":"Under floor";
    }
    updateWallVisibility();
    // Deliberately keep the current camera. This is a cutaway of the same room,
    // not a separate 'beams-only' scene.
    status.textContent=on?"Floor removed · fixtures stay visible · joists exposed":"Visual 3D · tap a fixture to edit";
  }
  floorXrayBtn?.addEventListener("click",()=>setFloorXray(!(floorXrayToggle?.checked),true));
  floorXrayToggle?.addEventListener("change",()=>setFloorXray(floorXrayToggle.checked,true));

  document.getElementById("viewDoor")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d"){setFloorXray(false,false);preset("door")}},0));
  document.getElementById("viewWindow")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d"){setFloorXray(false,false);preset("window")}},0));
  document.getElementById("viewTop")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d"){setFloorXray(false,false);preset("top")}},0));
  document.getElementById("viewReset")?.addEventListener("click",()=>setTimeout(()=>{if(viewMode.value==="3d"){setFloorXray(false,false);preset("reset")}},0));

  window.addEventListener("resize",resize);

  // Keep the renderer in sync with edits made in Plan/Product/Project.
  setInterval(()=>{
    if(viewMode?.value==="3d"){
      if(!moveDrag)rebuildScene(false);
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
  setFloorXray(false,false);
  syncViewMode();
  animate();
}
