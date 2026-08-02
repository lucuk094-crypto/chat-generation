# 🚂 Deploy ke Railway

## Langkah-langkah Deploy:

### 1. **Buat Akun Railway**
- Buka [railway.app](https://railway.app)
- Sign up dengan GitHub atau GitLab account

### 2. **Connect Repository**
- Klik "New Project"
- Pilih "Deploy from GitLab repo"
- Authorize Railway untuk akses GitLab
- Pilih repository: `affansmith80/fake-chat-generation`

### 3. **Railway Auto-Detect**
Railway akan otomatis:
- ✅ Detect `Dockerfile`
- ✅ Detect `railway.toml` config
- ✅ Install FFmpeg via Docker
- ✅ Build Next.js application
- ✅ Deploy ke production

### 4. **Set Environment Variables (Opsional)**
Jika ada env variables:
- Klik project → Settings → Variables
- Add variables yang dibutuhkan

### 5. **Deploy!**
- Railway akan auto-deploy setiap push ke `master` branch
- Build time: ~5-10 menit (pertama kali)
- Setelah itu: ~2-3 menit per deploy

### 6. **Get Domain**
Setelah deploy selesai:
- Klik "Settings" → "Networking"
- Railway akan provide domain: `xxx.railway.app`
- Atau bisa custom domain

## ✅ Keuntungan Railway:

- ✅ **FFmpeg Support** penuh
- ✅ **No timeout** untuk video processing
- ✅ **Auto-deploy** dari GitLab
- ✅ **Free tier**: $5 credit/bulan
- ✅ **Better performance** untuk video generation
- ✅ **Logs & Monitoring** lengkap

## 💰 Pricing:

**Free Tier:**
- $5 credit per bulan
- Cukup untuk ~500 hours runtime
- Cocok untuk project ini

**Pro Plan** (jika butuh lebih):
- $5/bulan base + usage
- More resources

## 🔧 Troubleshooting:

**Build gagal?**
- Check logs di Railway dashboard
- Pastikan Dockerfile syntax benar

**Video masih error?**
- Check FFmpeg installed: Railway logs akan show
- Test dengan: `ffmpeg -version` di container

**Out of memory?**
- Upgrade Railway plan
- Atau optimize video generation (reduce quality/size)

## 📝 Notes:

- Railway menggunakan **Dockerfile** untuk build
- FFmpeg di-install via `apk add ffmpeg` (Alpine Linux)
- Port default: 3000 (Railway auto-assign via $PORT env)
- Deployment otomatis setiap push ke GitLab

---

**Need help?** Check Railway docs: https://docs.railway.app
