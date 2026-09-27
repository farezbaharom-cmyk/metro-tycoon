/* Metro Tycoon KL — editions.js
   Edisi papan: Lembah Klang (asal) dan Borneo. Mesti dimuat selepas data.js,
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
const ED_KL={id:'kl',label:'Edisi KL',emoji:'🏙️',title:'Metro Tycoon KL',
  logo:'Metro<br><span>Tycoon</span> KL',sub:'Edisi Lembah Klang',
  home:'Metro <span>Tycoon</span> KL',tag:'Permainan hartanah laluan transit Lembah Klang.',
  sq:SQ,groups:GROUPS,code:CODE,corner:CORNER,short:SHORT,syl:SHORT_SYL,events:EVENTS,
  pel:PELUANG.map(c=>c[0]),tab:TABUNG.map(c=>c[0]),sky:klSkyline};

/* ---------- Edisi Borneo ----------
   Laluan rel "impian" merentas Sabah dan Sarawak. Keretapi Sabah dan ART
   Kuching memang wujud (atau sedang dibina); yang lain rekaan, dinamakan ikut
   kawasan yang dilaluinya. */
const B_GROUPS=[
 {n:'Keretapi Sabah',c:'#9CCB3B',h:50},{n:'Laluan Hulu Rajang',c:'#1B7F8C',h:50},
 {n:'Laluan Pantai Timur',c:'#8B3A62',h:100},{n:'Laluan Sungai Rajang',c:'#E07A1F',h:100},
 {n:'Laluan Pan Borneo',c:'#C62828',h:150},{n:'Laluan Pantai Utara',c:'#3F51B5',h:150},
 {n:'ART Kuching',c:'#2E7D32',h:200},{n:'Laluan Kinabalu',c:'#F2C200',h:200}];
const B_NAMES={1:'Tenom',3:'Beaufort',5:'Hab Lapangan Terbang KK',6:'Kapit',8:'Belaga',9:'Mukah',
  11:'Tawau',13:'Semporna',14:'Lahad Datu',15:'Hab Sibu Sentral',16:'Sri Aman',18:'Sarikei',19:'Sibu',
  21:'Bintulu',23:'Miri',24:'Limbang',25:'Hab Jeti Labuan',26:'Kudat',27:'Kota Belud',29:'Sandakan',
  31:'Santubong',32:'Satok',34:'Waterfront Kuching',35:'Hab Lapangan Terbang Kuching',37:'Kundasang',39:'Kota Kinabalu'};
const B_SQ=ED_KL.sq.map((s,i)=>B_NAMES[i]?{...s,n:B_NAMES[i]}:{...s});
const B_SHORT={1:'Tenom',2:'Tabung',3:'Beau­fort',4:'Cukai',5:'Airport KK',6:'Kapit',7:'Peluang',8:'Belaga',9:'Mukah',
  11:'Tawau',12:'Elektrik',13:'Sem­porna',14:'Lahad Datu',15:'Sibu Sentral',16:'Sri Aman',17:'Tabung',18:'Sarikei',19:'Sibu',
  20:'Parkir',21:'Bintulu',22:'Peluang',23:'Miri',24:'Limbang',25:'Jeti Labuan',26:'Kudat',27:'Kota Belud',28:'Air',29:'Sandakan',
  30:'Ke Lokap',31:'Santu­bong',32:'Satok',33:'Tabung',34:'Water­front',35:'Airport Kuching',36:'Peluang',37:'Kunda­sang',38:'Cukai',39:'KK'};
const B_SYL={...B_SHORT,2:'Ta­bung',7:'Pe­luang',12:'Elek­trik',13:'Sem­por­na',17:'Ta­bung',18:'Sari­kei',
  21:'Bin­tulu',22:'Pe­luang',24:'Lim­bang',29:'Sanda­kan',33:'Ta­bung',36:'Pe­luang'};
/* Petak sudut: rumah panjang (MULA), Kubu Margherita (Lokap — lakaran kubu
   KL sesuai), pantai dan pokok kelapa (Parkir), sekatan jalan (sama). */
const B_CORNER={
 0:{sub:'Rumah Panjang',svg:`<path d="M3 20.5L13 12h38l10 8.5z"/><rect x="6" y="20" width="52" height="9"/>
   ${[10,18,26,34,42,50].map(x=>`<rect class="cut" x="${x}" y="22.2" width="4" height="4.4" rx=".5"/>`).join('')}
   ${[8,17,26,35,44,53].map(x=>`<rect x="${x}" y="29" width="1.8" height="6"/>`).join('')}
   <path d="M58 29l3 6h1.6l-3-6z"/><rect x="2" y="35" width="60" height="2" rx="1"/>
   <path class="ca" d="M8 4.5h8M8 4.5l3-3M8 4.5l3 3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`},
 10:{sub:'Kubu Margherita',svg:ED_KL.corner[10].svg},
 20:{sub:'Pantai Tanjung Aru',svg:`<circle cx="49" cy="11" r="5" fill="#F2A93B"/>
   <path d="M20 35q-1.5-12 4-22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <path d="M24 13q-8-4-14 1q7-2 14-1z"/><path d="M24 13q-2-8-10-9q7 3 10 9z"/><path d="M24 13q6-7 14-5q-8 0-14 5z"/>
   <path d="M24 13q9 0 13 7q-6-5-13-7z"/><path d="M24 13q-9 2-12 9q5-6 12-9z"/>
   <circle class="cu" cx="23" cy="14.8" r="1.4"/><circle class="cu" cx="25.6" cy="14.4" r="1.4"/>
   <path d="M30 30q4-2.6 8 0t8 0t8 0t8 0" stroke="#1F8AC0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   <path d="M2 36q15-4 60 0z"/>`},
 30:ED_KL.corner[30]};
const B_EVENTS=[
 {t:'Musim pelancong! Sewa ART Kuching dan Laluan Kinabalu naik 50%.',gm:{6:1.5,7:1.5}},
 {t:'Jalan Pan Borneo dinaik taraf. Laluan Pan Borneo ditutup — tiada sewa.',gm:{4:0}},
 {t:'Promosi tambang! Lalu MULA dapat RM300.',go:300},
 {t:'Regatta Lepa di Semporna! Sewa Laluan Pantai Timur naik 2×.',gm:{2:2}},
 {t:'Air Sungai Rajang terlalu cetek, bot ekspres tergendala. Tiada sewa Laluan Hulu Rajang.',gm:{1:0}},
 {t:'Musim cuti: pelancong serbu Sepilok. Sewa Laluan Pantai Utara naik 2×.',gm:{5:2}},
 {t:'Musim balik kampung sempena Gawai! Semua hab sesak — sewa hab 2×.',hub:2},
 {t:'Pengecualian cukai! Tiada Cukai Hasil atau Cukai Mewah pusingan ini.',notax:true},
 {t:'Promosi bahan binaan! Rumah dan hotel separuh harga.',build:.5},
 {t:'Keretapi Sabah rosak lagi. Laluan ditutup — tiada sewa.',gm:{0:0}},
 {t:'Pesta Kebudayaan Borneo di Sibu. Sewa Laluan Sungai Rajang naik 50%.',gm:{3:1.5}},
 {t:'Gelombang haba! Semua orang pasang aircond — sewa utiliti 2×.',util:2},
 {t:'Pesta Kopi Tenom! Sewa Keretapi Sabah naik 50%.',gm:{0:1.5}},
 {t:'Waktu puncak di Lapangan Terbang KK! Sewa semua hab naik 50%.',hub:1.5},
 {t:'Pesta muzik hutan hujan di Santubong! Sewa ART Kuching naik 2×.',gm:{6:2}},
 {t:'Ombak besar di pantai timur! Tiada sewa Laluan Pantai Timur pusingan ini.',gm:{2:0}},
 {t:'Industri minyak rancak di Miri dan Bintulu! Sewa Laluan Pan Borneo naik 50%.',gm:{4:1.5}},
 {t:'Pendaki serbu Gunung Kinabalu! Sewa Laluan Kinabalu naik 2×.',gm:{7:2}}];
/* Teks kad sahaja; kesannya dikongsi dengan KL ikut indeks (lihat data.js).
   Destinasi: 39 Kota Kinabalu, 24 Limbang, 29 Sandakan, 34 Waterfront Kuching,
   5 Hab Lapangan Terbang KK. */
const B_PEL=[
 'Maju ke MULA. Kutip RM200.',
 'Tiket kapal terbang promosi! Terbang terus ke Kota Kinabalu.',
 'Urusan tanah di pejabat daerah Limbang. Jika melepasi MULA, kutip RM200.',
 'Feri lewat lagi. Pergi ke hab terdekat. Jika dimiliki, bayar dua kali ganda sewa.',
 'Tukar laluan di hab terdekat. Jika dimiliki, bayar dua kali ganda sewa.',
 'Pasang aircond 24 jam, bil melambung. Pergi ke utiliti terdekat. Jika dimiliki, bayar 10× nilai dadu.',
 'Video anda makan mi kolok di Kuching tular di TikTok. Dapat tajaan RM150!',
 'Cuti umum tambahan sempena Pesta Kaamatan! Semua pemain terima RM50.',
 'Kad Bebas Lokap: ketua kampung kenal keluarga anda. Disimpan sehingga diperlukan.',
 'Jalan berlubang di Pan Borneo, kena lencong. Undur 2 petak.',
 'Bawa durian masuk ke bilik hotel. Kena tahan! Pergi terus ke Lokap. Jangan kutip RM200.',
 'Rumah kena banjir musim tengkujuh. Baik pulih: bayar RM25 setiap rumah, RM100 setiap hotel.',
 'Saman had laju di Lebuhraya Pan Borneo: bayar RM150.',
 'Lawat pusat pemulihan orang utan di Sepilok. Pergi ke Sandakan. Jika melepasi MULA, kutip RM200.',
 'Anda dilantik bendahari majlis Gawai di rumah panjang. Bayar RM50 kepada setiap pemain.',
 'Keretapi Sabah tersadai di Tenom. Anda terlepas satu giliran.',
 'Tertidur dalam bas ekspres, terlajak 3 hentian. Maju 3 petak.',
 'Pesan udang galah besar, baru sedar dompet tertinggal. Bayar RM60.',
 'Nak tengok persembahan air pancut waktu malam. Pergi ke Waterfront Kuching.',
 'Hujan lebat petang. Semua orang bergegas ke Lapangan Terbang KK, anda pun ikut. Jika melepasi MULA, kutip RM200.'];
const B_TAB=[
 'Maju ke MULA. Kutip RM200.',
 'Bank tersilap kira, memihak kepada anda. Terima RM200.',
 'Banjir kilat di Kuching, kereta tenggelam separuh: bayar RM80.',
 'Menang cabutan bertuah Pesta Kaamatan: terima RM100.',
 'Kad Bebas Lokap: pak cik anda seorang peguam di Kota Kinabalu. Disimpan sehingga diperlukan.',
 'Memancing di kawasan larangan taman laut. Pergi terus ke Lokap. Jangan kutip RM200.',
 'Rumah terbuka Hari Gawai! Kutip RM10 daripada setiap pemain.',
 'Jual kek lapis Sarawak online, laku keras: terima RM100.',
 'Dapat angpau Tahun Baru Cina daripada jiran: terima RM20.',
 'Kereta kena saman parkir di Gaya Street: bayar RM50.',
 'Makan kerang basi, sakit perut dua hari. Bil klinik: bayar RM100.',
 'Yuran tuisyen anak: bayar RM50.',
 'Tawar-menawar hebat di Pasar Filipina: jimat RM25.',
 'Cukai taksiran majlis bandaraya: bayar RM40 setiap rumah, RM115 setiap hotel.',
 'Johan pertandingan main sape peringkat kampung: terima RM10.',
 'Warisan daripada nenek di rumah panjang: terima RM100.',
 'Belanja semua orang kopi Tenom. Bayar RM10 kepada setiap pemain.',
 'Feri ke Labuan dibatalkan sebab ombak besar. Anda terlepas satu giliran.',
 'Cuti sekolah! Semua pemain terima RM20.',
 'Menang pertandingan makan buah tarap: terima RM50.'];
/* Siluet langit Borneo (viewBox 400×200, kelas CSS sama dengan KL supaya ikut
   tema siang/malam): rumah panjang bertiang, Bangunan DUN Sarawak berbumbung
   payung, Menara Tun Mustapha dan Gunung Kinabalu, dengan pokok kelapa dan
   Keretapi Sabah yang melintas. Tengah dibiarkan rendah untuk dadu. */
function borneoSkyline(gid){gid=gid||'skyg';
  let seed=11;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;
  const rects=(cls,list)=>list.map(([x,w,h])=>`<rect class="${cls}" x="${x}" y="${200-h}" width="${w}" height="${h}"/>`).join('');
  const wins=(x,w,h,top)=>{let o='';for(let yy=200-h+6;yy<top;yy+=7)for(let xx=x+3;xx<x+w-3;xx+=5)if(rnd()<.45)o+=`<rect class="w" x="${xx}" y="${yy}" width="2" height="3"/>`;return o};
  let stars='';for(let k=0;k<22;k++)stars+=`<circle class="st tw" cx="${(rnd()*400).toFixed(1)}" cy="${(rnd()*70+4).toFixed(1)}" r="${(rnd()*.9+.5).toFixed(2)}"/>`;
  /* Bukit di belakang dan Gunung Kinabalu yang bergerigi di kanan. */
  const hills=`<path class="b0" d="M0 200V150q40-22 90-8t80 2q40-14 70 0V200z"/>`;
  const kinabalu=`<path class="lm" d="M226 200L256 148l14-8l10-22l8-4l6-18l6 8l5-16l5 12l6-14l4 10l6-6l8 22l12 10l16 30l22 20l6 8V200z"/>
    <path class="b1" opacity=".35" d="M299 76l5 12l6-14l4 10l6-6l8 22l12 10l16 30l22 20l6 8V200H300z"/>`;
  /* Menara Tun Mustapha: silinder kaca tinggi. */
  const tower=`<rect class="lm" x="196" y="64" width="16" height="136" rx="3"/><rect class="lm" x="200" y="52" width="8" height="14" rx="2"/><rect class="lm" x="203.3" y="36" width="1.4" height="18"/><circle class="beacon" cx="204" cy="36" r="1.4"/>`;
  /* Bangunan DUN Sarawak: bumbung payung emas. */
  const dun=`<rect class="lm" x="132" y="150" width="40" height="50"/><path class="lm" d="M122 152q30-44 60 0z"/><rect class="lm" x="151.3" y="100" width="1.4" height="12"/><circle class="beacon" cx="152" cy="100" r="1.3"/>`;
  /* Rumah panjang bertiang di kiri. */
  const longhouse=`<path class="lm" d="M8 160l12-10h72l12 10z"/><rect class="lm" x="12" y="160" width="88" height="14"/>
    ${[16,30,44,58,72,86].map(x=>`<rect class="w" x="${x}" y="164" width="5" height="5"/>`).join('')}
    ${[14,26,38,50,62,74,86,97].map(x=>`<rect class="lm" x="${x}" y="174" width="2" height="12"/>`).join('')}`;
  const palm=(x,h)=>`<path class="lmS" stroke-width="2.4" stroke-linecap="round" d="M${x} 200q-2-${h/2} 4-${h}"/>
    <g class="lm" transform="translate(${x+4} ${200-h})"><path d="M0 0q-9-4-15 2q7-2 15-2z"/><path d="M0 0q-3-9-11-10q8 4 11 10z"/><path d="M0 0q7-8 15-5q-9 0-15 5z"/><path d="M0 0q10 0 14 8q-6-6-14-8z"/></g>`;
  const front=[[112,20,30],[178,16,26],[240,26,36],[268,22,28],[330,26,40],[358,22,30]];
  const pillars=[20,70,120,170,220,270,320,370].map(x=>`<rect class="trk" x="${x}" y="186" width="4" height="14"/>`).join('');
  const train=`<g class="train"><rect class="tbody" x="0" y="173" width="84" height="11" rx="3"/><path class="tnose" d="M84 173h4q6 0 8 11h-12z"/>${[6,20,34,48,62,74].map(x=>`<rect class="twin" x="${x}" y="176" width="8" height="4" rx="1"/>`).join('')}</g>`;
  return `<svg class="sky" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sg-a" stop-opacity="0"/><stop offset=".45" class="sg-a"/><stop offset="1" class="sg-b"/></linearGradient></defs>
    <rect width="400" height="200" fill="url(#${gid})"/>${stars}
    <circle class="orbg" cx="356" cy="38" r="17"/><circle class="orb" cx="356" cy="38" r="8.5"/>
    ${hills}${kinabalu}${tower}${dun}${longhouse}
    ${front.map(([x,w,h])=>rects('b2',[[x,w,h]])+wins(x,w,h,196)).join('')}
    ${palm(116,46)}${palm(372,52)}${palm(390,40)}
    <rect class="trk" x="0" y="184" width="400" height="3"/>${pillars}${train}</svg>`}
const ED_BORNEO={id:'borneo',label:'Edisi Borneo',emoji:'🌴',title:'Metro Tycoon Borneo',
  logo:'Metro<br><span>Tycoon</span> Borneo',sub:'Edisi Sabah & Sarawak',
  home:'Metro <span>Tycoon</span> Borneo',tag:'Permainan hartanah laluan rel impian Sabah dan Sarawak.',
  sq:B_SQ,groups:B_GROUPS,code:{},corner:B_CORNER,short:B_SHORT,syl:B_SYL,events:B_EVENTS,
  pel:B_PEL,tab:B_TAB,sky:borneoSkyline};
const EDITIONS={kl:ED_KL,borneo:ED_BORNEO};

/* ---------- menukar edisi ---------- */
let curEd='kl';
const edId=id=>EDITIONS[id]?id:'kl';
const edTitle=()=>EDITIONS[curEd].title;
/* Pusat papan dan latar 3D ikut edisi yang sedang dimainkan. */
skylineSVG=gid=>EDITIONS[curEd].sky(gid);
function prefEd(){try{return edId(localStorage.getItem('mtkl-ed'))}catch(e){return 'kl'}}
function savePrefEd(id){try{localStorage.setItem('mtkl-ed',edId(id))}catch(e){}}
function applyEdition(id){
  id=edId(id);if(id===curEd)return false;
  const E=EDITIONS[id];curEd=id;
  SQ=E.sq;GROUPS=E.groups;CODE=E.code;CORNER=E.corner;SHORT=E.short;SHORT_SYL=E.syl;EVENTS=E.events;
  PELUANG=E.pel.map((t,i)=>[t,PEL_FX[i]]);TABUNG=E.tab.map((t,i)=>[t,TAB_FX[i]]);
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
  const hs=document.getElementById('homeSky');if(hs)hs.innerHTML=E.sky('skyh');
  const t=document.getElementById('homeTitle');if(t)t.innerHTML=E.home;
  const g=document.getElementById('homeTag');if(g)g.textContent=E.tag;
  document.querySelectorAll('.edpick button').forEach(b=>{const on=b.dataset.ed===id;
    b.classList.toggle('on',on);b.setAttribute('aria-checked',on?'true':'false')})}
document.querySelectorAll('.edpick').forEach(el=>{
  el.innerHTML=Object.values(EDITIONS).map(E=>`<button type="button" role="radio" data-ed="${E.id}" aria-checked="false">${E.emoji} ${E.label}</button>`).join('');
  el.addEventListener('click',e=>{const b=e.target.closest('[data-ed]');if(!b)return;
    savePrefEd(b.dataset.ed);refreshHome();
    /* Papan di belakang skrin persediaan hanya contoh (bukan permainan
       tersimpan): tukar terus supaya pemain nampak papan edisi baharu. */
    if(S&&!S.started&&!NET){S.ed=prefEd();renderAll()}})});
