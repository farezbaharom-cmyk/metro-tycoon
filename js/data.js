/* Metro Tycoon KL — data.js
   Data papan, laluan, token, kad, keadaan, statistik, misi dan mod cepat.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------- kiraan pemain (GoatCounter) ----------
   Hanya dimuatkan jika GOATCOUNTER_CODE diisi dalam config.js. Merekod paparan
   laman dan beberapa peristiwa tanpa nama (mod yang dimainkan, permainan tamat,
   kongsi keputusan). Tiada kuki, nama pemain atau data peribadi dihantar.
   Peristiwa sebelum skrip siap dimuat disimpan dahulu, kemudian dihantar. */
const trackQ=[];
function track(name,title){
  if(typeof GOATCOUNTER_CODE==='undefined'||!GOATCOUNTER_CODE)return;
  const ev={path:'ev/'+name,title:title||name,event:true};
  if(window.goatcounter&&window.goatcounter.count){try{window.goatcounter.count(ev)}catch(e){}}
  else if(trackQ.length<30)trackQ.push(ev)}
(()=>{if(typeof GOATCOUNTER_CODE==='undefined'||!GOATCOUNTER_CODE||!/^[a-z0-9-]+$/.test(GOATCOUNTER_CODE))return;
  const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';
  s.dataset.goatcounter=`https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
  /* itch.io memaparkan permainan dalam iframe; tanpa ini GoatCounter tidak mengira. */
  s.dataset.goatcounterSettings=JSON.stringify({allow_frame:true});
  s.onload=()=>{while(trackQ.length){try{window.goatcounter.count(trackQ.shift())}catch(e){}}};
  document.head.appendChild(s)})();
/* Telefon: menegak (≤700px lebar) atau mendatar (rendah dan ≤1000px lebar). */
const PHONE_Q='(max-width:700px),(max-width:1000px) and (max-height:520px) and (orientation:landscape)';
const GROUPS=[
 {n:'Monorel KL',c:'#84BD00',h:50},{n:'KTM Komuter',c:'#1F5FAD',h:50},
 {n:'LRT Sri Petaling',c:'#8C1D40',h:100},{n:'LRT Ampang',c:'#EE7A00',h:100},
 {n:'LRT Kelana Jaya',c:'#D6124F',h:150},{n:'ERL',c:'#6B2D90',h:150},
 {n:'MRT Kajang',c:'#0B8A45',h:200},{n:'MRT Putrajaya',c:'#E8B400',h:200}];
const P=(n,g,p,r)=>({t:'prop',n,g,p,r});
const SQ=[
 {t:'go',n:'Mula',ic:'←'},
 P('Titiwangsa',0,60,[2,10,30,90,160,250]),
 {t:'tabung',n:'Tabung Komuniti',ic:'?'},
 P('Chow Kit',0,60,[4,20,60,180,320,450]),
 {t:'tax',n:'Cukai Hasil',a:200,ic:'RM'},
 {t:'hub',n:'Hab KL Sentral',p:200,ic:'⇄'},
 P('Batu Caves',1,100,[6,30,90,270,400,550]),
 {t:'peluang',n:'Peluang',ic:'!'},
 P('Sentul',1,100,[6,30,90,270,400,550]),
 P('Kepong',1,120,[8,40,100,300,450,600]),
 {t:'jail',n:'Lokap',ic:'▦'},
 P('Bukit Jalil',2,140,[10,50,150,450,625,750]),
 {t:'util',n:'Syarikat Elektrik',p:150,ic:'ϟ'},
 P('Sri Petaling',2,140,[10,50,150,450,625,750]),
 P('Cheras',2,160,[12,60,180,500,700,900]),
 {t:'hub',n:'Hab Masjid Jamek',p:200,ic:'⇄'},
 P('Ampang',3,180,[14,70,200,550,750,950]),
 {t:'tabung',n:'Tabung Komuniti',ic:'?'},
 P('Pandan Indah',3,180,[14,70,200,550,750,950]),
 P('Maluri',3,200,[16,80,220,600,800,1000]),
 {t:'free',n:'Parkir Percuma',ic:'P'},
 P('Subang Jaya',4,220,[18,90,250,700,875,1050]),
 {t:'peluang',n:'Peluang',ic:'!'},
 P('Kelana Jaya',4,220,[18,90,250,700,875,1050]),
 P('Bangsar',4,240,[20,100,300,750,925,1100]),
 {t:'hub',n:'Hab Pasar Seni',p:200,ic:'⇄'},
 P('Salak Tinggi',5,260,[22,110,330,800,975,1150]),
 P('Putrajaya & Cyberjaya',5,260,[22,110,330,800,975,1150]),
 {t:'util',n:'Syarikat Air',p:150,ic:'≈'},
 P('KLIA',5,280,[24,120,360,850,1025,1200]),
 {t:'gojail',n:'Pergi ke Lokap',ic:'↘'},
 P('Mutiara Damansara',6,300,[26,130,390,900,1100,1275]),
 P('Semantan',6,300,[26,130,390,900,1100,1275]),
 {t:'tabung',n:'Tabung Komuniti',ic:'?'},
 P('Bukit Bintang',6,320,[28,150,450,1000,1200,1400]),
 {t:'hub',n:'Hab Bandar Tasik Selatan',p:200,ic:'⇄'},
 {t:'peluang',n:'Peluang',ic:'!'},
 P('Conlay',7,350,[35,175,500,1100,1300,1500]),
 {t:'tax',n:'Cukai Mewah',a:100,ic:'RM'},
 P('Persiaran KLCC',7,400,[50,200,600,1400,1700,2000])];
const HUBS=[5,15,25,35], UTILS=[12,28];
/* Petak sudut bertema KL: lakaran mercu tanda menggantikan ikon.
   Warna asas ikut tinta tema (currentColor); .cut ialah "lubang" berwarna
   petak supaya gerbang dan tingkap kelihatan dalam kedua-dua tema. */
const CORNER={
 0:{sub:'Stesen KL Lama',svg:`<rect x="4" y="22" width="56" height="13" rx="1"/>
   ${[10,17,24,40,47,54].map(x=>`<path class="cut" d="M${x-2.4} 35v-6a2.4 2.4 0 0 1 4.8 0v6z"/>`).join('')}
   ${[[7,5],[32,7],[57,5]].map(([x,h])=>`<rect x="${x-3}" y="${22-h}" width="6" height="${h}"/><path d="M${x-4.2} ${22-h}a4.2 4.6 0 0 1 8.4 0z"/><rect x="${x-.4}" y="${22-h-8.6}" width=".8" height="4.4"/>`).join('')}
   <rect x="27" y="17" width="10" height="5"/><rect x="2" y="35" width="60" height="2" rx="1"/>
   <path class="ca" d="M8 4.5h8M8 4.5l3-3M8 4.5l3 3" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`},
 10:{sub:'Penjara Pudu',svg:`<rect x="3" y="14" width="58" height="22" rx="1"/>
   ${[3,11,19,27,35,43,51,59].map(x=>`<rect x="${x-1}" y="11" width="4" height="4"/>`).join('')}
   <rect x="23" y="6" width="18" height="8"/><path d="M21 6h22l-3-3H24z"/>
   <path class="cut" d="M25 36V24a7 7 0 0 1 14 0v12z"/>
   ${[28,32,36].map(x=>`<rect x="${x-.6}" y="18" width="1.2" height="18"/>`).join('')}
   <rect class="cut" x="8" y="20" width="4" height="5" rx=".6"/><rect class="cut" x="52" y="20" width="4" height="5" rx=".6"/>`},
 20:{sub:'Dataran Merdeka',svg:`<rect x="14" y="26" width="44" height="10"/>
   ${[18,23,28,44,49,54].map(x=>`<path class="cut" d="M${x-1.6} 36v-5a1.6 1.6 0 0 1 3.2 0v5z"/>`).join('')}
   <rect x="31" y="14" width="10" height="22"/><circle class="cut" cx="36" cy="18.5" r="2.6"/>
   <path class="cu" d="M29.6 14a6.4 7.4 0 0 1 12.8 0z"/><rect class="cu" x="35.6" y="2" width=".8" height="5"/>
   <rect x="5.2" y="4" width="1.2" height="32"/>
   <g transform="translate(6.4 4.6)"><rect width="14" height="9" fill="#fff" stroke="rgba(0,0,0,.25)" stroke-width=".4"/>
   ${[0,2,4,6].map(y=>`<rect y="${y*1.125}" width="14" height="1.125" fill="#CC0001"/>`).join('')}<rect width="6.5" height="5" fill="#010066"/>
   <circle cx="2.8" cy="2.5" r="1.5" fill="#FC0"/><circle cx="3.3" cy="2.5" r="1.25" fill="#010066"/><circle cx="5.1" cy="2.5" r=".7" fill="#FC0"/></g>
   <rect x="2" y="36" width="60" height="2" rx="1"/>`},
 30:{sub:'Sekatan Jalan',svg:`<rect x="8" y="12" width="48" height="8" rx="1.5" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width=".5"/>
   ${[0,1,2,3,4,5].map(k=>`<path d="M${10+k*8} 12h4l-4 8h-4z" fill="#D6124F"/>`).join('')}
   <rect x="12" y="20" width="2.4" height="15"/><rect x="49.6" y="20" width="2.4" height="15"/>
   <path d="M9 36h8M46 36h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
   <path d="M28 36l4-14l4 14z" fill="#EE7A00"/><rect x="29.7" y="27" width="4.6" height="2" fill="#fff"/>
   <rect x="25" y="35" width="14" height="2" rx="1"/>
   <circle class="blip b1" cx="16" cy="7" r="2.6" fill="#1F5FAD"/><circle class="blip b2" cx="48" cy="7" r="2.6" fill="#D6124F"/>`}};
const cornerSVG=i=>`<svg class="cill" viewBox="0 0 64 40" aria-hidden="true" fill="currentColor">${CORNER[i].svg}</svg>`;
/* Kod stesen sebenar (papan tanda Rapid KL / KTM / ERL), dipaparkan sebagai
   pil berwarna laluan di petak dan dalam kad hartanah. */
const CODE={1:'MR11',3:'MR10',6:'KC05',8:'KC01',9:'KA06',11:'SP17',13:'SP18',14:'SP12',
  16:'AG18',18:'AG15',19:'AG13',21:'KJ28',23:'KJ24',24:'KJ16',26:'KT4',27:'KT3',29:'KT5',
  31:'KG08',32:'KG14',34:'KG18A',37:'PY22',39:'PY21'};
const COLORS=['#0F766E','#E4572E','#4F46E5','#C98A00','#C2185B'];
/* Lima siluet tren — dibezakan oleh bentuk, bukan warna sahaja, supaya
   pemain yang sukar membezakan warna masih boleh mengenal token sendiri. */
const TRAINS=[
 /* MRT: hidung landai */
 "<path class=\"body\" d=\"M3 5.6h9c6.4 0 11 3.4 12.6 6.6v1.6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.6a1 1 0 0 1 1-1z\"/><circle class=\"body\" cx=\"7.5\" cy=\"16.4\" r=\"2\"/><circle class=\"body\" cx=\"18\" cy=\"16.4\" r=\"2\"/><path class=\"win\" d=\"M14.4 7.6c3.2.5 5.6 2 7 3.9h-7z\"/>",
 /* Monorel: kabin atas rasuk */
 "<path class=\"body\" d=\"M6 2h8a5 5 0 0 1 5 5v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z\"/><path class=\"body\" d=\"M1 14h26a1.4 1.4 0 0 1 1.4 1.4v2.2A1.4 1.4 0 0 1 27 19H1a1.4 1.4 0 0 1-1.4-1.4v-2.2A1.4 1.4 0 0 1 1 14z\"/><rect class=\"win\" x=\"13\" y=\"4.4\" width=\"4.4\" height=\"3.4\" rx=\"1.1\"/>",
 /* Komuter: kotak berpantograf */
 "<path class=\"body\" d=\"M13.5 1 18.4 5.9H8.6z\"/><path class=\"body\" d=\"M2 5.6h22a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z\"/><circle class=\"body\" cx=\"7\" cy=\"16.4\" r=\"2\"/><circle class=\"body\" cx=\"19\" cy=\"16.4\" r=\"2\"/><rect class=\"win\" x=\"18.4\" y=\"7.8\" width=\"4.6\" height=\"3.4\" rx=\"1.1\"/>",
 /* ERL: baji rendah */
 "<path class=\"body\" d=\"M2 7h10l14 5.2v1.6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z\"/><circle class=\"body\" cx=\"7\" cy=\"16.4\" r=\"2\"/><circle class=\"body\" cx=\"18\" cy=\"16.4\" r=\"2\"/><path class=\"win\" d=\"M13.6 8.9 21 11.6h-7.4z\"/>",
 /* Lokomotif: bercerobong, tiga roda */
 "<path class=\"body\" d=\"M18.4 0h4.4a1 1 0 0 1 1 1v5.4h-6.4V1a1 1 0 0 1 1-1z\"/><path class=\"body\" d=\"M2 6.2h22a1 1 0 0 1 1 1v6.6a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V7.2a1 1 0 0 1 1-1z\"/><circle class=\"body\" cx=\"6\" cy=\"16.6\" r=\"2.4\"/><circle class=\"body\" cx=\"13\" cy=\"16.8\" r=\"1.7\"/><circle class=\"body\" cx=\"19.5\" cy=\"16.8\" r=\"1.7\"/><rect class=\"win\" x=\"4.4\" y=\"8.4\" width=\"5\" height=\"3.6\" rx=\"1.1\"/>"];
/* ---------- watak pemain ----------
   Enam pilihan: Tren (siluet ikut kerusi) atau salah satu daripada lima kucing.
   Setiap kucing hanya boleh dipilih oleh seorang pemain; tren boleh dikongsi
   kerana siluetnya berbeza ikut kerusi. Warna sentiasa ikut kerusi pemain.
   Tiada pilihan = kucing ikut kerusi (tingkah laku asal). */
const TOKS=['tren','c0','c1','c2','c3','c4'];
const isTok=t=>TOKS.includes(t);
const defTok=k=>'c'+(k%5);
const tokName=t=>t==='tren'?'Tren':(MetroCats.names[+String(t).slice(1)]||'Kucing');
function tokSVG(t,k){return t==='tren'?`<svg class="train" viewBox="0 0 28 20" aria-hidden="true">${TRAINS[k%TRAINS.length]}</svg>`:MetroCats.svg(+t.slice(1))}
function tokOf(k){const p=S&&S.players&&S.players[k];return p&&isTok(p.tok)?p.tok:defTok(k)}
const trainSVG=k=>tokSVG(tokOf(k),k);
const trainMark=(k,color,cls,t)=>{t=isTok(t)?t:tokOf(k);
  return `<span class="tdot ${cls||''}" style="color:${color||COLORS[k%COLORS.length]}" title="${tokName(t)}">${tokSVG(t,k)}</span>`};
/* Kucing yang bertembung atau tiada pilihan diberi kucing kosong (ikut kerusi dahulu). */
function fixToks(list){
  const used=new Set();
  const keep=list.map(t=>{if(t==='tren')return t;if(isTok(t)&&!used.has(t)){used.add(t);return t}return null});
  return keep.map((t,k)=>{if(t)return t;let c=defTok(k);
    if(used.has(c))c=TOKS.slice(1).find(x=>!used.has(x))||'tren';
    if(c!=='tren')used.add(c);return c})}
function prefTok(){try{const t=localStorage.getItem('mtkl-tok');return isTok(t)?t:null}catch(e){return null}}
function savePrefTok(t){try{localStorage.setItem('mtkl-tok',t)}catch(e){}}
/* Pemilih watak dengan pratonton besar bagi pilihan semasa. */
function tokPicker(sel,k,color,taken,big){
  return `${big?`<div class="tokprev" style="color:${color}"><span class="tpbig">${tokSVG(sel,k)}</span><span><small>Watak anda</small><b>${tokName(sel)}</b></span></div>`:''}
  <div class="tokpick" role="radiogroup" aria-label="Pilih watak">${TOKS.map(t=>{const dis=t!=='tren'&&t!==sel&&taken.has(t);
    return `<button type="button" class="tp${t===sel?' on':''}" role="radio" aria-checked="${t===sel}" data-tok="${t}"${dis?' disabled':''} title="${tokName(t)}${dis?' — sudah dipilih':''}"><span class="tpv" style="color:${color}">${tokSVG(t,k)}</span><small>${tokName(t)}</small></button>`}).join('')}</div>`}
const DEFAULT_NAMES=['Zaiq','Farez','Fifah','Laila','Pemain 5'];
const buyable=i=>['prop','hub','util'].includes(SQ[i].t);

/* ---------- cards ---------- */
/* Kad bertema KL. Susunan boleh berubah, tetapi jangan kurangkan bilangan
   kad: simpanan dan bilik online lama menyimpan nombor indeks kad. */
const PELUANG=[
 ['Maju ke MULA. Kutip RM200.',async p=>advanceTo(p,0)],
 ['Grab surge 3×, tapi tetap naik. Terus ke Persiaran KLCC.',async p=>advanceTo(p,39)],
 ['Mesyuarat di Bangsar yang sepatutnya jadi emel. Jika melepasi MULA, kutip RM200.',async p=>advanceTo(p,24)],
 ['Lif stesen rosak lagi. Pergi ke hab terdekat. Jika dimiliki, bayar dua kali ganda sewa.',async p=>advanceTo(p,nextOf(p.pos,HUBS),{mult:2})],
 ['Tukar laluan di hab terdekat. Jika dimiliki, bayar dua kali ganda sewa.',async p=>advanceTo(p,nextOf(p.pos,HUBS),{mult:2})],
 ['Pasang aircond 24 jam, bil melambung. Pergi ke utiliti terdekat. Jika dimiliki, bayar 10× nilai dadu.',async p=>advanceTo(p,nextOf(p.pos,UTILS),{util10:true})],
 ['Video anda menari di stesen Masjid Jamek tular di TikTok. Dapat tajaan RM150!',async p=>receive(p,150)],
 ['Cuti umum mengejut! Semua pemain terima RM50.',async p=>allGet(p,50)],
 ['Kad Bebas Lokap: abang polis tu rupanya kawan sekolah anda. Disimpan sehingga diperlukan.',async p=>{p.cards++}],
 ['Jem teruk di Jalan Tun Razak. Undur 2 petak.',async p=>{await walkBack(p,2);await land(p)}],
 ['Parkir dalam petak OKU. Kena tahan! Pergi terus ke Lokap. Jangan kutip RM200.',async p=>goJail(p)],
 ['Rumah kena banjir kilat. Baik pulih: bayar RM25 setiap rumah, RM100 setiap hotel.',async p=>repairs(p,25,100)],
 ['Saman AES had laju di MEX: bayar RM150.',async p=>pay(p,150)],
 ['Hantar sepupu ke airport. Naik ERL terus ke KLIA. Jika melepasi MULA, kutip RM200.',async p=>advanceTo(p,29)],
 ['Anda dilantik bendahari kenduri kahwin sepupu. Bayar RM50 kepada setiap pemain.',async p=>eachOther(p,-50)],
 ['LRT tersadai antara stesen. Anda terlepas satu giliran.',async p=>skipTurn(p)],
 ['Tertidur dalam MRT, terlajak 3 stesen. Maju 3 petak.',async p=>{await walk(p,3);await land(p)}],
 ['Makan di Jalan Alor, baru sedar dompet tertinggal. Bayar RM60.',async p=>pay(p,60)],
 ['Pusing Pavilion 40 minit cari parkir. Pergi ke Bukit Bintang.',async p=>advanceTo(p,34)],
 ['Hujan lebat pukul 5 petang. Semua orang lari ke KL Sentral, anda pun ikut. Jika melepasi MULA, kutip RM200.',async p=>advanceTo(p,5)]];
const TABUNG=[
 ['Maju ke MULA. Kutip RM200.',async p=>advanceTo(p,0)],
 ['Bank tersilap kira, memihak kepada anda. Terima RM200.',async p=>receive(p,200)],
 ['Banjir kilat di Masjid Jamek, kereta tenggelam separuh: bayar RM80.',async p=>pay(p,80)],
 ["Menang cabutan bertuah Touch 'n Go eWallet: terima RM100.",async p=>receive(p,100)],
 ['Kad Bebas Lokap: kawan mak anda seorang peguam. Disimpan sehingga diperlukan.',async p=>{p.cards++}],
 ['Tertekan butang kecemasan dalam LRT sebab nak buka pintu. Pergi terus ke Lokap. Jangan kutip RM200.',async p=>goJail(p)],
 ['Rumah terbuka Hari Raya! Kutip duit raya RM10 daripada setiap pemain.',async p=>eachOther(p,10)],
 ['Jual kuih raya online, laku keras: terima RM100.',async p=>receive(p,100)],
 ['Dapat angpau Tahun Baru Cina daripada jiran: terima RM20.',async p=>receive(p,20)],
 ['Kereta kena clamp di Bukit Bintang: bayar RM50.',async p=>pay(p,50)],
 ['Nasi lemak basi, sakit perut dua hari. Bil klinik: bayar RM100.',async p=>pay(p,100)],
 ['Yuran tuisyen anak: bayar RM50.',async p=>pay(p,50)],
 ['Tawar-menawar hebat di Petaling Street: jimat RM25.',async p=>receive(p,25)],
 ['Cukai taksiran DBKL: bayar RM40 setiap rumah, RM115 setiap hotel.',async p=>repairs(p,40,115)],
 ['Johan karaoke kampung dengan lagu Sudirman: terima RM10.',async p=>receive(p,10)],
 ['Warisan daripada pak cik di kampung: terima RM100.',async p=>receive(p,100)],
 ['Belanja semua orang teh tarik di mamak. Bayar RM10 kepada setiap pemain.',async p=>eachOther(p,-10)],
 ['Monorel tersangkut di landasan. Anda terlepas satu giliran.',async p=>skipTurn(p)],
 ['Cuti sekolah! Semua pemain terima RM20.',async p=>allGet(p,20)],
 ['Menang peraduan meneka harga durian Musang King: terima RM50.',async p=>receive(p,50)]];

/* ---------- state ---------- */
let S=null, sound=true, busy=false, closedCard=null;
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
/* ---------- statistik permainan ----------
   Dikumpul sepanjang permainan dalam S.st (ikut indeks pemain) supaya ikut
   disimpan dan diselaraskan online. Permainan lama tanpa S.st dilayan. */
const newStat=c=>({sewaIn:0,sewaOut:0,lokap:0,mula:0,beli:0,bina:0,ganda:0,kad:0,rosak:0,lelong:0,tawar:0,along:0,min:c});
function stt(pi){if(!S.st)S.st=[];if(!S.st[pi])S.st[pi]=newStat(S.players[pi]?S.players[pi].cash:0);return S.st[pi]}
/* ---------- misi ----------
   Sembilan misi kecil setiap permainan, sama untuk semua pemain. Setiap misi
   hanya boleh disiapkan sekali oleh setiap pemain dan memberi ganjaran tunai.
   Semakan dibuat oleh peranti yang sedang bertindak (dalam sync), supaya
   dalam bilik online ganjaran hanya diberi sekali lalu diselaraskan.
   p(k) → [kemajuan, sasaran]. */
const MISI=[
 {id:'beli3', e:'🏠',t:'Pengumpul Stesen',d:'Beli 3 stesen',r:50, p:k=>[stt(k).beli,3]},
 {id:'laluan',e:'🛤️',t:'Pengumpul Laluan',d:'Lengkapkan satu laluan',r:100,p:k=>[GROUPS.some((g,gi)=>hasSet(k,gi))?1:0,1]},
 {id:'hotel', e:'🏨',t:'Hotel Pertama',   d:'Bina hotel pertama',r:100,p:k=>[S.houses.some((h,i)=>h===5&&S.owner[i]===k)?1:0,1]},
 {id:'bina3', e:'🔨',t:'Kontraktor Muda', d:'Bina 3 kali',r:50, p:k=>[stt(k).bina,3]},
 {id:'lelong',e:'⚖️',t:'Pemenang Lelong', d:'Menang satu lelongan',r:30, p:k=>[stt(k).lelong||0,1]},
 {id:'hab2',  e:'⇄', t:'Raja Hab',        d:'Miliki 2 hab',r:50, p:k=>[HUBS.filter(j=>S.owner[j]===k).length,2]},
 {id:'mula3', e:'🔄',t:'Pengembara',      d:'Lalu MULA 3 kali',r:50, p:k=>[stt(k).mula,3]},
 {id:'sewa300',e:'💸',t:'Tuan Sewa',      d:'Kutip RM300 sewa',r:50, p:k=>[stt(k).sewaIn,300]},
 {id:'tawar', e:'🤝',t:'Peniaga',         d:'Berjaya buat satu tawaran',r:30, p:k=>[stt(k).tawar||0,1]}];
function missDone(k){if(!S.miss)S.miss=[];if(!S.miss[k])S.miss[k]={};return S.miss[k]}
function checkMissions(){
  if(!S||S.phase==='over'||!S.started)return false;let any=false;
  S.players.forEach((q,k)=>{if(q.bankrupt)return;const done=missDone(k);
    MISI.forEach(m=>{if(done[m.id])return;const [c,t]=m.p(k);if(c<t)return;
      done[m.id]=1;q.cash+=m.r;any=true;
      addLog(`🏆 ${q.name} siapkan misi ${m.t} (${m.d}) +${fmt(m.r)}.`);
      S.achLog=(S.achLog||[]).concat({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),k,m:m.id}).slice(-8)})});
  return any}
/* Popup misi dimainkan pada setiap peranti apabila entri baharu muncul dalam
   S.achLog. Permainan yang baru dibuka hanya merekod, tidak mengulang. */
let seenAch=null,seenAchGid,achQ=[],achBusy=false;
function achHook(){
  if(!S)return;const log=S.achLog||[];
  if(seenAch===null||seenAchGid!==S.gid){seenAch=new Set(log.map(a=>a.id));seenAchGid=S.gid;return}
  log.forEach(a=>{if(!seenAch.has(a.id)){seenAch.add(a.id);achQ.push(a)}});
  if(!achBusy)achNext()}
function achNext(){
  if(!achQ.length){achBusy=false;return}achBusy=true;
  /* Tunggu tetingkap (kad stesen, lelongan, tawaran…) ditutup dahulu supaya pop
     tidak menutupnya. Selepas permainan tamat, pop yang tertangguh dibuang. */
  if(S&&S.phase==='over'){achQ.length=0;achBusy=false;return}
  if(document.querySelector('.overlay:not([hidden])')){setTimeout(achNext,600);return}
  const a=achQ.shift();
  const m=MISI.find(x=>x.id===a.m),q=S.players[a.k];if(!m||!q){achNext();return}
  const el=document.createElement('div');el.className='achpop';el.setAttribute('role','status');
  el.innerHTML=`<span class="ae">${m.e}</span><span class="at"><small>Misi selesai · ${esc(q.name)}</small><b>${esc(m.t)}</b></span><span class="ar money">+${fmt(m.r)}</span>`;
  document.body.appendChild(el);
  beep(784,.09,'triangle',.05);beep(1047,.12,'triangle',.05,.09);beep(1319,.18,'triangle',.05,.18);vib([30,40,30,40,80]);
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>{el.remove();achNext()},320)},2300)}
function missWho(){const seat=NET?mySeat():-1;
  return (seat>=0&&S.players[seat]&&!S.players[seat].bankrupt)?seat:S.turn}
let missionsExpanded=false;
function missionRow(m,k,done){const ok=!!done[m.id];let [c,t]=m.p(k);c=Math.min(c,t);
  const pct=ok?100:Math.round(c/t*100);
  const prog=!ok?`<small>${m.id==='sewa300'?fmt(c)+' / '+fmt(t):c+' / '+t}</small>`:'';
  return `<li class="ms ${ok?'ok':''}"><span class="me">${ok?'✅':m.e}</span><span class="mt"><b>${esc(m.t)}</b><small>${esc(m.d)}</small>${prog}
    <span class="mbar"><i style="width:${pct}%"></i></span></span><span class="mr">+${fmt(m.r)}</span></li>`}
function renderMissions(){
  const box=document.getElementById('missions'),ttl=document.getElementById('missTitle'),toggle=document.getElementById('missionToggle');if(!box||!S)return;
  const k=missWho(),q=S.players[k],done=missDone(k);
  const n=MISI.filter(m=>done[m.id]).length;
  ttl.innerHTML=`Misi ${NET&&k===mySeat()?'anda':esc(q.name)} <span class="mcount">${n}/${MISI.length}</span>`;
  const ranked=MISI.map((m,i)=>{let[c,t]=m.p(k);return{m,i,pct:done[m.id]?1:Math.min(c,t)/t}})
    .filter(x=>!done[x.m.id]).sort((a,b)=>b.pct-a.pct||a.i-b.i);
  const chosen=ranked.length?ranked.slice(0,2).map(x=>x.m):MISI.slice(-2);
  const shown=missionsExpanded?MISI:chosen;
  box.innerHTML=shown.map(m=>missionRow(m,k,done)).join('');
  if(toggle){toggle.hidden=MISI.length<=2;toggle.setAttribute('aria-expanded',missionsExpanded?'true':'false');
    toggle.textContent=missionsExpanded?'Ringkaskan misi':`Lihat semua ${MISI.length} misi`}}
/* ---------- mod cepat ----------
   Untuk main ±20 minit: setiap pemain terus diberi beberapa stesen secara
   rawak, tiada perlindungan pusingan pertama (sewa dikutip dari awal, boleh
   terus bina), dan permainan tamat selepas beberapa ronde (satu ronde = setiap
   pemain dapat satu giliran). Lebih ramai pemain = kurang ronde, supaya
   tempohnya kekal lebih kurang sama. */
const fastRounds=n=>n<=2?24:n===3?18:n===4?15:12;
/* Had ronde lalai untuk Main sekarang: cukup untuk bina set dan hotel,
   tetapi permainan tidak berlarutan ratusan pusingan. */
const PLAY_ROUNDS=30;
function dealFast(){
  const n=S.players.length,each=n<=2?4:n===3?3:2;
  const pool=shuffle(SQ.map((q,i)=>q.t==='prop'?i:-1).filter(i=>i>=0));
  S.players.forEach((pl,pi)=>{const got=[];
    for(let k=0;k<pool.length&&got.length<each;k++){const i=pool[k];
      S.owner[i]=pi;
      /* Jangan beri set penuh percuma — cari stesen lain. */
      if(hasSet(pi,SQ[i].g)){S.owner[i]=null;continue}
      got.push(i);pool.splice(k,1);k--}
    addLog(`⚡ Mod cepat: ${pl.name} terima ${got.map(i=>SQ[i].n).join(', ')}.`)});
}
function newGame(names,qual,endLaps,cash,bots,useAuc,fast){
  clearBot();
  if(fast){qual=0;endLaps=0}
  S={players:names.map((n,i)=>({name:n,color:COLORS[i],cash,pos:0,laps:0,inJail:false,jailTurns:0,cards:0,bankrupt:false,creditor:null,bot:(bots&&bots[i])||null})),
   owner:Array(40).fill(null),houses:Array(40).fill(0),mort:Array(40).fill(false),
   turn:0,phase:'roll',doubles:0,again:false,dice:[3,4],qual,endLaps,msg:`${names[0]}, baling dadu untuk mula.`,
   useAuc:useAuc!==false,auc:null,trade:null,
   card:null,log:[],decks:{peluang:shuffle([...PELUANG.keys()]),tabung:shuffle([...TABUNG.keys()])},
   fast:!!fast,fastRounds:fastRounds(names.length),round:1,st:names.map(()=>newStat(cash)),gid:Date.now().toString(36)};
  addLog(qual?`Permainan bermula. Setiap pemain perlu lengkapkan ${qual} pusingan sebelum boleh membeli hartanah.`:'Permainan bermula. Semoga berjaya!');
  if(S.fast)dealFast();
  const bl=S.players.filter(p=>p.bot);
  if(bl.length)addLog(`Lawan bot: ${bl.map(p=>`${p.name} (${BOT_LEVELS[p.bot]})`).join(', ')}.`);
}
const cur=()=>S.players[S.turn];
const fmt=n=>(n<0?'−':'')+'RM'+Math.round(Math.abs(n)).toLocaleString('en-MY');
const sleep=ms=>new Promise(r=>setTimeout(r,RM?Math.min(ms,30):ms));
const LOG_ICON={dadu:'🎲',beli:'🏠',sewa:'💸',bina:'🔨',lelong:'⚖️',lokap:'🔒'};
const LOG_SEP='\u001f';   /* pemisah tak boleh ditaip, jadi nama pemain tidak mungkin mengelirukannya */
function addLog(t,k){S.log.unshift(k&&LOG_ICON[k]?k+LOG_SEP+t:t);S.log.length=Math.min(S.log.length,80)}
/* Catatan lama (simpanan atau bilik yang belum dinaik taraf) tiada awalan — ia dipaparkan tanpa ikon. */
function logParts(l){const v=String(l),i=v.indexOf(LOG_SEP);
  if(i>0){const k=v.slice(0,i);if(LOG_ICON[k])return[LOG_ICON[k],v.slice(i+1)]}
  return['',v]}
/* Simpan hanya sempadan tindakan yang lengkap. Animasi, kad berantai dan
   bayaran semasa pergerakan mesti selesai sebelum mengganti checkpoint. */
function save(){
  if(NET||!S||busy||S.phase==='moving')return;
  try{localStorage.setItem('mtkl-save',JSON.stringify(S))}catch(e){}
}
let saveRecoveryNotice='';
function loadSave(){
  saveRecoveryNotice='';
  try{
    const s=JSON.parse(localStorage.getItem('mtkl-save')||'null');
    if(!validState(s)||s.phase==='over')return null;
    /* Simpanan lama mungkin ada tunai separuh ringgit (sewa hab dahulu tidak dibundarkan). */
    s.players.forEach(p=>{p.cash=Math.round(p.cash)});
    /* Fail lama tidak menyimpan destinasi/baki langkah. Jangan ulang land()
       atau kesan kad: wang atau ganjaran mungkin telah diterima. */
    if(s.phase==='moving'){
      s.phase='end';s.again=false;s.doubles=0;s.card=null;
      saveRecoveryNotice='Simpanan lama dipulihkan. Baki pergerakan yang terganggu tidak diulang. Urus hutang jika ada, kemudian tamatkan giliran.';
      s.msg=saveRecoveryNotice;
      s.log.unshift(saveRecoveryNotice);s.log.length=Math.min(s.log.length,80);
    }
    return s;
  }catch(e){return null}
}
