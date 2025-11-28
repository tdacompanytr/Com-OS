import React, { useState, useEffect } from 'react';
import { AppId, ThemeConfig } from '../../types';
import { ChevronUp, Wifi, Volume2, MessageSquare, Battery } from 'lucide-react';

interface TaskbarProps {
  openWindows: Array<{ id: string; appId: AppId; isMinimized: boolean; zIndex: number }>;
  activeWindowId: string | null;
  onAppClick: (appId: AppId, instanceId?: string) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  registry: Record<string, { title: string; icon: React.ReactNode }>;
  theme: ThemeConfig;
  onToggleActionCenter: () => void;
  onToggleCalendar: () => void;
  hasNotifications: boolean;
}

const Taskbar: React.FC<TaskbarProps> = ({ 
    openWindows, activeWindowId, onAppClick, onToggleStart, isStartOpen, registry, theme,
    onToggleActionCenter, onToggleCalendar, hasNotifications
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinnedApps: AppId[] = ['browser', 'market', 'assistant', 'explorer'];

  // Combine pinned apps and open unpinned apps unique list
  const taskbarItems = [...pinnedApps];
  openWindows.forEach(win => {
     if (!taskbarItems.includes(win.appId)) {
        taskbarItems.push(win.appId);
     }
  });

  return (
    <div className="h-12 bg-[#101010]/90 backdrop-blur-xl flex items-center justify-between text-white fixed bottom-0 left-0 right-0 z-[9999] border-t border-white/5 shadow-2xl">
      <div className="flex items-center h-full pl-2">
        {/* Start Button */}
        <button 
          onClick={onToggleStart}
          className={`h-10 w-10 rounded-md flex items-center justify-center hover:bg-white/10 transition-all duration-150 active:scale-95 ${isStartOpen ? `bg-white/10` : ''}`}
        >
           <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-colors duration-300 ${isStartOpen ? 'fill-blue-400' : 'fill-white'}`}>
            <path d="M0 3.429L9.429 2.143V11.571H0V3.429ZM9.429 12.429V21.857L0 20.571V12.429H9.429ZM10.286 2.036L24 0V11.571H10.286V2.036ZM24 24L10.286 21.964V12.429H24V24Z" />
          </svg>
        </button>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center bg-[#2d2d2d] hover:bg-[#333] transition-colors text-gray-300 h-8 w-64 px-3 ml-3 rounded-full cursor-text border border-transparent focus-within:border-gray-500 focus-within:bg-black focus-within:text-white">
            <SearchIcon className="w-4 h-4 mr-2 opacity-50" />
            <span className="text-xs opacity-70">Aramak için buraya yazın</span>
        </div>

        {/* Taskbar Icons */}
        <div className="flex items-center ml-4 h-full gap-1">
          {taskbarItems.map(appId => {
            const appInfo = registry[appId];
            if (!appInfo) return null;

            const appWindows = openWindows.filter(w => w.appId === appId);
            const isOpen = appWindows.length > 0;
            const isActive = appWindows.some(w => w.id === activeWindowId && !w.isMinimized);
            
            return (
              <button
                key={appId}
                onClick={() => {
                   if (isOpen) {
                      const lastInstance = appWindows[appWindows.length - 1];
                      onAppClick(appId, lastInstance.id);
                   } else {
                      onAppClick(appId);
                   }
                }}
                className={`w-10 h-10 rounded-md flex items-center justify-center relative hover:bg-white/10 transition-all duration-150 active:scale-90 group ${isActive ? 'bg-white/5' : ''}`}
              >
                <div className={`w-6 h-6 transition-transform duration-300 ease-fluid ${isOpen ? 'scale-100' : 'scale-90 opacity-80'} ${isActive ? '-translate-y-0.5' : ''}`}>
                    {appInfo.icon}
                </div>
                {/* Active Indicator (Pill) */}
                {isOpen && (
                   <div className={`absolute bottom-1 h-1 rounded-full transition-all duration-300 ease-fluid ${isActive ? `${theme.accentBg} w-3` : 'bg-gray-400 w-1 group-hover:w-2'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center h-full px-2 gap-1 mr-2">
        <button className="h-full px-2 hover:bg-white/10 rounded-md transition-colors duration-150">
           <ChevronUp size={16} />
        </button>
        <div className="h-8 px-2 flex items-center gap-3 hover:bg-white/10 rounded-md cursor-default transition-colors duration-150">
           <Wifi size={18} />
           <Volume2 size={18} />
           <div className="h-4 w-[1px] bg-gray-600 mx-1"></div>
           <Battery size={18} />
        </div>
        <div 
            onClick={onToggleCalendar}
            className="h-8 flex flex-col justify-center items-end px-3 hover:bg-white/10 rounded-md cursor-default text-xs leading-tight min-w-[70px] select-none transition-colors duration-150"
        >
           <span>{time.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
           <span>{time.toLocaleDateString('tr-TR')}</span>
        </div>
        
        {/* Action Center Trigger */}
        <button 
            onClick={onToggleActionCenter}
            className={`h-8 w-8 ml-1 hover:bg-white/10 rounded-md flex items-center justify-center relative transition-colors duration-150 ${hasNotifications ? 'text-white' : 'text-gray-300'}`}
        >
             <MessageSquare size={18} className={hasNotifications ? 'fill-white' : ''} />
             {hasNotifications && (
                 <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${theme.accentBg} border border-black`}></span>
             )}
        </button>

        {/* Show Desktop Sliver */}
        <div 
            className="w-1.5 h-full border-l border-white/10 ml-2 hover:bg-white/20 cursor-pointer transition-colors" 
            title="Masaüstünü Göster"
            onClick={() => {
                const event = new KeyboardEvent('keydown', { key: 'd', metaKey: true });
                window.dispatchEvent(event);
            }}
        ></div>
      </div>
    </div>
  );
};

const SearchIcon = ({className}:{className?:string}) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
)

export default Taskbar;