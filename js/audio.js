/* Metro Tycoon KL — audio.js
   Bunyi, getaran dan pengumuman stesen bersuara.
   Semua fail js/ berkongsi skop global yang sama dan dimuatkan mengikut
   susunan dalam index.html. Fungsi boleh dipanggil merentas fail, tetapi
   kod yang BERJALAN semasa muat hanya boleh guna apa yang sudah dimuatkan. */
/* ---------- sound ---------- */
let AC=null;
function beep(f=440,d=.08,type='sine',v=.06,when=0){
  if(!sound)return;try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume().catch(()=>{});
  const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+when;o.type=type;o.frequency.value=f;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d)}catch(e){}}
const sfx={
  step:()=>beep(660,.05,'triangle',.04),
  coin:()=>{beep(988,.08,'square',.03);beep(1319,.14,'square',.03,.07)},
  pay:()=>{beep(330,.1,'sawtooth',.03);beep(247,.16,'sawtooth',.03,.09)},
  card:()=>{beep(523,.08,'triangle');beep(659,.08,'triangle',.06,.08);beep(784,.12,'triangle',.06,.16)},
  jail:()=>{beep(200,.25,'square',.04);beep(150,.3,'square',.04,.2)},
  dice:()=>{for(let i=0;i<5;i++)beep(200+Math.random()*300,.03,'square',.02,i*.07)},
  build:()=>{beep(440,.06,'triangle');beep(880,.1,'triangle',.06,.06)},
  win:()=>{[523,659,784,1047].forEach((f,i)=>beep(f,.2,'triangle',.07,i*.13))}};
/* ---------- getaran (telefon) ----------
   Setiap bunyi penting disertai getaran pendek. Android sahaja — Safari iPhone
   tidak menyokong navigator.vibrate, jadi di sana ia senyap tanpa ralat.
   Dikawal oleh suis "Getaran" dalam menu, berasingan daripada bunyi. */
let haptic=true;
function vib(pat){if(!haptic)return;try{navigator.vibrate&&navigator.vibrate(pat)}catch(e){}}
const VIB={coin:18,pay:[35,40,35],card:22,jail:[90,60,140],dice:[25,35,25,35,25],build:28,win:[60,50,60,50,160]};
Object.keys(VIB).forEach(k=>{const f=sfx[k];sfx[k]=(...a)=>{vib(VIB[k]);return f(...a)}});

/* ---------- pengumuman stesen ----------
   Tiga lapisan yang saling menyokong: gong dua/tiga nada, suara sintesis
   pelayar, dan jalur LED di atas papan. Suara Bahasa Melayu tidak wujud pada
   semua peranti — apabila tiada, gong dan jalur LED masih menyampaikan
   pengumuman yang sama, jadi ciri ini tidak pernah senyap sepenuhnya. */
let voiceOn=true, voiceRef=null, pidsTimer=null, voicePrimed=false;
function vtag(v){return String(v.lang||'').toLowerCase().replace(/_/g,'-')}
/* Sesetengah peranti memberi suara Melayu kod bahasa yang tidak kemas, jadi
   namanya turut diperiksa. "Malayalam" ditolak kerana ia bahasa lain. */
function isMalay(v){
  const n=String(v.name||'');
  if(/malayalam/i.test(n)||vtag(v).startsWith('ml'))return false;
  return vtag(v).startsWith('ms')||/(melayu|bahasa malaysia|malaysian|\bmalay\b|yasmin|osman)/i.test(n);
}
const isIndo=v=>vtag(v).startsWith('id');
/* Suara lelaki yang dikenali: Osman (Melayu, Edge/Windows), Ardi & Andika
   (Indonesia). Pelayar tidak melaporkan jantina suara, jadi nama sahaja
   petunjuknya. */
const isMale=v=>{const n=String(v.name||'');
  return /(osman|ardi|andika|rizwan|\bmale\b|lelaki|laki-laki|pria)/i.test(n)&&!/female|perempuan|wanita/i.test(n)};
/* Satu suara sahaja: lelaki Melayu dahulu, kemudian lelaki Indonesia (sebutan
   paling hampir), dan jika peranti tiada suara lelaki langsung, suara Melayu
   atau Indonesia yang ada — direndahkan pitchnya supaya tetap garau. */
/* Sebutan Melayu lebih penting daripada jantina: mana-mana suara Melayu
   (pitch direndahkan) mengatasi suara lelaki Indonesia. */
const VOICE_RANK=[
  v=>isMalay(v)&&isMale(v),
  v=>vtag(v)==='ms-my',
  isMalay,
  v=>isIndo(v)&&isMale(v),
  isIndo,
];
function voiceList(){try{return speechSynthesis.getVoices()||[]}catch(e){return[]}}
function pickVoice(){
  const list=voiceList();
  voiceRef=null;
  for(const want of VOICE_RANK){
    const hit=list.find(want);
    if(hit){voiceRef=hit;break}
  }
}
try{if('speechSynthesis'in window){
  try{localStorage.removeItem('mtkl-voicename');localStorage.removeItem('mtkl-gaya')}catch(e){}
  pickVoice();speechSynthesis.onvoiceschanged=pickVoice}}catch(e){}
/* iOS dan Safari menolak pertuturan pertama yang tidak lahir daripada sentuhan
   pengguna. Satu ucapan senyap pada sentuhan pertama membuka kebenaran itu. */
function primeVoice(){
  if(voicePrimed)return;voicePrimed=true;
  try{if(!('speechSynthesis'in window))return;
    const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u)}catch(e){}
}
addEventListener('pointerdown',primeVoice,{once:true,passive:true});
addEventListener('keydown',primeVoice,{once:true});
/* Sebutan: "RM300" dibaca "300 ringgit" oleh semua suara. Jika tiada suara
   Melayu dan suara Indonesia digunakan, ejaan diubah ikut cara orang KL
   bercakap — hujung "-a" menjadi "-e" (seterusnye, Kelane Jaye, ade) —
   kerana enjin Indonesia menyebut "a" penuh, dan itulah yang membuatnya
   kedengaran Indonesia. Teks di skrin tidak berubah. */
let malayWarned=false;
function melayukan(t){
  t=String(t).replace(/RM\s?([\d,]+)/g,(m,n)=>n.replace(/,/g,'')+' ringgit');
  const v=voiceRef;
  if(v&&isMalay(v))return t;
  if(!malayWarned&&v&&isIndo(v)){malayWarned=true;
    setTimeout(()=>toast('Peranti ini tiada suara Bahasa Melayu — suara Indonesia digunakan. Pasang suara Melayu untuk bunyi lebih tepat.'),400)}
  return t.replace(/\b([A-Za-z]*[b-df-hj-np-tv-z])a\b/g,'$1e');
}
function hushVoice(){try{speechSynthesis.cancel()}catch(e){}}
/* fresh memutuskan ucapan terdahulu (pergerakan baharu bermula); tanpanya
   ucapan beratur, supaya "Stesen seterusnya" sempat habis sebelum "Tiba". */
function speak(t,fresh){
  if(!sound||!voiceOn||!t)return;
  try{
    if(!('speechSynthesis'in window))return;
    if(fresh)speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(melayukan(t));
    if(voiceRef){u.voice=voiceRef;u.lang=voiceRef.lang}else u.lang='ms-MY';
    /* Suara lelaki sebenar cukup direndahkan sedikit; suara lain direndahkan
       lebih banyak supaya bunyinya tetap garau. */
    /* Sedikit turun naik rentak setiap ayat supaya tidak kedengaran seperti
       robot; ayat yang berakhir dengan "!" disebut lebih laju dan tinggi. */
    const g=gy(),ex=/!\s*$/.test(t)?1:0,j=()=>1+(Math.random()-.5)*.08;
    u.rate=Math.min(2,g.rate*j()*(1+ex*.05));
    u.pitch=Math.min(2,(voiceRef&&isMale(voiceRef)?g.pitch:g.pitchLain)*j()*(1+ex*.06));u.volume=1;
    speechSynthesis.speak(u);
  }catch(e){}
}
const gongNext=()=>{beep(784,.55,'sine',.06);beep(988,.5,'sine',.055,.17);beep(659,.75,'sine',.05,.34)},
      gongArrive=()=>{beep(988,.45,'sine',.055);beep(784,.7,'sine',.05,.16)};
function pidsShow(lbl,name){
  const el=document.getElementById('pids');if(!el)return;
  const L=el.querySelector('.lbl'),N=el.querySelector('.nm');
  if(L)L.textContent=lbl;if(N){N.textContent=name;N.dataset.t=''}
  el.classList.remove('news');el.classList.add('on');
  if(pidsTimer){clearTimeout(pidsTimer);pidsTimer=null}
}
function pidsHide(ms){
  if(pidsTimer)clearTimeout(pidsTimer);
  pidsTimer=setTimeout(()=>{const el=document.getElementById('pids');if(el)el.classList.remove('on');pidsTimer=null;pidsIdle()},ms==null?2400:ms);
}
/* Semasa rehat, jalur LED menatal berita pusingan ini (jika ada). */
function pidsIdle(){
  const el=document.getElementById('pids');if(!el||el.classList.contains('on'))return;
  const L=el.querySelector('.lbl'),N=el.querySelector('.nm'),e=ev();
  if(e){if(!el.classList.contains('news')||N.dataset.t!==e.t){
      el.classList.add('news');L.textContent='Berita';N.dataset.t=e.t;
      N.innerHTML='';const m=document.createElement('span');m.className='mq';m.textContent=e.t;N.appendChild(m)}}
  else if(el.classList.contains('news')){el.classList.remove('news');L.textContent='Stesen seterusnya';N.textContent='';N.dataset.t=''}
}
/* Tiga gaya suara, dipilih dalam menu. Enjin suara pelayar tidak boleh ditukar
   wataknya; yang boleh dikawal hanyalah ayat dan rentak (rate serta pitch).
   Setiap pengumuman ada beberapa versi yang dipilih secara rawak (tidak
   berulang dua kali berturut-turut), supaya suara tidak jemu didengar.
   Jalur LED kekal Bahasa Melayu baku pada semua gaya.
   - Pakcik: lelaki Melayu tua — perlahan, garau, cakap macam orang kampung.
   - Slay: lelaki Melayu muda — laju, bertenaga, penuh slang media sosial.
   - Pengulas: pengulas sukan di TV — penuh semangat, suka menjerit. */
const GAYA={
  pakcik:{nama:'Pakcik',
    rate:.8, pitch:.68, pitchLain:.45,
    next:[n=>`Haa... stesen seterusnya, ${n}.`, n=>`Lepas ni, ${n} pulak.`, n=>`Sabar ye, nak. Kita nak sampai ${n} dah.`, n=>`Stesen seterusnya... ${n}. Pegang elok-elok.`],
    arrive:[(n,nota)=>`${n} dah sampai, nak. ${nota}`, (n,nota)=>`Haa, ${n}. Turun, turun. ${nota}`, (n,nota)=>`Sampai dah kita kat ${n}. ${nota}`],
    jail:[n=>`Astaghfirullah. Si ${n} kena tangkap. Masuk Lokap la jawabnya.`, n=>`Haih, ${n}, ${n}... Pakcik dah pesan dah. Masuk Lokap.`, n=>`Ya Allah budak ni. ${n} kena angkut ke Lokap.`],
    hidup:['Assalamualaikum. Pakcik ada ni, nak. Jom kita jalan.', 'Haa, Pakcik dah sampai. Duduk elok-elok, kita gerak.'],
    berita:[t=>`Dengar sini, berita terkini. ${t}`, t=>`Pakcik baru dengar kat radio. ${t}`],
    fanfare:[(laluan,nama)=>`Perhatian semua. Laluan ${laluan} dah jadi milik ${nama}. Tahniah, nak.`, (laluan,nama)=>`Masya-Allah! Satu laluan ${laluan} ${nama} punya. Kaya dah budak ni.`],
    beli:[(n,s,h)=>`${n} beli ${s}, ${h}. Pandai simpan duit budak ni.`, (n,s,h)=>`Alhamdulillah. ${s} jadi hak ${n} dah.`, (n,s,h)=>`${h} untuk ${s}. Mahal tu, nak. Tapi takpe, pelaburan.`],
    sewa:[(n,o,h)=>`${n} bayar sewa ${h} kat ${o}. Takpe, rezeki orang.`, (n,o,h)=>`Hulur ${h} kat ${o}, nak. Jangan berkira.`],
    sewaBesar:[(n,o,h)=>`Allahu! ${h}! Habis duit si ${n}. Untung la ${o}.`, (n,o,h)=>`Ya Allah, mahalnya sewa. ${n} kena bayar ${h} kat ${o}.`],
    lelong:[(n,s,h)=>`Dah jatuh tukul. ${s} pergi kat ${n}, ${h}.`, (n,s,h)=>`${n} menang lelong. ${s}, ${h}. Murah tu.`],
    ganda:[n=>`Dadu sama, ${n}. Baling sekali lagi, nak.`, n=>`Wah, nasib baik. ${n} dapat main lagi.`],
    hotel:[(n,s)=>`Tengok tu. ${n} bina hotel kat ${s}. Macam tauke dah.`],
    muflis:[n=>`Innalillah... ${n} dah muflis. Sabar ye, nak.`, n=>`Kesian ${n}. Habis semua. Takpe, lain kali.`],
    afk:[n=>`Haih, ${n} tertidur ke? Takpe, Pakcik mainkan dulu.`, n=>`${n}, ${n}... senyap je. Pakcik tolong main, ye.`],
    menang:[n=>`Alhamdulillah. ${n} menang. Tahniah, nak. Pakcik bangga.`, n=>`Tamat dah. Juara kita, ${n}. Belanja Pakcik teh tarik, ye.`],
    nota:{jail:['Singgah tengok je. Jangan buat hal, ye.','Lawat kawan je ni. Jangan lama-lama.'], gojail:'Ikut pegawai tu elok-elok, nak.',
      hub:['Kat sini boleh tukar laluan.','Stesen besar ni. Ramai orang, jaga beg.'], free:['Rehat dulu. Pakcik pun penat dah ni.','Duduk kejap, minum air.'],
      tax:['Bayar cukai tu, jangan buat-buat lupa.','Cukai, nak. Kerajaan pun nak makan.'], go:['Mula balik. Bismillah.','Pusing satu round dah. Bismillah.'],
      peluang:['Ambik kad tu, nak. Tengok nasib.','Cabut kad. Mudah-mudahan rezeki.'], tabung:'Ambik kad tu, nak.', util:['Tempat bayar bil ni.','Bil air, bil api... macam-macam.']}},
  slay:{nama:'Slay',
    rate:1.08, pitch:.95, pitchLain:.7,
    next:[n=>`Okay geng, next stop, ${n}!`, n=>`Otw ke ${n}, jom!`, n=>`Next up... ${n}! Hype sikit, geng.`, n=>`Vroom vroom! ${n}, here we come!`],
    arrive:[(n,nota)=>`${n}! Dah sampai, geng. ${nota}`, (n,nota)=>`Welcome to ${n}! ${nota}`, (n,nota)=>`Okay, landed kat ${n}. ${nota}`],
    jail:[n=>`Alamak! ${n} kena cekup. Terus masuk Lokap, no cap.`, n=>`Plot twist! ${n} masuk Lokap. Siapa nak jamin?`, n=>`Oof. ${n} kena cekup. Villain era betul.`],
    hidup:['Yo geng! Suara slay dah on. Jom gerak!', 'Okay okay, abang slay dah masuk chat. Jom!'],
    berita:[t=>`Breaking news, geng! ${t}`, t=>`Tea time! Berita panas. ${t}`],
    fanfare:[(laluan,nama)=>`Wehhh! Laluan ${laluan} sekarang milik ${nama}. Slay gila!`, (laluan,nama)=>`Full set! ${nama} kuasai laluan ${laluan}. Big boss energy!`],
    beli:[(n,s,h)=>`${n} cop ${s}, ${h}. Sold!`, (n,s,h)=>`Checkout! ${s} masuk portfolio ${n}.`, (n,s,h)=>`${n} beli ${s}. Rich people behaviour.`],
    sewa:[(n,o,h)=>`${n} bayar ${h} kat ${o}. Tak kisah, tak kisah.`, (n,o,h)=>`Transfer ${h} ke ${o}. Duit datang, duit pergi.`],
    sewaBesar:[(n,o,h)=>`Aduiii! ${h}! ${n} kena pau teruk dengan ${o}!`, (n,o,h)=>`Emotional damage! ${n} bayar ${h} kat ${o}.`],
    lelong:[(n,s,h)=>`Sold! ${n} sapu ${s}, ${h}. Steal gila.`, (n,s,h)=>`${n} menang bidding war. ${s} dia punya!`],
    ganda:[n=>`Double! ${n} main lagi, geng!`, n=>`Dadu kembar! ${n} on fire!`],
    hotel:[(n,s)=>`${n} bina hotel kat ${s}. Tauke mode on!`, (n,s)=>`Hotel naik kat ${s}! ${n} tengah flex.`],
    muflis:[n=>`RIP ${n}. Muflis. Gone, reduced to atoms.`, n=>`${n} bankrap, geng. Pray for ${n}.`],
    afk:[n=>`${n} AFK, geng! Bot take over.`, n=>`Hello? ${n}? Okay, bot main dulu.`],
    menang:[n=>`GG! ${n} menang! Main character betul!`, n=>`Tamat! ${n} juara. Slay, slay, slay!`],
    nota:{jail:['Lawat je, chill.','Visiting hours je, relax.'], gojail:'Ikut pegawai, jangan drama.',
      hub:['Tukar laluan sini, easy.','Interchange, geng. Pilih jalan.'], free:['Rehat jap. Self-care, bestie.','Chill zone. Ambil nafas.'],
      tax:['Bayar cukai. Adulting sikit, geng.','Cukai lagi. Sakit hati, tapi okay.'], go:["Garisan mula. Let's go!",'Round baru, vibe baru!'],
      peluang:['Tarik kad. Main character energy!','Cabut kad. Manifest benda baik!'], tabung:'Tarik kad, geng.', util:['Bil utiliti. Sedih, tapi kena bayar.','Bil lagi? Real life hit different.']}},
  pengulas:{nama:'Pengulas',
    rate:1.15, pitch:1.05, pitchLain:.85,
    next:[n=>`Dan dia bergerak! Menuju ke ${n}!`, n=>`Laju, laju! Sasaran seterusnya, ${n}!`, n=>`Tuan-tuan dan puan-puan, arah ke ${n}!`],
    arrive:[(n,nota)=>`Dan dia mendarat di ${n}! ${nota}`, (n,nota)=>`${n}! Tepat sekali! ${nota}`, (n,nota)=>`Sampai! ${n}! ${nota}`],
    jail:[n=>`Kad merah! Kad merah untuk ${n}! Terus ke Lokap!`, n=>`Tidak! ${n} dihantar keluar padang! Masuk Lokap!`],
    hidup:['Selamat petang penonton semua! Perlawanan bermula sekarang!', 'Ya, penonton! Saya pengulas anda hari ini. Jom!'],
    berita:[t=>`Berita tergempar dari tepi padang! ${t}`, t=>`Kita ada perkembangan terkini! ${t}`],
    fanfare:[(laluan,nama)=>`Gol! Gol! Gol! ${nama} memiliki seluruh laluan ${laluan}!`, (laluan,nama)=>`Hatrik! Laluan ${laluan} milik ${nama} sepenuhnya!`],
    beli:[(n,s,h)=>`Dan ${n} membeli ${s}! ${h}! Keputusan yang berani!`, (n,s,h)=>`Pembelian besar! ${s} kini milik ${n}!`],
    sewa:[(n,o,h)=>`${n} terpaksa bayar ${h} kepada ${o}! Pertahanan yang lemah!`, (n,o,h)=>`Mata untuk ${o}! ${h} dari poket ${n}!`],
    sewaBesar:[(n,o,h)=>`Tendangan padu! ${h}! ${n} terduduk, ${o} bersorak!`, (n,o,h)=>`Tidak dapat dipercayai! ${h}! ${o} mengaut untung besar dari ${n}!`],
    lelong:[(n,s,h)=>`Wisel penamat lelongan! ${n} dapat ${s} dengan ${h}!`],
    ganda:[n=>`Dadu ganda! ${n} dapat sepakan percuma, baling lagi!`, n=>`Kembar! ${n} masih menguasai bola!`],
    hotel:[(n,s)=>`Pertahanan besi! ${n} bina hotel di ${s}!`],
    muflis:[n=>`Dan ${n} tersingkir dari perlawanan! Muflis!`, n=>`Tamat riwayat ${n}! Muflis!`],
    afk:[n=>`${n} tidak bergerak! Pemain gantian masuk padang!`, n=>`Masa tamat untuk ${n}! Bot mengambil alih!`],
    menang:[n=>`Wisel penamat! ${n} juara! ${n} juara! Penonton bersorak!`, n=>`Inilah juara kita! ${n}! Sejarah tercipta hari ini!`],
    nota:{jail:'Hanya melawat, penonton.', gojail:'Keputusan pengadil muktamad!',
      hub:'Stesen pertukaran, peluang untuk ubah taktik!', free:'Rehat separuh masa!',
      tax:'Cukai! Penalti kewangan!', go:'Kembali ke garisan permulaan!',
      peluang:'Kad peluang! Apa kejutannya?', tabung:'Kad tabung! Mari kita lihat!', util:'Bil utiliti, penonton.'}}};
const GAYA_URUT=['pakcik','slay','pengulas'];
let gaya='pakcik';
try{const g=localStorage.getItem('mtkl-gaya2');if(GAYA[g])gaya=g}catch(e){}
function gy(){return GAYA[gaya]||GAYA.pakcik}
/* Pilih satu versi secara rawak, tetapi bukan yang sama dengan kali lepas. */
const lastPick={};
function pk(key,v){
  if(!Array.isArray(v))return v;
  if(v.length<2)return v[0];
  let i;do{i=Math.floor(Math.random()*v.length)}while(i===lastPick[key]);
  lastPick[key]=i;return v[i]}
function line(key,...a){
  const v=pk(gaya+':'+key,gy()[key]);if(v==null)return '';
  return String(typeof v==='function'?v(...a):v).replace(/\s+/g,' ').trim()}
function nota(t){return pk(gaya+':nota:'+t,gy().nota[t])||''}
/* Pengumuman peristiwa (beli, sewa, muflis...) disimpan dalam keadaan permainan
   supaya setiap peranti dalam bilik online mendengarnya dalam gaya masing-masing. */
function sayAll(k,...a){if(!S)return;
  const q=Array.isArray(S.say)?S.say:[];
  q.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),k,a:a.map(String)});
  S.say=q.slice(-6)}
function sayNext(i){
  if(!S||!SQ[i])return;
  pidsShow('Stesen seterusnya',SQ[i].n);
  gongNext();speak(line('next',SQ[i].n),true);
}
function sayArrive(i){
  if(!S||!SQ[i])return;
  const s=SQ[i],g=gy();
  pidsShow('Tiba di',s.n);pidsHide(2600);
  gongArrive();speak(line('arrive',s.n,nota(s.t)));
}
