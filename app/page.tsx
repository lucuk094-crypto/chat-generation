'use client';

import { useState, useEffect } from 'react';
import { Upload, Download, MessageCircle, Clock, Type, X } from 'lucide-react';
import Image from 'next/image';
import InstallPWA from '../components/InstallPWA';

function InputField({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-400">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <Icon size={16} />
          </div>
        )}
        <input
          type="text"
          className={`w-full bg-black border border-neutral-800 rounded-md py-2.5 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all text-sm ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-400">{label}</label>
      <textarea
        className="w-full bg-black border border-neutral-800 rounded-md px-3 py-2 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all min-h-[100px] resize-y text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function ImageUploadField({ label, value, onChange }: any) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-400">{label}</label>
      <div className="relative group">
        {value ? (
          <div className="relative w-full h-32 rounded-md overflow-hidden border border-neutral-800 bg-black group-hover:border-neutral-600 transition-colors">
            <Image src={value} alt="Preview" width={128} height={128} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white font-medium bg-black/50 px-3 py-1.5 rounded-md backdrop-blur-sm">Change Image</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-32 rounded-md border border-dashed border-neutral-800 bg-black flex flex-col items-center justify-center gap-3 group-hover:border-neutral-600 transition-colors cursor-pointer text-neutral-500 group-hover:text-neutral-300">
            <Upload size={18} />
            <span className="text-sm font-medium">Upload image</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-400">{label}</label>
      <select
        className="w-full bg-black border border-neutral-800 rounded-md px-3 py-2.5 text-neutral-100 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GenerateButton({ onClick, loading }: { onClick: () => void, loading: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 bg-white text-black font-medium text-sm py-2.5 rounded-md hover:bg-neutral-200 transition-all disabled:opacity-50"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        'Generate Art'
      )}
    </button>
  );
}

function ResultPreview({ imageBase64 }: { imageBase64: string | null }) {
    if (!imageBase64) return null;

    const isVideo = imageBase64.startsWith('data:video');
    const isGif = imageBase64.startsWith('data:image/gif');
    
    // Determine file extension and label
    let fileExt = 'png';
    let fileLabel = 'Image';
    if (isVideo) {
      fileExt = 'mp4';
      fileLabel = 'Video';
    } else if (isGif) {
      fileExt = 'gif';
      fileLabel = 'GIF';
    }

    return (
        <div className="mt-8 pt-8 border-t border-neutral-800 flex flex-col items-center animate-in fade-in duration-500">
            <div className="w-full flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-200">Generated Result</h3>
                <a
                    href={imageBase64}
                    download={`generated-art.${fileExt}`}
                    className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium rounded-md border border-neutral-800 transition-colors"
                >
                    <Download size={14} />
                    Save {fileLabel}
                </a>
            </div>
            <div className="relative w-full max-w-sm rounded-md overflow-hidden border border-neutral-800 bg-black shadow-xl">
                {isVideo ? (
                    <video src={imageBase64} controls autoPlay loop className="w-full h-auto" />
                ) : isGif ? (
                    <img src={imageBase64} alt="Generated GIF" className="w-full h-auto" />
                ) : (
                    <Image src={imageBase64} alt="Generated" width={500} height={500} className="w-full h-auto" />
                )}
            </div>
        </div>
    );
}


export default function Home() {
  const [activeTab, setActiveTab] = useState<'tiktok' | 'igstory' | 'whatsapp' | 'kompas' | 'fakecall' | 'callandro' | 'brat' | 'fakedana' | 'fakeovo' | 'bratvermeil' | 'bratvermeilVid' | 'bratVid' | 'bratGojo' | 'bratGojoVid' | 'fakeff' | 'fakeffv2' | 'fakeffduo' | 'timpateks' | 'systeminfo' | 'beautifulmeme' | 'iqcpink' | 'phonespecs' | 'murotal' | 'wmp1' | 'wmp2' | 'nokia' | 'fakeigprofile'>('tiktok');

  // States for TikTok
  const [ttUser, setTtUser] = useState('');
  const [ttText, setTtText] = useState('');
  const [ttAvatar, setTtAvatar] = useState('');
  const [ttTheme, setTtTheme] = useState('light');

  // States for IG Story
  const [igName, setIgName] = useState('');
  const [igUser, setIgUser] = useState('');
  const [igPhoto, setIgPhoto] = useState('');
  const [igPP, setIgPP] = useState('');
  const [igTheme, setIgTheme] = useState('dark');

  // States for WhatsApp
  const [waText, setWaText] = useState('');
  const [waTime, setWaTime] = useState('');
  const [waImg, setWaImg] = useState('');
  const [waTheme, setWaTheme] = useState('dark');

  // States for Kompas
  const [kpText, setKpText] = useState('');
  const [kpPhoto, setKpPhoto] = useState('');

  // States for Fake Call
  const [fcName, setFcName] = useState('');
  const [fcDuration, setFcDuration] = useState('');
  const [fcAvatar, setFcAvatar] = useState('');

  // States for Call Andro
  const [caName, setCaName] = useState('');
  const [caDuration, setCaDuration] = useState('');
  const [caAvatar, setCaAvatar] = useState('');

  // States for Brat Img
  const [bratText, setBratText] = useState('');
  const [bratTheme, setBratTheme] = useState('white');
  const [bratBlur, setBratBlur] = useState(0);

  // States for Fake Dana
  const [danaAmount, setDanaAmount] = useState('');

  // States for Fake OVO
  const [ovoAmount, setOvoAmount] = useState('');

  // States for Brat Vermeil
  const [vermeilText, setVermeilText] = useState('');

  // States for BratVid Vermeil
  const [vermeilVidText, setVermeilVidText] = useState('');

  // States for Brat Vid
  const [bratVidText, setBratVidText] = useState('');
  const [bratVidTheme, setBratVidTheme] = useState('white');
  const [bratVidBlur, setBratVidBlur] = useState(0);
  const [bratVidFormat, setBratVidFormat] = useState('mp4');

  // States for Brat Gojo
  const [bratGojoText, setBratGojoText] = useState('');

  // States for BratVid Gojo
  const [bratGojoVidText, setBratGojoVidText] = useState('');

  // States for Fake FF
  const [ffNickname, setFfNickname] = useState('');

  // States for Fake FF V2
  const [ffv2Username, setFfv2Username] = useState('');

  // States for Fake FF Duo
  const [ffduoNickname1, setFfduoNickname1] = useState('');
  const [ffduoNickname2, setFfduoNickname2] = useState('');

  // States for Timpa Teks
  const [timpaTeksUsername, setTimpaTeksUsername] = useState('');
  const [timpaTeksText, setTimpaTeksText] = useState('');

  // States for Beautiful Meme
  const [beautifulImage1, setBeautifulImage1] = useState('');
  const [beautifulImage2, setBeautifulImage2] = useState('');

  // States for IQC Pink
  const [iqcPinkText, setIqcPinkText] = useState('');
  const [iqcPinkTime, setIqcPinkTime] = useState('');

  // States for Phone Specs
  const [phoneQuery, setPhoneQuery] = useState('');
  const [phoneSpecs, setPhoneSpecs] = useState<any>(null);

  // States for Murotal
  const [murotalQuery, setMurotalQuery] = useState('');
  const [murotalResults, setMurotalResults] = useState<any[]>([]);

  // States for WMP1
  const [wmp1Text, setWmp1Text] = useState('');

  // States for WMP2
  const [wmp2Text, setWmp2Text] = useState('');

  // States for Nokia
  const [nokiaText, setNokiaText] = useState('');
  const [nokiaFrom, setNokiaFrom] = useState('');
  const [nokiaDate, setNokiaDate] = useState('');
  const [nokiaTime, setNokiaTime] = useState('');
  const [nokiaTitle, setNokiaTitle] = useState('');

  // States for Fake IG Profile
  const [igProfilePpUrl, setIgProfilePpUrl] = useState('');
  const [igProfileUsername, setIgProfileUsername] = useState('');
  const [igProfilePostingan, setIgProfilePostingan] = useState('');
  const [igProfileMengikuti, setIgProfileMengikuti] = useState('');
  const [igProfilePengikut, setIgProfilePengikut] = useState('');
  const [igProfileBio, setIgProfileBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isDevModalOpen, setIsDevModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPromoModalOpen(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { id: 'tiktok', label: 'TikTok' },
    { id: 'igstory', label: 'IG Story' },
    { id: 'fakeigprofile', label: 'Fake IG Profile' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'kompas', label: 'Kompas' },
    { id: 'fakecall', label: 'Call IOS' },
    { id: 'callandro', label: 'Call Andro' },
    { id: 'fakeff', label: 'Fake FF' },
    { id: 'fakeffv2', label: 'Fake FF V2' },
    { id: 'fakeffduo', label: 'Fake FF Duo' },
    { id: 'timpateks', label: 'Timpa Teks' },
    { id: 'systeminfo', label: 'System Info' },
    { id: 'beautifulmeme', label: 'Beautiful Meme' },
    { id: 'iqcpink', label: 'IQC Pink' },
    { id: 'phonespecs', label: 'Phone Specs' },
    { id: 'murotal', label: 'Murotal' },
    { id: 'wmp1', label: 'WMP1 Canvas' },
    { id: 'wmp2', label: 'WMP2 Canvas' },
    { id: 'nokia', label: 'Nokia Canvas' },
    { id: 'brat', label: 'Brat Img' },
    { id: 'bratVid', label: 'Brat Vid' },
    { id: 'bratGojo', label: 'Brat Gojo' },
    { id: 'bratGojoVid', label: 'BratVid Gojo' },
    { id: 'fakedana', label: 'Fake Dana' },
    { id: 'fakeovo', label: 'Fake OVO' },
    { id: 'bratvermeil', label: 'Brat Vermeil' },
    { id: 'bratvermeilVid', label: 'BratVid Vermeil' },
  ];

  const handleGenerate = async (endpoint: string, payload: any) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setPhoneSpecs(null);
    setMurotalResults([]);
    try {
      const res = await fetch(`/api/generate/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      // Handle phone specs differently (JSON response)
      if (endpoint === 'phonespecs') {
        setPhoneSpecs(data);
      } else if (endpoint === 'murotal') {
        setMurotalResults(data.data || []);
      } else {
        setResult(data.image);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black font-sans selection:bg-neutral-800 flex flex-col items-center pt-12 pb-24 px-4 sm:px-6">
      <div className="w-full max-w-[540px] flex flex-col gap-6">

        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <Image src="/faficon.jpeg" alt="Logo" width={224} height={224} className="w-48 h-48 sm:w-56 sm:h-56 object-contain drop-shadow-2xl" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight font-aesthetic">Fake Chat Generator</h1>
          <p className="text-neutral-500 text-sm">Create beautiful mockups for social media.</p>
        </header>

        <div className="bg-black border border-neutral-800 rounded-lg shadow-xl overflow-hidden">

          <div className="flex w-full border-b border-neutral-800 p-1.5 gap-1 bg-black overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setResult(null); setError(null); }}
                className={`flex-none min-w-[100px] flex-1 py-2 text-sm font-medium text-center whitespace-nowrap px-3 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-sm ring-1 ring-neutral-800'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* All the forms... */}
            {activeTab === 'tiktok' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Username" placeholder="@username" value={ttUser} onChange={setTtUser} icon={Type} />
                <TextAreaField label="Chat Text" placeholder="Enter the comment..." value={ttText} onChange={setTtText} />
                <ImageUploadField label="Avatar Image" value={ttAvatar} onChange={setTtAvatar} />
                <SelectField
                  label="Theme"
                  value={ttTheme}
                  onChange={setTtTheme}
                  options={[
                    { value: 'light', label: 'Light Mode' },
                    { value: 'dark', label: 'Dark Mode' }
                  ]}
                />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('tiktok', { username: ttUser || 'User', chatText: ttText || 'Hello', avatarSrc: ttAvatar, theme: ttTheme })}
                />
              </div>
            )}
            {activeTab === 'igstory' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Display Name" placeholder="Name" value={igName} onChange={setIgName} />
                  <InputField label="Username" placeholder="@user" value={igUser} onChange={setIgUser} />
                </div>
                <ImageUploadField label="Profile Picture" value={igPP} onChange={setIgPP} />
                <ImageUploadField label="Background Photo" value={igPhoto} onChange={setIgPhoto} />
                <SelectField
                  label="Theme"
                  value={igTheme}
                  onChange={setIgTheme}
                  options={[
                    { value: 'dark', label: 'Dark Mode' },
                    { value: 'light', label: 'Light Mode' }
                  ]}
                />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('igstory', { nama: igName || 'User', username: igUser || '@user', ppSrc: igPP, photoSrc: igPhoto, theme: igTheme })}
                />
              </div>
            )}
            {activeTab === 'fakeigprofile' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField 
                  label="Profile Picture URL" 
                  placeholder="https://i.pravatar.cc/150?img=1" 
                  value={igProfilePpUrl} 
                  onChange={setIgProfilePpUrl} 
                  icon={Upload} 
                />
                <InputField 
                  label="Username" 
                  placeholder="vanx" 
                  value={igProfileUsername} 
                  onChange={setIgProfileUsername} 
                  icon={Type} 
                />
                <div className="grid grid-cols-3 gap-4">
                  <InputField 
                    label="Postingan" 
                    placeholder="123" 
                    value={igProfilePostingan} 
                    onChange={setIgProfilePostingan} 
                    icon={Type} 
                  />
                  <InputField 
                    label="Mengikuti" 
                    placeholder="0" 
                    value={igProfileMengikuti} 
                    onChange={setIgProfileMengikuti} 
                    icon={Type} 
                  />
                  <InputField 
                    label="Pengikut" 
                    placeholder="1.435" 
                    value={igProfilePengikut} 
                    onChange={setIgProfilePengikut} 
                    icon={Type} 
                  />
                </div>
                <TextAreaField 
                  label="Bio" 
                  placeholder="hallo im " 
                  value={igProfileBio} 
                  onChange={setIgProfileBio} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">📸 Info:</span> Generate profile Instagram palsu dengan statistik custom (postingan, mengikuti, pengikut) dan bio. Gunakan URL gambar untuk profile picture (imgur.com, i.pravatar.cc, dll).
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakeigprofile', { 
                    ppUrl: igProfilePpUrl || 'https://i.pravatar.cc/150?img=1',
                    username: igProfileUsername || 'vanx',
                    postingan: igProfilePostingan || '123',
                    mengikuti: igProfileMengikuti || '0',
                    pengikut: igProfilePengikut || '1.435',
                    bio: igProfileBio || 'hallo im '
                  })}
                />
              </div>
            )}
            {activeTab === 'whatsapp' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Chat Text" placeholder="Type a message... (supports emojis)" value={waText} onChange={setWaText} />
                <InputField label="Time" placeholder="16:34" value={waTime} onChange={setWaTime} icon={Clock} />
                <ImageUploadField label="Attachment (Optional)" value={waImg} onChange={setWaImg} />
                <SelectField
                  label="Theme"
                  value={waTheme}
                  onChange={setWaTheme}
                  options={[
                    { value: 'dark', label: 'Dark Mode' },
                    { value: 'light', label: 'Light Mode' }
                  ]}
                />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('whatsapp', { text: waText || 'Hello', timeStr: waTime || '12:00', imgUrl: waImg, theme: waTheme })}
                />
              </div>
            )}
            {activeTab === 'kompas' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Headline Text" placeholder="Breaking news..." value={kpText} onChange={setKpText} />
                <ImageUploadField label="News Photo" value={kpPhoto} onChange={setKpPhoto} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('kompas', { newsText: kpText || 'Breaking News', photoSrc: kpPhoto })}
                />
              </div>
            )}
            {activeTab === 'fakecall' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Name" placeholder="my heart ❤️" value={fcName} onChange={setFcName} icon={Type} />
                <InputField label="Duration" placeholder="01:00:39" value={fcDuration} onChange={setFcDuration} icon={Clock} />
                <ImageUploadField label="Avatar Image" value={fcAvatar} onChange={setFcAvatar} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakecall', { nama: fcName || 'my heart ❤️', durasi: fcDuration || '01:00:39', avatarSrc: fcAvatar })}
                />
              </div>
            )}
            {activeTab === 'callandro' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Name" placeholder="Sayangku" value={caName} onChange={setCaName} icon={Type} />
                <InputField label="Duration" placeholder="01:32:04" value={caDuration} onChange={setCaDuration} icon={Clock} />
                <ImageUploadField label="Avatar Image" value={caAvatar} onChange={setCaAvatar} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('callandro', { nama: caName || 'Sayangku', durasi: caDuration || '01:32:04', avatarSrc: caAvatar })}
                />
              </div>
            )}
            {activeTab === 'fakeff' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Nickname" placeholder="VanxDev" value={ffNickname} onChange={setFfNickname} icon={Type} />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🎮 Info:</span> Generate tampilan lobby Free Fire dengan nickname custom. Hasilnya berupa screenshot lobby game Free Fire.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakeff', { nickname: ffNickname || 'VanxDev' })}
                />
              </div>
            )}
            {activeTab === 'fakeffv2' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField 
                  label="Username" 
                  placeholder="VanxDev" 
                  value={ffv2Username} 
                  onChange={setFfv2Username} 
                  icon={Type} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🎮 Info:</span> Generate tampilan Free Fire V2 dengan username custom menggunakan API nexadev.my.id. Template berbeda dari Fake FF versi pertama.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakeffv2', { username: ffv2Username || 'VanxDev' })}
                />
              </div>
            )}
            {activeTab === 'fakeffduo' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField 
                  label="Nickname Player 1" 
                  placeholder="Vanx 😠" 
                  value={ffduoNickname1} 
                  onChange={setFfduoNickname1} 
                  icon={Type} 
                />
                <InputField 
                  label="Nickname Player 2" 
                  placeholder="Boty" 
                  value={ffduoNickname2} 
                  onChange={setFfduoNickname2} 
                  icon={Type} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🎮 Info:</span> Generate tampilan Free Fire mode Duo/Squad dengan 2 nickname. Perfect untuk screenshot duo/team mode. Support emoji di nickname.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakeffduo', { 
                    nickname1: ffduoNickname1 || 'Vanx 😠',
                    nickname2: ffduoNickname2 || 'Boty'
                  })}
                />
              </div>
            )}
            {activeTab === 'timpateks' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Username" placeholder="Rin" value={timpaTeksUsername} onChange={setTimpaTeksUsername} icon={Type} />
                <TextAreaField 
                  label="Text Meme" 
                  placeholder="Katanya just friend kok manggil sayang" 
                  value={timpaTeksText} 
                  onChange={setTimpaTeksText} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">📝 Info:</span> Generate meme dengan template polisi yang sedang menulis. Text akan ditampilkan pada kertas dengan format 2 kata per baris. Username akan muncul di bagian bawah kertas dengan tanda ~.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('timpateks', { 
                    username: timpaTeksUsername || 'Rin',
                    text: timpaTeksText || 'Katanya just friend kok manggil sayang'
                  })}
                />
              </div>
            )}
            {activeTab === 'systeminfo' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">💻 Info:</span> Generate laporan sistem lengkap dalam bentuk visual canvas. Menampilkan informasi CPU, Memory, Network Interfaces, Load Average, dan statistik sistem lainnya. Tidak memerlukan input, cukup klik Generate.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('systeminfo', {})}
                />
              </div>
            )}
            {activeTab === 'beautifulmeme' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <ImageUploadField label="Image 1 (Top)" value={beautifulImage1} onChange={setBeautifulImage1} />
                <ImageUploadField label="Image 2 (Bottom)" value={beautifulImage2} onChange={setBeautifulImage2} />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🖼️ Info:</span> Generate meme indah dengan 2 gambar yang ditampilkan dalam template aesthetic. Upload 2 gambar berbeda, gambar pertama akan muncul di atas dan gambar kedua di bawah dengan frame yang cantik.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('beautifulmeme', { 
                    image1: beautifulImage1 || 'https://i.pinimg.com/originals/a4/3d/51/a43d516ebf188c59c6c4dbc917844c82.jpg',
                    image2: beautifulImage2 || 'https://i.pinimg.com/originals/a4/3d/51/a43d516ebf188c59c6c4dbc917844c82.jpg'
                  })}
                />
              </div>
            )}
            {activeTab === 'iqcpink' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField 
                  label="Chat Text" 
                  placeholder="Kesendirian adalah teman terbaik ku😂😂" 
                  value={iqcPinkText} 
                  onChange={setIqcPinkText} 
                />
                <InputField 
                  label="Time" 
                  placeholder="22.54" 
                  value={iqcPinkTime} 
                  onChange={setIqcPinkTime} 
                  icon={Clock} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">💬 Info:</span> Generate iPhone chat bubble dengan tema pink aesthetic. Chat bubble dengan shadow, tail, timestamp, dan double check marks. Support emoji Apple style. Perfect untuk quote aesthetic Instagram.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('iqcpink', { 
                    text: iqcPinkText || 'Kesendirian adalah teman terbaik ku😂😂',
                    time: iqcPinkTime || '22.54'
                  })}
                />
              </div>
            )}
            {activeTab === 'phonespecs' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField 
                  label="Phone Name" 
                  placeholder="Samsung Galaxy S24" 
                  value={phoneQuery} 
                  onChange={setPhoneQuery} 
                  icon={Type} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed mb-2">
                    <span className="text-neutral-300 font-medium">📱 Tips Pencarian:</span>
                  </p>
                  <ul className="text-xs text-neutral-400 space-y-1 ml-4">
                    <li>✓ Gunakan nama lengkap: "Samsung Galaxy S24" (bukan "S24")</li>
                    <li>✓ Sertakan brand: "iPhone 15 Pro", "Redmi Note 13"</li>
                    <li>✓ Huruf besar/kecil tidak masalah</li>
                    <li>✓ Contoh: "Xiaomi 14", "OPPO Reno 11", "Vivo V30"</li>
                  </ul>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('phonespecs', { 
                    query: phoneQuery || 'oppo a3s'
                  })}
                />
                {phoneSpecs && (
                  <div className="mt-4 p-4 bg-neutral-900 border border-neutral-800 rounded-md max-h-[500px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-white">{phoneSpecs.title}</h3>
                      <button
                        onClick={() => {
                          const dataStr = JSON.stringify(phoneSpecs, null, 2);
                          const dataBlob = new Blob([dataStr], { type: 'application/json' });
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${phoneSpecs.title.replace(/\s+/g, '_')}_specs.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-md border border-neutral-700 transition-colors"
                      >
                        <Download size={14} />
                        Download JSON
                      </button>
                    </div>
                    {phoneSpecs.image && (
                      <img src={phoneSpecs.image} alt={phoneSpecs.title} className="w-full max-w-xs mb-4 rounded-md" />
                    )}
                    <div className="space-y-3 text-xs">
                      {phoneSpecs.release && (
                        <div><span className="text-neutral-400">Release:</span> <span className="text-white">{phoneSpecs.release}</span></div>
                      )}
                      {phoneSpecs.display?.size && (
                        <div><span className="text-neutral-400">Display:</span> <span className="text-white">{phoneSpecs.display.size} {phoneSpecs.display.type}</span></div>
                      )}
                      {phoneSpecs.performance?.chipset && (
                        <div><span className="text-neutral-400">Chipset:</span> <span className="text-white">{phoneSpecs.performance.chipset}</span></div>
                      )}
                      {phoneSpecs.performance?.ram && (
                        <div><span className="text-neutral-400">RAM:</span> <span className="text-white">{phoneSpecs.performance.ram}</span></div>
                      )}
                      {phoneSpecs.performance?.storage && (
                        <div><span className="text-neutral-400">Storage:</span> <span className="text-white">{phoneSpecs.performance.storage}</span></div>
                      )}
                      {phoneSpecs.battery?.capacity && (
                        <div><span className="text-neutral-400">Battery:</span> <span className="text-white">{phoneSpecs.battery.capacity}</span></div>
                      )}
                      {phoneSpecs.camera?.configuration && (
                        <div><span className="text-neutral-400">Camera:</span> <span className="text-white">{phoneSpecs.camera.configuration}</span></div>
                      )}
                      {phoneSpecs.system?.os && (
                        <div><span className="text-neutral-400">OS:</span> <span className="text-white">{phoneSpecs.system.os}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'murotal' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField 
                  label="Cari Qari" 
                  placeholder="Masukkan nama Qari (contoh: Mishary, Sudais, Husary)" 
                  value={murotalQuery} 
                  onChange={setMurotalQuery} 
                  icon={Type} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🕌 Info:</span> Database berisi 239 Qari dari mp3quran.net. Cari Qari favorit Anda atau klik "Cari Qari" tanpa input untuk melihat semua. Hasil akan menampilkan nama Qari, status (Al-Qur'an Lengkap / jumlah Surah), dan link download.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('murotal', { 
                    query: murotalQuery
                  })}
                />
                {murotalResults.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Hasil Pencarian ({murotalResults.length})</h3>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
                      {murotalResults.map((qari) => (
                        <div 
                          key={qari.id} 
                          className="p-4 bg-neutral-900 border border-neutral-800 rounded-md hover:border-neutral-700 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white mb-1">{qari.name}</h4>
                              <p className="text-xs text-neutral-400 mb-2">
                                <span className="inline-flex items-center gap-1">
                                  📖 {qari.status}
                                </span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={qari.page}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded border border-neutral-700 transition-colors"
                                >
                                  🔗 Halaman
                                </a>
                                <a
                                  href={qari.downloads}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-900 hover:bg-green-800 text-white text-xs font-medium rounded border border-green-700 transition-colors"
                                >
                                  <Download size={12} />
                                  Download
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'wmp1' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField 
                  label="Text (gunakan | sebagai pemisah)" 
                  placeholder="ngapain cemburu|kan|cuman sebatas|teman" 
                  value={wmp1Text} 
                  onChange={setWmp1Text} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">💬 Info:</span> Buat canvas WMP1 dengan text custom. Gunakan tanda | (pipe) untuk memisahkan kata/frase. Contoh: "ngapain cemburu|kan|cuman sebatas|teman" akan membuat canvas dengan 4 baris text.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('wmp1', { 
                    text: wmp1Text || 'ngapain cemburu|kan|cuman sebatas|teman'
                  })}
                />
              </div>
            )}
            {activeTab === 'wmp2' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField 
                  label="Text (gunakan | sebagai pemisah)" 
                  placeholder="ngapain cemburu|kan|cuman sebatas|teman" 
                  value={wmp2Text} 
                  onChange={setWmp2Text} 
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">💬 Info:</span> Buat canvas WMP2 dengan text custom. Gunakan tanda | (pipe) untuk memisahkan kata/frase. Contoh: "ngapain cemburu|kan|cuman sebatas|teman" akan membuat canvas dengan 4 baris text. WMP2 memiliki style berbeda dari WMP1.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('wmp2', { 
                    text: wmp2Text || 'ngapain cemburu|kan|cuman sebatas|teman'
                  })}
                />
              </div>
            )}
            {activeTab === 'nokia' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField 
                  label="Text / Pesan" 
                  placeholder="kata-kata hari ini" 
                  value={nokiaText} 
                  onChange={setNokiaText} 
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="From / Pengirim" 
                    placeholder="Vanx" 
                    value={nokiaFrom} 
                    onChange={setNokiaFrom} 
                    icon={Type} 
                  />
                  <InputField 
                    label="Title / Judul" 
                    placeholder="Van-X" 
                    value={nokiaTitle} 
                    onChange={setNokiaTitle} 
                    icon={Type} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Date (DD/MM/YYYY)" 
                    placeholder="08/06/2026" 
                    value={nokiaDate} 
                    onChange={setNokiaDate} 
                    icon={Clock} 
                  />
                  <InputField 
                    label="Time (HH:MM)" 
                    placeholder="12:00" 
                    value={nokiaTime} 
                    onChange={setNokiaTime} 
                    icon={Clock} 
                  />
                </div>
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">📱 Info:</span> Buat canvas style Nokia klasik dengan pesan, pengirim, judul, tanggal dan waktu. Cocok untuk membuat quote atau pesan dengan tampilan retro Nokia.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('nokia', { 
                    text: nokiaText || 'kata-kata hari ini',
                    from: nokiaFrom || 'Vanx',
                    date: nokiaDate || '08/06/2026',
                    time: nokiaTime || '12:00',
                    title: nokiaTitle || 'Van-X'
                  })}
                />
              </div>
            )}
            {activeTab === 'brat' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Brat Canvas 🎨" value={bratText} onChange={setBratText} />
                <SelectField
                  label="Theme"
                  value={bratTheme}
                  onChange={setBratTheme}
                  options={[{ value: 'white', label: 'White' }, { value: 'black', label: 'Black' }, { value: 'green', label: 'Green' }]}
                />
                <SelectField
                  label="Blur"
                  value={bratBlur}
                  onChange={(v: any) => setBratBlur(parseInt(v, 10))}
                  options={[{ value: 0, label: '0' }, { value: 1, label: '1' }, { value: 2, label: '2' }, { value: 3, label: '3' }]}
                />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('brat', { text: bratText || 'Brat Canvas 🎨', theme: bratTheme, blur: bratBlur })}
                />
              </div>
            )}
            {activeTab === 'fakedana' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Nominal Saldo" placeholder="50.000" value={danaAmount} onChange={setDanaAmount} icon={Type} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakedana', { nominal: danaAmount || '50.000' })}
                />
              </div>
            )}
            {activeTab === 'fakeovo' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <InputField label="Nominal Saldo" placeholder="500.000" value={ovoAmount} onChange={setOvoAmount} icon={Type} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('fakeovo', { nominal: ovoAmount || '500.000' })}
                />
              </div>
            )}
             {activeTab === 'bratvermeil' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Watashi wa Verumei..." value={vermeilText} onChange={setVermeilText} />
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('bratvermeil', {
                    text: vermeilText || 'Watashi wa Verumei. Aruto no tsukaima no akuma yo.',
                  })}
                />
              </div>
            )}
            {activeTab === 'bratvermeilVid' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Watashi wa Verumei. Aruto no tsukaima no akuma yo." value={vermeilVidText} onChange={setVermeilVidText} />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">ℹ️ Info:</span> Video akan dibuat dengan animasi teks yang muncul bertahap (word-by-word). Proses ini membutuhkan ffmpeg dan bisa memakan waktu lebih lama.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('bratvermeilVid', {
                    text: vermeilVidText || 'Watashi wa Verumei. Aruto no tsukaima no akuma yo.',
                  })}
                />
              </div>
            )}
            {activeTab === 'bratVid' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Brat vid 🎥" value={bratVidText} onChange={setBratVidText} />
                <div className="grid grid-cols-2 gap-4">
                  <SelectField
                    label="Theme"
                    value={bratVidTheme}
                    onChange={setBratVidTheme}
                    options={[
                      { value: 'white', label: 'White' },
                      { value: 'black', label: 'Black' },
                      { value: 'green', label: 'Green' }
                    ]}
                  />
                  <SelectField
                    label="Blur"
                    value={bratVidBlur}
                    onChange={(v: any) => setBratVidBlur(parseInt(v, 10))}
                    options={[
                      { value: 0, label: '0 (No Blur)' },
                      { value: 1, label: '1' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3' }
                    ]}
                  />
                </div>
                <SelectField
                  label="Output Format"
                  value={bratVidFormat}
                  onChange={setBratVidFormat}
                  options={[
                    { value: 'mp4', label: 'MP4 (Video)' },
                    { value: 'gif', label: 'GIF (Animated)' }
                  ]}
                />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">ℹ️ Info:</span> Video dengan animasi word-by-word, support emoji 🎨. Teks akan muncul bertahap dengan efek reset setiap 7-8 kata.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('bratVid', {
                    text: bratVidText || 'Brat vid 🎥',
                    theme: bratVidTheme,
                    blur: bratVidBlur,
                    format: bratVidFormat
                  })}
                />
              </div>
            )}
            {activeTab === 'bratGojo' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Halo cuy" value={bratGojoText} onChange={setBratGojoText} />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🎨 Info:</span> Brat style dengan background Gojo Satoru. Text akan otomatis di-center dengan font sizing optimal.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('bratGojo', {
                    text: bratGojoText || 'Halo cuy',
                  })}
                />
              </div>
            )}
            {activeTab === 'bratGojoVid' && (
              <div className="flex flex-col gap-5 animate-in fade-in duration-300">
                <TextAreaField label="Text" placeholder="Nah, I'd win" value={bratGojoVidText} onChange={setBratGojoVidText} />
                <div className="p-3 bg-neutral-900/50 border border-neutral-800 rounded-md">
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    <span className="text-neutral-300 font-medium">🎥 Info:</span> Video animasi Brat Gojo dengan efek word-by-word. Text muncul bertahap dengan background Gojo Satoru. Durasi: 0.7s per kata, 1.5s frame terakhir.
                  </p>
                </div>
                <GenerateButton
                  loading={loading}
                  onClick={() => handleGenerate('bratGojoVid', {
                    text: bratGojoVidText || 'Nah, I\'d win',
                  })}
                />
              </div>
            )}


            {error && (
              <div className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-md flex items-start gap-3 animate-in fade-in">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <ResultPreview imageBase64={result} />
          </div>
        </div>

        <footer className="text-center flex flex-col items-center gap-4 pb-8">
          <button
            onClick={() => setIsDevModalOpen(true)}
            className="px-3 py-1.5 rounded-md border border-neutral-800 bg-black inline-flex items-center gap-2 hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <span className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">Developer</span>
            <div className="w-1 h-1 rounded-full bg-neutral-700" />
            <span className="text-white text-[11px] font-semibold tracking-wide">Van-X313</span>
          </button>
          <p className="text-neutral-600 text-xs font-medium">
            Canvas Arts by <span className="text-neutral-400">Ditzzx & Rin</span>
          </p>
        </footer>

      </div>

      {isDevModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsDevModalOpen(false)}>
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-black border border-neutral-800 rounded-lg shadow-2xl p-4 sm:p-6 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsDevModalOpen(false)} className="absolute top-4 right-4 z-10 p-1.5 text-neutral-400 hover:text-white bg-black/50 border border-neutral-800 rounded-md transition-colors backdrop-blur-sm">
              <X size={16} />
            </button>
            <div className="text-white space-y-4">
              <div className="text-center pb-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold tracking-tight">Tentang Developer</h2>
                <p className="text-sm text-neutral-400">Van-X313</p>
              </div>

              <div className="space-y-4 text-sm text-neutral-300 leading-relaxed">
                <p className="text-center text-lg mb-4">Halo, saya Developer 👋</p>
                <p>
                  Saya adalah seorang Web Developer yang berfokus pada pembuatan website modern, responsif, dan memiliki pengalaman pengguna (UI/UX) yang optimal. Saya senang mengubah ide menjadi solusi digital yang fungsional dengan menggabungkan desain kreatif, teknologi, dan kode yang bersih.
                </p>
                <p>
                  Saya memiliki ketertarikan dalam pengembangan aplikasi web, perancangan antarmuka yang intuitif, serta optimasi performa website agar dapat memberikan pengalaman terbaik bagi pengguna.
                </p>
              </div>

              <pre className="font-mono text-xs bg-black p-4 rounded-md overflow-x-auto custom-scrollbar">
{`┌────────────────────────────────────┐
│        VAN-X313 // DEVELOPER       │
└────────────────────────────────────┘

$ whoami
> Van-X313

$ role
> Web Developer | UI/UX Enthusiast

$ focus
├─ Frontend & Backend
├─ Desain UI / UX
├─ Web Aplication Development
└─ Clean Code & Best Practice

$ mission
> Membangun website modern,
> menarik, dan memberikan
> pengalaman digital terbaik.

$ status
> Learning • Building • Improving

[✓] Code  [✓] Design  [✓] Create`}
              </pre>
              <p className="text-sm text-neutral-300 leading-relaxed">
                Saya terus bereksperimen, dan mengembangkan kemampuan untuk menciptakan produk digital yang berkualitas, efektif, dan memberikan nilai bagi pengguna.
              </p>
            </div>
          </div>
        </div>
      )}

      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
          <div className="relative w-full max-w-sm bg-black border border-neutral-800 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsPromoModalOpen(false)} className="absolute top-3 right-3 p-1.5 text-neutral-400 hover:text-white bg-black/50 rounded-md border border-neutral-800 transition-colors z-10">
              <X size={16} />
            </button>
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-800">
                <MessageCircle size={24} className="text-[#25D366]" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">Join Our Developer Channel</h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Get the latest updates on new web tools, open-source projects, and exclusive utilities directly from the developer.
              </p>
              <a
                href="https://whatsapp.com/channel/0029Vb7PIC9KQuJRWvETIR2y"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsPromoModalOpen(false)}
                className="w-full bg-[#25D366] text-black font-semibold text-sm py-2.5 rounded-md hover:bg-[#20bd5a] transition-all flex items-center justify-center gap-2"
              >
                Join WhatsApp Channel
              </a>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="mt-4 text-[11px] font-medium text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PWA Install Button & Popup */}
      <InstallPWA />
    </main>
  );
}