/* Metro Tycoon KL — app.js
   Panel giliran telefon, tab bawah, tetingkap, boot dan PWA. Mesti dimuat terakhir.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* Ukur tinggi sebenar bar, termasuk baris butang tambahan dan safe area. */
const turnDock=document.getElementById('turn');
const turnDockMedia=matchMedia('(max-width:1000px)');
let dockFrame=0;
function updateTurnDock(){
  dockFrame=0;
  const covered=!!document.querySelector('.overlay:not([hidden])');
  document.body.classList.toggle('turn-dock-obscured',covered);
  const height=turnDockMedia.matches&&!covered?Math.ceil(turnDock.getBoundingClientRect().height):0;
  document.documentElement.style.setProperty('--turn-dock-height',height+'px');
  const tb=document.getElementById('tabbar');
  const tbh=tb&&turnDockMedia.matches&&!covered?Math.ceil(tb.getBoundingClientRect().height):0;
  document.documentElement.style.setProperty('--tabbar-h',tbh+'px');
}
function queueTurnDock(){if(!dockFrame)dockFrame=requestAnimationFrame(updateTurnDock)}
if(window.ResizeObserver)new ResizeObserver(queueTurnDock).observe(turnDock);
const dockObserver=new MutationObserver(queueTurnDock);
document.querySelectorAll('.overlay').forEach(el=>dockObserver.observe(el,{attributes:true,attributeFilter:['hidden']}));
dockObserver.observe(turnDock,{childList:true,subtree:true});
window.addEventListener('resize',queueTurnDock);
queueTurnDock();

/* ---------- tab bawah: Papan · Aset · Log ----------
   Pilihan tab disimpan pada <body data-tab>, dan CSS yang menyorok/menunjuk
   bahagian. Pada skrin lebar CSS mengabaikannya, jadi tiada kesan di komputer.
   - Lencana Log: bilangan catatan baharu sejak kali terakhir tab Log dibuka.
   - Lencana Aset: titik bila hartanah anda bertambah/berkurang atau misi selesai.
   - Tekan butang tindakan (baling dadu, beli…) terus kembali ke Papan supaya
     pergerakan token tidak terlepas. */
(()=>{
  const bar=document.getElementById('tabbar');if(!bar)return;
  const tabs=[...bar.querySelectorAll('[role="tab"]')];
  const bLog=document.getElementById('bdgLog'),bAset=document.getElementById('bdgAset');
  let tab='papan',seenLog=null,seenAset=null;
  const logKey=()=>(S&&S.log&&S.log[0])||'';
  const asetKey=()=>{
    const p=document.getElementById('props'),m=document.getElementById('missions');
    return (p?p.querySelectorAll('li.pp').length:0)+'|'+(m?m.querySelectorAll('li.ms.ok').length:0)};
  function setTab(t,{focus=false,scroll=true}={}){
    if(!tabs.some(b=>b.dataset.tab===t))t='papan';
    const changed=t!==tab;tab=t;document.body.dataset.tab=t;
    tabs.forEach(b=>{const on=b.dataset.tab===t;b.setAttribute('aria-selected',on?'true':'false');b.tabIndex=on?0:-1;
      if(on&&focus)b.focus()});
    if(t==='log')seenLog=null;
    if(t==='aset')seenAset=asetKey();
    badges();
    if(changed&&scroll&&turnDockMedia.matches)window.scrollTo({top:0,behavior:'instant'});
  }
  function badges(){
    /* Log: kira catatan di atas yang terakhir dilihat */
    if(tab==='log'||!S||!S.log){seenLog=logKey();bLog.hidden=true}
    else{
      if(seenLog===null)seenLog=logKey();
      let n=S.log.indexOf(seenLog);if(n<0)n=Math.min(S.log.length,40);
      bLog.hidden=n===0;bLog.textContent=n>9?'9+':String(n);
    }
    /* Aset: titik sahaja */
    const k=asetKey();
    if(tab==='aset'||seenAset===null){seenAset=k;bAset.hidden=true}
    else bAset.hidden=k===seenAset;
    const lbl=(b,base,n)=>b.closest('button').setAttribute('aria-label',base+(n?`, ${n}`:''));
    lbl(bLog,'Log',bLog.hidden?'':bLog.textContent+' catatan baharu');
    lbl(bAset,'Aset',bAset.hidden?'':'ada perubahan');
  }
  bar.addEventListener('click',e=>{const b=e.target.closest('[role="tab"]');if(b)setTab(b.dataset.tab)});
  /* Anak panah kiri/kanan antara tab, seperti tablist biasa. */
  bar.addEventListener('keydown',e=>{
    const i=tabs.findIndex(b=>b.dataset.tab===tab);let j=-1;
    if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;
    else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;
    if(j>=0){e.preventDefault();setTab(tabs[j].dataset.tab,{focus:true})}});
  /* Butang tindakan dalam panel giliran → kembali ke papan. */
  document.getElementById('turn').addEventListener('click',e=>{
    if(tab!=='papan'&&turnDockMedia.matches&&e.target.closest('button.btn'))setTab('papan')},true);
  /* Pintasan Space/Enter untuk baling dadu juga membawa ke Papan. */
  document.addEventListener('keydown',e=>{
    if(tab==='papan'||(e.key!==' '&&e.key!=='Enter'))return;
    if(e.target.closest&&e.target.closest('input,select,textarea,button,.sq,[role="tab"]'))return;
    if(document.querySelector('.overlay:not([hidden])'))return;
    setTab('papan',{scroll:false})},true);
  /* Kemas kini lencana setiap kali panel sisi dilukis semula. */
  const watch=new MutationObserver(()=>badges());
  ['log','props','missions'].forEach(id=>{const el=document.getElementById(id);if(el)watch.observe(el,{childList:true,subtree:true})});
  /* Permainan baharu: mula semula dari Papan, tanpa lencana lama. */
  const setupEl=document.getElementById('setup');
  new MutationObserver(()=>{
    if(!setupEl.hidden){setTab('papan',{scroll:false});return}
    /* Skrin mula ditutup: permainan (baharu atau disambung) sudah dilukis.
       Semua yang ada sekarang dikira "sudah dilihat" — lencana hanya untuk yang berlaku selepas ini. */
    const mark=()=>{seenLog=logKey();seenAset=asetKey();badges()};
    /* Mod cepat membahagikan stesen dengan animasi selepas papan dilukis, jadi tandakan sekali lagi selepas itu. */
    setTimeout(mark,0);setTimeout(()=>{if(S&&!S.log.some(l=>/baling/i.test(l)))mark()},1800)})
    .observe(setupEl,{attributes:true,attributeFilter:['hidden']});
  setTab('papan',{scroll:false});
})();

/* ---------- tetingkap (modal) boleh diakses ----------
   Setiap .overlay dibuka dan ditutup dengan atribut hidden di banyak tempat,
   jadi pengurus ini hanya memerhati atribut itu. Tetingkap paling atas:
   - menerima fokus bila dibuka, dan fokus kembali ke tempat asal bila ditutup;
   - bahagian lain laman dijadikan `inert` (tidak boleh ditab atau dibaca
     pembaca skrin), jadi fokus tidak terlepas ke papan di belakang;
   - Escape menutupnya, tetapi hanya jika ada butang tutup yang sah dan kelihatan.
     Lelongan dan skrin tamat sengaja tiada Escape kerana ia sebahagian permainan. */
(()=>{
  const overlays=[...document.querySelectorAll('.overlay')];
  const usable=id=>{const b=document.getElementById(id);
    return b&&!b.disabled&&b.getClientRects().length?b:null};
  const ESC={
    rulesBox:()=>usable('btnRulesClose'),
    deedBox:()=>usable('deedClose'),
    tradeBox:()=>usable('tradeCancel'),
    setup:()=>usable('homeResume')||usable('btnResume')};
  let stack=[];const back=new Map(),inerted=new Set();
  function sync(){
    const open=overlays.filter(o=>!o.hidden);
    const closed=stack.filter(o=>!open.includes(o));
    const added=open.filter(o=>!stack.includes(o));
    stack=stack.filter(o=>open.includes(o)).concat(added);
    added.forEach(o=>{const a=document.activeElement;back.set(o,a&&a!==document.body?a:null)});
    const top=stack[stack.length-1]||null;
    /* inert: semua anak <body> kecuali tetingkap paling atas */
    const want=new Set(top?[...document.body.children].filter(el=>el!==top&&el.tagName!=='SCRIPT'):[]);
    inerted.forEach(el=>{if(!want.has(el)){el.inert=false;inerted.delete(el)}});
    want.forEach(el=>{if(!el.inert){el.inert=true;inerted.add(el)}});
    if(added.length&&top){
      const m=top.querySelector('.modal');
      if(m&&!m.contains(document.activeElement))m.focus({preventScroll:true})}
    else if(closed.length){
      const to=closed.map(o=>back.get(o)).find(el=>el&&el.isConnected&&!el.closest('[inert],[hidden]'));
      if(to)to.focus({preventScroll:true});
      else if(top){const m=top.querySelector('.modal');if(m)m.focus({preventScroll:true})}}
    closed.forEach(o=>back.delete(o));
  }
  const mo=new MutationObserver(sync);
  overlays.forEach(o=>mo.observe(o,{attributes:true,attributeFilter:['hidden']}));
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape'||!stack.length)return;
    const top=stack[stack.length-1],pick=ESC[top.id],b=pick&&pick();
    if(b){e.preventDefault();b.click()}});
  sync();
})();

/* ---------- boot ---------- */
async function start(){
  loadPrefs();buildBoard();bindZoom();
  const hs=document.getElementById('homeSky');if(hs)hs.innerHTML=skylineSVG('skyh');
  applyView();
  try{$('myName').value=localStorage.getItem('mtkl-name')||''}catch(e){}
  const params=new URLSearchParams(location.search);const invite=(params.get('bilik')||'').toUpperCase();
  let savedRoom=null;try{savedRoom=localStorage.getItem('mtkl-room')}catch(e){}
  const saved=loadSave();
  if(saved&&saved.started&&!invite&&!savedRoom){S=saved;renderAll();if(saveRecoveryNotice)toast(saveRecoveryNotice);return}
  const tryCode=FIREBASE_CONFIG?(invite||savedRoom):null;
  newGame(DEFAULT_NAMES.slice(),0,0,1500);renderAll();
  /* Pautan jemputan terus ke lobi; selainnya, skrin mula ringkas. */
  openSetup(tryCode?'full':'home');
  setTab(FIREBASE_CONFIG?'online':'local');
  if(!FIREBASE_CONFIG)return;
  if(await fbReady()){sweepMyRooms(tryCode||null);sweepStaleRooms(tryCode||null)}   /* kemas bilik lama setiap kali dibuka */
  if(tryCode){$('joinCode').value=tryCode;
    const ok=await joinRoom(tryCode,true);
    if(!ok){try{localStorage.removeItem('mtkl-room')}catch(e){}
      if(invite)omsg(`Anda dijemput ke bilik ${invite}. Masukkan nama dan tekan Sertai.`)}}
}
start();

/* ---------- PWA: pasang sebagai app & main tanpa internet ----------
   Service worker menyimpan salinan laman supaya mod satu peranti boleh dimain
   tanpa internet. Android/Chrome memberi dialog pasang sebenar; iPhone tiada
   API itu, jadi kita tunjukkan langkah Kongsi → Add to Home Screen. */
if('serviceWorker'in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))
  addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
(()=>{const btn=document.getElementById('btnInstall');if(!btn)return;
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  let deferred=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;btn.hidden=false});
  addEventListener('appinstalled',()=>{btn.hidden=true;deferred=null;toast('Metro Tycoon KL dipasang! Buka dari skrin utama.')});
  if(ios&&!standalone)btn.hidden=false;
  btn.onclick=async()=>{
    if(deferred){deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;btn.hidden=true;return}
    if(ios)alert('Pasang di iPhone/iPad:\n\n1. Tekan butang Kongsi (petak dengan anak panah ke atas) di Safari.\n2. Pilih "Add to Home Screen" / "Tambah ke Skrin Utama".\n3. Tekan "Add".')}})();
/* Petunjuk "Ketik petak…" hanya perlu dibaca sekali. Selepas pemain
   mengetik petak pertama, petunjuk disembunyikan (dan diingati untuk lawatan
   seterusnya) supaya papan dan panel giliran dapat lebih ruang. */
(()=>{let seen=false;try{seen=localStorage.getItem('mtkl-tapped')==='1'}catch(e){}
  if(seen){document.body.classList.add('tapped');return}
  const b=document.getElementById('board');if(!b)return;
  b.addEventListener('click',e=>{if(!e.target.closest('.sq'))return;
    document.body.classList.add('tapped');try{localStorage.setItem('mtkl-tapped','1')}catch(e){}},{once:false})})();
