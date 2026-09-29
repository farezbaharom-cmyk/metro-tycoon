/* Metro Tycoon KL — editions.js
   Enjin edisi papan: data KL asal, pendaftaran EDITIONS dan logik menukar edisi. Data Edisi Borneo ada dalam borneo.js. Mesti dimuat selepas data.js,
   rules.js dan render.js (ia menyalin data KL dari sana) dan sebelum ui.js.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html.

   Cara ia berfungsi:
   - Susunan petak SAMA untuk semua edisi: jenis petak, harga, sewa, indeks
     hab/utiliti dan kesan kad tidak berubah. Hanya nama, warna laluan, kad,
     berita dan gambar yang bertukar. Jadi peraturan, bot, simpanan dan bilik
     online berfungsi tanpa perubahan.
   - Edisi disimpan dalam S.ed ('kl' atau 'borneo'). Keadaan lama tanpa S.ed
     dianggap 'kl'. renderAll() memanggil ensureEd() supaya papan sentiasa
     ikut edisi permainan (termasuk bilik online dan simpanan).
   - Pilihan edisi pemain (untuk permainan baharu) disimpan di localStorage. */

/* ---------- salinan edisi KL ---------- */
const PEL_FX=PELUANG.map(c=>c[1]), TAB_FX=TABUNG.map(c=>c[1]);
const klSkyline=skylineSVG;
const BASE_MISI=MISI.slice();
/* Laluan berbeza yang ada sekurang-kurangnya satu stesen milik pemain k. */
const linesOwned=k=>new Set(SQ.map((s,i)=>s.t==='prop'&&S.owner[i]===k?s.g:null).filter(g=>g!==null));
const ED_KL={id:'kl',label:'Edisi KL',emoji:'🏙️',icon:'city',blurb:'Lembah Klang · MRT, LRT, Monorel',title:'Metro Tycoon KL',
  logo:'Metro<br><span>Tycoon</span> KL',sub:'Edisi Lembah Klang',
  home:'Metro <span>Tycoon</span> KL',tag:'Permainan hartanah laluan transit Lembah Klang.',
  sq:SQ,groups:GROUPS,code:CODE,corner:CORNER,short:SHORT,syl:SHORT_SYL,events:EVENTS,
  pel:PELUANG.map(c=>c[0]),tab:TABUNG.map(c=>c[0]),sky:klSkyline,
  card:{peluang:{c:'#EE7A00',ic:'🎟️'},tabung:{c:'#1F5FAD',ic:'🤝'}},trains:TRAINS,
  misi:[{id:'jelajahKL',e:'🚇',t:'Penjelajah Lembah Klang',d:'Miliki stesen di 4 laluan berbeza',r:60,p:k=>[linesOwned(k).size,4]}]};

const EDITIONS={kl:ED_KL};   /* edisi lain didaftar oleh fail masing-masing (cth. borneo.js) */
MISI=BASE_MISI.concat(ED_KL.misi);   /* edisi mula ialah KL */

/* ---------- menukar edisi ---------- */
let curEd='kl';
const edId=id=>EDITIONS[id]?id:'kl';
const edTitle=()=>EDITIONS[curEd].title;
/* Pusat papan dan latar 3D ikut edisi yang sedang dimainkan. */
skylineSVG=gid=>EDITIONS[curEd].sky(gid);
/* Pautan ?edisi=borneo (dari borneo/index.html) memilih edisi untuk permainan baharu,
   kemudian dibuang dari bar alamat supaya tidak melekat bila pautan disalin semula. */
/* (dipanggil dalam initEditions) */
/* Pautan untuk dikongsi: edisi Borneo ada halaman sendiri dengan gambar pratonton Borneo. */
function edShareURL(){const base=location.origin+location.pathname.replace(/[^/]*$/,'');return curEd==='kl'?base:base+curEd+'/'}
/* Nota tiba khas edisi (jika ada), kadang-kadang sahaja supaya nota biasa masih kedengaran. */
function edNota(i){const v=EDITIONS[curEd].say&&EDITIONS[curEd].say[gaya]&&EDITIONS[curEd].say[gaya][i];
  return v&&Math.random()<.7?pk(gaya+':ed:'+i,v):''}
/* Edisi untuk pratonton watak: semasa skrin persediaan/lobi dibuka, ikut edisi
   bilik (online) atau pilihan pemain; selainnya ikut papan yang dimainkan. */
function tokEd(){const su=document.getElementById('setup');
  if(su&&!su.hidden){const r=typeof NET!=='undefined'&&NET&&NET.room;return edId(r&&r.meta&&r.meta.ed||prefEd())}
  return curEd}
function prefEd(){try{return edId(localStorage.getItem('mtkl-ed'))}catch(e){return 'kl'}}
function savePrefEd(id){try{localStorage.setItem('mtkl-ed',edId(id))}catch(e){}}
function applyEdition(id){
  id=edId(id);if(id===curEd)return false;
  const E=EDITIONS[id];curEd=id;
  SQ=E.sq;GROUPS=E.groups;CODE=E.code;CORNER=E.corner;SHORT=E.short;SHORT_SYL=E.syl;EVENTS=E.events;
  PELUANG=E.pel.map((t,i)=>[t,PEL_FX[i]]);TABUNG=E.tab.map((t,i)=>[t,TAB_FX[i]]);
  MISI=BASE_MISI.concat(E.misi||[]);TRAINS=E.trains;
  const b=document.getElementById('board');if(b&&b.childElementCount)buildBoard();
  const bd=document.getElementById('bdrop');if(bd&&bd.firstChild)bd.innerHTML=skylineSVG('skyd');
  edChrome();
  return true}
/* Bar atas dan tajuk tab pelayar. */
function edChrome(){const E=EDITIONS[curEd];
  const br=document.querySelector('.bar .brand');
  if(br)br.innerHTML=`<span class="lines">${[4,3,6,7].map(g=>`<i style="background:${GROUPS[g].c}"></i>`).join('')}</span>${curEd==='kl'?E.title:`<span class="bmetro">Metro </span>${E.title.replace(/^Metro /,'')}`}`;
  document.title=curEd==='kl'?'Metro Tycoon KL Online':E.title}
/* Keadaan permainan menentukan papan; keadaan lama tanpa ed = KL. */
function ensureEd(){if(S)applyEdition(S.ed)}
/* Skrin mula ikut pilihan pemain untuk permainan baharu, bukan permainan
   tersimpan di belakangnya. */
function refreshHome(){const id=prefEd(),E=EDITIONS[id];
  const hs=document.getElementById('homeSky');if(hs){hs.innerHTML=E.sky('skyh');
    /* Jalur di bawah langit ikut warna laluan edisi. */
    hs.style.setProperty('--stripe',`linear-gradient(90deg,${[4,3,6,7].map((g,k)=>`${E.groups[g].c} ${k*25}% ${k*25+25}%`).join(',')})`)}
  const t=document.getElementById('homeTitle');if(t)t.innerHTML=E.home;
  const g=document.getElementById('homeTag');if(g)g.textContent=E.tag;
  document.querySelectorAll('.edpick button').forEach(b=>{const on=b.dataset.ed===id;
    b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false');b.tabIndex=on?0:-1})}
/* Dipanggil sekali oleh start() dalam app.js, selepas SEMUA edisi didaftar. */
function initEditions(){
  (()=>{try{const u=new URL(location.href),e=u.searchParams.get('edisi');if(!e)return;
  if(EDITIONS[e])localStorage.setItem('mtkl-ed',e);
  u.searchParams.delete('edisi');history.replaceState(null,'',u)}catch(x){}})();
  document.querySelectorAll('.edpick').forEach(el=>{
  /* Skrin utama: kad edisi bergambar jalur warna laluan; tempat lain: suis ringkas. */
  el.innerHTML=Object.values(EDITIONS).map(E=>el.classList.contains('edcards')
    ?`<button type="button" class="edcard" role="radio" data-ed="${E.id}" aria-checked="false"><span class="edbar" aria-hidden="true">${[4,3,6,7].map(g=>`<i style="background:${E.groups[g].c}"></i>`).join('')}</span><b>${ico(E.icon,'inl')}${E.label}</b><small>${E.blurb}</small><span class="edtick" aria-hidden="true">✓</span></button>`
    :`<button type="button" role="radio" data-ed="${E.id}" aria-checked="false">${ico(E.icon,'inl')}${E.label}</button>`).join('');
  el.addEventListener('click',e=>{const b=e.target.closest('[data-ed]');if(!b)return;
    savePrefEd(b.dataset.ed);refreshHome();drawNames();
    /* Papan di belakang skrin persediaan hanya contoh (bukan permainan
       tersimpan): tukar terus supaya pemain nampak papan edisi baharu. */
    if(S&&!S.started&&!NET){S.ed=prefEd();renderAll()}})});
  /* Anak panah kiri/kanan/atas/bawah menukar pilihan dalam kumpulan edisi (radiogroup). */
  document.querySelectorAll('.edpick,#edLobby').forEach(el=>el.addEventListener('keydown',e=>{
    const d={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];if(!d)return;
    const bs=[...el.querySelectorAll('[data-ed]')],i=bs.indexOf(document.activeElement);if(i<0)return;
    e.preventDefault();const n=bs[(i+d+bs.length)%bs.length];n.click();
    const again=el.querySelector(`[data-ed="${n.dataset.ed}"]`);if(again)again.focus()}));
}
