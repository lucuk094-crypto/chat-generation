import axios from "axios";
import * as cheerio from "cheerio";

interface SearchResult {
  title: string;
  type: string;
  url: string;
}

interface PhoneSpecs {
  status: boolean;
  title: string;
  image: string | null;
  description: string;
  release: string | null;
  network: string | null;
  display: {
    type: string | null;
    size: string | null;
    resolution: string | null;
    refreshRate: string | null;
    ratio: string | null;
    density: string | null;
    protection: string | null;
  };
  performance: {
    chipset: string | null;
    cpu: string | null;
    gpu: string | null;
    ram: string | null;
    ramType: string | null;
    storage: string | null;
    storageType: string | null;
    external: string | null;
  };
  battery: {
    capacity: string | null;
    charging: string | null;
    wireless: string | null;
    reverse: string | null;
    reverseWireless: string | null;
    bypass: string | null;
  };
  camera: {
    total: string | null;
    configuration: string | null;
    features: string | null;
    video: string | null;
  };
  connectivity: {
    wlan: string | null;
    bluetooth: string | null;
    infrared: string | null;
    nfc: string | null;
    gps: string | null;
    usb: string | null;
  };
  system: {
    os: string | null;
    update: string | null;
  };
  body: {
    dimensions: string | null;
    weight: string | null;
    resistance: string | null;
    sim: string | null;
    esim: string | null;
    colors: string | null;
  };
  sensors: string | null;
  audio: {
    jack: string | null;
    features: string | null;
  };
  specs: Record<string, string>;
}

async function request(url: string): Promise<string> {
  try {
    const { data } = await axios.get(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      },
      timeout: 15000, // Increased to 15s
      maxRedirects: 5,
      validateStatus: (status) => status < 500
    });
    
    if (!data || data.length < 100) {
      throw new Error('Response kosong atau tidak valid dari server');
    }
    
    return data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      throw new Error('Koneksi timeout. Website tidak merespons. Coba lagi dalam beberapa saat.');
    }
    if (error.response?.status === 403) {
      throw new Error('Akses ditolak oleh website. Coba lagi nanti atau gunakan nama HP berbeda.');
    }
    if (error.response?.status === 404) {
      throw new Error('Halaman tidak ditemukan. Pastikan nama HP benar.');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error dari carisinyal.com. Website sedang bermasalah, coba lagi nanti.');
    }
    throw new Error(`Gagal mengakses website: ${error.message}`);
  }
}

async function search(keyword: string): Promise<SearchResult[]> {
  try {
    // Normalize search query: lowercase, remove extra spaces
    const normalizedKeyword = keyword.toLowerCase().trim().replace(/\s+/g, ' ');
    
    const html = await request(`https://carisinyal.com/?s=${encodeURIComponent(normalizedKeyword)}`);
    const $ = cheerio.load(html);
    const result: SearchResult[] = [];

    $(".oxy-post").each((_, el) => {
      const title = $(el).find(".oxy-post-title").text().trim();
      if (!title) return;
      
      const url = $(el).find(".oxy-post-title a").attr("href") 
                || $(el).find("a.oxy-post-title").attr("href") 
                || "";
      
      result.push({
        title,
        type: $(el).find(".oxy-post-meta").text().trim(),
        url
      });
    });

    // If no results, try alternative selectors
    if (result.length === 0) {
      $("article, .post, .search-result").each((_, el) => {
        const title = $(el).find("h2, h3, .title").text().trim();
        const url = $(el).find("a").first().attr("href") || "";
        
        if (title && url && url.includes('carisinyal.com')) {
          result.push({
            title,
            type: "ponsel",
            url
          });
        }
      });
    }

    if (result.length === 0) {
      // Try fuzzy search suggestions
      const suggestions = [
        `Coba: "${keyword} spesifikasi"`,
        `Coba: "${keyword.split(' ')[0]}" (brand saja)`,
        `Coba: Model lengkap (contoh: "Samsung Galaxy S23" bukan "S23")`
      ].join(', ');
      
      throw new Error(`Ponsel "${keyword}" tidak ditemukan. ${suggestions}`);
    }

    return result;
  } catch (error: any) {
    if (error.message.includes('tidak ditemukan')) {
      throw error;
    }
    throw new Error(`Gagal mencari ponsel: ${error.message}`);
  }
}

async function detail(url: string): Promise<PhoneSpecs> {
  try {
    const html = await request(url);
    const $ = cheerio.load(html);
    
    const specs: Record<string, string> = {};
    
    $("table.box-info tr.box-baris").each((_, el) => {
      const key = $(el).find("td.kolom-satu").text().trim();
      const value = $(el).find("td.kolom-dua").text().trim();
      if (key && value) specs[key] = value;
    });

    const get = (...keys: string[]): string | null => {
      for (const key of keys) {
        if (specs[key]) return specs[key];
      }
      return null;
    };

    const title = $("h1").first().text().trim();
    if (!title) {
      throw new Error('Data ponsel tidak lengkap');
    }

    return {
      status: true,
      title,
      image: $('meta[property="og:image"]').attr("content") || null,
      description: $('meta[name="description"]').attr("content") || "",
      release: get("Rilis"),
      network: get("Jaringan"),
      display: {
        type: get("Jenis"),
        size: get("Ukuran"),
        resolution: get("Resolusi"),
        refreshRate: get("Refresh Rate"),
        ratio: get("Rasio"),
        density: get("Kerapatan"),
        protection: get("Proteksi")
      },
      performance: {
        chipset: get("Chipset"),
        cpu: get("CPU"),
        gpu: get("GPU"),
        ram: get("RAM"),
        ramType: get("Jenis RAM"),
        storage: get("Memori Internal"),
        storageType: get("Jenis Memori"),
        external: get("Memori Eksternal")
      },
      battery: {
        capacity: get("Kapasitas"),
        charging: get("Daya Pengisian"),
        wireless: get("Wireless Charging"),
        reverse: get("Reverse Charging"),
        reverseWireless: get("Reverse Wireless Charging"),
        bypass: get("Bypass Charging")
      },
      camera: {
        total: get("Jumlah Kamera"),
        configuration: get("Konfigurasi"),
        features: get("Fitur"),
        video: get("Resolusi Video")
      },
      connectivity: {
        wlan: get("WLAN"),
        bluetooth: get("Bluetooth"),
        infrared: get("Infrared"),
        nfc: get("NFC"),
        gps: get("GPS"),
        usb: get("USB")
      },
      system: {
        os: get("OS (Saat Rilis)"),
        update: get("Jaminan Update")
      },
      body: {
        dimensions: get("Dimensi"),
        weight: get("Berat"),
        resistance: get("Ketahanan"),
        sim: get("SIM Card"),
        esim: get("eSIM"),
        colors: get("Warna")
      },
      sensors: get("Sensor"),
      audio: {
        jack: get("Jack 3.5mm"),
        features: get("Fitur Lainnya")
      },
      specs
    };
  } catch (error: any) {
    throw new Error(`Gagal mengambil detail ponsel: ${error.message}`);
  }
}

export async function getPhoneSpecs(query: string): Promise<PhoneSpecs> {
  let lastError: Error | null = null;
  
  // Retry up to 2 times
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`Phone Specs attempt ${attempt} for: ${query}`);
      
      const results = await search(query);
      
      if (!results || results.length === 0) {
        throw new Error("Ponsel tidak ditemukan");
      }

      // Prioritize exact matches first
      let phone = results.find(r => {
        const title = r.title.toLowerCase();
        const q = query.toLowerCase();
        return title.includes(q) && (r.type || "").toLowerCase().includes("ponsel");
      });

      // If no exact match, try any phone type
      if (!phone) {
        phone = results.find(r => (r.type || "").toLowerCase().includes("ponsel"));
      }

      // If still no match, take first result with valid URL
      if (!phone) {
        phone = results.find(r => r.url && r.url.includes('carisinyal.com'));
      }

      // Last resort: take first result
      if (!phone) {
        phone = results[0];
      }
      
      if (!phone || !phone.url) {
        throw new Error(`URL ponsel tidak valid. Hasil: ${results.length} item, tapi tidak ada URL.`);
      }

      const data = await detail(phone.url);
      
      // Validate data
      if (!data.title || data.title.length < 3) {
        throw new Error('Data ponsel tidak lengkap atau invalid');
      }
      
      console.log(`Phone Specs success: ${data.title}`);
      return data;

    } catch (error: any) {
      console.error(`Phone Specs attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Don't retry for these errors
      if (error.message.includes('tidak ditemukan') || 
          error.message.includes('403') ||
          error.message.includes('404')) {
        break;
      }
      
      // Wait before retry
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  // All attempts failed
  let errorMsg = lastError?.message || 'Gagal mengambil spesifikasi ponsel';
  
  // Provide helpful error messages
  if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT')) {
    errorMsg = 'Website terlalu lama merespons setelah beberapa percobaan. Coba lagi nanti atau gunakan nama HP yang lebih umum (contoh: "Samsung S24", "iPhone 15").';
  } else if (errorMsg.includes('403') || errorMsg.includes('ditolak')) {
    errorMsg = 'Akses ke database HP diblokir sementara. Ini masalah dari website sumber (carisinyal.com). Coba:\n• Tunggu 5-10 menit\n• Gunakan nama HP berbeda\n• Coba lagi nanti';
  } else if (errorMsg.includes('tidak ditemukan')) {
    errorMsg += '\n\n💡 Tips:\n• Gunakan nama lengkap: "Samsung Galaxy S24" bukan "S24"\n• Sertakan brand: "iPhone 15 Pro", "Xiaomi 14"\n• Contoh yang benar: "OPPO Reno 11", "Vivo V30", "Realme 12"';
  } else if (errorMsg.includes('Response kosong')) {
    errorMsg = 'Website sumber tidak memberikan data valid. Ini masalah dari carisinyal.com, bukan dari aplikasi. Coba lagi dalam beberapa menit.';
  } else if (errorMsg.includes('Server error')) {
    errorMsg += '\n\nWebsite carisinyal.com sedang down. Tunggu beberapa menit dan coba lagi.';
  }
  
  throw new Error(errorMsg);
}
