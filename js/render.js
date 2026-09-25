/* Metro Tycoon KL — render.js
   Melukis papan dan panel, animasi Lokap, zum & geser papan.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- rendering ---------- */
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function gridPos(i){if(i<=10)return[11,11-i];if(i<=20)return[11-(i-10),1];if(i<=30)return[1,1+(i-20)];return[1+(i-30),11]}
function side(i){if(i%10===0)return'corner bottom';return i<10?'bottom':i<20?'left':i<30?'top':'right'}
/* Nama pendek untuk papan telefon. \u00AD = sempang lembut: perkataan panjang
   dipecah di situ (dengan sempang) hanya jika ia tidak muat sebaris. */
/* Nama pendek untuk papan telefon. \u00AD = sempang lembut: perkataan hanya
   dipecah di situ jika tidak muat, jadi tiada huruf yang terpotong. */
/* Nama pendek stesen (telefon). SHORT = bentuk bersih (pecah hanya di ruang
   atau sempadan semula jadi, cth. Titi-wangsa). Jika perkataan tak muat,
   fon dikecilkan sedikit (hingga 7.5px). Hanya jika masih tak muat — petak
   sempit baris atas/bawah — nama dipecah ikut suku kata (SHORT_SYL). */
const fitCtx=document.createElement('canvas').getContext('2d');
const FIT_MIN=7;
function fitNeed(txt,cs,sz){
  if(cs.textTransform==='uppercase')txt=txt.toUpperCase();
  fitCtx.font=`${cs.fontWeight} ${sz}px ${cs.fontFamily}`;const ls=parseFloat(cs.letterSpacing)||0;
  const parts=txt.split(/\s+/).flatMap(w=>{const p=w.split('\u00AD');return p.map((x,i)=>i<p.length-1?x+'-':x)});
  return Math.max(...parts.map(x=>fitCtx.measureText(x).width+ls*x.length))}
function fitNames(){
  document.querySelectorAll('#board .sq .nm-s').forEach(e=>{
    if(!e.offsetParent)return;
    const sq=e.closest('.sq'),i=+sq.dataset.i,nm=SHORT[i]||SQ[i].n,syl=SHORT_SYL[i];
    const own=sq.classList.contains('owned'),side=sq.classList.contains('left')||sq.classList.contains('right');
    const st=side&&sq.querySelector('.stripe');
    const avail=sq.clientWidth-(st?st.offsetWidth:0)-(own?5:3);
    const key=avail+'|'+own;if(e._fk===key)return;e._fk=key;
    e.style.fontSize='';e.textContent=nm;
    const cs=getComputedStyle(e),sz=parseFloat(cs.fontSize);
    let need=fitNeed(nm,cs,sz);if(need<=avail)return;
    let k=avail/need;
    if(sz*k<FIT_MIN&&syl&&syl!==nm){
      e.textContent=syl;need=fitNeed(syl,cs,sz);if(need<=avail)return;k=avail/need}
    e.style.fontSize=Math.max(FIT_MIN,Math.floor(sz*k*10)/10)+'px'});
}
const SHORT_SYL={1:'Titi\u00ADwang\u00ADsa',2:'Ta\u00ADbung',4:'Cukai',5:'KL Sen\u00ADtral',6:'Batu Caves',7:'Pe\u00ADluang',9:'Ke\u00ADpong',11:'Bkt Jalil',
  12:'Elek\u00ADtrik',13:'Sri Pe\u00ADtaling',15:'M.Jamek',16:'Am\u00ADpang',17:'Ta\u00ADbung',18:'Pandan Indah',
  20:'Parkir',21:'Su\u00ADbang Jaya',22:'Pe\u00ADluang',23:'Kelana Jaya',24:'Bang\u00ADsar',25:'Pasar Seni',26:'Salak Tinggi',
  27:'Putra\u00ADjaya',28:'Air',30:'Ke Lokap',31:"Mu\u00ADtiara D'sara",32:'Seman\u00ADtan',
  33:'Ta\u00ADbung',34:'Bkt Bin\u00ADtang',35:'TBS',36:'Pe\u00ADluang',38:'Cukai',39:'KLCC'};
const SHORT={1:'Titi\u00ADwangsa',2:'Tabung',4:'Cukai',5:'KL Sentral',6:'Batu Caves',7:'Peluang',9:'Kepong',11:'Bkt Jalil',
  12:'Elektrik',13:'Sri Petaling',15:'M.Jamek',16:'Ampang',17:'Tabung',18:'Pandan Indah',
  20:'Parkir',21:'Subang Jaya',22:'Peluang',23:'Kelana Jaya',24:'Bangsar',25:'Pasar Seni',26:'Salak Tinggi',
  27:'Putra\u00ADjaya',28:'Air',30:'Ke Lokap',31:"Mutiara D'sara",32:'Semantan',
  33:'Tabung',34:'Bkt Bintang',35:'TBS',36:'Peluang',38:'Cukai',39:'KLCC'};
/* Siluet langit KL (viewBox 400×200). Tiga mercu tanda — KL Tower, Menara
   Berkembar dan Merdeka 118 — di antara bangunan biasa, dengan landasan LRT
   bertiang dan tren yang melintas. Tingkap dijana dengan benih tetap supaya
   papan kelihatan sama setiap kali dibuka. */
function skylineSVG(gid){gid=gid||'skyg';
  let seed=7;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const rects=(cls,list)=>list.map(([x,w,h])=>`<rect class="${cls}" x="${x}" y="${200-h}" width="${w}" height="${h}"/>`).join('');
  const wins=(x,w,h,top)=>{let o='';for(let yy=200-h+6;yy<top;yy+=7)for(let xx=x+3;xx<x+w-3;xx+=5)if(rnd()<.45)o+=`<rect class="w" x="${xx}" y="${yy}" width="2" height="3"/>`;return o};
  /* Tengah dibiarkan rendah supaya dadu dan mesej tidak menutup mercu tanda. */
  const back=[[0,20,74],[64,16,58],[150,22,46],[178,24,40],[206,20,48],[232,22,52],[256,18,70],[352,24,80],[376,24,60]];
  const front=[[0,28,46],[26,20,58],[70,24,40],[146,26,30],[172,30,24],[202,26,32],[228,24,26],[252,22,44],[276,20,36],[338,26,50],[364,36,42]];
  let stars='';for(let k=0;k<22;k++)stars+=`<circle class="st tw" cx="${(rnd()*400).toFixed(1)}" cy="${(rnd()*70+4).toFixed(1)}" r="${(rnd()*.9+.5).toFixed(2)}"/>`;
  /* Menara Berkembar: tingkat menirus, puncak jarum, jambatan langit. */
  const tower=x=>`<path class="lm" d="M${x-11} 200V96h2v-8h2v-10h2v-10h2v-8h2v-8h1V34h1v-6h1V14h1v14h1v6h1v18h1v8h2v8h2v10h2v10h2v8h2V200z"/>`;
  const twin=tower(104)+tower(132)+`<rect class="lm" x="104" y="112" width="28" height="3"/><path class="lmS" stroke-width="1.2" d="M110 115l8 10l8-10"/>`;
  /* KL Tower: batang langsing, kepala bulat, antena. */
  const kltower=`<rect class="lm" x="45" y="80" width="5" height="120"/><path class="lm" d="M38 80q9.5-12 19 0l-2 5h-15z"/><rect class="lm" x="40" y="72" width="15" height="4" rx="2"/><rect class="lm" x="46.8" y="42" width="1.4" height="32"/><circle class="beacon" cx="47.5" cy="42" r="1.4"/>`;
  /* Merdeka 118: menara bersegi yang menirus ke puncak menara jarum panjang. */
  const m118=`<path class="lm" d="M308 200V70l6-14l4-16l2-6h2l2 6l4 16l6 14V200z"/><path class="lm" d="M319.2 34L321 2l1.8 32z"/><circle class="beacon" cx="321" cy="3" r="1.4"/><path class="b1" opacity=".35" d="M321 36v164h11V70l-6-14l-4-16z"/>`;
  const pillars=[20,70,120,170,220,270,320,370].map(x=>`<rect class="trk" x="${x}" y="186" width="4" height="14"/>`).join('');
  const train=`<g class="train"><rect class="tbody" x="0" y="173" width="84" height="11" rx="3"/><path class="tnose" d="M84 173h4q6 0 8 11h-12z"/>${[6,20,34,48,62,74].map(x=>`<rect class="twin" x="${x}" y="176" width="8" height="4" rx="1"/>`).join('')}</g>`;
  return `<svg class="sky" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sg-a" stop-opacity="0"/><stop offset=".45" class="sg-a"/><stop offset="1" class="sg-b"/></linearGradient></defs>
    <rect width="400" height="200" fill="url(#${gid})"/>${stars}
    <circle class="orbg" cx="356" cy="38" r="17"/><circle class="orb" cx="356" cy="38" r="8.5"/>
    ${rects('b0',back)}${kltower}${twin}${m118}
    ${front.map(([x,w,h])=>rects('b2',[[x,w,h]])+wins(x,w,h,196)).join('')}
    <rect class="trk" x="0" y="184" width="400" height="3"/>${pillars}${train}</svg>`}
function buildBoard(){
  const b=document.getElementById('board');let h='';
  SQ.forEach((s,i)=>{const [r,c]=gridPos(i);
    const stripe=s.t==='prop'?`<div class="stripe" style="background:${GROUPS[s.g].c}"></div>`:'';
    const label=s.p?`<span class="pr">${fmt(s.p)}</span>`:s.a?`<span class="pr">${fmt(s.a)}</span>`:'';
    const icon=CORNER[i]?cornerSVG(i):s.t!=='prop'?`<span class="ic" aria-hidden="true">${s.ic}</span>`:'';
    const csub=CORNER[i]?`<span class="csub" aria-hidden="true">${CORNER[i].sub}</span>`:'';
    const code=CODE[i]?`<span class="scode" style="--lc:${GROUPS[s.g].c};--lt:${s.g===0||s.g===7?'#1B2530':'#fff'}" aria-hidden="true">${CODE[i]}</span>`:'';
    /* Perkataan terpanjang yang menentukan sama ada nama muat dalam satu baris. */
    const lw=Math.max(...s.n.split(/\s+/).map(w=>w.length));
    const fit=lw>=11?' tighter':lw>=9?' tight':'';
    h+=`<div class="sq ${side(i)}" id="sq${i}" style="grid-row:${r};grid-column:${c}" data-i="${i}" role="button" tabindex="0" aria-label="${esc(s.n)}">${stripe}<div class="body">${icon}${code}<span class="nm nm-f${fit}">${esc(s.n)}</span><span class="nm nm-s" aria-hidden="true">${esc(SHORT[i]||s.n)}</span>${csub}${label}</div><div class="tokens"></div></div>`});
  const lines=GROUPS.map((g,k)=>{const y=12+k*11;return `<path d="M-5 ${y} C 30 ${y+18}, 70 ${y-20}, 105 ${y+6}" stroke="${g.c}" stroke-width="2.2" fill="none"/>`}).join('');
  h+=`<div class="center" id="center"><svg class="map" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>${skylineSVG()}
    <div class="logo"><h1>Metro<br><span>Tycoon</span></h1><p>Edisi Lembah Klang</p></div>
    <div class="dice">${dieHTML(0)}${dieHTML(1)}</div>
    <div class="msg" id="msg" aria-live="polite"></div><div id="cardSlot"></div></div>`;
  h+=`<div class="flyer" id="flyer" aria-hidden="true"></div>`;
  b.innerHTML=h;
  requestAnimationFrame(fitNames);
  if(window.ResizeObserver&&!b._fitRO){b._fitRO=new ResizeObserver(()=>requestAnimationFrame(fitNames));b._fitRO.observe(b)}
  if(document.fonts&&!b._fitFonts){b._fitFonts=1;document.fonts.ready.then(()=>requestAnimationFrame(fitNames))}
  if(!document.getElementById('boardHelp')){const help=document.createElement('p');help.id='boardHelp';help.className='board-help';help.textContent='Sentuh mana-mana stesen untuk lihat nama penuh, harga dan sewa.';b.parentElement.insertAdjacentElement('afterend',help)}
  b.addEventListener('click',e=>{const sq=e.target.closest('.sq');
    if(sq&&zPan.moved<7)showDeed(+sq.dataset.i)});   /* seretan bukan ketukan */
  b.addEventListener('keydown',e=>{const sq=e.target.closest('.sq');if(sq&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showDeed(+sq.dataset.i)}});
}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const pipHTML=v=>[...Array(9)].map((_,j)=>`<i class="${PIPS[v].includes(j)?'on':''}"></i>`).join('');
const dieHTML=k=>`<div class="die" id="d${k}"><div class="cube">${
  [1,2,3,4,5,6].map(v=>`<div class="face f${v}">${pipHTML(v)}</div>`).join('')}</div></div>`;
/* Putaran yang membawa setiap muka ke hadapan. */
const FACE_TO_FRONT={1:'',6:'rotateY(180deg)',3:'rotateY(-90deg)',
  4:'rotateY(90deg)',5:'rotateX(-90deg)',2:'rotateX(90deg)'};
/* Pusingan terkumpul: sentiasa bertambah supaya dadu berguling ke hadapan
   setiap kali, tidak pernah berpusing balik. */
const dieSpin=[{x:0,y:0},{x:0,y:0}];
function renderDice(spin){
  S.dice.forEach((v,k)=>{
    const d=document.getElementById('d'+k),cube=d&&d.querySelector('.cube');
    if(!cube)return;
    if(spin){const t=dieSpin[k];t.x+=1+Math.floor(Math.random()*2);t.y+=2+Math.floor(Math.random()*2)}
    const t=dieSpin[k];
    /* Pusingan penuh tidak mengubah orientasi akhir, hanya memberi gulingan. */
    cube.style.transform=`rotateX(${t.x*360}deg) rotateY(${t.y*360}deg) ${FACE_TO_FRONT[v]||''}`;
  })}
let rollTimer=null;
function rollDiceAnim(){
  const dz=[...document.querySelectorAll('.die')];
  dz.forEach(d=>{d.classList.remove('roll');void d.offsetWidth;d.classList.add('roll')});
  renderDice(true);
  clearTimeout(rollTimer);
  rollTimer=setTimeout(()=>dz.forEach(d=>d.classList.remove('roll')),840);
  doublesFx();
}
function renderBoard(){
  requestAnimationFrame(fitNames); /* petak dimiliki ada bingkai tebal: muat semula nama */
  SQ.forEach((s,i)=>{const el=document.getElementById('sq'+i);
    el.classList.toggle('active-square',S.phase!=='over'&&cur().pos===i);
    el.style.setProperty('--active-color',cur().color);
    el.classList.toggle('mort',!!S.mort[i]);
    const o=S.owner[i];let own=el.querySelector('.own');
    el.classList.toggle('owned',o!==null);
    if(o!==null){const q=S.players[o];if(!own){own=document.createElement('span');own.className='own';el.appendChild(own)}
      own.style.background=q.color;own.textContent=(q.name.trim()[0]||'?').toUpperCase();own.title='Milik '+q.name;el.style.setProperty('--oc',q.color)}
    else{if(own)own.remove();el.style.removeProperty('--oc')}
    const st=el.querySelector('.stripe');if(st){const h=S.houses[i];st.innerHTML=h===5?'<span class="hotel">H</span>':'<span class="house"></span>'.repeat(h)}
    /* Pergerakan mengelilingi papan: petak 0-19 ke kiri, 20-39 ke kanan. */
    const toks=S.players.map((p,k)=>(!p.bankrupt&&p.pos===i)
      ?`<span class="tok ${k===S.turn&&S.phase!=='over'&&S.phase!=='moving'?'me':''} ${i<=19?'flip':''}${lolK.has(k)?' lol':''}" data-k="${k}" style="color:${p.color}" title="${esc(p.name)} · ${tokName(tokOf(k))}">${trainSVG(k)}</span>`:'').join('');
    el.querySelector('.tokens').innerHTML=toks});
  document.getElementById('msg').textContent=S.msg;
  const cs=document.getElementById('cardSlot');
  if(S.card&&cs.dataset.k!==String(S.card.id)&&!cs.dataset.deed&&closedCard!==S.card.id){const pel=S.card.deck==='peluang';
    cs.innerHTML=`<div class="card"><header style="background:${pel?'#EE7A00':'#1F5FAD'}"><span>${pel?'Peluang':'Tabung Komuniti'}</span><button class="x" type="button" aria-label="Tutup">×</button></header><div class="ct">${esc(S.card.text)}</div></div>`;
    cs.dataset.k=String(S.card.id);cs.querySelector('.x').onclick=()=>{closedCard=S.card&&S.card.id;cs.innerHTML='';delete cs.dataset.k}}
  else if(!S.card&&cs.dataset.k&&!cs.dataset.deed){cs.innerHTML='';delete cs.dataset.k}
}
function closeDeed(){document.getElementById('deedBox').hidden=true}
function showDeed(i){
  const s=SQ[i],o=S.owner[i],own=buyable(i);
  const head=s.t==='prop'?GROUPS[s.g].c:s.t==='hub'?'#2B3A47':s.t==='util'?'#3C6E71':'#2B3A47';
  const sub=s.t==='prop'?GROUPS[s.g].n:s.t==='hub'?'Hab pertukaran':s.t==='util'?'Utiliti':'Petak khas';
  document.getElementById('deedHead').style.background=head;
  document.getElementById('deedName').textContent=s.n;
  document.getElementById('deedSub').textContent=sub+(s.p?' · '+fmt(s.p):'');
  const dc=document.getElementById('deedCode');dc.hidden=!CODE[i];dc.textContent=CODE[i]||'';

  /* Nombor yang paling dicari dahulu: berapa saya bayar kalau mendarat di sini. */
  const now=document.getElementById('deedNow');
  if(own&&o!==null&&!S.mort[i]){now.hidden=false;
    now.innerHTML=`<b>Sewa sekarang</b><span>${fmt(rentOf(i))}</span>`}
  else if(own&&o!==null&&S.mort[i]){now.hidden=false;
    now.innerHTML=`<b>Digadai</b><span>Tiada sewa</span>`}
  else if(own){now.hidden=false;
    now.innerHTML=`<b>Harga belian</b><span>${fmt(s.p)}</span>`}
  else now.hidden=true;

  const row=(a,b,hl)=>`<tr class="${hl?'hl':''}"><td>${a}</td><td>${b}</td></tr>`;
  let rows='',note='';
  if(s.t==='prop'){
    const hc=GROUPS[s.g].h,h=S.houses[i],set=o!==null&&hasSet(o,s.g),live=o!==null&&!S.mort[i];
    rows=[['Sewa asas',fmt(s.r[0]),live&&h===0&&!set],
          ['Set penuh, tiada rumah',fmt(s.r[0]*2),live&&h===0&&set],
          ['1 rumah',fmt(s.r[1]),live&&h===1],
          ['2 rumah',fmt(s.r[2]),live&&h===2],
          ['3 rumah',fmt(s.r[3]),live&&h===3],
          ['4 rumah',fmt(s.r[4]),live&&h===4],
          ['Hotel',fmt(s.r[5]),live&&h===5],
          ['Kos rumah (set penuh)',fmt(hc),set],
          ['Kos rumah (tanpa set, maks. 2)',fmt(hc*2),o!==null&&!set],
          ['Nilai gadai',fmt(s.p/2),false]].map(r=>row(...r)).join('');
    note='Memiliki kesemua petak dalam laluan ini menggandakan sewa asas. Tanpa set penuh: maks. 2 rumah pada harga dua kali ganda. Dengan set penuh: sehingga 4 rumah dan hotel pada harga biasa. Pembinaan hanya selepas pusingan pertama.';
  }else if(s.t==='hub'){
    const n=o===null?0:HUBS.filter(j=>S.owner[j]===o).length,live=o!==null&&!S.mort[i];
    rows=[['1 hab',fmt(25),live&&n===1],['2 hab',fmt(50),live&&n===2],
          ['3 hab',fmt(100),live&&n===3],['4 hab',fmt(200),live&&n===4],
          ['Nilai gadai',fmt(100),false]].map(r=>row(...r)).join('');
    note='Sewa berganda setiap kali pemilik menambah satu lagi hab.';
  }else if(s.t==='util'){
    const n=o===null?0:UTILS.filter(j=>S.owner[j]===o).length,live=o!==null&&!S.mort[i];
    rows=[['1 utiliti','4× nilai dadu',live&&n===1],['2 utiliti','10× nilai dadu',live&&n===2],
          ['Nilai gadai',fmt(75),false]].map(r=>row(...r)).join('');
    note='Sewa dikira daripada balingan dadu pemain yang mendarat, bukan jumlah tetap.';
  }else{
    const info={go:'Kutip RM200 setiap kali melepasi petak ini. Setiap lintasan dikira satu pusingan.',
      jail:'Sekadar melawat jika anda mendarat di sini. Pemain yang ditahan mesti bayar RM50, guna Kad Bebas Lokap, atau baling dadu ganda.',
      gojail:'Terus ke Lokap tanpa mengutip RM200.',
      free:'Rehat. Tiada apa-apa berlaku di sini.',
      tax:`Bayar ${fmt(s.a||0)} kepada bank.`,
      peluang:'Cabut satu kad Peluang.',
      tabung:'Cabut satu kad Tabung Komuniti.'}[s.t]||'';
    rows=`<tr><td class="prose" colspan="2">${info}</td></tr>`;
  }
  if(own)rows+=row('<b>Pemilik</b>',o===null?'Bank'
    :`${esc(S.players[o].name)}${S.mort[i]?' · digadai':''}`,false);
  document.getElementById('deedTable').innerHTML=rows;
  document.getElementById('deedNote').textContent=note;
  document.getElementById('deedBox').hidden=false;
}
function lapBar(p){if(!S.qual)return `<span class="chip">Pusingan ${p.laps}</span>`;return `<span class="lap" title="Kelayakan ${Math.min(p.laps,S.qual)}/${S.qual} pusingan">${[...Array(S.qual)].map((_,k)=>`<i class="${k<p.laps?'on':''}"></i>`).join('')}</span><span class="chip">Pusingan ${p.laps}</span>`}
function turnGuidance(){
  const p=cur();
  if(S.phase==='over')return 'Permainan tamat. Lihat keputusan atau main semula.';
  if(tradePending())return 'Menunggu jawapan tawaran daripada '+S.players[S.trade.to].name+'.';
  if(S.phase==='auction')return 'Lelongan sedang berjalan. Ikuti arahan dalam panel lelongan.';
  if(p.bot||(NET&&afkSeat===S.turn))return p.name+' sedang bermain secara automatik.';
  if(NET&&!isActor())return 'Menunggu '+p.name+'. Anda boleh sentuh stesen untuk semak butirannya.';
  if(p.cash<0)return 'Jual bangunan atau gadai hartanah untuk pulihkan baki anda.';
  if(S.phase==='moving'||busy)return 'Token sedang bergerak. Tunggu sehingga tiba.';
  if(S.phase==='buy')return SQ[p.pos].n+' · '+(p.cash<SQ[p.pos].p?'Baki tidak mencukupi. Tekan Lepaskan.':'Pilih Beli '+fmt(SQ[p.pos].p)+' atau Lepaskan.');
  if(S.phase==='end')return 'Selesai? Tekan Tamat giliran untuk pemain seterusnya.';
  if(p.inJail)return 'Pilih cuba dadu ganda, bayar RM50 atau guna Kad Bebas.';
  return S.doubles?'Dadu ganda! Tekan Baling lagi.':'Tekan Baling dadu untuk bergerak.';
}
function turnStageHTML(){
  if(S.phase==='over')return '';
  const active=S.phase==='roll'?0:S.phase==='moving'?1:2;
  const labels=['1 · Baling','2 · Bergerak','3 · Tindakan'];
  return '<div class="turn-stage" aria-label="Kemajuan giliran">'+labels.map((label,i)=>
    '<span'+(i===active?' class="active" aria-current="step"':'')+'>'+label+'</span>').join('')+'</div>';
}
let uxTurnKey=null,uxTurnTimer=0;
function turnArrival(){
  const key=String(S.gid)+':'+S.turn;
  if(key===uxTurnKey)return;
  uxTurnKey=key;
  const el=document.getElementById('turn');
  el.classList.remove('turn-arrival');void el.offsetWidth;el.classList.add('turn-arrival');
  clearTimeout(uxTurnTimer);uxTurnTimer=setTimeout(()=>el.classList.remove('turn-arrival'),500);
}
function renderSide(){
  const p=cur();const t=document.getElementById('turn');
  let acts='',note='';const neg=p.cash<0;
  if(S.phase==='over'){acts=`<button class="btn primary" type="button" data-a="again">Main semula</button>`}
  else if(neg){note=`<div class="note warn">Baki negatif (${fmt(p.cash)}). Jual rumah atau gadai hartanah di bawah, atau isytihar muflis.</div>`;
    acts=`<button class="btn danger" type="button" data-a="bankrupt">Isytihar muflis</button>`}
  else if(S.phase==='roll'){
    if(p.inJail){acts=`<button class="btn primary" type="button" data-a="roll">Cuba dadu ganda</button><button class="btn" type="button" data-a="bail" ${p.cash<50?'disabled':''}>Bayar RM50</button>${p.cards?`<button class="btn" type="button" data-a="card">Guna Kad Bebas (${p.cards})</button>`:''}`;note=`<div class="note keep">Di Lokap · cubaan ${p.jailTurns}/3 · bayar RM50 untuk terus keluar</div>`}
    else{acts=`<button class="btn primary" type="button" data-a="roll">${S.doubles?'Baling lagi':'Baling dadu'}</button>`;
      if(S.doubles>=2)note=`<div class="note warn keep">Ganda 2/3 · ganda sekali lagi = masuk Lokap!</div>`;
      else if(S.doubles===1)note=`<div class="note keep">Ganda 1/3 · baling lagi</div>`}}
  else if(S.phase==='buy'){const s=SQ[p.pos];acts=`<button class="btn primary" type="button" data-a="buy" ${p.cash<s.p?'disabled':''}>${p.cash<s.p?'Wang tak cukup':'Beli '+fmt(s.p)}</button><button class="btn" type="button" data-a="pass">Lepaskan</button>`}
  else if(S.phase==='end')acts=`<button class="btn primary" type="button" data-a="end">Tamat giliran</button>`;
  else if(S.phase==='auction')acts=`<button class="btn" type="button" disabled>Lelongan berjalan…</button>`;
  else acts=`<button class="btn primary" type="button" disabled>Bergerak…</button>`;
  if(tradePending()){
    const t=S.trade;
    note=`<div class="note">Tawaran ${esc(S.players[t.from].name)} → ${esc(S.players[t.to].name)} sedang menunggu jawapan.</div>`;
    acts=`<button class="btn" type="button" disabled>Tawaran sedang berjalan…</button>`;
  }else if(!p.bot&&!neg&&(S.phase==='roll'||S.phase==='end')&&isActor()
     &&S.players.filter(q=>!q.bankrupt).length>1)
    acts+=`<button class="btn" type="button" data-a="trade">Tawaran</button>`;
  if(NET&&S.phase!=='over'&&!isActor()){const on=isOnline(p.uid);
    note=`<div class="note">${on?'':'<span class="chip bad">Luar talian</span> '}Menunggu ${esc(p.name)} bermain…</div>`;
    acts=NET.host?`<button class="btn" type="button" data-a="takeover">Ambil alih giliran ini</button>`:''}
  if(NET&&S.phase==='over'&&!NET.host)acts='';
  if(NET&&S.phase!=='over'&&afkSeat>=0&&S.players[afkSeat]&&!S.players[afkSeat].bot){
    note=`<div class="note warn">⏱ ${esc(S.players[afkSeat].name)} tiada respons — bot sedang ambil alih.</div>`;
    if(afkSeat===S.turn)acts=`<button class="btn" type="button" disabled>Bot bermain untuk ${esc(p.name)}…</button>`}
  if(S.phase!=='over'&&p.bot){
    note=`<div class="note botnote">Bot ${BOT_LEVELS[p.bot].toLowerCase()} sedang berfikir…</div>`;
    acts=`<button class="btn" type="button" disabled>${esc(p.name)} bermain…</button>`}
  t.style.setProperty('--turn-color',p.color);
  t.classList.toggle('your-turn',S.phase!=='over'&&!p.bot&&isActor()&&!(NET&&afkSeat===S.turn));
  const guide=document.getElementById('turnGuide');
  if(guide&&guide.textContent!==turnGuidance())guide.textContent=turnGuidance();
  t.innerHTML=`<div class="turnhead"><span class="avatar" style="background:${p.color};color:${p.color}"><span class="tdot av" style="color:${p.color}">${trainSVG(S.turn)}</span></span><div class="who"><small>${S.phase==='over'?'Permainan tamat':NET&&p.uid===UID?'Giliran anda':p.bot?'Giliran bot':'Giliran sekarang'}</small><b>${esc(p.name)}</b></div><span class="money" style="color:${neg?'var(--bad)':'inherit'}">${fmt(p.cash)}</span></div>${note}${turnStageHTML()}<p class="turn-guide">${esc(turnGuidance())}</p><div class="actions">${acts}</div><div class="afkbar" id="afkClock" hidden></div><div class="note">${p.laps<S.qual?`Kelayakan membeli: ${p.laps}/${S.qual} pusingan. `:''}${S.fast?`<span class="fastnote">⚡ Mod cepat · ronde ${Math.min(S.round||1,S.fastRounds)}/${S.fastRounds}</span>`:S.endLaps?`Tamat apabila semua pemain lengkap ${S.endLaps} pusingan.`:'Tamat apabila hanya seorang pemain tidak muflis.'}</div>`+pstripHTML();
  turnArrival();
  afkPaint();
  document.getElementById('players').innerHTML=S.players.map((q,k)=>{
    const sw=S.owner.map((o,i)=>o===k?`<i style="background:${SQ[i].t==='prop'?GROUPS[SQ[i].g].c:'var(--muted)'}"></i>`:'').join('');
    return `<li class="pl ${k===S.turn&&S.phase!=='over'?'cur':''} ${q.bankrupt?'out':''}">${trainMark(k,q.color)}<span class="nmx">${NET?`<span class="live ${isOnline(q.uid)?'':'off'}" title="${isOnline(q.uid)?'Dalam talian':'Luar talian'}"></span> `:''}${esc(q.name)}${NET&&q.uid===UID?' <span class="chip ok">Anda</span>':''}</span><span class="money" style="${q.cash<0?'color:var(--bad)':''}">${fmt(q.cash)}</span>
    <span class="meta">${q.bot?`<span class="chip">Bot ${BOT_LEVELS[q.bot]}</span>`:''}${lapBar(q)}${q.bankrupt?'<span class="chip bad">Muflis</span>':S.qual&&q.laps>=S.qual?'<span class="chip ok">Boleh beli</span>':''}${q.inJail?'<span class="chip bad">Lokap</span>':''}${q.cards?`<span class="chip">Kad bebas ×${q.cards}</span>`:''}<span class="chip">Nilai ${fmt(netWorth(q))}</span><span class="swatches">${sw}</span></span></li>`}).join('');
  /* Dalam bilik online, tunjukkan hartanah SENDIRI semasa menunggu giliran
     orang lain — barulah pemain boleh merancang, bukan memandang senarai lawan.
     Butang dikunci kerana bukan giliran kita. */
  const seat=NET?mySeat():-1;
  const who=(seat>=0&&seat!==S.turn&&S.players[seat]&&!S.players[seat].bankrupt)?seat:S.turn;
  document.getElementById('propsTitle').textContent=
    who===S.turn?`Hartanah ${p.name}`:'Hartanah anda';
  const mine=S.owner.map((o,i)=>o===who?i:-1).filter(i=>i>=0);
  const lock=busy||S.phase==='moving'||S.phase==='over'||tradePending()||!isActor()||who!==S.turn;
  document.getElementById('props').innerHTML=mine.length?mine.map(i=>{const s=SQ[i];const col=s.t==='prop'?GROUPS[s.g].c:'var(--muted)';
    const h=S.houses[i];const st=S.mort[i]?'Digadai':h===5?'Hotel':h?`${h} rumah`:(s.t==='prop'&&hasSet(who,s.g)?'Set penuh':'');
    const b=s.t==='prop'?`<button class="mini" type="button" data-b="${i}" ${lock||!canBuild(i)?'disabled':''} title="${cur().laps<1&&!S.fast?'Boleh bina selepas pusingan pertama':S.houses[i]>=buildLimit(i)?(buildLimit(i)===5?'Sudah hotel':'Tanpa set penuh: maks. 2 rumah'):'Bina ('+fmt(houseCost(i))+')'}">+🏠</button><button class="mini" type="button" data-s="${i}" ${lock||!canSell(i)?'disabled':''} title="Jual bangunan">−</button>`:'';
    const m=S.mort[i]?`<button class="mini" type="button" data-u="${i}" ${lock||!canUnmort(i)?'disabled':''} title="Tebus ${fmt(unmortCost(i))}">Tebus</button>`:`<button class="mini" type="button" data-m="${i}" ${lock||!canMort(i)?'disabled':''} title="Gadai +${fmt(s.p/2)}">Gadai</button>`;
    return `<li class="pp"><span class="c" style="background:${col}"></span><span class="t"><b>${esc(s.n)}</b><small>Sewa ${fmt(rentOf(i))}${st?' · '+st:''}</small></span>${b}${m}</li>`}).join(''):`<li class="empty">${who===S.turn?'Belum ada hartanah. Mendarat di stesen untuk membeli.':'Anda belum memiliki hartanah.'}</li>`;
  document.getElementById('log').innerHTML=S.log.slice(0,40).map(l=>{const[ic,tx]=logParts(l);
    return `<li><span class="lic" aria-hidden="true">${ic}</span><span>${esc(tx)}</span></li>`}).join('');
}
function renderAuction(){
  const box=document.getElementById('aucBox');
  if(!S||S.phase!=='auction'||!S.auc){box.hidden=true;return}
  box.hidden=false;
  const a=S.auc,s=SQ[a.sq],p=S.players[a.at],min=aucMin();
  document.getElementById('aucWhat').innerHTML=
    `<b>${esc(s.n)}</b>${s.t==='prop'?' · '+esc(GROUPS[s.g].n):s.t==='hub'?' · Hab pertukaran':' · Utiliti'} · harga siar ${fmt(s.p)}`;
  document.getElementById('aucBid').textContent=a.bid?fmt(a.bid):'—';
  document.getElementById('aucHigh').textContent=a.high===null?'Belum ada':S.players[a.high].name;
  const av=document.getElementById('aucAv');
  av.style.background=p.color;av.style.color=p.color;
  av.innerHTML=`<span class="tdot av" style="color:${S.players[a.at].color}">${trainSVG(a.at)}</span>`;
  document.getElementById('aucWho').textContent=p.name;
  document.getElementById('aucCash').textContent=fmt(p.cash);
  const mine=aucMine();
  document.getElementById('aucNote').textContent=
    p.bot?'Bot sedang menilai…':mine?`Bidaan minimum ${fmt(min)}.`:`Menunggu ${p.name} membida…`;
  const dis=k=>p.cash<Math.max(min,a.bid+k)?'disabled':'';
  const rescue=NET&&NET.host&&!mine&&!p.bot&&!isOnline(p.uid)&&S.auc.at!==mySeat()
    ?`<button class="btn danger" type="button" data-bid="0">Lepas bagi pihak ${esc(p.name)}</button>`:'';
  document.getElementById('aucActs').innerHTML=!mine?rescue:
    `<button class="btn primary" type="button" data-bid="10" ${dis(10)}>+RM10</button>
     <button class="btn" type="button" data-bid="50" ${dis(50)}>+RM50</button>
     <button class="btn" type="button" data-bid="100" ${dis(100)}>+RM100</button>
     <button class="btn danger" type="button" data-bid="0">Lepas</button>`;
  document.getElementById('aucSeats').innerHTML=S.players.map((q,k)=>q.bankrupt?'':
    `<li>${trainMark(k,q.color)}<span class="sp">${esc(q.name)}</span>${
      a.high===k?'<span class="chip ok">Tertinggi</span>':''}${
      a.out.includes(k)?'<span class="chip bad">Lepas</span>':k===a.at?'<span class="chip">Membida</span>':''
    }<span class="money">${fmt(q.cash)}</span></li>`).join('')}

function pickRow(i,checked,kind){const s=SQ[i];
  const col=s.t==='prop'?GROUPS[s.g].c:'var(--muted)';
  const st=S.mort[i]?' (digadai)':'';
  return `<li><label><input type="checkbox" data-${kind}="${i}" ${checked?'checked':''}>
    <span class="c" style="background:${col}"></span>
    <span class="t">${esc(s.n)} <s>${fmt(s.p)}${st}</s></span></label></li>`}
function renderTrade(){
  const t=S.trade||draft;if(!t)return;
  const build=t.stage==='build';
  document.getElementById('tradeBuild').hidden=!build;
  document.getElementById('tradeReview').hidden=build;
  const A=S.players[t.from],B=S.players[t.to];
  if(build){
    document.getElementById('tradeTitle').textContent='Buat tawaran';
    const others=S.players.map((p,k)=>k).filter(k=>k!==t.from&&!S.players[k].bankrupt);
    document.getElementById('tradeWith').innerHTML=others.map(k=>
      `<option value="${k}"${k===t.to?' selected':''}>${esc(S.players[k].name)}</option>`).join('');
    const mine=S.owner.map((o,i)=>o===t.from&&tradeable(i)?i:-1).filter(i=>i>=0);
    const theirs=S.owner.map((o,i)=>o===t.to&&tradeable(i)?i:-1).filter(i=>i>=0);
    document.getElementById('tradeGive').innerHTML=mine.length
      ? mine.map(i=>pickRow(i,t.give.includes(i),'give')).join('')
      : '<li class="empty">Tiada hartanah boleh ditawar.</li>';
    document.getElementById('tradeWant').innerHTML=theirs.length
      ? theirs.map(i=>pickRow(i,t.want.includes(i),'want')).join('')
      : '<li class="empty">Pemain itu tiada hartanah boleh ditawar.</li>';
    const ci=document.getElementById('tradeCash');
    if(document.activeElement!==ci)ci.value=t.cash;   /* jangan ganggu semasa menaip */
    const bad=t.cash>A.cash?`Anda hanya ada ${fmt(A.cash)}.`
            :(-t.cash)>B.cash?`${esc(B.name)} hanya ada ${fmt(B.cash)}.`:'';
    document.getElementById('tradeNote').innerHTML=bad
      ? `<span class="warn">${bad}</span>`
      : 'Tunai positif bermakna anda membayar, negatif bermakna anda menerima. Hartanah yang ada bangunan tidak boleh ditawar — jual bangunan dahulu.';
    document.getElementById('tradeSend').disabled=!!bad||(!t.give.length&&!t.want.length&&!t.cash);
  }else{
    document.getElementById('tradeTitle').textContent='Tawaran masuk';
    document.getElementById('tradeFor').innerHTML=`<b>${esc(A.name)}</b> menawarkan kepada <b>${esc(B.name)}</b>:`;
    const list=a=>a.length?a.map(i=>esc(SQ[i].n)).join(', '):'—';
    document.getElementById('tradeSummary').innerHTML=
      `<div class="side"><b>${esc(B.name)} dapat</b>${list(t.give)}${t.cash>0?` + ${fmt(t.cash)} tunai`:''}</div>
       <div class="arrow">⇅</div>
       <div class="side"><b>${esc(A.name)} dapat</b>${list(t.want)}${t.cash<0?` + ${fmt(-t.cash)} tunai`:''}</div>`;
    const me=mySeat();
    /* Siapa yang boleh menjawab: dalam bilik online hanya penerima;
       pada satu peranti, orang yang memegang peranti itu. */
    const mine=NET?me===t.to:!B.bot;
    const proposer=NET&&me===t.from;
    const handOver=!NET&&!B.bot;   /* satu peranti: perlu bertukar tangan */
    document.getElementById('tradeTitle').textContent=mine?'Tawaran masuk':'Tawaran dihantar';
    document.getElementById('tradeWait').textContent=
      handOver?`Serahkan peranti kepada ${B.name}.`
      : mine?''
      : B.bot?`${B.name} sedang menimbang…`
      : `Menunggu jawapan ${B.name}…`;
    document.getElementById('tradeAnswer').hidden=!mine;
    document.getElementById('tradeWithdraw').hidden=!proposer;
  }}
/* Berita dan sambutan set penuh dimainkan apabila keadaan berubah — sama ada
   perubahan itu dibuat di peranti ini atau tiba dari bilik online. Permainan
   yang baru dibuka/disertai hanya direkod, tidak dimainkan semula. */
let seenGid, seenEvent, seenFan, seenLol, seenSay=new Set();
function newsHook(){
  if(!S)return;
  const ek=S.event?S.event.id:null, fk=S.fan?S.fan.id:null, lk=S.lol?S.lol.id:null;
  const sq=Array.isArray(S.say)?S.say:[];
  if(seenGid!==S.gid||seenEvent===undefined){seenGid=S.gid;seenEvent=ek;seenFan=fk;seenLol=lk;seenSay=new Set(sq.map(x=>x.id));pidsIdle();return}
  sq.forEach(x=>{if(!x||seenSay.has(x.id))return;seenSay.add(x.id);if(GAYA.pakcik[x.k])speak(line(x.k,...(x.a||[])),false)});
  if(ek!==seenEvent){seenEvent=ek;
    if(S.event){const e=EVENTS[S.event.k];toast('📰 '+e.t);
      if(!busy){pidsShow('Berita terkini',e.t);pidsHide(3200)}
      gongNext();speak(line('berita',e.t.replace(/×/g,' kali ganda')),false)}
    else{toast('📰 Semua perkhidmatan kembali seperti biasa.')}}
  if(fk!==seenFan){seenFan=fk;if(S.fan)playFanfare(S.fan)}
  if(lk!==seenLol){seenLol=lk;if(S.lol)playLaugh(S.lol)}
  pidsIdle();
}
function playFanfare(f){
  const g=GROUPS[f.g],who=S.players[f.pi];if(!g||!who)return;
  const idx=groupIdx(f.g);
  idx.forEach((i,k)=>{const el=document.getElementById('sq'+i);if(!el)return;
    el.style.setProperty('--gc',g.c);el.classList.remove('won');void el.offsetWidth;el.classList.add('won');
    setTimeout(()=>el.classList.remove('won'),2600);fxLine(i,g.c,k*120)});
  sfx.win();
  pidsShow('Laluan penuh',`${g.n} · ${who.name}`);pidsHide(3600);
  speak(line('fanfare',g.n,who.name),false);
}
/* ---------- lawan masuk Lokap: "HAHAHA!" ----------
   Kucing (atau tren) setiap pemain lain muncul di tengah papan, ketawa dan
   mengejek sekejap, dengan bunyi ketawa yang disintesis (tiada fail audio).
   Ejekan dipilih daripada id acara supaya semua peranti nampak yang sama. */
const LOL_TXT=['HAHAHA!','Padan muka!','Kah kah kah!','Hehehe~','Bye-bye!','Kirim salam Pudu!','Wekkk!','HAHAHA!'];
var lolK=new Set(),lolTimer=null,lolNoise=null;
function lolSeed(id,j){let h=7;for(const c of String(id))h=(h*31+c.charCodeAt(0))>>>0;return (h>>>(j*3))+j*5}
function playLaugh(l){
  const jailed=S.players[l.pi];if(!jailed)return;
  const who=S.players.map((q,k)=>k).filter(k=>k!==l.pi&&!S.players[k].bankrupt).slice(0,4);
  if(!who.length)return;
  setTimeout(()=>{
    const c=document.getElementById('center');if(!c)return;
    c.querySelectorAll('.lolpop').forEach(x=>x.remove());
    const used=new Set();
    const cats=who.map((k,j)=>{let t=lolSeed(l.id,j)%LOL_TXT.length;while(used.has(t)&&used.size<LOL_TXT.length)t=(t+1)%LOL_TXT.length;used.add(t);
      const q=S.players[k];
      return `<div class="lolcat"><span class="bub">${LOL_TXT[t]}</span><span class="av" style="color:${q.color}">${trainSVG(k)}</span><span class="tear l">💧</span><span class="tear r">💧</span><span class="nm2">${esc(q.name)}</span></div>`}).join('');
    const d=document.createElement('div');d.className='lolpop';d.setAttribute('aria-hidden','true');
    d.innerHTML=`<div class="lolhd">🚔 ${esc(jailed.name)} masuk Lokap!</div><div class="lolrow">${cats}</div>`;
    c.appendChild(d);
    lolK=new Set(who);if(S)renderBoard();
    laughSound(who.length);vib([30,40,30,40,30,40,60]);
    clearTimeout(lolTimer);
    lolTimer=setTimeout(()=>{d.classList.add('out');lolK=new Set();if(S)renderBoard();setTimeout(()=>d.remove(),400)},2600);
  },650)}
/* Ketawa kartun: setiap "ha" = desisan pendek (h) + suara gigi gergaji melalui
   dua penapis formant vokal "a". Beberapa suara bertindih = korus kucing. */
function laughSound(n){
  if(!sound)return;
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
    if(!lolNoise){const len=AC.sampleRate*.2|0;lolNoise=AC.createBuffer(1,len,AC.sampleRate);
      const ch=lolNoise.getChannelData(0);for(let i=0;i<len;i++)ch[i]=Math.random()*2-1}
    const out=AC.createGain();out.gain.value=.55/Math.sqrt(n);out.connect(AC.destination);
    const F0=[310,390,255,450],t0=AC.currentTime+.02;
    for(let v=0;v<n;v++){
      const base=F0[v%F0.length],syl=v%2?6:5,gap=v%2?.15:.17;
      for(let i=0;i<syl;i++){
        const t=t0+v*.11+i*gap,last=i===syl-1,dur=last?.3:.12,f=base*(1-i*.035)*(last?.92:1);
        /* "h" */
        const ns=AC.createBufferSource();ns.buffer=lolNoise;
        const nf=AC.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=1.2;
        const ng=AC.createGain();ng.gain.setValueAtTime(.0001,t);ng.gain.linearRampToValueAtTime(.12,t+.015);ng.gain.exponentialRampToValueAtTime(.0001,t+.05);
        ns.connect(nf).connect(ng).connect(out);ns.start(t);ns.stop(t+.06);
        /* "a" */
        const o=AC.createOscillator();o.type='sawtooth';
        o.frequency.setValueAtTime(f*1.08,t+.03);o.frequency.exponentialRampToValueAtTime(f*(last?.7:.9),t+.03+dur);
        const g=AC.createGain();g.gain.setValueAtTime(.0001,t+.03);g.gain.linearRampToValueAtTime(.22,t+.05);
        g.gain.setValueAtTime(.2,t+.03+dur*.6);g.gain.exponentialRampToValueAtTime(.0001,t+.03+dur);
        const f1=AC.createBiquadFilter();f1.type='bandpass';f1.frequency.value=820;f1.Q.value=4;
        const f2=AC.createBiquadFilter();f2.type='bandpass';f2.frequency.value=1250;f2.Q.value=5;
        const g2=AC.createGain();g2.gain.value=.6;
        o.connect(f1).connect(g);o.connect(f2).connect(g2).connect(g);g.connect(out);
        o.start(t+.03);o.stop(t+.05+dur)}}
  }catch(e){}}
function trackMin(){if(!S||S.phase==='over')return;S.players.forEach((q,k)=>{if(!q.bankrupt){const t=stt(k);if(q.cash<t.min)t.min=q.cash}})}
/* Jalur pemain dalam dok telefon: semua baki sekali pandang, tanpa skrol ke
   panel Pemain. Disembunyikan di skrin besar kerana panel Pemain sudah kelihatan. */
function pstripHTML(){
  return `<div class="pstrip">${S.players.map((q,k)=>`<span class="pc${k===S.turn&&S.phase!=='over'?' cur':''}${q.bankrupt?' out':''}" data-k="${k}">${trainMark(k,q.color)}<b>${esc(q.name.length>9?q.name.slice(0,8)+'…':q.name)}</b><span class="money">${fmt(q.cash)}</span></span>`).join('')}</div>`}
/* Angka wang terapung: setiap perubahan baki (dari mana-mana punca, termasuk
   bilik online) muncul sebagai "+RM200" / "−RM150" di atas token pemain itu.
   Permainan yang baru dibuka hanya direkod, tidak dimainkan. */
let lastCash=null,lastCashGid;
/* Kesan visual yang dikesan daripada perubahan keadaan, jadi ia berfungsi
   sama ada tindakan dibuat oleh anda, bot, atau pemain lain dalam bilik online. */
let lastOwn=null,lastOwnGid;
function ownHook(){
  if(!S)return;const now=S.owner.slice();
  if(!lastOwn||lastOwnGid!==S.gid){lastOwn=now;lastOwnGid=S.gid;return}
  const fresh=now.map((o,i)=>o!=null&&lastOwn[i]==null?i:-1).filter(i=>i>=0);
  lastOwn=now;
  if(fresh.length&&fresh.length<=2)fresh.forEach(i=>stampTile(i,S.players[now[i]]))}
function stampTile(i,p){
  const sq=document.getElementById('sq'+i),col=(p&&p.color)||'var(--accent)';
  if(sq){sq.style.setProperty('--sc',col);sq.classList.remove('justbought');void sq.offsetWidth;sq.classList.add('justbought');
    setTimeout(()=>sq.classList.remove('justbought'),1300)}
  if(RM)return;const a=fxAt(i);if(!a)return;
  const el=document.createElement('div');el.className='stamp';el.textContent='Dibeli';
  el.style.left=a.x+'px';el.style.top=a.y+'px';el.style.setProperty('--sc',col);
  document.body.appendChild(el);setTimeout(()=>el.remove(),1700)}
/* Dipanggil oleh rollDiceAnim (balingan sendiri dan balingan pemain lain online). */
let dblTimer=0;
function doublesFx(){
  if(!S||S.dice[0]!==S.dice[1])return;
  clearTimeout(dblTimer);
  dblTimer=setTimeout(()=>{
    document.querySelectorAll('.die').forEach(d=>{d.classList.add('dbl');setTimeout(()=>d.classList.remove('dbl'),1400)});
    if(RM)return;const c=document.getElementById('center');if(!c)return;
    c.querySelectorAll('.dblpop').forEach(x=>x.remove());
    const el=document.createElement('div');el.className='dblpop';el.textContent='GANDA!';
    c.appendChild(el);setTimeout(()=>el.remove(),1400)},760)}

function moneyHook(){
  if(!S)return;const now=S.players.map(q=>q.cash);
  if(!lastCash||lastCashGid!==S.gid||lastCash.length!==now.length){lastCash=now;lastCashGid=S.gid;return}
  const bySq={};
  now.forEach((c,k)=>{const d=Math.round(c-lastCash[k]);if(!d)return;
    const q=S.players[k],n=(bySq[q.pos]=(bySq[q.pos]||0)+1)-1;
    floatMoney(q.pos,d,n,q.color);
    if(k===S.turn){
      const panel=document.getElementById('turn');
      const feedback=document.createElement('p');feedback.className='turn-feedback';
      feedback.setAttribute('role','status');
      feedback.textContent=(d>0?'Diterima +':'Dibayar −')+fmt(Math.abs(d));
      panel.querySelectorAll('.turn-feedback').forEach(el=>el.remove());
      panel.appendChild(feedback);setTimeout(()=>feedback.remove(),2400);
    }
    const chip=document.querySelector(`.pstrip [data-k="${k}"]`);
    if(chip){chip.classList.remove('up','down');void chip.offsetWidth;chip.classList.add(d>0?'up':'down')}});
  lastCash=now}
function floatMoney(i,d,n,col){
  if(RM)return;const a=fxAt(i);if(!a)return;
  const el=document.createElement('div');el.className='mfloat '+(d>0?'pos':'neg');
  el.textContent=(d>0?'+':'−')+'RM'+Math.abs(d).toLocaleString('en-MY');
  el.style.left=a.x+'px';el.style.top=(a.y-a.h*.3-n*22)+'px';el.style.setProperty('--pc',col||'#000');
  document.body.appendChild(el);setTimeout(()=>el.remove(),1500)}
/* Skrin tidak padam semasa permainan berjalan (menunggu giliran kawan). */
let wakeLock=null;
async function keepAwake(){
  try{const want=S&&S.started&&S.phase!=='over'&&document.visibilityState==='visible';
    if(want&&!wakeLock&&navigator.wakeLock){wakeLock=await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release',()=>{wakeLock=null})}
    else if(!want&&wakeLock){wakeLock.release();wakeLock=null}}catch(e){wakeLock=null}}
document.addEventListener('visibilitychange',keepAwake);
function renderAll(){trackMin();renderBoard();renderDice();renderSide();renderMissions();renderAuction();newsHook();achHook();moneyHook();ownHook();keepAwake();
  const t=S&&(S.trade||draft);
  /* Dalam bilik online, hanya dua pihak yang terlibat melihat tetingkap ini. */
  const forMe=t&&(!NET||t.stage==='build'||mySeat()===t.from||mySeat()===t.to);
  if(forMe){renderTrade();document.getElementById('tradeBox').hidden=false}
  else document.getElementById('tradeBox').hidden=true;
  sync();scheduleBot()}

/* ---------- zum & geser papan ---------- */
const ZMIN=1,ZMAX=3.2;
const zoom={z:1,x:0,y:0};
const zPan={pts:new Map(),pan:null,pinch:null,moved:0};
const $bv=()=>document.getElementById('boardview');
function applyZoom(){
  const v=$bv();if(!v)return;
  const b=document.getElementById('board'),w=v.clientWidth,h=v.clientHeight;
  zoom.z=Math.min(ZMAX,Math.max(ZMIN,zoom.z));
  /* jangan biarkan papan terapung keluar dari bingkai */
  zoom.x=Math.min(0,Math.max(w*(1-zoom.z),zoom.x));
  zoom.y=Math.min(0,Math.max(h*(1-zoom.z),zoom.y));
  b.style.transform=`translate(${zoom.x}px,${zoom.y}px) scale(${zoom.z})`;
  document.getElementById('zlvl').textContent=Math.round(zoom.z*100)+'%';
  v.classList.toggle('grab',zoom.z>1);
  /* pada telefon, halaman masih boleh diskrol selagi papan tidak dizum */
  v.style.touchAction=zoom.z>1?'none':'pan-y';
  const q=s=>document.querySelector('#zoomctl [data-z="'+s+'"]');
  q('in').disabled=zoom.z>=ZMAX-1e-3;
  q('out').disabled=q('reset').disabled=zoom.z<=ZMIN+1e-3;
}
function zoomAt(cx,cy,nz){          /* kekalkan titik di bawah jari pada tempatnya */
  const old=zoom.z;nz=Math.min(ZMAX,Math.max(ZMIN,nz));
  if(nz===old)return;
  zoom.x=cx-(cx-zoom.x)*(nz/old);zoom.y=cy-(cy-zoom.y)*(nz/old);
  zoom.z=nz;applyZoom();
}
function resetZoom(){zoom.z=1;zoom.x=0;zoom.y=0;applyZoom()}
/* Bawa satu titik papan (koordinat tanpa zum) ke tengah bingkai. */
function centerOn(bx,by,nz){
  const v=$bv();zoom.z=Math.min(ZMAX,Math.max(ZMIN,nz));
  zoom.x=v.clientWidth/2-bx*zoom.z;zoom.y=v.clientHeight/2-by*zoom.z;applyZoom()}
/* Zum pertama pergi ke petak pemain semasa, bukan ke logo di tengah. */
function zoomToMe(nz){
  const el=S&&S.players[S.turn]?document.getElementById('sq'+S.players[S.turn].pos):null;
  if(!el)return false;
  centerOn(el.offsetLeft+el.offsetWidth/2,el.offsetTop+el.offsetHeight/2,nz);
  return true}
function bindZoom(){
  const v=$bv();
  v.addEventListener('pointerdown',e=>{
    if(document.body.classList.contains('v3d'))return;
    zPan.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    zPan.moved=0;
    if(zPan.pts.size===2){
      const [a,b]=[...zPan.pts.values()];
      zPan.pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,z:zoom.z};zPan.pan=null;
      [...zPan.pts.keys()].forEach(id=>{try{v.setPointerCapture(id)}catch(_){}});
    }else if(zoom.z>1){
      zPan.pan={x:e.clientX,y:e.clientY,ox:zoom.x,oy:zoom.y};
      try{v.setPointerCapture(e.pointerId)}catch(_){}
    }
  });
  v.addEventListener('pointermove',e=>{
    if(!zPan.pts.has(e.pointerId))return;
    zPan.pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
    const r=v.getBoundingClientRect();
    if(zPan.pts.size===2&&zPan.pinch){
      const [a,b]=[...zPan.pts.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
      zPan.moved=99;
      zoomAt((a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top,zPan.pinch.z*(d/zPan.pinch.d));
      return;
    }
    if(zPan.pan){
      const dx=e.clientX-zPan.pan.x,dy=e.clientY-zPan.pan.y;
      zPan.moved=Math.max(zPan.moved,Math.hypot(dx,dy));
      zoom.x=zPan.pan.ox+dx;zoom.y=zPan.pan.oy+dy;applyZoom();
      v.classList.add('grabbing');
    }
  });
  const up=e=>{zPan.pts.delete(e.pointerId);
    if(zPan.pts.size<2)zPan.pinch=null;
    if(!zPan.pts.size){zPan.pan=null;v.classList.remove('grabbing')}};
  v.addEventListener('pointerup',up);v.addEventListener('pointercancel',up);
  v.addEventListener('wheel',e=>{
    if(!e.ctrlKey&&!e.metaKey)return;          /* biar skrol biasa lalu */
    e.preventDefault();const r=v.getBoundingClientRect();
    zoomAt(e.clientX-r.left,e.clientY-r.top,zoom.z*(e.deltaY<0?1.15:1/1.15));
  },{passive:false});
  document.getElementById('zoomctl').addEventListener('click',e=>{
    const t=e.target.closest('[data-z]');if(!t||t.disabled)return;
    const cx=v.clientWidth/2,cy=v.clientHeight/2;
    if(t.dataset.z==='in'){
      if(zoom.z<=ZMIN+1e-3&&zoomToMe(1.8))return;   /* zum pertama: cari saya */
      zoomAt(cx,cy,zoom.z*1.5);}
    else if(t.dataset.z==='out')zoomAt(cx,cy,zoom.z/1.5);
    else resetZoom();
  });
  addEventListener('resize',applyZoom);
  applyZoom();
}
