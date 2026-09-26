/* Metro Tycoon KL — online.js
   Bilik online: Firebase, penonton, had masa giliran, pembersihan bilik.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- online (Firebase Realtime Database) ---------- */
let NET=null, fdb=null, applying=false;
/* UID bermula sebagai ID rawak peranti (cukup untuk mod satu peranti), dan
   ditukar kepada uid Firebase Auth sebaik sahaja log masuk tanpa nama berjaya.
   Peraturan pangkalan data menyemak uid Auth ini, jadi hanya pemain yang
   benar-benar duduk dalam bilik boleh mengubah bilik itu. */
let UID=(()=>{let u=null;try{u=localStorage.getItem('mtkl-uid')}catch(e){}
  if(!u){u='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);try{localStorage.setItem('mtkl-uid',u)}catch(e){}}return u})();
const $=id=>document.getElementById(id);
let authWait=null,appCheckWait=null;
/* App Check dimuatkan hanya jika APPCHECK_SITE_KEY diisi, dan diaktifkan
   sebelum sebarang log masuk atau bacaan pangkalan data. */
function appCheckReady(){
  if(typeof APPCHECK_SITE_KEY==='undefined'||!APPCHECK_SITE_KEY)return Promise.resolve();
  return appCheckWait||(appCheckWait=new Promise((res,rej)=>{
      const s=document.createElement('script');
      s.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js';
      s.onload=res;s.onerror=()=>rej(new Error('App Check gagal dimuatkan'));document.head.appendChild(s)})
    .then(()=>firebase.appCheck().activate(new firebase.appCheck.ReCaptchaV3Provider(APPCHECK_SITE_KEY),true))
    .catch(e=>console.error(e)));
}
function fbReady(){
  if(fdb)return authWait||Promise.resolve(true);
  if(!FIREBASE_CONFIG||!window.firebase)return Promise.resolve(false);
  try{if(!firebase.apps.length)firebase.initializeApp(FIREBASE_CONFIG);fdb=firebase.database()}
  catch(e){console.error(e);return Promise.resolve(false)}
  if(!FIREBASE_CONFIG.apiKey||!firebase.auth){authWait=appCheckReady().then(()=>true);return authWait}
  /* Firebase mengingati log masuk tanpa nama pada pelayar ini, jadi pemain
     dapat uid yang sama setiap kali — boleh masuk semula ke bilik sendiri. */
  authWait=appCheckReady().then(()=>firebase.auth().signInAnonymously())
    .then(c=>{UID=c.user.uid;return true})
    .catch(e=>{console.error(e);fdb=null;authWait=null;
      omsg('Log masuk online gagal: '+(e&&e.message||e)+'. Semak Anonymous sign-in dalam Firebase.');return false});
  return authWait}
function isActor(){
  if(!S||!S.players[S.turn])return !NET;
  const p=S.players[S.turn];
  if(!NET)return !p.bot;                    /* satu peranti: bot main sendiri */
  return p.uid===UID||((p.bot||afkSeat===S.turn)&&botDriver()===UID)||(NET.host&&NET.override===S.turn)}
function isOnline(uid){if(String(uid||'').startsWith('bot_'))return true;
  return !!(NET&&NET.room&&NET.room.online&&NET.room.online[uid])}
let pendingRemote=null,inflight=false,dirty=false;
/* Revisi tertinggi yang KITA hantar — belum tentu disahkan. Berasingan
   daripada S.rev supaya gema tulisan sendiri boleh ditapis tanpa berpura-pura
   pelayan sudah menerimanya. */
let sentRev=0,sentGid=null;
/* S.rev ialah revisi yang pelayan SUDAH terima — tiada lonjakan awal.
   Revisi yang sedang kita cuba tulis hidup dalam pushState() sahaja sehingga
   ia disahkan; kalau ia gugur, S.rev tidak pernah bergerak. */
function sync(){
  if(!NET){if(checkMissions()){renderSide();renderMissions();achHook()}save();return}
  if(applying||!S||!NET.room||!NET.room.meta||!NET.room.meta.started||!isActorOrJustActed())return;
  if(checkMissions()){renderSide();renderMissions();achHook()}
  if(inflight){dirty=true;return}        /* satu tulisan dalam penerbangan sahaja */
  pushState();
}
/* Tulisan bersyarat: hanya terpakai jika tiada siapa menulis selepas revisi
   asas kita. Kalau ada, kita mengalah dan ambil keadaan pelayan. */
function pushState(){
  if(!NET||!S)return;
  const base=S.rev||0,gid=S.gid,next=base+1;
  if(sentGid!==gid){sentGid=gid;sentRev=0}
  sentRev=Math.max(sentRev,next);
  const payload=JSON.stringify(Object.assign({},S,{by:UID,rev:next}));
  const ref=NET.ref.child('state');
  inflight=true;dirty=false;
  const settle=ok=>{
    inflight=false;
    if(!ok){dirty=false;return}
    /* Sahkan revisi hanya selepas pelayan menerimanya, dan jangan undur
       kalau keadaan yang lebih baharu sudah tiba sementara itu. */
    if(S&&S.gid===gid&&(S.rev||0)<next){S.rev=next;S.by=UID}
    if(dirty)pushState();
  };
  if(typeof ref.transaction!=='function'){        /* SDK lama: tiada pilihan lain */
    ref.set(payload).then(()=>settle(true))
      .catch(err=>{settle(false);syncFailed(err)});return}
  ref.transaction(cur=>{
    if(cur){let c=null;try{c=JSON.parse(cur)}catch(e){}
      if(c&&c.gid===gid&&(c.rev||0)>base)return;  /* undefined = batalkan tulisan */
    }
    return payload;
  },(err,committed,snap)=>{
    if(err){settle(false);syncFailed(err);return}
    if(committed){settle(true);return}
    settle(false);
    const v=snap&&snap.val();
    if(v){toast('Keadaan permainan diselaraskan semula.');applyRemote(v,true)}
  },false);
}
function syncFailed(err){
  toast('Gagal menyimpan: '+((err&&err.message)||err||'tidak diketahui'));
  /* Jangan biarkan keadaan tempatan menyimpang daripada pelayan. */
  if(NET)NET.ref.child('state').get()
    .then(s=>{const v=s&&s.val();if(v)applyRemote(v,true)}).catch(()=>{});
}
/* Terima hanya keadaan yang berbentuk waras — jangan biarkan data rosak
   memadam permainan yang sedang berjalan. */
function validState(st){
  return !!st&&Array.isArray(st.players)&&st.players.length>=2
    &&Array.isArray(st.owner)&&st.owner.length===40
    &&Array.isArray(st.houses)&&st.houses.length===40
    &&Array.isArray(st.mort)&&st.mort.length===40
    &&typeof st.turn==='number'&&st.turn>=0&&st.turn<st.players.length
    &&typeof st.phase==='string'&&Array.isArray(st.log);
}
/* Keadaan yang tiba semasa animasi disimpan dahulu, bukan dibuang —
   berserta tanda force asalnya, supaya ia ditapis sama seperti sekiranya
   ia tiba tanpa tangguh. */
function flushRemote(){
  if(!pendingRemote||busy)return;
  const p=pendingRemote;pendingRemote=null;
  try{const st=JSON.parse(p.str);
    if(S&&st.gid===S.gid&&(st.rev||0)<=(S.rev||0))return;   /* sudah lapuk */
  }catch(e){return}
  applyRemote(p.str,p.force);
}
let actedTurn=null;
function isActorOrJustActed(){return isActor()||actedTurn===true}
function applyRemote(str,force){
  let st;try{st=JSON.parse(str)}catch(e){return}
  if(!validState(st))return;
  /* Gema tulisan kita sendiri — termasuk yang masih dalam penerbangan —
     tidak boleh menimpa suntingan tempatan yang lebih baharu. */
  const mineUpTo=S?(sentGid===S.gid?Math.max(S.rev||0,sentRev):(S.rev||0)):0;
  if(!force&&S&&st.by===UID&&(st.rev||0)<=mineUpTo&&S.gid===st.gid)return;
  /* Betul-betul sama: jangan render semula setiap kali kehadiran berubah. */
  if(S&&st.gid===S.gid&&(st.rev||0)===(S.rev||0)&&st.by===S.by)return;
  if(busy){pendingRemote={str,force:!!force};return}
  const prev=S;S=st;
  const same=prev&&prev.gid===S.gid;
  /* Peranti jauh tidak menjalankan animasi langkah demi langkah, jadi hanya
     ketibaan diumumkan — pemain di sana tetap dengar tren masuk stesen.
     Diumumkan sebelum render, supaya "tiba" didengar dahulu sebelum
     pengumuman sewa/beli yang dimainkan oleh render. */
  if(same&&prev.players.length===S.players.length){
    const k=S.players.findIndex((pl,i)=>pl.pos!==prev.players[i].pos);
    if(k>=0)sayArrive(S.players[k].pos);
  }
  applying=true;
  try{renderAll()}finally{applying=false}
  if(same&&S.rollId!==prev.rollId){rollDiceAnim();sfx.dice()}
  else if(same&&S.log[0]!==prev.log[0])sfx.step();
  if(same&&S.toast&&(!prev.toast||prev.toast.id!==S.toast.id))toast(S.toast.t);
  if(!same&&S.phase!=='over')$('endBox').hidden=true;
  if(S.phase==='over'&&(!prev||prev.phase!=='over'||!same))showEnd();
  if(same&&prev.phase==='over'&&S.phase!=='over'){$('endBox').hidden=true}
  if(same&&S.turn!==prev.turn&&S.phase!=='over'&&S.players[S.turn].uid===UID){toast('Giliran anda!');vib([70,60,70]);beep(880,.12,'triangle',.07);beep(1175,.16,'triangle',.07,.12)}
  if(same&&S.trade&&!prev.trade&&mySeat()===S.trade.to){
    toast(`Tawaran daripada ${S.players[S.trade.from].name}!`);sfx.card()}
}
/* ---------- penonton ----------
   Penonton tiada kerusi, jadi peraturan pangkalan data tidak membenarkan
   mereka menulis keadaan permainan — mereka hanya membaca. Nama mereka
   disimpan pada nod online sendiri (satu-satunya tempat mereka boleh tulis). */
function onlineVal(){
  const v={t:firebase.database.ServerValue.TIMESTAMP};
  if(NET&&NET.watch)v.w=NET.wname||'Penonton';
  return v}
function watchers(){
  if(!NET||!NET.room)return[];
  const on=NET.room.online||{},seats=NET.room.seats||{};
  return Object.entries(on).filter(([id,v])=>v&&typeof v==='object'&&v.w&&!seats[id]).map(([,v])=>String(v.w).slice(0,16))}
async function sitDown(){
  if(!NET||!NET.watch||!NET.room)return;
  const r=NET.room,seats=r.seats||{};
  if(r.meta.started){omsg('Permainan sudah bermula.');return}
  if(Object.keys(seats).length>=5){omsg('Bilik masih penuh.');return}
  const name=myName();if(!name){omsg('Masukkan nama anda dahulu.');$('myName').focus();return}
  try{await NET.ref.child('seats/'+UID).set(seatVal(name,seats));
    NET.watch=false;NET.ref.child('online/'+UID).set(onlineVal());omsg('');renderLobby()}
  catch(e){omsg('Tidak dapat mengambil kerusi: '+e.message)}}

/* ---------- had masa giliran ----------
   Setiap peranti mengira sendiri berapa lama keputusan yang ditunggu tidak
   berubah (keadaan permainan tidak bergerak, dan pemain itu tidak menyentuh
   skrin). Hanya pemandu bot (hos, atau pengganti jika hos terputus) yang
   bertindak apabila masa tamat — bot memainkan keputusan itu bagi pihak
   pemain. Tiada jam pelayan diperlukan: masa diukur dari saat peranti ini
   melihat perubahan terakhir. */
const AFK_OFFLINE=20;          /* pemain yang terputus: tunggu 20 saat sahaja */
let afkSeat=-1,afkKey='',afkSince=Date.now(),afkFired='',afkBeeped='',pingAt=0;
function awaitSeat(){
  if(!NET||!S||!NET.room||!NET.room.meta||!NET.room.meta.started)return -1;
  if(S.phase==='over'||S.phase==='moving'||busy)return -1;
  if(S.phase==='auction'&&S.auc)return S.auc.at;
  if(tradePending())return S.trade.to;
  return S.turn}
function afkLimit(k){
  const tl=S.tl==null?60:+S.tl;if(!tl)return 0;
  return isOnline(S.players[k].uid)?tl:Math.min(tl,AFK_OFFLINE)}
function afkTrack(){
  const k=awaitSeat();
  if(afkSeat>=0){const q=S&&S.players[afkSeat];
    /* Pemain kembali (dia sendiri menulis keadaan), atau keputusan sudah beralih. */
    if((k>=0&&k!==afkSeat)||S.phase==='over'||!q||(q.uid!==UID&&S.by===q.uid&&afkKey.split('|')[1]!==String(S.rev||0))){afkSeat=-1;clearBot()}}
  const p=k>=0?S.players[k]:null;
  const act=p&&NET.room.online?JSON.stringify(NET.room.online[p.uid]||0):'';
  const key=k<0?'':[S.gid,S.rev||0,k,S.phase,act].join('|');
  if(key!==afkKey){afkKey=key;afkSince=Date.now()}
  return k}
function afkLeft(){
  const k=afkTrack();if(k<0)return null;
  const p=S.players[k];if(!p||p.bot||p.bankrupt||k===afkSeat)return null;
  const lim=afkLimit(k);if(!lim)return null;
  return{k,p,lim,left:Math.max(0,Math.ceil(lim-(Date.now()-afkSince)/1000))}}
function afkPaint(){
  const el=document.getElementById('afkClock');if(!el)return;
  const a=NET&&S?afkLeft():null;
  if(!a){el.hidden=true;return}
  const mine=a.p.uid===UID,hot=a.left<=15;
  el.hidden=false;el.classList.toggle('hot',hot);
  const txt=mine?(hot?`⏱ ${a.left}s — cepat, bot akan ambil alih!`:`⏱ ${a.left}s untuk bertindak`)
    :`⏱ ${esc(a.p.name)} · ${a.left}s${isOnline(a.p.uid)?'':' (luar talian)'}`;
  el.innerHTML=`<span>${txt}</span><span class="tr"><i style="width:${Math.round(100*a.left/a.lim)}%"></i></span>`;
  if(mine&&a.left<=10&&a.left>0&&afkBeeped!==afkKey){afkBeeped=afkKey;
    vib([120,80,120]);beep(660,.14,'square',.05);beep(660,.14,'square',.05,.22)}}
function afkTick(){
  if(!NET||!S)return;
  const a=afkLeft();afkPaint();
  if(!a||a.left>0||busy||afkFired===afkKey)return;
  if(botDriver()!==UID)return;          /* seorang sahaja yang bertindak */
  afkFired=afkKey;afkSeat=a.k;
  const t=`⏱ ${a.p.name} tiada respons — bot ambil alih.`;
  addLog(t);toastAll(t);sayAll('afk',a.p.name);
  actedTurn=true;try{renderAll()}finally{actedTurn=null}}
setInterval(afkTick,1000);
/* Sentuhan pemain yang sedang ditunggu = masih di sini. Dihantar paling
   kerap setiap 8 saat, dan hanya ketika gilirannya. */
function afkPing(){
  if(!NET||!NET.ref||NET.watch||!S)return;
  const me=mySeat();if(me<0)return;
  if(afkSeat===me){afkSeat=-1;clearBot();renderSide()}
  if(awaitSeat()!==me)return;
  const now=Date.now();if(now-pingAt<8000)return;pingAt=now;
  NET.ref.child('online/'+UID).set(onlineVal()).catch(()=>{})}
addEventListener('pointerdown',afkPing,{passive:true});
addEventListener('keydown',afkPing);
function omsg(t){$('onlineMsg').textContent=t||''}
/* Kerusi baharu membawa watak pilihan tersimpan, jika kucing itu belum diambil. */
function seatVal(name,seats){const v={name,t:Date.now()},t=prefTok();
  if(t&&(t==='tren'||!Object.values(seats||{}).some(s=>s&&s.tok===t)))v.tok=t;return v}
function pickTokOnline(t){
  if(!NET||!NET.room||NET.watch||NET.room.meta.started)return;
  const seats=NET.room.seats||{};if(!seats[UID]||!isTok(t))return;
  if(t!=='tren'&&Object.entries(seats).some(([id,s])=>id!==UID&&s&&s.tok===t)){toast('Watak itu sudah dipilih pemain lain.');return}
  savePrefTok(t);
  NET.ref.child('seats/'+UID+'/tok').set(t).catch(err=>omsg('Tidak dapat menukar watak: '+err.message))}
function myName(){const n=$('myName').value.trim();try{localStorage.setItem('mtkl-name',n)}catch(e){}return n}
const CODE_CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const genCode=()=>[...Array(5)].map(()=>CODE_CH[Math.floor(Math.random()*CODE_CH.length)]).join('');
/* ---------- simpanan bilik yang SAYA cipta ---------- */
const MYROOMS='mtkl-myrooms', ROOM_TTL=24*60*60*1000;   /* 24 jam */
function readMyRooms(){
  try{const v=JSON.parse(localStorage.getItem(MYROOMS)||'[]');
    return Array.isArray(v)?v.filter(r=>r&&typeof r.code==='string'):[]}catch(e){return[]}}
function writeMyRooms(v){try{localStorage.setItem(MYROOMS,JSON.stringify(v.slice(-30)))}catch(e){}}
function rememberRoom(code){const m=readMyRooms().filter(r=>r.code!==code);
  m.push({code,t:Date.now()});writeMyRooms(m)}
function forgetRoom(code){writeMyRooms(readMyRooms().filter(r=>r.code!==code))}
/* Buang bilik lama milik sendiri sahaja, dan hanya yang sudah lewat tempoh.
   Bilik orang lain tidak pernah disentuh — kita tidak tahu ia masih dimainkan atau tidak. */
function sweepMyRooms(keep){
  if(!fdb)return;
  const cut=Date.now()-ROOM_TTL,left=[];
  readMyRooms().forEach(r=>{
    if(r.code===keep||!r.t||r.t>cut){left.push(r);return}
    dropRoom(r.code);
  });
  writeMyRooms(left);
}
/* Padam bilik, kemudian entri indeksnya. Indeks hanya boleh dibuang oleh hos
   atau selepas bilik itu tiada, jadi urutan ini penting. */
function dropRoom(code){
  const idx=fdb.ref('roomIndex/'+code);
  return fdb.ref('rooms/'+code).remove()
    .then(()=>idx.remove())
    .catch(()=>fdb.ref('rooms/'+code+'/meta/created').get()
      .then(s=>{if(!s.exists())return idx.remove()}))
    .catch(()=>{});
}
/* ---------- bilik terbiar sesiapa ----------
   Setiap bilik didaftarkan dalam roomIndex (kod → masa dicipta). Sesiapa yang
   membuka laman menyapu beberapa bilik tertua. Peraturan pangkalan data hanya
   membenarkan pemadaman jika bilik lebih tua daripada 48 jam DAN tiada sesiapa
   dalam talian, jadi permainan yang sedang dimainkan tidak akan terjejas. */
const STALE_TTL=48*60*60*1000;
function sweepStaleRooms(keep){
  if(!fdb)return;
  fdb.ref('roomIndex').orderByValue().endAt(Date.now()-STALE_TTL).limitToFirst(10).get()
    .then(s=>s.forEach(c=>{if(c.key!==keep)dropRoom(c.key)}))
    .catch(()=>{});
}
/* Tuntut satu kod secara atomik: transaksi hanya menulis jika nod itu masih
   kosong. Mengembalikan undefined membatalkan tulisan, jadi bilik yang sedang
   dimainkan tidak mungkin ditimpa — walaupun dua hos menjana kod yang sama serentak. */
function claimRoom(code,data){
  return new Promise((res,rej)=>{
    const ref=fdb.ref('rooms/'+code);
    if(typeof ref.transaction!=='function'){     /* SDK lama: sekurang-kurangnya jangan timpa */
      ref.get().then(s=>s.exists()?res(false):ref.set(data).then(()=>res(true)))
        .catch(rej);return}
    ref.transaction(cur=>cur===null?data:undefined,
      (err,committed)=>err?rej(err):res(!!committed),false);
  });
}
async function createRoom(){
  if(!await fbReady()){if(!$('onlineMsg').textContent)omsg('Firebase belum disediakan.');return}
  const name=myName();if(!name){omsg('Masukkan nama anda dahulu.');$('myName').focus();return}
  omsg('Mencipta bilik…');
  const data={meta:{host:UID,qual:+$('oQual').value,endLaps:+$('oEnd').value,cash:+$('oCash').value,auc:$('oAuc').value==='1',fast:$('oMode').value==='1',tl:+$('oTL').value,created:Date.now(),started:false},
    seats:{[UID]:seatVal(name,{})}};
  try{
    let code=null;
    for(let i=0;i<8&&!code;i++){const c=genCode();if(await claimRoom(c,data))code=c}
    if(!code){omsg('Tidak dapat mencari kod bilik yang kosong. Cuba sekali lagi.');return}
    fdb.ref('roomIndex/'+code).set(data.meta.created).catch(()=>{});
    rememberRoom(code);
    enterRoom(code);omsg('');track('online-cipta','Cipta bilik online');
    sweepMyRooms(code)}
  catch(e){omsg('Tidak dapat mencipta bilik: '+e.message+'. Semak peraturan pangkalan data Firebase.')}
}
async function joinRoom(code,silent){
  if(!await fbReady()){if(!silent&&!$('onlineMsg').textContent)omsg('Firebase belum disediakan.');return false}
  code=(code||'').trim().toUpperCase();if(code.length!==5){if(!silent)omsg('Kod bilik mesti 5 aksara.');return false}
  try{const snap=await fdb.ref('rooms/'+code).get();
    if(!snap.exists()){if(!silent)omsg(`Bilik ${code} tidak dijumpai. Semak semula kod.`);return false}
    const r=snap.val();const seats=r.seats||{};
    if(!seats[UID]){
      /* Permainan sudah bermula atau bilik penuh: masuk sebagai penonton. */
      if(r.meta.started||Object.keys(seats).length>=5){enterRoom(code,true);omsg('');if(!silent)track('online-tonton','Tonton bilik online');return true}
      if(silent)return false;
      const name=myName();if(!name){omsg('Masukkan nama anda dahulu.');$('myName').focus();return false}
      await fdb.ref(`rooms/${code}/seats/${UID}`).set(seatVal(name,seats))}
    enterRoom(code);omsg('');if(!silent)track('online-sertai','Sertai bilik online');return true}
  catch(e){if(!silent)omsg('Tidak dapat menyertai bilik: '+e.message);return false}
}
function enterRoom(code,watch){
  if(NET)leaveRoom(true);
  NET={code,ref:fdb.ref('rooms/'+code),host:false,override:null,room:null,shown:false,
    watch:!!watch,wname:(myName()||'Penonton').slice(0,16)};
  try{localStorage.setItem('mtkl-room',code)}catch(e){}
  const on=NET.ref.child('online/'+UID);on.set(onlineVal());on.onDisconnect().remove();
  NET.ref.on('value',onRoom);
  try{const u=new URL(location.href);u.searchParams.set('bilik',code);history.replaceState(null,'',u)}catch(e){}
  $('roomChip').hidden=false;$('roomChip').textContent='Bilik '+code;
  renderLobby();
  if(watch)toast('Anda masuk sebagai penonton 👀');
}
function onRoom(snap){
  if(!NET)return;const r=snap.val();
  if(!r||!r.meta){const c=NET.code;leaveRoom();forgetRoom(c);openSetup();omsg(`Bilik ${c} sudah tiada.`);return}
  NET.room=r;NET.host=r.meta.host===UID;
  if(r.meta.started&&r.state){
    applyRemote(r.state);
    if(!NET.shown){NET.shown=true;$('setup').hidden=true}
  }
  renderLobby();if(S&&r.meta.started){afkTrack();renderSide()}
}
function renderLobby(){
  const online=!!FIREBASE_CONFIG;$('onlineOff').hidden=online;$('onlineStart').hidden=!online||!!NET;$('lobby').hidden=!NET;
  if(!NET||!NET.room)return;const r=NET.room;
  $('lobbyCode').textContent=NET.code;
  const seats=Object.entries(r.seats||{}).sort((a,b)=>a[1].t-b[1].t);
  const started=!!r.meta.started;
  const shown=fixToks(seats.map(s=>s[1].tok));
  const mi=seats.findIndex(s=>s[0]===UID);
  const tl=$('tokLobby');tl.hidden=started||NET.watch||mi<0||mi>4;
  if(!tl.hidden){const taken=new Set(seats.filter(s=>s[0]!==UID&&s[1].tok&&s[1].tok!=='tren').map(s=>s[1].tok));
    tl.innerHTML=tokPicker(shown[mi],mi,COLORS[mi],taken,true)}
  $('seats').innerHTML=seats.map(([id,v],i)=>`<li>${trainMark(i,null,'',shown[i])}<span class="sp">${esc(v.name)}${
    v.bot?` <span class="chip">Bot ${BOT_LEVELS[v.bot]||v.bot}</span>`:''}${
    id===UID?' <span class="chip ok">Anda</span>':''}${
    id===r.meta.host?' <span class="chip">Hos</span>':''}</span>${
    v.bot&&NET.host&&!started?`<button class="mini" type="button" data-kick="${id}">Buang</button>`:''
    }<span class="live ${isOnline(id)?'':'off'}" title="${isOnline(id)?'Dalam talian':'Luar talian'}"></span></li>`).join('');
  $('botAdd').hidden=!NET.host||started||seats.length>=5;
  const w=watchers();
  $('watchers').hidden=!w.length;
  $('watchers').textContent=w.length?`👀 Penonton (${w.length}): ${w.join(', ')}`:'';
  $('roomChip').textContent='Bilik '+NET.code+(NET.watch?' · Menonton':'')+(w.length?` · 👀${w.length}`:'');
  $('btnSit').hidden=!NET.watch||started||seats.length>=5;
  $('btnStartOnline').hidden=!NET.host||started;$('btnStartOnline').disabled=seats.length<2;
  $('btnBackGame').hidden=!started;
  const humans=seats.filter(s=>!s[1].bot).length;
  $('lobbyNote').textContent=NET.watch?(started?'Anda sedang menonton permainan ini.'
      :seats.length>=5?'Bilik penuh — anda menonton. Jika ada kerusi kosong, anda boleh ambil.'
      :'Ada kerusi kosong! Masukkan nama dan tekan Ambil kerusi kosong.')
    :started?'Permainan sedang berjalan.'
    :NET.host?(seats.length<2?'Tambah bot, atau tunggu seorang lagi pemain.'
      :`${seats.length} pemain sedia${humans<seats.length?` (${seats.length-humans} bot)`:''}. Tekan Mula permainan apabila semua sudah masuk.`)
    :'Menunggu hos memulakan permainan…';
}
/* Bot menduduki kerusi seperti pemain biasa; hos yang menggerakkannya. */
function addBot(lv){
  if(!NET||!NET.host||!NET.room||NET.room.meta.started)return;
  const seats=NET.room.seats||{};
  if(Object.keys(seats).length>=5)return;
  const used=Object.values(seats).map(s=>s.name);
  const name=BOT_NAMES.find(n=>!used.includes(n))||('Bot '+(Object.keys(seats).length+1));
  const id='bot_'+Math.random().toString(36).slice(2,8);
  NET.ref.child('seats/'+id).set({name,t:Date.now(),bot:lv})
    .catch(err=>omsg('Tidak dapat menambah bot: '+err.message))}
async function startOnline(){
  if(!NET||!NET.host)return;const r=NET.room;const seats=Object.entries(r.seats||{}).sort((a,b)=>a[1].t-b[1].t).slice(0,5);
  if(seats.length<2)return;
  newGame(seats.map(s=>s[1].name),r.meta.qual,r.meta.endLaps,r.meta.cash,
          seats.map(s=>s[1].bot||null),r.meta.auc!==false,!!r.meta.fast);
  S.players.forEach((p,i)=>p.uid=seats[i][0]);S.gid=Date.now().toString(36);S.started=true;S.rev=0;
  track('online-mula',`Mula online · ${seats.length} pemain`);
  S.tl=r.meta.tl==null?60:+r.meta.tl;afkSeat=-1;
  {const tk=fixToks(seats.map(s=>s[1].tok));S.players.forEach((p,i)=>p.tok=tk[i])}
  await NET.ref.child('meta/started').set(true);
  NET.shown=true;$('setup').hidden=true;
  actedTurn=true;renderAll();actedTurn=null;
}
function restartOnline(){
  if(!NET||!NET.host)return;if(!confirm('Mulakan permainan baharu dengan pemain yang sama?'))return;
  $('endBox').hidden=true;startOnline();
}
function leaveRoom(quiet){
  if(!NET)return;const n=NET;NET=null;
  try{n.ref.off('value',onRoom);n.ref.child('online/'+UID).remove();
    if(n.room&&n.room.meta&&!n.room.meta.started){
      const seats=n.room.seats||{};
      const others=Object.keys(seats).filter(id=>id!==UID&&!String(id).startsWith('bot_'));
      /* Hos keluar sebelum permainan bermula dan tiada manusia lain tinggal:
         bilik itu tidak akan digunakan lagi, jadi buang terus. */
      if(n.room.meta.host===UID&&!others.length){
        dropRoom(n.code);forgetRoom(n.code)}
      else n.ref.child('seats/'+UID).remove()}}catch(e){}
  try{localStorage.removeItem('mtkl-room')}catch(e){}
  try{const u=new URL(location.href);u.searchParams.delete('bilik');history.replaceState(null,'',u)}catch(e){}
  $('roomChip').hidden=true;
  if(!quiet){newGame(DEFAULT_NAMES.slice(),0,0,1500);renderAll()}
  renderLobby();
}
function inviteLink(){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('bilik',NET.code);return u.toString()}
async function copyInvite(){if(!NET)return;const link=inviteLink();
  try{await navigator.clipboard.writeText(link);toast('Pautan jemputan disalin. Hantar kepada kawan!')}catch(e){prompt('Salin pautan ini:',link)}}
function setTab(t){$('tabOnline').classList.toggle('on',t==='online');$('tabLocal').classList.toggle('on',t==='local');
  $('paneOnline').hidden=t!=='online';$('setupForm').hidden=t!=='local';$('tabOnline').setAttribute('aria-selected',t==='online');$('tabLocal').setAttribute('aria-selected',t==='local')}
$('tabOnline').onclick=()=>setTab('online');$('tabLocal').onclick=()=>setTab('local');
$('btnCreate').onclick=createRoom;
$('btnJoin').onclick=()=>joinRoom($('joinCode').value);
$('joinCode').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();joinRoom($('joinCode').value)}});
$('btnLeave').onclick=()=>{if(NET&&NET.room&&NET.room.meta.started&&!confirm('Keluar dari bilik? Anda boleh masuk semula dengan kod yang sama.'))return;leaveRoom()};
$('botAdd').addEventListener('click',e=>{const b=e.target.closest('[data-bot]');
  if(b&&NET&&NET.host)addBot(b.dataset.bot)});
$('seats').addEventListener('click',e=>{const b=e.target.closest('[data-kick]');
  if(b&&NET&&NET.host)NET.ref.child('seats/'+b.dataset.kick).remove()
    .catch(err=>omsg('Tidak dapat membuang bot: '+err.message))});
$('btnStartOnline').onclick=startOnline;
$('btnSit').onclick=sitDown;
$('tokLobby').addEventListener('click',e=>{const tp=e.target.closest('.tp');if(tp&&!tp.disabled)pickTokOnline(tp.dataset.tok)});
$('btnBackGame').onclick=()=>{$('setup').hidden=true};
$('btnCopy').onclick=copyInvite;$('roomChip').onclick=copyInvite;
