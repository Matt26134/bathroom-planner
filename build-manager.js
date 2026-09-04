(function(){
  "use strict";
  const api=window.BP3D;if(!api)return;
  const $=id=>document.getElementById(id);
  const NS="http://www.w3.org/2000/svg";
  const state=()=>api.getState();
  const SCHEMA=Number(api.schemaVersion)||5;
  const clone=v=>JSON.parse(JSON.stringify(v));
  const svgEl=(tag,a={})=>{const e=document.createElementNS(NS,tag);Object.entries(a).forEach(([k,v])=>e.setAttribute(k,v));return e};

  function ensure(){
    const s=state();
    s.schemaVersion=SCHEMA;
    s.ui=s.ui||{};if(!s.ui.planLayer)s.ui.planLayer="layout";
    if(!s.floorBuild||!Array.isArray(s.floorBuild.layers))s.floorBuild={layers:[]};
    s.structure={direction:"window-door",spacing:400,width:47,depth:195,offset:100,deckThickness:18,showGenerated:true,manualJoists:[],noggins:[],...(s.structure||{})};
    if(!Array.isArray(s.structure.noggins))s.structure.noggins=[];if(!Array.isArray(s.structure.manualJoists))s.structure.manualJoists=[];if(s.structure.showGenerated==null)s.structure.showGenerated=true;
    s.heating={enabled:false,type:"electric-mat",outputWm2:150,margin:100,excludeFixtures:true,thermostatWall:"left",...(s.heating||{})};
  }
  function persist(render=true){api.persist();if(render)api.refresh2D();renderAll();}
  function floorBuildTotal(){return (state().floorBuild.layers||[]).filter(x=>x.enabled!==false).reduce((a,x)=>a+Math.max(0,Number(x.thickness)||0),0)}
  function generatedJoists(){
    const s=state(),r=s.room,st=s.structure,arr=[];
    const spacing=Math.max(100,Number(st.spacing)||400),width=Math.max(20,Number(st.width)||47),offset=Math.max(0,Number(st.offset)||0);
    if(st.showGenerated===false)return arr;
    if(st.direction==="left-right"){
      for(let y=offset;y<r.depth+width;y+=spacing)arr.push({x:0,y:y-width/2,w:r.width,h:width});
    }else{
      for(let x=offset;x<r.width+width;x+=spacing)arr.push({x:x-width/2,y:0,w:width,h:r.depth});
    }
    return arr;
  }
  function fixedFixtureArea(){
    const s=state();
    const fixed=new Set(["bath","wc","vanity","shower","stud","storage"]);
    let area=0;
    (s.items||[]).forEach(i=>{if(!fixed.has(i.type))return;const rot=(Number(i.rotation)||0)%180!==0,w=rot?Number(i.h||0):Number(i.w||0),h=rot?Number(i.w||0):Number(i.h||0);area+=Math.max(0,w*h)/1e6});
    return area;
  }
  function heatingMetrics(){
    const s=state(),h=s.heating,margin=Math.max(0,Number(h.margin)||0);
    const innerW=Math.max(0,s.room.width-margin*2),innerD=Math.max(0,s.room.depth-margin*2);
    const gross=innerW*innerD/1e6;
    const excluded=h.excludeFixtures?fixedFixtureArea():0;
    const heated=Math.max(0,gross-excluded);
    return {gross,excluded,heated,watts:heated*Math.max(0,Number(h.outputWm2)||0)};
  }

  function drawStructure(svg,s){
    const g=svgEl("g",{"data-build-layer":"structure","pointer-events":"none"});
    generatedJoists().forEach((j,idx)=>{
      g.appendChild(svgEl("rect",{x:j.x,y:j.y,width:j.w,height:j.h,fill:"#b69770",opacity:"0.55",stroke:"#8f7155","stroke-width":"2","vector-effect":"non-scaling-stroke"}));
      if(idx<20){const t=svgEl("text",{x:j.x+j.w/2,y:j.y+32,"text-anchor":"middle","font-size":"18",fill:"#745d47"});t.textContent="J"+(idx+1);g.appendChild(t)}
    });
    (s.structure.manualJoists||[]).forEach((j,idx)=>{g.appendChild(svgEl("rect",{x:Number(j.x)||0,y:Number(j.y)||0,width:Math.max(20,Number(j.w)||47),height:Math.max(20,Number(j.h)||1000),fill:"#9e7650",opacity:"0.78",stroke:"#6f5138","stroke-width":"2","vector-effect":"non-scaling-stroke"}));const t=svgEl("text",{x:(Number(j.x)||0)+Math.max(20,Number(j.w)||47)/2,y:(Number(j.y)||0)+28,"text-anchor":"middle","font-size":"18",fill:"#5e432f"});t.textContent="S"+(idx+1);g.appendChild(t)});
    (s.structure.noggins||[]).forEach(n=>g.appendChild(svgEl("rect",{x:Number(n.x)||0,y:Number(n.y)||0,width:Math.max(10,Number(n.w)||100),height:Math.max(10,Number(n.h)||47),fill:"#8f7155",opacity:"0.78"})));
    svg.appendChild(g);
  }
  function drawHeating(svg,s){
    const h=s.heating;if(!h.enabled)return;
    const margin=Math.max(0,Number(h.margin)||0),w=Math.max(0,s.room.width-margin*2),d=Math.max(0,s.room.depth-margin*2);
    const defs=svg.querySelector("defs");
    if(defs&&!svg.querySelector("#ufhPattern")){
      const p=svgEl("pattern",{id:"ufhPattern",width:"70",height:"70",patternUnits:"userSpaceOnUse",patternTransform:"rotate(45)"});
      p.appendChild(svgEl("rect",{width:"70",height:"70",fill:"#f3d7cf",opacity:"0.28"}));
      p.appendChild(svgEl("line",{x1:"0",y1:"0",x2:"0",y2:"70",stroke:"#c56850","stroke-width":"13",opacity:"0.62"}));defs.appendChild(p);
    }
    const g=svgEl("g",{"data-build-layer":"heating","pointer-events":"none"});
    g.appendChild(svgEl("rect",{x:margin,y:margin,width:w,height:d,fill:"url(#ufhPattern)",stroke:"#c56850","stroke-width":"3","stroke-dasharray":"12 8","vector-effect":"non-scaling-stroke"}));
    if(h.excludeFixtures){
      const fixed=new Set(["bath","wc","vanity","shower","stud","storage"]);
      (s.items||[]).forEach(i=>{if(!fixed.has(i.type))return;const rot=(Number(i.rotation)||0)%180!==0,iw=rot?Number(i.h||0):Number(i.w||0),ih=rot?Number(i.w||0):Number(i.h||0);g.appendChild(svgEl("rect",{x:i.x,y:i.y,width:iw,height:ih,fill:"#f7f3ed",opacity:"0.88",stroke:"#d2c8bb","stroke-width":"2","vector-effect":"non-scaling-stroke"}))});
    }
    svg.appendChild(g);
  }
  function drawPlanLayer(svg,s){
    const mode=s.ui?.planLayer||"layout";
    if(mode==="structure")drawStructure(svg,s);
    if(mode==="heating")drawHeating(svg,s);
  }

  function renderLayers(){
    const wrap=$("floorLayerRows");if(!wrap)return;wrap.innerHTML="";
    (state().floorBuild.layers||[]).forEach((l,idx)=>{
      const row=document.createElement("div");row.className="layerRow";
      row.innerHTML=`<label>Layer<input data-layer-name="${idx}" value="${String(l.name||"").replace(/&/g,"&amp;").replace(/\"/g,"&quot;")}"></label><label>Thickness mm<input data-layer-thickness="${idx}" type="number" min="0" value="${Number(l.thickness)||0}"></label><label title="Enabled"><input data-layer-enabled="${idx}" type="checkbox" ${l.enabled!==false?"checked":""}></label>`;
      row.querySelector(`[data-layer-name="${idx}"]`).onchange=e=>{l.name=e.target.value;persist(false)};
      row.querySelector(`[data-layer-thickness="${idx}"]`).onchange=e=>{l.thickness=Math.max(0,Number(e.target.value)||0);persist(false)};
      row.querySelector(`[data-layer-enabled="${idx}"]`).onchange=e=>{l.enabled=e.target.checked;persist(false)};
      row.ondblclick=()=>{if(confirm(`Delete layer: ${l.name}?`)){api.checkpoint();state().floorBuild.layers.splice(idx,1);persist()}};
      wrap.appendChild(row);
    });
    const aboveDeck=floorBuildTotal(),deck=Math.max(0,Number(state().structure?.deckThickness)||0),assembly=aboveDeck+deck;
    $("floorBuildSummary").innerHTML=`<strong>Finish-to-deck build-up: ${aboveDeck.toFixed(1)} mm</strong><br>Structural deck: ${deck.toFixed(1)} mm · total finish-to-joist-void: ${assembly.toFixed(1)} mm. Planner finished floor remains 0 mm.`;
  }
  function renderStructure(){
    const s=state(),st=s.structure;
    $("joistDirection").value=st.direction;$("joistSpacing").value=st.spacing;$("joistWidth").value=st.width;$("joistDepth").value=st.depth;$("joistOffset").value=st.offset;$("deckThickness").value=st.deckThickness;if($("showGeneratedJoists"))$("showGeneratedJoists").checked=st.showGenerated!==false;
    const js=generatedJoists(),manual=st.manualJoists||[];$("joistSummary").innerHTML=`<strong>${js.length} generated + ${manual.length} surveyed joists</strong> · default ${st.width} × ${st.depth} mm · ${st.spacing} mm centres.<br>Hide the generated grid once you have mapped the actual floor.`;
    const mw=$("manualJoistRows");if(mw){mw.innerHTML="";manual.forEach((j,idx)=>{const r=document.createElement("div");r.className="nogginRow";r.innerHTML=`<label>X<input data-jx="${idx}" type="number" value="${j.x||0}"></label><label>Y<input data-jy="${idx}" type="number" value="${j.y||0}"></label><label>W<input data-jw="${idx}" type="number" value="${j.w||47}"></label><label>Length<input data-jh="${idx}" type="number" value="${j.h||state().room.depth}"></label><button data-jd="${idx}" class="danger">×</button>`;mw.appendChild(r)});mw.querySelectorAll("input").forEach(inp=>inp.onchange=e=>{const m=e.target.dataset,idx=Number(m.jx??m.jy??m.jw??m.jh),j=manual[idx];if(m.jx!=null)j.x=Number(e.target.value)||0;if(m.jy!=null)j.y=Number(e.target.value)||0;if(m.jw!=null)j.w=Math.max(20,Number(e.target.value)||20);if(m.jh!=null)j.h=Math.max(20,Number(e.target.value)||20);persist()});mw.querySelectorAll("[data-jd]").forEach(b=>b.onclick=()=>{api.checkpoint();manual.splice(Number(b.dataset.jd),1);persist()})}
    const wrap=$("nogginRows");wrap.innerHTML="";
    (st.noggins||[]).forEach((n,idx)=>{const r=document.createElement("div");r.className="nogginRow";r.innerHTML=`<label>X<input data-nx="${idx}" type="number" value="${n.x||0}"></label><label>Y<input data-ny="${idx}" type="number" value="${n.y||0}"></label><label>W<input data-nw="${idx}" type="number" value="${n.w||300}"></label><label>H<input data-nh="${idx}" type="number" value="${n.h||47}"></label><button data-nd="${idx}" class="danger">×</button>`;wrap.appendChild(r)});
    wrap.querySelectorAll("input").forEach(inp=>inp.onchange=e=>{const m=e.target.dataset;const idx=Number(m.nx??m.ny??m.nw??m.nh);const n=st.noggins[idx];if(m.nx!=null)n.x=Number(e.target.value)||0;if(m.ny!=null)n.y=Number(e.target.value)||0;if(m.nw!=null)n.w=Math.max(10,Number(e.target.value)||10);if(m.nh!=null)n.h=Math.max(10,Number(e.target.value)||10);persist()});
    wrap.querySelectorAll("[data-nd]").forEach(b=>b.onclick=()=>{api.checkpoint();st.noggins.splice(Number(b.dataset.nd),1);persist()});
  }
  function renderHeating(){
    const h=state().heating,m=heatingMetrics();
    $("heatingEnabled").checked=!!h.enabled;$("heatingType").value=h.type;$("heatingOutput").value=h.outputWm2;$("heatingMargin").value=h.margin;$("heatingExcludeFixtures").checked=h.excludeFixtures!==false;$("thermostatWall").value=h.thermostatWall||"left";
    const label=h.type==="wet"?"Wet UFH planning zone":"Electrical planning zone";
    $("heatingSummary").innerHTML=`<strong>${label}: ${m.heated.toFixed(2)} m²</strong><br>Gross inside margin: ${m.gross.toFixed(2)} m² · approximate fixture exclusions: ${m.excluded.toFixed(2)} m²${h.type!=="wet"?` · estimated load: ${Math.round(m.watts)} W`:""}.`;
  }
  function renderMeta(){const s=state(),el=$("portableProjectMeta");if(el)el.innerHTML=`<strong>${s.project?.name||"Bathroom project"}</strong><br>Project ID: ${s.projectId||"—"} · schema v${s.schemaVersion||SCHEMA} · last saved ${s.updatedAt?new Date(s.updatedAt).toLocaleString():"this session"}.`;}
  function renderAll(){ensure();renderLayers();renderStructure();renderHeating();renderMeta();if($("planLayerMode"))$("planLayerMode").value=state().ui.planLayer||"layout";}

  function safeName(v){return String(v||"Bathroom-Project").trim().replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"")||"Bathroom-Project"}
  function download(name,contents,type="application/json"){const blob=new Blob([contents],{type}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),800)}
  function exportBathplan(){const s=clone(state());s.version=api.version||s.version;s.schemaVersion=SCHEMA;s.updatedAt=new Date().toISOString();const pack={bathplanFormat:2,schemaVersion:SCHEMA,appVersion:api.version||"2.5.2",exportedAt:new Date().toISOString(),assetsEmbedded:true,project:s};download(`${safeName(s.project?.name)}-${new Date().toISOString().slice(0,10)}.bathplan`,JSON.stringify(pack));}
  async function importBathplan(file){
    try{
      const parsed=JSON.parse(await file.text()),incoming=parsed?.project||parsed;
      if(!incoming||!incoming.room||!Array.isArray(incoming.items))throw Error("This is not a valid Bathroom Planner project file.");
      const name=incoming.project?.name||"Imported bathroom";const exported=parsed.exportedAt?`\nExported: ${new Date(parsed.exportedAt).toLocaleString()}`:"";
      if(!confirm(`Import '${name}' and replace the current project on this device?${exported}\n\nYour current project will be kept as a one-step recovery copy in this browser.`))return;
      try{localStorage.setItem(api.storageKey+"_recovery",JSON.stringify(state()))}catch(_){}
      if(Number(incoming.schemaVersion||1)>SCHEMA)throw Error(`This project uses schema v${incoming.schemaVersion}, newer than this planner supports (v${SCHEMA}).`);incoming.schemaVersion=Number(incoming.schemaVersion)||1;incoming.projectId=incoming.projectId||("project-"+Date.now().toString(36));incoming.updatedAt=new Date().toISOString();
      api.replaceState(incoming);
    }catch(err){alert("Import failed: "+err.message)}
  }

  document.querySelectorAll("[data-build-pane]").forEach(b=>b.onclick=()=>{document.querySelectorAll("[data-build-pane]").forEach(x=>x.classList.remove("active"));document.querySelectorAll(".buildPane").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("buildPane"+b.dataset.buildPane[0].toUpperCase()+b.dataset.buildPane.slice(1))?.classList.add("active")});
  $("planLayerMode")?.addEventListener("change",e=>{state().ui.planLayer=e.target.value;persist();});
  $("addFloorLayerBtn")?.addEventListener("click",()=>{api.checkpoint();state().floorBuild.layers.push({id:"layer-"+Date.now(),name:"New layer",thickness:5,enabled:true});persist()});
  ["joistDirection","joistSpacing","joistWidth","joistDepth","joistOffset","deckThickness"].forEach(id=>$(id)?.addEventListener("change",e=>{const st=state().structure;const map={joistDirection:"direction",joistSpacing:"spacing",joistWidth:"width",joistDepth:"depth",joistOffset:"offset",deckThickness:"deckThickness"};st[map[id]]=id==="joistDirection"?e.target.value:Math.max(0,Number(e.target.value)||0);persist()}));
  $("showGeneratedJoists")?.addEventListener("change",e=>{state().structure.showGenerated=e.target.checked;persist()});
  $("addManualJoistBtn")?.addEventListener("click",()=>{api.checkpoint();const st=state().structure;st.manualJoists.push({id:"joist-"+Date.now(),x:100,y:0,w:Math.max(20,Number(st.width)||47),h:state().room.depth});persist()});
  $("addNogginBtn")?.addEventListener("click",()=>{api.checkpoint();state().structure.noggins.push({id:"noggin-"+Date.now(),x:600,y:1200,w:350,h:47});persist()});
  $("showStructurePlanBtn")?.addEventListener("click",()=>{state().ui.planLayer="structure";persist();document.querySelector('.tab[data-tab="plan"]')?.click()});
  ["heatingEnabled","heatingType","heatingOutput","heatingMargin","heatingExcludeFixtures","thermostatWall"].forEach(id=>$(id)?.addEventListener("change",e=>{const h=state().heating,map={heatingEnabled:"enabled",heatingType:"type",heatingOutput:"outputWm2",heatingMargin:"margin",heatingExcludeFixtures:"excludeFixtures",thermostatWall:"thermostatWall"};h[map[id]]=(id==="heatingEnabled"||id==="heatingExcludeFixtures")?e.target.checked:(id==="heatingOutput"||id==="heatingMargin")?Math.max(0,Number(e.target.value)||0):e.target.value;if(id==="heatingEnabled"){const ufh=(state().floorBuild.layers||[]).find(x=>String(x.name).toLowerCase().includes("ufh"));if(ufh)ufh.enabled=e.target.checked}persist()}));
  $("showHeatingPlanBtn")?.addEventListener("click",()=>{state().ui.planLayer="heating";persist();document.querySelector('.tab[data-tab="plan"]')?.click()});
  $("exportBathplanBtn")?.addEventListener("click",exportBathplan);
  $("downloadLegacyJsonBtn")?.addEventListener("click",()=>download(`${safeName(state().project?.name)}-readable.json`,JSON.stringify(state(),null,2)));
  $("importBathplanInput")?.addEventListener("change",async e=>{const f=e.target.files?.[0];if(f)await importBathplan(f);e.target.value=""});
  document.querySelector('.tab[data-tab="build"]')?.addEventListener("click",()=>setTimeout(renderAll,20));
  document.querySelector('.tab[data-tab="project"]')?.addEventListener("click",()=>setTimeout(renderMeta,20));

  ensure();renderAll();window.BPBuild={drawPlanLayer,generatedJoists,floorBuildTotal,heatingMetrics,render:renderAll};
  api.refresh2D();
})();
