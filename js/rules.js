/* Metro Tycoon KL — rules.js
   Peraturan: wang, pemilikan, berita, pergerakan, giliran, lelongan dan tawaran.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- money ---------- */
function toastAll(t){S.toast={id:Date.now()+Math.random(),t};toast(t)}
function toast(t){const el=document.createElement('div');el.className='toast';el.textContent=t;
  el.style.setProperty('--ti',Math.min(2,document.querySelectorAll('.toast').length));
  /* Jangan bertindih dengan popup "Misi selesai" yang juga di atas skrin. */
  const ap=document.querySelector('.achpop');if(ap)el.style.setProperty('--tt',Math.round(ap.getBoundingClientRect().bottom+6)+'px');
  document.body.appendChild(el);setTimeout(()=>el.remove(),t.length>60?3400:2400)}
function receive(p,a){p.cash+=a;addLog(`${p.name} terima ${fmt(a)}.`);S.msg=`${p.name} terima ${fmt(a)}.`;sfx.coin();fxMoney(p.pos,a>=150)}
/* Pusingan pertama (sebelum lalu MULA kali pertama): tiada bayaran, tiada Lokap. */
const lapOne=p=>!!p&&p.laps===0&&!(S&&S.fast);
function freeLap(p,what){const t=`Pusingan pertama: ${p.name} ${what}.`;S.msg=t;addLog(t);toastAll(t)}
function pay(p,a,to=null){
  if(lapOne(p)){freeLap(p,`tak perlu bayar ${fmt(a)}`);return}
  p.cash-=a; if(to!==null){S.players[to].cash+=a}
  if(p.cash<0)p.creditor=to;
  const t=`${p.name} bayar ${fmt(a)}${to!==null?' kepada '+S.players[to].name:''}.`;addLog(t,'sewa');S.msg=t;sfx.pay();
}
function eachOther(p,amt){
  if(amt<0&&lapOne(p)){freeLap(p,'tak perlu bayar apa-apa');return}
  S.players.forEach((o,i)=>{if(o===p||o.bankrupt||(amt>0&&lapOne(o)))return;
    if(amt<0){pay(p,-amt,i)}
    else{const g=Math.max(0,Math.min(amt,o.cash));o.cash-=g;p.cash+=g}});
  if(amt>0){addLog(`${p.name} kutip ${fmt(amt)} daripada setiap pemain.`);S.msg=`${p.name} kutip ${fmt(amt)} daripada setiap pemain.`;sfx.coin()}
}
/* Semua pemain yang masih bermain terima wang daripada bank. */
function allGet(p,amt){S.players.forEach(o=>{if(!o.bankrupt)o.cash+=amt});
  const t=`Semua pemain terima ${fmt(amt)}.`;addLog(t);S.msg=t;sfx.coin();fxMoney(p.pos,true)}
/* Terlepas giliran seterusnya. Dadu ganda juga terbatal. */
function skipTurn(p){p.skip=(p.skip||0)+1;stt(S.players.indexOf(p)).rosak++;S.again=false;S.doubles=0;
  const t=`${p.name} akan terlepas giliran seterusnya.`;addLog(t);S.msg=t}
function repairs(p,h,ht){if(lapOne(p)){freeLap(p,'tak perlu bayar apa-apa');return}let c=0;S.owner.forEach((o,i)=>{if(o===S.players.indexOf(p)){const n=S.houses[i];c+=n===5?ht:n*h}});
  if(c>0)pay(p,c);else{S.msg=`${p.name} tiada bangunan. Tiada bayaran.`;addLog(S.msg)}}
function netWorth(p){const pi=S.players.indexOf(p);let w=p.cash-(p.along||0);
  S.owner.forEach((o,i)=>{if(o!==pi)return;const s=SQ[i];w+=S.mort[i]?s.p/2:s.p;if(s.t==='prop')w+=S.houses[i]*GROUPS[s.g].h});return w}

/* ---------- ownership ---------- */
const groupIdx=g=>SQ.map((s,i)=>s.g===g&&s.t==='prop'?i:-1).filter(i=>i>=0);
const hasSet=(pi,g)=>groupIdx(g).every(i=>S.owner[i]===pi);
/* ---------- berita: acara rawak setiap pusingan ----------
   Satu pusingan = semua pemain mendapat satu giliran. Pada permulaan setiap
   pusingan baharu, satu berita mungkin berlaku dan kekal sepanjang pusingan
   itu. Hanya nombor indeks (S.event.k) disimpan, jadi keadaan kekal kecil.
   gm = pengganda sewa ikut laluan (indeks GROUPS); 0 = laluan ditutup. */
const EVENTS=[
 {t:'Waktu puncak! Sewa semua stesen MRT naik 50%.',gm:{6:1.5,7:1.5}},
 {t:'Laluan Kelana Jaya ditutup untuk penyelenggaraan. Tiada sewa di laluan itu.',gm:{4:0}},
 {t:'Promosi tambang! Lalu MULA dapat RM300.',go:300},
 {t:'Konsert besar di Stadium Bukit Jalil! Sewa LRT Sri Petaling naik 2×.',gm:{2:2}},
 {t:'Banjir kilat! KTM Komuter tergendala. Tiada sewa di laluan itu.',gm:{1:0}},
 {t:'Musim cuti: pelancong serbu KLIA. Sewa ERL naik 2×.',gm:{5:2}},
 {t:'Hari Tanpa Kereta di KL! Semua hab sesak — sewa hab 2×.',hub:2},
 {t:'Pengecualian cukai! Tiada Cukai Hasil atau Cukai Mewah pusingan ini.',notax:true},
 {t:'Promosi bahan binaan! Rumah dan hotel separuh harga.',build:.5},
 {t:'Monorel rosak lagi. Laluan Monorel ditutup — tiada sewa.',gm:{0:0}},
 {t:'Pesta Tanglung di Ampang. Sewa LRT Ampang naik 50%.',gm:{3:1.5}},
 {t:'Gelombang haba! Semua orang pasang aircond — sewa utiliti 2×.',util:2},
 {t:'Hujan lebat di pusat KL! Penumpang beralih ke Monorel — sewa Monorel naik 50%.',gm:{0:1.5}},
 {t:'Waktu puncak petang di KL Sentral! Sewa semua hab naik 50%.',hub:1.5},
 {t:'Acara besar di KLCC! Sewa MRT Kajang dan Putrajaya naik 50%.',gm:{6:1.5,7:1.5}},
 {t:'Gangguan transit di laluan Sri Petaling! Tiada sewa LRT Sri Petaling pusingan ini.',gm:{2:0}},
 {t:'Hujan lebat dan jalan sesak! Lebih ramai menaiki LRT Kelana Jaya — sewa naik 50%.',gm:{4:1.5}},
 {t:'Festival di sekitar Bukit Bintang! Sewa Monorel naik 2×.',gm:{0:2}}];
const ev=()=>S&&S.event&&EVENTS[S.event.k]||null;
const evMul=g=>{const e=ev();return e&&e.gm&&e.gm[g]!=null?e.gm[g]:1};
const goBonus=()=>{const e=ev();return e&&e.go||200};
function newRound(){
  S.round=(S.round||1)+1;
  const had=S.event;
  if(Math.random()<.75){
    let k;do{k=Math.floor(Math.random()*EVENTS.length)}while(had&&k===had.k&&EVENTS.length>1);
    S.event={k,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
    addLog(`📰 Berita pusingan ${S.round}: ${EVENTS[k].t}`);
  }else{
    S.event=null;
    if(had)addLog(`📰 Pusingan ${S.round}: semua perkhidmatan kembali seperti biasa.`);
  }
}
function rentOf(i,opts={}){
  const s=SQ[i],o=S.owner[i];if(o===null||S.mort[i])return 0;
  const e=ev();
  if(s.t==='prop'){const h=S.houses[i];return Math.round((h?s.r[h]:s.r[0]*(hasSet(o,s.g)?2:1))*evMul(s.g))}
  if(s.t==='hub'){const n=HUBS.filter(j=>S.owner[j]===o).length;return Math.round(25*2**(n-1)*(opts.mult||1)*(e&&e.hub||1))}
  if(s.t==='util'){const d=opts.roll||(S.dice[0]+S.dice[1]);const n=UTILS.filter(j=>S.owner[j]===o).length;return d*(opts.util10?10:(n===2?10:4))*(e&&e.util||1)}
  return 0}
/* Boleh bina di mana-mana stesen sendiri — set penuh tidak diperlukan. */
/* Tanpa set penuh: maks. 2 rumah, harga dua kali ganda, tiada hotel.
   Semua pembinaan hanya selepas pemain lengkap pusingan pertama. */
const NOSET_MAX=2;
function houseCost(i){const s=SQ[i],o=S.owner[i],e=ev();
  return Math.round(GROUPS[s.g].h*(o!==null&&hasSet(o,s.g)?1:2)*(e&&e.build||1))}
function buildLimit(i){const o=S.owner[i];return o!==null&&hasSet(o,SQ[i].g)?5:NOSET_MAX}
function canBuild(i){const s=SQ[i],pi=S.turn,p=cur();if(s.t!=='prop'||S.owner[i]!==pi||S.mort[i])return false;
  if(p.laps<1&&!S.fast)return false;
  return S.houses[i]<buildLimit(i)&&p.cash>=houseCost(i)}
function canSell(i){const s=SQ[i];return s.t==='prop'&&S.owner[i]===S.turn&&S.houses[i]>0}
function canMort(i){const s=SQ[i];if(S.owner[i]!==S.turn||S.mort[i])return false;
  return s.t!=='prop'||!S.houses[i]}
const unmortCost=i=>Math.ceil(SQ[i].p/2*1.1);
function canUnmort(i){return S.owner[i]===S.turn&&S.mort[i]&&cur().cash>=unmortCost(i)}

/* ---------- movement ---------- */
const nextOf=(pos,arr)=>arr.find(j=>j>pos)??arr[0];
/* Satu lompatan sedikit lebih pendek daripada jeda langkah, supaya token
   sudah mendarat sebelum render seterusnya membina semula petak. */
const STEP_MS=155, HOP_MS=140, PHONE_BOARD=matchMedia(PHONE_Q);
async function walk(p,steps){
  const k0=S.players.indexOf(p);
  if(steps>0)sayNext((p.pos+steps)%40);
  for(let k=0;k<steps;k++){const from=p.pos;p.pos=(p.pos+1)%40;
    if(k===steps-1)sayArrive(p.pos);
    if(p.pos===0){const gb=goBonus();p.cash+=gb;p.laps++;stt(k0).mula++;addLog(`${p.name} lalu MULA, kutip ${fmt(gb)} (pusingan ${p.laps}).`);sfx.coin();fxMoney(0,true);
      if(S.qual&&p.laps===S.qual){toastAll(`${p.name} lengkap ${S.qual} pusingan — kini boleh membeli hartanah!`);addLog(`${p.name} kini layak membeli hartanah.`)}
      alongTagih(p)}
    sfx.step();renderBoard();renderSide();hop(k0,from,p.pos,k===steps-1);sync();await sleep(STEP_MS)}
}
async function walkBack(p,steps){const k0=S.players.indexOf(p);
  if(steps>0)sayNext((p.pos-steps+40)%40);
  for(let k=0;k<steps;k++){const from=p.pos;p.pos=(p.pos+39)%40;
    if(k===steps-1)sayArrive(p.pos);
    sfx.step();renderBoard();hop(k0,from,p.pos,k===steps-1);sync();await sleep(STEP_MS)}}
/* Token melompat dari petak ke petak pada lapisan .flyer. Token sebenar di
   destinasi disembunyikan sepanjang penerbangan, kemudian mendarat dengan
   hentakan kecil. */
function hop(k,from,to,last){
  if(RM||from===to)return;
  const fl=document.getElementById('flyer'),ref=document.getElementById('sq1');
  if(!fl||!ref||!S.players[k])return;
  /* Sasaran lompatan = tepi luar petak, tempat token kini duduk. */
  const at=i=>{const el=document.getElementById('sq'+i);if(!el)return null;
    const W=el.offsetWidth,H=el.offsetHeight,sd=el.classList;
    /* Telefon: token duduk di luar tepi dalam petak. */
    if(PHONE_BOARD.matches&&!sd.contains('corner'))
      return sd.contains('left')?{x:el.offsetLeft+W+7,y:el.offsetTop+H/2}
        :sd.contains('right')?{x:el.offsetLeft-7,y:el.offsetTop+H/2}
        :sd.contains('top')?{x:el.offsetLeft+W/2,y:el.offsetTop+H+6}
        :{x:el.offsetLeft+W/2,y:el.offsetTop-6};
    const fx=sd.contains('left')?.14:sd.contains('right')?.86:.5,fy=sd.contains('top')?.16:sd.contains('left')||sd.contains('right')?.5:.84;
    return{x:el.offsetLeft+W*fx,y:el.offsetTop+H*fy}};
  const a=at(from),b=at(to);if(!a||!b)return;
  const w=ref.offsetWidth*0.46,h=w;
  const real=()=>document.querySelector(`#sq${to} .tok[data-k="${k}"]`);
  const r0=real();if(r0)r0.classList.add('ghost');
  const sp=document.createElement('span');
  sp.className='fly';
  sp.style.cssText=`width:${w}px;height:${h}px;color:${S.players[k].color}`;
  sp.innerHTML=trainSVG(k);
  const svg=sp.firstChild;
  if(svg&&svg.style&&to<=19)svg.style.transform='scaleX(-1)';
  fl.appendChild(sp);
  const ox=-w/2,oy=-h/2, lift=Math.min(ref.offsetHeight*0.55,30);
  const at3=(x,y,sc)=>`translate(${x+ox}px,${y+oy}px) scale(${sc})`;
  const anim=sp.animate([
    {transform:at3(a.x,a.y,1),offset:0},
    {transform:at3((a.x+b.x)/2,(a.y+b.y)/2-lift,1.16),offset:.5},
    {transform:at3(b.x,b.y,1),offset:1}
  ],{duration:last?HOP_MS+70:HOP_MS,easing:'cubic-bezier(.33,.7,.4,1)'});
  const done=()=>{sp.remove();const r=real();
    if(r){r.classList.remove('ghost');r.classList.add('land')}};
  anim.onfinish=done;anim.oncancel=done;
}
async function advanceTo(p,target,opts){await walk(p,(target-p.pos+40)%40);await land(p,opts)}
function goJail(p){if(lapOne(p)){S.doubles=0;freeLap(p,'terlepas daripada Lokap');return false}
  p.pos=10;p.inJail=true;p.jailTurns=0;S.again=false;S.doubles=0;stt(S.players.indexOf(p)).lokap++;
  S.msg=`${p.name} dihantar ke Lokap!`;addLog(S.msg,'lokap');sfx.jail();fxJail();
  /* Direkod dalam keadaan supaya setiap peranti dalam bilik online turut ketawa. */
  S.lol={pi:S.players.indexOf(p),id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
  /* Bukan perhentian biasa: nada amaran, bukan gong stesen. */
  pidsShow('Perhatian','Ditahan — Lokap');pidsHide(2800);
  speak(line('jail',p.name),true)}

async function land(p,opts={}){
  const i=p.pos,s=SQ[i],pi=S.players.indexOf(p);
  if(buyable(i)){
    const o=S.owner[i];
    if(o===null&&p.laps<S.qual){const k=S.qual-p.laps;S.msg=`${s.n} belum dimiliki, tetapi ${p.name} perlu lengkapkan ${k} pusingan lagi sebelum boleh membeli.`;return}
    if(o===null){S.phase='buy';S.msg=`${s.n} belum dimiliki. Beli dengan ${fmt(s.p)}?`;return}
    if(o===pi){S.msg=`${p.name} singgah di hartanah sendiri.`;return}
    if(S.mort[i]){S.msg=`${s.n} sedang digadai. Tiada sewa.`;addLog(S.msg);return}
    let ro=opts;if(opts.util10){const a=r6(),b=r6();ro={...opts,roll:a+b};addLog(`Dadu utiliti: ${a}+${b}.`,'dadu')}
    if(lapOne(p)){freeLap(p,`tak perlu bayar sewa ${s.n}`);flash(i);return}
    const rent=rentOf(i,ro);pay(p,rent,o);stt(pi).sewaOut+=rent;stt(o).sewaIn+=rent;
    S.msg=`Sewa ${s.n}: ${p.name} bayar ${fmt(rent)} kepada ${S.players[o].name}.`;sayAll(rent>=200?'sewaBesar':'sewa',p.name,S.players[o].name,fmt(rent));flash(i);return}
  if(s.t==='tax'){if(lapOne(p)){freeLap(p,`tak perlu bayar ${s.n}`);return}
    if(ev()&&ev().notax){S.msg=`Pengecualian cukai! ${p.name} tak perlu bayar ${s.n}.`;addLog(S.msg);return}pay(p,s.a);S.msg=`${s.n}: ${p.name} bayar ${fmt(s.a)}.`;return}
  if(s.t==='gojail'){goJail(p);return}
  if(s.t==='peluang'||s.t==='tabung'){
    const key=s.t,deck=S.decks[key],all=key==='peluang'?PELUANG:TABUNG;
    /* Permainan lama: masukkan kad baharu yang belum ada dalam dek. */
    if(deck.length<all.length){const have=new Set(deck);deck.push(...shuffle([...all.keys()].filter(k=>!have.has(k))))}
    const idx=deck.shift();deck.push(idx);stt(pi).kad++;
    const [text,fx]=(key==='peluang'?PELUANG:TABUNG)[idx];
    S.card={deck:key,text,id:Date.now()+Math.random()};S.msg=`${p.name} cabut kad ${s.n}.`;addLog(`${s.n}: ${text}`);sfx.card();renderAll();
    await sleep(1100);await fx(p);return}
  if(s.t==='free'){S.msg=`${p.name} berehat di Parkir Percuma.`;return}
  if(s.t==='jail'){S.msg=`${p.name} sekadar melawat Lokap.`;return}
  if(s.t==='go'){S.msg=`${p.name} mendarat tepat di MULA.`}
}
function flash(i){const el=document.getElementById('sq'+i);if(!el)return;el.classList.add('hl');setTimeout(()=>el.classList.remove('hl'),900)}

/* ---------- turn flow ---------- */
const r6=()=>1+Math.floor(Math.random()*6);
async function rollDice(){
  if(busy||S.phase!=='roll'||cur().cash<0||tradePending())return;
  save(); /* Checkpoint sebelum apa-apa dadu, pergerakan atau bayaran berubah. */
  busy=true;S.card=null;
  const p=cur();S.phase='moving';S.rollId=(S.rollId||0)+1;sfx.dice();
  const a=r6(),b=r6(),dbl=a===b;S.dice=[a,b];
  rollDiceAnim();await sleep(800);
  addLog(`${p.name} baling ${a} + ${b}${dbl?' (ganda!)':''}.`,'dadu');
  if(p.inJail){
    if(dbl){p.inJail=false;S.again=false;S.msg=`Dadu ganda! ${p.name} bebas dari Lokap.`;addLog(S.msg,'lokap');renderAll();await sleep(500);await walk(p,a+b);await land(p)}
    else{p.jailTurns++;
      if(p.jailTurns>=3){pay(p,50);p.inJail=false;S.again=false;addLog(`${p.name} bayar denda RM50 selepas 3 giliran.`,'lokap');renderAll();await sleep(500);await walk(p,a+b);await land(p)}
      else{S.msg=`Bukan ganda. ${p.name} kekal di Lokap (${p.jailTurns}/3).`;S.again=false}}
  }else{
    if(dbl){S.doubles++;stt(S.turn).ganda++;if(S.doubles===3){addLog('Tiga kali ganda berturut-turut!','dadu');
      if(goJail(p)!==false){S.msg=`3 kali dadu ganda berturut-turut — ${p.name} masuk Lokap!`;settle();busy=false;renderAll();flushRemote();return}}}
    S.again=dbl&&S.doubles>0;await walk(p,a+b);await land(p);
  }
  if(S.phase!=='buy')settle();busy=false;renderAll();flushRemote();
}
function settle(){const p=cur();
  if(S.phase==='over')return;
  S.phase=(S.again&&!p.inJail&&!p.bankrupt)?'roll':'end';
  if(S.phase==='roll'){S.msg+=S.doubles>=2?` Ganda 2/3 — baling lagi, tapi awas: ganda sekali lagi masuk Lokap!`:` Dadu ganda — baling lagi!`;sayAll('ganda',p.name)}}
function buy(){const p=cur(),i=p.pos,s=SQ[i];if(S.phase!=='buy'||p.cash<s.p||tradePending())return;
  p.cash-=s.p;S.owner[i]=S.turn;stt(S.turn).beli++;S.msg=`${p.name} beli ${s.n} dengan ${fmt(s.p)}.`;addLog(S.msg,'beli');sfx.coin();
  if(s.t==='prop'&&hasSet(S.turn,s.g))lineDone(S.turn,s.g);else sayAll('beli',p.name,s.n,fmt(s.p));
  settle();renderAll()}
function pass(){if(S.phase!=='buy'||tradePending())return;
  const i=cur().pos;S.msg=`${cur().name} tidak membeli ${SQ[i].n}.`;addLog(S.msg);
  if(!S.useAuc){settle();renderAll();return}
  startAuction(i)}

/* ---------- lelongan ---------- */
const aucMin=()=>S.auc.bid?S.auc.bid+10:10;
/* Giliran membida ini milik saya? Bot dipandu berasingan oleh hos. */
function aucMine(){
  if(!S||S.phase!=='auction'||!S.auc)return false;
  const p=S.players[S.auc.at];
  if(p.bot)return false;
  return NET?p.uid===UID:true}
const aucActive=()=>S.players.map((p,k)=>k).filter(k=>!S.players[k].bankrupt&&!S.auc.out.includes(k));
function aucAdvance(){const act=aucActive();if(!act.length)return;
  let n=S.auc.at;
  for(let k=0;k<S.players.length;k++){n=(n+1)%S.players.length;if(act.includes(n)){S.auc.at=n;return}}
  S.auc.at=act[0]}
function startAuction(i){
  const act=S.players.map((p,k)=>k).filter(k=>!S.players[k].bankrupt);
  if(act.length<2||!buyable(i)||S.owner[i]!==null){settle();renderAll();return}
  S.auc={sq:i,bid:0,high:null,at:S.turn,out:[]};S.phase='auction';
  S.msg=`Lelongan dibuka: ${SQ[i].n}.`;addLog(S.msg,'lelong');
  aucEnsure();renderAll()}
function aucEnsure(){
  for(let guard=0;guard<30;guard++){
    const act=aucActive();
    if(!act.length||(S.auc.high!==null&&act.length<=1)){aucResolve();return}
    if(!act.includes(S.auc.at))S.auc.at=act[0];
    if(S.players[S.auc.at].cash>=aucMin())return;      /* masih mampu membida */
    const p=S.players[S.auc.at];
    S.auc.out.push(S.auc.at);
    addLog(`${p.name} tiada tunai mencukupi — keluar dari lelongan.`,'lelong');
    aucAdvance()}
  aucResolve()}
function aucBid(inc){
  if(S.phase!=='auction'||!S.auc)return;
  const p=S.players[S.auc.at],b=Math.max(aucMin(),S.auc.bid+inc);
  if(p.cash<b)return;
  S.auc.bid=b;S.auc.high=S.auc.at;
  addLog(`${p.name} bida ${fmt(b)}.`,'lelong');sfx.coin();
  aucAdvance();aucEnsure();renderAll()}
function aucPass(){
  if(S.phase!=='auction'||!S.auc)return;
  const k=S.auc.at;
  if(!S.auc.out.includes(k))S.auc.out.push(k);
  addLog(`${S.players[k].name} lepas daripada lelongan.`,'lelong');
  aucAdvance();aucEnsure();renderAll()}
function aucResolve(){
  const a=S.auc;if(!a)return;const i=a.sq,s=SQ[i];
  if(a.high!==null){
    const w=S.players[a.high];w.cash-=a.bid;S.owner[i]=a.high;stt(a.high).beli++;stt(a.high).lelong=(stt(a.high).lelong||0)+1;
    S.msg=`${w.name} menang lelongan ${s.n} dengan ${fmt(a.bid)}.`;addLog(S.msg,'lelong');sfx.coin();
    if(s.t==='prop'&&hasSet(a.high,s.g))lineDone(a.high,s.g);else sayAll('lelong',w.name,s.n,fmt(a.bid));
  }else{S.msg=`Tiada bidaan. ${s.n} kekal dengan bank.`;addLog(S.msg,'lelong')}
  S.auc=null;settle()}

/* ---------- tawaran ---------- */
const tradeable=i=>S.owner[i]!==null&&(SQ[i].t!=='prop'||groupIdx(SQ[i].g).every(j=>!S.houses[j]));
/* Kerusi saya dalam bilik online; -1 dalam mod satu peranti. */
const mySeat=()=>NET&&S?S.players.findIndex(p=>p.uid===UID):-1;
/* Draf disimpan DI LUAR S supaya ia tidak disegerakkan semasa dibina,
   dan tidak hilang bila keadaan baharu tiba dari pemain lain. */
let draft=null;
const tradePending=()=>!!(S&&S.trade&&S.trade.stage==='review');
function openTrade(){
  if(!S||busy||S.phase==='over'||S.auc||S.trade)return;
  if(S.phase!=='roll'&&S.phase!=='end')return;
  if(cur().bot||!isActor())return;
  const others=S.players.map((p,k)=>k).filter(k=>k!==S.turn&&!S.players[k].bankrupt);
  if(!others.length)return;
  draft={from:S.turn,to:others[0],give:[],want:[],cash:0,stage:'build'};
  renderTrade();document.getElementById('tradeBox').hidden=false}
function closeTrade(){draft=null;S.trade=null;document.getElementById('tradeBox').hidden=true;renderAll()}
/* Sahkan tawaran masih boleh dilaksanakan — pemilikan mungkin sudah berubah. */
function tradeValid(t){
  if(!t)return 'Tawaran tidak sah.';
  if(t.from===t.to||!S.players[t.from]||!S.players[t.to])return 'Pemain tidak sah.';
  if(S.players[t.from].bankrupt||S.players[t.to].bankrupt)return 'Pemain sudah muflis.';
  for(const i of t.give)if(S.owner[i]!==t.from||!tradeable(i))return `${SQ[i].n} sudah tidak boleh ditawar.`;
  for(const i of t.want)if(S.owner[i]!==t.to||!tradeable(i))return `${SQ[i].n} sudah tidak boleh ditawar.`;
  if(t.cash>S.players[t.from].cash)return `${S.players[t.from].name} tiada tunai mencukupi.`;
  if(-t.cash>S.players[t.to].cash)return `${S.players[t.to].name} tiada tunai mencukupi.`;
  return ''}
function sendTrade(){
  const t=draft;if(!t)return;
  if(!t.give.length&&!t.want.length&&!t.cash)return;
  const bad=tradeValid(t);
  if(bad){document.getElementById('tradeNote').innerHTML=`<span class="warn">${esc(bad)}</span>`;return}
  S.trade={from:t.from,to:t.to,give:t.give.slice(),want:t.want.slice(),cash:t.cash,stage:'review'};
  draft=null;
  addLog(`${S.players[t.from].name} menawarkan sesuatu kepada ${S.players[t.to].name}.`);
  renderAll()}
/* Pencadang menarik balik tawaran — berguna bila lawan terputus talian. */
function cancelOffer(){
  if(!tradePending())return;
  const t=S.trade;
  S.msg=`${S.players[t.from].name} menarik balik tawaran.`;addLog(S.msg);
  closeTrade()}
function tradeAnswer(ok){
  const t=S.trade;if(!t||t.stage!=='review')return;
  const A=S.players[t.from],B=S.players[t.to];
  if(!ok){S.msg=`${B.name} menolak tawaran ${A.name}.`;addLog(S.msg);closeTrade();return}
  const bad=tradeValid(t);
  if(bad){S.msg=`Tawaran gugur: ${bad}`;addLog(S.msg);closeTrade();return}
  t.give.forEach(i=>S.owner[i]=t.to);
  t.want.forEach(i=>S.owner[i]=t.from);
  A.cash-=t.cash;B.cash+=t.cash;
  S.msg=`${B.name} menerima tawaran ${A.name}.`;addLog(S.msg);sfx.coin();
  [t.from,t.to].forEach(k=>stt(k).tawar=(stt(k).tawar||0)+1);
  [[t.from,t.want],[t.to,t.give]].forEach(([pi,list])=>{
    const seen=[];
    list.forEach(i=>{const s=SQ[i];
      if(s.t==='prop'&&!seen.includes(s.g)&&hasSet(pi,s.g)){seen.push(s.g);
        lineDone(pi,s.g)}})});
  closeTrade()}
/* Set penuh: direkod dalam keadaan (S.fan) supaya setiap peranti dalam bilik
   online memainkan sambutan yang sama — bukan hanya peranti pembeli. */
function lineDone(pi,g){
  const nm=S.players[pi].name;
  toastAll(`${nm} lengkapkan laluan ${GROUPS[g].n}! Sewa berganda.`);
  addLog(`${nm} kini memiliki set penuh ${GROUPS[g].n}.`,'beli');
  S.fan={pi,g,id:Date.now().toString(36)+Math.random().toString(36).slice(2,6)};
}
function endTurn(){
  if(busy||S.phase!=='end'||cur().cash<0||tradePending())return;
  /* Nilaikan kebenaran menulis SEBELUM giliran bertukar: selepas S.turn
     beralih kepada pemain lain, isActor() akan menolak peranti ini dan
     giliran baharu itu tidak akan pernah sampai ke pelayan. Ini berlaku
     pada bot (hos menamatkan giliran bot) dan pada pemain yang muflis
     semasa gilirannya sendiri. */
  const mine=isActorOrJustActed();
  S.card=null;S.doubles=0;S.again=false;
  if(checkOver())return;
  let n=S.turn;const was=S.turn;
  for(let g=0;g<20;g++){
    do{n=(n+1)%S.players.length}while(S.players[n].bankrupt);
    const q=S.players[n];
    if(q.skip>0){q.skip--;const t=`${q.name} terlepas giliran — tren masih rosak.`;addLog(t);toastAll(t);continue}
    break}
  /* Giliran berpusing semula ke pemain awal = pusingan baharu bermula. */
  if(n<=was){
    /* Mod cepat: ronde terakhir selesai — tamat tanpa berita baharu. */
    if(S.fast&&(S.round||1)>=S.fastRounds){finish();return}
    /* Had ronde (Main sekarang): selepas ronde terakhir, kekayaan tertinggi menang. */
    if(S.maxRounds&&(S.round||1)>=S.maxRounds){finish();return}
    newRound();
    if(S.maxRounds){const left=S.maxRounds-S.round+1;
      if(left===5)toastAll(`🏁 5 ronde lagi! Kekayaan bersih tertinggi selepas ronde ${S.maxRounds} menang.`);
      else if(left===1)toastAll('🏁 Ronde terakhir! Kukuhkan kekayaan anda.')}}
  S.turn=n;S.phase='roll';if(NET)NET.override=null;afkSeat=-1;
  const p=cur();S.msg=p.inJail?`${p.name} di Lokap. Bayar RM50, guna kad, atau cuba dadu ganda.`:`Giliran ${p.name}. Baling dadu!`;
  if(mine){actedTurn=true;try{renderAll()}finally{actedTurn=null}}
  else renderAll()}
function checkOver(){const act=S.players.filter(p=>!p.bankrupt);
  if(act.length<=1||(S.endLaps&&act.every(p=>p.laps>=S.endLaps))){finish();return true}return false}
function payBail(){const p=cur();if(!p.inJail||S.phase!=='roll'||p.cash<50)return;pay(p,50);p.inJail=false;p.jailTurns=0;S.msg=`${p.name} bayar ikat jamin RM50 dan keluar dari Lokap. Baling dadu!`;addLog(S.msg,'lokap');sfx.coin();renderAll()}
function useCard(){const p=cur();if(!p.inJail||!p.cards)return;p.cards--;p.inJail=false;S.msg=`${p.name} guna Kad Bebas Lokap. Baling dadu!`;addLog(S.msg,'lokap');sfx.card();renderAll()}
function build(i){if(!canBuild(i))return;const s=SQ[i],c=houseCost(i);cur().cash-=c;S.houses[i]++;stt(S.turn).bina++;
  addLog(`${cur().name} bina ${S.houses[i]===5?'hotel':'rumah'} di ${s.n} (${fmt(c)}).`,'bina');sfx.build();
  if(S.houses[i]===5)sayAll('hotel',cur().name,s.n);renderAll()}
function sell(i){if(!canSell(i))return;const s=SQ[i],c=Math.floor(houseCost(i)/2);S.houses[i]--;cur().cash+=c;addLog(`${cur().name} jual bangunan di ${s.n} (+${fmt(c)}).`,'bina');sfx.coin();renderAll()}
function mortgage(i){if(!canMort(i))return;S.mort[i]=true;cur().cash+=SQ[i].p/2;addLog(`${cur().name} gadai ${SQ[i].n} (+${fmt(SQ[i].p/2)}).`);sfx.coin();renderAll()}
function unmortgage(i){if(!canUnmort(i))return;S.mort[i]=false;cur().cash-=unmortCost(i);addLog(`${cur().name} tebus ${SQ[i].n} (${fmt(unmortCost(i))}).`);sfx.pay();renderAll()}
function bankrupt(){const p=cur(),pi=S.turn;if(p.cash>=0)return;
  const to=p.creditor;
  S.owner.forEach((o,i)=>{if(o!==pi)return;S.houses[i]=0;if(to!==null&&!S.players[to].bankrupt){S.owner[i]=to}else{S.owner[i]=null;S.mort[i]=false}});
  if(to!==null)S.players[to].cash+=p.cash;
  if(p.along){addLog(`Along gagal menagih ${fmt(p.along)} daripada ${p.name}. Hutang lesap.`);p.along=0}
  p.bankrupt=true;p.cash=0;addLog(`${p.name} isytihar muflis!${to!==null?' Hartanah diserahkan kepada '+S.players[to].name+'.':''}`);sfx.jail();sayAll('muflis',p.name);
  S.phase='end';S.again=false;endTurn()}
/* ---------- Along (pinjaman berisiko) ----------
   Pemain yang kesempitan (tunai bawah RM300, atau negatif) boleh pinjam RM300.
   Hutang RM400 ditagih secara automatik bila pemain lalu MULA — ditolak terus
   daripada tunai, termasuk pada pusingan pertama. Satu pinjaman sahaja pada
   satu masa. Hutang ditolak daripada kekayaan bersih, dan lesap jika muflis. */
const ALONG_PINJAM=300,ALONG_BAYAR=400;
function canBorrow(){const p=cur();
  return !!p&&!p.bankrupt&&!p.along&&p.cash<ALONG_PINJAM&&!busy&&!tradePending()
    &&(p.cash<0||S.phase==='roll'||S.phase==='end')}
function alongPinjam(){if(!canBorrow())return;const p=cur();
  p.cash+=ALONG_PINJAM;p.along=ALONG_BAYAR;if(!p.bot)track('along','Pinjam Along');stt(S.turn).along=(stt(S.turn).along||0)+1;
  const t=`🦈 ${p.name} pinjam ${fmt(ALONG_PINJAM)} daripada Along. Kena bayar ${fmt(ALONG_BAYAR)} bila lalu MULA!`;
  S.msg=t;addLog(t);sfx.coin();renderAll()}
function alongBayar(){const p=cur();if(!p||!p.along||p.cash<p.along||busy||tradePending())return;
  const a=p.along;p.cash-=a;p.along=0;
  const t=`${p.name} langsaikan hutang Along (${fmt(a)}) awal. Selamat!`;S.msg=t;addLog(t);sfx.pay();renderAll()}
function alongTagih(p){if(!p.along)return;const a=p.along;p.cash-=a;p.along=0;
  if(p.cash<0)p.creditor=null;
  const t=p.cash<0?`🦈 Along tunggu di MULA! ${p.name} bayar ${fmt(a)} dan kini berhutang ${fmt(-p.cash)}.`
    :`🦈 Along tunggu di MULA! ${p.name} bayar ${fmt(a)}.`;
  S.msg=t;addLog(t,'sewa');sfx.pay()}
function finish(){S.phase='over';renderAll();showEnd()}
/* Lencana: hanya untuk pemain yang benar-benar menonjol — nilai tertinggi,
   melepasi had minimum, dan lebih tinggi daripada sekurang-kurangnya seorang
   pemain lain (kalau semua seri, tiada siapa dapat). Disusun ikut keutamaan
   supaya lencana paling menarik keluar dahulu dalam kongsi WhatsApp. */
function badges(){
  const P=S.players,out=P.map(()=>[]);
  const top=(f,min,e,t,d,rank)=>{const v=P.map((q,k)=>f(k));const m=Math.max(...v);
    if(m<min||v.every(x=>x===m))return;
    v.forEach((x,k)=>{if(x===m)out[k].push({e,t,d:d(x),r:rank})})};
  const owned=k=>S.owner.filter(o=>o===k).length;
  top(k=>stt(k).sewaIn,1,'💸','Raja Sewa',x=>`kutip ${fmt(x)} sewa`,1);
  top(owned,1,'👑','Tuan Tanah',x=>`miliki ${x} hartanah`,2);
  top(k=>stt(k).lokap,2,'🔒','Banduan Tetap',x=>`masuk Lokap ${x} kali`,5);
  top(k=>stt(k).ganda,3,'🎲','Tangan Panas',x=>`${x} kali dadu ganda`,6);
  top(k=>stt(k).bina,1,'🏗️','Kontraktor',x=>`bina ${x} kali`,7);
  top(k=>stt(k).kad,4,'🃏','Kaki Kad',x=>`cabut ${x} kad`,8);
  top(k=>stt(k).sewaOut,1,'🩸','Penderma Tegar',x=>`bayar ${fmt(x)} sewa`,9);
  P.forEach((q,k)=>{
    const sets=GROUPS.map((g,gi)=>hasSet(k,gi)?g.n:null).filter(Boolean);
    if(sets.length===1)out[k].push({e:'🛤️',t:'Raja '+sets[0],d:'miliki laluan penuh',r:3});
    else if(sets.length>1)out[k].push({e:'🛤️',t:`Raja ${sets.length} Laluan`,d:sets.join(', '),r:3});
    if(!q.bankrupt&&stt(k).min<50)out[k].push({e:'🔥',t:'Bangkit Semula',d:`pernah tinggal ${fmt(stt(k).min)}`,r:4});
    if(stt(k).rosak)out[k].push({e:'🚧',t:'Mangsa Tren Rosak',d:`terlepas ${stt(k).rosak} giliran`,r:10})});
  out.forEach(l=>l.sort((a,b)=>a.r-b.r));
  return out}
function endSummary(rk,bd){
  const url=location.origin+location.pathname;
  const seri=rk.filter(r=>r.pos===1&&!r.p.bankrupt).length>1;
  return `🚆 Metro Tycoon KL${S.fast?' ⚡ Mod cepat':''}${seri?' · Keputusan seri!':''}\n`+
    rk.map((r,i)=>{const k=S.players.indexOf(r.p);const b=bd[k].slice(0,3).map(x=>x.e+' '+x.t).join(', ');
      return `${['🥇','🥈','🥉'][r.pos-1]||r.pos+'.'} ${r.p.name} — ${fmt(r.w)}${r.p.bankrupt?' (muflis)':''}${b?'\n    '+b:''}`}).join('\n')+
    `\n\nMain di sini: ${url}`}
let lastSummary='', wonSaid=null;
function showEnd(){
  const rk=rankPlayers();
  /* Sekali bagi setiap permainan: mod dan bilangan ronde, tanpa nama pemain. */
  if(!S.tracked){S.tracked=true;
    const mode=NET?'online':S.fast?'cepat':S.players.some(p=>p.bot)?'lawan-bot':'satu-peranti';
    const r=S.round||1,band=r<=10?'1-10':r<=20?'11-20':r<=40?'21-40':r<=80?'41-80':'80+';
    track('tamat-'+mode,`Tamat ${mode} · ${band} ronde`)}
  const bd=badges();
  /* Seri: lebih daripada seorang pemain (tidak muflis) berkongsi kekayaan tertinggi. */
  const top=rk.filter(r=>r.pos===1&&!r.p.bankrupt),tie=top.length>1;
  const names=tie?joinNames(top.map(r=>r.p.name)):rk[0].p.name;
  document.getElementById('endTitle').textContent=tie?'Seri!':`${names} menang!`;
  document.getElementById('endLead').textContent=tie
    ?`${names} berkongsi tempat pertama dengan kekayaan bersih ${fmt(top[0].w)}.`
    :'Kedudukan akhir ikut kekayaan bersih (tunai + nilai hartanah + bangunan).';
  document.getElementById('rank').innerHTML=rk.map((r,i)=>{const k=S.players.indexOf(r.p),t=stt(k);
    return `<li class="${r.pos===1&&!r.p.bankrupt?'win':''}"><span class="pos">${r.pos}</span>${trainMark(k,r.p.color)}<span class="n">${esc(r.p.name)}${r.p.bankrupt?' <span class="chip bad">Muflis</span>':''}
      <span class="stline">Sewa +${fmt(t.sewaIn)} / −${fmt(t.sewaOut)} · Beli ${t.beli} · Bina ${t.bina} · Lokap ${t.lokap} · Misi ${MISI.filter(m=>missDone(k)[m.id]).length}/${MISI.length}</span>
      <span class="bdg">${bd[k].slice(0,4).map(x=>`<span class="badge" title="${esc(x.d)}">${x.e} ${esc(x.t)}</span>`).join('')}</span></span><span class="money">${fmt(r.w)}</span></li>`}).join('');
  /* Senarai penerangan lencana: apa maksud setiap satu. */
  const all=[];bd.forEach((l,k)=>l.forEach(x=>all.push(`<li><b>${x.e} ${esc(x.t)}</b> — ${esc(S.players[k].name)}, ${esc(x.d)}</li>`)));
  document.getElementById('endBadges').innerHTML=all.length?`<h4>Lencana</h4><ul class="bdlist">${all.join('')}</ul>`:'';
  lastSummary=endSummary(rk,bd);
  document.getElementById('endBox').hidden=false;sfx.win();confetti();
  if(wonSaid!==S.gid){wonSaid=S.gid;speak(tie?`Seri! ${names.replace(' & ',' dan ')} sama kuat. Tahniah semua!`:line('menang',names),false)}}
/* Kedudukan ikut kekayaan bersih. Pemain yang sama kaya berkongsi kedudukan
   (1, 1, 3…); pemain muflis sentiasa di bawah. */
function rankPlayers(){
  const rk=S.players.map(p=>({p,w:p.bankrupt?0:netWorth(p)}))
    .sort((a,b)=>(a.p.bankrupt-b.p.bankrupt)||(b.w-a.w));
  rk.forEach((r,i)=>{const prev=rk[i-1];
    r.pos=prev&&prev.w===r.w&&prev.p.bankrupt===r.p.bankrupt?prev.pos:i+1});
  return rk}
function joinNames(a){return a.length<2?a.join(''):a.slice(0,-1).join(', ')+' & '+a[a.length-1]}
document.getElementById('btnShare').onclick=async()=>{
  const t=lastSummary;if(!t)return;track('kongsi','Kongsi keputusan');
  try{if(navigator.share){await navigator.share({text:t});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(t);toast('Keputusan disalin. Tampal dalam WhatsApp!')}catch(e){prompt('Salin keputusan ini:',t)}};
