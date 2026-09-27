/* Metro Tycoon KL — borneo.js
   Data Edisi Borneo: laluan, stesen, kad, berita, gambar, suara, kenderaan dan
   misi. Mesti dimuat selepas editions.js (ia guna ED_KL dan mendaftar diri ke
   EDITIONS). Untuk edisi baharu, salin fail ini dan tambah <script> dalam
   index.html serta sw.js. */
/* ---------- Edisi Borneo ----------
   Laluan rel "impian" merentas Sabah dan Sarawak. Keretapi Sabah dan ART
   Kuching memang wujud (atau sedang dibina); yang lain rekaan, dinamakan ikut
   kawasan yang dilaluinya. */
const B_GROUPS=[
 {n:'Keretapi Sabah',c:'#9CCB3B',h:50},{n:'Laluan Hulu Rajang',c:'#1B7F8C',h:50},
 {n:'Laluan Pantai Timur',c:'#8B3A62',h:100},{n:'Laluan Sungai Rajang',c:'#E07A1F',h:100},
 {n:'Laluan Pan Borneo',c:'#C62828',h:150},{n:'Laluan Pantai Utara',c:'#3F51B5',h:150},
 {n:'ART Kuching',c:'#2E7D32',h:200},{n:'Laluan Kinabalu',c:'#F2C200',h:200}];
const B_NAMES={1:'Tenom',3:'Beaufort',5:'Hab Airport KK',6:'Kapit',8:'Belaga',9:'Mukah',
  11:'Tawau',13:'Semporna',14:'Lahad Datu',15:'Hab Sibu Sentral',16:'Sri Aman',18:'Sarikei',19:'Sibu',
  21:'Bintulu',23:'Miri',24:'Limbang',25:'Hab Jeti Labuan',26:'Kudat',27:'Kota Belud',29:'Sandakan',
  31:'Santubong',32:'Satok',34:'Waterfront Kuching',35:'Hab Airport Kuching',37:'Kundasang',39:'Kota Kinabalu'};
/* Kod stesen rekaan (dua huruf laluan + nombor), seperti papan tanda KL. */
const B_CODE={1:'KS08',3:'KS05',6:'HR02',8:'HR05',9:'HR09',11:'PT01',13:'PT04',14:'PT07',
  16:'SR02',18:'SR06',19:'SR09',21:'PB12',23:'PB18',24:'PB21',26:'PU01',27:'PU05',29:'PU11',
  31:'AK01',32:'AK07',34:'AK10',37:'KN04',39:'KN01'};
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
   ${[1,2,3].map(k=>`<circle class="smk s${k}" cx="36" cy="10" r="1.8" opacity="0"/>`).join('')}
   <path class="ca" d="M8 4.5h8M8 4.5l3-3M8 4.5l3 3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`},
 10:{sub:'Kubu Margherita',svg:ED_KL.corner[10].svg},
 20:{sub:'Pantai Tanjung Aru',svg:`<circle cx="49" cy="11" r="5" fill="#F2A93B"/>
   <path d="M20 35q-1.5-12 4-22" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round"/>
   <path d="M24 13q-8-4-14 1q7-2 14-1z"/><path d="M24 13q-2-8-10-9q7 3 10 9z"/><path d="M24 13q6-7 14-5q-8 0-14 5z"/>
   <path d="M24 13q9 0 13 7q-6-5-13-7z"/><path d="M24 13q-9 2-12 9q5-6 12-9z"/>
   <circle class="cu" cx="23" cy="14.8" r="1.4"/><circle class="cu" cx="25.6" cy="14.4" r="1.4"/>
   <path class="wave" d="M30 30q4-2.6 8 0t8 0t8 0t8 0t8 0" stroke="#1F8AC0" stroke-width="1.6" fill="none" stroke-linecap="round"/>
   <path class="wave w2" d="M36 33q4-2 8 0t8 0t8 0t8 0" stroke="#1F8AC0" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".6"/>
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
   5 Hab Airport KK. */
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
    <path class="b1" opacity=".35" d="M305 88l5 12l6-14l4 10l6-6l8 22l12 10l16 30l22 20l6 8V200H305z"/>
    <path fill="#fff" opacity=".42" d="M288 114l6-18l6 8l5-16l5 12l6-14l4 10l6-6l5 13l-6-2l-5 5l-5-6l-6 7l-5-6l-5 8l-6-5l-5 9z"/>`;
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
  /* Kunang-kunang: hanya kelihatan pada waktu malam (tema gelap), lihat CSS. */
  const fireflies=[[30,150],[62,142],[96,156],[128,138],[150,128],[182,146],[250,150],[282,138],[346,150],[380,134],[396,146],[8,162]]
    .map(([x,y],k)=>`<circle class="ff f${k%4}" cx="${x}" cy="${y}" r="1.3"/>`).join('');
  const front=[[112,20,30],[178,16,26],[222,18,30],[240,26,36],[268,22,28],[292,18,34],[312,18,26],[330,26,40],[358,22,30]];
  const pillars=[20,70,120,170,220,270,320,370].map(x=>`<rect class="trk" x="${x}" y="186" width="4" height="14"/>`).join('');
  const train=`<g class="train"><rect class="tbody" x="0" y="173" width="84" height="11" rx="3"/><path class="tnose" d="M84 173h4q6 0 8 11h-12z"/>${[6,20,34,48,62,74].map(x=>`<rect class="twin" x="${x}" y="176" width="8" height="4" rx="1"/>`).join('')}</g>`;
  return `<svg class="sky" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="sg-a" stop-opacity="0"/><stop offset=".45" class="sg-a"/><stop offset="1" class="sg-b"/></linearGradient></defs>
    <rect width="400" height="200" fill="url(#${gid})"/>${stars}
    <circle class="orbg" cx="336" cy="30" r="17"/><circle class="orb" cx="336" cy="30" r="8.5"/>
    ${hills}${kinabalu}${tower}${dun}${longhouse}
    ${front.map(([x,w,h])=>rects('b2',[[x,w,h]])+wins(x,w,h,196)).join('')}
    ${palm(116,46)}${palm(372,52)}${palm(390,40)}${fireflies}
    <rect class="trk" x="0" y="184" width="400" height="3"/>${pillars}${train}</svg>`}
/* Peta Borneo ringkas untuk pusat papan (viewBox 100×100 papan). Pulau
   dilukis di bahagian atas tengah, dengan laluan berwarna antara bandar. */
function borneoMap(){
  const P={kch:[17,45],sto:[14,40],sam:[23,51],sri:[27,44],sib:[31,42],kap:[40,48],bel:[48,44],btu:[40,34],
    mir:[48,28],lim:[55,26],bft:[58,24],ten:[61,31],kk:[63,17],kun:[70,21],kdt:[70,8],kbd:[66,12],
    sdk:[86,22],lhd:[88,31],tws:[83,38],smp:[91,37]};
  const R=[[4,['kch','sri','sib','btu','mir','lim','kk']],[0,['kk','bft','ten']],[7,['kk','kun']],
    [5,['kdt','kbd','kk']],[5,['kdt','sdk']],[2,['sdk','lhd','tws','smp']],[3,['sam','sri','sib']],[1,['sib','kap','bel']],[6,['sto','kch']]];
  const line=(g,ids)=>`<polyline points="${ids.map(k=>P[k].join(',')).join(' ')}" stroke="${GROUPS[g].c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" fill="none" vector-effect="non-scaling-stroke"/>`;
  return `<g transform="translate(6 2) scale(.88 .8)">
    <path class="isle" d="M72 7L80 14L88 21L95 25L92 33L90 37L84 40L80 50L78 63L74 78L70 90L56 93L40 90L28 86L18 78L12 64L10 51L16 43L27 39L38 33L47 27L55 23L61 17L66 11z"/>
    ${R.map(([g,ids])=>line(g,ids)).join('')}
    ${Object.values(P).map(([x,y])=>`<circle class="city" cx="${x}" cy="${y}" r="1.1"/>`).join('')}</g>`}
/* Nota suara khas bila tiba di stesen tertentu (ikut gaya suara). Pakcik
   selitkan sedikit loghat Sabah (bah) dan Sarawak (kitak, kamek). */
const B_SAY={
  pakcik:{1:['Kopi Tenom wangi, nak. Pakcik nak secawan.'],6:['Naik bot ekspres je boleh sampai sini, nak.'],
    13:['Laut biru macam kaca. Kamek pun nak terjun.'],19:['Makan kampua dulu, nak. Sedap tu.'],
    23:['Bandar minyak ni, nak. Ramai orang senang.'],29:['Sepilok dekat sini. Kirim salam kat orang utan.'],
    31:['Gunung Santubong tu, nak. Ada cerita puteri dia.'],32:['Pasar Satok. Beli terung dayak sikit.'],
    34:['Kitak jalan-jalan tepi sungai dulu. Cantik waktu malam.'],37:['Sejuk sini, nak. Pakai baju tebal.','Nampak Kinabalu tu? Cantik, bah.'],
    39:['Kota Kinabalu ni, bah. Sejuk mata tengok laut.','Bandar besar Sabah, bah. Jaga dompet.']},
  slay:{1:['Kopi Tenom, geng. Slay betul.'],13:['Air dia biru gila, filter pun tak perlu.'],19:['Kampua mee, must try, geng!'],
    29:['Orang utan Sepilok comel gila, geng.'],34:['Night walk tepi sungai. Content sampai lebam.'],
    37:['Vibe New Zealand, tapi Malaysia. Slay!'],39:['Sunset Tanjung Aru memang aesthetic, geng.']},
  pengulas:{13:['Pantai timur yang memukau, penonton!'],34:['Tebing Sungai Sarawak! Pemandangan kelas dunia!'],
    37:['Kaki Gunung Kinabalu! Udara sejuk, semangat panas!'],39:['Ibu negeri Sabah! Penonton bersorak!']}};
/* Token "Tren" dalam Edisi Borneo: lima kenderaan Borneo, dibezakan oleh
   bentuk (bukan warna) seperti tren KL. viewBox 28×20, kelas body/win sama. */
const B_TRAINS=[
 /* Bot ekspres sungai */
 '<path class="body" d="M1 11h26l-3 5H4zM6 6h13a3 3 0 0 1 3 3v2H6z"/><path class="win" d="M8 7.5h3v2H8zM12.5 7.5h3v2h-3zM17 7.5h3v2h-3z"/>',
 /* Bas ekspres Pan Borneo */
 '<path class="body" d="M2 4h22a2 2 0 0 1 2 2v9a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><circle class="body" cx="7" cy="16.6" r="2.2"/><circle class="body" cx="20" cy="16.6" r="2.2"/><path class="win" d="M4 6.5h4V10H4zM9.5 6.5h4V10h-4zM15 6.5h4V10h-4zM20.5 6.5H24v5h-3.5z"/>',
 /* Kapal terbang kecil luar bandar */
 '<path class="body" d="M2 10.5C2 9.1 3 8 5 8h15c3 0 6 1.5 7 3.5-1 1.5-4 2.5-7 2.5H5c-2 0-3-1-3-2.5zM11 11l-4 7h3l6-7zM2.6 8.6 1 3h2.6l4 5z"/><path class="win" d="M13 9.4h1.6V11H13zM16 9.4h1.6V11H16zM19 9.4h1.6V11H19z"/>',
 /* Feri ke Labuan */
 '<path class="body" d="M1 12h26l-4 5H5zM5 7h16v5H5zM9 3h9v4H9z"/><path class="win" d="M7 8.5h2v2H7zM11 8.5h2v2h-2zM15 8.5h2v2h-2zM11 4.4h2V6h-2z"/>',
 /* Lokomotif Keretapi Sabah (sama seperti KL) */
 TRAINS[4]];
const ED_BORNEO={id:'borneo',label:'Edisi Borneo',emoji:'🌴',blurb:'Sabah & Sarawak · laluan rel impian',title:'Metro Tycoon Borneo',
  logo:'Metro<br><span>Tycoon</span> Borneo',sub:'Edisi Sabah & Sarawak',
  home:'Metro <span>Tycoon</span> Borneo',tag:'Permainan hartanah laluan rel impian Sabah dan Sarawak.',
  sq:B_SQ,groups:B_GROUPS,code:B_CODE,corner:B_CORNER,short:B_SHORT,syl:B_SYL,events:B_EVENTS,
  pel:B_PEL,tab:B_TAB,sky:borneoSkyline,map:borneoMap,
  card:{peluang:{c:'#D9480F',ic:'🌴'},tabung:{c:'#1B7F8C',ic:'🛶'}},say:B_SAY,trains:B_TRAINS,toks:['b0','b1'],
  /* Laluan Sabah: 0 Keretapi Sabah, 2 Pantai Timur, 5 Pantai Utara, 7 Kinabalu; selebihnya Sarawak. */
  misi:[{id:'jelajahBorneo',e:'🌴',t:'Penjelajah Borneo',d:'Miliki stesen di Sabah dan Sarawak',r:60,
    p:k=>{const g=linesOwned(k);return[([0,2,5,7].some(x=>g.has(x))?1:0)+([1,3,4,6].some(x=>g.has(x))?1:0),2]}}],
  /* Lakaran mercu tanda pada stesen (viewBox 56×48, garisan sahaja). */
  marks:{
    39:['Gunung Kinabalu','M4 43L16 27l5 3 6-13 4 7 4-11 5 9 4-4 12 25H4M22 30l5-4 4 4 5-5'],
    34:['Bangunan DUN Sarawak','M8 43h40M12 43V30h32v13M6 31q22-26 44 0M28 13V6M18 43v-7m10 7v-7m10 7v-7'],
    19:['Tokong Tua Pek Kong','M20 43V11h16v32M16 43h24M17 11l11-6 11 6M16 19h24M16 27h24M16 35h24M26 43v-5h4v5'],
    13:['Perahu Lepa','M4 32h48l-6 8H12zM26 32V8M26 9l14 18H26M26 12L15 27h11M4 44q6-3 12 0t12 0t12 0t12 0']}};
EDITIONS.borneo=ED_BORNEO;
