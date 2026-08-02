# 🎨 Fake Chat & Canvas Generator

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://fake-chat-generation-phi.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

Website generator untuk membuat fake chat, fake profile, meme canvas, dan berbagai konten kreatif lainnya dengan mudah dan cepat.

🚀 **Live Demo**: [https://fake-chat-generation-phi.vercel.app/](https://fake-chat-generation-phi.vercel.app/)

---

## 📋 Daftar Fitur

Project ini menyediakan **28 fitur generator** yang terbagi dalam beberapa kategori:

### 💬 Text & Chat
- **TikTok** - Fake screenshot TikTok dengan tema light/dark
- **Instagram Story** - Generate IG story dengan tema light/dark
- **Fake IG Profile** - Buat fake profile Instagram (username, postingan, followers, bio)
- **WhatsApp** - Fake chat WhatsApp dengan tema light/dark dan background tekstur
- **IQC Pink** - Quote chat dengan tema pink

### 📰 Berita & Info
- **Kompas** - Generator artikel berita ala Kompas
- **Phone Specs** - Spesifikasi smartphone dengan tombol download JSON
- **System Info** - Info sistem device

### 📞 Call Screen
- **Call IOS** - Fake incoming call screen ala iPhone
- **Call Andro** - Fake incoming call screen ala Android

### 🎮 Gaming
- **Fake FF (V1)** - Fake screenshot Free Fire menggunakan API nexadev/maker/fakeff
- **Fake FF V2** - Fake FF dengan username parameter
- **Fake FF Duo** - Fake FF dengan 2 nickname (duo mode)

### 💰 E-Wallet
- **Fake Dana** - Fake screenshot Dana e-wallet
- **Fake OVO** - Fake screenshot OVO e-wallet

### 🎨 Meme & Canvas
- **Beautiful Meme** - Template meme "so beautiful"
- **Timpa Teks** - Canvas dengan teks overlay
- **WMP1 Canvas** - Word meme pack style 1
- **WMP2 Canvas** - Word meme pack style 2
- **Nokia Canvas** - Canvas dengan tema Nokia klasik
- **Brat Img** - Brat style image (3 tema, 4 level blur)
- **Brat Vid** - Brat style video/GIF (output MP4/GIF, 3 tema, 4 level blur)
- **Brat Gojo** - Brat style dengan tema Gojo Satoru
- **BratVid Gojo** - Brat video dengan tema Gojo
- **Brat Vermeil** - Brat style dengan tema Vermeil
- **BratVid Vermeil** - Brat video dengan tema Vermeil

### 🕌 Islamic Content
- **Murotal** - Generator audio murotal dengan database 239 Qari dari mp3quran.net

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4 (App Router)
- **Frontend**: React 19.2, TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Canvas Processing**: @napi-rs/canvas
- **Animations**: Motion (Framer Motion successor)
- **UI Components**: Lucide React Icons
- **API Integration**: Axios, Cheerio
- **Deployment**: Vercel

---

## 🚀 Instalasi & Development

### Prasyarat
- Node.js 20+
- npm atau yarn
- FFmpeg (untuk video processing)

### Clone Repository
```bash
git clone https://gitlab.com/affansmith80/fake-chat-generation.git
cd fake-chat-generation
```

### Install Dependencies
```bash
npm install
```

### Setup Environment (Opsional)
```bash
cp .env.example .env.local
```

### Jalankan Development Server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production
```bash
npm run build
npm start
```

---

## 📁 Struktur Project

```
fake-chat-generation/
├── app/
│   ├── api/generate/          # API routes untuk setiap generator
│   │   ├── tiktok/
│   │   ├── whatsapp/
│   │   ├── brat/
│   │   ├── fakeff/
│   │   └── ... (28 endpoints)
│   ├── page.tsx               # Main UI dengan tab navigation
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
├── lib/
│   ├── generators/            # Generator functions untuk canvas/image
│   └── utils/                 # Utility functions
├── assets/
│   ├── fonts/                 # Custom fonts
│   └── images/                # Static images
├── components/                # Reusable React components (jika ada)
├── public/                    # Public assets
└── next.config.ts             # Next.js configuration
```

---

## 🔌 API Endpoints

Semua generator dapat diakses via API di `/api/generate/{feature-name}`:

**Contoh:**
```bash
# TikTok Generator
POST /api/generate/tiktok
Content-Type: application/json
{
  "username": "vanx",
  "content": "Hello world",
  "theme": "dark"
}

# WhatsApp Generator
POST /api/generate/whatsapp
Content-Type: multipart/form-data
{
  "sender": "John",
  "message": "Hi there!",
  "theme": "light"
}
```

Response: Image atau video dalam format base64 atau URL

---

## 🎯 Cara Penggunaan

1. **Pilih Fitur** - Klik tab fitur yang ingin digunakan
2. **Isi Form** - Masukkan data sesuai kebutuhan (username, text, tema, dll)
3. **Upload Image** - Drag & drop atau browse file untuk fitur yang memerlukan gambar
4. **Generate** - Klik tombol "Generate" 
5. **Download** - Hasil akan muncul dan bisa langsung di-download

### Tips:
- Untuk fitur yang memerlukan gambar eksternal (Fake IG Profile), gunakan URL image
- Beberapa API memiliki limit rate, tunggu beberapa detik jika gagal
- Output video (Brat Vid variants) tersedia dalam format MP4 dan GIF

---

## 🔧 Konfigurasi

### Next.js Config
File `next.config.ts` sudah dikonfigurasi untuk:
- TypeScript strict mode
- Remote image patterns (picsum.photos, cdn.phototourl.com)
- Server external packages (@napi-rs/canvas)
- Motion transpilation

### Vercel Deployment
Project ini sudah dioptimalkan untuk Vercel dengan:
- `vercel.json` configuration
- Edge-compatible API routes
- Automatic image optimization

---

## 🤝 Contributing

Kontribusi selalu welcome! Silakan:
1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

---

## 📝 License

Project ini dibuat untuk keperluan edukasi dan hiburan. Gunakan dengan bijak dan bertanggung jawab.

---

## 👨‍💻 Author

**Affan Smith**
- GitLab: [@affansmith80](https://gitlab.com/affansmith80)
- Website: [https://fake-chat-generation-phi.vercel.app/](https://fake-chat-generation-phi.vercel.app/)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Vercel](https://vercel.com/) - Deployment platform
- [Nexadev API](https://nexadev.my.id/) - Untuk beberapa generator API
- [mp3quran.net](https://mp3quran.net/) - Database audio murotal
- [@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) - Canvas processing
- Semua contributors dan pengguna yang telah memberikan feedback

---

## 📊 Stats

- **28** Fitur Generator
- **110+** Files
- **37K+** Lines of Code
- **25.57 MB** Total Project Size

---

**⭐ Jika project ini bermanfaat, jangan lupa berikan star!**
