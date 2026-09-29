/* Metro Tycoon KL — icons.js
   Ikon UI bergaris (24×24, garis 2, hujung bulat), sama gaya dengan lakaran
   mercu tanda di petak stesen. Warna ikut teks (currentColor).
   Emoji dikekalkan untuk reaksi, misi, lencana dan keseronokan sahaja.
   Dimuat awal supaya semua fail lain boleh guna ico(). Elemen statik dalam
   index.html ditanda <i data-ico="nama"></i> dan diisi di bawah. */
const ICONS={
  gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2.8l1.6 2.5 2.9-.8.8 2.9 2.5 1.6-1.3 2.7 1.3 2.7-2.5 1.6-.8 2.9-2.9-.8L12 21.2l-1.6-2.5-2.9.8-.8-2.9-2.5-1.6L5.5 12 4.2 9.3l2.5-1.6.8-2.9 2.9.8z"/>',
  install:'<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M12 7v6.5M9.2 10.8 12 13.6l2.8-2.8M10.5 18.2h3"/>',
  board:'<rect x="3" y="3" width="18" height="18" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/><path d="M3 8h5M16 8h5M3 16h5M16 16h5M8 3v5M16 3v5M8 16v5M16 16v5"/>',
  case:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5.2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2V7M3 12.5h18M12 11v3"/>',
  log:'<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  city:'<path d="M2.5 21h19M5 21V11l4-2.2V21M9 21V3.5h6.5V21M15.5 21V9.5H19V21M11.6 7h1.3M11.6 10.5h1.3M11.6 14h1.3M11.6 17.5h1.3"/>',
  palm:'<path d="M12.5 21c.6-3.8.2-7.6-1.3-10.8M8.5 21h8"/><path d="M11.2 10.2C9.4 6.8 6 6 3.2 7.4c3.2-.2 5.8 1 8 2.8zM11.2 10.2c.7-3.6 4-5.8 7.8-5-3 .7-5.5 2.4-7.8 5zM11.2 10.2c3.2-.9 6.6.8 8 3.8-2.9-1.6-5.4-2.4-8-3.8zM11.2 10.2c-3.1-.3-6 1.9-6.8 5 1.9-2.2 4.2-3.9 6.8-5z"/>',
  bolt:'<path d="M13.2 2.5 4.8 13.4h6.4l-1 8.1 8.4-10.9h-6.4z"/>',
  play:'<path d="M7.5 4.6v14.8L19.5 12z"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.5-3.5 3-5.6 6.2-5.6s5.7 2.1 6.2 5.6"/><circle cx="17.2" cy="9" r="2.6"/><path d="M16.8 14.5c2.6.1 4.3 2 4.7 4.9"/>',
  share:'<path d="M12 15V3.5M7.6 7.8 12 3.4l4.4 4.4M5 12.5V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5"/>',
  train:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 10h14M8.6 13.6h.01M15.4 13.6h.01M8 21l2-4M16 21l-2-4"/>',
  flag:'<path d="M5 21.5V3.5M5 4h13l-2.6 4.2L18 12.5H5"/>',
  timer:'<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.6M9.6 2.5h4.8M18.4 6.6 20 5"/>',
  house:'<path d="M3.5 11.2 12 4l8.5 7.2M6 9.6V20h12V9.6M10 20v-5h4v5"/>',
  eye:'<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  trophy:'<path d="M8 3.5h8V9a4 4 0 0 1-8 0zM8 5.5H4.5A3.5 3.5 0 0 0 8 10M16 5.5h3.5A3.5 3.5 0 0 1 16 10M12 13v3.5M8.5 21h7M9.5 16.5h5V21h-5z"/>'};
/* cls tambahan untuk saiz/tempat; label memberi nama kepada pembaca skrin
   (tanpa label, ikon hanya hiasan). */
function ico(name,cls,label){const d=ICONS[name];if(!d)return '';
  const a=label?`role="img" aria-label="${label}"`:'aria-hidden="true"';
  return `<svg class="ico${cls?' '+cls:''}" viewBox="0 0 24 24" ${a} fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">${d}</svg>`}
document.querySelectorAll('i[data-ico]').forEach(el=>{el.outerHTML=ico(el.dataset.ico,el.className)});
