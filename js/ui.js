/* Metro Tycoon KL — ui.js
   Butang & papan kekunci, borang persediaan, pandangan 3D dan enjin partikel.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- events ---------- */
document.getElementById('deedClose').onclick=closeDeed;
document.getElementById('deedBox').addEventListener('click',e=>{
  if(e.target.id==='deedBox')closeDeed()});          /* ketuk luar untuk tutup */
document.getElementById('turn').addEventListener('click',e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;
  if(a==='takeover'){if(NET&&NET.host&&confirm(`Ambil alih giliran ${cur().name}? Guna ini jika pemain itu terputus.`)){NET.override=S.turn;renderSide()}return}
  if(a==='again'){if(NET){if(NET.host)restartOnline();return}openSetup();return}
  if(a==='trade'){openTrade();return}
  if(!isActor())return;
  const fn=({roll:rollDice,buy,pass,end:endTurn,bail:payBail,card:useCard,bankrupt,along:alongPinjam,alongpay:alongBayar})[a];
  if(fn){actedTurn=true;try{fn()}finally{actedTurn=null}}});
document.getElementById('props').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
  if(d.focus!==undefined){
    if(matchMedia('(max-width:1000px)').matches)document.getElementById('tabPapan').click();
    requestAnimationFrame(()=>focusAsset(Number(d.focus)));
    return;
  }
  if(!isActor())return;
  actedTurn=true;try{if(d.b)build(+d.b);else if(d.s)sell(+d.s);else if(d.m)mortgage(+d.m);else if(d.u)unmortgage(+d.u)}finally{actedTurn=null}});
/* --- lelongan --- */
document.getElementById('aucActs').addEventListener('click',e=>{
  const b=e.target.closest('[data-bid]');if(!b||b.disabled)return;
  if(S.phase!=='auction'||!S.auc||S.players[S.auc.at].bot)return;
  const rescue=NET&&NET.host&&!aucMine();          /* hos melepaskan pembida terputus */
  if(!aucMine()&&!rescue)return;
  const v=+b.dataset.bid;
  actedTurn=true;try{v?aucBid(v):aucPass()}finally{actedTurn=null}});

/* --- tawaran --- */
document.getElementById('tradeWith').addEventListener('change',e=>{
  if(!draft)return;draft.to=+e.target.value;draft.want=[];renderTrade()});
document.getElementById('tradeBox').addEventListener('change',e=>{
  const c=e.target.closest('input[type="checkbox"]');if(!c||!draft)return;
  const kind=c.dataset.give!==undefined?'give':'want';
  const i=+(c.dataset.give??c.dataset.want);
  const arr=draft[kind],at=arr.indexOf(i);
  c.checked?(at<0&&arr.push(i)):(at>=0&&arr.splice(at,1));
  renderTrade()});
document.getElementById('tradeCash').addEventListener('input',e=>{
  if(!draft)return;draft.amt=Math.max(0,Math.round(+e.target.value||0));draft.cash=draft.dir*draft.amt;renderTrade()});
document.getElementById('tradeDir').addEventListener('click',e=>{const b=e.target.closest('[data-dir]');if(!b||!draft)return;
  draft.dir=+b.dataset.dir;if(!draft.amt&&draft.dir)draft.amt=50;draft.cash=draft.dir*(draft.amt||0);renderTrade();
  if(draft.dir)document.getElementById('tradeCash').focus({preventScroll:true})});
document.getElementById('tradeCashRow').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b||!draft)return;
  draft.amt=(draft.amt||0)+ +b.dataset.add;draft.cash=draft.dir*draft.amt;renderTrade()});
/* actedTurn memberitahu sync() yang penulis ini dibenarkan, walaupun
   bukan gilirannya — penerima tawaran perlu boleh menulis jawapannya. */
const asActor=fn=>(...a)=>{actedTurn=true;try{fn(...a)}finally{actedTurn=null}};
document.getElementById('tradeCancel').onclick=()=>{draft=null;
  document.getElementById('tradeBox').hidden=true;renderAll()};
document.getElementById('tradeSend').onclick=asActor(sendTrade);
document.getElementById('tradeUndo').onclick=asActor(cancelOffer);
document.getElementById('tradeYes').onclick=asActor(()=>tradeAnswer(true));
document.getElementById('tradeNo').onclick=asActor(()=>tradeAnswer(false));

document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||!S||!document.getElementById('setup').hidden)return;
  /* Escape untuk tetingkap diurus oleh pengurus modal di bawah. Selagi ada
     tetingkap terbuka, Space/Enter tidak boleh membaling dadu di belakangnya. */
  if(document.querySelector('.overlay:not([hidden])'))return;
  if(e.key===' '||e.key==='Enter'){if(e.target.closest('.sq,button')||!isActor())return;e.preventDefault();
    actedTurn=true;try{if(S.phase==='roll')rollDice();else if(S.phase==='end')endTurn()}finally{actedTurn=null}}});

function showSetupView(v){
  const home=v==='home';
  document.getElementById('setupHome').hidden=!home;
  document.getElementById('setupFull').hidden=home;
  if(!home)drawNames()}
function openSetup(view){clearBot();resetZoom();closeDeed();document.getElementById('endBox').hidden=true;fxClear();
  /* Jangan biarkan pengumuman permainan lama bercakap atas skrin persediaan. */
  hushVoice();pidsHide(0);
  const canResume=!!(S&&S.phase!=='over'&&!NET&&S.started);
  document.getElementById('btnResume').hidden=!canResume;
  document.getElementById('homeResume').hidden=!canResume;
  showSetupView(view||'home');
  document.getElementById('setup').hidden=false;drawNames();renderLobby()}
function quickToks(){const tk=fixToks([prefTok(),null]);S.players.forEach((p,i)=>p.tok=tk[i])}
document.getElementById('homePlay').onclick=()=>{
  if(NET)leaveRoom(true);
  newGame(['Anda','Bot Ain'],0,0,1500,[null,'sederhana'],true);S.maxRounds=PLAY_ROUNDS;quickToks();S.started=true;
  document.getElementById('setup').hidden=true;renderAll();track('mula-biasa','Main sekarang')};
document.getElementById('homeFast').onclick=()=>{
  if(NET)leaveRoom(true);
  newGame(['Anda','Bot Ain'],0,0,1500,[null,'sederhana'],true,true);quickToks();S.started=true;
  document.getElementById('setup').hidden=true;renderAll();toast('⚡ Mod cepat: stesen dibahagikan, tamat selepas '+S.fastRounds+' ronde.');track('mula-cepat','Main cepat')};
document.getElementById('homeFriends').onclick=()=>{showSetupView('full');setTab(FIREBASE_CONFIG?'online':'local')};
document.getElementById('homeMore').onclick=()=>{showSetupView('full');setTab('local')};
document.getElementById('homeBack').onclick=()=>showSetupView('home');
document.getElementById('homeResume').onclick=()=>{document.getElementById('setup').hidden=true;scheduleBot()};
/* Watak bagi setiap baris dalam borang satu peranti; baris pertama ikut pilihan tersimpan. */
let localToks=[],openTok=-1;
function rowTok(i){if(!isTok(localToks[i]))localToks[i]=i===0&&prefTok()||defTok(i);return localToks[i]}
function drawNames(){const n=+document.getElementById('nPlayers').value;const box=document.getElementById('names');
  const old=[...box.querySelectorAll('input')].map(x=>x.value);
  const ob=[...box.querySelectorAll('select')].map(x=>x.value);
  const opt=(v,b,txt)=>`<option value="${v}"${b===v?' selected':''}>${txt}</option>`;
  box.innerHTML=[...Array(n)].map((_,i)=>{const b=ob[i]??'';
    const t=rowTok(i),taken=new Set(localToks.slice(0,n).filter((x,j)=>j!==i&&x!=='tren'));
    return `<div class="nrow"><button type="button" class="tokbtn" data-row="${i}" aria-expanded="${openTok===i}" aria-label="Tukar watak pemain ${i+1} (${tokName(t)})" title="Tukar watak">${trainMark(i,null,'',t)}<span class="car" aria-hidden="true">▾</span></button><input id="pname${i}" aria-label="Nama pemain ${i+1}" maxlength="16" value="${esc(old[i]??DEFAULT_NAMES[i])}"><select id="pbot${i}" aria-label="Jenis pemain ${i+1}">${opt('',b,'Manusia')}${opt('mudah',b,'Bot mudah')}${opt('sederhana',b,'Bot sederhana')}</select>${openTok===i?`<div class="tokrow">${tokPicker(t,i,COLORS[i],taken,true)}</div>`:''}</div>`}).join('')}
document.getElementById('names').addEventListener('click',e=>{
  const b=e.target.closest('.tokbtn');
  if(b){const i=+b.dataset.row;openTok=openTok===i?-1:i;drawNames();return}
  const tp=e.target.closest('.tp');if(!tp||tp.disabled||openTok<0)return;
  localToks[openTok]=tp.dataset.tok;if(openTok===0)savePrefTok(tp.dataset.tok);
  openTok=-1;drawNames()});
function botName(i,lv){const inp=document.getElementById('pname'+i);if(!inp)return;
  const v=inp.value.trim();
  if(lv){if(!v||DEFAULT_NAMES.includes(v))inp.value=BOT_NAMES[i]}
  else if(BOT_NAMES.includes(v))inp.value=DEFAULT_NAMES[i]}
document.getElementById('names').addEventListener('change',e=>{const s=e.target.closest('select');
  if(s&&s.id.startsWith('pbot'))botName(+s.id.slice(4),s.value)});
document.getElementById('presets').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;
  const lv=b.dataset.p,n=+document.getElementById('nPlayers').value;
  for(let i=0;i<n;i++){const s=document.getElementById('pbot'+i);if(!s)continue;
    s.value=i===0?'':lv;botName(i,s.value)}});
document.getElementById('nPlayers').addEventListener('change',drawNames);
document.getElementById('setupForm').addEventListener('submit',e=>{e.preventDefault();
  const n=+document.getElementById('nPlayers').value;
  const names=[...Array(n)].map((_,i)=>(document.getElementById('pname'+i).value.trim()||`Pemain ${i+1}`));
  const bots=[...Array(n)].map((_,i)=>document.getElementById('pbot'+i).value||null);
  if(NET)leaveRoom();
  const endV=document.getElementById('nEnd').value,endR=/^r\d+$/.test(endV)?+endV.slice(1):0;
  newGame(names,+document.getElementById('nQual').value,endR?0:+endV,
    +document.getElementById('nCash').value,bots,document.getElementById('nAuc').value==='1',
    document.getElementById('nMode').value==='1');
  const tk=fixToks([...Array(n)].map((_,i)=>rowTok(i)));S.players.forEach((p,i)=>p.tok=tk[i]);
  if(endR&&!S.fast)S.maxRounds=endR;
  S.started=true;openTok=-1;track('mula-satu-peranti',`Satu peranti · ${n} pemain`);
  document.getElementById('setup').hidden=true;renderAll()});
document.getElementById('btnResume').onclick=()=>{document.getElementById('setup').hidden=true;scheduleBot()};
document.getElementById('btnNew').onclick=()=>openSetup();
document.getElementById('btnFinish').onclick=()=>{if(NET&&!NET.host){toast('Hanya hos boleh menamatkan permainan.');return}if(S&&S.phase!=='over'&&!busy&&confirm('Tamatkan permainan dan kira pemenang sekarang?')){if(NET)NET.override=S.turn;actedTurn=true;try{finish()}finally{actedTurn=null}}};
document.getElementById('btnAgain').onclick=()=>{if(NET){document.getElementById('endBox').hidden=true;if(NET.host)restartOnline();return}openSetup()};
document.getElementById('btnRules').onclick=()=>document.getElementById('rulesBox').hidden=false;
/* Menu ⚙️ (telefon): buka/tutup, tutup bila ketik di luar atau pilih tindakan besar. */
(()=>{const bar=document.querySelector('.bar'),mb=document.getElementById('btnMenu');
  const set=o=>{bar.classList.toggle('open',o);mb.setAttribute('aria-expanded',o?'true':'false')};
  mb.onclick=e=>{e.stopPropagation();set(!bar.classList.contains('open'))};
  document.addEventListener('click',e=>{if(bar.classList.contains('open')&&!e.target.closest('#barMenu'))set(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false)});
  ['btnRules','btnFinish','btnNew'].forEach(id=>document.getElementById(id).addEventListener('click',()=>set(false)));
})();
document.getElementById('btnRulesClose').onclick=()=>document.getElementById('rulesBox').hidden=true;
/* Tema: Auto mengikut tetapan peranti, atau paksa Terang/Gelap. CSS sudah
   menyokong [data-theme] sejak awal — ini cuma memberinya suis. */
/* Songket ialah tema gelap berhias: ia memakai data-theme="dark" (semua gaya
   gelap terpakai) dan data-skin="songket" untuk warna emas-merah hati. */
const THEMES=['auto','light','dark','songket'],THEME_LABEL={auto:'Auto',light:'Terang',dark:'Gelap',songket:'Songket'};
let theme='auto';
const darkNow=()=>theme==='dark'||theme==='songket'||(theme==='auto'&&matchMedia('(prefers-color-scheme:dark)').matches);
/* Langit ikut jam tempatan: subuh, siang, senja, malam. Setiap fasa ada
   palet cerah dan gelap, supaya teks di tengah papan kekal mudah dibaca
   dalam kedua-dua tema. Hanya pemboleh ubah langit ditukar. */
const SKY={
 light:{
  dawn:['#FBE6CF','#F4B8A0','#FFB36B','rgba(255,160,90,.38)','#DCD1D8','#BFB2C0','#A094AA','#91859C','#FFFFFF',.3,.12,'#8A7F95',26],
  day:['#F3EFE3','#BFDDEE','#FFD27A','rgba(255,196,90,.35)','#C9D6DE','#A8BBC7','#8BA1B0','#7A92A3','#FFFFFF',.35,0,'#6F8595',0],
  dusk:['#FFD9B3','#EE8E6E','#FF8A4C','rgba(255,120,60,.38)','#D2BCC3','#AE97AA','#8A7690','#7E6A88','#FFD27A',.75,.18,'#6E5E7A',30],
  night:['#CDD3E8','#5D6D9C','#F4F1DE','rgba(244,241,222,.35)','#949DBA','#76809F','#5A6385','#535C7E','#FFD27A',.9,.9,'#4B5474',0]},
 dark:{
  dawn:['#3B2F4B','#8C5B6C','#FFB36B','rgba(255,160,90,.25)','#302B42','#27233B','#1D1A2E','#352F4A','#FFD27A',.5,.35,'#2B2640',26],
  day:['#1F3A55','#2F6B93','#FFD27A','rgba(255,196,90,.22)','#2A4258','#233A50','#1A2E40','#2D4861','#9FC3DD',.25,0,'#2E4A62',0],
  dusk:['#4A2F3F','#B35A40','#FF8A4C','rgba(255,120,60,.28)','#36263B','#2B1F31','#1F1625','#3B2B42','#FFD27A',.8,.3,'#33243A',30],
  night:['#1A2C44','#07111D','#F4F1DE','rgba(244,241,222,.18)','#1C2C3D','#16283A','#0F1C28','#243A50','#FFD27A',.85,.9,'#2E4254',0]},
 /* Songket: langit merah hati dan bangunan gelap dengan tingkap emas. */
 songket:{
  dawn:['#4A1A2A','#9A4A3A','#F2C35B','rgba(242,195,91,.28)','#3A1522','#2E101B','#220B14','#44192A','#F2C35B',.6,.3,'#3A1522',26],
  day:['#5C1E31','#A0523C','#F2C35B','rgba(242,195,91,.3)','#43182A','#361322','#290E1A','#4E1C30','#F2C35B',.45,0,'#43182A',0],
  dusk:['#5A1A2C','#C0623A','#FF9A4C','rgba(255,150,70,.3)','#3F1626','#32111E','#250C16','#48192C','#F2C35B',.8,.3,'#3F1626',30],
  night:['#3A0F1E','#12050A','#F4E3B0','rgba(244,227,176,.2)','#2E0E1A','#240B15','#1A0710','#3A1424','#F2C35B',.9,.9,'#2E0E1A',0]}};
const SKY_VARS=['--sky-a','--sky-b','--orb','--orb-glow','--bld-back','--bld-mid','--bld-front','--landmark','--win','--win-op','--star-op','--track'];
function skyPhase(d){const m=d.getHours()*60+d.getMinutes();
  /* Matahari KL terbit ±7:10 dan terbenam ±19:20 sepanjang tahun. */
  return m>=375&&m<465?'dawn':m>=465&&m<1125?'day':m>=1125&&m<1200?'dusk':'night'}
function applySky(){
  const r=document.documentElement,ph=skyPhase(new Date()),pal=SKY[theme==='songket'?'songket':darkNow()?'dark':'light'][ph];
  SKY_VARS.forEach((v,k)=>r.style.setProperty(v,String(pal[k])));
  r.style.setProperty('--orb-y',pal[12]+'px');r.dataset.sky=ph}
setInterval(applySky,60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')applySky()});
function applyTheme(){
  const r=document.documentElement;
  theme==='auto'?r.removeAttribute('data-theme'):r.setAttribute('data-theme',theme==='songket'?'dark':theme);
  theme==='songket'?r.setAttribute('data-skin','songket'):r.removeAttribute('data-skin');
  const btn=document.getElementById('btnTheme');
  if(btn)btn.textContent='Tema: '+THEME_LABEL[theme];
  /* Warna bar pelayar pada telefon mesti ikut tema yang dipaksa, bukan tetapan sistem. */
  const m=document.getElementById('metaTheme');
  if(m)m.setAttribute('content',theme==='songket'?'#14060B':darkNow()?'#0A1016':'#E3E9EC');
  applySky();
}
function setSoundLabel(){const b=document.getElementById('btnSound');
  if(b)b.textContent='Bunyi: '+(sound?'Hidup':'Senyap')}
function setVoiceLabel(){const b=document.getElementById('btnVoice');
  if(!b)return;
  b.textContent='Suara: '+(voiceOn?'Hidup':'Senyap');
  /* Pengumuman bersuara bergantung pada bunyi; nyatakan sebabnya apabila
     butang ini kelihatan tidak memberi kesan. */
  b.disabled=!sound;
  b.title=sound?'Pengumuman stesen bersuara':'Hidupkan Bunyi dahulu';
}
function setGayaLabel(){const b=document.getElementById('btnGaya');if(!b)return;
  b.textContent='Gaya: '+gy().nama;b.disabled=!sound||!voiceOn;
  b.title=b.disabled?'Hidupkan Bunyi dan Suara dahulu':'Tukar gaya suara pengumuman'}
function loadPrefs(){
  try{const t=localStorage.getItem('mtkl-theme');if(THEMES.includes(t))theme=t}catch(e){}
  try{sound=localStorage.getItem('mtkl-sound')!=='0'}catch(e){}
  try{voiceOn=localStorage.getItem('mtkl-voice')!=='0'}catch(e){}
  try{haptic=localStorage.getItem('mtkl-haptic')!=='0'}catch(e){}
  try{view3d=localStorage.getItem('mtkl-view')==='3d'}catch(e){}
  applyTheme();setSoundLabel();setVoiceLabel();setGayaLabel();setHapticLabel();
}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(theme==='auto')applyTheme()});
document.getElementById('btnTheme').onclick=()=>{
  theme=THEMES[(THEMES.indexOf(theme)+1)%THEMES.length];
  try{localStorage.setItem('mtkl-theme',theme)}catch(e){}
  track('tema-'+theme,'Tema: '+THEME_LABEL[theme]);
  applyTheme()};
/* Suis getaran hanya muncul pada peranti yang benar-benar boleh bergetar. */
/* ---------- pandangan 3D ----------
   Papan dicondongkan ke belakang seperti papan sebenar atas meja, dan langit
   KL berdiri sebagai latar di hujung papan. Semuanya CSS 3D; logik permainan
   dan klik tidak berubah (lompatan token dikira dalam koordinat papan, jadi
   ia ikut condong secara automatik). Zum dimatikan dalam 3D. */
let view3d=false;
function applyView(){
  const on=view3d&&!matchMedia(PHONE_Q).matches;
  document.body.classList.toggle('v3d',on);
  const b=document.getElementById('btnView');if(b)b.textContent='Pandangan: '+(view3d?'3D':'2D');
  const bd=document.getElementById('bdrop');if(bd&&on&&!bd.firstChild)bd.innerHTML=skylineSVG('skyd');
  if(on){const r=document.querySelector('#zoomctl [data-z="reset"]');if(r&&!r.disabled)r.click()}
  if(typeof queueTurnDock==='function')queueTurnDock()}
document.getElementById('btnView').onclick=()=>{view3d=!view3d;
  try{localStorage.setItem('mtkl-view',view3d?'3d':'2d')}catch(e){}applyView()};
matchMedia(PHONE_Q).addEventListener('change',applyView);
function setHapticLabel(){const b=document.getElementById('btnHaptic');if(!b)return;
  b.hidden=!('vibrate'in navigator)||!matchMedia('(pointer:coarse)').matches;
  b.textContent='Getaran: '+(haptic?'Hidup':'Senyap')}
document.getElementById('btnHaptic').onclick=()=>{haptic=!haptic;
  try{localStorage.setItem('mtkl-haptic',haptic?'1':'0')}catch(e){}
  setHapticLabel();if(haptic)vib(40)};
document.getElementById('btnSound').onclick=()=>{sound=!sound;
  try{localStorage.setItem('mtkl-sound',sound?'1':'0')}catch(e){}
  if(!sound)hushVoice();
  setSoundLabel();setVoiceLabel();setGayaLabel()};
document.getElementById('btnVoice').onclick=()=>{voiceOn=!voiceOn;
  try{localStorage.setItem('mtkl-voice',voiceOn?'1':'0')}catch(e){}
  if(!voiceOn)hushVoice();else{primeVoice();speak(line('hidup'),true)}
  setVoiceLabel();setGayaLabel()};
/* Tukar gaya terus memperdengarkan contoh supaya pemain dengar bezanya. */
document.getElementById('btnGaya').onclick=()=>{
  gaya=GAYA_URUT[(GAYA_URUT.indexOf(gaya)+1)%GAYA_URUT.length];
  try{localStorage.setItem('mtkl-gaya2',gaya)}catch(e){}
  setGayaLabel();if(sound&&voiceOn){primeVoice();speak(line('hidup'),true)}};

/* ---------- enjin partikel ----------
   Satu gelung dan satu kanvas untuk semua kesan. Dua gelung berasingan akan
   saling memadam kerana setiap satu membersihkan kanvas pada setiap bingkai. */
const FX={p:[],raf:0,dpr:1,w:0,h:0,ctx:null,cap:460};
function fxSize(){
  const c=document.getElementById('fx');if(!c)return null;
  FX.dpr=Math.min(devicePixelRatio||1,2);FX.w=innerWidth;FX.h=innerHeight;
  c.width=Math.round(FX.w*FX.dpr);c.height=Math.round(FX.h*FX.dpr);
  FX.ctx=c.getContext('2d');FX.ctx.setTransform(FX.dpr,0,0,FX.dpr,0,0);
  return FX.ctx}
function fxClear(){FX.p.length=0;
  if(FX.raf){cancelAnimationFrame(FX.raf);FX.raf=0}
  const c=document.getElementById('fx');
  if(c){if(FX.ctx)FX.ctx.clearRect(0,0,FX.w,FX.h);c.hidden=true}}
/* Had bilangan supaya telefon lama tidak tersekat kalau kesan bertindih. */
function fxAdd(q){if(FX.p.length+q.length>FX.cap)FX.p.splice(0,FX.p.length+q.length-FX.cap);
  FX.p.push(...q);fxStart()}
/* Kedudukan petak dalam koordinat skrin — getBoundingClientRect mengambil kira
   zum dan geseran papan, jadi partikel sentiasa jatuh di tempat yang betul. */
function fxAt(i){const el=document.getElementById('sq'+i);if(!el)return null;
  const r=el.getBoundingClientRect();
  if(r.width<1||r.bottom<0||r.top>innerHeight)return null;
  return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height}}
/* Kepulan asap dilukis daripada sprite kecerunan yang disimpan, bukan
   kecerunan baharu setiap bingkai. */
function fxPuff(dark){const k=dark?'puffD':'puffL';if(FX[k])return FX[k];
  const s=document.createElement('canvas');s.width=s.height=64;
  const cx=s.getContext('2d'),g=cx.createRadialGradient(32,32,0,32,32,32),
        base=dark?'226,234,240':'34,46,56';
  g.addColorStop(0,`rgba(${base},.8)`);g.addColorStop(.45,`rgba(${base},.34)`);
  g.addColorStop(1,`rgba(${base},0)`);
  cx.fillStyle=g;cx.fillRect(0,0,64,64);FX[k]=s;return s}
const fxFade=p=>Math.max(0,Math.min(1,p.life/(p.max*.45)));
function fxStart(){
  if(FX.raf||!FX.p.length)return;
  const c=document.getElementById('fx');if(!c)return;
  c.hidden=false;let x=fxSize()||c.getContext('2d');let last=performance.now();
  const tick=now=>{
    const dt=Math.min(50,now-last)/16.67;last=now;
    if(innerWidth!==FX.w||innerHeight!==FX.h)x=fxSize()||x;
    x.clearRect(0,0,FX.w,FX.h);
    for(const p of FX.p){
      if(p.d>0){p.d-=dt;continue}
      fxStep(x,p,dt);
      if(p.y>FX.h+60)p.life=0;
    }
    FX.p=FX.p.filter(p=>p.life>0);
    if(FX.p.length)FX.raf=requestAnimationFrame(tick);
    else{FX.raf=0;x.clearRect(0,0,FX.w,FX.h);c.hidden=true}};
  FX.raf=requestAnimationFrame(tick)}
function fxStep(x,p,dt){
  p.life-=dt;const a=fxFade(p);
  if(p.k==='coin'){
    p.vy+=.23*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    x.save();x.globalAlpha=a;x.translate(p.x,p.y);
    x.scale(Math.abs(Math.cos(p.rot))*.88+.12,1);      /* syiling berpusing */
    x.fillStyle=p.c;x.beginPath();x.arc(0,0,p.r,0,6.2832);x.fill();
    x.fillStyle='rgba(255,255,255,.6)';x.beginPath();
    x.arc(-p.r*.3,-p.r*.32,p.r*.3,0,6.2832);x.fill();x.restore();return}
  if(p.k==='spark'){
    p.vy+=.06*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    const r=p.r*(.4+a*.9);
    x.save();x.globalAlpha=a;x.translate(p.x,p.y);x.rotate(p.rot);
    x.fillStyle=p.c;x.beginPath();
    x.moveTo(0,-r);x.quadraticCurveTo(r*.2,-r*.2,r,0);
    x.quadraticCurveTo(r*.2,r*.2,0,r);x.quadraticCurveTo(-r*.2,r*.2,-r,0);
    x.quadraticCurveTo(-r*.2,-r*.2,0,-r);x.fill();x.restore();return}
  if(p.k==='smoke'){
    p.x+=p.vx*dt;p.y-=p.rise*dt;p.r+=p.gr*dt;p.rise*=Math.pow(.985,dt);
    x.save();x.globalAlpha=a*.62;
    x.drawImage(p.img,p.x-p.r,p.y-p.r,p.r*2,p.r*2);x.restore();return}
  if(p.k==='bolt'){
    x.save();x.globalAlpha=Math.min(1,p.life/p.max);
    x.strokeStyle='#EAF6FF';x.lineWidth=p.lw;x.lineJoin='round';x.lineCap='round';
    x.shadowColor='#6FC9FF';x.shadowBlur=14;
    x.beginPath();p.pts.forEach((q,j)=>j?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1]));
    x.stroke();x.restore();return}
  if(p.k==='flash'){
    p.r+=p.gr*dt;
    const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r);
    g.addColorStop(0,`rgba(233,246,255,${.55*a})`);
    g.addColorStop(.5,`rgba(120,200,255,${.22*a})`);
    g.addColorStop(1,'rgba(120,200,255,0)');
    x.save();x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,p.r,0,6.2832);x.fill();x.restore();return}
  /* confetti */
  if(p.g)p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=.1*dt;
  x.save();x.globalAlpha=a;x.translate(p.x,p.y);x.rotate(p.rot);
  x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/4,p.s,p.s/2);x.restore()}

/* Emas: lalu MULA dan terima duit. */
const FX_GOLD=['#FFD24A','#F7B500','#FFE9A3','#E8B400','#FFF3C4'];
function fxMoney(i,big){
  if(RM)return;const a=fxAt(i);if(!a)return;
  const q=[],nc=big?26:16,ns=big?12:7;
  for(let k=0;k<nc;k++){const ang=-Math.PI/2+(Math.random()-.5)*2.2,sp=2.2+Math.random()*(big?4.6:3.4);
    q.push({k:'coin',x:a.x+(Math.random()-.5)*a.w*.55,y:a.y+(Math.random()-.5)*a.h*.3,
      vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp-1.1,r:2.4+Math.random()*3.2,
      rot:Math.random()*6.28,vr:.16+Math.random()*.3,d:Math.random()*4,
      c:FX_GOLD[k%FX_GOLD.length],life:46+Math.random()*30,max:76})}
  for(let k=0;k<ns;k++)
    q.push({k:'spark',x:a.x+(Math.random()-.5)*a.w*.9,y:a.y+(Math.random()-.5)*a.h*.6,
      vx:(Math.random()-.5)*2.4,vy:-.7-Math.random()*1.6,r:3+Math.random()*4.5,
      rot:Math.random()*6.28,vr:(Math.random()-.5)*.24,d:Math.random()*10,
      c:'#FFF0B8',life:26+Math.random()*20,max:46});
  fxAdd(q)}
/* Kilat dan asap: masuk Lokap. */
function fxJail(){
  if(RM)return;const a=fxAt(10);if(!a)return;
  const q=[],top=a.y-Math.max(130,a.h*2.4),dark=darkNow(),img=fxPuff(dark);
  for(let b=0;b<2;b++){
    const pts=[],x0=a.x+(b?22:-18),steps=6;
    for(let j=0;j<=steps;j++){const t=j/steps;
      pts.push([x0+(Math.random()-.5)*30*(1-t*.5),top+(a.y-top)*t])}
    pts[steps]=[a.x+(Math.random()-.5)*a.w*.3,a.y];
    q.push({k:'bolt',pts,lw:b?2:3.2,d:b*2,life:10+b*3,max:13})}
  q.push({k:'flash',x:a.x,y:a.y,r:a.w*.35,gr:a.w*.14,d:1,life:14,max:14});
  for(let k=0;k<24;k++)
    q.push({k:'smoke',img,x:a.x+(Math.random()-.5)*a.w*.85,y:a.y+(Math.random()*.4)*a.h,
      vx:(Math.random()-.5)*1,rise:.45+Math.random()*.95,
      r:a.w*(.1+Math.random()*.15),gr:a.w*.013,
      d:4+Math.random()*10,life:44+Math.random()*36,max:84});
  fxAdd(q)}
/* Sambutan set penuh: letupan konfeti warna laluan dari setiap petak. */
function fxLine(i,col,delay){
  if(RM)return;setTimeout(()=>{const a=fxAt(i);if(!a)return;const q=[];
    for(let k=0;k<28;k++){const ang=-Math.PI/2+(Math.random()-.5)*2.4,sp=2.5+Math.random()*4;
      q.push({k:'conf',x:a.x,y:a.y,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,g:.14,rot:Math.random()*6.28,
        s:4+Math.random()*5,c:k%3?col:'#FFFFFF',life:70+Math.random()*30,max:100})}
    fxAdd(q)},delay||0)}
function confetti(){if(RM)return;const cols=GROUPS.map(g=>g.c),q=[];
  for(let k=0;k<150;k++)
    q.push({k:'conf',x:Math.random()*innerWidth,y:-Math.random()*innerHeight*.7,
      vx:(Math.random()-.5)*2.2,vy:2+Math.random()*3,rot:Math.random()*6.28,
      s:5+Math.random()*6,c:cols[Math.floor(Math.random()*cols.length)],
      life:330,max:330});
  fxAdd(q)}
