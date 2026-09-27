/* Metro Tycoon KL — reaksi.js
   Reaksi langsung dalam bilik online: pemain dan penonton ketik emoji atau
   ayat pendek, dan ia terbang di atas papan pada setiap peranti.
   Setiap orang menulis ke rooms/<kod>/react/<uid> = {e: indeks, t: masa}.
   Peranti lain nampak perubahan melalui pendengar bilik dalam online.js
   (onRoom → reactRoom). Reaksi lama tidak dimainkan semula bila masuk bilik.
   Semua fail js/ berkongsi skop global dan dimuatkan mengikut susunan. */
const REAKSI=[
  {e:'😂'},{e:'🔥'},{e:'😭'},{e:'😱'},{e:'👏'},{e:'💸'},{e:'😡'},{e:'🙏'},
  {e:'😏',t:'Padan muka!'},{e:'🥺',t:'Kesian...'},{e:'⏳',t:'Cepatlah!'},{e:'🤝',t:'Jom deal?'},
  {e:'🤑',t:'Wah kaya!'},{e:'🆘',t:'Tolong la!'},{e:'🎉',t:'GG!'},{e:'🍵',t:'Teh tarik?'}];
const REACT_GAP=900;           /* had kekerapan sendiri (peraturan Firebase: 700ms) */
let reactLane=0,reactSeen=null,reactLast=0,reactWarned=false,reactOpen=false;

/* Siapa nama pengirim: kerusi pemain, atau nama penonton. */
function reactName(uid){
  const r=NET&&NET.room;if(!r)return'Kawan';
  const seat=r.seats&&r.seats[uid];if(seat&&seat.name)return String(seat.name).slice(0,16);
  const on=r.online&&r.online[uid];if(on&&on.w)return String(on.w).slice(0,16)+' 👀';
  return'Penonton'}
/* Warna ikut kerusi dalam permainan (jika ada), supaya mudah dikenal. */
function reactColor(uid){
  if(!S||!S.players)return'#5B6B7A';
  const k=S.players.findIndex(p=>p.uid===uid);return k>=0?S.players[k].color:'#5B6B7A'}

/* Dipanggil oleh onRoom setiap kali bilik berubah. */
function reactRoom(r){
  reactUI();
  const all=(r&&r.react)||{};
  if(reactSeen===null||reactSeen.code!==NET.code){
    reactSeen={code:NET.code,t:{}};
    Object.entries(all).forEach(([u,v])=>{reactSeen.t[u]=v&&v.t||0});return}
  Object.entries(all).forEach(([u,v])=>{
    if(!v||typeof v.t!=='number')return;
    if((reactSeen.t[u]||0)>=v.t)return;reactSeen.t[u]=v.t;
    if(u===UID)return;                     /* sendiri sudah dipaparkan serta-merta */
    if(Date.now()-v.t>15000)return;        /* terlalu lama (peranti tidur) */
    reactFly(v.e,reactName(u),reactColor(u))})}

function sendReact(i){
  if(!NET||!REAKSI[i])return;
  const now=Date.now();if(now-reactLast<REACT_GAP)return;reactLast=now;
  reactFly(i,'Anda',reactColor(UID));
  if(reactSeen)reactSeen.t[UID]=now;
  NET.ref.child('react/'+UID).set({e:i,t:now}).catch(()=>{
    if(reactWarned)return;reactWarned=true;
    toast('Reaksi hanya dilihat anda: hos perlu kemas kini peraturan Firebase (lihat README).')});
  track('reaksi','Reaksi online')}

/* Gelembung reaksi naik dari bawah papan dan pudar. */
function reactFly(i,name,color){
  const x=REAKSI[i];if(!x)return;
  let layer=document.getElementById('reactLayer');
  if(!layer){layer=document.createElement('div');layer.id='reactLayer';layer.className='reactlayer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer)}
  if(layer.children.length>=6)layer.firstChild.remove();
  const bv=document.getElementById('boardview'),r=bv&&bv.getBoundingClientRect();
  const vis=r&&r.width>40&&r.bottom>60&&r.top<innerHeight-60;
  const L=vis?Math.max(8,r.left):8,W=vis?Math.min(r.width,innerWidth-L-8):innerWidth-16;
  const B=vis?Math.min(r.bottom,innerHeight-80):innerHeight-120;
  const el=document.createElement('div');el.className='rfly'+(x.t?' txt':'');
  /* Naik di tepi kiri atau kanan papan (lorong bergilir), supaya stesen dan
     token di tengah tidak tertutup. */
  reactLane=(reactLane+1)%2;
  const edge=Math.min(56,W*.12),x0=reactLane?L+W-edge:L+edge;
  el.style.left=Math.round(x0+(Math.random()-.5)*edge*.6)+'px';
  el.style.setProperty('--dx',Math.round((reactLane?-1:1)*Math.random()*14)+'px');el.style.top=Math.round(B-40)+'px';
  el.style.setProperty('--rc',color);
  el.innerHTML=`<span class="re">${x.e}</span>${x.t?`<span class="rt">${esc(x.t)}</span>`:''}<small>${esc(name)}</small>`;
  layer.appendChild(el);
  /* Jangan terkeluar dari skrin (ayat panjang di tepi). */
  {const w=el.offsetWidth,cx=parseFloat(el.style.left);el.style.left=Math.round(Math.max(8+w/2,Math.min(innerWidth-8-w/2,cx)))+'px'}
  if(sound)beep(660+Math.random()*260,.06,'triangle',.035);
  setTimeout(()=>el.remove(),RM?1600:2700);
  /* Pembaca skrin: umumkan secara ringkas. */
  const sr=document.getElementById('turnGuide');if(sr&&x.t)sr.textContent=`${name}: ${x.t}`}

/* Butang reaksi (di sebelah kawalan zum bawah papan) + dulang pilihan. Hanya dalam bilik online yang sudah bermula. */
function reactUI(){
  let fab=document.getElementById('reactFab');
  const on=!!(NET&&NET.room&&NET.room.meta&&NET.room.meta.started);
  if(!fab){if(!on)return;
    fab=document.createElement('div');fab.id='reactFab';fab.className='reactfab';
    fab.innerHTML=`<div class="rtray" id="reactTray" role="menu" aria-label="Reaksi" hidden>
      <div class="rgrid">${REAKSI.map((x,i)=>x.t?'':`<button type="button" role="menuitem" data-r="${i}" aria-label="${x.e}">${x.e}</button>`).join('')}</div>
      <div class="rphr">${REAKSI.map((x,i)=>x.t?`<button type="button" role="menuitem" data-r="${i}">${x.e} ${esc(x.t)}</button>`:'').join('')}</div></div>
      <button type="button" class="rbtn" id="reactBtn" aria-expanded="false" aria-controls="reactTray" aria-label="Hantar reaksi">😄</button>`;
    (document.getElementById('zoomctl')||document.body).appendChild(fab);
    fab.addEventListener('click',e=>{
      const b=e.target.closest('[data-r]');
      if(b){sendReact(+b.dataset.r);reactToggle(false);return}   /* tutup sendiri selepas memilih */
      if(e.target.closest('#reactBtn'))reactToggle()});
    document.addEventListener('pointerdown',e=>{if(reactOpen&&!e.target.closest('#reactFab'))reactToggle(false)});
    document.addEventListener('keydown',e=>{if(reactOpen&&e.key==='Escape'){reactToggle(false);document.getElementById('reactBtn').focus()}})}
  fab.hidden=!on;if(!on)reactToggle(false)}
function reactToggle(v){
  const t=document.getElementById('reactTray'),b=document.getElementById('reactBtn');if(!t)return;
  reactOpen=v===undefined?!reactOpen:!!v;t.hidden=!reactOpen;b.setAttribute('aria-expanded',reactOpen);
  b.classList.toggle('on',reactOpen)}
function reactReset(){reactSeen=null;reactUI()}
