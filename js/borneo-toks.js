/* Metro Tycoon KL — borneo-toks.js
   Dua watak tambahan Edisi Borneo: Orang Utan (b0) dan Kenyalang (b1).
   Gaya sama seperti kucing dalam cats.js (viewBox 100×100, kelas mt-cat,
   cat-figure, cat-ring, cat-spark), jadi animasi lompat, cincin dan
   percikan menang berfungsi tanpa CSS baharu. Kenyalang ada ekor yang
   bergoyang (cat-tail). Mesti dimuat selepas data.js (mengisi TOK_EXTRA). */
(()=>{
  const base=`<ellipse cx="50" cy="87" rx="32" ry="8" fill="#162236" opacity=".12"/>
<ellipse cx="50" cy="83" rx="32" ry="10" fill="currentColor"/>
<ellipse cx="50" cy="81" rx="28" ry="7" fill="#fff" opacity=".18"/>
<ellipse class="cat-ring" fill="none" stroke="currentColor" opacity="0" cx="50" cy="83" rx="36" ry="13"/>`;
  const spark=`<g class="cat-spark" opacity="0" fill="currentColor"><path d="M13 24l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM85 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></g>`;
  const wrap=fig=>`<svg xmlns="http://www.w3.org/2000/svg" class="mt-cat" viewBox="0 0 100 100" aria-hidden="true">${base}<g class="cat-figure" stroke="#343044" stroke-width="2.4" stroke-linejoin="round">${fig}</g>${spark}</svg>`;
  const blush=(a,b,y)=>`<ellipse cx="${a}" cy="${y}" rx="4.4" ry="2.4" fill="#ee9e9c" opacity=".65" stroke="none"/><ellipse cx="${b}" cy="${y}" rx="4.4" ry="2.4" fill="#ee9e9c" opacity=".65" stroke="none"/>`;
  const eye=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="3.3" ry="4.6" fill="#222638" stroke="none"/><circle cx="${x+1}" cy="${y-2}" r="1" fill="#fff" stroke="none"/>`;
  /* Orang utan: bulu jingga kemerahan, muka bujur cerah, tangan panjang terjuntai. */
  const orangutan=wrap(`
<path d="M33 58Q17 68 23 81" fill="none" stroke="#c8612a" stroke-width="9" stroke-linecap="round"/>
<path d="M67 58Q83 68 77 81" fill="none" stroke="#c8612a" stroke-width="9" stroke-linecap="round"/>
<ellipse cx="50" cy="66" rx="19" ry="17" fill="#c8612a"/>
<ellipse cx="50" cy="69" rx="10" ry="11" fill="#e08a4f" stroke="none"/>
<circle cx="25" cy="42" r="5.5" fill="#c8612a"/><circle cx="75" cy="42" r="5.5" fill="#c8612a"/>
<ellipse cx="50" cy="41" rx="25" ry="21" fill="#c8612a"/>
<path d="M40 22Q43 11 50 19Q56 10 61 22" fill="#c8612a"/>
<path d="M50 29Q35 26 32 40Q31 57 50 59Q69 57 68 40Q65 26 50 29Z" fill="#f2c29b"/>
${eye(42,40)}${eye(58,40)}
<ellipse cx="47.5" cy="47.5" rx="1.3" ry="1" fill="#6b3b22" stroke="none"/><ellipse cx="52.5" cy="47.5" rx="1.3" ry="1" fill="#6b3b22" stroke="none"/>
<path d="M43 51.5Q50 56.5 57 51.5" fill="none" stroke="#343044" stroke-width="1.8" stroke-linecap="round"/>
${blush(36,64,50)}
<ellipse cx="40" cy="80" rx="7" ry="4" fill="#c8612a"/><ellipse cx="60" cy="80" rx="7" ry="4" fill="#c8612a"/>`);
  /* Kenyalang (enggang badak): bulu hitam, ekor berjalur putih, paruh kuning
     dengan tanduk (casque) jingga melengkung ke atas. Sayap terlipat dengan
     bulu primer berlapis ke arah ekor supaya siluet jelas burung enggang. */
  const kenyalang=wrap(`
<path class="cat-tail" d="M64 72Q84 80 86 64" fill="none" stroke="#232531" stroke-width="9" stroke-linecap="round"/>
<path d="M78 76Q85 75 86 66" fill="none" stroke="#f4efe6" stroke-width="7" stroke-linecap="round"/>
<ellipse cx="48" cy="66" rx="20" ry="17" fill="#232531"/>
<ellipse cx="48" cy="74" rx="11" ry="6.5" fill="#f4efe6" stroke="none"/>
<path d="M32 58Q47 48 63 57L77 68Q72 72 68 70Q66 75 60 73Q57 77 51 74Q45 76 40 71Q30 66 32 58Z" fill="#3b3f55"/>
<path d="M36 59Q46 53 57 59" fill="none" stroke="#5a5e76" stroke-width="1.6" stroke-linecap="round"/>
<path d="M54 62Q62 65 68 70M48 65Q55 69 60 73M42 67Q47 71 51 74" fill="none" stroke="#1a1c26" stroke-width="1.4" stroke-linecap="round"/>
<circle cx="45" cy="41" r="19" fill="#232531"/>
<path d="M58 38Q82 40 91 56Q77 51 59 48Z" fill="#f7e2a0"/>
<path d="M56 33Q69 19 84 25Q87 31 81 36Q71 32 60 37Z" fill="#f28c28"/>
<circle cx="47" cy="38" r="6" fill="#d94b3a" stroke="none"/>
${eye(47,38)}
<ellipse cx="35" cy="47" rx="4.2" ry="2.3" fill="#ee9e9c" opacity=".5" stroke="none"/>
<ellipse cx="40" cy="80" rx="6" ry="3.5" fill="#e0b04a"/><ellipse cx="56" cy="80" rx="6" ry="3.5" fill="#e0b04a"/>`);
  TOK_EXTRA.b0={n:'Orang Utan',svg:orangutan};
  TOK_EXTRA.b1={n:'Kenyalang',svg:kenyalang};
})();
