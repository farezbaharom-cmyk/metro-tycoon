/* Metro Tycoon KL — bot.js
   Pemain bot (Mudah & Sederhana).
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- bot ---------- */
const BOT_LEVELS={mudah:'Mudah',sederhana:'Sederhana'};
const BOT_NAMES=['Bot Ain','Bot Hafiz','Bot Rina','Bot Zul','Bot Mia'];
let botTimer=null;
function clearBot(){if(botTimer){clearTimeout(botTimer);botTimer=null}}
/* Kerusi mana yang bot perlu mainkan sekarang — bukan semestinya giliran semasa,
   kerana lelongan dan tawaran melibatkan pemain lain. */
/* Siapa yang bertanggungjawab menggerakkan bot: hos, atau jika hos terputus,
   pemain dalam talian dengan uid terkecil — deterministik, jadi hanya seorang. */
function botDriver(){
  if(!NET||!S)return null;
  const host=NET.room&&NET.room.meta&&NET.room.meta.host;
  if(host&&isOnline(host))return host;
  const live=S.players.filter(p=>!p.bot&&!p.bankrupt&&isOnline(p.uid)).map(p=>p.uid).sort();
  return live[0]||null}
function botSeat(){
  if(!S)return -1;
  if(NET&&botDriver()!==UID)return -1;      /* seorang pemandu bot sahaja */
  if(S.phase==='auction'&&S.auc)return S.auc.at;
  if(S.trade&&S.trade.stage==='review')return S.trade.to;
  return S.turn}
const isBotTurn=()=>{const k=botSeat();
  return k>=0&&!!S.players[k]&&(!!S.players[k].bot||k===afkSeat)&&!S.players[k].bankrupt};
const myIdx=()=>S.owner.map((o,i)=>o===S.turn?i:-1).filter(i=>i>=0);
function scheduleBot(){
  clearBot();
  if(!S||busy||S.phase==='over'||S.phase==='moving'||!isBotTurn())return;
  if(!NET&&!document.getElementById('setup').hidden)return;
  const quick=cur().cash<0||S.phase==='end';
  botTimer=setTimeout(()=>{botTimer=null;botAct()},RM?100:(quick?420:760));
}
/* Simpanan tunai yang bot cuba kekalkan — ikut sewa paling tinggi di papan. */
function botBuffer(){let worst=0;
  S.owner.forEach((o,i)=>{if(o!==null&&o!==S.turn&&!S.mort[i])worst=Math.max(worst,rentOf(i))});
  return Math.max(150,Math.min(500,Math.round(worst*1.2)))}
function botAct(){
  if(busy||!S||S.phase==='over'||!isBotTurn())return;
  const k=botSeat(),p=S.players[k],lv=p.bot||'sederhana',afk=!p.bot;
  /* Lelongan dan tawaran melibatkan kerusi yang bukan giliran semasa, jadi
     tulisan hos perlu ditanda sebagai sah buat tindakan itu sahaja. */
  if(S.phase==='auction'&&S.auc){actedTurn=true;try{botAucBid(k,lv)}finally{actedTurn=null}return}
  if(S.trade&&S.trade.stage==='review'){
    actedTurn=true;try{tradeAnswer(afk?false:botTradeOk(k,lv))}finally{actedTurn=null}return}
  if(p.cash<0){botRaise(p);return}
  if(S.phase==='roll'){p.inJail?botJail(p,lv):rollDice();return}
  if(S.phase==='buy'){botBuy(p,lv);return}
  /* Pemain AFK: bot tidak membelanjakan wangnya untuk membina — tamat sahaja. */
  if(S.phase==='end'){if(!afk)botManage(p,lv);endTurn();return}
}
function botJail(p,lv){
  if(p.cards){useCard();return}
  const owned=S.owner.filter(o=>o!==null).length,total=SQ.filter((s,i)=>buyable(i)).length;
  /* Lewat permainan, tinggal di Lokap lebih selamat daripada merayau di papan penuh hotel. */
  const wantOut=lv==='mudah'?p.cash>=150:(owned<total*.6&&p.cash>=250);
  if(wantOut&&p.cash>=50){payBail();return}
  rollDice()}
function botBuy(p,lv){
  const s=SQ[p.pos];
  if(p.cash<s.p){pass();return}
  (lv==='mudah'?(p.cash-s.p>=120&&Math.random()>.12):botWants(p,p.pos))?buy():pass()}
function botWants(p,i){
  const s=SQ[i],pi=S.turn,after=p.cash-s.p;let reserve=200;
  if(s.t==='prop'){const gi=groupIdx(s.g);
    const mine=gi.filter(j=>S.owner[j]===pi).length;
    const foe=gi.filter(j=>S.owner[j]!==null&&S.owner[j]!==pi).length;
    if(mine+1===gi.length)reserve=0;            /* melengkapkan set — mesti ambil */
    else if(mine>=1)reserve=60;                 /* menghampiri set */
    else if(foe>=gi.length-1)reserve=80;        /* sekat lawan daripada lengkap */
    else reserve=180}
  else if(s.t==='hub')reserve=HUBS.filter(j=>S.owner[j]===pi).length?60:140;
  else reserve=UTILS.filter(j=>S.owner[j]===pi).length?120:260;
  return after>=reserve}
function botManage(p,lv){
  if(lv==='mudah'){
    for(let g=0;g<8;g++){const o=myIdx().filter(i=>canBuild(i)&&S.houses[i]<3);
      if(!o.length||p.cash-GROUPS[SQ[o[0]].g].h<400)break;build(o[0])}
    return}
  for(let g=0;g<6;g++){const m=myIdx().filter(i=>canUnmort(i)&&p.cash-unmortCost(i)>=450);
    if(!m.length)break;unmortgage(m[0])}
  const buf=botBuffer();
  for(let g=0;g<14;g++){
    const o=myIdx().filter(i=>canBuild(i)).sort((a,b)=>GROUPS[SQ[b].g].h-GROUPS[SQ[a].g].h);
    const i=o.find(j=>p.cash-GROUPS[SQ[j].g].h>=buf);
    if(i===undefined)break;build(i)}
}
/* Nilai satu petak pada mata pemain k — asas untuk membida dan menilai tawaran. */
function botPropValue(k,i){
  const s=SQ[i];let v=s.p;
  if(s.t==='prop'){
    const gi=groupIdx(s.g),mine=gi.filter(j=>S.owner[j]===k).length,
          foe=gi.filter(j=>S.owner[j]!==null&&S.owner[j]!==k).length;
    if(mine+1===gi.length)v*=2.0;            /* melengkapkan set */
    else if(mine>=1)v*=1.3;
    else if(foe>=gi.length-1)v*=1.1;         /* menyekat lawan */
    else v*=0.85;
  }else if(s.t==='hub')v*=1+.28*HUBS.filter(j=>S.owner[j]===k).length;
  else v*=UTILS.filter(j=>S.owner[j]===k).length?1.1:.7;
  if(S.mort[i])v*=.55;
  return v}
function botAucBid(k,lv){
  const p=S.players[k],min=aucMin();
  const reserve=lv==='mudah'?120:180;
  let cap=Math.floor(botPropValue(k,S.auc.sq)*(lv==='mudah'?.75:1));
  cap=Math.min(cap,p.cash-reserve);
  if(min>cap||p.cash<min){aucPass();return}
  const inc=S.auc.bid<100?10:S.auc.bid<400?20:50;   /* naik sikit-sikit */
  aucBid(Math.min(cap,S.auc.bid+inc)-S.auc.bid)}
/* Bot menimbang tawaran: apa yang diterima mesti melebihi apa yang dilepaskan. */
function botTradeOk(k,lv){
  const t=S.trade;
  const gain=t.give.reduce((a,i)=>a+botPropValue(k,i),0)+(t.cash>0?t.cash:0);
  let loss=t.want.reduce((a,i)=>a+botPropValue(k,i),0)+(t.cash<0?-t.cash:0);
  /* Menyerahkan petak yang melengkapkan set lawan itu mahal. */
  t.want.forEach(i=>{const s=SQ[i];
    if(s.t==='prop'){const gi=groupIdx(s.g);
      if(gi.filter(j=>S.owner[j]===t.from).length+1===gi.length)loss+=s.p*1.2}});
  if(S.players[k].cash+t.cash<0)return false;             /* tak mampu bayar bahagian tunai */
  const margin=lv==='mudah'?1.0:1.18;                     /* sederhana tawar lebih keras */
  return gain>=loss*margin}
function botRaise(p){
  const pi=S.turn;
  const sl=myIdx().filter(i=>canSell(i));
  if(sl.length){sl.sort((a,b)=>GROUPS[SQ[a].g].h-GROUPS[SQ[b].g].h);sell(sl[0]);return}
  const mo=myIdx().filter(i=>canMort(i));
  if(mo.length){mo.sort((a,b)=>{
      const sa=SQ[a].t==='prop'&&hasSet(pi,SQ[a].g)?1:0,sb=SQ[b].t==='prop'&&hasSet(pi,SQ[b].g)?1:0;
      return sa-sb||SQ[a].p-SQ[b].p});                 /* set penuh digadai paling akhir */
    mortgage(mo[0]);return}
  /* Sudah tiada apa untuk dijual — bot terdesak pinjam daripada Along sekali. */
  if(canBorrow()){alongPinjam();return}
  bankrupt()}
