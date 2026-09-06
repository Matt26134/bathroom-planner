(function(){
"use strict";
const api=window.BP3D, svg=document.getElementById("planSvg");
if(!api||!svg){console.warn("Pipe manager unavailable");return;}
const $=id=>document.getElementById(id), st=()=>api.getState(), clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const TYPES={
 hot:{label:"Hot water",color:"#d84a3d",defaultDiameter:15,defaultMaterial:"plastic-pushfit",z:-60},
 cold:{label:"Cold water",color:"#2878d8",defaultDiameter:15,defaultMaterial:"plastic-pushfit",z:-60},
 mixed:{label:"Mixed water",color:"#8a54d6",defaultDiameter:15,defaultMaterial:"plastic-pushfit",z:950},
 waste:{label:"Waste",color:"#159a7f",defaultDiameter:40,defaultMaterial:"solvent-waste",z:-90},
 soil:{label:"Soil",color:"#363a3a",defaultDiameter:110,defaultMaterial:"soil-pvc",z:-110}
};
const MATERIALS={
 "plastic-pushfit":"Plastic push-fit","copper":"Copper","pex":"PEX / multilayer",
 "solvent-waste":"Solvent-weld waste","pushfit-waste":"Push-fit waste","soil-pvc":"PVC soil"
};
let selectedId=null,draft=null;
function ensure(){const s=st();if(!Array.isArray(s.pipeRoutes))s.pipeRoutes=[];s.ui=s.ui||{};if(s.ui.showPipesOnLayout==null)s.ui.showPipesOnLayout=true;if(s.ui.pipeSnap90==null)s.ui.pipeSnap90=true;}
function typeInfo(type){return TYPES[type]||TYPES.waste}
function routeById(id){return(st().pipeRoutes||[]).find(r=>r.id===id)}
function uid(){return"pipe-"+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function svgPoint(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const m=svg.getScreenCTM();if(!m)return{x:0,y:0};const p=pt.matrixTransform(m.inverse()),r=st().room;return{x:Math.round(clamp(p.x,0,Number(r.width)||0)),y:Math.round(clamp(p.y,0,Number(r.depth)||0))};}
function cumulative2D(points){let total=0;const arr=[0];for(let i=1;i<points.length;i++){total+=Math.hypot((points[i].x||0)-(points[i-1].x||0),(points[i].y||0)-(points[i-1].y||0));arr.push(total)}return{arr,total};}
function pointZ(route,index){
 const pts=route.points||[],p=pts[index];if(!pts.length)return Number(route.zStart)||0;if(Number.isFinite(Number(p?.z)))return Number(p.z);
 const firstZ=Number.isFinite(Number(pts[0]?.z))?Number(pts[0].z):(Number(route.zStart)||0),lastRaw=Number(route.zEnd),lastZ=Number.isFinite(Number(pts[pts.length-1]?.z))?Number(pts[pts.length-1].z):(Number.isFinite(lastRaw)?lastRaw:firstZ);
 let aIdx=0,aZ=firstZ,bIdx=pts.length-1,bZ=lastZ;
 for(let k=index-1;k>=0;k--){if(Number.isFinite(Number(pts[k]?.z))){aIdx=k;aZ=Number(pts[k].z);break;}}
 for(let k=index+1;k<pts.length;k++){if(Number.isFinite(Number(pts[k]?.z))){bIdx=k;bZ=Number(pts[k].z);break;}}
 let total=0,run=0;for(let k=aIdx+1;k<=bIdx;k++){const seg=Math.hypot((pts[k].x||0)-(pts[k-1].x||0),(pts[k].y||0)-(pts[k-1].y||0));total+=seg;if(k<=index)run+=seg;}
 const f=total>0?run/total:((index-aIdx)/Math.max(1,bIdx-aIdx));return aZ+(bZ-aZ)*clamp(f,0,1);
}
function routeLength(route,includeZ=true){const pts=route.points||[];let n=0;for(let i=1;i<pts.length;i++){const dx=(pts[i].x||0)-(pts[i-1].x||0),dy=(pts[i].y||0)-(pts[i-1].y||0),dz=includeZ?pointZ(route,i)-pointZ(route,i-1):0;n+=Math.hypot(dx,dy,dz)}return n;}
function verticalLength(route){const pts=route.points||[];let n=0;for(let i=1;i<pts.length;i++){const dx=(pts[i].x||0)-(pts[i-1].x||0),dy=(pts[i].y||0)-(pts[i-1].y||0),dz=Math.abs(pointZ(route,i)-pointZ(route,i-1));if(Math.hypot(dx,dy)<3)n+=dz;}return n;}
function bendCount(route){
 const p=route.points||[];let c=0;
 for(let i=1;i<p.length-1;i++){
  const a=[(p[i].x||0)-(p[i-1].x||0),(p[i].y||0)-(p[i-1].y||0),pointZ(route,i)-pointZ(route,i-1)];
  const b=[(p[i+1].x||0)-(p[i].x||0),(p[i+1].y||0)-(p[i].y||0),pointZ(route,i+1)-pointZ(route,i)];
  const la=Math.hypot(...a),lb=Math.hypot(...b);if(!la||!lb)continue;const cos=clamp((a[0]*b[0]+a[1]*b[1]+a[2]*b[2])/(la*lb),-1,1),ang=Math.acos(cos)*180/Math.PI;if(ang>8)c++;
 }
 return c;
}
function wasteFall(route){const horizontal=routeLength(route,false),pts=route.points||[];if(pts.length<2||horizontal<=0)return"—";const drop=pointZ(route,0)-pointZ(route,pts.length-1);if(drop<=0)return"—";return`1:${Math.round(horizontal/drop)}`;}
function defaultRoute(type){const t=typeInfo(type);return{id:uid(),name:`${t.label} route ${(st().pipeRoutes||[]).filter(r=>r.type===type).length+1}`,type,diameter:t.defaultDiameter,material:t.defaultMaterial,zStart:t.z,zEnd:t.z,allowance:10,visible:true,points:[]};}
function snapPoint(p){if(!draft||!st().ui.pipeSnap90||!draft.points.length)return p;const q=draft.points[draft.points.length-1],dx=Math.abs(p.x-q.x),dy=Math.abs(p.y-q.y);return dx>=dy?{x:p.x,y:q.y}:{x:q.x,y:p.y};}
function startDraw(type,source=null){ensure();draft=source?JSON.parse(JSON.stringify(source)):defaultRoute(type);draft.id=source?.id||uid();draft.points=[];selectedId=source?.id||null;document.querySelector('.tab[data-tab="plan"]')?.click();const layer=$("planLayerMode");if(layer){layer.value="pipes";st().ui.planLayer="pipes";}updateDrawBar();api.refresh2D?.();}
function finishDraw(){if(!draft)return;if((draft.points||[]).length<2){alert("Add at least two points to make a pipe route.");return;}api.checkpoint?.();const s=st(),idx=(s.pipeRoutes||[]).findIndex(r=>r.id===draft.id);if(idx>=0)s.pipeRoutes[idx]=draft;else s.pipeRoutes.push(draft);selectedId=draft.id;draft=null;api.persist?.();updateDrawBar();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}
function cancelDraw(){draft=null;updateDrawBar();api.refresh2D?.();}
function undoPoint(){if(draft?.points?.length){draft.points.pop();updateDrawBar();api.refresh2D?.();}}
function updateDrawBar(){const bar=$("pipeDrawBar"),text=$("pipeDrawText");if(!bar)return;bar.classList.toggle("hidden",!draft);if(text&&draft){const t=typeInfo(draft.type);text.textContent=`Drawing ${t.label.toLowerCase()} · ${draft.diameter} mm · ${draft.points.length} point${draft.points.length===1?"":"s"}. Click the plan to add horizontal route points; add wall risers after saving.`}}
function sEl(tag,a={}){const e=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e;}
function midpoint(route){const pts=route.points||[];if(!pts.length)return{x:0,y:0};const target=routeLength(route,false)/2;let run=0;for(let i=1;i<pts.length;i++){const seg=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y);if(run+seg>=target){const f=seg?((target-run)/seg):0;return{x:pts[i-1].x+(pts[i].x-pts[i-1].x)*f,y:pts[i-1].y+(pts[i].y-pts[i-1].y)*f}}run+=seg}return pts[pts.length-1];}
function drawRoute(svgRoot,route,isDraft=false){
 if(route.visible===false&&!isDraft)return;const pts=route.points||[];if(!pts.length)return;const info=typeInfo(route.type),selected=route.id===selectedId||isDraft,points=pts.map(p=>`${p.x},${p.y}`).join(" "),g=sEl("g",{class:`pipeRoute ${selected?"selected":""}`,"data-pipe-id":route.id});
 const halo=sEl("polyline",{points,fill:"none",stroke:"#fffefa","stroke-width":selected?18:14,"stroke-linecap":"round","stroke-linejoin":"round","vector-effect":"non-scaling-stroke","pointer-events":isDraft?"none":"stroke"});
 const line=sEl("polyline",{points,fill:"none",stroke:info.color,"stroke-width":selected?10:7,"stroke-linecap":"round","stroke-linejoin":"round","vector-effect":"non-scaling-stroke","pointer-events":isDraft?"none":"stroke"});
 if(!isDraft){[halo,line].forEach(el=>el.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();selectedId=route.id;renderUI();api.refresh2D?.();}));}
 g.append(halo,line);
 if(selected||st().ui.planLayer==="pipes"){
  pts.forEach((p,i)=>{const n=sEl("circle",{cx:p.x,cy:p.y,r:selected?13:9,fill:"#fff",stroke:info.color,"stroke-width":4,"vector-effect":"non-scaling-stroke","pointer-events":"none"});g.appendChild(n);const num=sEl("text",{x:p.x,y:p.y-18,"text-anchor":"middle",class:"pipeNodeLabel","pointer-events":"none"});num.textContent=`${i+1} · ${Math.round(pointZ(route,i))}`;g.appendChild(num);});
 }
 if(!isDraft&&pts.length>1){const m=midpoint(route),lab=sEl("text",{x:m.x,y:m.y-18,"text-anchor":"middle",class:"pipeLabel","pointer-events":"none"});lab.textContent=`${info.label} ${route.diameter||"?"} mm · ${(routeLength(route)/1000).toFixed(2)} m`;g.appendChild(lab)}
 svgRoot.appendChild(g);
}
function drawPlanLayer(svgRoot,state){ensure();const mode=state.ui?.planLayer||"layout",show=mode==="pipes"||(mode==="layout"&&state.ui.showPipesOnLayout!==false);if(!show&&!draft)return;(state.pipeRoutes||[]).forEach(r=>drawRoute(svgRoot,r,false));if(draft)drawRoute(svgRoot,draft,true);}
function routeCard(r){const info=typeInfo(r.type),sel=r.id===selectedId?" selected":"",rise=verticalLength(r);return`<div class="pipeRouteCard${sel}" data-route-id="${r.id}"><button class="pipeRouteSelect" data-select-route="${r.id}"><i style="background:${info.color}"></i><span><strong>${escapeHtml(r.name||info.label)}</strong><small>${r.diameter} mm · ${(routeLength(r)/1000).toFixed(2)} m${rise>0?` · ${(rise/1000).toFixed(2)} m vertical`:""} · ${escapeHtml(MATERIALS[r.material]||r.material||"")}</small></span></button><button data-toggle-route="${r.id}" title="Show/hide">${r.visible===false?"○":"◉"}</button><button data-redraw-route="${r.id}" title="Redraw plan path">↺</button><button data-delete-route="${r.id}" class="danger" title="Delete">×</button></div>`;}
function renderList(){const box=$("pipeRouteList");if(!box)return;const routes=st().pipeRoutes||[];box.innerHTML=routes.length?routes.map(routeCard).join(""):"<p class='muted'>No pipe routes yet. Choose Hot, Cold, Mixed, Waste or Soil and draw the run directly on the Plan.</p>";box.querySelectorAll("[data-select-route]").forEach(b=>b.onclick=()=>{selectedId=b.dataset.selectRoute;renderUI();api.refresh2D?.();});box.querySelectorAll("[data-toggle-route]").forEach(b=>b.onclick=()=>{const r=routeById(b.dataset.toggleRoute);if(r){r.visible=r.visible===false;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}});box.querySelectorAll("[data-redraw-route]").forEach(b=>b.onclick=()=>{const r=routeById(b.dataset.redrawRoute);if(r)startDraw(r.type,r)});box.querySelectorAll("[data-delete-route]").forEach(b=>b.onclick=()=>{const r=routeById(b.dataset.deleteRoute);if(!r||!confirm(`Delete ${r.name}?`))return;api.checkpoint?.();st().pipeRoutes=st().pipeRoutes.filter(x=>x.id!==r.id);if(selectedId===r.id)selectedId=null;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();});}
function renderNodes(r){
 const box=$("pipeNodeList");if(!box)return;const pts=r.points||[];
 box.innerHTML=pts.map((p,i)=>`<div class="pipeNodeRow"><span class="pipeNodeIndex" style="border-color:${typeInfo(r.type).color}">${i+1}</span><span class="pipeNodeXY">X ${Math.round(Number(p.x)||0)} · Y ${Math.round(Number(p.y)||0)}</span><label>Z mm<input type="number" step="1" value="${Math.round(pointZ(r,i))}" data-pipe-node-z="${i}"></label><button type="button" data-pipe-riser="${i}" title="Insert a vertical point at the same X/Y">+ riser/drop</button><button type="button" data-pipe-node-delete="${i}" class="danger" ${pts.length<=2?"disabled":""} title="Delete route point">×</button></div>`).join("");
 box.querySelectorAll("[data-pipe-node-z]").forEach(input=>input.addEventListener("change",()=>{const idx=Number(input.dataset.pipeNodeZ),z=Number(input.value);if(!Number.isFinite(z)||!r.points[idx])return;api.checkpoint?.();r.points[idx].z=z;if(idx===0)r.zStart=z;if(idx===r.points.length-1)r.zEnd=z;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}));
 box.querySelectorAll("[data-pipe-riser]").forEach(btn=>btn.addEventListener("click",()=>{const idx=Number(btn.dataset.pipeRiser),p=r.points[idx];if(!p)return;const current=pointZ(r,idx),suggested=current<100?1000:Math.round(current+500),raw=prompt("Target Z height for the new vertical point (mm)",String(suggested));if(raw==null)return;const target=Number(raw);if(!Number.isFinite(target))return;api.checkpoint?.();const laterHadExplicit=r.points.slice(idx+1).some(n=>Number.isFinite(Number(n?.z)));p.z=current;const q={x:Number(p.x)||0,y:Number(p.y)||0,z:target};r.points.splice(idx+1,0,q);if(!laterHadExplicit)r.zEnd=target;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}));
 box.querySelectorAll("[data-pipe-node-delete]").forEach(btn=>btn.addEventListener("click",()=>{const idx=Number(btn.dataset.pipeNodeDelete);if(r.points.length<=2||!r.points[idx])return;api.checkpoint?.();r.points.splice(idx,1);r.zStart=pointZ(r,0);r.zEnd=pointZ(r,r.points.length-1);api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}));
}
function renderEditor(){const wrap=$("pipeRouteEditor"),r=routeById(selectedId);if(!wrap)return;wrap.classList.toggle("hidden",!r);if(!r){const nodes=$("pipeNodeList");if(nodes)nodes.innerHTML="";return;}$("pipeRouteName").value=r.name||"";$("pipeRouteType").value=r.type||"waste";$("pipeRouteDiameter").value=String(r.diameter||40);$("pipeRouteMaterial").value=r.material||"solvent-waste";$("pipeRouteZStart").value=Math.round(pointZ(r,0));$("pipeRouteZEnd").value=Math.round(pointZ(r,Math.max(0,r.points.length-1)));$("pipeRouteAllowance").value=Number(r.allowance??10);const stat=$("pipeRouteStats"),vert=verticalLength(r);if(stat)stat.innerHTML=`<strong>${(routeLength(r)/1000).toFixed(2)} m measured</strong><br>${r.points.length} points · approx. ${bendCount(r)} bend${bendCount(r)===1?"":"s"}${vert>0?` · ${(vert/1000).toFixed(2)} m true vertical`:""}${["waste","soil"].includes(r.type)?` · fall ${wasteFall(r)}`:""}`;renderNodes(r);}
function orderGroups(){const map=new Map();for(const r of st().pipeRoutes||[]){if(r.visible===false)continue;const key=[r.type,r.diameter,r.material].join("|");if(!map.has(key))map.set(key,{type:r.type,diameter:Number(r.diameter)||0,material:r.material,measured:0,order:0,bends:0,routes:0,vertical:0});const g=map.get(key),m=routeLength(r);g.measured+=m;g.order+=m*(1+(Number(r.allowance)||0)/100);g.bends+=bendCount(r);g.vertical+=verticalLength(r);g.routes++;}return[...map.values()];}
function renderOrderSummary(){const box=$("pipeOrderSummary");if(!box)return;const groups=orderGroups();box.innerHTML=groups.length?groups.map(g=>{const info=typeInfo(g.type);return`<div class="pipeOrderRow"><i style="background:${info.color}"></i><span><strong>${info.label} · ${g.diameter} mm</strong><small>${escapeHtml(MATERIALS[g.material]||g.material||"")} · ${g.routes} route${g.routes===1?"":"s"}${g.vertical>0?` · ${(g.vertical/1000).toFixed(2)} m vertical`:""}</small></span><span class="pipeOrderQty"><strong>${(g.order/1000).toFixed(2)} m</strong><small>${(g.measured/1000).toFixed(2)} m measured · ${g.bends} bends</small></span></div>`}).join(""):"<p class='muted'>Draw routes to build an order-length summary.</p>";const note=$("pipeOrderNote");if(note)note.textContent="Order length includes each route's allowance and true vertical risers/drops. Bend count is based on 3D route direction changes; tees, reducers, valves, clips and appliance-specific fittings are not inferred automatically.";}
function renderUI(){ensure();renderList();renderEditor();renderOrderSummary();const lay=$("pipeOverlayLayout"),snap=$("pipeSnap90");if(lay)lay.checked=st().ui.showPipesOnLayout!==false;if(snap)snap.checked=st().ui.pipeSnap90!==false;updateDrawBar();}
function applyEditor(){const r=routeById(selectedId);if(!r)return;const oldStart=pointZ(r,0),oldEnd=pointZ(r,Math.max(0,r.points.length-1));r.name=$("pipeRouteName").value.trim()||typeInfo(r.type).label;r.type=$("pipeRouteType").value;r.diameter=Math.max(1,Number($("pipeRouteDiameter").value)||typeInfo(r.type).defaultDiameter);r.material=$("pipeRouteMaterial").value;r.zStart=Number($("pipeRouteZStart").value)||0;r.zEnd=Number($("pipeRouteZEnd").value)||0;r.allowance=clamp(Number($("pipeRouteAllowance").value)||0,0,100);if(r.points?.length){if(Number.isFinite(Number(r.points[0].z))||r.zStart!==oldStart)r.points[0].z=r.zStart;const li=r.points.length-1;if(Number.isFinite(Number(r.points[li].z))||r.zEnd!==oldEnd)r.points[li].z=r.zEnd;}api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}
function clearNodeHeights(){const r=routeById(selectedId);if(!r)return;api.checkpoint?.();(r.points||[]).forEach(p=>delete p.z);api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}
function reverseRoute(){const r=routeById(selectedId);if(!r)return;api.checkpoint?.();r.points.reverse();const z=r.zStart;r.zStart=r.zEnd;r.zEnd=z;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();}
function exportCSV(){const rows=[["System","Name","Diameter mm","Material","Measured m","Vertical m","Allowance %","Order m","Approx bends","Start Z mm","End Z mm","Fall"]];for(const r of st().pipeRoutes||[]){rows.push([typeInfo(r.type).label,r.name,r.diameter,MATERIALS[r.material]||r.material,(routeLength(r)/1000).toFixed(3),(verticalLength(r)/1000).toFixed(3),r.allowance??0,(routeLength(r)*(1+(Number(r.allowance)||0)/100)/1000).toFixed(3),bendCount(r),Math.round(pointZ(r,0)),Math.round(pointZ(r,Math.max(0,(r.points||[]).length-1))),wasteFall(r)])}const esc=v=>`"${String(v??"").replace(/"/g,'""')}"`,blob=new Blob([rows.map(x=>x.map(esc).join(",")).join("\n")],{type:"text/csv"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="bathroom-pipe-routes-ordering.csv";a.click();setTimeout(()=>URL.revokeObjectURL(u),500);}
function bind(){
 document.querySelectorAll("[data-pipe-start]").forEach(b=>b.addEventListener("click",()=>startDraw(b.dataset.pipeStart)));
 $("pipeFinishDrawBtn")?.addEventListener("click",finishDraw);$("pipeCancelDrawBtn")?.addEventListener("click",cancelDraw);$("pipeUndoPointBtn")?.addEventListener("click",undoPoint);
 $("pipeOverlayLayout")?.addEventListener("change",e=>{st().ui.showPipesOnLayout=e.target.checked;api.persist?.();api.refresh2D?.();});$("pipeSnap90")?.addEventListener("change",e=>{st().ui.pipeSnap90=e.target.checked;api.persist?.();});
 ["pipeRouteName","pipeRouteType","pipeRouteDiameter","pipeRouteMaterial","pipeRouteZStart","pipeRouteZEnd","pipeRouteAllowance"].forEach(id=>$(id)?.addEventListener("change",applyEditor));
 $("pipeClearNodeHeightsBtn")?.addEventListener("click",clearNodeHeights);$("pipeReverseBtn")?.addEventListener("click",reverseRoute);$("pipeExportBtn")?.addEventListener("click",exportCSV);
 $("pipeShowPlanBtn")?.addEventListener("click",()=>{st().ui.planLayer="pipes";const layer=$("planLayerMode");if(layer)layer.value="pipes";api.persist?.();document.querySelector('.tab[data-tab="plan"]')?.click();api.refresh2D?.();});
 $("pipeClearBtn")?.addEventListener("click",()=>{if(!(st().pipeRoutes||[]).length||!confirm("Delete all pipe routes?"))return;api.checkpoint?.();st().pipeRoutes=[];selectedId=null;api.persist?.();renderUI();api.refresh2D?.();window.BP3DView?.refresh?.();});
 document.querySelector('.tab[data-tab="build"]')?.addEventListener("click",()=>setTimeout(renderUI,20));
 svg.addEventListener("pointerdown",e=>{if(!draft||e.button!==0)return;e.preventDefault();e.stopImmediatePropagation();const p=snapPoint(svgPoint(e)),last=draft.points[draft.points.length-1];if(last&&Math.hypot(p.x-last.x,p.y-last.y)<3)return;draft.points.push(p);updateDrawBar();api.refresh2D?.();},{capture:true});
}
ensure();bind();renderUI();
window.BPPipes={drawPlanLayer,isDrawing:()=>!!draft,refresh:renderUI,routeLength,verticalLength,pointZ,typeInfo};
api.refresh2D?.();
})();
