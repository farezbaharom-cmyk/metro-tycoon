# Metro Tycoon KL 🚆

![Metro Tycoon KL: permainan hartanah laluan rel Lembah Klang](og.png)

**Permainan papan hartanah bertemakan laluan rel Lembah Klang.** Beli stesen MRT, LRT, Monorel, KTM Komuter dan ERL, kutip sewa, bina rumah dan hotel, dan jadi tycoon transit terkaya di KL.

### ▶️ [Main sekarang](https://farezbaharom-cmyk.github.io/metro-tycoon/)

Tiada muat turun atau pendaftaran diperlukan. Buka di pelayar telefon atau komputer, dan terus main.

---

## Cara main

| Mod | Penerangan |
|---|---|
| **Main sekarang** | Anda lawan satu bot, terus bermula. |
| **⚡ Main cepat** | Siap dalam lebih kurang 20 minit. Setiap pemain terus dapat beberapa stesen, dan permainan tamat selepas beberapa ronde. |
| **Main dengan kawan** | Cipta bilik online dan kongsi kod 5 huruf (atau pautan jemputan). Sehingga 5 pemain, dan boleh campur dengan bot. |
| **Satu peranti** | 2 hingga 5 pemain berkongsi satu skrin. Mana-mana pemain boleh ditukar kepada bot. |

**Asas permainan**
- Baling dua dadu dan gerak. Lalu **MULA** untuk kutip RM200.
- Mendarat di stesen yang belum dimiliki: **beli**, atau lepaskan untuk **dilelong** kepada semua pemain.
- Mendarat di stesen orang lain: **bayar sewa**. Kalau pemilik ada **laluan penuh**, sewa asas jadi dua kali ganda.
- **Bina rumah dan hotel** untuk naikkan sewa.
- **Tawar-menawar** hartanah dan tunai dengan pemain lain pada bila-bila masa dalam giliran anda.
- Wang tak cukup? Jual bangunan, gadai hartanah, atau isytihar muflis.
- **Pemenang** ialah pemain yang ada kekayaan bersih tertinggi.

Peraturan penuh ada dalam permainan, di **⚙️ Menu → Peraturan**.

## Ciri-ciri

- 🗺️ **Laluan sebenar Lembah Klang:** MRT Kajang, MRT Putrajaya, LRT Kelana Jaya, LRT Ampang, LRT Sri Petaling, Monorel KL, KTM Komuter dan ERL, dengan hab KL Sentral, Masjid Jamek, Pasar Seni dan Bandar Tasik Selatan.
- 🃏 **40 kad Peluang dan Tabung bertema KL:** Grab surge, jem di Jalan Tun Razak, LRT tersadai, banjir kilat, duit raya dan angpau, teh tarik di mamak.
- 📰 **Berita rawak setiap ronde:** waktu puncak MRT, laluan ditutup, promosi tambang, pengecualian cukai dan lain-lain, dipaparkan pada jalur LED macam papan stesen sebenar.
- 🔊 **Pengumuman stesen bersuara** dengan dua gaya, iaitu **Pakcik** dan **Slay**.
- 🎉 **Sambutan laluan penuh** dengan animasi dan pengumuman.
- 🏅 **Statistik dan lencana di skrin tamat**, contohnya Raja Sewa, Tuan Tanah, Banduan Tetap dan Bangkit Semula, dengan butang kongsi keputusan ke WhatsApp.
- 🤖 **Bot dua tahap**, Mudah dan Sederhana.
- 🌃 **Langit KL** di tengah papan (Menara Berkembar, KL Tower, Merdeka 118). Ia bertukar siang atau malam ikut tema cerah atau gelap.
- 📲 **Boleh dipasang macam app** di skrin utama telefon, dan mod satu peranti boleh dimain tanpa internet.
- 💾 **Permainan disimpan automatik** dalam pelayar.

## Teknologi

- Satu fail `index.html`: HTML, CSS dan JavaScript biasa, tanpa framework dan tanpa langkah build.
- [Firebase Realtime Database](https://firebase.google.com/docs/database) untuk bilik online, dan Firebase Anonymous Auth untuk log masuk tanpa nama.
- Web Speech API untuk pengumuman bersuara.
- Service worker (`sw.js`) dan `manifest.webmanifest` untuk sokongan PWA.
- Dihoskan di GitHub Pages.

## Jalankan sendiri

1. Fork atau muat turun repo ini.
2. Buka `index.html` terus dalam pelayar. Mod satu peranti boleh dimain tanpa sebarang persediaan.
3. Untuk mod online dengan projek Firebase anda sendiri:
   - Cipta projek di [Firebase Console](https://console.firebase.google.com), dan hidupkan **Realtime Database** serta **Authentication → Anonymous**.
   - Ganti nilai dalam `FIREBASE_CONFIG` di bahagian atas skrip dalam `index.html` (`apiKey`, `authDomain`, `projectId`, `databaseURL`).
   - Tampal peraturan pangkalan data di bawah ke tab **Rules**.

<details>
<summary>Peraturan Realtime Database</summary>

```json
{
  "rules": {
    ".read": false,
    ".write": false,
    "rooms": {
      "$code": {
        ".read": "auth != null",
        ".write": "auth != null && ((!data.exists() && newData.child('meta/host').val() === auth.uid && newData.child('seats/' + auth.uid).exists()) || (data.exists() && !newData.exists() && data.child('meta/host').val() === auth.uid))",
        ".validate": "$code.length === 5 && $code.matches(/^[A-Z0-9]+$/)",
        "meta": {
          ".write": "auth != null && data.child('host').val() === auth.uid && newData.child('host').val() === auth.uid"
        },
        "seats": {
          "$uid": {
            ".write": "auth != null && (($uid === auth.uid && (!newData.exists() || root.child('rooms/' + $code + '/meta/started').val() !== true)) || (root.child('rooms/' + $code + '/meta/host').val() === auth.uid && $uid.beginsWith('bot_')))",
            ".validate": "newData.child('name').isString() && newData.child('name').val().length <= 16"
          }
        },
        "online": {
          "$uid": {
            ".write": "auth != null && $uid === auth.uid"
          }
        },
        "state": {
          ".write": "auth != null && root.child('rooms/' + $code + '/seats/' + auth.uid).exists()",
          ".validate": "newData.isString() && newData.val().length < 200000"
        }
      }
    }
  }
}
```

</details>

> `apiKey` Firebase dalam kod ini memang direka untuk berada dalam laman web awam, jadi ia bukan rahsia. Data dilindungi oleh peraturan pangkalan data di atas.

## Nota

Metro Tycoon KL ialah projek peminat dan tidak berkaitan dengan Prasarana, Rapid KL, MRT Corp, KTMB atau ERL. Nama stesen dan laluan digunakan untuk tema sahaja.

---

Dibina oleh **Farez** 🇲🇾
