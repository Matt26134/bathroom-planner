(function(){
"use strict";
const api=window.BP3D;
if(!api){console.warn("V3 manager: BP3D API unavailable");return;}
const $=id=>document.getElementById(id);
const clone=v=>JSON.parse(JSON.stringify(v));
const st=()=>api.getState();
const selectedItem=()=>{const sel=api.getSelected?.();return sel?.kind==="item"?(st().items||[]).find(i=>i.id===sel.id):null};
const productById=id=>(st().products||[]).find(p=>p.id===id);
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const WALL_TYPES=new Set(["mirror","rainHead","handset","showerControls"]);
let comparePreview=null;

function rotatedDims(i){
  const w=Math.max(0,Number(i.w)||0),d=Math.max(0,Number(i.h)||0),a=((((Number(i.rotation)||0)%360)+360)%360)*Math.PI/180,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));
  return {w:w*c+d*s,d:w*s+d*c};
}
function bbox(i){const d=rotatedDims(i);return{x1:Number(i.x)||0,y1:Number(i.y)||0,x2:(Number(i.x)||0)+d.w,y2:(Number(i.y)||0)+d.d,w:d.w,d:d.d};}
function overlaps(a,b){const A=bbox(a),B=bbox(b);return A.x1<B.x2&&A.x2>B.x1&&A.y1<B.y2&&A.y2>B.y1;}
function center(i){const b=bbox(i);return{x:b.x1+b.w/2,y:b.y1+b.d/2};}
function worldPoint(i,lx,ly){
  const w=Number(i.w)||0,d=Number(i.h)||0,ang=((((Number(i.rotation)||0)%360)+360)%360)*Math.PI/180,c=Math.cos(ang),s=Math.sin(ang),cx=(Number(i.x)||0)+rotatedDims(i).w/2,cy=(Number(i.y)||0)+rotatedDims(i).d/2;
  const dx=lx-w/2,dy=ly-d/2;return{x:Math.round(cx+dx*c-dy*s),y:Math.round(cy+dx*s+dy*c)};
}
function refreshAll(save=true){if(save)api.persist?.();api.refresh2D?.();window.BP3DView?.refresh?.();renderScene();renderSchedule();renderInspectorV3();}

function ensureV3State(){
  const s=st();
  s.schemaVersion=Math.max(7,Number(s.schemaVersion)||0);
  s.assemblies=Array.isArray(s.assemblies)?s.assemblies:[];
  s.project=s.project||{};
  s.project.finishPalette={metal:s.project.globalFixtureFinish||"use-item",sanitary:"bright-white",furniture:"product",glass:"fluted",glassTrim:"inherit-metal",...(s.project.finishPalette||{})};
  s.project.globalFixtureFinish=s.project.finishPalette.metal||s.project.globalFixtureFinish||"use-item";
  s.ui=s.ui||{};s.ui.wallMode=s.ui.wallMode||"auto";s.ui.fidelity=s.ui.fidelity||"detailed";s.ui.savedCamera=s.ui.savedCamera||null;
  (s.items||[]).forEach(i=>{if(i.visible==null)i.visible=true;i.v3=i.v3||{};});
  (s.products||[]).forEach(p=>{
    p.render3d=p.render3d||{profile:"auto",finish:"auto"};
    p.configSchema=p.configSchema||{};
    const sku=String(p.sku||"").trim().toUpperCase();
    if(sku==="ODAR2X6FSFLCALWTOP"){
      p.configSchema.topStyle={label:"Top",type:"select",options:[{value:"countertop",label:"Walnut countertop"},{value:"double-basin",label:"Integrated double ceramic basin"},{value:"double-vessel",label:"Two vessel basins on walnut top"}],default:"countertop"};
      p.configSchema.basinCount={label:"Basins",type:"number",min:0,max:2,default:0};
      p.drawerConfiguration="2 columns x 2 rows";
    }
  });
  syncPaletteUI();sync3DUI();
  api.persist?.();
}

function recoveryKey(){return "bathroomPlannerV3Recovery";}
function loadRecovery(){try{return JSON.parse(localStorage.getItem(recoveryKey())||"[]")||[]}catch(_){return[]}}
function saveRecovery(list){try{localStorage.setItem(recoveryKey(),JSON.stringify(list.slice(0,6)))}catch(_){}renderRecovery();}
function makeRecovery(label="Manual restore point"){
  const s=st(),snap={id:uid("r"),at:new Date().toISOString(),label,data:{room:clone(s.room),items:clone(s.items||[]),services:clone(s.services||[]),project:clone(s.project||{}),assemblies:clone(s.assemblies||[]),activePlanId:s.activePlanId,planVariants:clone(s.planVariants||[])}};
  const list=loadRecovery();list.unshift(snap);saveRecovery(list);return snap;
}
function restoreRecovery(id){
  const snap=loadRecovery().find(r=>r.id===id);if(!snap)return;
  if(!confirm(`Restore '${snap.label}' from ${new Date(snap.at).toLocaleString()}?`))return;
  const s=clone(st());Object.assign(s,clone(snap.data));api.replaceState?.(s);
}
function renderRecovery(){
  const sel=$("recoverySelect");if(!sel)return;const list=loadRecovery();sel.innerHTML="";
  if(!list.length){const o=document.createElement("option");o.value="";o.textContent="No restore points yet";sel.appendChild(o);return;}
  list.forEach(r=>{const o=document.createElement("option");o.value=r.id;o.textContent=`${r.label} · ${new Date(r.at).toLocaleString()}`;sel.appendChild(o)});
}

function assemblyById(id){return(st().assemblies||[]).find(a=>a.id===id)}
function itemAssembly(i){return i?.assemblyId?assemblyById(i.assemblyId):null}
function newAssembly(name,type="custom",itemIds=[]){
  const s=st(),a={id:uid("asm-"),name:name||"Assembly",type,itemIds:[...new Set(itemIds)],visible:true,locked:false};s.assemblies.push(a);
  a.itemIds.forEach(id=>{const i=s.items.find(x=>x.id===id);if(i)i.assemblyId=a.id});return a;
}
function distance(a,b){const A=center(a),B=center(b);return Math.hypot(A.x-B.x,A.y-B.y)}
function smartAssemblies(){
  makeRecovery("Before smart assemblies");const s=st();
  // Preserve custom assemblies but replace previous auto zones.
  const autoIds=new Set((s.assemblies||[]).filter(a=>a.auto).map(a=>a.id));
  s.items.forEach(i=>{if(autoIds.has(i.assemblyId))delete i.assemblyId});s.assemblies=(s.assemblies||[]).filter(a=>!a.auto);
  const vanities=s.items.filter(i=>i.type==="vanity");
  vanities.forEach((v,n)=>{const ids=[v.id];s.items.forEach(i=>{if(i.id===v.id||i.assemblyId)return;const prod=productById(i.productId);if((i.type==="mirror"||prod?.type==="tap")&&distance(v,i)<950)ids.push(i.id)});const a=newAssembly(vanities.length>1?`Vanity zone ${n+1}`:"Vanity zone","vanity",ids);a.auto=true;});
  const showers=s.items.filter(i=>i.type==="shower");
  showers.forEach((sh,n)=>{const ids=[sh.id];s.items.forEach(i=>{if(i.id===sh.id||i.assemblyId)return;if(["stud","glassPanel","rainHead","handset","showerControls","niche"].includes(i.type)&&(distance(sh,i)<1250||String(i.mountHost||"").startsWith("stud:")))ids.push(i.id)});const a=newAssembly(showers.length>1?`Shower zone ${n+1}`:"Shower zone","shower",ids);a.auto=true;});
  s.items.filter(i=>i.type==="bath").forEach((b,n)=>{const ids=[b.id];s.items.forEach(i=>{const p=productById(i.productId);if(i.id!==b.id&&!i.assemblyId&&p?.type==="tap"&&distance(b,i)<900)ids.push(i.id)});const a=newAssembly(`Bath zone${n?` ${n+1}`:""}`,"bath",ids);a.auto=true;});
  s.items.filter(i=>i.type==="wc"&&!i.assemblyId).forEach((wc,n)=>{const ids=[wc.id];s.items.forEach(i=>{const p=productById(i.productId);if(!i.assemblyId&&i.id!==wc.id&&(p?.render3d?.profile==="architeckt-trh-1269407"||p?.render3d?.profile==="generic-toilet-roll")&&distance(wc,i)<850)ids.push(i.id)});const a=newAssembly(`WC zone${n?` ${n+1}`:""}`,"wc",ids);a.auto=true;});
  refreshAll(true);
}
function setAssemblyVisibility(a,visible){a.visible=visible;a.itemIds.forEach(id=>{const i=st().items.find(x=>x.id===id);if(i)i.visible=visible});refreshAll(true)}
function setAssemblyLocked(a,locked){a.locked=locked;a.itemIds.forEach(id=>{const i=st().items.find(x=>x.id===id);if(i)i.locked=locked});refreshAll(true)}
function nudgeAssembly(a,dx,dy){
  if(!a)return;makeRecovery(`Before moving ${a.name}`);const s=st();
  a.itemIds.forEach(id=>{const i=s.items.find(x=>x.id===id);if(!i||i.locked)return;const host=i.mountHost||i.mountWall;
    if(WALL_TYPES.has(i.type)&&host&&host!=="free"){
      if(host==="left"||host==="right")i.mountAlong=Math.max(0,(Number(i.mountAlong)||0)+dy);
      else if(host==="window"||host==="opposite")i.mountAlong=Math.max(0,(Number(i.mountAlong)||0)+dx);
    }else{i.x=Math.round((Number(i.x)||0)+dx);i.y=Math.round((Number(i.y)||0)+dy);}
  });refreshAll(true);
}

function iconButton(text,title,handler){const b=document.createElement("button");b.type="button";b.textContent=text;b.title=title;b.className="sceneIconBtn";b.onclick=e=>{e.stopPropagation();handler()};return b;}
function sceneItemRow(i){
  const row=document.createElement("div");row.className="sceneRow"+(i.visible===false?" isHidden":"")+(i.locked?" isLocked":"");
  const main=document.createElement("button");main.type="button";main.className="sceneName";const prod=productById(i.productId);main.innerHTML=`<strong>${escapeHtml(i.name||i.type)}</strong><span>${escapeHtml(prod?.sku||i.type)} · ${Math.round(Number(i.w)||0)}×${Math.round(Number(i.h)||0)} mm</span>`;main.onclick=()=>api.selectItem?.(i.id);row.appendChild(main);
  row.appendChild(iconButton(i.visible===false?"○":"◉",i.visible===false?"Show":"Hide",()=>{i.visible=i.visible===false;refreshAll(true)}));
  row.appendChild(iconButton(i.locked?"🔒":"🔓",i.locked?"Unlock":"Lock",()=>{i.locked=!i.locked;refreshAll(true)}));
  return row;
}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function renderScene(){
  const box=$("sceneList");if(!box)return;box.innerHTML="";const s=st(),assigned=new Set();
  (s.assemblies||[]).forEach(a=>{const wrap=document.createElement("div");wrap.className="assemblyCard";const head=document.createElement("div");head.className="assemblyHead";const name=document.createElement("div");name.innerHTML=`<strong>${escapeHtml(a.name)}</strong><span>${a.itemIds.length} item${a.itemIds.length===1?"":"s"} · ${escapeHtml(a.type||"assembly")}</span>`;head.appendChild(name);head.appendChild(iconButton(a.visible===false?"○":"◉","Show/hide assembly",()=>setAssemblyVisibility(a,a.visible===false)));head.appendChild(iconButton(a.locked?"🔒":"🔓","Lock/unlock assembly",()=>setAssemblyLocked(a,!a.locked)));wrap.appendChild(head);const list=document.createElement("div");list.className="assemblyItems";a.itemIds.forEach(id=>{const i=s.items.find(x=>x.id===id);if(i){assigned.add(i.id);list.appendChild(sceneItemRow(i))}});wrap.appendChild(list);box.appendChild(wrap)});
  const un=(s.items||[]).filter(i=>!assigned.has(i.id));if(un.length){const title=document.createElement("div");title.className="sceneSubhead";title.textContent="Ungrouped";box.appendChild(title);un.forEach(i=>box.appendChild(sceneItemRow(i)))}
  renderAssemblySelects();renderChecks();
}
function renderAssemblySelects(){
  [$("assemblySelect"),$("v3ItemAssembly")].forEach(sel=>{if(!sel)return;const current=sel.id==="v3ItemAssembly"?(selectedItem()?.assemblyId||""):sel.value;sel.innerHTML='<option value="">None</option>';(st().assemblies||[]).forEach(a=>{const o=document.createElement("option");o.value=a.id;o.textContent=a.name;sel.appendChild(o)});if([...sel.options].some(o=>o.value===current))sel.value=current;});
}

function nearestWall(i){const b=bbox(i),r=st().room,opts=[{name:"left",gap:b.x1},{name:"right",gap:r.width-b.x2},{name:"window",gap:b.y1},{name:"opposite",gap:r.depth-b.y2}].sort((a,b)=>a.gap-b.gap);return opts[0];}
function applyAlign(action){
  const i=selectedItem();if(!i||i.locked)return;makeRecovery(`Before align ${i.name}`);const s=st(),d=rotatedDims(i);
  if(action==="centre-x")i.x=Math.round((s.room.width-d.w)/2);
  if(action==="centre-y")i.y=Math.round((s.room.depth-d.d)/2);
  if(action==="touch-wall"||action==="gap-10"){
    const gap=action==="gap-10"?10:0,w=nearestWall(i);if(w.name==="left")i.x=gap;if(w.name==="right")i.x=Math.round(s.room.width-d.w-gap);if(w.name==="window")i.y=gap;if(w.name==="opposite")i.y=Math.round(s.room.depth-d.d-gap);
  }
  if(action==="nearest-edge"){
    const others=(s.items||[]).filter(o=>o.id!==i.id&&o.visible!==false&&!WALL_TYPES.has(o.type));if(others.length){others.sort((a,b)=>distance(i,a)-distance(i,b));const B=bbox(others[0]),A=bbox(i),candidates=[{v:B.x1,axis:"x"},{v:B.x2-A.w,axis:"x"},{v:B.y1,axis:"y"},{v:B.y2-A.d,axis:"y"}];candidates.sort((a,b)=>Math.abs((a.axis==="x"?A.x1:A.y1)-a.v)-Math.abs((b.axis==="x"?A.x1:A.y1)-b.v));if(candidates[0].axis==="x")i.x=Math.round(candidates[0].v);else i.y=Math.round(candidates[0].v);}
  }
  if(action==="equal-gap"){
    const A=bbox(i),others=(s.items||[]).filter(o=>o.id!==i.id&&o.visible!==false&&!WALL_TYPES.has(o.type)).map(o=>bbox(o));
    const leftEdges=[0,...others.filter(B=>B.x2<=A.x1&&B.y1<A.y2&&B.y2>A.y1).map(B=>B.x2)],rightEdges=[s.room.width,...others.filter(B=>B.x1>=A.x2&&B.y1<A.y2&&B.y2>A.y1).map(B=>B.x1)];
    const L=Math.max(...leftEdges),R=Math.min(...rightEdges);if(R-L>A.w)i.x=Math.round(L+(R-L-A.w)/2);
  }
  if(action==="centre-vanity"){
    const v=(s.items||[]).filter(o=>o.type==="vanity"&&o.id!==i.id).sort((a,b)=>distance(i,a)-distance(i,b))[0];if(v){const V=bbox(v);i.x=Math.round(V.x1+V.w/2-d.w/2);i.y=Math.round(V.y1+V.d/2-d.d/2);}
  }
  if(action==="glass-tray"&&i.type==="glassPanel"){
    const sh=(s.items||[]).filter(o=>o.type==="shower").sort((a,b)=>distance(i,a)-distance(i,b))[0];if(sh){const B=bbox(sh);i.x=Math.round(B.x1);i.y=Math.round(B.y1);i.w=Math.round(B.w);i.h=Math.max(6,Number(i.glassThickness)||10);}
  }
  refreshAll(true);
}

function renderInspectorV3(){
  const i=selectedItem();if(!i)return;renderAssemblySelects();
  const vis=$("v3ItemVisibility");if(vis)vis.value=i.visible===false?"hidden":"visible";
  const cfg=$("v3ConfigFields");if(cfg){cfg.innerHTML="";const p=productById(i.productId),schema=p?.configSchema||{};
    const addSelect=(key,label,options,value,handler)=>{const lab=document.createElement("label");lab.textContent=label;const sel=document.createElement("select");options.forEach(o=>{const op=document.createElement("option");op.value=o.value;op.textContent=o.label??o.value;sel.appendChild(op)});sel.value=value;sel.onchange=()=>{makeRecovery(`Before changing ${label}`);handler(sel.value);refreshAll(true)};lab.appendChild(sel);cfg.appendChild(lab)};
    const addNumber=(key,label,spec,value,handler)=>{const lab=document.createElement("label");lab.textContent=label;const inp=document.createElement("input");inp.type="number";if(spec.min!=null)inp.min=spec.min;if(spec.max!=null)inp.max=spec.max;if(spec.step!=null)inp.step=spec.step;inp.value=value;inp.onchange=()=>{let v=Number(inp.value);if(!Number.isFinite(v))v=Number(spec.default)||0;if(spec.min!=null)v=Math.max(Number(spec.min),v);if(spec.max!=null)v=Math.min(Number(spec.max),v);makeRecovery(`Before changing ${label}`);handler(v);refreshAll(true)};lab.appendChild(inp);cfg.appendChild(lab)};
    i.config=i.config||{};
    Object.entries(schema).forEach(([key,spec])=>{
      const label=spec.label||key,stored=key==="topStyle"?(i.vanityTopStyle??i.config[key]??spec.default):(i.config[key]??spec.default);
      const set=v=>{i.config[key]=v;if(key==="topStyle")i.vanityTopStyle=v;if(key==="basinConfiguration"){i.v3=i.v3||{};i.v3.basin=v}if(key==="fixtureFinish")i.finish=v};
      if(spec.type==="select"&&Array.isArray(spec.options))addSelect(key,label,spec.options,stored,set);else if(spec.type==="number")addNumber(key,label,spec,stored,set);
    });
    if(i.type==="bath")addSelect("family","Bath shape",[{value:"auto",label:"Product / automatic"},{value:"single-ended",label:"Single ended"},{value:"double-ended",label:"Double ended"},{value:"back-to-wall",label:"Back-to-wall"},{value:"freestanding",label:"Freestanding"}],i.v3?.family||"auto",v=>{i.v3.family=v});
    if(i.type==="wc")addSelect("family","WC shape",[{value:"auto",label:"Product / automatic"},{value:"close-coupled",label:"Close coupled"},{value:"back-to-wall",label:"Back-to-wall"},{value:"wall-hung",label:"Wall hung"}],i.v3?.family||"auto",v=>{i.v3.family=v});
    if(i.type==="vanity"&&!schema.basinConfiguration&&!schema.topStyle)addSelect("basin","Basin configuration",[{value:"auto",label:"Product / automatic"},{value:"single-integrated",label:"Single integrated"},{value:"double-integrated",label:"Double integrated"},{value:"single-vessel",label:"Single vessel"},{value:"double-vessel",label:"Double vessel"}],i.v3?.basin||"auto",v=>{i.v3.basin=v});
    if(!Object.keys(schema).length&&!['bath','wc','vanity'].includes(i.type))cfg.innerHTML='<p class="muted">No configurable product options for this item.</p>';
  }
  const rel=$("v3InspectorRelations");if(rel){const a=itemAssembly(i),targets=serviceTargetsForItem(i);rel.innerHTML=`<strong>${a?escapeHtml(a.name):"No assembly"}</strong><br>${targets.length?`${targets.length} suggested service target${targets.length===1?"":"s"}: ${targets.map(t=>escapeHtml(t.type)).join(", ")}`:"No generated service targets for this object."}`;}
}

function renderChecks(){
  const out=$("sceneChecks");if(!out)return;const s=st(),warnings=[];
  const floor=(s.items||[]).filter(i=>i.visible!==false&&!WALL_TYPES.has(i.type)&&!["niche","glassPanel"].includes(i.type));
  floor.forEach((i,idx)=>{const A=bbox(i);if(A.x1<0||A.y1<0||A.x2>s.room.width||A.y2>s.room.depth)warnings.push({level:"bad",text:`${i.name}: extends outside the room.`});for(let j=idx+1;j<floor.length;j++){const o=floor[j];if(!overlaps(i,o))continue;const intentional=new Set(["stud|shower","shower|stud"]);if(!intentional.has(`${i.type}|${o.type}`))warnings.push({level:"warn",text:`${i.name} overlaps ${o.name}.`});}
    if(i.type==="wc"){const left=A.x1,right=s.room.width-A.x2;if(Math.min(left,right)<200)warnings.push({level:"note",text:`${i.name}: side clearance to a room wall is under 200 mm. Check comfort/installation requirements.`});}
    if(i.type==="vanity"){const frontZone={x1:A.x1,y1:A.y2,x2:A.x2,y2:Math.min(s.room.depth,A.y2+450)};const block=floor.find(o=>o.id!==i.id&&bbox(o).x1<frontZone.x2&&bbox(o).x2>frontZone.x1&&bbox(o).y1<frontZone.y2&&bbox(o).y2>frontZone.y1);if(block)warnings.push({level:"note",text:`${i.name}: ${block.name} sits within an approximate 450 mm drawer/opening zone.`});}
  });
  const tol=Number(s.room.tolerance)||20;floor.forEach(i=>{const A=bbox(i),g=Math.min(A.x1,A.y1,s.room.width-A.x2,s.room.depth-A.y2);if(g>0&&g<tol)warnings.push({level:"note",text:`${i.name}: ${Math.round(g)} mm from a room edge, below your ${tol} mm design tolerance.`})});
  if(!warnings.length)warnings.push({level:"ok",text:"No obvious bounding-box collisions or tolerance issues detected."});
  out.innerHTML=warnings.map(w=>`<div class="v3Check ${w.level}">${escapeHtml(w.text)}</div>`).join("");
}

function serviceTargetsForItem(i){
  const p=productById(i.productId),targets=[],zBase=Math.max(0,Number(i.z)||0);const add=(type,name,x,y,z)=>targets.push({type,name,x:Math.round(x),y:Math.round(y),z:Math.round(z),sourceItemId:i.id});
  if(i.type==="vanity"){
    const double=(i.vanityTopStyle==="double-basin"||i.vanityTopStyle==="double-vessel"||i.v3?.basin==="double-integrated"||i.v3?.basin==="double-vessel"),xs=double?[.28,.72]:[.5];xs.forEach((q,n)=>{const pt=worldPoint(i,(Number(i.w)||800)*q,(Number(i.h)||450)*.18);add("hot",`${i.name} basin ${n+1} hot`,pt.x,pt.y,zBase+520);add("cold",`${i.name} basin ${n+1} cold`,pt.x+35,pt.y,zBase+520);add("waste",`${i.name} basin ${n+1} waste`,pt.x,pt.y+25,zBase+420);});
  }else if(i.type==="wc"){const pt=worldPoint(i,(Number(i.w)||370)*.5,(Number(i.h)||640)*.10);add("soil",`${i.name} soil`,pt.x,pt.y,zBase+180);add("cold",`${i.name} cold`,pt.x+90,pt.y,zBase+250);
  }else if(i.type==="bath"){const pt=worldPoint(i,(Number(i.w)||1600)*.18,(Number(i.h)||700)*.16);add("hot",`${i.name} hot`,pt.x,pt.y,zBase+420);add("cold",`${i.name} cold`,pt.x+45,pt.y,zBase+420);const dr=worldPoint(i,(Number(i.w)||1600)*.50,(Number(i.h)||700)*.52);add("waste",`${i.name} waste`,dr.x,dr.y,zBase+60);
  }else if(i.type==="shower"){const dr=worldPoint(i,(Number(i.w)||1200)*.18,(Number(i.h)||800)*.60);add("waste",`${i.name} waste`,dr.x,dr.y,zBase+35);
  }else if(i.type==="showerControls"){const c=center(i);add("hot",`${i.name} hot`,c.x-25,c.y,Number(i.z)||950);add("cold",`${i.name} cold`,c.x+25,c.y,Number(i.z)||950);}
  return targets;
}
function allServiceTargets(){return(st().items||[]).flatMap(serviceTargetsForItem)}
function addGeneratedServiceTargets(){makeRecovery("Before generated service targets");const s=st();s.services=(s.services||[]).filter(x=>!x.generatedV3);allServiceTargets().forEach(t=>s.services.push({id:uid("svc-"),type:t.type,name:t.name,x:t.x,y:t.y,z:t.z,generatedV3:true,sourceItemId:t.sourceItemId}));refreshAll(true)}

function specRows(){
  const s=st(),map=new Map();(s.items||[]).forEach(i=>{if(i.visible===false)return;const p=productById(i.productId),key=p?.id||`generic:${i.type}:${i.name}`;if(!map.has(key))map.set(key,{qty:0,name:p?.name||i.name,sku:p?.sku||"—",supplier:p?.supplier||"—",finish:p?.finish||i.finish||"—",url:p?.url||"",dims:`${Math.round(Number(i.w)||0)}×${Math.round(Number(i.h)||0)}×${Math.round(Number(i.height)||0)} mm`});map.get(key).qty++});return [...map.values()];
}
function renderSchedule(){
  const spec=$("specSchedule");if(spec){const rows=specRows();spec.innerHTML=rows.length?`<div class="v3Table"><div class="v3TR head"><span>Qty</span><span>Item</span><span>SKU</span><span>Finish</span></div>${rows.map(r=>`<div class="v3TR"><span>${r.qty}</span><span><strong>${escapeHtml(r.name)}</strong><small>${escapeHtml(r.dims)} · ${escapeHtml(r.supplier)}</small></span><span>${escapeHtml(r.sku)}</span><span>${escapeHtml(r.finish)}</span></div>`).join("")}</div>`:"No items in this plan.";}
  const svc=$("serviceTargetList");if(svc){const t=allServiceTargets();svc.innerHTML=t.length?t.map(x=>`<div class="serviceTarget"><strong>${escapeHtml(x.name)}</strong><span>${escapeHtml(x.type)} · X ${x.x} · Y ${x.y} · Z ${x.z} mm</span></div>`).join(""):"<p class='muted'>No generated targets.</p>";}
  renderCompare();renderRecovery();
}
function downloadSchedule(){const rows=specRows(),lines=[["Qty","Item","SKU","Supplier","Finish","Dimensions","URL"],...rows.map(r=>[r.qty,r.name,r.sku,r.supplier,r.finish,r.dims,r.url])];const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`;const blob=new Blob([lines.map(r=>r.map(esc).join(",")).join("\n")],{type:"text/csv"});const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="bathroom-v3-spec-schedule.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),500)}

function planMetrics(items){const r=st().room,area=r.width*r.depth;let occupied=0;(items||[]).filter(i=>!["mirror","rainHead","handset","showerControls","niche","glassPanel"].includes(i.type)).forEach(i=>{const b=bbox(i);occupied+=b.w*b.d});return{items:(items||[]).length,occupied:Math.min(999,occupied/area*100),vanity:Math.max(0,...(items||[]).filter(i=>i.type==="vanity").map(i=>Number(i.w)||0)),shower:Math.max(0,...(items||[]).filter(i=>i.type==="shower").map(i=>(Number(i.w)||0)*(Number(i.h)||0)/1e6))};}
function renderCompare(){
  const sel=$("comparePlanSelect"),out=$("compareMetrics");if(!sel||!out)return;const s=st(),variants=s.planVariants||[];const current=sel.value;sel.innerHTML="";variants.filter(v=>v.id!==s.activePlanId).forEach(v=>{const o=document.createElement("option");o.value=v.id;o.textContent=v.name;sel.appendChild(o)});if(current&&[...sel.options].some(o=>o.value===current))sel.value=current;
  const v=variants.find(x=>x.id===sel.value);if(!v){out.innerHTML="<p class='muted'>Duplicate a plan to compare alternatives.</p>";return;}const A=planMetrics(s.items),B=planMetrics(v.items);out.innerHTML=`<div><span>Objects</span><strong>${A.items} ↔ ${B.items}</strong></div><div><span>Approx. floor footprint</span><strong>${A.occupied.toFixed(0)}% ↔ ${B.occupied.toFixed(0)}%</strong></div><div><span>Largest vanity</span><strong>${A.vanity} ↔ ${B.vanity} mm</strong></div><div><span>Largest shower</span><strong>${A.shower.toFixed(2)} ↔ ${B.shower.toFixed(2)} m²</strong></div>`;
}
function previewCompare(){const s=st(),v=(s.planVariants||[]).find(x=>x.id===$("comparePlanSelect")?.value);if(!v||comparePreview)return;comparePreview={items:clone(s.items||[]),services:clone(s.services||[])};s.items=clone(v.items||[]);s.services=clone(v.services||[]);$("previewCompareBtn")?.classList.add("hidden");$("returnCompareBtn")?.classList.remove("hidden");api.refresh2D?.();window.BP3DView?.refresh?.();}
function returnCompare(){if(!comparePreview)return;const s=st();s.items=comparePreview.items;s.services=comparePreview.services;comparePreview=null;$("previewCompareBtn")?.classList.remove("hidden");$("returnCompareBtn")?.classList.add("hidden");api.refresh2D?.();window.BP3DView?.refresh?.();}

function syncPaletteUI(){const p=st().project.finishPalette||{};if($("paletteMetal"))$("paletteMetal").value=p.metal||"use-item";if($("paletteSanitary"))$("paletteSanitary").value=p.sanitary||"bright-white";if($("paletteFurniture"))$("paletteFurniture").value=p.furniture||"product";if($("paletteGlass"))$("paletteGlass").value=p.glass||"fluted";if($("paletteGlassTrim"))$("paletteGlassTrim").value=p.glassTrim||"inherit-metal";if($("paletteFidelity"))$("paletteFidelity").value=st().ui.fidelity||"detailed";if($("globalFixtureFinish"))$("globalFixtureFinish").value=p.metal||"use-item";}
function sync3DUI(){if($("wallMode"))$("wallMode").value=st().ui.wallMode||"auto";if($("fidelityMode"))$("fidelityMode").value=st().ui.fidelity||"detailed";}
function readPaletteUI(){const s=st();s.project.finishPalette={metal:$("paletteMetal")?.value||"use-item",sanitary:$("paletteSanitary")?.value||"bright-white",furniture:$("paletteFurniture")?.value||"product",glass:$("paletteGlass")?.value||"fluted",glassTrim:$("paletteGlassTrim")?.value||"inherit-metal"};s.project.globalFixtureFinish=s.project.finishPalette.metal;s.ui.fidelity=$("paletteFidelity")?.value||s.ui.fidelity||"detailed";}
function applyPalette(){makeRecovery("Before applying finish palette");readPaletteUI();const s=st(),p=s.project.finishPalette,trim=p.glassTrim==="inherit-metal"?(p.metal==="use-item"?null:p.metal):p.glassTrim;(s.items||[]).forEach(i=>{if(p.metal!=="use-item"&&["rainHead","handset","showerControls"].includes(i.type))i.finish=p.metal;if(i.type==="glassPanel"){i.v3=i.v3||{};i.v3.glassOverride=false;i.v3.trimOverride=false;i.glassStyle=p.glass;if(trim)i.glassTrimFinish=trim}const prod=productById(i.productId);if(p.metal!=="use-item"&&(prod?.type==="tap"||["radiator"].includes(i.type)))i.finish=p.metal;});s.ui.fidelity=$("paletteFidelity")?.value||"detailed";sync3DUI();refreshAll(true);}

function bind(){
  $("smartAssembliesBtn")?.addEventListener("click",smartAssemblies);
  $("showAllSceneBtn")?.addEventListener("click",()=>{st().items.forEach(i=>i.visible=true);(st().assemblies||[]).forEach(a=>a.visible=true);refreshAll(true)});
  $("unlockAllSceneBtn")?.addEventListener("click",()=>{st().items.forEach(i=>i.locked=false);(st().assemblies||[]).forEach(a=>a.locked=false);refreshAll(true)});
  document.querySelectorAll("[data-assembly-nudge]").forEach(b=>b.addEventListener("click",()=>{const a=assemblyById($("assemblySelect")?.value),m={left:[-50,0],right:[50,0],up:[0,-50],down:[0,50]}[b.dataset.assemblyNudge];if(a&&m)nudgeAssembly(a,m[0],m[1])}));
  $("newAssemblyBtn")?.addEventListener("click",()=>{const name=$("newAssemblyName")?.value.trim();if(!name)return;makeRecovery("Before new assembly");const a=newAssembly(name);$("newAssemblyName").value="";refreshAll(true);$("assemblySelect").value=a.id});
  $("addSelectedToAssemblyBtn")?.addEventListener("click",()=>{const i=selectedItem(),a=assemblyById($("assemblySelect")?.value);if(!i||!a)return;makeRecovery("Before assembly assignment");if(i.assemblyId){const old=assemblyById(i.assemblyId);if(old)old.itemIds=old.itemIds.filter(id=>id!==i.id)}i.assemblyId=a.id;if(!a.itemIds.includes(i.id))a.itemIds.push(i.id);refreshAll(true)});
  $("removeSelectedFromAssemblyBtn")?.addEventListener("click",()=>{const i=selectedItem();if(!i?.assemblyId)return;makeRecovery("Before removing assembly item");const a=assemblyById(i.assemblyId);if(a)a.itemIds=a.itemIds.filter(id=>id!==i.id);delete i.assemblyId;refreshAll(true)});
  $("v3ItemAssembly")?.addEventListener("change",e=>{const i=selectedItem();if(!i)return;makeRecovery("Before changing assembly");if(i.assemblyId){const old=assemblyById(i.assemblyId);if(old)old.itemIds=old.itemIds.filter(id=>id!==i.id)}i.assemblyId=e.target.value||undefined;const a=assemblyById(i.assemblyId);if(a&&!a.itemIds.includes(i.id))a.itemIds.push(i.id);refreshAll(true)});
  $("v3ItemVisibility")?.addEventListener("change",e=>{const i=selectedItem();if(!i)return;i.visible=e.target.value!=="hidden";refreshAll(true)});
  document.querySelectorAll("[data-v3-align]").forEach(b=>b.addEventListener("click",()=>applyAlign(b.dataset.v3Align)));
  ["paletteMetal","paletteSanitary","paletteFurniture","paletteGlass","paletteGlassTrim","paletteFidelity"].forEach(id=>$(id)?.addEventListener("change",()=>{readPaletteUI();sync3DUI();api.persist?.();window.BP3DView?.refresh?.()}));
  $("applyPaletteBtn")?.addEventListener("click",applyPalette);
  $("resetPaletteOverridesBtn")?.addEventListener("click",()=>{st().project.finishPalette.furniture="product";$("paletteFurniture").value="product";api.persist?.();window.BP3DView?.refresh?.()});
  $("globalFixtureFinish")?.addEventListener("change",e=>{st().project.finishPalette.metal=e.target.value;syncPaletteUI();api.persist?.();window.BP3DView?.refresh?.()});
  $("itemStudGlassStyle")?.addEventListener("change",()=>{const i=selectedItem();if(i?.type==="glassPanel"){i.v3=i.v3||{};i.v3.glassOverride=true;api.persist?.();window.BP3DView?.refresh?.()}});
  $("itemStudGlassTrim")?.addEventListener("change",()=>{const i=selectedItem();if(i?.type==="glassPanel"){i.v3=i.v3||{};i.v3.trimOverride=true;api.persist?.();window.BP3DView?.refresh?.()}});
  $("wallMode")?.addEventListener("change",e=>{st().ui.wallMode=e.target.value;api.persist?.();window.BP3DView?.setWallMode?.(e.target.value)});
  $("fidelityMode")?.addEventListener("change",e=>{st().ui.fidelity=e.target.value;$("paletteFidelity")&&($("paletteFidelity").value=e.target.value);api.persist?.();window.BP3DView?.setFidelity?.(e.target.value)});
  $("paletteFidelity")?.addEventListener("change",e=>{$("fidelityMode")&&($("fidelityMode").value=e.target.value);window.BP3DView?.setFidelity?.(e.target.value)});
  $("refreshScheduleBtn")?.addEventListener("click",renderSchedule);$("downloadScheduleBtn")?.addEventListener("click",downloadSchedule);$("addServiceTargetsBtn")?.addEventListener("click",addGeneratedServiceTargets);$("removeGeneratedServicesBtn")?.addEventListener("click",()=>{makeRecovery("Before removing generated services");st().services=(st().services||[]).filter(x=>!x.generatedV3);refreshAll(true)});
  $("comparePlanSelect")?.addEventListener("change",renderCompare);$("previewCompareBtn")?.addEventListener("click",previewCompare);$("returnCompareBtn")?.addEventListener("click",returnCompare);
  $("makeRecoveryBtn")?.addEventListener("click",()=>makeRecovery("Manual restore point"));$("restoreRecoveryBtn")?.addEventListener("click",()=>restoreRecovery($("recoverySelect")?.value));
  document.querySelectorAll(".tab").forEach(tab=>tab.addEventListener("click",()=>{if(tab.dataset.tab==="scene")setTimeout(renderScene,0);if(tab.dataset.tab==="schedule")setTimeout(renderSchedule,0)}));
  const sheet=$("objectSheet");if(sheet)new MutationObserver(()=>{if(!sheet.classList.contains("hidden"))setTimeout(renderInspectorV3,0)}).observe(sheet,{attributes:true,attributeFilter:["class"]});
  document.addEventListener("click",e=>{if(e.target.closest?.("[data-id],.sceneName,#selectionDetailsBtn"))setTimeout(renderInspectorV3,30)});
  window.addEventListener("beforeunload",()=>{if(comparePreview)returnCompare()});
}

ensureV3State();bind();renderScene();renderSchedule();renderInspectorV3();
window.BPV3={renderScene,renderSchedule,renderInspector:renderInspectorV3,serviceTargets:allServiceTargets,makeRecovery,smartAssemblies};
})();
