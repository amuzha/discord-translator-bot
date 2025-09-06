# 📢 Discord Translator & Announcement Bot Premium 📢

Bot Discord canggih untuk **translate otomatis**, **announcement multi-bahasa**, dan **moderasi server**.  
Mendukung **slash commands** dan **prefix commands**, serta sistem fallback multi-translator.

---

## 🚀 Fitur Utama

### 📢 Announcement System
- Kirim pengumuman ke seluruh channel bahasa dengan auto-translate.
- Pilihan mention: `@everyone`, `@here`, role tertentu, atau tanpa mention.
- Input teks pengumuman via modal.
- Timeout otomatis (dibatalkan jika user tidak memilih dalam 10–20 detik).
- Proteksi: hanya user yang membuka menu yang bisa memilih.

### 🌐 Multi-Translator Fallback System
- **Gemini API** (rotasi hingga 3 API key).
- **Google Translate** via `@vitalets/google-translate-api`.
- **MyMemory API** sebagai fallback terakhir.
- Logging error Gemini hanya muncul sekali per key saat quota exceeded.

### 🛠️ Channel Management
- `/setchannel` / `m!setchannel` → Tambahkan channel untuk bahasa tertentu.
- `/removechannel` / `m!removechannel` → Hapus channel dari bahasa tertentu.
- Kedua command menggunakan UI select menu dengan timeout & proteksi user.

### 📋 Utility Commands
- `m!listchannels` → Menampilkan daftar mapping channel per bahasa.
- `m!setlang` → Menyetel bahasa guild.
- `m!translate` → Translate manual teks ke bahasa tertentu.
- Command dasar: `m!ping`, `m!help`, dll.

### 🛡️ Moderation Commands
- `/kick @user [reason]` / `m!kick @user [reason]` → Kick member dari server.
- `/ban @user [reason]` / `m!ban @user [reason]` → Ban member dari server.
- `/warn @user [reason]` / `m!warn @user [reason]` → Beri peringatan ke member.
- `/giverole @user <role>` / `m!giverole` → Beri role ke member.
- `/removerole @user <role>` / `m!removerole` → Hapus role dari member.

### 🔐 Owner & Permission System
- Hanya admin/owner yang bisa menjalankan command sensitif (`announce`, `setchannel`, `removechannel`, moderasi, dll).
- Kelola owner dengan `m!addowner` dan `m!removeowner`.

### 🔄 Auto-Reload Commands
- File di `/commands` langsung reload tanpa restart bot.
- **Tidak auto-deploy slash ke API** (manual deploy tersedia).

### 🚀 Manual Deploy System
- `npm run deploy` → pilih:
  - **Guild Deploy** (instan muncul).
  - **Global Deploy** (±1 jam sinkronisasi).

---

## 📦 Persyaratan

- **Node.js** v16+
- **Discord.js** v14
- API Key untuk **Gemini AI** (opsional, tapi direkomendasikan)

---

## 🔧 Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/amuzha/discord-translator-bot.git
   cd discord-translator-bot
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Buat file `.env`**
   Salin `.env.example` menjadi `.env` lalu isi token:

   ```bash
   cp .env.example .env   # Linux/macOS
   copy .env.example .env # Windows
   ```

4. **Jalankan bot**

   ```bash
   npm start
   ```

   deploy / register slash command

   ```bash
   npm deploy
   ```

---

## 🛠️ Command List

### 📢 Announcement

| Command                    | Deskripsi                                   |
| -------------------------- | ------------------------------------------- |
| `/announce` / `m!announce` | Kirim pengumuman ke semua channel terdaftar |
| `m!announce-test`          | Uji pengumuman tanpa kirim ke channel       |
| `/sendto` / `m!sendto`     | Kirim pengumuman ke channel tertentu        |

### 🌍 Language & Channel

| Command                  | Deskripsi                               |
| ------------------------ | --------------------------------------- |
| `/setlang` / `m!setlang` | Set bahasa utama guild                  |
| `/setchannel`            | Tambahkan channel untuk bahasa tertentu |
| `/removechannel`         | Hapus channel dari bahasa tertentu      |
| `m!listchannels`         | Lihat daftar bahasa & channel           |

### 🔧 Tools

| Command                     | Deskripsi                           |
| --------------------------- | ----------------------------------- |
| `m!translate <lang> <teks>` | Translate manual ke bahasa tertentu |
| `m!ping`                    | Tes koneksi bot                     |
| `m!help`                    | Lihat semua command                 |

### 🛡️ Moderation

| Command                                     | Deskripsi                 |
| ------------------------------------------- | ------------------------- |
| `/kick @user [reason]` / `m!kick`           | Kick member dari server   |
| `/ban @user [reason]` / `m!ban`             | Ban member dari server    |
| `/warn @user [reason]` / `m!warn`           | Beri peringatan ke member |
| `/giverole @user <role>` / `m!giverole`     | Tambahkan role ke member  |
| `/removerole @user <role>` / `m!removerole` | Hapus role dari member    |

### 🔑 Owner

| Command              | Deskripsi        |
| -------------------- | ---------------- |
| `m!addowner <id>`    | Tambah owner bot |
| `m!removeowner <id>` | Hapus owner bot  |
| `m!creator`          | Info pembuat bot |

---

## 🗂️ Struktur Proyek

```
discord-translator-bot/
├── commands/        # Semua command (prefix & slash)
├── utils/           # Helper, database, logger, translate API
├── test/            # Command & utils untuk testing
├── index.js         # Main bot starter
├── deploy.js        # Manual deploy guild/global
├── .env             # Token & konfigurasi
└── package.json
```

---

## 🌐 API Gemini

Gunakan **Google Gemini API** untuk translate otomatis.
Dokumentasi resmi: [Google AI Gemini](https://ai.google.dev/)

---

## ✅ Lisensi

Proyek ini menggunakan lisensi **MIT**.

---

## 📜 Changelog

Lihat [CHANGELOG.md](./CHANGELOG.md) untuk daftar perubahan versi.

```
