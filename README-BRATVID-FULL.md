# Brat Vid - Dokumentasi Lengkap

## 🎬 Tentang Fitur

**Brat Vid** adalah generator video animasi dengan style "Brat" yang menghasilkan video word-by-word dengan berbagai opsi kustomisasi. Berbeda dengan Brat Image (statis) dan BratVid Vermeil (khusus Vermeil theme), Brat Vid menawarkan:

- ✅ **3 Theme Options**: White, Black, Green
- ✅ **Blur Effects**: 0-3 level blur
- ✅ **2 Output Formats**: MP4 atau GIF
- ✅ **Emoji Support**: Full support untuk Apple emoji
- ✅ **Smart Text Reset**: Auto reset layer setiap 7-8 kata
- ✅ **Word-by-word Animation**: Smooth reveal animation

---

## 🎨 Fitur Utama

### **1. Multiple Themes**
```typescript
- White: Putih background, hitam text
- Black: Hitam background, putih text  
- Green: Hijau (#8ace00) background, hitam text
```

### **2. Blur Effects**
```typescript
- 0: No blur (default)
- 1: Light blur
- 2: Medium blur
- 3: Heavy blur
```

### **3. Output Formats**
```typescript
- MP4: Video format (1000x1000px, 24fps, H.264)
- GIF: Animated GIF (1000x1000px, 10fps, optimized palette)
```

### **4. Animation System**
- **Max Word Per Layer**: 1 kata muncul per frame
- **Frame Duration**: 0.4 detik per kata
- **Hold Duration**: 1.2 detik untuk frame terakhir
- **Reset Schedule**: [7, 8] - Reset layer setiap 7-8 kata bergantian

---

## 🔧 Konfigurasi

### **Default Settings**
```typescript
{
  text: 'Brat vid 🎥',
  theme: 'white',
  blur: 0,
  format: 'mp4',
  frameDuration: 0.4,       // Detik per kata
  holdDuration: 1.2,        // Detik frame terakhir
  maxWordPerLayer: 1,       // 1 kata per frame
  maxWordBeforeReset: [7, 8], // Reset setiap 7-8 kata
  fastProgress: true        // Parallel rendering
}
```

---

## 📝 Cara Penggunaan

### **Di Website**

1. Buka http://localhost:3000
2. Pilih tab **"Brat Vid"**
3. Masukkan text (support emoji! 🎨)
4. Pilih **Theme** (White/Black/Green)
5. Pilih **Blur level** (0-3)
6. Pilih **Output Format** (MP4/GIF)
7. Klik **"Generate Art"**
8. Tunggu proses (10-60 detik tergantung panjang teks)
9. Video/GIF akan muncul dan bisa di-download

---

## 🎯 Contoh Input & Output

### **Example 1: Simple Text**
```
Input: "Hello World Brat Style"
Theme: White
Blur: 0
Format: MP4

Output: Video dengan text muncul word-by-word
Frame 1: "Hello"
Frame 2: "Hello World"
Frame 3: "Hello World Brat"
Frame 4: "Hello World Brat Style" (hold 1.2s)
```

### **Example 2: Emoji Support**
```
Input: "Brat vid 🎥 dengan emoji 🎨 keren 🔥"
Theme: Green
Blur: 1
Format: GIF

Output: GIF animated dengan Apple emoji rendering
```

### **Example 3: Long Text with Reset**
```
Input: "Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh"
Reset Schedule: [7, 8]

Batch 1 (7 kata):
  "Satu" → "Satu dua" → ... → "Satu dua tiga empat lima enam tujuh"

Batch 2 (8 kata - reset dari awal):
  "delapan" → "delapan sembilan" → "delapan sembilan sepuluh"
```

---

## ⚙️ Teknologi & Dependencies

### **Requirements**
- **Node.js**: v18+
- **FFmpeg**: Harus terinstall (untuk encoding video/GIF)
- **@napi-rs/canvas**: Canvas rendering
- **axios**: Asset downloading

### **Asset URLs**
- **Font**: Arial Narrow (`ARIALN.ttf`)
  - URL: `https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Font/ARIALN.ttf`
- **Emoji Map**: Apple Emoji JSON
  - URL: `https://media.githubusercontent.com/media/Ditzzx-vibecoder/entahlah/main/emoji-apple.json`

---

## 🚀 Cara Kerja Rendering

### **1. Text Processing**
```typescript
1. Tokenize text menjadi array kata
2. Split berdasarkan reset schedule [7, 8]
3. Generate partial texts untuk setiap frame
```

### **2. Canvas Rendering**
```typescript
1. Create 1000x1000px canvas
2. Apply theme colors (bg & text)
3. Auto-calculate optimal font size (10-700px)
4. Word wrap dengan emoji support
5. Center alignment dengan padding 80px
6. Apply blur filter jika diperlukan
```

### **3. Frame Generation**
```typescript
- Fast Progress: Parallel rendering (Promise.all)
- Normal: Sequential rendering
- Output: PNG frames di temporary directory
```

### **4. Video Encoding**

#### **MP4 Format**
```bash
ffmpeg -f concat -safe 0 -i concat.txt \
  -vf scale=1000:1000 \
  -c:v libx264 -preset fast -crf 18 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  output.mp4
```

#### **GIF Format**
```bash
ffmpeg -f concat -safe 0 -i concat.txt \
  -vf "fps=10,scale=1000:1000:flags=lanczos, \
       split[s0][s1]; \
       [s0]palettegen=max_colors=64[p]; \
       [s1][p]paletteuse=dither=bayer" \
  -loop 0 \
  output.gif
```

---

## 📂 File Structure

```
lib/generators/bratVid.ts           # Generator logic
app/api/generate/bratVid/route.ts   # API endpoint
app/page.tsx                        # UI form
public/assets/brat/fonts/           # Cached assets
  ├── ARIALN.ttf
  └── emoji-apple.json
```

---

## 📊 Performance & Timing

### **Text Length vs Processing Time**

| Kata | Frames | Waktu (Fast) | Waktu (Normal) |
|------|--------|--------------|----------------|
| 1-5  | 5-6    | ~5-10s       | ~10-15s        |
| 6-15 | 15-16  | ~15-25s      | ~25-35s        |
| 16-30| 30-31  | ~30-45s      | ~45-60s        |
| 31+  | 31+    | ~45-90s      | ~60-120s       |

**Faktor yang Mempengaruhi:**
- Panjang teks
- Jumlah emoji
- Format output (GIF lebih lama dari MP4)
- Blur level (blur membutuhkan extra processing)
- Hardware specs (CPU, RAM)

---

## 🎨 Emoji Support

### **Supported Emoji**
- ✅ Basic emoji: 😀 🎉 ❤️ 🔥
- ✅ Skin tone modifiers: 👋🏻 👋🏽 👋🏿
- ✅ Country flags: 🇮🇩 🇺🇸 🇯🇵
- ✅ Complex emoji: 👨‍👩‍👧‍👦 👩‍💻
- ✅ Variation selectors: ♥️ vs ♥

### **Rendering Method**
- Apple Emoji PNG images dari JSON map
- High quality rendering dengan proper sizing
- Automatic fallback ke system font jika emoji tidak ditemukan

---

## 🐛 Troubleshooting

### **Error: "ffmpeg not found"**
```bash
# Windows
- Download dari https://ffmpeg.org/download.html
- Extract dan tambahkan ke PATH

# Check installation
ffmpeg -version
```

### **Error: "Teks kosong"**
- Pastikan field text tidak kosong
- Minimal 1 kata diperlukan

### **Video terlalu lama**
- Kurangi panjang teks
- Gunakan format MP4 (lebih cepat dari GIF)
- Reduce blur level

### **Emoji tidak muncul**
- Pastikan koneksi internet stabil saat pertama kali
- Emoji map akan di-cache setelah download pertama
- Check file: `public/assets/brat/fonts/emoji-apple.json`

### **Out of Memory**
- Kurangi panjang teks
- Gunakan `fastProgress: false` untuk sequential rendering
- Close aplikasi lain untuk free up RAM

---

## 🔄 Reset Schedule Logic

### **Single Number**
```typescript
maxWordBeforeReset: 7

// Reset setiap 7 kata
Batch 1: kata 1-7
Batch 2: kata 8-14 (reset dari "kata 8")
Batch 3: kata 15-21 (reset dari "kata 15")
```

### **Array Pattern**
```typescript
maxWordBeforeReset: [7, 8]

// Alternating pattern
Batch 1: 7 kata (1-7)
Batch 2: 8 kata (8-15, reset dari "8")
Batch 3: 7 kata (16-22, reset dari "16")
Batch 4: 8 kata (23-30, reset dari "23")
```

### **No Reset**
```typescript
maxWordBeforeReset: 0

// Semua kata dalam 1 layer (no reset)
"kata satu dua tiga empat lima enam"
```

---

## 💡 Tips & Best Practices

### **Untuk Video Berkualitas Tinggi**
- Gunakan format MP4
- Set blur ke 0
- Text tidak terlalu panjang (max 20-30 kata)
- Pilih theme yang kontras dengan content

### **Untuk File Size Kecil**
- Gunakan format GIF
- Text singkat (5-15 kata)
- Hindari blur (file size lebih besar)

### **Untuk Emoji-Heavy Content**
- Test dengan 1-2 emoji dulu
- Gabung text dan emoji: "Hello 👋 World 🌍"
- Emoji akan auto-render dengan ukuran font

### **Untuk Performance Optimal**
- Gunakan `fastProgress: true` (parallel rendering)
- Batch size default sudah optimal
- Close browser tabs lain saat processing

---

## 🎬 Output Specifications

### **MP4 Video**
```
Resolution: 1000x1000px
Codec: H.264 (libx264)
Preset: Fast
CRF: 18 (high quality)
Pixel Format: yuv420p
FPS: Variable (based on duration)
Flags: +faststart (web optimized)
File Size: ~100KB-2MB (depends on length)
```

### **GIF Animation**
```
Resolution: 1000x1000px
FPS: 10
Colors: 64 (optimized palette)
Dither: Bayer
Loop: Infinite
File Size: ~200KB-5MB (depends on length)
```

---

## 📄 License

Sesuai dengan license proyek utama FAKE-CHAT-CANVAS.

---

## 🆚 Comparison: Brat Vid vs BratVid Vermeil

| Feature | Brat Vid | BratVid Vermeil |
|---------|----------|-----------------|
| Themes | 3 options | 1 fixed (Vermeil) |
| Blur | 0-3 levels | Not available |
| Format | MP4 & GIF | MP4 only |
| Background | Solid color | Vermeil image |
| Emoji | Full support | Full support |
| Reset | Customizable | Fixed (5 words) |
| Size | 1000x1000 | 512x512 |
| Use Case | General purpose | Vermeil specific |

---

## 📞 Support

Jika ada masalah atau pertanyaan, hubungi developer melalui WhatsApp Channel yang tertera di website.

**Happy Creating! 🎨🎥**
