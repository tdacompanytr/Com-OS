import React, { useMemo } from 'react';
import { AppId, ThemeConfig } from '../../types';
import { 
  Power, Settings, User, FileText, Image as ImageIcon, 
  Mail, Calendar, Sun, Newspaper, Calculator, Map, 
  Music, Film, Camera, LayoutGrid, X, MapPin
} from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onAppClick: (appId: AppId) => void;
  onClose: () => void;
  onShutdown: () => void;
  registry: Record<string, { title: string; icon: React.ReactNode }>;
  theme: ThemeConfig;
}

const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onAppClick, onClose, onShutdown, registry, theme }) => {
  
  // Group apps alphabetically
  const groupedApps = useMemo(() => {
    const apps = Object.entries(registry).map(([id, app]) => ({ id, ...app }));
    // Sort by title
    apps.sort((a, b) => a.title.localeCompare(b.title));
    
    const groups: Record<string, typeof apps> = {};
    apps.forEach(app => {
      const char = app.title.charAt(0).toUpperCase();
      if (!groups[char]) groups[char] = [];
      groups[char].push(app);
    });
    return groups;
  }, [registry]);

  if (!isOpen) return null;

  const Tile = ({ 
    size = 'medium', 
    color, 
    icon, 
    title, 
    subtitle, 
    onClick,
    content
  }: { 
    size?: 'small' | 'medium' | 'wide' | 'large', 
    color: string, 
    icon?: React.ReactNode, 
    title?: string, 
    subtitle?: string | React.ReactNode,
    onClick?: () => void,
    content?: React.ReactNode
  }) => {
    let colSpan = 'col-span-2';
    let rowSpan = 'row-span-1'; // default aspect-square roughly

    if (size === 'small') { colSpan = 'col-span-1'; }
    if (size === 'medium') { colSpan = 'col-span-2'; }
    if (size === 'wide') { colSpan = 'col-span-4'; }
    if (size === 'large') { colSpan = 'col-span-4'; rowSpan = 'row-span-2'; }

    return (
      <div 
        onClick={onClick}
        className={`${colSpan} ${rowSpan} ${color} p-2 relative group hover:outline hover:outline-2 hover:outline-white/50 cursor-pointer transition-transform duration-75 active:scale-95 flex flex-col justify-between overflow-hidden shadow-sm`}
        style={{ aspectRatio: size === 'small' || size === 'medium' ? '1/1' : size === 'wide' ? '2/1' : 'auto' }}
      >
        {content ? content : (
          <>
             {icon && <div className="self-center mt-2">{icon}</div>}
             <div className="flex flex-col">
                {title && <span className="text-xs font-semibold truncate">{title}</span>}
                {subtitle && <span className="text-[10px] opacity-80 truncate">{subtitle}</span>}
             </div>
          </>
        )}
        {/* Icon overlay for large content tiles */}
        {!content && icon && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-10 transition-opacity transform scale-150">
           {icon}
        </div>}
      </div>
    );
  };

  const today = new Date();

  return (
    <div className="fixed bottom-10 left-0 h-[600px] bg-[#1e1e1e]/95 backdrop-blur-2xl border border-[#333] z-[9998] flex shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-200 select-none text-white overflow-hidden max-w-[90vw] w-[800px]">
      
      {/* 1. Left Sidebar (System Shortcuts) */}
      <div className="w-12 flex flex-col justify-end items-center pb-2 gap-1 text-gray-400 bg-black/20">
        <div className="flex-1"></div> {/* Spacer */}
        
        <button className="p-3 hover:bg-white/10 rounded-sm w-full flex justify-center transition-colors group relative" title="Hesap">
           <User size={18} />
           <span className="absolute left-12 bg-[#2d2d2d] border border-[#444] px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">Tda Kullanıcısı</span>
        </button>
        <button className="p-3 hover:bg-white/10 rounded-sm w-full flex justify-center transition-colors group relative" title="Belgeler" onClick={() => {onAppClick('explorer'); onClose();}}>
           <FileText size={18} />
        </button>
        <button className="p-3 hover:bg-white/10 rounded-sm w-full flex justify-center transition-colors group relative" title="Resimler" onClick={() => {onAppClick('explorer'); onClose();}}>
           <ImageIcon size={18} />
        </button>
        <button className="p-3 hover:bg-white/10 rounded-sm w-full flex justify-center transition-colors group relative" title="Ayarlar" onClick={() => {onAppClick('settings'); onClose();}}>
           <Settings size={18} />
        </button>
        <button 
          className="p-3 hover:bg-red-600/80 hover:text-white rounded-sm w-full flex justify-center transition-colors group relative" 
          title="Güç: Bilgisayarı Kapat"
          onClick={onShutdown}
        >
           <Power size={18} />
        </button>
      </div>

      {/* 2. Middle Column (App List) */}
      <div className="w-64 flex flex-col h-full bg-transparent overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-12">
           
           {/* Most Used Section */}
           <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-400 px-3 mb-2 mt-2 hidden">En Çok Kullanılanlar</h3>
              {['browser', 'market', 'explorer'].map(id => {
                 const app = registry[id];
                 if(!app) return null;
                 return (
                    <button
                      key={id}
                      onClick={() => { onAppClick(id as AppId); onClose(); }}
                      className="flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-sm text-sm text-left group"
                    >
                      <div className={`w-8 h-8 p-1.5 bg-transparent`}>
                          {app.icon}
                      </div>
                      <div className="flex flex-col">
                         <span>{app.title}</span>
                         <span className="text-[10px] text-gray-400">En çok kullanılan</span>
                      </div>
                    </button>
                 )
              })}
           </div>

           {/* Alphabetical List */}
           {Object.keys(groupedApps).sort().map(char => (
             <div key={char} className="mb-2">
                <div className="px-4 py-1 text-xs font-bold text-gray-400 hover:text-white cursor-default sticky top-0 bg-[#1e1e1e]/90 backdrop-blur z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 mb-1">
                   {char}
                </div>
                {groupedApps[char].map((app: any) => (
                   <button
                    key={app.id}
                    onClick={() => { onAppClick(app.id as AppId); onClose(); }}
                    className="flex items-center gap-3 w-full p-2 pl-4 hover:bg-white/10 rounded-sm text-sm text-left group"
                  >
                    <div className="w-6 h-6 grayscale-[0.3] group-hover:grayscale-0 transition-all">
                        {app.icon}
                    </div>
                    <span>{app.title}</span>
                  </button>
                ))}
             </div>
           ))}
        </div>
      </div>

      {/* 3. Right Column (Live Tiles) */}
      <div className="flex-1 p-4 pl-6 overflow-y-auto custom-scrollbar bg-black/10">
        
        {/* Group: Hayatın İçinden */}
        <div className="flex items-center justify-between mb-2 group">
           <h3 className="text-sm font-semibold text-gray-100">Hayatın içinden</h3>
           <div className="h-[1px] bg-gray-600 flex-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="grid grid-cols-6 gap-1.5 mb-8">
           {/* Calendar (Medium) */}
           <Tile 
             size="medium" 
             color={`${theme.primary} hover:opacity-90`}
             content={
               <div className="flex flex-col h-full justify-between p-2">
                 <div className="text-right text-xs font-medium">{today.toLocaleDateString('tr-TR', { weekday: 'long' })}</div>
                 <div className="flex flex-col items-center justify-center">
                    <span className="text-4xl font-light">{today.getDate()}</span>
                 </div>
                 <div className="text-xs">{today.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</div>
               </div>
             }
           />

           {/* Mail (Medium) */}
           <Tile 
             size="medium" 
             color="bg-blue-500 hover:bg-blue-400"
             icon={<Mail size={24} />}
             title="Posta"
             subtitle="Yeni posta yok"
           />

           {/* Browser (Medium) */}
           <Tile 
              size="medium"
              color="bg-[#2d2d2d] hover:bg-[#3d3d3d]"
              onClick={() => { onAppClick('browser'); onClose(); }}
              content={
                 <div className="flex flex-col items-center justify-center h-full gap-2">
                    <div className="w-8 h-8">{registry['browser']?.icon}</div>
                    <span className="text-xs">Com Tarayıcı</span>
                 </div>
              }
           />

           {/* Photos (Wide) */}
           <Tile 
              size="wide"
              color="bg-[#2d2d2d] hover:bg-[#3d3d3d]"
              onClick={() => { onAppClick('explorer'); onClose(); }}
              content={
                <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                    <img 
                      src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                      className="w-full h-full object-cover opacity-80" 
                      alt="Photos"
                    />
                    <div className="absolute bottom-2 left-2 flex items-center gap-2 drop-shadow-md">
                       <div className="bg-blue-500 p-1 rounded-sm"><ImageIcon size={12} /></div>
                       <span className="text-xs font-medium">Anılar: Geçen Dağ Gezisi</span>
                    </div>
                </div>
              }
           />

           {/* Weather (Medium) */}
           <Tile 
             size="medium"
             color={`${theme.primary} hover:opacity-90`}
             content={
                <div className="p-2 flex flex-col justify-between h-full">
                   <div className="flex justify-between items-start">
                      <MapPin size={12} className="opacity-70" />
                      <span className="text-xs">İstanbul</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Sun size={28} className="text-yellow-300" />
                      <span className="text-2xl">22°</span>
                   </div>
                   <div className="text-xs opacity-80">Güneşli • 14° / 24°</div>
                </div>
             }
           />

           {/* Store (Wide) */}
           <Tile 
              size="wide"
              color="bg-gradient-to-br from-indigo-900 to-[#111] border border-white/10"
              onClick={() => { onAppClick('market'); onClose(); }}
              content={
                 <div className="p-3 h-full flex flex-col justify-end">
                    <div className="absolute top-3 left-3 bg-white/10 p-1.5 rounded-full"><LayoutGrid size={16} /></div>
                    <div className="font-semibold text-sm">Com Mağaza</div>
                    <div className="text-xs text-gray-400">En yeni oyunları keşfet</div>
                    <button className="mt-2 bg-white/20 text-xs py-1 px-2 w-fit rounded hover:bg-white/30 transition-colors">Mağazaya Git</button>
                 </div>
              }
           />
        </div>

        {/* Group: Üretkenlik ve Araçlar */}
        <div className="flex items-center justify-between mb-2 group mt-4">
           <h3 className="text-sm font-semibold text-gray-100">Üretkenlik ve Araçlar</h3>
           <div className="h-[1px] bg-gray-600 flex-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="grid grid-cols-6 gap-1.5">
           
           <Tile 
             size="small" 
             color="bg-blue-700 hover:bg-blue-600" 
             icon={<FileText size={20} />} 
             title="Word"
           />
           <Tile 
             size="small" 
             color="bg-green-700 hover:bg-green-600" 
             icon={<LayoutGrid size={20} />} 
             title="Excel"
           />
            <Tile 
             size="small" 
             color="bg-orange-700 hover:bg-orange-600" 
             icon={<LayoutGrid size={20} />} 
             title="Slayt"
           />
           <Tile 
             size="small" 
             color="bg-purple-700 hover:bg-purple-600" 
             icon={<FileText size={20} />} 
             title="OneNote"
           />

           {/* News (Wide) */}
           <Tile 
              size="wide"
              color="bg-[#2b2b2b] hover:bg-[#3a3a3a]"
              content={
                <div className="p-3 h-full flex flex-col relative overflow-hidden">
                   <div className="flex items-center gap-2 mb-1 z-10">
                      <div className="bg-red-600 p-1 rounded-sm"><Newspaper size={12} /></div>
                      <span className="text-[10px] font-bold uppercase">Son Dakika</span>
                   </div>
                   <div className="text-xs font-medium z-10 leading-snug">
                      Teknoloji dünyasında yeni gelişmeler: Com OS 2.0 duyuruldu!
                   </div>
                   <div className="text-[10px] text-gray-400 mt-1 z-10">15 dakika önce</div>
                   <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tl from-red-900/20 to-transparent rounded-full blur-xl"></div>
                </div>
              }
           />

           <Tile 
              size="medium"
              color="bg-[#1f1f1f] hover:bg-[#2f2f2f]"
              onClick={() => { onAppClick('calculator'); onClose(); }}
              icon={<Calculator size={24} />}
              title="Hesap Mak."
           />
           <Tile 
              size="medium"
              color="bg-purple-800 hover:bg-purple-700"
              onClick={() => { onAppClick('assistant'); onClose(); }}
              content={
                <div className="p-2 flex flex-col h-full justify-between items-center">
                    <div className="w-8 h-8">{registry['assistant']?.icon}</div>
                    <div className="text-center">
                        <div className="text-xs font-semibold">Asistan</div>
                        <div className="text-[10px] opacity-70">Hazırım!</div>
                    </div>
                </div>
              }
           />
           
           <Tile size="small" color="bg-gray-700" icon={<Music size={18} />} />
           <Tile size="small" color="bg-pink-700" icon={<Film size={18} />} />
           <Tile size="small" color="bg-indigo-700" icon={<Map size={18} />} />
           <Tile size="small" color="bg-cyan-700" icon={<Camera size={18} />} />

        </div>

      </div>
    </div>
  );
};

export default StartMenu;