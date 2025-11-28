import React, { useMemo, useState } from 'react';
import { AppId, ThemeConfig } from '../../types';
import { 
  Power, Settings, User, FileText, Image as ImageIcon, 
  Calculator, LayoutGrid, Menu, Search
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
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
    let rowSpan = 'row-span-2'; 
    let height = 'h-24';

    if (size === 'small') { colSpan = 'col-span-1'; rowSpan = 'row-span-1'; height = 'h-[46px]'; }
    if (size === 'medium') { colSpan = 'col-span-2'; rowSpan = 'row-span-2'; height = 'h-24'; }
    if (size === 'wide') { colSpan = 'col-span-4'; rowSpan = 'row-span-2'; height = 'h-24'; }
    if (size === 'large') { colSpan = 'col-span-4'; rowSpan = 'row-span-4'; height = 'h-48'; }

    return (
      <div 
        onClick={onClick}
        className={`${colSpan} ${rowSpan} ${height} ${color} relative group cursor-pointer transition-transform duration-100 active:scale-95 flex flex-col justify-between overflow-hidden shadow-sm outline outline-2 outline-transparent hover:outline-gray-400/50 hover:z-10`}
      >
        {content ? content : (
          <div className="p-2 h-full flex flex-col justify-between">
             {icon && <div className="self-center mt-1">{icon}</div>}
             <div className="flex flex-col px-1 pb-1">
                {title && <span className="text-xs font-semibold truncate leading-tight">{title}</span>}
                {subtitle && <span className="text-[10px] opacity-80 truncate">{subtitle}</span>}
             </div>
          </div>
        )}
      </div>
    );
  };

  const SidebarButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick?: () => void }) => (
    <button 
      onClick={onClick}
      className={`w-full h-12 flex items-center px-3 hover:bg-white/10 transition-colors duration-150 group text-white`}
      title={label}
    >
      <div className="w-5 h-5 flex items-center justify-center shrink-0">
         {icon}
      </div>
      <span className={`ml-4 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-200 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
        {label}
      </span>
    </button>
  );

  const today = new Date();

  return (
    <div className="fixed bottom-12 left-0 h-[600px] w-[700px] bg-[#1a1a1a]/95 backdrop-blur-xl z-[9998] flex shadow-[4px_0_20px_rgba(0,0,0,0.5)] origin-bottom-left animate-in slide-in-from-bottom-10 duration-200 text-white select-none">
      
      {/* 1. Left Sidebar (System Shortcuts) */}
      <div 
        className={`flex flex-col justify-between items-start bg-black/20 pt-1 transition-all duration-300 ${isSidebarExpanded ? 'w-64 absolute z-20 h-full shadow-2xl bg-[#1a1a1a]' : 'w-12 relative'}`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="w-full">
           <SidebarButton icon={<Menu size={18} />} label="BAŞLANGIÇ" />
        </div>
        
        <div className="w-full pb-2">
           <SidebarButton icon={<User size={18} />} label="Tda Kullanıcısı" />
           <SidebarButton icon={<FileText size={18} />} label="Belgeler" onClick={() => {onAppClick('explorer'); onClose();}} />
           <SidebarButton icon={<ImageIcon size={18} />} label="Resimler" onClick={() => {onAppClick('explorer'); onClose();}} />
           <SidebarButton icon={<Settings size={18} />} label="Ayarlar" onClick={() => {onAppClick('settings'); onClose();}} />
           <SidebarButton icon={<Power size={18} />} label="Güç" onClick={onShutdown} />
        </div>
      </div>

      {/* 2. Middle Column (App List) */}
      <div className="w-64 flex flex-col h-full bg-transparent overflow-hidden pl-2">
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pr-2">
           
           {/* Recently Added Section */}
           <div className="mb-4">
              <div className="px-3 py-1 text-xs font-semibold text-gray-400 mb-1">En çok kullanılanlar</div>
              {['browser', 'market', 'explorer'].map(id => (
                  <button
                    key={id}
                    onClick={() => { onAppClick(id as AppId); onClose(); }}
                    className="flex items-center gap-3 w-full p-2 hover:bg-white/10 text-sm text-left transition-colors duration-100"
                  >
                    <div className="w-8 h-8 p-1 bg-[#0078d7] flex items-center justify-center">
                        {registry[id]?.icon}
                    </div>
                    <span>{registry[id]?.title}</span>
                  </button>
              ))}
           </div>

           {/* Alphabetical List */}
           {Object.keys(groupedApps).sort().map(char => (
             <div key={char} className="mb-2">
                <div className="px-3 py-1 text-xs font-bold text-gray-400 cursor-default w-full mb-1 hover:text-white">
                   {char}
                </div>
                {groupedApps[char].map((app: any) => (
                   <button
                    key={app.id}
                    onClick={() => { onAppClick(app.id as AppId); onClose(); }}
                    className="flex items-center gap-3 w-full p-2 hover:bg-white/10 text-sm text-left transition-colors duration-100 group"
                  >
                    <div className="w-8 h-8 p-1.5 flex items-center justify-center bg-gray-600 group-hover:bg-[#0078d7] transition-colors">
                        {app.icon}
                    </div>
                    <span className="text-xs">{app.title}</span>
                  </button>
                ))}
             </div>
           ))}
        </div>
      </div>

      {/* 3. Right Column (Live Tiles) */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-transparent pl-6 pr-4">
        
        <div className="text-sm font-semibold text-white mb-2 group flex justify-between items-center cursor-default">
            <span>Hayatın İçinden</span>
            <div className="h-[2px] bg-white/10 flex-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="grid grid-cols-6 gap-1 mb-8">
           {/* Calendar (Medium) */}
           <Tile 
             size="medium" 
             color={`${theme.primary} hover:opacity-90`}
             content={
               <div className="flex flex-col h-full justify-between p-2">
                 <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-4xl font-light tracking-tighter">{today.getDate()}</span>
                    <span className="text-sm font-medium">{today.toLocaleDateString('tr-TR', { weekday: 'long' })}</span>
                 </div>
               </div>
             }
           />

           <Tile 
              size="medium"
              color="bg-[#2b2b2b] hover:bg-[#333]"
              onClick={() => { onAppClick('browser'); onClose(); }}
              content={
                 <div className="flex flex-col items-center justify-center h-full gap-2 p-2">
                    <div className="w-8 h-8">{registry['browser']?.icon}</div>
                    <span className="text-xs text-center leading-tight text-gray-300">İnternette Gezin</span>
                 </div>
              }
           />

           <Tile 
              size="wide"
              color="bg-[#2b2b2b] hover:bg-[#333]"
              onClick={() => { onAppClick('explorer'); onClose(); }}
              content={
                <div className="relative w-full h-full group">
                    <img 
                      src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-200" 
                      alt="Photos"
                    />
                    <div className="absolute bottom-2 left-2">
                       <span className="text-xs font-semibold text-white drop-shadow-md">Anılar</span>
                    </div>
                </div>
              }
           />
           
           <Tile 
              size="small"
              color="bg-[#0078d7]"
              icon={<Settings size={20} />}
              onClick={() => { onAppClick('settings'); onClose(); }}
           />
           <Tile 
              size="small"
              color="bg-purple-700"
              icon={<Calculator size={20} />}
              onClick={() => { onAppClick('calculator'); onClose(); }}
           />
           <Tile 
              size="small"
              color="bg-green-600"
              icon={<LayoutGrid size={20} />}
           />
           <Tile 
              size="small"
              color="bg-orange-600"
              icon={<Search size={20} />}
           />
        </div>

        <div className="text-sm font-semibold text-white mb-2 group flex justify-between items-center cursor-default">
            <span>Üretkenlik ve Eğlence</span>
            <div className="h-[2px] bg-white/10 flex-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <div className="grid grid-cols-6 gap-1">
           <Tile 
              size="wide"
              color="bg-[#1f1f1f] hover:bg-[#2f2f2f]"
              onClick={() => { onAppClick('market'); onClose(); }}
              content={
                 <div className="p-3 h-full flex flex-row items-center justify-between border border-white/5">
                    <div className="flex flex-col gap-1">
                        <div className="font-bold text-sm">Com Mağaza</div>
                        <div className="text-xs text-gray-400">Yeni oyunları keşfet</div>
                    </div>
                    <div className="text-yellow-500">
                        <LayoutGrid size={24} />
                    </div>
                 </div>
              }
           />

           <Tile 
              size="medium"
              color="bg-indigo-600"
              onClick={() => { onAppClick('assistant'); onClose(); }}
              content={
                <div className="p-2 flex flex-col h-full justify-between items-center">
                    <div className="w-8 h-8 mt-2">{registry['assistant']?.icon}</div>
                    <div className="text-xs font-medium mb-1">Asistan</div>
                </div>
              }
           />
           
           <Tile 
              size="medium"
              color="bg-[#d13438]"
              content={
                 <div className="flex flex-col h-full justify-center items-center gap-1 p-2 text-center">
                    <div className="font-bold text-xs">Haberler</div>
                    <div className="text-[10px] leading-tight opacity-90">Com OS 2.0 yayınlandı. Şimdi güncelleyin.</div>
                 </div>
              }
           />
        </div>

      </div>
    </div>
  );
};

export default StartMenu;