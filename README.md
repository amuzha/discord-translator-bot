Berikut adalah contoh **README.md** yang lengkap, rapi, dan sesuai dengan proyek bot Discord kamu (translator & announcement bot):

---

# 📢 Discord Translator & Announcement Bot 📢

Bot ini memungkinkan Anda untuk:
✅ Mengirim pengumuman (announcement) ke channel tertentu
✅ Menerjemahkan teks ke berbagai bahasa menggunakan **Gemini AI**
✅ Memiliki sistem command dengan prefix (contoh: `m!`)

---

## 🚀 Fitur Utama 🚀

* **Translate Command**
  Terjemahkan teks ke bahasa tertentu atau secara acak jika tidak ada kode bahasa yang diberikan.
* **SendTo Command**
  Kirim pengumuman ke channel tertentu dengan terjemahan otomatis.
* **Owner System**
  Tambahkan atau hapus owner dengan command khusus.

---

## 📦 Persyaratan 📦

* **Node.js** v16+
* **Discord.js** v14
* API Key untuk **Gemini AI**

---

## 🔧 Instalasi 🔧

1. Clone repository:

   ```bash
   git clone https://github.com/username/discord-translator-bot.git
   cd discord-translator-bot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Buat file `config.json`:

   ```json
   {
     "TOKEN": "DISCORD_BOT_TOKEN",
     "PREFIX": "m!",
     "GEMINI_API_KEY": "API_KEY_ANDA"
   }
   ```

4. Jalankan bot:

   ```bash
   node index.js
   ```

---

## 🛠️ Command List 🛠️

| Command                     | Deskripsi                                    |                                      |
| --------------------------- | -------------------------------------------- | ------------------------------------ |
| `m!translate <lang> <teks>` | Terjemahkan teks ke bahasa yang dipilih      |                                      |
| `m!translate <teks>`        | Jika tanpa `<lang>`, bot pilih bahasa random |                                      |
| \`m!sendto <#channel        | id> <lang> <teks>\`                          | Kirim pengumuman ke channel tertentu |
| `m!addowner <id>`           | Tambahkan owner bot                          |                                      |
| `m!removeowner <id>`        | Hapus owner bot                              |                                      |

---

## 🗂️ Struktur Proyek 🗂️

```
discord-translator-bot/
├── index.js          # Main file
├── commands/         # Folder untuk command
├── utils/            # Utility (translate, Gemini API)
├── config.json       # Konfigurasi bot (ignored by git)
├── .gitignore        # Ignore node_modules & config.json
└── package.json
```

---

## 🔐 Konfigurasi .gitignore 🔐

Pastikan file `config.json` dan `node_modules` tidak ikut di-push ke GitHub:

```
node_modules/
config.json
.env
```

---

## 🌐 API Gemini 🌐

Gunakan Gemini API untuk terjemahan otomatis.
Dokumentasi resmi: [Google AI Gemini](https://ai.google.dev/)

---

## ✅ Lisensi ✅

Proyek ini menggunakan lisensi **MIT**.
