import React, { useState, useEffect } from 'react';
import { AppId, ThemeConfig } from '../../types';
import { ChevronUp, Wifi, Volume2 } from 'lucide-react';

interface TaskbarProps {
  openWindows: Array<{ id: string; appId: AppId; isMinimized: boolean; zIndex: number }>;
  activeWindowId: string | null;
  onAppClick: (appId: AppId, instanceId?: string) => void;
  onToggleStart: () => void;
  isStartOpen: boolean;
  registry: Record<string, { title: string; icon: React.ReactNode }>;
  theme: ThemeConfig;
}

const Taskbar: React.FC<TaskbarProps> = ({ openWindows, activeWindowId, onAppClick, onToggleStart, isStartOpen, registry, theme }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinnedApps: AppId[] = ['browser', 'market', 'assistant'];

  // Combine pinned apps and open unpinned apps unique list
  const taskbarItems = [...pinnedApps];
  openWindows.forEach(win => {
     if (!taskbarItems.includes(win.appId)) {
        taskbarItems.push(win.appId);
     }
  });

  return (
    <div className="h-10 bg-[#101010]/95 backdrop-blur-md flex items-center justify-between text-white fixed bottom-0 left-0 right-0 z-[9999] border-t border-[#333]">
      <div className="flex items-center h-full">
        {/* Start Button */}
        <button 
          onClick={onToggleStart}
          className={`h-full px-4 flex items-center justify-center hover:bg-[#2d2d2d] hover:${theme.text} transition-colors ${isStartOpen ? `bg-[#2d2d2d] ${theme.text}` : 'text-gray-100'}`}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M0 3.429L9.429 2.143V11.571H0V3.429ZM9.429 12.429V21.857L0 20.571V12.429H9.429ZM10.286 2.036L24 0V11.571H10.286V2.036ZM24 24L10.286 21.964V12.429H24V24Z" />
          </svg>
        </button>

        {/* Search Bar Placeholder */}
        <div className="hidden md:flex items-center bg-[#f0f0f0] text-gray-800 h-7 w-64 px-3 ml-2 rounded-sm cursor-text border-2 border-transparent focus-within:border-blue-500">
            <svg className="w-4 h-4 mr-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span className="text-xs opacity-70">Aramak için buraya yazın</span>
        </div>

        {/* Taskbar Icons */}
        <div className="flex items-center ml-2 h-full">
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
                      // If multiple instances, toggle the last one
                      const lastInstance = appWindows[appWindows.length - 1];
                      if (isActive && !lastInstance.isMinimized) {
                          onAppClick(appId, lastInstance.id);
                      } else {
                          onAppClick(appId, lastInstance.id);
                      }
                   } else {
                      onAppClick(appId);
                   }
                }}
                className={`w-10 h-10 flex items-center justify-center relative hover:bg-[#2d2d2d] transition-all group ${isActive ? 'bg-[#2d2d2d]/60' : ''}`}
              >
                <div className={`w-5 h-5 transition-transform group-hover:-translate-y-1 ${isActive ? '-translate-y-1' : ''}`}>
                    {appInfo.icon}
                </div>
                {/* Underline indicator */}
                {isOpen && (
                   <div className={`absolute bottom-0 h-[2px] w-full transition-all ${isActive ? `${theme.accentBg} w-full` : 'bg-gray-400 w-2 group-hover:w-full'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System Tray */}
      <div className="flex items-center h-full px-2 gap-1">
        <button className="h-full px-1 hover:bg-[#2d2d2d] rounded-sm">
           <ChevronUp size={16} />
        </button>
        <div className="h-full px-2 flex items-center gap-3 hover:bg-[#2d2d2d] rounded-sm cursor-default">
           <Wifi size={16} />
           <Volume2 size={16} />
        </div>
        <div className="h-full flex flex-col justify-center items-end px-3 hover:bg-[#2d2d2d] rounded-sm cursor-default text-xs leading-tight min-w-[70px]">
           <span>{time.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
           <span>{time.toLocaleDateString('tr-TR')}</span>
        </div>
        {/* Show Desktop Sliver */}
        <div className="w-1 h-full border-l border-gray-600 ml-1 hover:bg-[#333]" title="Show Desktop"></div>
      </div>
    </div>
  );
};

export default Taskbar;