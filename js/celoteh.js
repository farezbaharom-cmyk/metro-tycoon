/* Metro Tycoon KL — celoteh.js
   Celoteh watak: gelembung kata-kata lucu di atas token apabila sesuatu
   berlaku (sewa, beli, cukai, jackpot, muflis...). Teks dipilih oleh peranti
   yang bertindak dan disimpan dalam S.chat (senarai pendek dengan id), jadi
   dalam bilik online semua orang nampak ayat yang sama. Dimainkan oleh
   celotehHook() yang dipanggil daripada newsHook() dalam render.js.
   {o} = nama pemain lain, {h} = jumlah wang, {s} = nama stesen. */
const CELOTEH={
  tuanSewa:['Terima kasih, datang lagi! 😘','Sewa bulan ni settle. Nice.','{h}? Masuk tabung kahwin saya.','Kaching! 💰','Duduk lama-lama pun takpe, {o}.',
    'Ini bukan rompakan, ini pelaburan.','Nanti saya belanja teh O ais. Kosong.','Resit nak tak? Takde pun.','Saya dah cakap, jangan lalu sini.'],
  bayarSewa:['Aduh, dompet menangis 😭','Duit gaji dah lari...','Tak apa, rezeki {o}.','Ini zalim, {o}.','Makan maggi la bulan ni.',
    'Boleh bayar ansuran tak?','{h}?! Ingat ni KLCC ke?','Saya report kat Pakcik nanti.','Mak, tolong transfer...'],
  sewaBesar:['KENAPA MAHAL SANGAT?! 😱','Jual buah pinggang pun tak cukup.','{h}... saya nak pengsan.','Ini sewa ke tebusan?!','Rasa nak pindah ke Borneo.'],
  tuanBesar:['Hotel saya, peraturan saya 😎','Selamat datang ke hotel mewah! Checkout: {h}.','Terima kasih kerana menaja percutian saya.','Hahaha! Kaya! Kaya! 🤑'],
  beli:['{s}? Borong! 🛒','Tak tengok harga, terus beli.','{s} sekarang saya punya. Jangan jealous.','Pelaburan hartanah, geng. Adulting.','Mak, saya dah ada rumah!','Ini untuk masa depan anak cucu.'],
  hotel:['Hotel bintang lima! Bintang tu saya lukis sendiri.','Siapa lalu {s}, siap sedia 😈','Sekarang saya tauke hotel. Panggil Datuk.'],
  cukai:['Cukai lagi? Saya baru bayar semalam!','LHDN, kita kawan kan? 🥲','Kerajaan pun nak makan jugak la.','Duit saya pergi mana ni...'],
  cukaiBebas:['Bebas cukai! Hari ni hari saya 😎'],
  kadRugi:['Nasib malang betul hari ni.','Kad ni kena sumpah ke?','Siapa kocok kad ni?! 😤','Tak adil. Saya nak cabut semula.'],
  kadUntung:['Rezeki anak soleh! 🙏','Alhamdulillah, masuk poket.','Kad bertuah! Saya pilih kad ni dengan hati.'],
  jackpot:['JACKPOT! Belanja semua orang... tak jadi.','Hari ni saya ketua kampung! 🎰','Tak sangka parkir pun boleh kaya.','Terima kasih semua yang bayar cukai! 😂'],
  jackpotLain:['Eh, tu duit saya dalam tu!','Tak adil! Saya bayar cukai tadi!','Pulangkan cukai saya! 😭'],
  muflis:['Saya... muflis. Tolong hantar maggi.','Game over. Saya balik kampung tanam pisang.','Tak apa, dunia ini hanya pinjaman. 🥲','Along, jangan cari saya.'],
  lokap:['Saya tak bersalah! Saya cuma nak naik LRT!','Tolong beritahu mak saya pergi bercuti.','Pudu, kita jumpa lagi. 🥲'],
  ganda3:['Dadu ni kena sumpah!','Saya terlalu hebat, sampai kena tangkap.'],
  tepat:['Tepat macam GPS! 🎯','Skill, bukan nasib.'],
  sendiri:['Rumah sendiri, rasa tenang.','Balik rumah, rehat jap.','Home sweet home 🏠'],
  kosong:['Parkir percuma... tapi tabung kosong. Sedih.','Saya datang untuk jackpot, dapat angin je.'],
  along:['Along, saya bayar ansuran boleh? 😰','Pinjam sikit je... sikit je...'],
  alongTagih:['Along ni tunggu kat MULA macam cikgu disiplin.','Ya Allah, Along datang lagi!']};
function celotehPick(cat,v){const a=CELOTEH[cat];if(!a||!a.length)return null;
  const t=a[Math.floor(Math.random()*a.length)];
  return t.replace(/\{o\}/g,v.o||'kawan').replace(/\{h\}/g,v.h||'').replace(/\{s\}/g,v.s||'sini')}
/* Rekod celoteh. pr = kebarangkalian (supaya tidak terlalu bising), d = jeda ms. */
function celoteh(pi,cat,v={},pr=1,d=0){
  if(!S||pi==null||pi<0||!S.players[pi]||Math.random()>pr)return;
  const t=celotehPick(cat,v);if(!t)return;
  const q=Array.isArray(S.chat)?S.chat:[];
  q.push({id:Date.now().toString(36)+Math.random().toString(36).slice(2,6),pi,t,d});
  S.chat=q.slice(-4)}
/* Main semula gelembung baharu pada setiap peranti. */
let chatSeen=null,chatGid=null;
function celotehHook(){
  if(!S)return;const q=Array.isArray(S.chat)?S.chat:[];
  if(chatSeen===null||chatGid!==S.gid){chatSeen=new Set(q.map(x=>x.id));chatGid=S.gid;return}
  if(!chatOn())q.forEach(x=>chatSeen.add(x.id));
  q.forEach(x=>{if(!x||chatSeen.has(x.id))return;chatSeen.add(x.id);
    setTimeout(()=>bubble(x.pi,x.t),(x.d||0)+(busy?250:0))})}
/* Tetapan: Celoteh Hidup/Mati (Menu). */
let chatPref=true;try{chatPref=localStorage.getItem('mtkl-celoteh')!=='0'}catch(e){}
const chatOn=()=>chatPref;
function bubble(pi,text){
  if(!S||!S.players[pi]||!chatOn())return;const p=S.players[pi];
  let layer=document.getElementById('chatLayer');
  if(!layer){layer=document.createElement('div');layer.id='chatLayer';layer.className='chatlayer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer)}
  layer.querySelectorAll(`.cbub[data-k="${pi}"]`).forEach(x=>x.remove());
  const tok=document.querySelector(`#sq${p.pos} .tok[data-k="${pi}"]`)||document.getElementById('sq'+p.pos);
  let r=tok&&tok.getBoundingClientRect();
  const board=document.getElementById('boardview'),br=board&&board.getBoundingClientRect();
  const onScreen=r&&r.width>0&&r.bottom>0&&r.top<innerHeight&&br&&br.width>40;
  const el=document.createElement('div');el.className='cbub';el.dataset.k=pi;
  el.style.setProperty('--cc',p.color);
  el.innerHTML=`<b>${esc(p.name)}</b>${esc(text)}`;
  layer.appendChild(el);
  /* Letak di atas token; jika token tidak kelihatan (tab lain), di bahagian atas skrin. */
  const w=el.offsetWidth,h=el.offsetHeight;
  let x,y,below=false;
  if(onScreen){x=r.left+r.width/2;y=r.top-8;if(y-h<8){y=r.bottom+8;below=true}}
  else{x=innerWidth/2;y=90;below=true}
  x=Math.max(8+w/2,Math.min(innerWidth-8-w/2,x));
  el.style.left=x+'px';el.style.top=y+'px';
  if(below)el.classList.add('below');
  const tail=onScreen?Math.max(12,Math.min(w-12,r.left+r.width/2-(x-w/2))):w/2;el.style.setProperty('--tx',tail+'px');
  const sr=document.getElementById('turnGuide');if(sr)sr.textContent=`${p.name}: ${text}`;
  setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300)},Math.min(4200,1900+text.length*45))}
(()=>{const b=document.getElementById('btnChat');if(!b)return;
  const lbl=()=>{b.textContent='Celoteh: '+(chatPref?'Hidup':'Mati')};lbl();
  b.onclick=()=>{chatPref=!chatPref;try{localStorage.setItem('mtkl-celoteh',chatPref?'1':'0')}catch(e){}
    if(!chatPref)document.querySelectorAll('.cbub').forEach(x=>x.remove());lbl()}})();
