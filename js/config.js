/* =====================================================================
   TAMPAL KONFIGURASI FIREBASE ANDA DI SINI (ganti null dengan objek anda)
   Contoh:
   const FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "metro-tycoon.firebaseapp.com",
     databaseURL: "https://metro-tycoon-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "metro-tycoon",
     appId: "1:123:web:abc"
   };
   ===================================================================== */
/* apiKey diperlukan untuk log masuk tanpa nama (Anonymous Auth). Kunci ini
   memang direka untuk berada dalam kod laman web — ia bukan rahsia; yang
   melindungi data ialah peraturan pangkalan data. Selagi apiKey kosong,
   mod online berjalan tanpa log masuk seperti dahulu. */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCwLNhs5DWaio_0Kk4E0hTdW5hn4p4axtA",
  authDomain: "tanah-air-c6047.firebaseapp.com",
  projectId: "tanah-air-c6047",
  databaseURL: "https://tanah-air-c6047-default-rtdb.asia-southeast1.firebasedatabase.app"
};
/* App Check (pilihan): kunci tapak reCAPTCHA v3 daripada Firebase Console →
   App Check. Selagi null, App Check tidak dimuatkan langsung. Selepas diisi dan
   laman dikemas kini, barulah hidupkan "Enforce" untuk Realtime Database. */
const APPCHECK_SITE_KEY = null;
