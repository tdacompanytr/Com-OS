import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WALLPAPER_URL, APP_REGISTRY, GameIcon, PRESET_WALLPAPERS, THEMES } from './constants';
import { WindowState, AppId, MarketItem, ThemeConfig, Notification } from './types';
import Taskbar from './components/os/Taskbar';
import StartMenu from './components/os/StartMenu';
import Window from './components/os/Window';
import BootScreen from './components/os/BootScreen';
import LockScreen from './components/os/LockScreen';
import ActionCenter from './components/os/ActionCenter';
import CalendarFlyout from './components/os/CalendarFlyout';

import MarketApp from './components/apps/Market';
import BrowserApp from './components/apps/Browser';
import AssistantApp from './components/apps/Assistant';
import CalculatorApp from './components/apps/Calculator';
import NotepadApp from './components/apps/Notepad';
import GameRunner from './components/apps/GameRunner';
import ExplorerApp from './components/apps/Explorer';
import VideoPlayer from './components/apps/VideoPlayer';
import MusicPlayer from './components/apps/MusicPlayer';
import { 
  Monitor, Printer, Smartphone, Globe, 
  Palette, LayoutGrid, User, Clock, Gamepad2, Search, ArrowLeft, Image as ImageIcon, Upload, Construction,
  Volume2, Battery, Wifi, Bluetooth, HardDrive, Cpu, Shield, MapPin, Trash2, Check, FolderClosed, RefreshCw, Terminal, Key, Lock
} from 'lucide-react';

interface SettingsAppProps {
  currentWallpaper: string;
  onSetWallpaper: (url: string) => void;
  installedGames: Record<string, MarketItem>;
  onUninstallGame: (id: string) => void;
  currentTheme: ThemeConfig;
  onSetTheme: (theme: ThemeConfig) => void;
  storedPassword?: string;
  onSetPassword: (pass: string) => void;
}

// Reusable Toggle Component
const Toggle: React.FC<{ checked: boolean; onChange: () => void; activeClass?: string }> = ({ checked, onChange, activeClass = 'bg-blue-600' }) => (
  <div 
    onClick={onChange} 
    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-300 ease-in-out ${checked ? activeClass : 'bg-transparent border border-gray-500'}`}
  >
    <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-5' : 'left-0.5 bg-gray-400'}`} />
  </div>
);

const SettingsApp: React.FC<SettingsAppProps> = ({ 
    currentWallpaper, onSetWallpaper, installedGames, onUninstallGame, currentTheme, onSetTheme,
    storedPassword, onSetPassword
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Settings States
  const [wifiEnabled, setWifiEnabled] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(true);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(100);
  const [gameMode, setGameMode] = useState(true);
  const [nightLight, setNightLight] = useState(false);

  // Password Input States
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');

  const settingsItems: { name: string; icon: React.ReactNode; desc: string }[] = [
      { name: 'Sistem', icon: <Monitor size={24} />, desc: 'Ekran, ses, güç' },
      { name: 'Cihazlar', icon: <Printer size={24} />, desc: 'Bluetooth, yazıcılar, fare' },
      { name: 'Telefon', icon: <Smartphone size={24} />, desc: 'Android veya iPhone\'unuzu bağlayın' },
      { name: 'Ağ ve İnternet', icon: <Globe size={24} />, desc: 'Wi-Fi, uçak modu, VPN' },
      { name: 'Kişiselleştirme', icon: <Palette size={24} />, desc: 'Arka plan, kilit ekranı, renkler' },
      { name: 'Uygulamalar', icon: <LayoutGrid size={24} />, desc: 'Kaldır, varsayılanlar, özellikler' },
      { name: 'Hesaplar', icon: <User size={24} />, desc: 'Hesaplarınız, e-posta, senkronizasyon' },
      { name: 'Zaman ve Dil', icon: <Clock size={24} />, desc: 'Konuşma, bölge, tarih' },
      { name: 'Oyun', icon: <Gamepad2 size={24} />, desc: 'Oyun Modu, yakalamalar' },
      { name: 'Güvenlik', icon: <Shield size={24} />, desc: 'Parola, kilit ekranı güvenliği' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      onSetWallpaper(imageUrl);
    }
  };

  const handleSavePass = () => {
      if (newPass.length < 4) {
          setPassError('Parola en az 4 karakter olmalıdır.');
          return;
      }
      if (newPass !== confirmPass) {
          setPassError('Parolalar eşleşmiyor.');
          return;
      }
      onSetPassword(newPass);
      setNewPass('');
      setConfirmPass('');
      setPassError('');
  };

  const renderContent = () => {
    switch (activeSection) {
        case 'Sistem':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-8">
                    <div>
                        <h2 className="text-xl font-light mb-4">Monitör</h2>
                        <div className="bg-[#2d2d2d] p-4 rounded-sm space-y-4">
                             <div className="flex justify-between items-center">
                                 <span>Parlaklık ve renk</span>
                                 <span className={currentTheme.text}>{brightness}%</span>
                             </div>
                             <input type="range" min="0" max="100" value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                             
                             <div className="flex justify-between items-center pt-2">
                                 <div>
                                     <div className="font-medium">Gece Işığı</div>
                                     <div className="text-xs text-gray-400">Mavi ışığı azaltmak için daha sıcak renkler kullanın</div>
                                 </div>
                                 <Toggle checked={nightLight} onChange={() => setNightLight(!nightLight)} activeClass={currentTheme.primary} />
                             </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-light mb-4">Ses</h2>
                        <div className="bg-[#2d2d2d] p-4 rounded-sm space-y-4">
                             <div className="flex items-center gap-2">
                                <Volume2 size={20} />
                                <span>Ana Ses Seviyesi</span>
                             </div>
                             <input type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(parseInt(e.target.value))} className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-light mb-4">Depolama</h2>
                        <div className="bg-[#2d2d2d] p-4 rounded-sm flex items-center gap-4">
                             <HardDrive size={32} className="text-gray-400" />
                             <div className="flex-1">
                                 <div className="flex justify-between mb-1">
                                     <span>Yerel Disk (C:)</span>
                                     <span className="text-xs text-gray-400">120 GB kullanılan / 485 GB</span>
                                 </div>
                                 <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                                     <div className={`h-full w-[25%] ${currentTheme.primary}`}></div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            );

        case 'Cihazlar':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-6">
                     <div className="flex justify-between items-center bg-[#2d2d2d] p-4 rounded-sm">
                         <div className="flex items-center gap-3">
                             <Bluetooth className={currentTheme.text} />
                             <div>
                                 <div className="font-medium">Bluetooth</div>
                                 <div className="text-xs text-gray-400">{bluetoothEnabled ? 'Şimdi bulunabilir: "Com-PC"' : 'Kapalı'}</div>
                             </div>
                         </div>
                         <Toggle checked={bluetoothEnabled} onChange={() => setBluetoothEnabled(!bluetoothEnabled)} activeClass={currentTheme.primary} />
                     </div>

                     <div>
                         <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase">Fare, Klavye ve Kalem</h3>
                         <div className="space-y-1">
                             <div className="bg-[#252525] p-3 flex items-center gap-3 rounded-sm">
                                 <div className="w-8 h-8 flex items-center justify-center bg-[#333] rounded"><Printer size={16} /></div>
                                 <div>
                                     <div className="text-sm">Com Optik Fare</div>
                                     <div className="text-xs text-green-500">Bağlı</div>
                                 </div>
                             </div>
                             <div className="bg-[#252525] p-3 flex items-center gap-3 rounded-sm">
                                 <div className="w-8 h-8 flex items-center justify-center bg-[#333] rounded"><LayoutGrid size={16} /></div>
                                 <div>
                                     <div className="text-sm">Com Mekanik Klavye</div>
                                     <div className="text-xs text-green-500">Bağlı</div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            );

        case 'Telefon':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 flex flex-col items-center pt-10 text-center">
                    <div className={`w-24 h-24 ${currentTheme.primary} rounded-full flex items-center justify-center mb-6`}>
                        <Smartphone size={48} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-light mb-2">Telefonunuz</h2>
                    <p className="text-gray-400 max-w-md mb-8">
                        Android veya iPhone'unuzu bilgisayarınıza bağlayın. Fotoğraflarınıza, mesajlarınıza ve daha fazlasına anında erişin.
                    </p>
                    <button className={`${currentTheme.primary} ${currentTheme.hover} text-white px-8 py-2 rounded-sm transition-colors`}>
                        Telefon ekle
                    </button>
                </div>
            );

        case 'Ağ ve İnternet':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-6">
                    <div className="flex flex-col items-center mb-8">
                        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center mb-4 transition-colors ${wifiEnabled ? `border-green-500 text-green-500` : 'border-gray-600 text-gray-600'}`}>
                            <Globe size={64} />
                        </div>
                        <h2 className="text-xl">{wifiEnabled ? 'İnternete bağlısınız' : 'İnternet bağlantısı yok'}</h2>
                        <p className="text-sm text-gray-400">{wifiEnabled ? 'ComNet-5G ağına bağlı, güvenli' : 'Wi-Fi kapalı'}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#2d2d2d] p-4 rounded-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Wifi />
                                <span>Wi-Fi</span>
                            </div>
                            <Toggle checked={wifiEnabled} onChange={() => setWifiEnabled(!wifiEnabled)} activeClass={currentTheme.primary} />
                        </div>
                         <div className="bg-[#2d2d2d] p-4 rounded-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="rotate-90"><Smartphone /></div>
                                <span>Uçak Modu</span>
                            </div>
                            <Toggle checked={airplaneMode} onChange={() => setAirplaneMode(!airplaneMode)} activeClass={currentTheme.primary} />
                        </div>
                    </div>

                    {wifiEnabled && (
                        <div className="bg-[#2d2d2d] p-4 rounded-sm space-y-2">
                            <h3 className="font-medium text-gray-300 border-b border-gray-600 pb-2 mb-2">Özellikler</h3>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">SSID:</span>
                                <span>ComNet-5G</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Protokol:</span>
                                <span>Wi-Fi 6 (802.11ax)</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">IP Adresi:</span>
                                <span>192.168.1.105</span>
                            </div>
                        </div>
                    )}
                </div>
            );

        case 'Uygulamalar':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <h2 className="text-xl font-light mb-6">Uygulamalar ve Özellikler</h2>
                    <div className="bg-[#2d2d2d] p-2 rounded-sm mb-4 flex items-center">
                        <Search className="text-gray-400 ml-2" size={16} />
                        <input type="text" placeholder="Bu listeyi ara" className="bg-transparent border-none outline-none ml-3 text-sm w-full text-white placeholder-gray-500" />
                    </div>

                    <div className="space-y-1">
                        {/* System Apps */}
                        {Object.values(APP_REGISTRY).map((app, i) => (
                             <div key={i} className="bg-[#252525] p-3 flex items-center justify-between rounded-sm group hover:bg-[#2f2f2f]">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 p-1 bg-[#333] rounded">{app.icon}</div>
                                    <div>
                                        <div className="text-sm font-medium">{app.title}</div>
                                        <div className="text-xs text-gray-500">Tda Company • 12.0 MB</div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Installed Games */}
                        {Object.entries(installedGames).map(([key, item]) => (
                             <div key={key} className="bg-[#252525] p-3 flex items-center justify-between rounded-sm group hover:bg-[#2f2f2f]">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 p-1 bg-[#333] rounded ${currentTheme.text}`}><GameIcon /></div>
                                    <div>
                                        <div className="text-sm font-medium">{item.name}</div>
                                        <div className="text-xs text-gray-500">Com Store • {item.category}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onUninstallGame(key)}
                                    className="px-3 py-1 bg-[#333] hover:bg-red-900/50 hover:text-red-400 text-xs rounded transition-colors"
                                >
                                    Kaldır
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'Hesaplar':
            return (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center text-3xl font-light border-4 border-[#333]">
                            TK
                        </div>
                        <div>
                            <h2 className="text-2xl font-medium">Tda Kullanıcısı</h2>
                            <p className="text-gray-400">user@com-os.local</p>
                            <p className={`${currentTheme.text} text-sm mt-1`}>Yönetici</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                         <div className="bg-[#2d2d2d] p-4 rounded-sm flex items-center gap-4 hover:bg-[#333] cursor-pointer">
                             <Shield size={20} />
                             <div>
                                 <div className="text-sm">Oturum açma seçenekleri</div>
                                 <div className="text-xs text-gray-500">Windows Hello, Güvenlik Anahtarı, Parola</div>
                             </div>
                         </div>
                         <div className="bg-[#2d2d2d] p-4 rounded-sm flex items-center gap-4 hover:bg-[#333] cursor-pointer">
                             <User size={20} />
                             <div>
                                 <div className="text-sm">Bilgileriniz</div>
                                 <div className="text-xs text-gray-500">Profil resmi ve hesap ayarları</div>
                             </div>
                         </div>
                    </div>
                 </div>
            );

        case 'Güvenlik':
            return (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-6">
                     <h2 className="text-xl font-light mb-4">Oturum Açma Seçenekleri</h2>
                     
                     <div className="bg-[#2d2d2d] p-6 rounded-sm">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-[#333] rounded-full"><Key size={24} /></div>
                            <div>
                                <h3 className="text-lg font-medium">Parola</h3>
                                <p className="text-sm text-gray-400">Hesabınızın güvenliği için bir parola kullanın.</p>
                            </div>
                        </div>

                        {storedPassword ? (
                             <div className="space-y-4">
                                <div className="bg-green-900/30 border border-green-800 p-3 rounded text-sm text-green-400 flex items-center gap-2">
                                     <Check size={16} /> Parolanız ayarlandı.
                                </div>
                                <button 
                                    onClick={() => onSetPassword('')}
                                    className="bg-[#333] hover:bg-red-900/50 hover:text-red-400 border border-gray-600 px-4 py-2 rounded-sm text-sm transition-colors"
                                >
                                    Parolayı Kaldır
                                </button>
                             </div>
                        ) : (
                            <div className="space-y-3 max-w-sm">
                                <input 
                                    type="password" 
                                    placeholder="Yeni Parola" 
                                    className="w-full bg-[#1a1a1a] border border-gray-600 p-2 text-sm focus:border-blue-500 outline-none"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                />
                                 <input 
                                    type="password" 
                                    placeholder="Parolayı Onayla" 
                                    className="w-full bg-[#1a1a1a] border border-gray-600 p-2 text-sm focus:border-blue-500 outline-none"
                                    value={confirmPass}
                                    onChange={e => setConfirmPass(e.target.value)}
                                />
                                <button 
                                    onClick={handleSavePass}
                                    className={`${currentTheme.primary} ${currentTheme.hover} text-white px-6 py-2 rounded-sm text-sm`}
                                >
                                    Oluştur
                                </button>
                                {passError && <p className="text-red-400 text-xs">{passError}</p>}
                            </div>
                        )}
                     </div>

                     <div className="bg-[#2d2d2d] p-6 rounded-sm opacity-50 cursor-not-allowed">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#333] rounded-full"><Lock size={24} /></div>
                            <div>
                                <h3 className="text-lg font-medium">Dinamik Kilit</h3>
                                <p className="text-sm text-gray-400">Uzaklaştığınızda Windows'un cihazınızı otomatik olarak kilitlemesine izin verin.</p>
                            </div>
                        </div>
                     </div>
                 </div>
            );

        case 'Zaman ve Dil':
             return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-6">
                     <div className="bg-[#2d2d2d] p-6 rounded-sm text-center">
                         <div className="text-4xl font-light mb-2">
                             {new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                         </div>
                         <div className="text-gray-400">
                             {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                         </div>
                     </div>

                     <div className="space-y-4">
                         <div className="flex justify-between items-center">
                             <div>
                                 <div className="font-medium">Saati otomatik ayarla</div>
                             </div>
                             <Toggle checked={true} onChange={() => {}} activeClass={currentTheme.primary} />
                         </div>
                         <div className="flex justify-between items-center opacity-50">
                             <div>
                                 <div className="font-medium">Saat dilimini otomatik ayarla</div>
                             </div>
                             <Toggle checked={false} onChange={() => {}} activeClass={currentTheme.primary} />
                         </div>
                     </div>
                </div>
             );

        case 'Oyun':
             return (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-6">
                      <div className="flex justify-between items-center bg-[#2d2d2d] p-4 rounded-sm">
                         <div className="flex items-center gap-3">
                             <Gamepad2 className="text-green-500" />
                             <div>
                                 <div className="font-medium">Oyun Modu</div>
                                 <div className="text-xs text-gray-400">Bilgisayarı oyun için en iyi duruma getir</div>
                             </div>
                         </div>
                         <Toggle checked={gameMode} onChange={() => setGameMode(!gameMode)} activeClass={currentTheme.primary} />
                     </div>
                 </div>
             );

        // 1. Personalization Page
        case 'Kişiselleştirme':
          return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-8">
                
                {/* Background Section */}
                <div>
                    <h2 className="text-xl font-light mb-4">Arka Plan</h2>
                    
                    {/* Preview */}
                    <div className="mb-6">
                        <div className={`aspect-video w-full max-w-md bg-black rounded-md overflow-hidden border border-gray-600 relative shadow-lg`}>
                            <img src={currentWallpaper} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute bottom-4 left-4 right-4 h-8 bg-black/50 backdrop-blur-sm rounded-sm"></div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                                <div className="w-1 h-1 bg-white rounded-full"></div>
                                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Chooser */}
                    <div className="space-y-4 max-w-2xl">
                        <div>
                            <label className="block text-sm font-medium mb-2">Resim seçin</label>
                            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                            {PRESET_WALLPAPERS.map((wp, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => onSetWallpaper(wp)}
                                    className={`aspect-square rounded-sm overflow-hidden border-2 transition-all ${currentWallpaper === wp ? `${currentTheme.border} shadow-[0_0_0_2px_rgba(255,255,255,0.1)]` : 'border-transparent hover:border-gray-500'}`}
                                >
                                    <img src={wp} className="w-full h-full object-cover" alt={`Wallpaper ${idx + 1}`} />
                                </button>
                            ))}
                            </div>
                        </div>

                        <div>
                            <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                            />
                            <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#333] hover:bg-[#444] text-white px-4 py-2 rounded-sm text-sm border border-gray-600 transition-colors flex items-center gap-2"
                            >
                                <Upload size={16} />
                                Gözat
                            </button>
                        </div>
                    </div>
                </div>

                {/* Colors Section */}
                <div>
                    <h2 className="text-xl font-light mb-4">Renkler</h2>
                    <p className="text-sm text-gray-400 mb-4">Vurgu renginizi seçin</p>
                    <div className="flex flex-wrap gap-2">
                        {Object.values(THEMES).map((t) => (
                            <button
                                key={t.id}
                                onClick={() => onSetTheme(t)}
                                className={`w-10 h-10 ${t.primary} hover:opacity-90 rounded-sm flex items-center justify-center transition-all border-2 ${currentTheme.id === t.id ? 'border-white' : 'border-transparent'}`}
                                title={t.name}
                            >
                                {currentTheme.id === t.id && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );

        // 3. Main Menu Grid (Default)
        default:
            return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 max-w-4xl mx-auto animate-in fade-in duration-200">
                {settingsItems.map(item => (
                <div 
                    key={item.name} 
                    onClick={() => setActiveSection(item.name)}
                    className="flex items-start gap-4 p-4 hover:bg-[#2d2d2d] cursor-pointer transition-colors border border-transparent hover:border-[#444] rounded-sm group"
                >
                    <div className={`text-gray-400 mt-1 group-hover:${currentTheme.text.replace('text-', 'text-')} transition-colors`}>{item.icon}</div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-200">{item.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                </div>
                ))}
            </div>
            );
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white select-none">
      {/* Header */}
      <div className="p-8 pb-6 flex flex-col items-center border-b border-[#2d2d2d] bg-[#1e1e1e]">
        <div className="w-full max-w-4xl flex items-center mb-4 relative">
            {activeSection && (
                <button 
                  onClick={() => setActiveSection(null)}
                  className="absolute -left-10 p-2 hover:bg-[#333] rounded-full transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
            <h1 className="text-2xl font-light">{activeSection || 'Windows Ayarları'}</h1>
        </div>
        
        {!activeSection && (
            <div className="flex items-center bg-[#2d2d2d] p-1.5 rounded-sm border border-gray-600 w-full max-w-sm focus-within:bg-black focus-within:border-white transition-colors">
                <Search size={16} className="text-gray-400 ml-2" />
                <input type="text" placeholder="Bir ayar bulun" className="bg-transparent border-none outline-none ml-3 text-sm w-full text-white placeholder-gray-400" />
            </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
           {renderContent()}
        </div>
        
        {!activeSection && (
            <div className="mt-8 text-center text-xs text-gray-600">
                <p>Com OS Sürüm 2.0 (Tda Company Edition)</p>
                <p>&copy; 2024 Tda Company. Tüm hakları saklıdır.</p>
            </div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(100);
  const [wallpaper, setWallpaper] = useState(WALLPAPER_URL);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.blue);
  
  // System State
  const [isBooted, setIsBooted] = useState(false);
  const [isLocked, setIsLocked] = useState(true); // Default to locked after boot
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: '1', title: 'Hoşgeldiniz', message: 'Com OS 2.0 sürümüne başarıyla güncellendi.', app: 'Sistem', time: 'Şimdi', icon: <Terminal size={14} /> }
  ]);
  const [toggleSettings, setToggleSettings] = useState({ wifi: true, bluetooth: true, airplane: false, nightLight: false });
  
  // Password State
  const [storedPassword, setStoredPassword] = useState(localStorage.getItem('com_os_pwd') || '');

  const handleSetPassword = (pass: string) => {
      if (pass) {
          localStorage.setItem('com_os_pwd', pass);
      } else {
          localStorage.removeItem('com_os_pwd');
      }
      setStoredPassword(pass);
  };
  
  // Store installed games as { id: 'game-123', item: MarketItem }
  const [installedGames, setInstalledGames] = useState<Record<string, MarketItem>>({});

  const handleInstallApp = (item: MarketItem) => {
    const appId = `game-${item.id}`;
    setInstalledGames(prev => ({
        ...prev,
        [appId]: item
    }));
    // Add Notification
    setNotifications(prev => [{
        id: Date.now().toString(),
        title: 'Kurulum Tamamlandı',
        message: `${item.name} oynamaya hazır.`,
        app: 'Mağaza',
        time: 'Şimdi',
        icon: <GameIcon />
    }, ...prev]);
  };

  const handleUninstallGame = (gameId: string) => {
      setInstalledGames(prev => {
          const newState = { ...prev };
          delete newState[gameId];
          return newState;
      });
  };

  // Merge static registry with installed games dynamically
  const dynamicRegistry = useMemo<Record<string, { title: string; icon: React.ReactNode }>>(() => {
    const registry: Record<string, { title: string; icon: React.ReactNode }> = { ...APP_REGISTRY };
    Object.entries(installedGames).forEach(([id, item]) => {
        const gameItem = item as MarketItem;
        registry[id] = {
            title: gameItem.name,
            icon: <GameIcon /> // Use generic game icon but we could customize color
        };
    });
    return registry;
  }, [installedGames]);

  const getComponent = (window: WindowState) => {
    const { appId, data } = window;
    
    // Dynamic Game Handling
    if (typeof appId === 'string' && appId.startsWith('game-')) {
        const gameData = installedGames[appId];
        if (gameData) return <GameRunner gameData={gameData} theme={currentTheme} />;
    }

    switch(appId) {
      case 'market': return <MarketApp onInstallApp={handleInstallApp} installedAppIds={Object.keys(installedGames)} theme={currentTheme} />;
      case 'browser': return <BrowserApp theme={currentTheme} />;
      case 'assistant': return <AssistantApp theme={currentTheme} />;
      case 'calculator': return <CalculatorApp theme={currentTheme} />;
      case 'notepad': return <NotepadApp />;
      case 'video': return <VideoPlayer file={data} theme={currentTheme} />;
      case 'music': return <MusicPlayer file={data} theme={currentTheme} />;
      case 'explorer': return <ExplorerApp theme={currentTheme} onOpenApp={(id, data) => openApp(id, undefined, data)} />;
      case 'settings': return <SettingsApp currentWallpaper={wallpaper} onSetWallpaper={setWallpaper} installedGames={installedGames} onUninstallGame={handleUninstallGame} currentTheme={currentTheme} onSetTheme={setCurrentTheme} storedPassword={storedPassword} onSetPassword={handleSetPassword} />;
      default: return <div className="p-4 text-white">Uygulama yükleniyor...</div>;
    }
  };

  const openApp = useCallback((appId: AppId, instanceId?: string, data?: any) => {
    // If instanceId provided, toggle minimize/restore
    if (instanceId) {
        setWindows(prev => prev.map(w => {
            if (w.id === instanceId) {
                if (w.isMinimized) {
                    setActiveWindowId(instanceId);
                    setNextZIndex(z => z + 1);
                    return { ...w, isMinimized: false, zIndex: nextZIndex + 1 };
                } else if (activeWindowId === instanceId) {
                    return { ...w, isMinimized: true };
                } else {
                     setActiveWindowId(instanceId);
                     setNextZIndex(z => z + 1);
                     return { ...w, zIndex: nextZIndex + 1 };
                }
            }
            return w;
        }));
        return;
    }

    const registryItem = dynamicRegistry[appId];
    if (!registryItem) return;

    // Open new instance
    const newId = `${appId}-${Date.now()}`;
    const newWindow: WindowState = {
      id: newId,
      appId,
      title: registryItem.title,
      x: 50 + (windows.length * 30) % 300,
      y: 50 + (windows.length * 30) % 300,
      width: appId === 'market' ? 1000 : appId === 'calculator' ? 320 : 800,
      height: appId === 'calculator' ? 500 : 600,
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex + 1,
      data: data
    };

    setWindows(prev => [...prev, newWindow]);
    setNextZIndex(z => z + 1);
    setActiveWindowId(newId);
    setIsStartOpen(false);
    setIsActionCenterOpen(false);
  }, [windows.length, nextZIndex, activeWindowId, dynamicRegistry]);

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    if (activeWindowId === id) return;
    setNextZIndex(z => z + 1);
    setActiveWindowId(id);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex + 1 } : w));
  };

  // Play startup sound using Web Audio API
  const playStartupSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      // F# Major 7 chord tones (F#4, A#4, C#5, F5) - Modern/Tech feel
      const freqs = [369.99, 466.16, 554.37, 698.46]; 
      
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        // Use a mix of sine and triangle for a fuller sound
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        
        // Envelope
        gain.gain.setValueAtTime(0, now);
        // Staggered attack for arpeggiated feel
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1 + (i * 0.05)); 
        // Long decay
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + 3);
      });

    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  // Effect to trigger sound on boot (only when entering lock screen initially)
  useEffect(() => {
    if (isBooted && isLocked) {
      setTimeout(() => {
        playStartupSound();
      }, 500);
    }
  }, [isBooted, isLocked]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Meta (Windows) + E -> Explorer
        if (e.metaKey && e.key === 'e') {
            e.preventDefault();
            openApp('explorer');
        }
        // Meta + D -> Show Desktop (Minimize All)
        if (e.metaKey && e.key === 'd') {
            e.preventDefault();
            setWindows(prev => prev.map(w => ({ ...w, isMinimized: true })));
            setActiveWindowId(null);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openApp]);

  const handleDesktopRightClick = (e: React.MouseEvent) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleShutdown = () => {
    setIsStartOpen(false);
    setIsShuttingDown(true);
    // Simulate shutdown time
    setTimeout(() => {
        setWindows([]);
        setActiveWindowId(null);
        setIsShuttingDown(false);
        setIsBooted(false); // Return to boot/bios state
        setIsLocked(true); // Reset lock state for next boot
    }, 3000);
  };

  const handleUnlock = () => {
      setIsLocked(false);
  };

  if (!isBooted) {
      return <BootScreen onBootComplete={() => setIsBooted(true)} />;
  }

  // Lock Screen Overlay
  if (isLocked) {
      return <LockScreen onUnlock={handleUnlock} wallpaper={wallpaper} theme={currentTheme} password={storedPassword} />;
  }

  return (
    <>
        {/* Shutdown Overlay */}
        {isShuttingDown && (
            <div className="fixed inset-0 z-[10002] bg-black flex flex-col items-center justify-center text-white cursor-none select-none">
                 <div className="w-8 h-8 border-4 border-t-blue-500 border-white/20 rounded-full animate-spin mb-4"></div>
                 <div className="text-lg font-light tracking-wide">Kapatılıyor...</div>
            </div>
        )}

        <div 
            className="w-full h-full relative overflow-hidden bg-cover bg-center select-none transition-all duration-500"
            style={{ backgroundImage: `url(${wallpaper})` }}
            onClick={() => { 
                if(isStartOpen) setIsStartOpen(false); 
                if(isActionCenterOpen) setIsActionCenterOpen(false);
                if(isCalendarOpen) setIsCalendarOpen(false);
                setContextMenu(null); 
            }}
            onContextMenu={handleDesktopRightClick}
        >
        {/* Desktop Icons Area */}
        <div className="absolute top-0 left-0 bottom-10 p-2 grid grid-flow-col grid-rows-[repeat(auto-fill,100px)] gap-2 content-start w-fit">
            {/* User Folder "Dosyalarım" Shortcut */}
            <div 
                className="w-24 h-24 flex flex-col items-center justify-center gap-1 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-sm cursor-pointer group text-shadow transition-colors"
                onDoubleClick={() => openApp('explorer')}
            >
                <div className="w-10 h-10 drop-shadow-2xl filter"><FolderClosed className="w-full h-full text-yellow-400 fill-yellow-400" /></div>
                <span className="text-white text-xs text-center line-clamp-2 px-1 font-normal drop-shadow-md">Dosyalarım</span>
            </div>

            {Object.entries(dynamicRegistry).filter(([k]) => k !== 'explorer').map(([key, entry]) => {
                const app = entry as { title: string; icon: React.ReactNode };
                const appId = key as AppId;
                return (
                    <div 
                        key={appId}
                        className="w-24 h-24 flex flex-col items-center justify-center gap-1 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-sm cursor-pointer group text-shadow transition-colors"
                        onDoubleClick={() => openApp(appId)}
                    >
                        <div className="w-10 h-10 drop-shadow-2xl filter">{app.icon}</div>
                        <span className="text-white text-xs text-center line-clamp-2 px-1 font-normal drop-shadow-md">{app.title}</span>
                    </div>
                )
            })}
        </div>

        {/* Context Menu */}
        {contextMenu && (
            <div 
                className="absolute bg-[#2d2d2d] border border-gray-600 shadow-xl rounded-sm py-1 w-48 z-[10000]"
                style={{ left: contextMenu.x, top: contextMenu.y }}
            >
                <div className="px-4 py-1.5 hover:bg-[#444] text-white text-sm cursor-pointer flex items-center gap-2">
                    <LayoutGrid size={14} /> Görünüm
                </div>
                <div className="px-4 py-1.5 hover:bg-[#444] text-white text-sm cursor-pointer flex items-center gap-2">
                    <RefreshCw size={14} /> Yenile
                </div>
                <div className="h-[1px] bg-gray-600 my-1 mx-2"></div>
                <div className="px-4 py-1.5 hover:bg-[#444] text-white text-sm cursor-pointer flex items-center gap-2" onClick={() => openApp('settings')}>
                    <Palette size={14} /> Kişiselleştir
                </div>
                <div className="px-4 py-1.5 hover:bg-[#444] text-white text-sm cursor-pointer flex items-center gap-2" onClick={() => openApp('settings')}>
                    <Monitor size={14} /> Görüntü Ayarları
                </div>
            </div>
        )}

        {/* Windows Layer */}
        {windows.map(win => (
            <Window
            key={win.id}
            windowState={win}
            isActive={activeWindowId === win.id}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onFocus={focusWindow}
            icon={dynamicRegistry[win.appId]?.icon}
            theme={currentTheme}
            >
            {getComponent(win)}
            </Window>
        ))}

        {/* UI Overlays */}
        <StartMenu 
            isOpen={isStartOpen} 
            onClose={() => setIsStartOpen(false)}
            onAppClick={openApp}
            onShutdown={handleShutdown}
            registry={dynamicRegistry}
            theme={currentTheme}
        />

        <ActionCenter 
            isOpen={isActionCenterOpen}
            onClose={() => setIsActionCenterOpen(false)}
            notifications={notifications}
            onClearAll={() => setNotifications([])}
            theme={currentTheme}
            toggleSettings={toggleSettings}
            onToggle={(key) => setToggleSettings(prev => ({...prev, [key]: !prev[key as keyof typeof toggleSettings]}))}
        />

        <CalendarFlyout 
            isOpen={isCalendarOpen}
            theme={currentTheme}
        />
        
        <Taskbar 
            openWindows={windows} 
            activeWindowId={activeWindowId} 
            onAppClick={openApp}
            onToggleStart={() => {
                setIsStartOpen(!isStartOpen);
                setIsActionCenterOpen(false);
                setIsCalendarOpen(false);
            }}
            isStartOpen={isStartOpen}
            registry={dynamicRegistry}
            theme={currentTheme}
            onToggleActionCenter={() => {
                setIsActionCenterOpen(!isActionCenterOpen);
                setIsStartOpen(false);
                setIsCalendarOpen(false);
            }}
            onToggleCalendar={() => {
                setIsCalendarOpen(!isCalendarOpen);
                setIsStartOpen(false);
                setIsActionCenterOpen(false);
            }}
            hasNotifications={notifications.length > 0}
        />
        </div>
    </>
  );
};

export default App;