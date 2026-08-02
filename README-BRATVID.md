# BratVid Vermeil - Dokumentasi

## 🎬 Tentang Fitur

**BratVid Vermeil** adalah fitur generator video yang menghasilkan animasi teks word-by-word dengan background Vermeil dari anime "Kenja no Deshi wo Nanoru Kenja".

## ✨ Fitur Utama

- **Animasi Word-by-Word**: Teks muncul kata per kata secara bertahap
- **Auto Text Wrapping**: Otomatis memecah teks panjang menjadi beberapa baris
- **Dynamic Font Sizing**: Ukuran font menyesuaikan dengan panjang teks (22px - 90px)
- **Video Output**: Menghasilkan file video MP4 (512x512px, 24fps)
- **Custom Duration**: Setiap kata muncul selama 0.7 detik, kata terakhir di setiap layer 1.5 detik

## 🔧 Konfigurasi Video

```typescript
const VIDEO_CONFIG = {
  outputFormat: "mp4",          // Format output
  fps: 24,                      // Frame per second
  width: 512,                   // Lebar video
  height: 512,                  // Tinggi video
  lyric: {
    maxWordPerLayer: 5,         // Maksimal kata per layer
    frameDuration: 0.7,         // Durasi per frame (detik)
    lastFrameDuration: 1.5      // Durasi frame terakhir per layer
  }
};
```

## 📝 Cara Penggunaan

1. Pilih tab **"BratVid Vermeil"** di website
2. Masukkan teks yang ingin dibuat video
3. Klik **"Generate Art"**
4. Tunggu proses rendering (bisa memakan waktu beberapa detik hingga menit tergantung panjang teks)
5. Video akan muncul dan bisa di-download

## ⚙️ Requirements

### System Requirements:
- **Node.js**: v18+ (untuk Next.js)
- **FFmpeg**: Harus terinstall di sistem untuk encoding video
  - Windows: Download dari [ffmpeg.org](https://ffmpeg.org/download.html)
  - Mac: `brew install ffmpeg`
  - Linux: `sudo apt install ffmpeg`

### Dependencies:
- `@napi-rs/canvas`: Untuk rendering canvas
- `axios`: Untuk download assets
- `child_process`: Untuk menjalankan ffmpeg

## 🎨 Cara Kerja

1. **Tokenization**: Text dipecah menjadi kata-kata individual
2. **Layer Splitting**: Kata-kata dikelompokkan (default: 5 kata per layer)
3. **Frame Generation**: 
   - Setiap kata dibuat frame PNG dengan background Vermeil
   - Text di-render di area aman (SAFE_ZONE)
   - Font Poppins digunakan dengan auto-sizing
4. **Video Encoding**:
   - Frame-frame PNG digabungkan menggunakan FFmpeg
   - Menggunakan concat demuxer untuk timing presisi
   - Output: MP4 dengan codec H.264

## 📂 File Structure

```
lib/generators/bratvermeilVid.ts      # Generator logic
app/api/generate/bratvermeilVid/
  └── route.ts                        # API endpoint
app/page.tsx                          # UI form (sudah terintegrasi)
```

## 🐛 Troubleshooting

### Error: "ffmpeg not found"
- Pastikan FFmpeg sudah terinstall
- Cek dengan command: `ffmpeg -version`
- Tambahkan FFmpeg ke PATH sistem

### Video terlalu lama diproses
- Kurangi panjang teks
- Teks yang sangat panjang akan menghasilkan banyak frame

### Error saat download assets
- Pastikan koneksi internet stabil
- Assets akan di-cache setelah download pertama

## 🔗 Asset URLs

- **Background**: `https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Vermile.jpg`
- **Font**: `https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Brat/Poppins.ttf`

## 📊 Performance

- **Small text** (1-10 kata): ~5-10 detik
- **Medium text** (11-30 kata): ~15-30 detik  
- **Large text** (31+ kata): ~30-60+ detik

Waktu processing tergantung pada:
- Panjang teks
- Spesifikasi hardware
- Jumlah frame yang di-generate

## 🎯 Contoh Input

```
Watashi wa Verumei. Aruto no tsukaima no akuma yo.
```

Output: Video dengan animasi teks muncul kata per kata dengan background Vermeil.

## 📄 License

Sesuai dengan license proyek utama FAKE-CHAT-CANVAS.
