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
  const { data } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    timeout: 15000
  });
  return data;
}

async function search(keyword: string): Promise<SearchResult[]> {
  const html = await request(`https://carisinyal.com/?s=${encodeURIComponent(keyword)}`);
  const $ = cheerio.load(html);
  const result: SearchResult[] = [];

  $(".oxy-post").each((_, el) => {
    const title = $(el).find(".oxy-post-title").text().trim();
    if (!title) return;
    
    result.push({
      title,
      type: $(el).find(".oxy-post-meta").text().trim(),
      url: $(el).find(".oxy-post-title").attr("href") || ""
    });
  });

  return result;
}

async function detail(url: string): Promise<PhoneSpecs> {
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

  return {
    status: true,
    title: $("h1").first().text().trim(),
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
}

export async function getPhoneSpecs(query: string): Promise<PhoneSpecs> {
  try {
    const results = await search(query);
    
    if (!results || results.length === 0) {
      throw new Error("Ponsel tidak ditemukan");
    }

    const phone = results.find(r => (r.type || "").toLowerCase().includes("ponsel")) || results[0];
    
    if (!phone || !phone.url) {
      throw new Error("URL ponsel tidak valid");
    }

    const data = await detail(phone.url);
    return data;

  } catch (error: any) {
    console.error('Failed to get phone specs:', error);
    throw new Error(error.message || 'Failed to get phone specs');
  }
}
