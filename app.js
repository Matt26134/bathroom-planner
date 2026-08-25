(() => {
  "use strict";

  const APP_VERSION = "1.0.1";
  const STORAGE_KEY = "bathroomPlannerV1";
  const clone = v => JSON.parse(JSON.stringify(v));

  const starterState = {
    version: APP_VERSION,
    project: {
      name: "Bathroom Redesign",
      planName: "Current working layout",
      notes: "Seeded from the latest bathroom measurements. Confirm all survey dimensions after strip-out before ordering fitted items."
    },
    room: {
      width: 2280,
      depth: 2545,
      ceiling: 2400,
      tolerance: 20,
      window: { before: 660, width: 930, after: 690 },
      door: { before: 835, width: 860, after: 850 }
    },
    ui: { showDims: true, snap: true },
    items: [
      { id: "bath-1", type: "bath", name: "Bath", x: 0, y: 0, w: 1600, h: 700, rotation: 0, locked: true },
      { id: "wc-1", type: "wc", name: "New WC", x: 1830, y: 25, w: 370, h: 640, rotation: 0, locked: true },
      { id: "vanity-1", type: "vanity", name: "Floor-standing vanity", x: 0, y: 700, w: 450, h: 970, rotation: 0, locked: false },
      { id: "stud-1", type: "stud", name: "Half-height stud wall", x: 0, y: 1670, w: 900, h: 100, rotation: 0, locked: false },
      { id: "shower-1", type: "shower", name: "Walk-in shower", x: 0, y: 1745, w: 1400, h: 800, rotation: 0, locked: false },
      { id: "storage-1", type: "storage", name: "Tall storage", x: 1460, y: 2295, w: 300, h: 250, rotation: 0, locked: false },
      { id: "radiator-1", type: "radiator", name: "Towel radiator", x: 2180, y: 1900, w: 100, h: 520, rotation: 0, locked: false },
      { id: "niche-1", type: "niche", name: "Large shampoo niche", x: 120, y: 1680, w: 380, h: 70, rotation: 0, locked: false },
      { id: "niche-2", type: "niche", name: "Decorative bottle niche", x: 20, y: 2050, w: 70, h: 420, rotation: 0, locked: false }
    ]
  };

  let state = loadState();
  let selectedId = null;
  let history = [];
  let future = [];
  let drag = null;

  const $ = (id) => document.getElementById(id);
  const svg = $("planSvg");
  const inspector = $("inspector");

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(starterState);
      const parsed = JSON.parse(raw);
      if (!parsed.room || !Array.isArray(parsed.items)) throw new Error("Invalid state");
      return parsed;
    } catch {
      return clone(starterState);
    }
  }

  function saveState() {
    state.version = APP_VERSION;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateDataSummary();
  }

  function checkpoint() {
    history.push(clone(state));
    if (history.length > 50) history.shift();
    future = [];
    updateUndoRedo();
  }

  function undo() {
    if (!history.length) return;
    future.push(clone(state));
    state = history.pop();
    selectedId = null;
    saveState(); syncInputs(); render(); updateUndoRedo();
  }

  function redo() {
    if (!future.length) return;
    history.push(clone(state));
    state = future.pop();
    selectedId = null;
    saveState(); syncInputs(); render(); updateUndoRedo();
  }

  function updateUndoRedo() {
    $("undoBtn").disabled = !history.length;
    $("redoBtn").disabled = !future.length;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function svgEl(tag, attrs = {}) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    return el;
  }

  function dims(item) {
    return item.rotation === 90 ? { w: item.h, h: item.w } : { w: item.w, h: item.h };
  }

  function itemBBox(item) {
    const d = dims(item);
    return { x1:item.x, y1:item.y, x2:item.x+d.w, y2:item.y+d.h, w:d.w, h:d.h };
  }

  function overlaps(a, b) {
    const A = itemBBox(a), B = itemBBox(b);
    return A.x1 < B.x2 && A.x2 > B.x1 && A.y1 < B.y2 && A.y2 > B.y1;
  }

  function conflictsFor(item) {
    const box = itemBBox(item);
    const warnings = [];
    if (box.x1 < 0 || box.y1 < 0 || box.x2 > state.room.width || box.y2 > state.room.depth) warnings.push("Item extends outside the room.");
    for (const other of state.items) {
      if (other.id === item.id) continue;
      if (!overlaps(item, other)) continue;
      if (item.type === "niche" || other.type === "niche") continue;
      if ((item.type === "stud" && other.type === "shower") || (item.type === "shower" && other.type === "stud")) continue;
      warnings.push(`Overlaps ${other.name}.`);
    }
    return warnings;
  }

  function roomChecks() {
    const wSum = state.room.window.before + state.room.window.width + state.room.window.after;
    const dSum = state.room.door.before + state.room.door.width + state.room.door.after;
    return { windowOk:wSum===state.room.width, windowSum:wSum, doorOk:dSum===state.room.depth, doorSum:dSum };
  }

  function render() {
    svg.innerHTML = "";
    const r = state.room;
    svg.setAttribute("viewBox", `-420 -360 ${Math.max(3200, r.width+900)} ${Math.max(3300, r.depth+800)}`);

    svg.appendChild(svgEl("rect", { x:0, y:0, width:r.width, height:r.depth, class:"room-fill" }));
    svg.appendChild(svgEl("rect", { x:0, y:0, width:r.width, height:r.depth, class:"room-wall" }));

    const wx1 = r.window.before, wx2 = r.window.before + r.window.width;
    svg.appendChild(svgEl("line", { x1:wx1, y1:0, x2:wx2, y2:0, class:"window-mark" }));

    const dy1 = r.door.before, dy2 = r.door.before + r.door.width;
    svg.appendChild(svgEl("line", { x1:r.width, y1:dy1, x2:r.width, y2:dy2, stroke:"#fffdf8", "stroke-width":"34", "vector-effect":"non-scaling-stroke" }));
    const leaf = Math.min(r.door.width*0.92, 800);
    svg.appendChild(svgEl("line", { x1:r.width, y1:dy2, x2:r.width-leaf, y2:dy2, class:"door-mark" }));
    svg.appendChild(svgEl("path", { d:`M ${r.width-leaf} ${dy2} A ${leaf} ${leaf} 0 0 1 ${r.width} ${dy2-leaf}`, class:"door-mark", "stroke-dasharray":"12 12" }));

    state.items.forEach(item => {
      const d = dims(item), warns = conflictsFor(item);
      const rect = svgEl("rect", {
        x:item.x, y:item.y, width:d.w, height:d.h, rx:item.type==="wc"?70:6,
        class:`fixture ${item.type}${item.id===selectedId?" selected":""}${warns.length?" warning":""}`,
        "data-id":item.id
      });
      rect.addEventListener("pointerdown", onPointerDown);
      svg.appendChild(rect);

      const cx=item.x+d.w/2, cy=item.y+d.h/2;
      const label=svgEl("text", {x:cx,y:cy-18,class:"fixture-label"}); label.textContent=item.name; svg.appendChild(label);
      if (d.w>240 && d.h>110) {
        const sub=svgEl("text", {x:cx,y:cy+48,class:"fixture-sub"}); sub.textContent=`${Math.round(d.w)} × ${Math.round(d.h)}`; svg.appendChild(sub);
      }
    });

    if (state.ui.showDims) drawDimensions();
    updateSurveyStatus();
    updateInspector();
  }

  function drawDimensions() {
    const r = state.room;
    svg.appendChild(svgEl("line", {x1:0,y1:-175,x2:r.width,y2:-175,class:"dim-line"}));
    svg.appendChild(svgEl("line", {x1:0,y1:-205,x2:0,y2:-145,class:"dim-line"}));
    svg.appendChild(svgEl("line", {x1:r.width,y1:-205,x2:r.width,y2:-145,class:"dim-line"}));
    let t=svgEl("text", {x:r.width/2,y:-205,class:"dim-text","text-anchor":"middle"}); t.textContent=`${r.width} mm`; svg.appendChild(t);

    svg.appendChild(svgEl("line", {x1:-175,y1:0,x2:-175,y2:r.depth,class:"dim-line"}));
    svg.appendChild(svgEl("line", {x1:-205,y1:0,x2:-145,y2:0,class:"dim-line"}));
    svg.appendChild(svgEl("line", {x1:-205,y1:r.depth,x2:-145,y2:r.depth,class:"dim-line"}));
    t=svgEl("text", {x:-240,y:r.depth/2,class:"dim-text",transform:`rotate(-90 -240 ${r.depth/2})`,"text-anchor":"middle"}); t.textContent=`${r.depth} mm`; svg.appendChild(t);

    const parts=[
      {x1:0,x2:r.window.before,text:r.window.before},
      {x1:r.window.before,x2:r.window.before+r.window.width,text:r.window.width},
      {x1:r.window.before+r.window.width,x2:r.width,text:r.window.after}
    ];
    parts.forEach(p=>{const tx=svgEl("text",{x:(p.x1+p.x2)/2,y:-75,class:"dim-text","text-anchor":"middle"});tx.textContent=p.text;svg.appendChild(tx);});

    const dx=r.width+90;
    const dparts=[
      {y1:0,y2:r.door.before,text:r.door.before},
      {y1:r.door.before,y2:r.door.before+r.door.width,text:r.door.width},
      {y1:r.door.before+r.door.width,y2:r.depth,text:r.door.after}
    ];
    dparts.forEach(p=>{const yy=(p.y1+p.y2)/2;const ty=svgEl("text",{x:dx,y:yy,class:"dim-text",transform:`rotate(90 ${dx} ${yy})`,"text-anchor":"middle"});ty.textContent=p.text;svg.appendChild(ty);});
  }

  function svgPoint(evt) {
    const pt = svg.createSVGPoint(); pt.x=evt.clientX; pt.y=evt.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function onPointerDown(evt) {
    const id=evt.currentTarget.dataset.id, item=state.items.find(i=>i.id===id);
    selectedId=id; render();
    if (!item || item.locked) return;
    checkpoint();
    const p=svgPoint(evt);
    drag={id,startX:p.x,startY:p.y,itemX:item.x,itemY:item.y};
    evt.currentTarget.setPointerCapture(evt.pointerId);
    evt.currentTarget.addEventListener("pointermove", onPointerMove);
    evt.currentTarget.addEventListener("pointerup", onPointerUp, {once:true});
    evt.currentTarget.addEventListener("pointercancel", onPointerUp, {once:true});
  }

  function onPointerMove(evt) {
    if (!drag) return;
    const item=state.items.find(i=>i.id===drag.id); if(!item)return;
    const p=svgPoint(evt), d=dims(item);
    let nx=Math.round(drag.itemX+(p.x-drag.startX)), ny=Math.round(drag.itemY+(p.y-drag.startY));
    if (state.ui.snap) {
      const s=35;
      if(Math.abs(nx)<=s)nx=0;
      if(Math.abs(ny)<=s)ny=0;
      if(Math.abs(nx+d.w-state.room.width)<=s)nx=state.room.width-d.w;
      if(Math.abs(ny+d.h-state.room.depth)<=s)ny=state.room.depth-d.h;
      for(const other of state.items){
        if(other.id===item.id)continue;
        const b=itemBBox(other);
        if(Math.abs(nx-b.x2)<=s)nx=b.x2;
        if(Math.abs(nx+d.w-b.x1)<=s)nx=b.x1-d.w;
        if(Math.abs(ny-b.y2)<=s)ny=b.y2;
        if(Math.abs(ny+d.h-b.y1)<=s)ny=b.y1-d.h;
      }
    }
    item.x=nx; item.y=ny; render();
  }

  function onPointerUp() { if(!drag)return; drag=null; saveState(); render(); }

  function updateInspector() {
    const item=state.items.find(i=>i.id===selectedId);
    if(!item){inspector.classList.add("hidden");$("selectionStatus").textContent="Tap an item to edit it.";return;}
    inspector.classList.remove("hidden");
    $("selectionStatus").textContent=item.locked?`${item.name} is locked.`:`${item.name} selected. Drag it on the plan or edit exact values below.`;
    $("inspectorTitle").textContent=item.name;
    $("itemName").value=item.name; $("itemType").value=item.type; $("itemX").value=item.x; $("itemY").value=item.y;
    $("itemW").value=item.w; $("itemH").value=item.h; $("itemRotation").value=String(item.rotation); $("itemLocked").checked=item.locked;
    const warnings=conflictsFor(item), warn=$("itemWarning");
    if(warnings.length){warn.classList.remove("hidden");warn.textContent=warnings.join(" ");}else{warn.classList.add("hidden");warn.textContent="";}
  }

  function bindInspector() {
    const fields=["itemName","itemType","itemX","itemY","itemW","itemH","itemRotation","itemLocked"];
    let before=null;
    fields.forEach(id=>{
      $(id).addEventListener("focus",()=>{before=clone(state);},{passive:true});
      $(id).addEventListener("change",()=>{
        const item=state.items.find(i=>i.id===selectedId); if(!item)return;
        if(before){history.push(before);if(history.length>50)history.shift();future=[];before=null;}
        item.name=$("itemName").value.trim()||item.name;
        item.type=$("itemType").value;
        item.x=Number($("itemX").value)||0; item.y=Number($("itemY").value)||0;
        item.w=Math.max(20,Number($("itemW").value)||20); item.h=Math.max(20,Number($("itemH").value)||20);
        item.rotation=Number($("itemRotation").value)===90?90:0; item.locked=$("itemLocked").checked;
        saveState();render();updateUndoRedo();
      });
    });
  }

  function addItem(type) {
    checkpoint();
    const presets={bath:{name:"Bath",w:1600,h:700},wc:{name:"WC",w:370,h:640},vanity:{name:"Floor-standing vanity",w:450,h:900},shower:{name:"Shower tray",w:1400,h:800},stud:{name:"Stud wall",w:900,h:100},storage:{name:"Storage",w:350,h:300},radiator:{name:"Radiator",w:100,h:600},niche:{name:"Wall niche",w:400,h:70}};
    const p=presets[type], id=`${type}-${Date.now()}`;
    state.items.push({id,type,name:p.name,x:200,y:900,w:p.w,h:p.h,rotation:0,locked:false});
    selectedId=id; saveState(); render(); $("addSheet").classList.add("hidden");
  }

  function duplicateSelected(){const item=state.items.find(i=>i.id===selectedId);if(!item)return;checkpoint();const c=clone(item);c.id=`${item.type}-${Date.now()}`;c.name=`${item.name} copy`;c.x+=50;c.y+=50;c.locked=false;state.items.push(c);selectedId=c.id;saveState();render();}
  function deleteSelected(){const item=state.items.find(i=>i.id===selectedId);if(!item)return;if(!confirm(`Delete ${item.name}?`))return;checkpoint();state.items=state.items.filter(i=>i.id!==selectedId);selectedId=null;saveState();render();}

  function syncInputs() {
    const r=state.room;
    $("roomWidth").value=r.width; $("roomDepth").value=r.depth; $("ceilingHeight").value=r.ceiling; $("designTolerance").value=r.tolerance;
    $("windowLeft").value=r.window.before; $("windowWidth").value=r.window.width; $("windowRight").value=r.window.after;
    $("doorBefore").value=r.door.before; $("doorWidth").value=r.door.width; $("doorAfter").value=r.door.after;
    $("projectName").value=state.project.name||""; $("planName").value=state.project.planName||""; $("projectNotes").value=state.project.notes||"";
    $("showDims").checked=state.ui.showDims; $("snapEnabled").checked=state.ui.snap; updateChecks(); updateDataSummary();
  }

  function bindProjectInputs() {
    const numericMap={roomWidth:["room","width"],roomDepth:["room","depth"],ceilingHeight:["room","ceiling"],designTolerance:["room","tolerance"],windowLeft:["room","window","before"],windowWidth:["room","window","width"],windowRight:["room","window","after"],doorBefore:["room","door","before"],doorWidth:["room","door","width"],doorAfter:["room","door","after"]};
    Object.entries(numericMap).forEach(([id,path])=>{$(id).addEventListener("change",()=>{checkpoint();let obj=state;for(let i=0;i<path.length-1;i++)obj=obj[path[i]];obj[path[path.length-1]]=Math.max(0,Number($(id).value)||0);saveState();updateChecks();render();});});
    [["projectName","name"],["planName","planName"],["projectNotes","notes"]].forEach(([id,key])=>{$(id).addEventListener("change",()=>{checkpoint();state.project[key]=$(id).value;saveState();});});
  }

  function updateChecks(){const c=roomChecks();const wc=$("windowCheck");wc.className=`checkline ${c.windowOk?"ok":"bad"}`;wc.textContent=c.windowOk?`✓ Segments total ${c.windowSum} mm`:`⚠ Segments total ${c.windowSum} mm, but room width is ${state.room.width} mm`;const dc=$("doorCheck");dc.className=`checkline ${c.doorOk?"ok":"bad"}`;dc.textContent=c.doorOk?`✓ Segments total ${c.doorSum} mm`:`⚠ Segments total ${c.doorSum} mm, but room depth is ${state.room.depth} mm`;}
  function updateSurveyStatus(){const c=roomChecks(),el=$("surveyStatus");if(c.windowOk&&c.doorOk){el.textContent="Survey dimensions reconcile";el.style.background="#e3eee2";el.style.color="#3e6242";}else{el.textContent="Survey mismatch — check Project";el.style.background="#fff0d9";el.style.color="#805419";}}
  function updateDataSummary(){const el=$("dataSummary");if(!el)return;const locked=state.items.filter(i=>i.locked).length;el.innerHTML=`<div><span>App version</span><strong>${esc(APP_VERSION)}</strong></div><div><span>Fixtures / objects</span><strong>${state.items.length}</strong></div><div><span>Locked objects</span><strong>${locked}</strong></div><div><span>Room</span><strong>${state.room.width} × ${state.room.depth} mm</strong></div><div><span>Ceiling</span><strong>${state.room.ceiling} mm</strong></div>`;}

  function exportBackup(){const filename=`bathroom-planner-backup-${new Date().toISOString().slice(0,10)}.json`;const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  async function importBackup(file){try{const text=await file.text(),parsed=JSON.parse(text);if(!parsed.room||!Array.isArray(parsed.items))throw new Error("Not a Bathroom Planner backup");checkpoint();state=parsed;selectedId=null;saveState();syncInputs();render();alert("Backup imported.");}catch(e){alert(`Could not import backup: ${e.message}`);}}
  async function reloadLatest(){try{if("serviceWorker" in navigator){const regs=await navigator.serviceWorker.getRegistrations();await Promise.all(regs.map(r=>r.unregister()));}if("caches" in window){const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));}}catch{}const u=new URL(location.href);u.searchParams.set("_reload",Date.now());location.replace(u.toString());}
  function registerSW(){if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js").catch(()=>{}));}
  function bindTabs(){document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));btn.classList.add("active");$(`tab-${btn.dataset.tab}`).classList.add("active");}));}

  function bindUI(){
    bindTabs();bindInspector();bindProjectInputs();
    $("undoBtn").addEventListener("click",undo);$("redoBtn").addEventListener("click",redo);
    $("showDims").addEventListener("change",e=>{state.ui.showDims=e.target.checked;saveState();render();});
    $("snapEnabled").addEventListener("change",e=>{state.ui.snap=e.target.checked;saveState();});
    $("addBtn").addEventListener("click",()=>$("addSheet").classList.remove("hidden"));$("closeAddBtn").addEventListener("click",()=>$("addSheet").classList.add("hidden"));
    $("addSheet").addEventListener("click",e=>{if(e.target===$("addSheet"))$("addSheet").classList.add("hidden");});
    document.querySelectorAll("[data-add-type]").forEach(b=>b.addEventListener("click",()=>addItem(b.dataset.addType)));
    $("closeInspectorBtn").addEventListener("click",()=>{selectedId=null;render();});$("duplicateBtn").addEventListener("click",duplicateSelected);$("deleteBtn").addEventListener("click",deleteSelected);
    $("exportBtn").addEventListener("click",exportBackup);$("importInput").addEventListener("change",e=>{if(e.target.files?.[0])importBackup(e.target.files[0]);e.target.value="";});
    $("resetBtn").addEventListener("click",()=>{if(!confirm("Reset the app to the V1 starter plan? Your current local plan will be replaced."))return;checkpoint();state=clone(starterState);selectedId=null;saveState();syncInputs();render();});
    $("reloadLatestBtn").addEventListener("click",reloadLatest);
    svg.addEventListener("pointerdown",e=>{if(e.target===svg||e.target.classList.contains("room-fill")){selectedId=null;render();}});
  }

  syncInputs();bindUI();updateUndoRedo();render();registerSW();
})();
