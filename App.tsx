import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { WALLPAPER_URL, APP_REGISTRY, GameIcon, PRESET_WALLPAPERS, THEMES } from './constants';
import { WindowState, AppId, MarketItem, ThemeConfig, Notification, DesktopItem, ViewMode, SortMode } from './types';
import Taskbar from './components/os/Taskbar';
import StartMenu from './components/os/StartMenu';
import Window from './components/os/Window';
import BootScreen from './components/os/BootScreen';
import LockScreen from './components/os/LockScreen';
import ActionCenter from './components/os/ActionCenter';
import CalendarFlyout from './components/os/CalendarFlyout';

import MarketApp from './components/apps/Market';
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
  Volume2, Battery, Wifi, Bluetooth, HardDrive, Cpu, Shield, MapPin, Trash2, Check, FolderClosed, RefreshCw, Terminal, Key, Lock, Pin, FileText,
  ChevronRight, Circle, CheckCircle2, FilePlus, FolderPlus
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
  defaultSection?: string | null;
}

// File System Type Definition
export interface FileSystemItem {
    name: string;
    type: 'folder' | 'file' | 'drive';
    icon?: any;
    size?: string;
    url?: string;
    content?: string; // Content for text files
}

// Initial File System Data (Moved from Explorer)
const INITIAL_FILE_SYSTEM: Record<string, FileSystemItem[]> = {
    'Bu Bilgisayar': [
        { name: 'Yerel Disk (C:)', type: 'drive', size: '120 GB boş' },
        { name: 'Masaüstü', type: 'folder' },
        { name: 'Belgeler', type: 'folder' },
        { name: 'İndirilenler', type: 'folder' },
        { name: 'Resimler', type: 'folder' },
        { name: 'Müzik', type: 'folder' },
        { name: 'Çöp Kutusu', type: 'folder' },
    ],
    'Yerel Disk (C:)': [
        { name: 'Windows', type: 'folder' },
        { name: 'Program Files', type: 'folder' },
        { name: 'Users', type: 'folder' },
        { name: 'ComOS_Logs.txt', type: 'file', size: '2 KB', content: 'System initialized successfully.\nBoot time: 14s\nAll services running.' },
        { name: 'Swapfile.sys', type: 'file', size: '2.5 GB' },
    ],
    'Belgeler': [
        { name: 'Ödevler', type: 'folder' },
        { name: 'Proje Notları.txt', type: 'file', size: '14 KB', content: 'Proje Bitiş Tarihi: 28 Kasım\n\nYapılacaklar:\n- Arayüz Tasarımı\n- Backend Entegrasyonu' },
        { name: 'Özgeçmiş.docx', type: 'file', size: '450 KB' },
        { name: 'Mali Tablo.xlsx', type: 'file', size: '2.1 MB' },
    ],
    'Resimler': [
        { name: 'Tatil', type: 'folder' },
        { name: 'Profil.jpg', type: 'file', size: '2.4 MB' },
        { name: 'Manzara.png', type: 'file', size: '4.1 MB' },
        { name: 'Ekran Görüntüsü.png', type: 'file', size: '500 KB' },
    ],
    'İndirilenler': [
        { name: 'BigBuckBunny.mp4', type: 'file', size: '158 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { name: 'odev.zip', type: 'file', size: '12 MB' },
        { name: 'Film_Fragman.mkv', type: 'file', size: '120 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    ],
    'Müzik': [
        { name: 'Pop Listesi', type: 'folder' },
        { name: 'Jazz_Vibes.mp3', type: 'file', size: '4.5 MB', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { name: 'Ambient_Relax.wav', type: 'file', size: '12 MB', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    ],
    'Masaüstü': [
        { name: 'Dosyalarım', type: 'folder' },
        { name: 'Kısayol.lnk', type: 'file', size: '1 KB' },
        { name: 'Yapılacaklar.txt', type: 'file', size: '2 KB', content: '1. Markete git\n2. Süt al\n3. Com OS güncellemesini yap' },
        { name: 'Demo_Video.mp4', type: 'file', size: '50 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ],
    'Çöp Kutusu': []
};

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
    storedPassword, onSetPassword, defaultSection
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(defaultSection || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Update active section if defaultSection changes (e.g. from context menu)
  useEffect(() => {
      if(defaultSection) setActiveSection(defaultSection);
  }, [defaultSection]);
  
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
        case 'Güvenlik':
            return (
                <div className="animate-in fade-in slide-in-from-right-4 duration-200 space-y-8">
                    <div>
                        <h2 className="text-xl font-light mb-4">Oturum Açma Seçenekleri</h2>
                        <div className="bg-[#2d2d2d] p-4 rounded-sm space-y-4">
                             <div className="flex items-start gap-4">
                                 <div className="bg-[#333] p-3 rounded-full"><Lock size={24} className="text-gray-300" /></div>
                                 <div className="flex-1">
                                     <div className="font-medium mb-1">Parola</div>
                                     <div className="text-xs text-gray-400 mb-4">Kilit ekranı için bir parola belirleyin.</div>
                                     
                                     {storedPassword ? (
                                         <div className="flex items-center gap-4">
                                             <span className="text-green-500 text-sm flex items-center gap-1"><Check size={14} /> Parola aktif</span>
                                             <button 
                                                onClick={() => onSetPassword('')}
                                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
                                             >
                                                 Kaldır
                                             </button>
                                         </div>
                                     ) : (
                                         <div className="space-y-3 max-w-sm">
                                             <input 
                                                type="password" 
                                                placeholder="Yeni Parola" 
                                                className="w-full bg-[#1a1a1a] border border-[#444] p-2 rounded text-sm focus:border-blue-500 outline-none"
                                                value={newPass}
                                                onChange={e => setNewPass(e.target.value)}
                                             />
                                             <input 
                                                type="password" 
                                                placeholder="Parolayı Onayla" 
                                                className="w-full bg-[#1a1a1a] border border-[#444] p-2 rounded text-sm focus:border-blue-500 outline-none"
                                                value={confirmPass}
                                                onChange={e => setConfirmPass(e.target.value)}
                                             />
                                             {passError && <div className="text-red-500 text-xs">{passError}</div>}
                                             <button 
                                                onClick={handleSavePass}
                                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
                                             >
                                                 Kaydet
                                             </button>
                                         </div>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            );
        case 'Kişiselleştirme':
             return (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <h2 className="text-xl font-light mb-4">Arka Plan</h2>
                    
                    <div className="bg-[#2d2d2d] p-4 rounded-sm mb-6">
                        <div className="aspect-video w-full bg-cover bg-center rounded-sm border border-gray-600 mb-4 transition-all duration-500" style={{backgroundImage: `url(${currentWallpaper})`}}></div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {PRESET_WALLPAPERS.map((wp, i) => (
                                <div 
                                    key={i} 
                                    className={`aspect-video bg-cover bg-center rounded-sm cursor-pointer border-2 hover:opacity-100 transition-all ${currentWallpaper === wp ? `border-${currentTheme.id}-500 opacity-100` : 'border-transparent opacity-60'}`}
                                    style={{backgroundImage: `url(${wp})`}}
                                    onClick={() => onSetWallpaper(wp)}
                                ></div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                             <div className="text-sm text-gray-300">Özel Resim:</div>
                             <label className="px-4 py-2 bg-[#333] hover:bg-[#444] rounded text-xs cursor-pointer flex items-center gap-2 transition-colors">
                                 <ImageIcon size={14} /> Gözat
                                 <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                             </label>
                        </div>
                    </div>

                    <h2 className="text-xl font-light mb-4">Renkler</h2>
                    <div className="bg-[#2d2d2d] p-4 rounded-sm">
                        <div className="grid grid-cols-6 gap-4">
                             {Object.values(THEMES).map(theme => (
                                 <div 
                                    key={theme.id}
                                    onClick={() => onSetTheme(theme)}
                                    className={`w-10 h-10 rounded-full cursor-pointer flex items-center justify-center transition-transform hover:scale-110 ${theme.primary.replace('bg-', 'bg-')} ${currentTheme.id === theme.id ? 'ring-2 ring-white' : ''}`}
                                    title={theme.name}
                                 >
                                     {currentTheme.id === theme.id && <Check size={16} className="text-white" />}
                                 </div>
                             ))}
                        </div>
                    </div>
                 </div>
             );
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
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
           {renderContent()}
        </div>
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
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES.red);
  
  // File System State (Hoisted from Explorer)
  const [fileSystem, setFileSystem] = useState<Record<string, FileSystemItem[]>>(INITIAL_FILE_SYSTEM);

  // System State
  const [isBooted, setIsBooted] = useState(false);
  const [isLocked, setIsLocked] = useState(true); 
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  
  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{x: number, y: number} | null>(null);
  
  const [notifications, setNotifications] = useState<Notification[]>([
      { id: '1', title: 'Hoşgeldiniz', message: 'Com OS 2.0 sürümüne başarıyla güncellendi.', app: 'Sistem', time: 'Şimdi', icon: <Terminal size={14} /> }
  ]);
  const [toggleSettings, setToggleSettings] = useState({ wifi: true, bluetooth: true, airplane: false, nightLight: false });
  
  // Password State
  const [storedPassword, setStoredPassword] = useState(localStorage.getItem('com_os_pwd') || '');

  // Desktop Icons State
  const [desktopItems, setDesktopItems] = useState<DesktopItem[]>([]);
  const [pinnedAppIds, setPinnedAppIds] = useState<string[]>(['explorer', 'market', 'assistant']);
  const [desktopViewMode, setDesktopViewMode] = useState<ViewMode>('medium');
  const [showDesktopIcons, setShowDesktopIcons] = useState(true);
  
  // Dragging State for Desktop Icons
  const [draggingItem, setDraggingItem] = useState<{id: string, startX: number, startY: number, initialItemX: number, initialItemY: number} | null>(null);

  const handleSetPassword = (pass: string) => {
      if (pass) {
          localStorage.setItem('com_os_pwd', pass);
      } else {
          localStorage.removeItem('com_os_pwd');
      }
      setStoredPassword(pass);
  };
  
  const [installedGames, setInstalledGames] = useState<Record<string, MarketItem>>({});

  const handleInstallApp = (item: MarketItem) => {
    const appId = `game-${item.id}`;
    setInstalledGames(prev => ({
        ...prev,
        [appId]: item
    }));
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

  // --- FILE SYSTEM OPERATIONS ---

  const handleSaveFile = (folderName: string, fileName: string, content: string) => {
      setFileSystem(prev => {
          const newState = { ...prev };
          const folderContent = newState[folderName] || [];
          
          const existingFileIndex = folderContent.findIndex(f => f.name === fileName);
          
          if (existingFileIndex >= 0) {
              // Update existing
              const updatedFile = { 
                  ...folderContent[existingFileIndex], 
                  content: content,
                  size: `${Math.ceil(content.length / 1024)} KB` // Simple size calc
              };
              newState[folderName] = [
                  ...folderContent.slice(0, existingFileIndex),
                  updatedFile,
                  ...folderContent.slice(existingFileIndex + 1)
              ];
          } else {
              // Create new
              const newFile: FileSystemItem = {
                  name: fileName,
                  type: 'file',
                  size: `${Math.ceil(content.length / 1024) || 1} KB`,
                  content: content
              };
              newState[folderName] = [...folderContent, newFile];
          }
          return newState;
      });
  };

  const handleEmptyTrash = () => {
    setFileSystem(prev => ({
        ...prev,
        'Çöp Kutusu': []
    }));
    setNotifications(prev => [{
        id: Date.now().toString(),
        title: 'Çöp Kutusu Temizlendi',
        message: 'Silinen dosyalar kalıcı olarak kaldırıldı.',
        app: 'Sistem',
        time: 'Şimdi',
        icon: <Trash2 size={14} />
    }, ...prev]);
  };

  // New Folder / File Creation (Desktop Context Menu)
  const handleCreateNew = (type: 'folder' | 'text') => {
      const baseName = type === 'folder' ? 'Yeni Klasör' : 'Yeni Metin Belgesi.txt';
      const folderName = 'Masaüstü';
      
      setFileSystem(prev => {
          const newState = { ...prev };
          const currentFiles = newState[folderName] || [];
          
          let finalName = baseName;
          let counter = 2;
          
          // Generate unique name
          while(currentFiles.some(f => f.name === finalName)) {
              if (type === 'folder') finalName = `Yeni Klasör (${counter})`;
              else finalName = `Yeni Metin Belgesi (${counter}).txt`;
              counter++;
          }
          
          const newItem: FileSystemItem = type === 'folder' 
             ? { name: finalName, type: 'folder' }
             : { name: finalName, type: 'file', size: '0 KB', content: '' };
             
          // Also initialize the folder if creating folder
          if (type === 'folder') newState[finalName] = [];
          
          newState[folderName] = [...currentFiles, newItem];
          return newState;
      });
      setContextMenu(null);
  };

  const handleRefresh = () => {
      // Force refresh desktop items layout by triggering the useEffect
      setDesktopItems([]); 
      setTimeout(() => {
          // It will auto-repopulate based on useEffect dependency on fileSystem
      }, 10);
      setContextMenu(null);
  };
  
  const handleSort = (mode: SortMode) => {
      // Sorting essentially rearranges the desktopItems array
      // For this simplified version, we'll sort the FileSystem['Masaüstü'] array
      // which drives the desktopItems useEffect
      setFileSystem(prev => {
          const newState = { ...prev };
          const desktopFiles = [...(newState['Masaüstü'] || [])];
          
          desktopFiles.sort((a, b) => {
              if (mode === 'name') return a.name.localeCompare(b.name);
              if (mode === 'type') return a.type.localeCompare(b.type);
              // Simple size sort approximation
              if (mode === 'size') return (a.size || '').localeCompare(b.size || '');
              return 0;
          });
          
          newState['Masaüstü'] = desktopFiles;
          return newState;
      });
      // Also force a visual refresh to reset positions
      setDesktopItems([]);
      setContextMenu(null);
  };

  const dynamicRegistry = useMemo<Record<string, { title: string; icon: React.ReactNode }>>(() => {
    const registry: Record<string, { title: string; icon: React.ReactNode }> = { ...APP_REGISTRY };
    
    // Add Recycle Bin manually to registry lookup for icon rendering if needed by Desktop logic
    registry['recycle-bin'] = { title: 'Çöp Kutusu', icon: <Trash2 className="w-full h-full text-gray-400" /> };

    Object.entries(installedGames).forEach(([id, item]) => {
        const gameItem = item as MarketItem;
        registry[id] = {
            title: gameItem.name,
            icon: <GameIcon /> 
        };
    });
    return registry;
  }, [installedGames]);

  // Sync Desktop Icons with Registry AND File System
  useEffect(() => {
    setDesktopItems(prev => {
        const currentIds = prev.map(i => i.appId);
        const newItems = [...prev];
        
        // Grid spacing depends on view mode
        const gridSize = desktopViewMode === 'large' ? 128 : desktopViewMode === 'small' ? 86 : 100;
        const startOffset = 10;
        
        // Add "Recycle Bin" special item if missing
        if (!currentIds.includes('recycle-bin')) {
             newItems.push({ id: 'desktop-recycle-bin', appId: 'recycle-bin', x: startOffset, y: startOffset });
        }

        // Add "My Files" special item if missing (offset y by grid size since Recycle Bin is first)
        if (!currentIds.includes('explorer')) {
             newItems.push({ id: 'desktop-explorer', appId: 'explorer', x: startOffset, y: startOffset + gridSize });
        }

        // Add other apps from registry if missing
        const registryKeys = Object.keys(dynamicRegistry).filter(k => k !== 'explorer' && k !== 'recycle-bin');
        
        // Simple grid calculation for new items
        const filledPositions = new Set(newItems.map(i => `${i.x},${i.y}`));
        let nextX = startOffset;
        let nextY = startOffset;

        const getNextPos = () => {
             while (filledPositions.has(`${nextX},${nextY}`)) {
                 nextY += gridSize;
                 if (nextY > window.innerHeight - gridSize) {
                     nextY = startOffset;
                     nextX += gridSize;
                 }
             }
             return { x: nextX, y: nextY };
        };

        registryKeys.forEach(appId => {
            if (!currentIds.includes(appId)) {
                const pos = getNextPos();
                newItems.push({ id: `desktop-${appId}`, appId, x: pos.x, y: pos.y });
                filledPositions.add(`${pos.x},${pos.y}`);
            }
        });

        // Add Desktop Files from FileSystem to Desktop
        const desktopFiles = fileSystem['Masaüstü'] || [];
        desktopFiles.forEach(file => {
             const fileId = `file-${file.name}`;
             if (!currentIds.includes(fileId)) {
                 const pos = getNextPos();
                 newItems.push({ id: fileId, appId: `file://${file.name}` as AppId, x: pos.x, y: pos.y }); 
                 filledPositions.add(`${pos.x},${pos.y}`);
             }
        });

        // Remove items that are no longer installed (or deleted files)
        return newItems.filter(i => {
            if (i.appId === 'recycle-bin') return true;
            if (i.appId.toString().startsWith('file://')) {
                const fname = i.appId.toString().replace('file://', '');
                return desktopFiles.some(f => f.name === fname);
            }
            return i.appId === 'explorer' || dynamicRegistry[i.appId];
        });
    });
  }, [dynamicRegistry, fileSystem, desktopViewMode]); // Re-run if view mode changes to re-calc grid logic for new items


  // --- DESKTOP ICON DRAGGING LOGIC ---

  const handleIconMouseDown = (e: React.MouseEvent, item: DesktopItem) => {
      e.preventDefault();
      setDraggingItem({
          id: item.id,
          startX: e.clientX,
          startY: e.clientY,
          initialItemX: item.x,
          initialItemY: item.y
      });
  };

  const handleIconMouseMove = useCallback((e: MouseEvent) => {
      if (!draggingItem) return;

      const deltaX = e.clientX - draggingItem.startX;
      const deltaY = e.clientY - draggingItem.startY;

      setDesktopItems(prev => prev.map(item => {
          if (item.id === draggingItem.id) {
              return {
                  ...item,
                  x: item.id === draggingItem.id ? Math.max(0, Math.min(window.innerWidth - 80, draggingItem.initialItemX + deltaX)) : item.x,
                  y: item.id === draggingItem.id ? Math.max(0, Math.min(window.innerHeight - 100, draggingItem.initialItemY + deltaY)) : item.y
              };
          }
          return item;
      }));
  }, [draggingItem]);

  const handleIconMouseUp = useCallback((e: MouseEvent) => {
      if (!draggingItem) return;

      // 1. Check drop on Taskbar (Pinning)
      if (e.clientY > window.innerHeight - 50) {
          const item = desktopItems.find(i => i.id === draggingItem.id);
          if (item && !item.appId.toString().startsWith('file://') && item.appId !== 'recycle-bin') {
              const appId = item.appId;
              if (!pinnedAppIds.includes(appId)) {
                  setPinnedAppIds(prev => [...prev, appId]);
                  setNotifications(prev => [{
                    id: Date.now().toString(),
                    title: 'Sabitlendi',
                    message: `${dynamicRegistry[appId]?.title || 'Uygulama'} görev çubuğuna sabitlendi.`,
                    app: 'Sistem',
                    time: 'Şimdi',
                    icon: <Pin size={14} />
                  }, ...prev]);
              }
          }
      }

      // 2. Check drop on Recycle Bin (Deletion)
      const recycleBinItem = desktopItems.find(i => i.appId === 'recycle-bin');
      const draggedItem = desktopItems.find(i => i.id === draggingItem.id);
      
      if (recycleBinItem && draggedItem && draggedItem.id !== recycleBinItem.id) {
          // Calculate distance to recycle bin
          const dist = Math.sqrt(
              Math.pow(e.clientX - (recycleBinItem.x + 40), 2) + 
              Math.pow(e.clientY - (recycleBinItem.y + 40), 2)
          );
          
          if (dist < 60) {
              // Dragged onto recycle bin
              if (draggedItem.appId.toString().startsWith('file://')) {
                  const fileName = draggedItem.appId.toString().replace('file://', '');
                  
                  // Move file logic
                  setFileSystem(prev => {
                      const newState = { ...prev };
                      const desktopFiles = newState['Masaüstü'] || [];
                      const fileToMove = desktopFiles.find(f => f.name === fileName);
                      
                      if (fileToMove) {
                          newState['Masaüstü'] = desktopFiles.filter(f => f.name !== fileName);
                          newState['Çöp Kutusu'] = [...(newState['Çöp Kutusu'] || []), fileToMove];
                          
                           // Play sound or notification
                           const audio = new Audio(); // Placeholder for sound
                      }
                      return newState;
                  });
                  
                  setNotifications(prev => [{
                    id: Date.now().toString(),
                    title: 'Dosya Silindi',
                    message: `${fileName} çöp kutusuna taşındı.`,
                    app: 'Sistem',
                    time: 'Şimdi',
                    icon: <Trash2 size={14} />
                  }, ...prev]);
              }
          }
      }

      setDraggingItem(null);
  }, [draggingItem, desktopItems, pinnedAppIds, dynamicRegistry]);

  useEffect(() => {
      if (draggingItem) {
          window.addEventListener('mousemove', handleIconMouseMove);
          window.addEventListener('mouseup', handleIconMouseUp);
      } else {
          window.removeEventListener('mousemove', handleIconMouseMove);
          window.removeEventListener('mouseup', handleIconMouseUp);
      }
      return () => {
          window.removeEventListener('mousemove', handleIconMouseMove);
          window.removeEventListener('mouseup', handleIconMouseUp);
      };
  }, [draggingItem, handleIconMouseMove, handleIconMouseUp]);


  const getComponent = (window: WindowState) => {
    const { appId, data } = window;
    
    // Dynamic Game Handling
    if (typeof appId === 'string' && appId.startsWith('game-')) {
        const gameData = installedGames[appId];
        if (gameData) return <GameRunner gameData={gameData} theme={currentTheme} />;
    }

    switch(appId) {
      case 'market': return <MarketApp onInstallApp={handleInstallApp} installedAppIds={Object.keys(installedGames)} theme={currentTheme} />;
      case 'assistant': return <AssistantApp theme={currentTheme} />;
      case 'calculator': return <CalculatorApp theme={currentTheme} />;
      case 'notepad': return <NotepadApp initialData={data} onSave={handleSaveFile} />;
      case 'video': return <VideoPlayer file={data} theme={currentTheme} />;
      case 'music': return <MusicPlayer file={data} theme={currentTheme} />;
      case 'explorer': return <ExplorerApp theme={currentTheme} fileSystem={fileSystem} onOpenApp={(id, data) => openApp(id, undefined, data)} initialPath={data?.path || 'Bu Bilgisayar'} onEmptyTrash={handleEmptyTrash} />;
      case 'settings': return <SettingsApp currentWallpaper={wallpaper} onSetWallpaper={setWallpaper} installedGames={installedGames} onUninstallGame={handleUninstallGame} currentTheme={currentTheme} onSetTheme={setCurrentTheme} storedPassword={storedPassword} onSetPassword={handleSetPassword} defaultSection={data?.section} />;
      case 'recycle-bin': return <ExplorerApp theme={currentTheme} fileSystem={fileSystem} onOpenApp={(id, data) => openApp(id, undefined, data)} initialPath="Çöp Kutusu" onEmptyTrash={handleEmptyTrash} />;
      default: return <div className="p-4 text-white">Uygulama yükleniyor...</div>;
    }
  };

  const openApp = useCallback((appId: AppId, instanceId?: string, data?: any) => {
    // Desktop File Opening Logic
    if (appId.toString().startsWith('file://')) {
        const fileName = appId.toString().replace('file://', '');
        // Find file in desktop
        const file = fileSystem['Masaüstü']?.find(f => f.name === fileName);
        if (file) {
            // Determine app based on extension
            const ext = fileName.split('.').pop()?.toLowerCase();
            if (['txt', 'log', 'ini', 'md', 'js', 'json'].includes(ext || '')) {
                 openApp('notepad', undefined, { name: file.name, content: file.content, folder: 'Masaüstü' });
            } else if (['mp4', 'mkv'].includes(ext || '')) {
                 openApp('video', undefined, { name: file.name, url: file.url });
            } else if (['mp3', 'wav', 'flac'].includes(ext || '')) {
                 openApp('music', undefined, { name: file.name, url: file.url });
            } else {
                 openApp('notepad', undefined, { name: file.name, content: file.content || "Dosya okunamıyor." });
            }
        }
        return;
    }
    
    // Recycle Bin Special Case
    if (appId === 'recycle-bin') {
        const newId = `recycle-bin-${Date.now()}`;
        setWindows(prev => [...prev, {
          id: newId,
          appId: 'recycle-bin',
          title: 'Çöp Kutusu',
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          isMinimized: false,
          isMaximized: false,
          zIndex: nextZIndex + 1
        }]);
        setNextZIndex(z => z + 1);
        setActiveWindowId(newId);
        return;
    }

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
      title: data?.name ? `${data.name} - ${registryItem.title}` : registryItem.title,
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
  }, [windows.length, nextZIndex, activeWindowId, dynamicRegistry, fileSystem]);

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

  const playStartupSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const freqs = [369.99, 466.16, 554.37, 698.46]; 
      
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.1 + (i * 0.05)); 
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

  useEffect(() => {
    if (isBooted && isLocked) {
      setTimeout(() => {
        playStartupSound();
      }, 500);
    }
  }, [isBooted, isLocked]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.metaKey && e.key === 'e') {
            e.preventDefault();
            openApp('explorer');
        }
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
    setTimeout(() => {
        setWindows([]);
        setActiveWindowId(null);
        setIsShuttingDown(false);
        setIsBooted(false); 
        setIsLocked(true); 
    }, 3000);
  };

  const handleUnlock = () => {
      setIsLocked(false);
  };

  // Determine icon size based on view mode
  const iconSize = desktopViewMode === 'large' ? 'w-32 h-32' : desktopViewMode === 'small' ? 'w-20 h-20' : 'w-24 h-24';
  const innerIconSize = desktopViewMode === 'large' ? 'w-16 h-16' : desktopViewMode === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = desktopViewMode === 'small' ? 'text-[10px]' : 'text-xs';

  if (!isBooted) {
      return <BootScreen onBootComplete={() => setIsBooted(true)} />;
  }

  if (isLocked) {
      return <LockScreen onUnlock={handleUnlock} wallpaper={wallpaper} theme={currentTheme} password={storedPassword} />;
  }

  return (
    <>
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
        
        {/* Desktop Icons Area (Absolute Positioning) */}
        {showDesktopIcons && desktopItems.map(item => {
            // Determine display title and icon
            let displayTitle = '';
            let displayIcon: React.ReactNode = null;
            
            if (item.appId === 'recycle-bin') {
                displayTitle = 'Çöp Kutusu';
                // Check if trash has items
                const trashCount = fileSystem['Çöp Kutusu']?.length || 0;
                displayIcon = <Trash2 className={`${innerIconSize} ${trashCount > 0 ? 'text-red-400 fill-red-400/20' : 'text-gray-300'}`} />;
            } else if (item.appId === 'explorer') {
                 displayTitle = 'Dosyalarım';
                 displayIcon = <FolderClosed className={`${innerIconSize} text-yellow-400 fill-yellow-400`} />;
            } else if (item.appId.toString().startsWith('file://')) {
                 displayTitle = item.appId.toString().replace('file://', '');
                 const ext = displayTitle.split('.').pop()?.toLowerCase();
                 // Simple icon logic
                 const iconClass = `${innerIconSize} text-white`;
                 if (['txt', 'md'].includes(ext || '')) displayIcon = <FileText className={iconClass} />;
                 else displayIcon = <FileText className={`${innerIconSize} text-gray-400`} />;
            } else if (dynamicRegistry[item.appId]) {
                 displayTitle = dynamicRegistry[item.appId].title;
                 // We need to clone the icon element to add sizing classes if it's a React Element
                 const OriginalIcon = dynamicRegistry[item.appId].icon as React.ReactElement<{ className?: string }>;
                 displayIcon = React.cloneElement(OriginalIcon, { className: `${innerIconSize} ${OriginalIcon.props.className?.replace('w-full h-full', '') || ''}` });
            } else {
                 return null; // Don't render unknown
            }

            return (
                <div 
                    key={item.id}
                    className={`absolute ${iconSize} flex flex-col items-center justify-start pt-2 gap-1 hover:bg-white/10 border border-transparent hover:border-white/20 rounded-sm cursor-pointer group text-shadow transition-all`}
                    style={{ left: item.x, top: item.y, zIndex: draggingItem?.id === item.id ? 50 : 1 }}
                    onDoubleClick={() => openApp(item.appId)}
                    onMouseDown={(e) => handleIconMouseDown(e, item)}
                >
                    <div className="drop-shadow-2xl filter pointer-events-none">{displayIcon}</div>
                    <span className={`text-white ${textSize} text-center line-clamp-2 px-1 font-normal drop-shadow-md pointer-events-none select-none break-all`}>{displayTitle}</span>
                </div>
            );
        })}

        {/* Context Menu */}
        {contextMenu && (
            <div 
                className="absolute bg-[#2b2b2b] border border-[#444] shadow-2xl rounded-sm py-1 w-64 z-[10000] text-gray-200 text-sm font-segoe animate-in fade-in duration-100"
                style={{ left: contextMenu.x, top: contextMenu.y }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* View Submenu */}
                <div className="relative group/view">
                    <div className="px-4 py-1.5 hover:bg-[#444] cursor-default flex items-center justify-between">
                        <div className="flex items-center gap-2"><LayoutGrid size={16} /> Görünüm</div>
                        <ChevronRight size={14} />
                    </div>
                    <div className="absolute left-full top-0 ml-[-2px] bg-[#2b2b2b] border border-[#444] shadow-xl w-56 py-1 hidden group-hover/view:block">
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => { setDesktopViewMode('large'); setContextMenu(null); }}>
                             <div className="w-4 flex justify-center">{desktopViewMode === 'large' && <Circle size={6} fill="white" />}</div> Büyük simgeler
                        </div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => { setDesktopViewMode('medium'); setContextMenu(null); }}>
                            <div className="w-4 flex justify-center">{desktopViewMode === 'medium' && <Circle size={6} fill="white" />}</div> Orta boyutlu simgeler
                        </div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => { setDesktopViewMode('small'); setContextMenu(null); }}>
                            <div className="w-4 flex justify-center">{desktopViewMode === 'small' && <Circle size={6} fill="white" />}</div> Küçük simgeler
                        </div>
                        <div className="h-[1px] bg-gray-600 my-1 mx-2"></div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => { setShowDesktopIcons(!showDesktopIcons); setContextMenu(null); }}>
                            <div className="w-4 flex justify-center">{showDesktopIcons && <Check size={14} />}</div> Masaüstü öğelerini göster
                        </div>
                    </div>
                </div>

                {/* Sort Submenu */}
                <div className="relative group/sort">
                    <div className="px-4 py-1.5 hover:bg-[#444] cursor-default flex items-center justify-between">
                        <div className="flex items-center gap-2"><ArrowLeft size={16} className="rotate-90" /> Sıralama ölçütü</div>
                        <ChevronRight size={14} />
                    </div>
                     <div className="absolute left-full top-0 ml-[-2px] bg-[#2b2b2b] border border-[#444] shadow-xl w-56 py-1 hidden group-hover/sort:block">
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer pl-8" onClick={() => handleSort('name')}>Ad</div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer pl-8" onClick={() => handleSort('size')}>Boyut</div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer pl-8" onClick={() => handleSort('type')}>Öğe türü</div>
                    </div>
                </div>

                <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-2" onClick={handleRefresh}>
                    <RefreshCw size={16} /> Yenile
                </div>

                <div className="h-[1px] bg-gray-600 my-1 mx-2"></div>
                
                {/* New Submenu */}
                <div className="relative group/new">
                     <div className="px-4 py-1.5 hover:bg-[#444] cursor-default flex items-center justify-between">
                        <div className="flex items-center gap-2"><FilePlus size={16} /> Yeni</div>
                        <ChevronRight size={14} />
                    </div>
                    <div className="absolute left-full top-0 ml-[-2px] bg-[#2b2b2b] border border-[#444] shadow-xl w-56 py-1 hidden group-hover/new:block">
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => handleCreateNew('folder')}>
                             <FolderPlus size={16} className="text-yellow-400" /> Klasör
                        </div>
                        <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-3" onClick={() => handleCreateNew('text')}>
                             <FileText size={16} className="text-gray-400" /> Metin Belgesi
                        </div>
                    </div>
                </div>

                <div className="h-[1px] bg-gray-600 my-1 mx-2"></div>
                
                <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-2" onClick={() => { openApp('settings', undefined, {section: 'Sistem'}); setContextMenu(null); }}>
                    <Monitor size={16} /> Görüntü Ayarları
                </div>
                <div className="px-4 py-1.5 hover:bg-[#444] cursor-pointer flex items-center gap-2" onClick={() => { openApp('settings', undefined, {section: 'Kişiselleştirme'}); setContextMenu(null); }}>
                    <Palette size={16} /> Kişiselleştir
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
            icon={dynamicRegistry[win.appId]?.icon || (win.appId === 'recycle-bin' ? <Trash2 /> : <FileText />)}
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
            pinnedAppIds={pinnedAppIds}
        />
        </div>
    </>
  );
};

export default App;