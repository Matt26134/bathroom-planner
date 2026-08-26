
(function(){
  const api = window.BP3D;
  if(!api) return;
  const $ = id => document.getElementById(id);
  const clone = v => JSON.parse(JSON.stringify(v));
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));

  let editingTileId = null, editingZoneId = null, pendingTileImage = null;

  function state(){ return api.getState(); }

  const DEFAULT_TILES = [
    {id:"tile-laurito-3060",name:"Laurito White Marble Effect Wall & Floor Tiles 300 x 600mm",supplier:"Victorian Plumbing",sku:"LAU3060",finish:"White marble effect",width:300,height:600,tilesPerBox:7,wall:true,floor:true,pricePerBox:31.44,pricePerM2:24.95,defaultPattern:"stack",image:"./laurito-tile.webp",builtIn:true},
    {id:"tile-granley-pink",name:"Granley Rustic Pink Gloss Wall Tiles 70 x 280mm",supplier:"Victorian Plumbing",sku:"GRN728PNK",finish:"Rustic pink gloss",width:70,height:280,tilesPerBox:30,wall:true,floor:false,pricePerBox:29.47,pricePerM2:49.95,defaultPattern:"herringbone",image:"./granley-pink-tile.webp",patternImage:"./granley-pink-herringbone.webp",builtIn:true}
  ];

  function ensureData(){
    const s = state();
    if(!Array.isArray(s.tileProducts)) s.tileProducts = [];
    DEFAULT_TILES.forEach(t=>{ if(!s.tileProducts.some(x=>x.id===t.id)) s.tileProducts.push(clone(t)); });
    if(!Array.isArray(s.surfaceZones)) s.surfaceZones = [];
  }
  function tileById(id){ return (state().tileProducts||[]).find(t=>t.id===id); }
  function zoneById(id){ return (state().surfaceZones||[]).find(z=>z.id===id); }
  function surfaceLabel(v){ return ({floor:"Floor",window:"Window wall",opposite:"Back wall",left:"Left wall",right:"Door wall"})[v] || v; }
  function patternLabel(v){ return v==="brick" ? "Brick bond" : v==="herringbone" ? "Herringbone" : "Stack"; }
  function surfaceAlong(surface){ const r = state().room; return (surface==="window"||surface==="opposite") ? Number(r.width||0) : Number(r.depth||0); }

  function resolveZone(z){
    const r = state().room;
    if(z.surface==="floor"){
      return {kind:"floor",x1:z.full?0:Number(z.x1||0),x2:z.full?Number(r.width||0):Number(z.x2||0),y1:z.full?0:Number(z.y1||0),y2:z.full?Number(r.depth||0):Number(z.y2||0)};
    }
    return {kind:"wall",start:z.full?0:Number(z.start||0),end:z.full?surfaceAlong(z.surface):Number(z.end||0),bottom:z.full?0:Number(z.bottom||0),top:z.full?Number(r.ceiling||0):Number(z.top||0)};
  }
  function zoneAreaM2(z){
    const r = resolveZone(z);
    return r.kind==="floor"
      ? Math.max(0,(r.x2-r.x1)*(r.y2-r.y1)/1e6)
      : Math.max(0,(r.end-r.start)*(r.top-r.bottom)/1e6);
  }
  function boxAreaM2(t){ return ((Number(t?.width)||0)*(Number(t?.height)||0)*(Number(t?.tilesPerBox)||0))/1e6; }
  function boxesNeeded(z){
    const t = tileById(z.tileId); if(!t) return null;
    const a = boxAreaM2(t); if(!a) return null;
    return Math.max(1, Math.ceil(zoneAreaM2(z)*(1+(Number(z.waste||10)/100))/a));
  }
  function costEstimate(z){
    const t = tileById(z.tileId), b = boxesNeeded(z);
    if(!t || b==null || !t.pricePerBox) return null;
    return b*Number(t.pricePerBox||0);
  }

  async function compressImage(file){
    return new Promise((resolve,reject)=>{
      const fr = new FileReader();
      fr.onload = ()=>{
        const img = new Image();
        img.onload = ()=>{
          const max = 720, scale = Math.min(1, max/Math.max(img.width,img.height));
          const c = document.createElement("canvas");
          c.width = Math.max(1, Math.round(img.width*scale));
          c.height = Math.max(1, Math.round(img.height*scale));
          c.getContext("2d").drawImage(img,0,0,c.width,c.height);
          resolve(c.toDataURL("image/jpeg", .82));
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  function renderTileGrid(){
    const grid = $("tileGrid"); if(!grid) return;
    ensureData();
    const tiles = state().tileProducts || [];
    if(!tiles.length){ grid.innerHTML = '<div class="tileCard"><div class="tileMeta">No tiles yet.</div></div>'; return; }
    grid.innerHTML = "";
    tiles.forEach(t=>{
      const card = document.createElement("div");
      card.className = "tileCard";
      const img = t.image ? `<img class="tileThumb" src="${esc(t.image)}" alt="${esc(t.name)}">` : `<div class="tileThumb" style="display:grid;place-items:center;color:#888">No image</div>`;
      const tags = `<span class="tag">${t.wall&&t.floor?"Wall & floor":t.wall?"Wall":t.floor?"Floor":"Tile"}</span>
                    <span class="tag">${Math.round(t.width||0)} × ${Math.round(t.height||0)} mm</span>
                    <span class="tag">${esc(patternLabel(t.defaultPattern||"stack"))}</span>`;
      card.innerHTML = `${img}<div>
          <div class="tileTitle">${esc(t.name)}</div>
          <div class="tileMeta">${esc(t.supplier||"")}${t.sku?` · ${esc(t.sku)}`:""}</div>
          <div class="tagRow">${tags}</div>
          <div class="miniStat" style="margin-top:8px">${t.pricePerM2?`£${Number(t.pricePerM2).toFixed(2)}/m²`:""}${t.pricePerBox?` · £${Number(t.pricePerBox).toFixed(2)} per box`:""}${t.tilesPerBox?` · ${Math.round(t.tilesPerBox)} tiles/box`:""}</div>
          <div class="surfaceActions"><button data-edit-tile="${esc(t.id)}">Edit</button><button data-export-tile="${esc(t.id)}">Export JSON</button></div>
      </div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-edit-tile]").forEach(b=>b.onclick=()=>openTileEditor(b.dataset.editTile));
    grid.querySelectorAll("[data-export-tile]").forEach(b=>b.onclick=()=>exportTile(b.dataset.exportTile));
  }

  function renderSurfaceSummary(){
    const el = $("surfaceSummary"); if(!el) return;
    const zones = (state().surfaceZones||[]).filter(z=>z.enabled!==false);
    if(!zones.length){ el.innerHTML = '<div class="zoneMeta">No surface zones yet.</div>'; return; }
    const totalArea = zones.reduce((a,z)=>a+zoneAreaM2(z),0);
    const totalCost = zones.reduce((a,z)=>a+(costEstimate(z)||0),0);
    const byTile = {};
    zones.forEach(z=>{
      const t = tileById(z.tileId); if(!t) return;
      if(!byTile[t.name]) byTile[t.name] = {area:0,boxes:0,cost:0};
      byTile[t.name].area += zoneAreaM2(z);
      byTile[t.name].boxes += boxesNeeded(z) || 0;
      byTile[t.name].cost += costEstimate(z) || 0;
    });
    el.innerHTML = `<div class="zoneTitle">Current finish summary</div>
      <div class="zoneMeta" style="margin-top:4px">Enabled zones: ${zones.length} · Total tiled area shown: ${totalArea.toFixed(2)} m²${totalCost?` · Estimated tile spend ~£${totalCost.toFixed(2)}`:""}</div>
      <div style="margin-top:8px">${Object.entries(byTile).map(([k,v])=>`<div class="zoneMeta"><strong>${esc(k)}</strong> · ${v.area.toFixed(2)} m² · ${v.boxes} boxes${v.cost?` · ~£${v.cost.toFixed(2)}`:""}</div>`).join("")}</div>`;
  }

  function renderZoneGrid(){
    const grid = $("zoneGrid"); if(!grid) return;
    const zones = state().surfaceZones || [];
    if(!zones.length){ grid.innerHTML = '<div class="zoneCard"><div class="zoneMeta">No zones yet.</div></div>'; return; }
    grid.innerHTML = "";
    zones.forEach(z=>{
      const t = tileById(z.tileId);
      const area = zoneAreaM2(z), boxes = boxesNeeded(z), cost = costEstimate(z);
      const card = document.createElement("div");
      card.className = "zoneCard";
      card.innerHTML = `<div class="zoneTitle">${esc(z.name)}</div>
        <div class="zoneMeta">${esc(surfaceLabel(z.surface))} · ${z.full?"Full coverage":"Partial zone"} · ${esc(patternLabel(z.pattern||"stack"))}${z.enabled===false?" · Hidden":""}</div>
        <div class="tagRow">
          <span class="tag">${t?esc(t.name):"No tile selected"}</span>
          <span class="tag">${area.toFixed(2)} m²</span>
          ${boxes!=null?`<span class="tag">${boxes} boxes incl. waste</span>`:""}
          ${cost!=null?`<span class="tag">~£${cost.toFixed(2)}</span>`:""}
        </div>
        <div class="surfaceActions">
          <button data-edit-zone="${esc(z.id)}" class="primary">Edit</button>
          <button data-duplicate-zone="${esc(z.id)}">Duplicate</button>
          <button data-toggle-zone="${esc(z.id)}">${z.enabled===false?"Enable":"Hide"}</button>
          <button data-delete-zone="${esc(z.id)}">Delete</button>
        </div>`;
      grid.appendChild(card);
    });
    grid.querySelectorAll("[data-edit-zone]").forEach(b=>b.onclick=()=>openZoneEditor(b.dataset.editZone));
    grid.querySelectorAll("[data-duplicate-zone]").forEach(b=>b.onclick=()=>duplicateZone(b.dataset.duplicateZone));
    grid.querySelectorAll("[data-toggle-zone]").forEach(b=>b.onclick=()=>toggleZone(b.dataset.toggleZone));
    grid.querySelectorAll("[data-delete-zone]").forEach(b=>b.onclick=()=>deleteZone(b.dataset.deleteZone));
  }

  function render(){ renderTileGrid(); renderSurfaceSummary(); renderZoneGrid(); }

  function openTileEditor(id=null){
    ensureData();
    editingTileId = id; pendingTileImage = null;
    const t = id ? tileById(id) : null;
    $("tileSheetTitle").textContent = t ? "Edit tile" : "Add tile";
    $("tileName").value = t?.name || "";
    $("tileSupplier").value = t?.supplier || "";
    $("tileSku").value = t?.sku || "";
    $("tileFinish").value = t?.finish || "";
    $("tileWidth").value = t?.width || "";
    $("tileHeight").value = t?.height || "";
    $("tileTilesPerBox").value = t?.tilesPerBox || "";
    $("tileDefaultPattern").value = t?.defaultPattern || "stack";
    $("tilePriceBox").value = t?.pricePerBox ?? "";
    $("tilePriceM2").value = t?.pricePerM2 ?? "";
    $("tileWall").checked = !!t?.wall;
    $("tileFloor").checked = !!t?.floor;
    $("tileUrl").value = t?.url || "";
    $("tileNotes").value = t?.notes || "";
    const preview = $("tilePhotoPreview"), prompt = $("tilePhotoPrompt");
    if(t?.image){ preview.src = t.image; preview.classList.remove("hidden"); prompt.classList.add("hidden"); }
    else { preview.removeAttribute("src"); preview.classList.add("hidden"); prompt.classList.remove("hidden"); }
    $("deleteTileBtn").classList.toggle("hidden", !t || t.builtIn);
    $("tileSheet").classList.remove("hidden");
  }
  function closeTileEditor(){ $("tileSheet").classList.add("hidden"); editingTileId = null; pendingTileImage = null; }

  function saveTile(){
    const old = editingTileId ? tileById(editingTileId) : null;
    const tile = {
      id: old?.id || ("tile-" + Date.now()),
      name: $("tileName").value.trim() || "Untitled tile",
      supplier: $("tileSupplier").value.trim(),
      sku: $("tileSku").value.trim(),
      finish: $("tileFinish").value.trim(),
      width: Math.max(1, Number($("tileWidth").value)||1),
      height: Math.max(1, Number($("tileHeight").value)||1),
      tilesPerBox: Math.max(1, Number($("tileTilesPerBox").value)||1),
      defaultPattern: $("tileDefaultPattern").value,
      pricePerBox: Number($("tilePriceBox").value)||0,
      pricePerM2: Number($("tilePriceM2").value)||0,
      wall: $("tileWall").checked,
      floor: $("tileFloor").checked,
      url: $("tileUrl").value.trim(),
      notes: $("tileNotes").value.trim(),
      image: pendingTileImage || old?.image || "",
      patternImage: old?.patternImage || "",
      builtIn: old?.builtIn || false
    };
    api.checkpoint();
    if(old) Object.assign(old, tile); else state().tileProducts.push(tile);
    api.persist(); render(); closeTileEditor();
  }

  function exportTile(id){
    const t = tileById(id); if(!t) return;
    const blob = new Blob([JSON.stringify({bathroomPlannerTile:1,tile:t}, null, 2)], {type:"application/json"});
    const u = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = u; a.download = (t.sku || t.name || "tile").replace(/[^a-z0-9]+/gi,"-").toLowerCase() + ".json"; a.click();
    setTimeout(()=>URL.revokeObjectURL(u), 500);
  }

  async function importTileFile(file){
    try{
      const data = JSON.parse(await file.text()), t = data.tile || data;
      if(!t.name || !t.width || !t.height) throw Error("Tile JSON needs at least name, width and height.");
      api.checkpoint(); t.id = "tile-" + Date.now(); t.builtIn = false; state().tileProducts.push(t);
      api.persist(); render(); alert("Tile imported.");
    }catch(err){ alert("Could not import tile: " + err.message); }
  }

  function syncZoneFields(){
    const isFloor = $("zoneSurface").value === "floor";
    $("zoneFloorFields").classList.toggle("hidden", !isFloor);
    $("zoneWallFields").classList.toggle("hidden", isFloor);
    const full = $("zoneFull").checked;
    ["zoneX1","zoneX2","zoneY1","zoneY2","zoneStart","zoneEnd","zoneBottom","zoneTop"].forEach(id=>{ const el = $(id); if(el) el.disabled = full; });
  }

  function openZoneEditor(id=null, preset=null){
    ensureData();
    editingZoneId = id;
    const z = id ? zoneById(id) : null, r = state().room;
    $("zoneSheetTitle").textContent = z ? "Edit zone" : "Add zone";
    $("zoneName").value = z?.name || (preset==="floor" ? "New floor zone" : "New wall zone");
    $("zoneSurface").value = z?.surface || (preset==="floor" ? "floor" : "left");
    $("zonePattern").value = z?.pattern || "stack";
    $("zoneGrout").value = z?.grout ?? 2;
    $("zoneGroutColor").value = z?.groutColor || "#ece6df";
    $("zoneWaste").value = z?.waste ?? 10;
    $("zoneEnabled").checked = z?.enabled !== false;
    $("zoneFull").checked = !!z?.full;
    const sel = $("zoneTile"); sel.innerHTML = "";
    (state().tileProducts||[]).forEach(t=>{ const o = document.createElement("option"); o.value = t.id; o.textContent = t.name; sel.appendChild(o); });
    sel.value = z?.tileId || (state().tileProducts[0]?.id || "");
    $("zoneX1").value = z?.x1 ?? 0; $("zoneX2").value = z?.x2 ?? r.width; $("zoneY1").value = z?.y1 ?? 0; $("zoneY2").value = z?.y2 ?? r.depth;
    $("zoneStart").value = z?.start ?? 0; $("zoneEnd").value = z?.end ?? surfaceAlong($("zoneSurface").value);
    $("zoneBottom").value = z?.bottom ?? 0; $("zoneTop").value = z?.top ?? r.ceiling;
    syncZoneFields(); updateZoneMetrics(); $("zoneSheet").classList.remove("hidden");
  }
  function closeZoneEditor(){ $("zoneSheet").classList.add("hidden"); editingZoneId = null; }

  function zoneDraftAreaM2(){
    const full = $("zoneFull").checked, r = state().room;
    if($("zoneSurface").value === "floor"){
      const w = full ? Number(r.width||0) : Math.max(0, Number($("zoneX2").value||0) - Number($("zoneX1").value||0));
      const d = full ? Number(r.depth||0) : Math.max(0, Number($("zoneY2").value||0) - Number($("zoneY1").value||0));
      return (w*d)/1e6;
    }
    const along = full ? surfaceAlong($("zoneSurface").value) : Math.max(0, Number($("zoneEnd").value||0) - Number($("zoneStart").value||0));
    const tall = full ? Number(r.ceiling||0) : Math.max(0, Number($("zoneTop").value||0) - Number($("zoneBottom").value||0));
    return (along*tall)/1e6;
  }
  function updateZoneMetrics(){
    const area = zoneDraftAreaM2(), tile = tileById($("zoneTile").value);
    let txt = `Approx area: ${area.toFixed(2)} m²`;
    if(tile){
      const ba = boxAreaM2(tile);
      if(ba){
        const boxes = Math.max(1, Math.ceil(area*(1 + Number($("zoneWaste").value||10)/100)/ba));
        txt += ` · ${boxes} boxes incl. waste`;
        if(tile.pricePerBox) txt += ` · ~£${(boxes*Number(tile.pricePerBox)).toFixed(2)}`;
      }
    }
    $("zoneMetrics").textContent = txt;
  }

  function saveZone(){
    const old = editingZoneId ? zoneById(editingZoneId) : null;
    const zone = {
      id: old?.id || ("zone-" + Date.now()),
      name: $("zoneName").value.trim() || "Surface zone",
      surface: $("zoneSurface").value,
      tileId: $("zoneTile").value,
      pattern: $("zonePattern").value,
      grout: Math.max(0, Number($("zoneGrout").value)||0),
      groutColor: $("zoneGroutColor").value || "#ece6df",
      waste: Math.max(0, Number($("zoneWaste").value)||0),
      enabled: $("zoneEnabled").checked,
      full: $("zoneFull").checked
    };
    if(zone.surface === "floor"){
      Object.assign(zone, {x1:Math.max(0,Number($("zoneX1").value)||0),x2:Math.max(0,Number($("zoneX2").value)||0),y1:Math.max(0,Number($("zoneY1").value)||0),y2:Math.max(0,Number($("zoneY2").value)||0)});
    } else {
      Object.assign(zone, {start:Math.max(0,Number($("zoneStart").value)||0),end:Math.max(0,Number($("zoneEnd").value)||0),bottom:Math.max(0,Number($("zoneBottom").value)||0),top:Math.max(0,Number($("zoneTop").value)||0)});
    }
    api.checkpoint();
    if(old) Object.assign(old, zone); else state().surfaceZones.push(zone);
    api.persist(); render(); closeZoneEditor();
  }

  function duplicateZone(id){
    const z = zoneById(id); if(!z) return;
    api.checkpoint(); const c = clone(z); c.id = "zone-" + Date.now(); c.name = z.name + " copy"; state().surfaceZones.push(c);
    api.persist(); render();
  }
  function toggleZone(id){
    const z = zoneById(id); if(!z) return;
    api.checkpoint(); z.enabled = z.enabled === false; api.persist(); render();
  }
  function deleteZone(id){
    const z = zoneById(id); if(!z) return;
    if(!confirm("Delete zone: " + z.name + "?")) return;
    api.checkpoint(); state().surfaceZones = state().surfaceZones.filter(x=>x.id!==id); api.persist(); render(); if(editingZoneId===id) closeZoneEditor();
  }

  function resetSuggestedScheme(){
    if(!confirm("Reset surfaces to the suggested Laurito + Granley scheme?")) return;
    const s = state(), r = s.room, defaults = [
      {id:"zone-floor",name:"Main floor",surface:"floor",full:true,x1:0,x2:Number(r.width||0),y1:0,y2:Number(r.depth||0),tileId:"tile-laurito-3060",pattern:"stack",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
      {id:"zone-window-wall",name:"Window wall",surface:"window",full:true,start:0,end:Number(r.width||0),bottom:0,top:Number(r.ceiling||0),tileId:"tile-laurito-3060",pattern:"stack",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
      {id:"zone-back-wall",name:"Back wall",surface:"opposite",full:true,start:0,end:Number(r.width||0),bottom:0,top:Number(r.ceiling||0),tileId:"tile-laurito-3060",pattern:"stack",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
      {id:"zone-left-wall",name:"Left wall",surface:"left",full:true,start:0,end:Number(r.depth||0),bottom:0,top:Number(r.ceiling||0),tileId:"tile-laurito-3060",pattern:"stack",grout:2,groutColor:"#ece6df",waste:10,enabled:true},
      {id:"zone-door-wall",name:"Door wall",surface:"right",full:true,start:0,end:Number(r.depth||0),bottom:0,top:Number(r.ceiling||0),tileId:"tile-laurito-3060",pattern:"stack",grout:2,groutColor:"#ece6df",waste:10,enabled:true}
    ];
    const vanity = (s.items||[]).find(i=>i.type==="vanity");
    if(vanity){
      const dims = (vanity.rotation===90||vanity.rotation===270) ? {w:vanity.h,h:vanity.w} : {w:vanity.w,h:vanity.h};
      if(vanity.x <= 60){
        defaults.push({id:"zone-vanity-feature",name:"Vanity feature wall",surface:"left",full:false,start:Math.max(0,Number(vanity.y||0)),end:Math.min(Number(r.depth||0),Number(vanity.y||0)+Number(dims.h||0)),bottom:900,top:Number(r.ceiling||0),tileId:"tile-granley-pink",pattern:"herringbone",grout:2,groutColor:"#f4efed",waste:12,enabled:true});
      } else if(vanity.x + dims.w >= Number(r.width||0)-60){
        defaults.push({id:"zone-vanity-feature",name:"Vanity feature wall",surface:"right",full:false,start:Math.max(0,Number(vanity.y||0)),end:Math.min(Number(r.depth||0),Number(vanity.y||0)+Number(dims.h||0)),bottom:900,top:Number(r.ceiling||0),tileId:"tile-granley-pink",pattern:"herringbone",grout:2,groutColor:"#f4efed",waste:12,enabled:true});
      } else if(vanity.y + dims.h >= Number(r.depth||0)-60){
        defaults.push({id:"zone-vanity-feature",name:"Vanity feature wall",surface:"opposite",full:false,start:Math.max(0,Number(vanity.x||0)),end:Math.min(Number(r.width||0),Number(vanity.x||0)+Number(dims.w||0)),bottom:900,top:Number(r.ceiling||0),tileId:"tile-granley-pink",pattern:"herringbone",grout:2,groutColor:"#f4efed",waste:12,enabled:true});
      }
    }
    api.checkpoint(); s.surfaceZones = defaults; api.persist(); render();
  }

  $("newTileBtn")?.addEventListener("click", ()=>openTileEditor());
  $("closeTileSheet")?.addEventListener("click", closeTileEditor);
  $("saveTileBtn")?.addEventListener("click", saveTile);
  $("deleteTileBtn")?.addEventListener("click", ()=>{
    const t = tileById(editingTileId); if(!t || t.builtIn) return;
    if(!confirm("Delete tile: " + t.name + "?")) return;
    api.checkpoint(); state().tileProducts = state().tileProducts.filter(x=>x.id!==t.id);
    state().surfaceZones.forEach(z=>{ if(z.tileId===t.id) z.tileId = state().tileProducts[0]?.id || ""; });
    api.persist(); render(); closeTileEditor();
  });
  $("tilePhotoInput")?.addEventListener("change", async e=>{
    const f = e.target.files?.[0]; if(!f) return;
    try{
      pendingTileImage = await compressImage(f);
      $("tilePhotoPreview").src = pendingTileImage; $("tilePhotoPreview").classList.remove("hidden"); $("tilePhotoPrompt").classList.add("hidden");
    }catch(_){ alert("Could not read that image."); }
    e.target.value = "";
  });
  $("tileImportInput")?.addEventListener("change", async e=>{ const f = e.target.files?.[0]; if(f) await importTileFile(f); e.target.value=""; });

  $("addFloorZoneBtn")?.addEventListener("click", ()=>openZoneEditor(null,"floor"));
  $("addWallZoneBtn")?.addEventListener("click", ()=>openZoneEditor(null,"wall"));
  $("resetSurfacePresetBtn")?.addEventListener("click", resetSuggestedScheme);
  $("closeZoneSheet")?.addEventListener("click", closeZoneEditor);
  $("saveZoneBtn")?.addEventListener("click", saveZone);
  $("duplicateZoneBtn")?.addEventListener("click", ()=>{ if(editingZoneId) duplicateZone(editingZoneId); });
  $("deleteZoneBtn")?.addEventListener("click", ()=>{ if(editingZoneId) deleteZone(editingZoneId); });
  ["zoneSurface","zoneTile","zonePattern","zoneGrout","zoneGroutColor","zoneWaste","zoneFull","zoneX1","zoneX2","zoneY1","zoneY2","zoneStart","zoneEnd","zoneBottom","zoneTop"].forEach(id=>{
    $(id)?.addEventListener("input", ()=>{ if(id==="zoneSurface"||id==="zoneFull") syncZoneFields(); updateZoneMetrics(); });
    $(id)?.addEventListener("change", ()=>{ if(id==="zoneSurface"||id==="zoneFull") syncZoneFields(); updateZoneMetrics(); });
  });

  document.querySelector('.tab[data-tab="surfaces"]')?.addEventListener("click", ()=>setTimeout(render,20));
  ensureData(); render(); window.BPSurfaces = { render };
})();
