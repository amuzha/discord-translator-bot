# 📢 Discord Translator & Announcement Bot 📢

Bot ini memungkinkan Anda untuk:
✅ Mengirim pengumuman (announcement) ke channel tertentu <br>
✅ Menerjemahkan teks ke berbagai bahasa menggunakan **Gemini AI** <br>
✅ Memiliki sistem command dengan prefix (contoh: `m!`) <br>

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
   git clone https://github.com/amuzha/discord-translator-bot.git
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
     "OWNER=1234567890"
   }
   ```

4. Jalankan bot:

   ```bash
   node index.js
   ```

---

## 🛠️ Command List 🛠️

### 📢 **ANNOUNCEMENT**

| Command                             | Deskripsi                                   |
| ----------------------------------- | ------------------------------------------- |
| `m!announce <teks>`                 | Kirim pengumuman ke semua channel terdaftar |
| `m!announce-test <teks>`            | Uji pengumuman tanpa mengirim ke channel    |
| `m!sendto <lang> <#channel> <teks>` | Kirim pengumuman ke channel tertentu        |

### 🌍 **LANG & CHANNEL**

| Command                                 | Deskripsi                          |
| --------------------------------------- | ---------------------------------- |
| `m!addlang <lang> <emoji_flag> <judul>` | Tambahkan bahasa baru              |
| `m!setchannel <lang> <#channel>`        | Set channel untuk bahasa tertentu  |
| `m!removechannel <lang> <#channel>`     | Hapus channel dari bahasa tertentu |
| `m!listchannels`                        | Tampilkan semua bahasa dan channel |

### 🛠 **TOOLS**

| Command                     | Deskripsi                               |
| --------------------------- | --------------------------------------- |
| `m!translate <lang> <teks>` | Terjemahkan teks ke bahasa yang dipilih |
| `m!ping`                    | Tes koneksi bot (ping)                  |

### 🔑 **OWNER**

| Command                      | Deskripsi                        |
| ---------------------------- | -------------------------------- |
| `m!addowner <discord_id>`    | Tambahkan owner bot              |
| `m!removeowner <discord_id>` | Hapus owner bot                  |
| `m!setprefix`                | Ganti prefix bot (hanya info)    |
| `m!creator`                  | Tampilkan pembuat atau owner bot |

---

## 🗂️ Struktur Proyek 🗂️

```
discord-translator-bot/
├── index.js          # Main file
├── bot.js            # Command file
├── config.json       # Konfigurasi bot (ignored by git)
├── .env              # Environment
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
