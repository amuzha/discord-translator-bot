# 📜 Changelog

Semua perubahan penting pada proyek ini akan didokumentasikan di sini.  
Format mengikuti [Keep a Changelog](https://keepachangelog.com/) dan [Semantic Versioning](https://semver.org/).

---

## [2.0.0] - 2025-09-06

### ✨ Added
- **Dynamic Command Loader**: Commands otomatis dimuat dari folder `/commands` tanpa perlu edit `index.js`.
- **Slash + Prefix Command Support**: Semua perintah bisa dijalankan dengan slash (`/announce`) maupun prefix (`m!announce`).
- **Announcement System Premium**:
  - Kirim pengumuman ke seluruh channel bahasa dengan auto-translate.
  - Pilihan mention: `@everyone`, `@here`, role tertentu, atau tanpa mention.
  - Modal input untuk teks pengumuman.
  - Timeout otomatis (dibatalkan jika user tidak memilih dalam 10–20 detik).
  - Proteksi: hanya user yang membuka menu yang bisa memilih.
- **Multi-Translator Fallback System**:
  - Gemini API (dengan rotasi 3 API key).
  - Google Translate (@vitalets/google-translate-api).
  - MyMemory API sebagai fallback terakhir.
  - Logging error Gemini hanya sekali per key saat quota exceeded.
- **Channel Management Commands**:
  - `m!setchannel` / `/setchannel` → Tambahkan channel untuk bahasa tertentu.
  - `m!removechannel` / `/removechannel` → Hapus channel dari bahasa tertentu.
  - UI select menu dengan timeout & proteksi user.
- **Utility Commands**:
  - `m!listchannels` → Menampilkan daftar mapping channel per bahasa.
  - `m!setlang` → Menyetel bahasa guild.
  - `m!translate` → Translate manual teks ke bahasa tertentu.
  - Command dasar: `m!ping`, `m!help`, dll.
- 🛡️ **Moderation Commands**
  - `/kick @user [reason]` / `m!kick` → Kick member dari server.
  - `/ban @user [reason]` / `m!ban` → Ban member dari server.
  - `/warn @user [reason]` / `m!warn` → Tambah sistem warning untuk member.
  - `/giverole @user <role>` / `m!giverole` → Tambahkan role ke member.
  - `/removerole @user <role>` / `m!removerole` → Hapus role dari member.
- **Owner & Permission System**:
  - Hanya admin/owner yang bisa jalankan perintah sensitif (announce, setchannel, removechannel, dll).
  - `m!addowner` dan `m!removeowner` untuk mengelola bot owner.
- **Auto-Reload Commands**:
  - Mengedit file di `/commands` langsung reload tanpa restart bot (tidak auto-deploy ke API).
- **Manual Deploy System**:
  - `npm deploy` → pilih:
    - Deploy ke guild (instan).
    - Deploy global (±1 jam sinkronisasi).
    

### 🔄 Changed
- Struktur project lebih modular: `utils/`, `commands/`, `test/`.
- Config berbasis `config.json` dengan dukungan multi-API keys.

### 🐛 Fixed
- Timeout bug pada select menu (`setchannel` & `removechannel`).
- Pesan timeout tidak override setelah user memilih.
- Pesan error Gemini quota hanya muncul sekali.
- Peningkatan sistem izin (permissions) agar command moderasi hanya bisa dijalankan oleh admin/owner.

---

## [1.0.0] - 2024-??-??
- Initial release: basic announcement & translation system.
