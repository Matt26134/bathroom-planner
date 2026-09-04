window.addEventListener("error",e=>{const b=document.getElementById("bootError");if(b){b.textContent="Planner error: "+(e.message||"Unknown error")+". Your saved data has not been deleted.";b.classList.remove("hidden")}});
(function(){
"use strict";
const VERSION="2.5.1", KEY="bathroomPlannerStable";
const $=id=>document.getElementById(id), svg=$("planSvg");
const clone=o=>JSON.parse(JSON.stringify(o));

const starter={
 version:VERSION,
 schemaVersion:6,
 projectId:"bathroom-redesign-main",
 createdAt:"2026-08-26T00:00:00.000Z",
 updatedAt:"2026-08-26T00:00:00.000Z",
 project:{name:"Bathroom Redesign",planName:"Current working layout",notes:"Confirm final survey dimensions after strip-out before ordering fitted items."},
 room:{width:2280,depth:2545,ceiling:2470,tolerance:20,window:{before:660,width:930,after:690,sill:900,height:960},door:{before:835,width:860,leafWidth:762,after:850,height:1981,hinge:"bottom",swingDirection:"in",openAngle:26}},
 ui:{measureMode:"selected",snap:true,planLayer:"layout"},
 items:[
  {id:"bath1",type:"bath",name:"Bath",x:0,y:0,w:1600,h:700,rotation:0,locked:false,z:0,height:550},
  {id:"wc1",type:"wc",name:"New WC",x:1830,y:25,w:370,h:640,rotation:0,locked:false,z:0,height:800},
  {id:"vanity1",type:"vanity",name:"Floor-standing vanity",x:0,y:700,w:450,h:970,rotation:0,locked:false,z:0,height:850},
  {id:"stud1",type:"stud",name:"Half-height stud wall",x:0,y:1670,w:900,h:100,rotation:0,locked:false,z:0,height:1100},
  {id:"glass1",type:"glassPanel",name:"Fluted shower glass",x:0,y:1715,w:900,h:10,rotation:0,locked:false,z:1100,height:1000,mountHost:"free",glassStyle:"fluted",glassTrimFinish:"matt-black",glassPrivacy:"light",glassThickness:10},
  {id:"shower1",type:"shower",name:"Walk-in shower",x:0,y:1745,w:1400,h:800,rotation:0,locked:false,z:0,height:40,showerMountSide:"right"},
  {id:"storage1",type:"storage",name:"Tall storage",x:1460,y:2295,w:300,h:250,rotation:0,locked:false,z:0,height:1800},
  {id:"rad1",type:"radiator",name:"Towel radiator",x:2180,y:1900,w:100,h:520,rotation:0,locked:false,z:650,height:1200},
  {id:"n1",type:"niche",name:"Large shampoo niche",x:120,y:1680,w:380,h:70,rotation:0,locked:false,z:950,height:450},
  {id:"n2",type:"niche",name:"Decorative bottle niche",x:20,y:2050,w:70,h:420,rotation:0,locked:false,z:1200,height:300}
 ],

 products:[
  {
   id:"prod-lille-800",
   name:"Lille 800mm Wall Hung 2 Drawer Vanity & Ceramic Basin",
   brand:"Bath Lab",
   supplier:"Bath Lab",
   sku:"LIL2726C",
   type:"vanity",
   mounting:"wall",
   finish:"Antique Oak Woodgrain",
   style:"vanity2drawer",
   render3d:{profile:"auto",finish:"auto"},
   width:805,
   depth:460,
   height:539,
   defaultZ:300,
   url:"https://www.bathlab.co.uk/products/lille-800mm-wall-hung-2-drawer-vanity-unit-minimalist-ceramic-basin-antique-oak-woodgrain",
   notes:"Vitreous china basin, 1 tap hole, two soft-close drawers. Starter mounting height can be edited.",
   image:"./lille-product.webp",
   builtIn:true
  }
 ],
 tileProducts:[
  {id:"tile-laurito-3060",name:"Laurito White Marble Effect Wall & Floor Tiles 300 x 600mm",supplier:"Victorian Plumbing",sku:"LAU3060",finish:"White marble effect",width:300,height:600,tilesPerBox:7,wall:true,floor:true,pricePerBox:31.44,pricePerM2:24.95,defaultPattern:"stack",image:"./laurito-tile.webp",builtIn:true},
  {id:"tile-granley-pink",name:"Granley Rustic Pink Gloss Wall Tiles 70 x 280mm",supplier:"Victorian Plumbing",sku:"GRN728PNK",finish:"Rustic pink gloss",width:70,height:280,tilesPerBox:30,wall:true,floor:false,pricePerBox:29.47,pricePerM2:49.95,defaultPattern:"herringbone",image:"./granley-pink-tile.webp",patternImage:"./granley-pink-herringbone.png",builtIn:true}
 ],
 surfaceZones:[
  {id:"zone-floor",name:"Main floor",surface:"floor",full:true,x1:0,x2:2280,y1:0,y2:2545,tileId:"tile-laurito-3060",pattern:"stack",orientation:"landscape",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
  {id:"zone-window-wall",name:"Window wall",surface:"window",full:true,start:0,end:2280,bottom:0,top:2470,tileId:"tile-laurito-3060",pattern:"stack",orientation:"landscape",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
  {id:"zone-back-wall",name:"Far wall / opposite window",surface:"opposite",full:true,start:0,end:2280,bottom:0,top:2470,tileId:"tile-laurito-3060",pattern:"stack",orientation:"landscape",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
  {id:"zone-left-wall",name:"Vanity wall / opposite door",surface:"left",full:true,start:0,end:2545,bottom:0,top:2470,tileId:"tile-laurito-3060",pattern:"stack",orientation:"landscape",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
  {id:"zone-door-wall",name:"Door wall",surface:"right",full:true,start:0,end:2545,bottom:0,top:2470,tileId:"tile-laurito-3060",pattern:"stack",orientation:"landscape",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
  {id:"zone-vanity-feature",name:"Vanity feature wall",surface:"left",full:false,start:700,end:1670,bottom:900,top:2470,tileId:"tile-granley-pink",pattern:"herringbone",orientation:"landscape",grout:2,groutColor:"#f4efed",waste:12,enabled:true}
 ],
 wallFixtures:[],
 floorBuild:{layers:[
   {id:"floor-tile",name:"Floor tile",thickness:9,enabled:true},
   {id:"floor-adhesive",name:"Tile adhesive",thickness:5,enabled:true},
   {id:"floor-membrane",name:"Tanking / decoupling membrane",thickness:2,enabled:true},
   {id:"floor-ufh",name:"UFH layer",thickness:4,enabled:false},
   {id:"floor-backer",name:"Tile backer board",thickness:6,enabled:true}
 ]},
 structure:{direction:"window-door",spacing:400,width:47,depth:195,offset:100,deckThickness:18,showGenerated:true,manualJoists:[],noggins:[]},
 heating:{enabled:false,type:"electric-mat",outputWm2:150,margin:100,excludeFixtures:true,thermostatWall:"left"},
 services:[],
 manualMeasurements:[]
};

let state;
try{
  const parsed=JSON.parse(localStorage.getItem(KEY)||"null");
  state=parsed||clone(starter);
}catch(e){state=clone(starter)}
state = state && typeof state==="object" ? state : clone(starter);
const hadDoorLeafWidth=state?.room?.door?.leafWidth!=null;
state.project = {...clone(starter.project), ...(state.project||{})};
state.room = {...clone(starter.room), ...(state.room||{})};
state.room.window = {...clone(starter.room.window), ...(state.room.window||{})};
state.room.door = {...clone(starter.room.door), ...(state.room.door||{})};
if(!["in","out"].includes(state.room.door.swingDirection)) state.room.door.swingDirection="in";
if(!Array.isArray(state.items)) state.items=[];
state.ui=state.ui||{};
if(!state.ui.measureMode) state.ui.measureMode="selected";
if(state.ui.snap==null) state.ui.snap=true;
if(!state.ui.planLayer) state.ui.planLayer="layout";
state.schemaVersion=6;
if(!state.projectId) state.projectId="project-"+Date.now().toString(36);
if(!state.createdAt) state.createdAt=new Date().toISOString();
if(!state.updatedAt) state.updatedAt=new Date().toISOString();
if(!state.floorBuild||!Array.isArray(state.floorBuild.layers)) state.floorBuild=clone(starter.floorBuild);
state.structure={...clone(starter.structure),...(state.structure||{})};
if(!Array.isArray(state.structure.noggins)) state.structure.noggins=[];
if(!Array.isArray(state.structure.manualJoists)) state.structure.manualJoists=[];
if(state.structure.showGenerated==null) state.structure.showGenerated=true;
state.heating={...clone(starter.heating),...(state.heating||{})};
if(!Array.isArray(state.services)) state.services=[];
if(!Array.isArray(state.products))state.products=[];
if(!state.products.some(p=>p.id==="prod-lille-800")){
 state.products.unshift(clone(starter.products[0]));
}
function ensureProduct3D(p){
 if(!p||typeof p!=="object")return p;
 p.render3d={profile:"auto",finish:"auto",...(p.render3d||{})};
 return p;
}
state.products.forEach(ensureProduct3D);
if(!Array.isArray(state.tileProducts)) state.tileProducts=[];
(starter.tileProducts||[]).forEach(t=>{ const existing=state.tileProducts.find(x=>x.id===t.id); if(existing){ if(existing.builtIn!==false) Object.assign(existing, clone(t), {image: existing.image || t.image}); } else state.tileProducts.push(clone(t)); });
if(!Array.isArray(state.surfaceZones)) state.surfaceZones=[];
if(!state.surfaceZones.length) state.surfaceZones=clone(starter.surfaceZones);
if(!Array.isArray(state.wallFixtures)) state.wallFixtures=[];
state.migrations=state.migrations||{};
if(!state.migrations.showerFixturesToItemsV21){
 const oldFixtures=state.wallFixtures.slice();
 const rain=oldFixtures.find(f=>f.type==="rainHead");
 const hand=oldFixtures.find(f=>f.type==="handset");
 const controls=oldFixtures.find(f=>f.type==="controls");
 if(rain&&!state.items.some(i=>i.id==="rainHead1"||i.type==="rainHead")){
  const projection=Math.max(120,Number(rain.projection)||320),diameter=300,along=Number(rain.along)||2140;
  state.items.push({id:"rainHead1",type:"rainHead",name:rain.name||"Rain shower head",x:0,y:Math.max(0,along-diameter/2),w:projection,h:diameter,rotation:0,locked:false,z:Math.max(0,(Number(rain.height)||2080)-135),height:180,finish:"matt-black"});
 }
 if(hand&&!state.items.some(i=>i.id==="handset1"||i.type==="handset")){
  const along=Number(hand.along)||2320;
  state.items.push({id:"handset1",type:"handset",name:hand.name||"Hand shower",x:0,y:Math.max(0,along-45),w:90,h:90,rotation:0,locked:false,z:Math.max(0,Number(hand.bottom)||1050),height:Math.max(180,Number(hand.height)||720),finish:"matt-black"});
 }
 if(controls&&!state.items.some(i=>i.id==="showerControls1"||i.type==="showerControls")){
  const stud=state.items.find(i=>i.id===(controls.hostItemId||"stud1"))||state.items.find(i=>i.type==="stud");
  const cx=Number(controls.along)||620,sy=stud?Number(stud.y)+Number(stud.h||100):1700;
  state.items.push({id:"showerControls1",type:"showerControls",name:controls.name||"Shower controls",x:Math.max(0,cx-75),y:sy-20,w:150,h:40,rotation:0,locked:false,z:Math.max(0,Number(controls.bottom)||950),height:200,finish:"matt-black"});
 }
 state.wallFixtures=[];
 state.migrations.showerFixturesToItemsV21=true;
}
state.wallFixtures=[];

// V2.4: wall-mounted items use one host model and shower glass becomes its own item.
if(!state.migrations.wallMountModelV24){
 const stud=state.items.find(i=>i.type==="stud");
 state.items.forEach(i=>{
  if(i.type==="mirror"){
   i.mountHost=i.mountHost||i.mountWall||"left";
   i.mountAlong=Number.isFinite(Number(i.mountAlong))?Number(i.mountAlong):(Number(i.y)||0)+(Number(i.w)||500)/2;
  }else if(i.type==="rainHead"){
   i.mountHost=i.mountHost||"left"; i.mountAlong=Number.isFinite(Number(i.mountAlong))?Number(i.mountAlong):(Number(i.y)||0)+(Number(i.h)||300)/2; i.mountFace=i.mountFace||"shower";
  }else if(i.type==="handset"){
   i.mountHost=i.mountHost||"left"; i.mountAlong=Number.isFinite(Number(i.mountAlong))?Number(i.mountAlong):(Number(i.y)||0)+(Number(i.h)||90)/2; i.mountFace=i.mountFace||"shower";
  }else if(i.type==="showerControls"){
   if(!i.mountHost&&stud){i.mountHost="stud:"+stud.id;i.mountAlong=Math.max(0,(Number(i.x)||0)-(Number(stud.x)||0)+(Number(i.w)||150)/2);i.mountFace="shower"}
   else {i.mountHost=i.mountHost||"left";i.mountAlong=Number.isFinite(Number(i.mountAlong))?Number(i.mountAlong):(Number(i.y)||0)+50;i.mountFace=i.mountFace||"shower"}
  }
 });
 state.migrations.wallMountModelV24=true;
}
if(!state.migrations.independentGlassV24){
 const hasGlass=state.items.some(i=>i.type==="glassPanel");
 if(!hasGlass){
  const stud=state.items.find(i=>i.type==="stud");
  if(stud&&(stud.glassStyle||"fluted")!=="none"){
   const z=(Number(stud.z)||0)+(Number(stud.height)||1100),glassH=Math.max(300,Math.min(1000,(Number(state.room.ceiling)||2470)-z-80));
   const glass={id:"glass-"+stud.id,type:"glassPanel",name:(stud.glassStyle||"fluted")==="plain"?"Clear shower glass":"Fluted shower glass",x:Number(stud.x)||0,y:Number(stud.y)||0,w:Math.max(200,Number(stud.w)||900),h:10,rotation:Number(stud.rotation)||0,locked:false,z,height:glassH,mountHost:"free",glassStyle:stud.glassStyle||"fluted",glassTrimFinish:stud.glassTrimFinish||"matt-black",glassPrivacy:"light",glassThickness:10};placeGlassAboveStud(glass,stud);state.items.push(glass);
  }
 }
 state.items.filter(i=>i.type==="stud").forEach(i=>{delete i.glassStyle;delete i.glassTrimFinish});
 state.migrations.independentGlassV24=true;
}

if(!Array.isArray(state.manualMeasurements)) state.manualMeasurements=[];
const HEIGHT_DEFAULTS={bath:[0,550],wc:[0,800],vanity:[0,850],shower:[0,40],stud:[0,1100],glassPanel:[1100,1000],storage:[0,1800],radiator:[650,1200],mirror:[1150,800],niche:[1000,400],rainHead:[1945,180],handset:[1050,720],showerControls:[950,200],custom:[0,900]};
function migrateHeights(){
 if(state.version!==VERSION && Number(state.room.ceiling)===2400) state.room.ceiling=2470;
 if(!state.room.window)state.room.window={before:660,width:930,after:690};
 if(state.room.window.sill==null)state.room.window.sill=900;
 if(state.room.window.height==null)state.room.window.height=960;
 if(!state.room.door)state.room.door={before:835,width:860,after:850};
 if(state.room.door.height==null)state.room.door.height=1981;
 if(!state.room.door.hinge) state.room.door.hinge="bottom";
 if(state.room.door.openAngle==null) state.room.door.openAngle=26;
 if(!hadDoorLeafWidth) state.room.door.leafWidth=Math.min(Math.max(100,Number(state.room.door.width||860)*.92),800);
 state.room.door.leafWidth=Math.max(100,Math.min(Number(state.room.door.width)||860,Number(state.room.door.leafWidth)||762));
 state.items.forEach(i=>{
   const d=HEIGHT_DEFAULTS[i.type]||[0,900];
   if(i.z==null)i.z=d[0];
   if(i.height==null)i.height=d[1];
 });
 state.services.forEach(s=>{if(s.z==null)s.z=300});
}
migrateHeights();

state.items.forEach(i=>{
 const r=((Number(i.rotation)||0)%360+360)%360;
 i.rotation=Math.round(r*10)/10;
});

const WALL_MOUNT_TYPES=new Set(["mirror","rainHead","handset","showerControls"]);
function isStudHost(host){return String(host||"").startsWith("stud:")}
function hostStud(host){return isStudHost(host)?state.items.find(x=>x.id===String(host).slice(5)&&x.type==="stud"):null}
function nearestShowerFaceSign2D(stud){
 const sh=state.items.filter(o=>o.type==="shower").sort((a,b)=>{const A=box(a),B=box(b),S=box(stud),cx=S.x1+S.w/2,cy=S.y1+S.h/2;return Math.hypot(A.x1+A.w/2-cx,A.y1+A.h/2-cy)-Math.hypot(B.x1+B.w/2-cx,B.y1+B.h/2-cy)})[0];
 if(!sh)return 1;const sd=itemDims(sh),cx=stud.x+itemDims(stud).w/2,cy=stud.y+itemDims(stud).h/2,dx=sh.x+sd.w/2-cx,dy=sh.y+sd.h/2-cy,a=-((Number(stud.rotation)||0)*Math.PI/180),sn=Math.sin(a),cs=Math.cos(a),localY=-dx*sn+dy*cs;return localY>=0?1:-1;
}
function mountPlanSpan(i){if(i.type==="mirror")return Math.max(40,Number(i.w)||500);if(i.type==="rainHead")return Math.max(60,Number(i.h)||300);if(i.type==="showerControls")return Math.max(60,Number(i.w)||150);return Math.max(50,Number(i.w)||90)}
function mountAlongFromPlan(i,x=i.x,y=i.y){
 if(!i)return Number(i?.mountAlong)||0;
 const host=i.mountHost||i.mountWall||"left",d=itemDims(i),cx=Number(x)+d.w/2,cy=Number(y)+d.h/2;
 if(isStudHost(host)){
  const stud=hostStud(host);if(!stud)return Number(i.mountAlong)||0;
  const sd=itemDims(stud),scx=Number(stud.x)+sd.w/2,scy=Number(stud.y)+sd.h/2,a=(Number(stud.rotation)||0)*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),px=cx-scx,py=cy-scy,localX=px*cs-py*sn,span=Math.max(20,Number(stud.w)||900),half=Math.min(span/2,mountPlanSpan(i)/2);
  return Math.max(half,Math.min(span-half,localX+span/2));
 }
 const span=(host==="left"||host==="right")?state.room.depth:state.room.width,half=Math.min(span/2,mountPlanSpan(i)/2),along=(host==="left"||host==="right")?cy:cx;
 return Math.max(half,Math.min(span-half,along));
}
function syncMountedItemPlan(i){
 if(!i)return;
 const host=i.mountHost||i.mountWall||"left";i.mountHost=host;if(i.type==="mirror"&&!isStudHost(host)&&host!=="free")i.mountWall=host;
 let along=Number(i.mountAlong);if(!Number.isFinite(along))along=(host==="left"||host==="right")?state.room.depth/2:state.room.width/2;
 if(isStudHost(host)){
  const stud=hostStud(host);if(!stud)return;const rawW=Math.max(20,Number(stud.w)||900),rawD=Math.max(20,Number(stud.h)||100),span=rawW,half=Math.min(span/2,mountPlanSpan(i)/2);
  along=Math.max(half,Math.min(span-half,along));i.mountAlong=along;i.mountFace=i.mountFace||"shower";
  const face=(i.mountFace==="other"?-1:1)*nearestShowerFaceSign2D(stud),a=-((Number(stud.rotation)||0)*Math.PI/180),cs=Math.cos(a),sn=Math.sin(a),lx=along-rawW/2,ly=i.type==="glassPanel"?0:face*(rawD/2+Math.max(5,Number(i.h)||10)/2),cx=Number(stud.x)+itemDims(stud).w/2,cy=Number(stud.y)+itemDims(stud).h/2;
  const wx=cx+lx*cs-ly*sn,wy=cy+lx*sn+ly*cs;i.rotation=Number(stud.rotation)||0;const d=itemDims(i);i.x=Math.round(wx-d.w/2);i.y=Math.round(wy-d.h/2);return;
 }
 const span=(host==="left"||host==="right")?state.room.depth:state.room.width,half=mountPlanSpan(i)/2;along=Math.max(half,Math.min(span-half,along));i.mountAlong=along;
 if(host==="left"){i.rotation=90;const d=itemDims(i);i.x=0;i.y=Math.round(along-d.h/2)}
 else if(host==="right"){i.rotation=270;const d=itemDims(i);i.x=Math.round(state.room.width-d.w);i.y=Math.round(along-d.h/2)}
 else if(host==="window"){i.rotation=0;const d=itemDims(i);i.y=0;i.x=Math.round(along-d.w/2)}
 else {i.rotation=180;const d=itemDims(i);i.y=Math.round(state.room.depth-d.h);i.x=Math.round(along-d.w/2)}
}
function syncMirrorPlanFromMount(i){if(i&&i.type==="mirror"){i.mountHost=i.mountHost||i.mountWall||"left";syncMountedItemPlan(i)}}
function placeGlassAboveStud(i,stud=null){
 if(!i||i.type!=="glassPanel")return i;
 stud=stud||state.items.find(x=>x.type==="stud");if(!stud)return i;
 i.mountHost="free";delete i.mountAlong;delete i.mountFace;
 i.rotation=Number(stud.rotation)||0;
 i.w=Math.max(100,Number(i.w)||Number(stud.w)||900);
 i.h=Math.max(6,Number(i.glassThickness)||Number(i.h)||10);
 i.glassThickness=i.h;
 i.z=(Number(stud.z)||0)+(Number(stud.height)||1100);
 const sd=itemDims(stud),gd=itemDims(i),cx=Number(stud.x)+sd.w/2,cy=Number(stud.y)+sd.h/2;
 i.x=Math.round(cx-gd.w/2);i.y=Math.round(cy-gd.h/2);
 return i;
}
state.items.forEach(i=>{if(WALL_MOUNT_TYPES.has(i.type)){if(!i.mountHost)i.mountHost=i.type==="mirror"?(i.mountWall||"left"):"left";syncMountedItemPlan(i)}});
// V2.4.3: recover the simpler V2.2 glass behaviour. Glass is a free, directly draggable plan object.
if(!state.migrations.glassRecoveryV243){
 state.items.filter(i=>i.type==="glassPanel").forEach(i=>{
  if(i.mountHost&&i.mountHost!=="free"){
   const stud=hostStud(i.mountHost);if(stud){syncMountedItemPlan(i);i.rotation=Number(stud.rotation)||i.rotation||0;}
  }
  i.mountHost="free";delete i.mountAlong;delete i.mountFace;
  i.glassStyle=i.glassStyle||"fluted";i.glassTrimFinish=i.glassTrimFinish||"matt-black";i.glassPrivacy=i.glassPrivacy||"light";i.glassThickness=Math.max(6,Number(i.glassThickness)||Number(i.h)||10);i.h=i.glassThickness;
 });
 state.migrations.glassRecoveryV243=true;
}




let selected={kind:null,id:null};
let history=[],future=[];
let drag=null,serviceDrag=null,pan=null,pinch=null;
let activePointers=new Map();
let baseView=null,view=null;
let snapFeedback=null;
let manualMode=false,manualFirst=null;
let exactDetailsPinned=true;

const sEl=(tag,a={})=>{const e=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e};
function itemDims(i){
 const w=Math.max(0,Number(i.w)||0),h=Math.max(0,Number(i.h)||0),a=(((Number(i.rotation)||0)%360)+360)%360*Math.PI/180;
 const c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
 return{w:w*c+h*s,h:w*s+h*c};
}
function rawItemDims(i){return{w:Math.max(0,Number(i.w)||0),h:Math.max(0,Number(i.h)||0)}}
function box(i){const d=itemDims(i);return{x1:i.x,y1:i.y,x2:i.x+d.w,y2:i.y+d.h,w:d.w,h:d.h}}
const overlap1D=(a1,a2,b1,b2)=>Math.min(a2,b2)-Math.max(a1,b1)>0;
const collide=(a,b)=>{const A=box(a),B=box(b);return A.x1<B.x2&&A.x2>B.x1&&A.y1<B.y2&&A.y2>B.y1};
const floorItems=()=>state.items.filter(i=>!["niche","mirror","rainHead","handset","showerControls","glassPanel"].includes(i.type));

function ensurePlanVariants(){
 if(!Array.isArray(state.planVariants)||!state.planVariants.length){
  const id="plan-"+Date.now().toString(36);
  state.planVariants=[{id,name:state.project?.planName||"Current working layout",items:clone(state.items||[]),services:clone(state.services||[]),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}];
  state.activePlanId=id;
 }
 if(!state.activePlanId||!state.planVariants.some(v=>v.id===state.activePlanId))state.activePlanId=state.planVariants[0].id;
 state.planVariants.forEach(v=>{if(!Array.isArray(v.items))v.items=[];if(!Array.isArray(v.services))v.services=[];if(!v.name)v.name="Plan";});
}
function activePlanVariant(){ensurePlanVariants();return state.planVariants.find(v=>v.id===state.activePlanId)||state.planVariants[0]}
function syncWorkingToActivePlan(){const v=activePlanVariant();if(!v)return;v.name=state.project?.planName||v.name||"Plan";v.items=clone(state.items||[]);v.services=clone(state.services||[]);v.updatedAt=new Date().toISOString();}
function loadPlanVariant(id){
 syncWorkingToActivePlan();const v=state.planVariants.find(x=>x.id===id);if(!v)return;
 state.activePlanId=v.id;state.items=clone(v.items||[]);state.services=clone(v.services||[]);state.project.planName=v.name||"Plan";
 selected={kind:null,id:null};closeObjectSheet();history=[];future=[];save();sync();resetView(false);render();renderPlanVariants();
 if(window.BP3DView?.refresh)window.BP3DView.refresh();
}
ensurePlanVariants();
function save(){syncWorkingToActivePlan();state.version=VERSION;state.schemaVersion=6;state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state))}
function checkpoint(){history.push(clone(state));if(history.length>60)history.shift();future=[];updateUndoRedo()}
function updateUndoRedo(){$("undoBtn").disabled=!history.length;$("redoBtn").disabled=!future.length}
function undo(){if(!history.length)return;future.push(clone(state));state=history.pop();selected={kind:null,id:null};save();sync();resetView(false);render();updateUndoRedo()}
function redo(){if(!future.length)return;history.push(clone(state));state=future.pop();selected={kind:null,id:null};save();sync();resetView(false);render();updateUndoRedo()}

function makeBaseView(){
 const r=state.room,outExtra=r.door?.swingDirection==="out"?Math.max(0,Number(r.door.leafWidth)||0)+180:0;
 return{x:-330,y:-280,w:Math.max(2920+outExtra,r.width+700+outExtra),h:Math.max(3180,r.depth+620)};
}
function ensureView(){if(!baseView)baseView=makeBaseView();if(!view)view={...baseView}}
function currentZoom(){ensureView();return baseView.w/view.w}
function applyView(){ensureView();svg.setAttribute("viewBox",`${view.x} ${view.y} ${view.w} ${view.h}`);$("zoomRead").textContent=Math.round(currentZoom()*100)+"%"}
function clampView(){
 ensureView();
 const maxZ=5,minW=baseView.w/maxZ,minH=baseView.h/maxZ;
 if(view.w>baseView.w||view.h>baseView.h){view={...baseView};return}
 if(view.w<minW||view.h<minH){
  const cx=view.x+view.w/2,cy=view.y+view.h/2;
  view.w=minW;view.h=minH;view.x=cx-minW/2;view.y=cy-minH/2;
 }
 const mx=220,my=220;
 view.x=Math.min(Math.max(view.x,baseView.x-mx),baseView.x+baseView.w-view.w+mx);
 view.y=Math.min(Math.max(view.y,baseView.y-my),baseView.y+baseView.h-view.h+my);
}
function pointFromClient(x,y){const p=svg.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(svg.getScreenCTM().inverse())}
function point(e){return pointFromClient(e.clientX,e.clientY)}
function zoomAt(clientX,clientY,factor){
 ensureView();
 const p=pointFromClient(clientX,clientY),ow=view.w,oh=view.h;
 let nw=Math.max(baseView.w/5,Math.min(baseView.w,ow/factor));
 let nh=Math.max(baseView.h/5,Math.min(baseView.h,oh/factor));
 const rx=(p.x-view.x)/ow,ry=(p.y-view.y)/oh;
 view.x=p.x-rx*nw;view.y=p.y-ry*nh;view.w=nw;view.h=nh;clampView();applyView();render()
}
function resetView(doRender=true){baseView=makeBaseView();view={...baseView};applyView();if(doRender)render()}

function drawGrid(){
 const z=currentZoom();
 const minor=z<1.5?100:z<2.7?50:25;
 const major=minor*5;
 const r=state.room;
 for(let x=0;x<=r.width;x+=minor){
  svg.appendChild(sEl("line",{x1:x,y1:0,x2:x,y2:r.depth,class:(x%major===0?"gridMajor":"gridMinor")}));
 }
 for(let y=0;y<=r.depth;y+=minor){
  svg.appendChild(sEl("line",{x1:0,y1:y,x2:r.width,y2:y,class:(y%major===0?"gridMajor":"gridMinor")}));
 }
}

function doorGeometry(){
 const r=state.room,y1=Number(r.door.before)||0,frame=Math.max(100,Number(r.door.width)||100),y2=y1+frame;
 const leaf=Math.max(100,Math.min(frame,Number(r.door.leafWidth)||Math.min(frame*.92,800)));
 const inset=Math.max(0,(frame-leaf)/2),hinge=r.door.hinge||"bottom",hy=hinge==="top"?y1+inset:y2-inset,swingDirection=r.door.swingDirection==="out"?"out":"in";
 return{y1,y2,frame,leaf,inset,hx:r.width,hy,hinge,swingDirection,side:swingDirection==="out"?1:-1,closedY:hinge==="top"?hy+leaf:hy-leaf};
}
function doorSwingConflict(item){
 if(state.room.door.swingDirection==="out")return false;
 if(["niche","mirror","rainHead","handset","showerControls","glassPanel"].includes(item.type))return false;
 const b=box(item),g=doorGeometry();
 const qx=Math.min(Math.max(g.hx,b.x1),b.x2);
 const qy=Math.min(Math.max(g.hy,b.y1),b.y2);
 if(qx>g.hx)return false;
 if(g.hinge==="top"&&qy<g.hy)return false;
 if(g.hinge!=="top"&&qy>g.hy)return false;
 return Math.hypot(qx-g.hx,qy-g.hy)<g.leaf;
}

function nearestInDirection(item,dir){
 const b=box(item),r=state.room;
 let best;
 if(dir==="left") best={kind:"wall",gap:b.x1,coord:0,label:"Vanity wall / opposite door"};
 if(dir==="right")best={kind:"wall",gap:r.width-b.x2,coord:r.width,label:"Door wall"};
 if(dir==="up")best={kind:"wall",gap:b.y1,coord:0,label:"Window wall"};
 if(dir==="down")best={kind:"wall",gap:r.depth-b.y2,coord:r.depth,label:"Far wall / opposite window"};
 for(const o of floorItems()){
  if(o.id===item.id)continue;
  const B=box(o),A=b;let gap=null;
  if(dir==="left"&&overlap1D(A.y1,A.y2,B.y1,B.y2)&&B.x2<=A.x1)gap=A.x1-B.x2;
  if(dir==="right"&&overlap1D(A.y1,A.y2,B.y1,B.y2)&&B.x1>=A.x2)gap=B.x1-A.x2;
  if(dir==="up"&&overlap1D(A.x1,A.x2,B.x1,B.x2)&&B.y2<=A.y1)gap=A.y1-B.y2;
  if(dir==="down"&&overlap1D(A.x1,A.x2,B.x1,B.x2)&&B.y1>=A.y2)gap=B.y1-A.y2;
  if(gap!==null&&gap>=0&&gap<best.gap)best={kind:"item",gap,item:o,label:o.name};
 }
 return best;
}
function warningInfo(item){
 const list=[];
 if(["niche","mirror","rainHead","handset","showerControls","glassPanel"].includes(item.type)){const b=box(item),r=state.room;if(b.x1<-5||b.y1<-5||b.x2>r.width+5||b.y2>r.depth+5)list.push("Extends outside the room.");return list;}
 for(const o of floorItems()){
  if(o.id===item.id||!collide(item,o))continue;
  const intentional=(item.type==="stud"&&o.type==="shower")||(item.type==="shower"&&o.type==="stud");
  if(!intentional)list.push("Overlaps "+o.name+".");
 }
 const b=box(item),r=state.room;
 if(b.x1<0||b.y1<0||b.x2>r.width||b.y2>r.depth)list.push("Extends outside the room.");
 if(doorSwingConflict(item))list.push("Conflicts with the door swing.");
 const t=Number(r.tolerance)||0;
 ["left","right","up","down"].forEach(d=>{
  const n=nearestInDirection(item,d);
  if(n&&n.gap>0&&n.gap<t)list.push(`${Math.round(n.gap)} mm clearance to ${n.label} — below ${t} mm tolerance.`);
 });
 return list;
}
function itemStatusClass(item){
 if(["niche","mirror","rainHead","handset","showerControls","glassPanel"].includes(item.type))return"";
 if(floorItems().some(o=>{
  if(o.id===item.id||!collide(item,o))return false;
  return !((item.type==="stud"&&o.type==="shower")||(item.type==="shower"&&o.type==="stud"));
 }))return" overlap";
 if(doorSwingConflict(item))return" tolerance";
 const t=Number(state.room.tolerance)||0;
 if(["left","right","up","down"].some(d=>{const n=nearestInDirection(item,d);return n&&n.gap>0&&n.gap<t}))return" tolerance";
 return"";
}

function render(){
 svg.innerHTML="";
 const defs=sEl("defs");
 defs.innerHTML='<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-opacity=".055"/></filter>';
 svg.appendChild(defs);
 const r=state.room;
 applyView();
 svg.appendChild(sEl("rect",{x:0,y:0,width:r.width,height:r.depth,class:"roomfill"}));
 drawGrid();
 if(window.BPBuild?.drawPlanLayer) window.BPBuild.drawPlanLayer(svg,state);
 svg.appendChild(sEl("rect",{x:0,y:0,width:r.width,height:r.depth,class:"wallOuter"}));
 svg.appendChild(sEl("rect",{x:10,y:10,width:Math.max(0,r.width-20),height:Math.max(0,r.depth-20),class:"wallInner"}));
 drawOpenings();
 state.items.forEach(drawItem);
 state.services.forEach(drawService);
 drawDimensions();
 drawManualMeasurements();
 drawSnapFeedback();
 if(manualFirst)drawMeasureFirstPoint();
 updateSurveyStatus();
 $("planName").textContent=state.project.planName||"Plan";
 if($("selectionDetailsBtn"))$("selectionDetailsBtn").classList.toggle("hidden",!selected.kind);
}

function drawOpenings(){
 const r=state.room;
 const win=sEl("line",{x1:r.window.before,y1:0,x2:r.window.before+r.window.width,y2:0,class:"window","data-opening":"window"});
 win.addEventListener("pointerdown",openingDown);svg.appendChild(win);
 const g=doorGeometry();
 svg.appendChild(sEl("line",{x1:r.width,y1:g.y1,x2:r.width,y2:g.y2,stroke:"#fffefa","stroke-width":12,"vector-effect":"non-scaling-stroke"}));
 const closedY=g.closedY,baseSweep=g.hinge==="top"?0:1,sweep=g.side>0?(baseSweep?0:1):baseSweep,openX=g.hx+g.side*g.leaf;
 if(g.inset>0){svg.appendChild(sEl("rect",{x:g.hx-14,y:g.y1,width:14,height:g.inset,class:"doorFrame"}));svg.appendChild(sEl("rect",{x:g.hx-14,y:g.y2-g.inset,width:14,height:g.inset,class:"doorFrame"}));}
 [g.y1+g.inset,g.y2-g.inset].forEach(y=>svg.appendChild(sEl("line",{x1:g.hx-22,y1:y,x2:g.hx+5,y2:y,stroke:"#686b64","stroke-width":3,"vector-effect":"non-scaling-stroke"})));
 const zone=sEl("path",{d:`M ${g.hx} ${g.hy} L ${openX} ${g.hy} A ${g.leaf} ${g.leaf} 0 0 ${sweep} ${g.hx} ${closedY} Z`,class:"doorZone"});svg.appendChild(zone);
 const ang=Math.max(0,Math.min(120,Number(state.room.door.openAngle)||0))*Math.PI/180,dir=g.hinge==="top"?1:-1;
 const leafEndX=g.hx+g.side*g.leaf*Math.sin(ang),leafEndY=g.hy+dir*g.leaf*Math.cos(ang);
 const leaf=sEl("line",{x1:g.hx,y1:g.hy,x2:leafEndX,y2:leafEndY,class:"door","data-opening":"door"});leaf.addEventListener("pointerdown",openingDown);svg.appendChild(leaf);
 const arc=sEl("path",{d:`M ${openX} ${g.hy} A ${g.leaf} ${g.leaf} 0 0 ${sweep} ${g.hx} ${closedY}`,class:"door","stroke-dasharray":"9 7","data-opening":"door"});arc.addEventListener("pointerdown",openingDown);svg.appendChild(arc);
}


function itemVisualFrame(i){
 const d=itemDims(i),raw=rawItemDims(i),cx=Number(i.x)+d.w/2,cy=Number(i.y)+d.h/2;
 return{d,raw,cx,cy,x:cx-raw.w/2,y:cy-raw.h/2,angle:((Number(i.rotation)||0)%360+360)%360};
}
function drawOrientationMarker(i,raw,parent,x,y){
 if(i.type==="niche"||i.type==="stud"||i.type==="radiator"||WALL_MOUNT_TYPES.has(i.type)||i.type==="glassPanel")return;
 const x1=x+raw.w/2,y1=y+raw.h/2,len=Math.min(55,Math.max(26,Math.min(raw.w,raw.h)*.16)),x2=x1,y2=Math.min(y+raw.h-12,y1+len);
 parent.appendChild(sEl("line",{x1,y1,x2,y2,stroke:"#55777f","stroke-width":"3","vector-effect":"non-scaling-stroke","pointer-events":"none"}));
 parent.appendChild(sEl("circle",{cx:x2,cy:y2,r:8,fill:"#55777f","pointer-events":"none"}));
}

function drawItem(i){
 const f=itemVisualFrame(i),d=f.d,raw=f.raw,b=box(i),status=itemStatusClass(i),g=sEl("g",{transform:`rotate(${f.angle} ${f.cx} ${f.cy})`});
 const rect=sEl("rect",{x:f.x,y:f.y,width:raw.w,height:raw.h,rx:i.type==="wc"?Math.min(65,raw.w*.18):7,class:`fixture ${i.type}${selected.kind==="item"&&selected.id===i.id?" selected":""}${status}`,"data-id":i.id});
 rect.addEventListener("pointerdown",itemDown);g.appendChild(rect);

 if(i.type==="bath")g.appendChild(sEl("rect",{x:f.x+40,y:f.y+40,width:Math.max(20,raw.w-80),height:Math.max(20,raw.h-80),rx:95,class:"archLine"}));
 if(i.type==="wc"){
  g.appendChild(sEl("rect",{x:f.x+raw.w*.24,y:f.y+28,width:raw.w*.52,height:raw.h*.28,rx:12,class:"archLine"}));
  g.appendChild(sEl("ellipse",{cx:f.x+raw.w/2,cy:f.y+raw.h*.62,rx:raw.w*.32,ry:raw.h*.24,class:"archLine"}));
 }
 if(i.type==="vanity")g.appendChild(sEl("ellipse",{cx:f.x+raw.w/2,cy:f.y+Math.min(raw.h*.22,160),rx:raw.w*.27,ry:Math.min(72,raw.h*.1),class:"archLine"}));
 if(i.type==="shower")g.appendChild(sEl("circle",{cx:f.x+raw.w*.18,cy:f.y+raw.h*.72,r:28,class:"archLine"}));
 if(i.type==="glassPanel"){
  const cy=f.y+raw.h/2,hit=sEl("rect",{x:f.x,y:f.y-35,width:raw.w,height:raw.h+70,fill:"transparent","data-id":i.id,style:"cursor:grab"});hit.addEventListener("pointerdown",itemDown);g.appendChild(hit);
  g.appendChild(sEl("line",{x1:f.x,y1:cy,x2:f.x+raw.w,y2:cy,class:"glass"}));
  if((i.glassStyle||"fluted")==="fluted"){
   const count=Math.min(30,Math.max(4,Math.floor(raw.w/35)));
   for(let n=1;n<count;n++){const xx=f.x+raw.w*n/count;g.appendChild(sEl("line",{x1:xx,y1:cy-12,x2:xx,y2:cy+12,class:"glassReed"}))}
  }
 }
 if(i.type==="radiator"){for(let yy=f.y+22;yy<f.y+raw.h-18;yy+=42)g.appendChild(sEl("line",{x1:f.x+12,y1:yy,x2:f.x+raw.w-12,y2:yy,class:"archLine"}))}
 if(i.type==="rainHead"){
  g.appendChild(sEl("line",{x1:f.x+10,y1:f.y+raw.h/2,x2:f.x+raw.w*.72,y2:f.y+raw.h/2,class:"archLine"}));
  g.appendChild(sEl("circle",{cx:f.x+raw.w*.78,cy:f.y+raw.h/2,r:Math.max(18,Math.min(raw.h*.34,65)),class:"archLine"}));
 }
 if(i.type==="handset"){
  g.appendChild(sEl("line",{x1:f.x+raw.w*.28,y1:f.y+12,x2:f.x+raw.w*.28,y2:f.y+raw.h-12,class:"archLine"}));
  g.appendChild(sEl("line",{x1:f.x+raw.w*.45,y1:f.y+raw.h*.25,x2:f.x+raw.w*.78,y2:f.y+raw.h*.70,class:"archLine"}));
 }
 if(i.type==="showerControls"){
  g.appendChild(sEl("circle",{cx:f.x+raw.w*.34,cy:f.y+raw.h/2,r:Math.max(7,Math.min(18,raw.h*.24)),class:"archLine"}));
  g.appendChild(sEl("circle",{cx:f.x+raw.w*.66,cy:f.y+raw.h/2,r:Math.max(7,Math.min(18,raw.h*.24)),class:"archLine"}));
 }
 if(i.type==="mirror"){
  const oval=sEl("ellipse",{cx:f.x+raw.w/2,cy:f.y+raw.h/2,rx:Math.max(10,raw.w*.44),ry:Math.max(10,raw.h*.44),fill:"#eef4f4",stroke:"#8aa1a6","stroke-width":"2","vector-effect":"non-scaling-stroke","data-id":i.id,style:"cursor:grab"});oval.addEventListener("pointerdown",itemDown);g.appendChild(oval);
 }
 productItemDetails2D(i,raw,g,f.x,f.y);drawOrientationMarker(i,raw,g,f.x,f.y);svg.appendChild(g);

 const z=currentZoom();
 if(d.w>240&&d.h>110){
  const tx=sEl("text",{x:f.cx,y:f.cy-12,class:"label"});tx.textContent=i.name;svg.appendChild(tx);
  if(z>1.1){const s=sEl("text",{x:f.cx,y:f.cy+33,class:"subLabel"});s.textContent=`${Math.round(raw.w)} × ${Math.round(raw.h)} · ${Math.round(f.angle)}°`;svg.appendChild(s)}
 }else if(z>1.45){const tx=sEl("text",{x:b.x2+18,y:f.cy,class:"outsideLabel"});tx.textContent=i.name;svg.appendChild(tx)}
 if(warningInfo(i).length){const badge=sEl("circle",{cx:b.x2-18,cy:b.y1+18,r:14,class:"warningBadge"});svg.appendChild(badge);const ex=sEl("text",{x:b.x2-18,y:b.y1+21,"text-anchor":"middle","font-size":"20","font-weight":"900",fill:"#9a6d29"});ex.textContent="!";svg.appendChild(ex)}
}

function serviceColor(type){return{hot:"#b6695f",cold:"#6e92ad",waste:"#6d706b",soil:"#4e514b",electric:"#b49b50"}[type]||"#6d706b"}
function drawService(s){
 const g=sEl("g",{class:"service","data-service-id":s.id});
 const c=sEl("circle",{cx:s.x,cy:s.y,r:28,fill:"#fffefa",stroke:serviceColor(s.type),"data-service-id":s.id});
 c.addEventListener("pointerdown",serviceDown);g.appendChild(c);
 const dot=sEl("circle",{cx:s.x,cy:s.y,r:8,fill:serviceColor(s.type),"pointer-events":"none"});g.appendChild(dot);
 if(currentZoom()>1.15){const t=sEl("text",{x:s.x+38,y:s.y+9});t.textContent=s.name;g.appendChild(t)}
 svg.appendChild(g);
}

function dimLine(x1,y1,x2,y2,label,kind="detail"){
 const cls=kind==="selected"?"dimSelected":kind==="overview"?"dim":"dimDetail";
 const tcls=kind==="selected"?"dimTextSelected":kind==="overview"?"dimText":"dimTextDetail";
 svg.appendChild(sEl("line",{x1,y1,x2,y2,class:cls}));
 const tick=14;
 if(Math.abs(x2-x1)>=Math.abs(y2-y1)){
  svg.appendChild(sEl("line",{x1,y1:y1-tick,x2:x1,y2:y1+tick,class:cls}));
  svg.appendChild(sEl("line",{x1:x2,y1:y2-tick,x2:x2,y2:y2+tick,class:cls}));
 }else{
  svg.appendChild(sEl("line",{x1:x1-tick,y1,x2:x1+tick,y2:y1,class:cls}));
  svg.appendChild(sEl("line",{x1:x2-tick,y1:y2,x2:x2+tick,y2:y2,class:cls}));
 }
 const t=sEl("text",{x:(x1+x2)/2,y:(y1+y2)/2-8,class:tcls,"text-anchor":"middle"});t.textContent=label;svg.appendChild(t);
}
function drawOverviewDims(){
 const r=state.room;
 dimLine(0,-135,r.width,-135,`${r.width} mm`,"overview");
 dimLine(-135,0,-135,r.depth,`${r.depth} mm`,"overview");
 if(currentZoom()>=1.05){
  const wb=r.window.before,ww=r.window.width,wa=r.window.after,y=-65;
  if(wb>0)dimLine(0,y,wb,y,`${wb}`,"overview");
  dimLine(wb,y,wb+ww,y,`${ww} window`,"overview");
  if(wa>0)dimLine(wb+ww,y,r.width,y,`${wa}`,"overview");
  const d=r.door,x=r.width+70;
  if(d.before>0)dimLine(x,0,x,d.before,`${d.before}`,"overview");
  dimLine(x,d.before,x,d.before+d.width,`${d.width} door`,"overview");
  if(d.after>0)dimLine(x,d.before+d.width,x,r.depth,`${d.after}`,"overview");
 }
}
function relationKey(a,b,axis){return[a,b].sort().join("|")+"|"+axis}
function drawNearestForItem(i,seen,kind){
 const A=box(i);
 ["left","right","up","down"].forEach(dir=>{
  const n=nearestInDirection(i,dir);if(!n||n.gap<0)return;
  const axis=(dir==="left"||dir==="right")?"x":"y";
  if(n.kind==="item"){
   const key=relationKey(i.id,n.item.id,axis);if(seen.has(key))return;seen.add(key);
   const B=box(n.item);
   if(axis==="x"){
    const y=(Math.max(A.y1,B.y1)+Math.min(A.y2,B.y2))/2;
    if(dir==="left")dimLine(B.x2,y,A.x1,y,`${Math.round(n.gap)} mm`,kind);
    else dimLine(A.x2,y,B.x1,y,`${Math.round(n.gap)} mm`,kind);
   }else{
    const x=(Math.max(A.x1,B.x1)+Math.min(A.x2,B.x2))/2;
    if(dir==="up")dimLine(x,B.y2,x,A.y1,`${Math.round(n.gap)} mm`,kind);
    else dimLine(x,A.y2,x,B.y1,`${Math.round(n.gap)} mm`,kind);
   }
  }else{
   const key=i.id+"|"+dir;if(seen.has(key))return;seen.add(key);
   if(dir==="left"&&n.gap>0)dimLine(0,A.y1+A.h*.25,A.x1,A.y1+A.h*.25,`${Math.round(n.gap)} mm`,kind);
   if(dir==="right"&&n.gap>0)dimLine(A.x2,A.y1+A.h*.25,state.room.width,A.y1+A.h*.25,`${Math.round(n.gap)} mm`,kind);
   if(dir==="up"&&n.gap>0)dimLine(A.x1+A.w*.28,0,A.x1+A.w*.28,A.y1,`${Math.round(n.gap)} mm`,kind);
   if(dir==="down"&&n.gap>0)dimLine(A.x1+A.w*.28,A.y2,A.x1+A.w*.28,state.room.depth,`${Math.round(n.gap)} mm`,kind);
  }
 });
}
function drawDoorNearest(){
 const g=doorGeometry(),items=floorItems();
 let best=null;
 for(const i of items){
  const b=box(i);
  const x=Math.min(Math.max(g.hx,b.x1),b.x2),y=Math.min(Math.max((g.y1+g.y2)/2,b.y1),b.y2);
  const d=Math.hypot(g.hx-x,(g.y1+g.y2)/2-y);
  if(!best||d<best.d)best={i,b,x,y,d};
 }
 if(best&&best.d>0&&best.d<1800)dimLine(g.hx,(g.y1+g.y2)/2,best.x,best.y,`${Math.round(best.d)} mm`,"detail");
}
function drawDimensions(){
 drawOverviewDims();
 const mode=state.ui.measureMode||"selected",seen=new Set();
 if(mode==="selected"&&selected.kind==="item"){
  const i=state.items.find(x=>x.id===selected.id);if(i)drawNearestForItem(i,seen,"selected");
 }
 if(mode==="all"){
  floorItems().forEach(i=>drawNearestForItem(i,seen,"detail"));
  drawDoorNearest();
 }
}

function drawManualMeasurements(){
 for(const m of state.manualMeasurements){
  svg.appendChild(sEl("line",{x1:m.x1,y1:m.y1,x2:m.x2,y2:m.y2,class:"measureLine"}));
  svg.appendChild(sEl("circle",{cx:m.x1,cy:m.y1,r:8,class:"measurePoint"}));
  svg.appendChild(sEl("circle",{cx:m.x2,cy:m.y2,r:8,class:"measurePoint"}));
  const t=sEl("text",{x:(m.x1+m.x2)/2,y:(m.y1+m.y2)/2-10,class:"measureText","text-anchor":"middle"});t.textContent=`${Math.round(m.length)} mm`;svg.appendChild(t);
 }
 $("clearMeasuresBtn").classList.toggle("hidden",!state.manualMeasurements.length);
}
function drawMeasureFirstPoint(){svg.appendChild(sEl("circle",{cx:manualFirst.x,cy:manualFirst.y,r:10,class:"measurePoint"}))}
function snapMeasurePoint(p){
 const z=currentZoom(),th=28/Math.max(1,z*.7),r=state.room;
 const xs=[0,r.width,r.window.before,r.window.before+r.window.width],ys=[0,r.depth,r.door.before,r.door.before+r.door.width];
 state.items.forEach(i=>{const b=box(i);xs.push(b.x1,b.x2);ys.push(b.y1,b.y2)});
 state.services.forEach(s=>{xs.push(s.x);ys.push(s.y)});
 let x=p.x,y=p.y,bx=null,by=null,dx=Infinity,dy=Infinity;
 xs.forEach(v=>{const d=Math.abs(v-p.x);if(d<dx){dx=d;bx=v}});
 ys.forEach(v=>{const d=Math.abs(v-p.y);if(d<dy){dy=d;by=v}});
 if(dx<th)x=bx;if(dy<th)y=by;
 if(manualFirst){
  if(Math.abs(x-manualFirst.x)<th*1.4)x=manualFirst.x;
  if(Math.abs(y-manualFirst.y)<th*1.4)y=manualFirst.y;
 }
 return{x,y};
}
function handleMeasureTap(e){
 const p=snapMeasurePoint(point(e));
 if(!manualFirst){manualFirst=p;$("measureBanner").textContent="Tap the second point";render();return}
 checkpoint();
 const len=Math.hypot(p.x-manualFirst.x,p.y-manualFirst.y);
 if(len>1)state.manualMeasurements.push({id:"m"+Date.now(),x1:manualFirst.x,y1:manualFirst.y,x2:p.x,y2:p.y,length:len});
 manualFirst=null;manualMode=false;$("measureBanner").classList.remove("show");$("manualMeasureBtn").classList.remove("primary");save();render();
}

function drawSnapFeedback(){
 if(!snapFeedback)return;
 const f=snapFeedback;
 if(f.axis==="x")svg.appendChild(sEl("line",{x1:f.coord,y1:0,x2:f.coord,y2:state.room.depth,class:"snapGuide"}));
 else svg.appendChild(sEl("line",{x1:0,y1:f.coord,x2:state.room.width,y2:f.coord,class:"snapGuide"}));
 const t=sEl("text",{x:f.axis==="x"?f.coord+20:state.room.width/2,y:f.axis==="y"?f.coord-15:state.room.depth/2,class:"snapText","text-anchor":f.axis==="y"?"middle":"start"});t.textContent=f.label;svg.appendChild(t);
}

function openingDown(e){
 if(activePointers.size>1)return;
 e.preventDefault();
 if(manualMode){handleMeasureTap(e);return}
 selected={kind:"opening",id:e.currentTarget.dataset.opening};closeObjectSheet();render();
}
function itemDown(e){
 if(activePointers.size>1)return;
 e.preventDefault();
 if(manualMode){handleMeasureTap(e);return}
 const i=state.items.find(x=>x.id===e.currentTarget.dataset.id);if(!i)return;
 selected={kind:"item",id:i.id};closeObjectSheet();
 if(i.locked){render();return}
 const p=point(e);drag={id:i.id,pointerId:e.pointerId,sx:p.x,sy:p.y,x:i.x,y:i.y,moved:false,checkpointed:false};
 try{svg.setPointerCapture(e.pointerId)}catch(_){}
 render();
}
function serviceDown(e){
 if(activePointers.size>1)return;
 e.preventDefault();
 if(manualMode){handleMeasureTap(e);return}
 const s=state.services.find(x=>x.id===e.currentTarget.dataset.serviceId);if(!s)return;
 selected={kind:"service",id:s.id};closeObjectSheet();
 const p=point(e);serviceDrag={id:s.id,pointerId:e.pointerId,sx:p.x,sy:p.y,x:s.x,y:s.y,moved:false,checkpointed:false};
 try{svg.setPointerCapture(e.pointerId)}catch(_){}
 render();
}
function moveItem(e){
 if(!drag||e.pointerId!==drag.pointerId)return false;
 e.preventDefault();const i=state.items.find(x=>x.id===drag.id);if(!i)return false;
 const p=point(e),d=itemDims(i);let x=Math.round(drag.x+p.x-drag.sx),y=Math.round(drag.y+p.y-drag.sy);
 if(Math.abs(x-drag.x)>1||Math.abs(y-drag.y)>1){
  if(!drag.checkpointed){checkpoint();drag.checkpointed=true}drag.moved=true;
 }
 snapFeedback=null;
 if(WALL_MOUNT_TYPES.has(i.type)&&i.mountHost){
  const host=i.mountHost,snap=55/currentZoom(),vanity=state.items.find(o=>o.type==="vanity");
  if(isStudHost(host)){
   const stud=hostStud(host);if(stud){const sd=itemDims(stud),cx=stud.x+sd.w/2,cy=stud.y+sd.h/2,a=(Number(stud.rotation)||0)*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),px=x+d.w/2-cx,py=y+d.h/2-cy,localX=px*cs-py*sn;i.mountAlong=Math.round(Math.max(0,Math.min(Number(stud.w)||900,localX+(Number(stud.w)||900)/2)));syncMountedItemPlan(i);render();return true;}
  }else if(host==="left"||host==="right"){
   i.mountAlong=Math.round(Math.max(0,Math.min(state.room.depth,y+d.h/2)));
   if(i.type==="mirror"&&vanity){const vd=itemDims(vanity),target=vanity.y+vd.h/2;if(Math.abs(i.mountAlong-target)<snap){i.mountAlong=Math.round(target);snapFeedback={axis:"y",coord:i.mountAlong,label:"Centred over vanity"}}}
   syncMountedItemPlan(i);render();return true;
  }else{
   i.mountAlong=Math.round(Math.max(0,Math.min(state.room.width,x+d.w/2)));
   if(i.type==="mirror"&&vanity){const vd=itemDims(vanity),target=vanity.x+vd.w/2;if(Math.abs(i.mountAlong-target)<snap){i.mountAlong=Math.round(target);snapFeedback={axis:"x",coord:i.mountAlong,label:"Centred over vanity"}}}
   syncMountedItemPlan(i);render();return true;
  }
 }
 if(state.ui.snap!==false){
  const s=28/currentZoom();
  const tryX=(candidate,label)=>{if(Math.abs(x-candidate)<s){x=candidate;snapFeedback={axis:"x",coord:candidate,label}}};
  const tryXRight=(candidate,label)=>{if(Math.abs(x+d.w-candidate)<s){x=candidate-d.w;snapFeedback={axis:"x",coord:candidate,label}}};
  const tryY=(candidate,label)=>{if(Math.abs(y-candidate)<s){y=candidate;snapFeedback={axis:"y",coord:candidate,label}}};
  const tryYBottom=(candidate,label)=>{if(Math.abs(y+d.h-candidate)<s){y=candidate-d.h;snapFeedback={axis:"y",coord:candidate,label}}};
  tryX(0,"Snapped to wall");tryY(0,"Snapped to wall");tryXRight(state.room.width,"Snapped to wall");tryYBottom(state.room.depth,"Snapped to wall");
  for(const o of state.items){
   if(o.id===i.id)continue;const b=box(o);
   tryX(b.x2,`Aligned to ${o.name}`);tryXRight(b.x1,`Aligned to ${o.name}`);
   tryY(b.y2,`Aligned to ${o.name}`);tryYBottom(b.y1,`Aligned to ${o.name}`);
  }
 }
 i.x=x;i.y=y;render();return true;
}
function moveService(e){
 if(!serviceDrag||e.pointerId!==serviceDrag.pointerId)return false;
 e.preventDefault();const s=state.services.find(x=>x.id===serviceDrag.id);if(!s)return false;
 const p=point(e);const nx=Math.round(serviceDrag.x+p.x-serviceDrag.sx),ny=Math.round(serviceDrag.y+p.y-serviceDrag.sy);
 if(Math.abs(nx-serviceDrag.x)>1||Math.abs(ny-serviceDrag.y)>1){
  if(!serviceDrag.checkpointed){checkpoint();serviceDrag.checkpointed=true}serviceDrag.moved=true;
 }
 s.x=nx;s.y=ny;render();return true;
}
function endDrags(e){
 if(drag&&e.pointerId===drag.pointerId){try{svg.releasePointerCapture(e.pointerId)}catch(_){}if(drag.moved)save();drag=null;snapFeedback=null;render()}
 if(serviceDrag&&e.pointerId===serviceDrag.pointerId){try{svg.releasePointerCapture(e.pointerId)}catch(_){}if(serviceDrag.moved)save();serviceDrag=null;render()}
}


function facingName(rotation){
 const r=((Number(rotation)||0)%360+360)%360;
 if(Math.abs(r-0)<.1||Math.abs(r-360)<.1)return "far wall / opposite window";
 if(Math.abs(r-90)<.1)return "vanity wall / opposite door";
 if(Math.abs(r-180)<.1)return "window wall";
 if(Math.abs(r-270)<.1)return "door wall";
 return `${Math.round(r)}° angle`;
}

function refreshMountHostOptions(i){
 const sel=$("itemMountHost");if(!sel)return;
 const roomOpts=[
  ["left","Vanity wall / opposite door"],["right","Door wall"],["window","Window wall"],["opposite","Far wall / opposite window"]
 ];
 const opts=[];
 if(i?.type==="glassPanel")opts.push(["free","Free-positioned"]);
 opts.push(...roomOpts);
 if(i?.type!=="mirror")state.items.filter(x=>x.type==="stud").forEach(s=>opts.push(["stud:"+s.id,s.name||"Stud wall"]));
 sel.innerHTML="";opts.forEach(([v,l])=>{const o=document.createElement("option");o.value=v;o.textContent=l;sel.appendChild(o)});
 const fallback=i?.type==="showerControls"&&state.items.some(x=>x.type==="stud")?"stud:"+state.items.find(x=>x.type==="stud").id:"left";
 const value=i?.mountHost||i?.mountWall||fallback;if([...sel.options].some(o=>o.value===value))sel.value=value;else sel.value=fallback;
}

function openSelectedSheet(){
 const sheet=$("objectSheet");sheet.classList.remove("hidden");
 $("rotateBtn").classList.remove("hidden");$("rotateMinusBtn").classList.remove("hidden");$("rotatePlusBtn").classList.remove("hidden");$("centreMirrorBtn").classList.add("hidden");$("alignGlassBtn").classList.add("hidden");$("move3DBtn").classList.remove("hidden");$("itemRotationWrap").classList.remove("hidden");$("itemMirrorWallWrap").classList.add("hidden");$("itemMirrorAlongWrap").classList.add("hidden");$("itemMountHostWrap").classList.add("hidden");$("itemMountAlongWrap").classList.add("hidden");$("itemMountFaceWrap").classList.add("hidden");$("itemFixtureFinishWrap").classList.add("hidden");$("itemStudGlassStyleWrap").classList.add("hidden");$("itemStudGlassTrimWrap").classList.add("hidden");$("itemGlassPrivacyWrap").classList.add("hidden");$("itemGlassThicknessWrap").classList.add("hidden");
 $("itemQuick").classList.add("hidden");$("itemDetails").classList.toggle("hidden",!(selected.kind==="item"&&exactDetailsPinned));$("openingDetails").classList.add("hidden");$("serviceDetails").classList.add("hidden");$("sheetWarning").classList.add("hidden");
 $("detailsToggle").textContent=exactDetailsPinned?"Hide exact details":"Show exact details";
 if(selected.kind==="item"){
  const i=state.items.find(x=>x.id===selected.id);if(!i)return;
  const prod=productById(i.productId);$("sheetEyebrow").textContent=prod?"Product object":"Selected item";$("sheetTitle").textContent=`${i.name} · ${Math.round(Number(i.w)||0)} × ${Math.round(Number(i.h)||0)} × ${i.height||0} mm · ${Math.round((Number(i.rotation)||0)*10)/10}°`;
  $("itemQuick").classList.remove("hidden");$("detailsToggle").classList.remove("hidden");
  $("lockBtn").textContent=i.locked?"Unlock":"Lock";$("rotateBtn").textContent=`+90°`;
  const rotationLocked=WALL_MOUNT_TYPES.has(i.type);$("rotateBtn").classList.toggle("hidden",rotationLocked);$("rotateMinusBtn").classList.toggle("hidden",rotationLocked);$("rotatePlusBtn").classList.toggle("hidden",rotationLocked);$("itemRotationWrap").classList.toggle("hidden",rotationLocked);$("centreMirrorBtn").classList.toggle("hidden",i.type!=="mirror");$("alignGlassBtn").classList.toggle("hidden",i.type!=="glassPanel");$("move3DBtn").classList.toggle("hidden",i.locked||i.type==="niche");
  $("itemName").value=i.name;$("itemType").value=i.type;$("itemX").value=Math.round(i.x);$("itemY").value=Math.round(i.y);$("itemW").value=i.w;$("itemH").value=i.h;$("itemZ").value=i.z||0;$("itemHeight").value=i.height||0;$("itemRotation").value=Math.round((((Number(i.rotation)||0)%360)+360)%360*10)/10;
  $("itemShowerMountWrap").classList.add("hidden");
  const fixtureTypes=["rainHead","handset","showerControls"],mounted=WALL_MOUNT_TYPES.has(i.type);
  $("itemMirrorWallWrap").classList.add("hidden");$("itemMirrorAlongWrap").classList.add("hidden");
  $("itemMountHostWrap").classList.toggle("hidden",!WALL_MOUNT_TYPES.has(i.type));$("itemMountAlongWrap").classList.toggle("hidden",!mounted);$("itemMountFaceWrap").classList.toggle("hidden",!mounted||!isStudHost(i.mountHost));
  if(WALL_MOUNT_TYPES.has(i.type)){refreshMountHostOptions(i);$("itemMountAlong").value=Math.round(Number(i.mountAlong)||0);$("itemMountFace").value=i.mountFace||"shower";}
  $("itemFixtureFinishWrap").classList.toggle("hidden",!fixtureTypes.includes(i.type));if(fixtureTypes.includes(i.type)){$("itemFixtureFinish").value=i.finish||"matt-black";}
  const isGlass=i.type==="glassPanel";$("itemStudGlassStyleWrap").classList.toggle("hidden",!isGlass);$("itemStudGlassTrimWrap").classList.toggle("hidden",!isGlass);$("itemGlassPrivacyWrap").classList.toggle("hidden",!isGlass);$("itemGlassThicknessWrap").classList.toggle("hidden",!isGlass);
  if(isGlass){$("itemStudGlassStyle").value=i.glassStyle||"fluted";$("itemStudGlassTrim").value=i.glassTrimFinish||"matt-black";$("itemGlassPrivacy").value=i.glassPrivacy||"light";$("itemGlassThickness").value=Number(i.glassThickness)||10;}
  const w=warningInfo(i);if(w.length){$("sheetWarning").classList.remove("hidden");$("sheetWarning").textContent=w.join(" ")}
 }else if(selected.kind==="opening"){
  $("detailsToggle").classList.add("hidden");$("openingDetails").classList.remove("hidden");
  if(selected.id==="window"){
   $("sheetEyebrow").textContent="Opening";$("sheetTitle").textContent="Window";$("windowFields").classList.remove("hidden");$("doorFields").classList.add("hidden");
   $("openA").value=state.room.window.before;$("openW").value=state.room.window.width;$("openB").value=state.room.window.after;$("openSill").value=state.room.window.sill;$("openHeight").value=state.room.window.height;
  }else{
   $("sheetEyebrow").textContent="Opening";$("sheetTitle").textContent="Door";$("doorFields").classList.remove("hidden");$("windowFields").classList.add("hidden");
   $("doorA").value=state.room.door.before;$("doorW").value=state.room.door.width;$("doorLeafW").value=Math.round(state.room.door.leafWidth||state.room.door.width);$("doorB").value=state.room.door.after;$("doorOpenHeight").value=state.room.door.height;$("doorHinge").value=state.room.door.hinge||"bottom";$("doorSwingDirectionSheet").value=state.room.door.swingDirection||"in";$("doorAngle").value=state.room.door.openAngle??26;
   const dg=doorGeometry();if($("doorFrameAllowanceSheet"))$("doorFrameAllowanceSheet").textContent=`Calculated frame/trim allowance: ${dg.inset.toFixed(1)} mm each side · hinge inset ${dg.inset.toFixed(1)} mm from the framed opening.`;
  }
 }else if(selected.kind==="service"){
  const s=state.services.find(x=>x.id===selected.id);if(!s)return;
  $("detailsToggle").classList.add("hidden");$("serviceDetails").classList.remove("hidden");
  $("sheetEyebrow").textContent="Service point";$("sheetTitle").textContent=s.name;
  $("serviceName").value=s.name;$("serviceType").value=s.type;$("serviceX").value=s.x;$("serviceY").value=s.y;$("serviceZ").value=s.z||0;
 }
}
function closeObjectSheet(){$("objectSheet").classList.add("hidden");$("itemDetails").classList.add("hidden")}

function addItem(type){
 const p={
  bath:["Bath",1600,700],wc:["WC",370,640],vanity:["Floor-standing vanity",450,900],shower:["Shower",1400,800],
  stud:["Stud wall",900,100],glassPanel:["Glass panel",900,10],storage:["Storage",350,300],radiator:["Radiator",100,600],mirror:["Mirror",800,40],niche:["Niche",400,70],
  rainHead:["Rain shower head",320,300],handset:["Hand shower",90,90],showerControls:["Shower controls",150,40],custom:["Custom object",400,400]
 }[type];
 checkpoint();const hd=HEIGHT_DEFAULTS[type]||[0,900];const i={id:type+Date.now(),type,name:p[0],x:250,y:850,w:p[1],h:p[2],rotation:0,locked:false,z:hd[0],height:hd[1]};
 if(type==="mirror"){
  i.w=500;i.h=25;i.height=500;i.z=1200;i.mountHost="left";i.mountWall="left";
  const vanity=state.items.find(x=>x.type==="vanity"),vd=vanity?itemDims(vanity):null;i.mountAlong=vd?vanity.y+vd.h/2:state.room.depth/2;syncMountedItemPlan(i);
 }
 if(type==="rainHead"){i.z=1945;i.height=180;i.finish="matt-black";i.mountHost="left";i.mountAlong=Math.max(160,state.room.depth-405);i.mountFace="shower";syncMountedItemPlan(i)}
 if(type==="handset"){i.z=1050;i.height=720;i.finish="matt-black";i.mountHost="left";i.mountAlong=Math.max(50,state.room.depth-225);i.mountFace="shower";syncMountedItemPlan(i)}
 if(type==="showerControls"){const stud=state.items.find(x=>x.type==="stud");i.z=950;i.height=200;i.finish="matt-black";i.mountHost=stud?"stud:"+stud.id:"left";i.mountAlong=stud?(Number(stud.w)||900)*.65:state.room.depth*.65;i.mountFace="shower";syncMountedItemPlan(i)}
 if(type==="glassPanel"){
  const stud=state.items.find(x=>x.type==="stud");i.glassStyle="fluted";i.glassTrimFinish="matt-black";i.glassPrivacy="light";i.glassThickness=10;i.h=10;i.mountHost="free";
  if(stud){i.w=Math.max(200,Number(stud.w)||900);i.height=Math.max(300,Math.min(1000,state.room.ceiling-((Number(stud.z)||0)+(Number(stud.height)||1100))-80));placeGlassAboveStud(i,stud)}
 }
 state.items.push(i);selected={kind:"item",id:i.id};save();$("addSheet").classList.add("hidden");render();openSelectedSheet();
}
function addGlassPanel(style="fluted"){
 addItem("glassPanel");const i=state.items.find(x=>x.id===selected.id);if(!i)return;i.glassStyle=style==="plain"?"plain":"fluted";i.name=i.glassStyle==="fluted"?"Fluted glass panel":"Plain glass panel";save();render();openSelectedSheet();
}
function addService(type){
 const names={hot:"Hot entry",cold:"Cold entry",waste:"Waste outlet",soil:"Soil stack",electric:"Electrical point"};
 checkpoint();const s={id:"s"+Date.now(),type,name:names[type],x:state.room.width/2,y:state.room.depth/2,z:300};state.services.push(s);selected={kind:"service",id:s.id};save();$("addSheet").classList.add("hidden");render();openSelectedSheet();
}

function renderPlanVariants(){
 ensurePlanVariants();const sel=$("planVariantSelect");if(!sel)return;
 const active=activePlanVariant(),current=sel.value;sel.innerHTML="";
 state.planVariants.forEach(v=>{const o=document.createElement("option");o.value=v.id;o.textContent=v.name+(v.id===state.activePlanId?" · active":"");sel.appendChild(o)});
 sel.value=state.activePlanId;const meta=$("planVariantMeta");if(meta)meta.textContent=`${state.planVariants.length} saved plan${state.planVariants.length===1?"":"s"} · current layout autosaves`;
 const del=$("deletePlanBtn");if(del)del.disabled=state.planVariants.length<=1;
}
function sync(){
 const r=state.room;
 $("roomWidth").value=r.width;$("roomDepth").value=r.depth;$("ceilingHeight").value=r.ceiling;$("tolerance").value=r.tolerance;
 $("windowBefore").value=r.window.before;$("windowWidth").value=r.window.width;$("windowAfter").value=r.window.after;$("windowSill").value=r.window.sill;$("windowHeight").value=r.window.height;
 $("doorBefore").value=r.door.before;$("doorWidth").value=r.door.width;$("doorLeafWidth").value=Math.round(r.door.leafWidth||r.door.width);$("doorAfter").value=r.door.after;$("doorHeight").value=r.door.height;
 if($("doorSwingDirection"))$("doorSwingDirection").value=r.door.swingDirection||"in";
 $("projectName").value=state.project.name||"";$("projectPlanName").value=state.project.planName||"";$("notes").value=state.project.notes||"";
 $("measureMode").value=state.ui.measureMode||"selected";updateChecks();renderPlanVariants();
}
function updateChecks(){
 const r=state.room,ws=r.window.before+r.window.width+r.window.after,ds=r.door.before+r.door.width+r.door.after;
 $("windowCheck").className="check "+(ws===r.width?"ok":"bad");$("windowCheck").textContent=(ws===r.width?"✓ ":"⚠ ")+`Window wall totals ${ws} mm`;
 $("doorCheck").className="check "+(ds===r.depth?"ok":"bad");$("doorCheck").textContent=(ds===r.depth?"✓ ":"⚠ ")+`Door wall totals ${ds} mm`;
 const dg=doorGeometry(),txt=`Calculated frame/trim allowance: ${dg.inset.toFixed(1)} mm each side · hinge inset ${dg.inset.toFixed(1)} mm from the framed opening.`;
 if($("doorFrameAllowance"))$("doorFrameAllowance").textContent=txt;if($("doorFrameAllowanceSheet"))$("doorFrameAllowanceSheet").textContent=txt;
}
function updateSurveyStatus(){
 const r=state.room,ok=(r.window.before+r.window.width+r.window.after===r.width)&&(r.door.before+r.door.width+r.door.after===r.depth);
 $("surveyStatus").textContent=ok?"Survey dimensions reconcile":"Survey mismatch — check Project";
}

function toggleFocus(){
 document.body.classList.toggle("focus-mode");
 const on=document.body.classList.contains("focus-mode");
 $("focusBtn").classList.toggle("hidden",on);$("exitFocusBtn").classList.toggle("hidden",!on);
 setTimeout(()=>{applyView();render()},50);
}



// --- V1.6 Product library ---
let editingProductId=null,pendingProductImage=null;

function escHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function renderProducts(){
 const grid=$("productGrid");if(!grid)return;grid.innerHTML="";
 if(!state.products.length){grid.innerHTML='<div class="card"><p class="muted">No products yet.</p></div>';return}
 state.products.forEach(p=>{
  const card=document.createElement("div");card.className="productCard";
  const img=p.image?`<img class="productImage" src="${escHtml(p.image)}" alt="${escHtml(p.name)}">`:`<div class="productImage" style="display:grid;place-items:center;color:#888">No image</div>`;
  card.innerHTML=`
   ${img}
   <div class="productBody">
    <div class="productBrand">${escHtml(p.brand||p.supplier||"Product")}</div>
    <div class="productTitle">${escHtml(p.name)}</div>
    <div class="specPills">
      <span>${Math.round(p.width||0)} W</span><span>${Math.round(p.depth||0)} D</span><span>${Math.round(p.height||0)} H mm</span>
      ${p.mounting==="wall"?'<span>Wall hung</span>':""}
    </div>
    <div class="productMeta">${escHtml(p.finish||"")}${p.sku?` · ${escHtml(p.sku)}`:""}</div>
    ${p.builtIn?'<div class="productBadge">Starter product</div>':""}
    ${p.render3d?.profile&&p.render3d.profile!=="auto"?`<div class="productBadge">3D · ${escHtml(p.render3d.profile)}</div>`:(/^(METCC|GR1208CW|MILF800WHAOBB|51120|ARZIM10MB)$/i.test(p.sku||"")?'<div class="productBadge">3D · product matched</div>':"")}
    <div class="productActions">
      <button data-place="${escHtml(p.id)}" class="primary">Add to plan</button>
      <button data-edit-product="${escHtml(p.id)}">Edit</button>
      <button data-export-product="${escHtml(p.id)}">Export JSON</button>
    </div>
   </div>`;
  grid.appendChild(card);
 });
 grid.querySelectorAll("[data-place]").forEach(b=>b.onclick=()=>placeProduct(b.dataset.place));
 grid.querySelectorAll("[data-edit-product]").forEach(b=>b.onclick=()=>openProductEditor(b.dataset.editProduct));
 grid.querySelectorAll("[data-export-product]").forEach(b=>b.onclick=()=>exportProduct(b.dataset.exportProduct));
}
function openProductEditor(id=null){
 editingProductId=id;pendingProductImage=null;
 const p=id?productById(id):null;
 $("productSheetTitle").textContent=p?"Edit product":"Add product";
 $("prodName").value=p?.name||"";$("prodBrand").value=p?.brand||"";$("prodSupplier").value=p?.supplier||"";
 $("prodSku").value=p?.sku||"";$("prodType").value=p?.type||"vanity";$("prodMount").value=p?.mounting||"floor";
 $("prodFinish").value=p?.finish||"";$("prodStyle").value=p?.style||"box";$("prodProfile").value=p?.render3d?.profile||"auto";$("prodRenderFinish").value=p?.render3d?.finish||"auto";$("prodWidth").value=p?.width||"";
 $("prodDepth").value=p?.depth||"";$("prodHeight").value=p?.height||"";$("prodZ").value=p?.defaultZ??0;
 $("prodUrl").value=p?.url||"";$("prodNotes").value=p?.notes||"";
 const preview=$("productPhotoPreview"),prompt=$("productPhotoPrompt");
 if(p?.image){preview.src=p.image;preview.classList.remove("hidden");prompt.classList.add("hidden")}else{preview.removeAttribute("src");preview.classList.add("hidden");prompt.classList.remove("hidden")}
 $("deleteProductBtn").classList.toggle("hidden",!p||p.builtIn);
 $("productSheet").classList.remove("hidden");
}
function closeProductEditor(){$("productSheet").classList.add("hidden");editingProductId=null;pendingProductImage=null}
async function compressProductImage(file){
 return new Promise((resolve,reject)=>{
  const fr=new FileReader();
  fr.onload=()=>{
   const im=new Image();
   im.onload=()=>{
    const max=720,scale=Math.min(1,max/Math.max(im.width,im.height));
    const c=document.createElement("canvas");c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));
    c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    resolve(c.toDataURL("image/jpeg",.72));
   };im.onerror=reject;im.src=fr.result;
  };fr.onerror=reject;fr.readAsDataURL(file);
 });
}
function saveProduct(){
 const old=editingProductId?productById(editingProductId):null;
 const p={
  id:old?.id||("prod-"+Date.now()),
  name:$("prodName").value.trim()||"Untitled product",
  brand:$("prodBrand").value.trim(),supplier:$("prodSupplier").value.trim(),sku:$("prodSku").value.trim(),
  type:$("prodType").value,mounting:$("prodMount").value,finish:$("prodFinish").value.trim(),style:$("prodStyle").value,
  render3d:{profile:$("prodProfile").value||"auto",finish:$("prodRenderFinish").value||"auto"},
  width:Math.max(1,Number($("prodWidth").value)||1),depth:Math.max(1,Number($("prodDepth").value)||1),
  height:Math.max(1,Number($("prodHeight").value)||1),defaultZ:Math.max(0,Number($("prodZ").value)||0),
  url:$("prodUrl").value.trim(),notes:$("prodNotes").value.trim(),
  image:pendingProductImage||old?.image||"",builtIn:old?.builtIn||false
 };
 checkpoint();
 if(old){Object.assign(old,p)}else state.products.push(p);
 save();renderProducts();closeProductEditor();
}
function placeProduct(id){
 const p=productById(id);if(!p)return;
 checkpoint();
 let rotation=(p.type==="vanity"&&p.mounting==="wall")?90:0;
 let item={id:p.type+Date.now(),type:p.type,name:p.name,x:120,y:780,w:p.width,h:p.depth,rotation,locked:false,z:p.defaultZ||0,height:p.height,productId:p.id};
 if(p.type==="mirror"){
  const vanity=state.items.find(x=>x.type==="vanity"),vd=vanity?itemDims(vanity):null;
  item.mountWall="left";item.mountAlong=vd?vanity.y+vd.h/2:state.room.depth/2;item.rotation=90;syncMirrorPlanFromMount(item);
 }
 state.items.push(item);selected={kind:"item",id:item.id};save();render();
 document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
 const planTab=document.querySelector('.tab[data-tab="plan"]');planTab.classList.add("active");$("plan").classList.add("active");
 openSelectedSheet();
}
function exportProduct(id){
 const p=productById(id);if(!p)return;
 const blob=new Blob([JSON.stringify({bathroomPlannerProduct:1,product:p},null,2)],{type:"application/json"});
 const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=(p.sku||p.name||"product").replace(/[^a-z0-9]+/gi,"-").toLowerCase()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(u),500);
}
async function importProductFile(file){
 try{
  const data=JSON.parse(await file.text()),p=data.product||data;
  if(!p.name||!p.width||!p.depth||!p.height)throw Error("Product JSON needs name, width, depth and height.");
  checkpoint();p.id="prod-"+Date.now();p.builtIn=false;ensureProduct3D(p);state.products.push(p);save();renderProducts();alert("Product imported. V2.3 will use a product-specific 3D profile automatically when the SKU is recognised.");
 }catch(err){alert("Could not import product: "+err.message)}
}
$("newProductBtn").onclick=()=>openProductEditor();
$("closeProductSheet").onclick=closeProductEditor;
$("saveProductBtn").onclick=saveProduct;
$("deleteProductBtn").onclick=()=>{
 const p=productById(editingProductId);if(!p||p.builtIn)return;
 if(!confirm("Delete "+p.name+" from the product library?"))return;
 checkpoint();state.products=state.products.filter(x=>x.id!==p.id);save();renderProducts();closeProductEditor();
};
$("productPhotoInput").onchange=async e=>{
 const f=e.target.files?.[0];if(!f)return;
 try{
  pendingProductImage=await compressProductImage(f);
  $("productPhotoPreview").src=pendingProductImage;$("productPhotoPreview").classList.remove("hidden");$("productPhotoPrompt").classList.add("hidden");
 }catch(_){alert("Could not read that image.")}
 e.target.value="";
};
$("productImportInput").onchange=async e=>{const f=e.target.files?.[0];if(f)await importProductFile(f);e.target.value=""};

// --- V1.5 3D and wall elevations ---
const c3=$("threeDCanvas"),ctx3=c3.getContext("2d"),eSvg=$("elevationSvg");
let cam3={yaw:-0.75,pitch:0.62,zoom:0.19},drag3=null,pointers3=new Map(),pinch3=null,hit3=[];

function resize3D(){
 const dpr=Math.min(2,window.devicePixelRatio||1),r=c3.getBoundingClientRect();
 c3.width=Math.max(1,Math.round(r.width*dpr));c3.height=Math.max(1,Math.round(r.height*dpr));
 ctx3.setTransform(dpr,0,0,dpr,0,0);draw3D();
}
function rot3(p){
 const r=state.room,cx=r.width/2,cy=r.depth/2,cz=r.ceiling*.45;
 let x=p.x-cx,y=p.y-cy,z=p.z-cz;
 const cyw=Math.cos(cam3.yaw),syw=Math.sin(cam3.yaw);
 let x1=x*cyw-y*syw,y1=x*syw+y*cyw;
 const cp=Math.cos(cam3.pitch),sp=Math.sin(cam3.pitch);
 let y2=y1*cp-z*sp,z2=y1*sp+z*cp;
 return{x:x1,y:y2,z:z2};
}
function proj3(p,w,h){const q=rot3(p),s=cam3.zoom;return{x:w/2+q.x*s,y:h*.57+q.y*s,depth:q.z}}
function poly3(points,fill,stroke,w,h){
 const pp=points.map(p=>proj3(p,w,h));
 ctx3.beginPath();ctx3.moveTo(pp[0].x,pp[0].y);
 for(let i=1;i<pp.length;i++)ctx3.lineTo(pp[i].x,pp[i].y);
 ctx3.closePath();ctx3.fillStyle=fill;ctx3.fill();ctx3.strokeStyle=stroke;ctx3.lineWidth=1.2;ctx3.stroke();
 return pp;
}
function lineLoop3(points,stroke,w,h,width=2){
 const pp=points.map(p=>proj3(p,w,h));
 ctx3.beginPath();ctx3.moveTo(pp[0].x,pp[0].y);for(let i=1;i<pp.length;i++)ctx3.lineTo(pp[i].x,pp[i].y);
 ctx3.closePath();ctx3.strokeStyle=stroke;ctx3.lineWidth=width;ctx3.stroke();
}
function boxFaces3(i){
 const d=itemDims(i),x=i.x,y=i.y,z=i.z||0,X=x+d.w,Y=y+d.h,Z=z+(i.height||1);
 return[
  {p:[{x,y,z:Z},{x:X,y,z:Z},{x:X,y:Y,z:Z},{x,y:Y,z:Z}],shade:0},
  {p:[{x,y,z},{x:X,y,z},{x:X,y,z:Z},{x,y,z:Z}],shade:1},
  {p:[{x:X,y,z},{x:X,y:Y,z},{x:X,y:Y,z:Z},{x:X,y,z:Z}],shade:2},
  {p:[{x:X,y:Y,z},{x,y:Y,z},{x,y:Y,z:Z},{x:X,y:Y,z:Z}],shade:3},
  {p:[{x,y:Y,z},{x,y,z},{x,y,z:Z},{x,y:Y,z:Z}],shade:4}
 ];
}
function itemRgb(type){
 return {bath:[220,214,202],wc:[232,230,223],vanity:[196,174,143],shower:[196,218,218],stud:[182,178,166],storage:[188,166,137],radiator:[217,207,191],niche:[207,194,175],custom:[205,201,191]}[type]||[200,198,190];
}

function productById(id){return state.products.find(p=>p.id===id)}
function productImageSrc(p){return p&&p.image?p.image:""}
function productItemDetails2D(i,d,parent=svg,x=i.x,y=i.y){
 const p=productById(i.productId);if(!p)return;
 if(p.style==="vanity2drawer"){
  parent.appendChild(sEl("line",{x1:x+d.w*.08,y1:y+d.h/2,x2:x+d.w*.92,y2:y+d.h/2,class:"archLine"}));
  parent.appendChild(sEl("line",{x1:x+d.w*.38,y1:y+d.h*.22,x2:x+d.w*.62,y2:y+d.h*.22,stroke:"#ad8753","stroke-width":"3","vector-effect":"non-scaling-stroke"}));
  parent.appendChild(sEl("line",{x1:x+d.w*.38,y1:y+d.h*.68,x2:x+d.w*.62,y2:y+d.h*.68,stroke:"#ad8753","stroke-width":"3","vector-effect":"non-scaling-stroke"}));
 }
}
function line3(a,b,color,w,h,width=1.5){
 const A=proj3(a,w,h),B=proj3(b,w,h);ctx3.beginPath();ctx3.moveTo(A.x,A.y);ctx3.lineTo(B.x,B.y);ctx3.strokeStyle=color;ctx3.lineWidth=width;ctx3.stroke();
}
function drawProductDetails3D(i,w,h){
 const p=productById(i.productId);if(!p||p.style!=="vanity2drawer")return;
 const d=itemDims(i),z=i.z||0,Z=z+(i.height||1);
 // White ceramic basin/top.
 poly3([{x:i.x,y:i.y,z:Z+2},{x:i.x+d.w,y:i.y,z:Z+2},{x:i.x+d.w,y:i.y+d.h,z:Z+2},{x:i.x,y:i.y+d.h,z:Z+2}],
       "rgba(248,247,243,.96)","rgba(155,153,146,.7)",w,h);
 // Drawer split and brass handles on the room-facing side.
 const zMid=z+(i.height||1)*.48;
 const z1=z+(i.height||1)*.70,z2=z+(i.height||1)*.28;
 if(i.rotation===90||i.rotation===270){
  const fx=i.x+d.w+1;
  line3({x:fx,y:i.y,z:zMid},{x:fx,y:i.y+d.h,z:zMid},"rgba(105,95,80,.75)",w,h);
  const ya=i.y+d.h*.36,yb=i.y+d.h*.64;
  line3({x:fx+1,y:ya,z:z1},{x:fx+1,y:yb,z:z1},"rgba(174,135,70,.95)",w,h,2.6);
  line3({x:fx+1,y:ya,z:z2},{x:fx+1,y:yb,z:z2},"rgba(174,135,70,.95)",w,h,2.6);
 }else{
  const fy=i.y+d.h+1;
  line3({x:i.x,y:fy,z:zMid},{x:i.x+d.w,y:fy,z:zMid},"rgba(105,95,80,.75)",w,h);
  const xa=i.x+d.w*.36,xb=i.x+d.w*.64;
  line3({x:xa,y:fy+1,z:z1},{x:xb,y:fy+1,z:z1},"rgba(174,135,70,.95)",w,h,2.6);
  line3({x:xa,y:fy+1,z:z2},{x:xb,y:fy+1,z:z2},"rgba(174,135,70,.95)",w,h,2.6);
 }
}

function draw3D(){
 if($("viewMode").value!=="3d")return;
 const r=c3.getBoundingClientRect(),w=r.width,h=r.height;if(!w||!h)return;
 ctx3.clearRect(0,0,w,h);hit3=[];
 const R=state.room;
 poly3([{x:0,y:0,z:0},{x:R.width,y:0,z:0},{x:R.width,y:R.depth,z:0},{x:0,y:R.depth,z:0}],
       "rgba(244,241,234,.96)","rgba(90,92,85,.38)",w,h);

 ctx3.strokeStyle="rgba(120,120,112,.12)";ctx3.lineWidth=1;
 for(let x=0;x<=R.width;x+=250){const a=proj3({x,y:0,z:1},w,h),b=proj3({x,y:R.depth,z:1},w,h);ctx3.beginPath();ctx3.moveTo(a.x,a.y);ctx3.lineTo(b.x,b.y);ctx3.stroke()}
 for(let y=0;y<=R.depth;y+=250){const a=proj3({x:0,y,z:1},w,h),b=proj3({x:R.width,y,z:1},w,h);ctx3.beginPath();ctx3.moveTo(a.x,a.y);ctx3.lineTo(b.x,b.y);ctx3.stroke()}

 if($("wallsToggle").checked){
  const H=R.ceiling;
  [
   [{x:0,y:0,z:0},{x:R.width,y:0,z:0},{x:R.width,y:0,z:H},{x:0,y:0,z:H}],
   [{x:0,y:R.depth,z:0},{x:R.width,y:R.depth,z:0},{x:R.width,y:R.depth,z:H},{x:0,y:R.depth,z:H}],
   [{x:0,y:0,z:0},{x:0,y:R.depth,z:0},{x:0,y:R.depth,z:H},{x:0,y:0,z:H}],
   [{x:R.width,y:0,z:0},{x:R.width,y:R.depth,z:0},{x:R.width,y:R.depth,z:H},{x:R.width,y:0,z:H}]
  ].forEach(p=>poly3(p,"rgba(245,243,238,.12)","rgba(70,72,68,.28)",w,h));
 }

 const faces=[];
 state.items.forEach(i=>boxFaces3(i).forEach(f=>{
  const dep=f.p.reduce((s,p)=>s+rot3(p).z,0)/f.p.length;faces.push({i,f,dep});
 }));
 faces.sort((a,b)=>a.dep-b.dep);
 faces.forEach(({i,f})=>{
  const prod=productById(i.productId); const rgb=prod&&prod.style==="vanity2drawer"?[174,145,108]:itemRgb(i.type),sel=selected.kind==="item"&&selected.id===i.id;
  const alpha=i.type==="shower"?.38:.72,shade=1-f.shade*.045;
  const fill=`rgba(${Math.round(rgb[0]*shade)},${Math.round(rgb[1]*shade)},${Math.round(rgb[2]*shade)},${alpha})`;
  poly3(f.p,fill,sel?"rgba(55,105,116,.95)":"rgba(70,72,67,.62)",w,h);
 });

 state.items.forEach(i=>drawProductDetails3D(i,w,h));

 state.items.forEach(i=>{
  const d=itemDims(i),p=proj3({x:i.x+d.w/2,y:i.y+d.h/2,z:(i.z||0)+(i.height||1)},w,h);
  hit3.push({id:i.id,x:p.x,y:p.y});
  ctx3.fillStyle="rgba(45,47,43,.78)";ctx3.font="700 12px system-ui";ctx3.textAlign="center";
  ctx3.fillText(i.name,p.x,p.y-7);
 });

 const win=R.window;
 lineLoop3([
  {x:win.before,y:0,z:win.sill},{x:win.before+win.width,y:0,z:win.sill},
  {x:win.before+win.width,y:0,z:win.sill+win.height},{x:win.before,y:0,z:win.sill+win.height}
 ],"rgba(80,135,147,.9)",w,h,3);

 const d=R.door;
 lineLoop3([
  {x:R.width,y:d.before,z:0},{x:R.width,y:d.before+d.width,z:0},
  {x:R.width,y:d.before+d.width,z:d.height},{x:R.width,y:d.before,z:d.height}
 ],"rgba(100,96,86,.82)",w,h,2);
}
function set3View(name){
 if(name==="door")cam3={yaw:-2.36,pitch:.48,zoom:.2};
 else if(name==="window")cam3={yaw:.78,pitch:.48,zoom:.2};
 else if(name==="top")cam3={yaw:-.02,pitch:1.45,zoom:.19};
 else cam3={yaw:-.75,pitch:.62,zoom:.19};
 draw3D();
}
function elevationWall(mode){
 const R=state.room,svg=eSvg;svg.innerHTML="";
 let wallW=R.width,wallName="Window wall";
 if(mode==="door"){wallW=R.width;wallName="Door wall"}
 if(mode==="left"||mode==="right"){wallW=R.depth;wallName=mode==="left"?"Vanity wall / opposite door":"Door wall"}
 const H=R.ceiling,pad=150;
 svg.setAttribute("viewBox",`${-pad} ${-pad} ${wallW+pad*2} ${H+pad*2}`);
 svg.appendChild(sEl("rect",{x:0,y:0,width:wallW,height:H,class:"eWall"}));
 for(let x=0;x<=wallW;x+=250)svg.appendChild(sEl("line",{x1:x,y1:0,x2:x,y2:H,class:"eGrid"}));
 for(let z=0;z<=H;z+=250)svg.appendChild(sEl("line",{x1:0,y1:H-z,x2:wallW,y2:H-z,class:"eGrid"}));

 if(mode==="window"){
  const w=R.window;svg.appendChild(sEl("rect",{x:w.before,y:H-(w.sill+w.height),width:w.width,height:w.height,class:"eOpening"}));
 }
 if(mode==="door"){
  const d=R.door;svg.appendChild(sEl("rect",{x:d.before,y:H-d.height,width:d.width,height:d.height,class:"eOpening"}));
 }

 const threshold=180;
 state.items.forEach(i=>{
  const b=box(i);let near=false,x=0,width=0;
  if(mode==="window"&&b.y1<=threshold){near=true;x=b.x1;width=b.w}
  if(mode==="door"&&R.depth-b.y2<=threshold){near=true;x=b.x1;width=b.w}
  if(mode==="left"&&b.x1<=threshold){near=true;x=b.y1;width=b.h}
  if(mode==="right"&&R.width-b.x2<=threshold){near=true;x=b.y1;width=b.h}
  if(!near)return;
  const z=i.z||0,hh=i.height||1;
  const rect=sEl("rect",{x,y:H-(z+hh),width,height:hh,class:"eItem","data-eid":i.id});
  rect.addEventListener("click",()=>{selected={kind:"item",id:i.id};openSelectedSheet()});
  svg.appendChild(rect);
  const tx=sEl("text",{x:x+width/2,y:H-(z+hh/2),"text-anchor":"middle","font-size":"34","font-weight":"800",fill:"#555850"});
  tx.textContent=i.name;svg.appendChild(tx);
 });

 const title=sEl("text",{x:wallW/2,y:-55,"text-anchor":"middle","font-size":"44","font-weight":"900",fill:"#42443f"});
 title.textContent=`${wallName} · ${wallW} × ${H} mm`;svg.appendChild(title);
 const floor=sEl("text",{x:-15,y:H+45,"text-anchor":"end",class:"eText"});floor.textContent="FFL";svg.appendChild(floor);
}
function update3DMode(){
 const m=$("viewMode").value,show=m==="3d";
 c3.style.display=show?"block":"none";$("elevationWrap").classList.toggle("show",!show);
 if(show)setTimeout(resize3D,20);else elevationWall(m);
}
$("viewMode").onchange=update3DMode;
$("viewDoor").onclick=()=>{$("viewMode").value="3d";update3DMode();set3View("door")};
$("viewWindow").onclick=()=>{$("viewMode").value="3d";update3DMode();set3View("window")};
$("viewTop").onclick=()=>{$("viewMode").value="3d";update3DMode();set3View("top")};
$("viewReset").onclick=()=>set3View("reset");
$("wallsToggle").onchange=draw3D;
window.addEventListener("resize",()=>{if($("threeD").classList.contains("active"))resize3D()});

c3.addEventListener("pointerdown",e=>{
 pointers3.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers3.size===1){
  drag3={id:e.pointerId,x:e.clientX,y:e.clientY,yaw:cam3.yaw,pitch:cam3.pitch,moved:false};
  try{c3.setPointerCapture(e.pointerId)}catch(_){}
 }else if(pointers3.size===2){
  const p=[...pointers3.values()];
  pinch3={d:Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y),zoom:cam3.zoom};drag3=null;
 }
},{passive:false});
c3.addEventListener("pointermove",e=>{
 if(pointers3.has(e.pointerId))pointers3.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers3.size===2&&pinch3){
  e.preventDefault();const p=[...pointers3.values()],d=Math.max(20,Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y));
  cam3.zoom=Math.max(.08,Math.min(.5,pinch3.zoom*d/pinch3.d));draw3D();return;
 }
 if(drag3&&drag3.id===e.pointerId){
  const dx=e.clientX-drag3.x,dy=e.clientY-drag3.y;
  if(Math.abs(dx)+Math.abs(dy)>4)drag3.moved=true;
  cam3.yaw=drag3.yaw+dx*.008;cam3.pitch=Math.max(.15,Math.min(1.5,drag3.pitch+dy*.006));draw3D();
 }
},{passive:false});
function end3(e){
 const was=drag3&&drag3.id===e.pointerId?drag3:null;pointers3.delete(e.pointerId);
 if(pointers3.size<2)pinch3=null;
 if(was&&!was.moved){
  const r=c3.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null;
  hit3.forEach(h=>{const d=Math.hypot(h.x-x,h.y-y);if(d<45&&(!best||d<best.d))best={...h,d}});
  if(best){selected={kind:"item",id:best.id};openSelectedSheet();draw3D()}
 }
 if(was)drag3=null;
}
c3.addEventListener("pointerup",end3);c3.addEventListener("pointercancel",end3);

document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{
document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));
 document.querySelectorAll(".panel").forEach(x=>x.classList.remove("active"));
 b.classList.add("active");$(b.dataset.tab).classList.add("active");
 if(b.dataset.tab==="threeD")setTimeout(update3DMode,20);
 if(b.dataset.tab==="products")renderProducts();
 if(b.dataset.tab==="surfaces"&&window.BPSurfaces?.render) window.BPSurfaces.render();
});

$("undoBtn").onclick=undo;$("redoBtn").onclick=redo;
$("measureMode").onchange=e=>{state.ui.measureMode=e.target.value;save();render()};
$("manualMeasureBtn").onclick=()=>{
 manualMode=!manualMode;manualFirst=null;
 $("manualMeasureBtn").classList.toggle("primary",manualMode);
 $("measureBanner").classList.toggle("show",manualMode);
 $("measureBanner").textContent="Tap the first point";
 $("statusHint").textContent=manualMode?"Measure mode: tap two points. Edges will snap automatically.":"Drag fixtures · pinch to zoom · tap an item for measurements.";
 render();
};
$("clearMeasuresBtn").onclick=()=>{if(!state.manualMeasurements.length)return;checkpoint();state.manualMeasurements=[];save();render()};
$("focusBtn").onclick=toggleFocus;$("exitFocusBtn").onclick=toggleFocus;
$("addBtn").onclick=()=>$("addSheet").classList.remove("hidden");$("closeAddSheet").onclick=()=>$("addSheet").classList.add("hidden");
document.querySelectorAll("[data-add-item]").forEach(b=>b.onclick=()=>addItem(b.dataset.addItem));
document.querySelectorAll("[data-add-glass]").forEach(b=>b.onclick=()=>addGlassPanel(b.dataset.addGlass));
document.querySelectorAll("[data-add-service]").forEach(b=>b.onclick=()=>addService(b.dataset.addService));
$("closeObjectSheet").onclick=closeObjectSheet;
$("selectionDetailsBtn").onclick=()=>{if(selected.kind)openSelectedSheet()};
$("detailsToggle").onclick=()=>{exactDetailsPinned=!exactDetailsPinned;const d=$("itemDetails");d.classList.toggle("hidden",!exactDetailsPinned);$("detailsToggle").textContent=exactDetailsPinned?"Hide exact details":"Show exact details"};

$("centreMirrorBtn").onclick=()=>{const i=state.items.find(x=>x.id===selected.id);if(!i||i.type!=="mirror")return;const vanity=state.items.find(x=>x.type==="vanity");if(!vanity)return;checkpoint();const vd=itemDims(vanity);i.mountHost="left";i.mountWall="left";i.mountAlong=vanity.y+vd.h/2;syncMountedItemPlan(i);save();render();openSelectedSheet()};
$("alignGlassBtn").onclick=()=>{const i=state.items.find(x=>x.id===selected.id);if(!i||i.type!=="glassPanel")return;const stud=state.items.find(x=>x.type==="stud");if(!stud)return alert("Add a stud wall first.");checkpoint();placeGlassAboveStud(i,stud);save();render();openSelectedSheet()};
$("move3DBtn").onclick=()=>{
 const i=state.items.find(x=>x.id===selected.id);if(!i||i.locked||i.type==="niche")return;
 const tab=document.querySelector('.tab[data-tab="threeD"]');if(tab)tab.click();
 $("viewMode").value="3d";$("viewMode").dispatchEvent(new Event("change",{bubbles:true}));closeObjectSheet();
 setTimeout(()=>{if(window.BP3DView?.startMove)window.BP3DView.startMove(i.id);else alert("3D move is still loading. Try again in a moment.")},100);
};
function rotateSelectedBy(delta){
 const i=state.items.find(x=>x.id===selected.id);if(!i||WALL_MOUNT_TYPES.has(i.type))return;checkpoint();const before=itemDims(i),cx=i.x+before.w/2,cy=i.y+before.h/2;i.rotation=((((Number(i.rotation)||0)+delta)%360)+360)%360;const after=itemDims(i);i.x=Math.round(cx-after.w/2);i.y=Math.round(cy-after.h/2);save();render();openSelectedSheet();
}
$("rotateBtn").onclick=()=>rotateSelectedBy(90);
$("rotateMinusBtn").onclick=()=>rotateSelectedBy(-15);
$("rotatePlusBtn").onclick=()=>rotateSelectedBy(15);
$("lockBtn").onclick=()=>{const i=state.items.find(x=>x.id===selected.id);if(!i)return;checkpoint();i.locked=!i.locked;save();render();openSelectedSheet()};
$("duplicateBtn").onclick=()=>{const i=state.items.find(x=>x.id===selected.id);if(!i)return;checkpoint();const c=clone(i);c.id=c.type+Date.now();c.name+=" copy";c.locked=false;if(WALL_MOUNT_TYPES.has(c.type)){c.mountAlong=(Number(c.mountAlong)||0)+80;syncMountedItemPlan(c)}else{c.x+=50;c.y+=50}state.items.push(c);selected={kind:"item",id:c.id};save();render();openSelectedSheet()};
$("deleteBtn").onclick=()=>{const i=state.items.find(x=>x.id===selected.id);if(!i||!confirm("Delete "+i.name+"?"))return;checkpoint();state.items=state.items.filter(x=>x.id!==i.id);selected={kind:null,id:null};save();render();closeObjectSheet()};

const ITEM_DETAIL_CONTROL_IDS=["itemName","itemType","itemX","itemY","itemW","itemH","itemZ","itemHeight","itemRotation","itemMountHost","itemMountAlong","itemMountFace","itemFixtureFinish","itemStudGlassStyle","itemStudGlassTrim","itemGlassPrivacy","itemGlassThickness"];
let detailSaveTimer=null;
function detailNumber(id,current,min=null,max=null){
 const raw=$(id).value;
 if(raw===""||raw==="-"||raw==="."||raw==="-.")return current;
 const n=Number(raw);if(!Number.isFinite(n))return current;
 let v=n;if(min!=null)v=Math.max(min,v);if(max!=null)v=Math.min(max,v);return v;
}
function refreshItemDetailChrome(i,changedId){
 if(!i)return;
 const prod=productById(i.productId),fixtureTypes=["rainHead","handset","showerControls"],mounted=WALL_MOUNT_TYPES.has(i.type),isGlass=i.type==="glassPanel";
 $("sheetEyebrow").textContent=prod?"Product object":"Selected item";
 $("sheetTitle").textContent=`${i.name} · ${Math.round(Number(i.w)||0)} × ${Math.round(Number(i.h)||0)} × ${i.height||0} mm · ${Math.round((Number(i.rotation)||0)*10)/10}°`;
 const rotationLocked=WALL_MOUNT_TYPES.has(i.type);$("rotateBtn").classList.toggle("hidden",rotationLocked);$("rotateMinusBtn").classList.toggle("hidden",rotationLocked);$("rotatePlusBtn").classList.toggle("hidden",rotationLocked);$("itemRotationWrap").classList.toggle("hidden",rotationLocked);
 $("centreMirrorBtn").classList.toggle("hidden",i.type!=="mirror");
 $("alignGlassBtn").classList.toggle("hidden",i.type!=="glassPanel");
 $("move3DBtn").classList.toggle("hidden",i.locked||i.type==="niche");
 $("itemMountHostWrap").classList.toggle("hidden",!WALL_MOUNT_TYPES.has(i.type));
 $("itemMountAlongWrap").classList.toggle("hidden",!mounted);
 $("itemMountFaceWrap").classList.toggle("hidden",!mounted||!isStudHost(i.mountHost));
 $("itemFixtureFinishWrap").classList.toggle("hidden",!fixtureTypes.includes(i.type));
 $("itemStudGlassStyleWrap").classList.toggle("hidden",!isGlass);$("itemStudGlassTrimWrap").classList.toggle("hidden",!isGlass);$("itemGlassPrivacyWrap").classList.toggle("hidden",!isGlass);$("itemGlassThicknessWrap").classList.toggle("hidden",!isGlass);
 if((changedId==="itemType"||changedId==="itemMountHost")&&WALL_MOUNT_TYPES.has(i.type)){
  refreshMountHostOptions(i);
  if($("itemMountHost"))$("itemMountHost").value=i.mountHost||i.mountWall||"left";
 }
 $("sheetWarning").classList.add("hidden");const warnings=warningInfo(i);if(warnings.length){$("sheetWarning").classList.remove("hidden");$("sheetWarning").textContent=warnings.join(" ")}
}
function syncPassiveItemDetailFields(i){
 const values={itemName:i.name,itemType:i.type,itemX:Math.round(Number(i.x)||0),itemY:Math.round(Number(i.y)||0),itemW:Math.round(Number(i.w)||0),itemH:Math.round(Number(i.h)||0),itemZ:Math.round(Number(i.z)||0),itemHeight:Math.round(Number(i.height)||0),itemRotation:Math.round((((Number(i.rotation)||0)%360+360)%360)*10)/10,itemMountAlong:Math.round(Number(i.mountAlong)||0),itemFixtureFinish:i.finish||"matt-black",itemStudGlassStyle:i.glassStyle||"fluted",itemStudGlassTrim:i.glassTrimFinish||"matt-black",itemGlassPrivacy:i.glassPrivacy||"light",itemGlassThickness:Number(i.glassThickness)||10};
 Object.entries(values).forEach(([id,value])=>{const el=$(id);if(el&&document.activeElement!==el)el.value=value;});
}
function refreshLiveItemViews(i,changedId){
 exactDetailsPinned=true;$("itemDetails").classList.remove("hidden");$("detailsToggle").textContent="Hide exact details";
 render();
 refreshItemDetailChrome(i,changedId);syncPassiveItemDetailFields(i);
 if(window.BP3DView?.refresh)window.BP3DView.refresh();
 clearTimeout(detailSaveTimer);detailSaveTimer=setTimeout(()=>save(),350);
}
function applyItemDetailsLive(changedId){
 const i=state.items.find(x=>x.id===selected.id);if(!i)return;
 const beforeDims=itemDims(i),beforeCx=Number(i.x)+beforeDims.w/2,beforeCy=Number(i.y)+beforeDims.h/2;
 const oldType=i.type,wasMounted=WALL_MOUNT_TYPES.has(i.type),oldHost=i.mountHost||i.mountWall||"left",oldAlong=Number(i.mountAlong)||0;
 const name=$("itemName").value.trim();if(name)i.name=name;
 i.type=$("itemType").value||i.type;
 i.x=detailNumber("itemX",i.x);i.y=detailNumber("itemY",i.y);i.w=detailNumber("itemW",i.w,20);i.h=detailNumber("itemH",i.h,6);i.z=detailNumber("itemZ",i.z||0,0);i.height=detailNumber("itemHeight",i.height||1,1);
 if(changedId==="itemRotation"&&!WALL_MOUNT_TYPES.has(i.type)){i.rotation=((detailNumber("itemRotation",i.rotation||0)%360)+360)%360;const afterDims=itemDims(i);i.x=Math.round(beforeCx-afterDims.w/2);i.y=Math.round(beforeCy-afterDims.h/2);}
 if(["rainHead","handset","showerControls"].includes(i.type))i.finish=$("itemFixtureFinish").value||i.finish||"matt-black";
 if(i.type==="glassPanel"){
  i.mountHost="free";delete i.mountAlong;delete i.mountFace;i.glassStyle=$("itemStudGlassStyle").value||i.glassStyle||"fluted";i.glassTrimFinish=$("itemStudGlassTrim").value||i.glassTrimFinish||"matt-black";i.glassPrivacy=$("itemGlassPrivacy").value||i.glassPrivacy||"light";
  i.glassThickness=changedId==="itemH"?Math.max(6,Math.min(15,Number(i.h)||10)):detailNumber("itemGlassThickness",i.glassThickness||10,6,15);i.h=i.glassThickness;
 }
 if(WALL_MOUNT_TYPES.has(i.type)){
  if(oldType!==i.type&&!i.mountHost)i.mountHost="left";
  const nextHost=(changedId==="itemType"?i.mountHost:$("itemMountHost").value)||i.mountHost||"left",hostChanged=changedId==="itemMountHost",alongChanged=changedId==="itemMountAlong",xyChanged=changedId==="itemX"||changedId==="itemY";
  i.mountHost=nextHost;i.mountFace=$("itemMountFace").value||i.mountFace||"shower";if(i.type==="mirror"&&!isStudHost(i.mountHost)&&i.mountHost!=="free")i.mountWall=i.mountHost;
  if(i.mountHost!=="free"){
   if(hostChanged)i.mountAlong=detailNumber("itemMountAlong",oldAlong,0);
   else if(alongChanged)i.mountAlong=detailNumber("itemMountAlong",i.mountAlong||0,0);
   else if(xyChanged)i.mountAlong=mountAlongFromPlan(i,i.x,i.y);
   else i.mountAlong=oldHost===i.mountHost?oldAlong:mountAlongFromPlan(i,i.x,i.y);
   syncMountedItemPlan(i);
  }else if(wasMounted&&oldHost!=="free")i.mountAlong=oldAlong;
 }
 refreshLiveItemViews(i,changedId);
}
ITEM_DETAIL_CONTROL_IDS.forEach(id=>{
 const el=$(id);if(!el)return;
 el.addEventListener("focus",()=>{if(selected.kind!=="item")return;if(el.dataset.undoArmed==="1")return;checkpoint();el.dataset.undoArmed="1";});
 el.addEventListener("input",()=>applyItemDetailsLive(id));
 el.addEventListener("change",()=>{applyItemDetailsLive(id);save();delete el.dataset.undoArmed;});
 el.addEventListener("blur",()=>{save();delete el.dataset.undoArmed;});
});
["openA","openW","openB","openSill","openHeight"].forEach(id=>$(id).onchange=()=>{checkpoint();state.room.window.before=Math.max(0,Number($("openA").value)||0);state.room.window.width=Math.max(100,Number($("openW").value)||100);state.room.window.after=Math.max(0,Number($("openB").value)||0);state.room.window.sill=Math.max(0,Number($("openSill").value)||0);state.room.window.height=Math.max(100,Number($("openHeight").value)||100);save();sync();render();openSelectedSheet()});
["doorA","doorW","doorLeafW","doorB","doorOpenHeight","doorHinge","doorSwingDirectionSheet","doorAngle"].forEach(id=>$(id).onchange=()=>{checkpoint();state.room.door.before=Math.max(0,Number($("doorA").value)||0);state.room.door.width=Math.max(100,Number($("doorW").value)||100);state.room.door.leafWidth=Math.max(100,Math.min(state.room.door.width,Number($("doorLeafW").value)||state.room.door.width));state.room.door.after=Math.max(0,Number($("doorB").value)||0);state.room.door.height=Math.max(100,Number($("doorOpenHeight").value)||100);state.room.door.hinge=$("doorHinge").value||"bottom";state.room.door.swingDirection=$("doorSwingDirectionSheet").value||"in";state.room.door.openAngle=Math.max(0,Math.min(120,Number($("doorAngle").value)||0));save();sync();render();openSelectedSheet();if(window.BP3DView?.refresh)window.BP3DView.refresh()});
["serviceName","serviceType","serviceX","serviceY","serviceZ"].forEach(id=>$(id).onchange=()=>{
 const s=state.services.find(x=>x.id===selected.id);if(!s)return;checkpoint();s.name=$("serviceName").value.trim()||s.name;s.type=$("serviceType").value;s.x=Number($("serviceX").value)||0;s.y=Number($("serviceY").value)||0;s.z=Math.max(0,Number($("serviceZ").value)||0);save();render();openSelectedSheet();
});

function refreshDoorEverywhere(){save();sync();resetView(false);render();if(selected.kind==="opening"&&selected.id==="door")openSelectedSheet();if(window.BP3DView?.refresh)window.BP3DView.refresh();}
function flipDoorOpening(){state.room.door.swingDirection=state.room.door.swingDirection==="out"?"in":"out";refreshDoorEverywhere();}
function flipDoorHinge(){state.room.door.hinge=state.room.door.hinge==="top"?"bottom":"top";refreshDoorEverywhere();}
$("doorSwingDirection")?.addEventListener("change",e=>{checkpoint();state.room.door.swingDirection=e.target.value==="out"?"out":"in";refreshDoorEverywhere()});
$("flipDoorOpeningBtn")?.addEventListener("click",()=>{checkpoint();flipDoorOpening()});
$("flipDoorOpeningSheetBtn")?.addEventListener("click",()=>{checkpoint();flipDoorOpening()});
$("flipDoorHingeBtn")?.addEventListener("click",()=>{checkpoint();flipDoorHinge()});
$("flipDoorHingeSheetBtn")?.addEventListener("click",()=>{checkpoint();flipDoorHinge()});

const numPaths={
 roomWidth:["room","width"],roomDepth:["room","depth"],ceilingHeight:["room","ceiling"],tolerance:["room","tolerance"],
 windowBefore:["room","window","before"],windowWidth:["room","window","width"],windowAfter:["room","window","after"],windowSill:["room","window","sill"],windowHeight:["room","window","height"],
 doorBefore:["room","door","before"],doorWidth:["room","door","width"],doorLeafWidth:["room","door","leafWidth"],doorAfter:["room","door","after"],doorHeight:["room","door","height"]
};
Object.entries(numPaths).forEach(([id,path])=>$(id).onchange=()=>{
 checkpoint();let o=state;for(let i=0;i<path.length-1;i++)o=o[path[i]];o[path[path.length-1]]=Math.max(0,Number($(id).value)||0);
 if(id==="doorWidth"||id==="doorLeafWidth")state.room.door.leafWidth=Math.max(100,Math.min(Math.max(100,Number(state.room.door.width)||100),Number(state.room.door.leafWidth)||100));
 save();baseView=makeBaseView();view={...baseView};sync();render();
});
[["projectName","name"],["projectPlanName","planName"],["notes","notes"]].forEach(([id,key])=>$(id).onchange=()=>{checkpoint();state.project[key]=$(id).value;save();render();renderPlanVariants()});

$("planVariantSelect")?.addEventListener("change",e=>loadPlanVariant(e.target.value));
$("duplicatePlanBtn")?.addEventListener("click",()=>{
 checkpoint();syncWorkingToActivePlan();const source=activePlanVariant(),suggest=`${source.name||"Plan"} copy`,name=(prompt("Name for the copied plan",suggest)||"").trim();if(!name)return;
 const id="plan-"+Date.now().toString(36),now=new Date().toISOString(),copyPlan={id,name,items:clone(state.items||[]),services:clone(state.services||[]),createdAt:now,updatedAt:now};state.planVariants.push(copyPlan);state.activePlanId=id;state.project.planName=name;save();sync();render();renderPlanVariants();if(window.BP3DView?.refresh)window.BP3DView.refresh();
});
$("renamePlanBtn")?.addEventListener("click",()=>{
 const v=activePlanVariant(),name=(prompt("Rename this plan",v.name||"Plan")||"").trim();if(!name)return;checkpoint();v.name=name;state.project.planName=name;save();sync();render();renderPlanVariants();
});
$("deletePlanBtn")?.addEventListener("click",()=>{
 ensurePlanVariants();if(state.planVariants.length<=1)return;const current=activePlanVariant();if(!confirm(`Delete plan '${current.name}'? The other saved plans will stay.`))return;checkpoint();const idx=state.planVariants.findIndex(v=>v.id===current.id);state.planVariants.splice(idx,1);const next=state.planVariants[Math.max(0,Math.min(idx,state.planVariants.length-1))];state.activePlanId=next.id;state.items=clone(next.items||[]);state.services=clone(next.services||[]);state.project.planName=next.name;save();sync();resetView(false);render();renderPlanVariants();if(window.BP3DView?.refresh)window.BP3DView.refresh();
});

$("exportBtn").onclick=()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="bathroom-planner-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(u),500)};
$("importInput").onchange=async e=>{try{const p=JSON.parse(await e.target.files[0].text());if(!p.room||!Array.isArray(p.items))throw Error("Invalid backup");checkpoint();localStorage.setItem(KEY,JSON.stringify(p));location.reload()}catch(err){alert(err.message)}e.target.value=""};
$("resetBtn").onclick=()=>{if(!confirm("Reset to the starter plan?"))return;checkpoint();state=clone(starter);selected={kind:null,id:null};save();sync();resetView(false);render()};
$("reloadBtn").onclick=async()=>{try{if("serviceWorker"in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()))}if("caches"in window){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(_){}const u=new URL(location.href);u.searchParams.set("v",Date.now());location.replace(u.toString())};

$("zoomInBtn").onclick=()=>{const r=svg.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1.25)};
$("zoomOutBtn").onclick=()=>{const r=svg.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,.8)};
$("fitBtn").onclick=()=>resetView();

function center(a,b){return{x:(a.clientX+b.clientX)/2,y:(a.clientY+b.clientY)/2}}
function distance(a,b){return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}
function startPinch(){
 const ps=[...activePointers.values()];if(ps.length<2)return;
 drag=null;serviceDrag=null;pan=null;
 const c=center(ps[0],ps[1]);pinch={startDist:distance(ps[0],ps[1]),startView:{...view},centerClient:c};
}
function updatePinch(){
 const ps=[...activePointers.values()];if(ps.length<2||!pinch)return;
 const c=center(ps[0],ps[1]),d=Math.max(20,distance(ps[0],ps[1])),factor=d/pinch.startDist;
 view={...pinch.startView};
 const p=pointFromClient(pinch.centerClient.x,pinch.centerClient.y),ow=view.w,oh=view.h;
 let nw=Math.max(baseView.w/5,Math.min(baseView.w,ow/factor)),nh=Math.max(baseView.h/5,Math.min(baseView.h,oh/factor));
 const rx=(p.x-view.x)/ow,ry=(p.y-view.y)/oh;view.x=p.x-rx*nw;view.y=p.y-ry*nh;view.w=nw;view.h=nh;
 const pNow=pointFromClient(c.x,c.y);view.x+=p.x-pNow.x;view.y+=p.y-pNow.y;clampView();applyView();render();
}

svg.addEventListener("pointerdown",e=>{
 activePointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});
 if(activePointers.size===2){e.preventDefault();startPinch()}
},{capture:true,passive:false});

svg.addEventListener("pointerdown",e=>{
 if(activePointers.size>=2)return;
 if(manualMode){
  if(e.target===svg||e.target.classList.contains("roomfill")||e.target.classList.contains("gridMajor")||e.target.classList.contains("gridMinor")){e.preventDefault();handleMeasureTap(e)}
  return;
 }
 if(e.target===svg||e.target.classList.contains("roomfill")||e.target.classList.contains("gridMajor")||e.target.classList.contains("gridMinor")){
  selected={kind:null,id:null};closeObjectSheet();
  if(currentZoom()>1.01){
   const p=point(e);pan={pointerId:e.pointerId,startSvg:p,startView:{...view}};try{svg.setPointerCapture(e.pointerId)}catch(_){}
  }
  render();
 }
},{passive:false});

svg.addEventListener("pointermove",e=>{
 if(activePointers.has(e.pointerId))activePointers.set(e.pointerId,{clientX:e.clientX,clientY:e.clientY});
 if(activePointers.size>=2){e.preventDefault();updatePinch();return}
 if(moveItem(e)||moveService(e))return;
 if(pan&&e.pointerId===pan.pointerId){
  e.preventDefault();const now=pointFromClient(e.clientX,e.clientY);view={...pan.startView};view.x+=pan.startSvg.x-now.x;view.y+=pan.startSvg.y-now.y;clampView();applyView();render();
 }
},{passive:false});

function finishPointer(e){
 activePointers.delete(e.pointerId);
 if(pan&&e.pointerId===pan.pointerId)pan=null;
 if(activePointers.size<2)pinch=null;
 endDrags(e);
}
svg.addEventListener("pointerup",finishPointer);
svg.addEventListener("pointercancel",finishPointer);

sync();updateUndoRedo();resetView(false);render();renderProducts();if(window.BPSurfaces?.render)window.BPSurfaces.render();
$("statusHint").textContent="Drag fixtures · pinch to zoom · select an item, then tap Details to edit. · V"+VERSION;

window.BP3D={
 getState:()=>state,
 getSelected:()=>selected,
 selectItem:(id)=>{
  selected={kind:"item",id};
  render();
  openSelectedSheet();
 },
 refresh2D:()=>render(),
 persist:()=>save(),
 renderProducts:()=>renderProducts(),
 checkpoint:()=>checkpoint(),
 moveItem3D:(id,x,y)=>{const i=state.items.find(v=>v.id===id);if(!i||i.locked||i.type==="niche"||WALL_MOUNT_TYPES.has(i.type))return null;const d=itemDims(i);i.x=Math.round(Math.max(0,Math.min(state.room.width-d.w,Number(x)||0)));i.y=Math.round(Math.max(0,Math.min(state.room.depth-d.h,Number(y)||0)));return {x:i.x,y:i.y,w:d.w,h:d.h};},
 moveWallItem3D:(id,along,z)=>{const i=state.items.find(v=>v.id===id);if(!i||i.locked||!WALL_MOUNT_TYPES.has(i.type))return null;const host=i.mountHost||i.mountWall||"left",stud=hostStud(host),span=stud?Math.max(20,Number(stud.w)||900):((host==="left"||host==="right")?state.room.depth:state.room.width),half=Math.min(span/2,mountPlanSpan(i)/2);i.mountAlong=Math.round(Math.max(half,Math.min(span-half,Number(along)||half)));i.z=Math.round(Math.max(0,Math.min(state.room.ceiling-(Number(i.height)||1),Number(z)||0)));syncMountedItemPlan(i);return {along:i.mountAlong,z:i.z,x:i.x,y:i.y,host};},
 clone:(v)=>clone(v),
 replaceState:(v)=>{localStorage.setItem(KEY,JSON.stringify(v));location.reload()},
 storageKey:KEY,
 version:VERSION,
 schemaVersion:6
};

})();
