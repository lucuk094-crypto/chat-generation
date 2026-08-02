# Theme Modes - Dokumentasi

## 🎨 Tentang Fitur

Fitur **Theme Modes** memungkinkan pengguna untuk memilih antara **Light Mode** dan **Dark Mode** pada generator TikTok, Instagram Story, dan WhatsApp. Setiap theme memberikan tampilan visual yang berbeda sesuai dengan mode yang dipilih.

---

## ✨ Fitur yang Ditambahkan

### **1. TikTok Generator - Light & Dark Mode**

#### **Light Mode (Default):**
- 🎨 **Background**: Template TikTok asli (putih)
- 📝 **Username**: Hitam
- 💬 **Chat Bubble**: Putih dengan teks hitam
- 🔘 **Menu**: Background putih dengan teks hitam
- 📊 **Status**: Mode terang seperti TikTok asli

#### **Dark Mode:**
- 🎨 **Background**: Hitam solid (#000000)
- 📝 **Username**: Putih
- 💬 **Chat Bubble**: Dark gray (#1c1c1e) dengan teks putih
- 🔘 **Menu**: Background dark gray dengan teks putih
- 📊 **Status**: Mode gelap elegan

---

### **2. Instagram Story Generator - Light & Dark Mode**

#### **Dark Mode (Default):**
- 🎨 **Background**: IG Story template gelap
- 📝 **Name**: Putih (#feffff)
- 👤 **Username**: Abu-abu muda (#8c8d91)
- 📊 **Status**: Mode gelap seperti IG Story malam

#### **Light Mode:**
- 🎨 **Background**: Putih bersih (#ffffff)
- 📝 **Name**: Hitam (#000000)
- 👤 **Username**: Abu-abu (#737373)
- 📊 **Status**: Mode terang seperti IG Story siang

---

### **3. WhatsApp Generator - Light & Dark Mode**

#### **Dark Mode (Default):**
- 🎨 **Background**: Template WhatsApp dark
- 💬 **Chat Bubble**: Dark gray (#1c1c1e)
- 📝 **Text**: Putih (#ffffff)
- ⏰ **Time**: Abu-abu muda (#727278)
- 🔘 **Reaction Bar**: Dark gray (#1c1c1e)
- ➕ **Plus Icon**: Abu-abu (#8e8e93)
- 📊 **Status**: WhatsApp dark mode

#### **Light Mode:**
- 🎨 **Background**: Krem WhatsApp (#e5ddd5)
- 💬 **Chat Bubble**: Hijau WhatsApp (#dcf8c6)
- 📝 **Text**: Hitam (#000000)
- ⏰ **Time**: Abu-abu gelap (#667781)
- 🔘 **Reaction Bar**: Putih (#ffffff)
- ➕ **Plus Icon**: Abu-abu gelap (#667781)
- 📊 **Status**: WhatsApp light mode klasik

---

## 🎯 Cara Menggunakan

### **Di Website:**

1. **Pilih Generator**
   - Buka http://localhost:3000
   - Pilih tab **TikTok**, **IG Story**, atau **WhatsApp**

2. **Isi Form**
   - Masukkan data yang diperlukan (username, text, images, dll)

3. **Pilih Theme**
   - **TikTok**: Pilih "Light Mode" atau "Dark Mode"
   - **Instagram Story**: Pilih "Dark Mode" atau "Light Mode"
   - **WhatsApp**: Pilih "Dark Mode" atau "Light Mode"

4. **Generate**
   - Klik "Generate Art"
   - Tunggu proses selesai
   - Download hasil dengan theme yang dipilih

---

## 📝 Contoh Penggunaan

### **TikTok - Dark Mode**
```
Username: @username
Text: "This is amazing! 🔥"
Avatar: [Upload avatar]
Theme: Dark Mode

Result: Komentar TikTok dengan background hitam dan bubble gelap
```

### **Instagram Story - Light Mode**
```
Name: John Doe
Username: @johndoe
Profile Picture: [Upload PP]
Photo: [Upload photo]
Theme: Light Mode

Result: IG Story dengan background putih dan text hitam
```

### **WhatsApp - Light Mode**
```
Text: "Hello! How are you? 👋"
Time: "14:30"
Theme: Light Mode

Result: Chat WhatsApp dengan bubble hijau khas WA light mode
```

---

## 🔧 Technical Details

### **API Parameters**

#### **TikTok API:**
```typescript
POST /api/generate/tiktok
{
  "username": string,
  "chatText": string,
  "avatarSrc": string,
  "theme": "light" | "dark"  // Optional, default: "light"
}
```

#### **Instagram Story API:**
```typescript
POST /api/generate/igstory
{
  "photoSrc": string,
  "ppSrc": string,
  "nama": string,
  "username": string,
  "theme": "light" | "dark"  // Optional, default: "dark"
}
```

#### **WhatsApp API:**
```typescript
POST /api/generate/whatsapp
{
  "text": string,
  "timeStr": string,
  "imgUrl": string (optional),
  "theme": "light" | "dark"  // Optional, default: "dark"
}
```

---

## 🎨 Color Palettes

### **TikTok Themes**

```typescript
Light Mode:
- Background: Template image
- Username: #000000
- Bubble: #ffffff
- Text: #161823
- Menu BG: #ffffff
- Menu Text: #000000
- Menu Border: rgba(0,0,0,0.02)

Dark Mode:
- Background: #000000
- Username: #ffffff
- Bubble: #1c1c1e
- Text: #ffffff
- Menu BG: #1c1c1e
- Menu Text: #ffffff
- Menu Border: rgba(255,255,255,0.1)
```

### **Instagram Story Themes**

```typescript
Dark Mode:
- Background: Template image (dark)
- Name: #feffff
- Username: #8c8d91

Light Mode:
- Background: #ffffff
- Name: #000000
- Username: #737373
```

### **WhatsApp Themes**

```typescript
Dark Mode:
- Background: Template image (dark)
- Status Bar: #ffffff
- Bubble: #1c1c1e
- Text: #ffffff
- Time: #727278
- Reaction Bar: #1c1c1e
- Plus Icon: #8e8e93

Light Mode:
- Background: #e5ddd5 (WhatsApp cream)
- Status Bar: #000000
- Bubble: #dcf8c6 (WhatsApp green)
- Text: #000000
- Time: #667781
- Reaction Bar: #ffffff
- Plus Icon: #667781
```

---

## 📊 Default Themes

| Generator | Default Theme | Reason |
|-----------|---------------|--------|
| **TikTok** | Light Mode | TikTok umumnya digunakan dengan light mode |
| **Instagram Story** | Dark Mode | IG Story lebih populer dengan dark mode |
| **WhatsApp** | Dark Mode | WhatsApp dark mode lebih modern |

---

## 🔄 Backward Compatibility

Fitur theme bersifat **backward compatible**:
- Jika parameter `theme` tidak dikirim, akan menggunakan default theme
- API lama tanpa theme parameter akan tetap berfungsi normal
- Tidak ada breaking changes pada existing implementations

---

## 🎯 UI Updates

### **Form Changes:**

**Before:**
```
Username: [input]
Text: [textarea]
Avatar: [upload]
[Generate Button]
```

**After:**
```
Username: [input]
Text: [textarea]
Avatar: [upload]
Theme: [dropdown: Light Mode / Dark Mode]  ← Baru!
[Generate Button]
```

---

## 🚀 Benefits

### **Untuk User:**
- ✅ **Fleksibilitas**: Pilih sesuai preferensi
- ✅ **Realisme**: Hasil lebih mirip dengan kondisi sebenarnya
- ✅ **Kreativitas**: Lebih banyak variasi output
- ✅ **User Experience**: Lebih sesuai dengan kebiasaan pengguna

### **Untuk Developer:**
- ✅ **Modular**: Easy to extend dengan theme lain
- ✅ **Clean Code**: Theme logic terpisah dari rendering logic
- ✅ **Type Safe**: Full TypeScript support
- ✅ **Maintainable**: Color palette terpusat

---

## 🐛 Known Issues & Limitations

### **None Currently**
Semua theme sudah tested dan berfungsi dengan baik. Tidak ada known issues saat ini.

---

## 📈 Future Improvements

Potential enhancements untuk versi mendatang:

1. **More Themes**
   - TikTok: AMOLED black theme
   - WhatsApp: iOS-style light theme
   - Instagram: Gradient themes

2. **Custom Colors**
   - User dapat memilih warna bubble sendiri
   - Custom background colors

3. **Auto Theme Detection**
   - Detect waktu dan suggest theme (night = dark, day = light)

4. **Theme Preview**
   - Preview theme sebelum generate
   - Live preview dalam form

---

## 📄 Files Modified

### **Generators:**
- `lib/generators/tiktok.ts` - Added theme support
- `lib/generators/igstory.ts` - Added theme support
- `lib/generators/whatsapp.ts` - Added theme support

### **API Routes:**
- `app/api/generate/tiktok/route.ts` - Accept theme parameter
- `app/api/generate/igstory/route.ts` - Accept theme parameter
- `app/api/generate/whatsapp/route.ts` - Accept theme parameter

### **UI:**
- `app/page.tsx` - Added theme selectors for all three generators

---

## ✅ Testing Checklist

- [x] TikTok Light Mode renders correctly
- [x] TikTok Dark Mode renders correctly
- [x] Instagram Story Light Mode renders correctly
- [x] Instagram Story Dark Mode renders correctly
- [x] WhatsApp Light Mode renders correctly
- [x] WhatsApp Dark Mode renders correctly
- [x] Theme parameter is optional (backward compatible)
- [x] Default themes work as expected
- [x] No TypeScript errors
- [x] No runtime errors
- [x] Server compiles successfully

---

## 🎉 Summary

Fitur theme modes berhasil ditambahkan ke **3 generator utama**:
- ✅ **TikTok**: Light & Dark Mode
- ✅ **Instagram Story**: Light & Dark Mode  
- ✅ **WhatsApp**: Light & Dark Mode

Setiap theme memiliki color palette yang sesuai dengan aplikasi aslinya, memberikan hasil yang lebih realistis dan fleksibel untuk pengguna.

**Status:** ✅ Ready to Use!
