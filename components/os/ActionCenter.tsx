import React from 'react';
import { X, Wifi, Bluetooth, Moon, Battery, Plane, Settings, Shield, Cast } from 'lucide-react';
import { Notification, ThemeConfig } from '../../types';

interface ActionCenterProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onClearAll: () => void;
  theme: ThemeConfig;
  toggleSettings: {
      wifi: boolean;
      bluetooth: boolean;
      airplane: boolean;
      nightLight: boolean;
  };
  onToggle: (setting: string) => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ isOpen, notifications, onClose, onClearAll, theme, toggleSettings, onToggle }) => {
  
  const QuickToggle = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
      <div className="flex flex-col gap-2 w-full h-full group cursor-pointer" onClick={onClick}>
        <div 
            className={`flex-1 w-full rounded-md flex flex-col items-start justify-end p-3 transition-all duration-300 ease-fluid ${isActive ? theme.primary : 'bg-[#333] hover:bg-[#3d3d3d]'}`}
        >
            <div className={`transition-transform duration-300 group-hover:scale-110`}>{icon}</div>
        </div>
        <span className="text-[11px] text-center text-gray-300 truncate">{label}</span>
      </div>
  );

  return (
    <div 
        className={`fixed top-0 bottom-12 right-0 w-[380px] bg-[#1e1e1e]/90 backdrop-blur-2xl border-l border-white/10 z-[9998] text-white flex flex-col transition-transform duration-500 ease-fluid shadow-[-10px_0_30px_rgba(0,0,0,0.5)] m-2 rounded-xl overflow-hidden gpu-layer ${isOpen ? 'translate-x-0' : 'translate-x-[110%]'}`}
    >
        {/* Notifications Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="flex justify-between items-end mb-4">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Bildirimler</h3>
                 {notifications.length > 0 && (
                     <button onClick={onClearAll} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">Tümünü temizle</button>
                 )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <span className="text-sm">Yeni bildirim yok</span>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map(notif => (
                        <div key={notif.id} className="bg-[#2d2d2d]/80 hover:bg-[#333] p-4 rounded-lg shadow-sm border border-white/5 animate-in slide-in-from-right-4 duration-300 ease-fluid cursor-default">
                            <div className="flex items-center gap-2 mb-1">
                                {notif.icon && <div className="w-4 h-4">{notif.icon}</div>}
                                <span className="text-xs font-bold text-gray-300">{notif.app}</span>
                                <span className="text-[10px] text-gray-500 ml-auto">{notif.time}</span>
                            </div>
                            <h4 className="text-sm font-semibold mb-1">{notif.title}</h4>
                            <p className="text-xs text-gray-300 leading-snug">{notif.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Quick Actions Area */}
        <div className="bg-[#1e1e1e]/50 p-6 border-t border-white/10 backdrop-blur-md">
             <div className="grid grid-cols-4 gap-4 pb-4">
                  <QuickToggle 
                    icon={<Wifi size={20} />} 
                    label={toggleSettings.wifi ? "ComNet-5G" : "Wi-Fi"} 
                    isActive={toggleSettings.wifi} 
                    onClick={() => onToggle('wifi')} 
                  />
                  <QuickToggle 
                    icon={<Bluetooth size={20} />} 
                    label={toggleSettings.bluetooth ? "Bluetooth" : "Bağlı Değil"} 
                    isActive={toggleSettings.bluetooth} 
                    onClick={() => onToggle('bluetooth')} 
                  />
                  <QuickToggle 
                    icon={<Plane size={20} className="rotate-0" />} 
                    label="Uçak Modu" 
                    isActive={toggleSettings.airplane} 
                    onClick={() => onToggle('airplane')} 
                  />
                  <QuickToggle 
                    icon={<Moon size={20} />} 
                    label="Gece Işığı" 
                    isActive={toggleSettings.nightLight} 
                    onClick={() => onToggle('nightLight')} 
                  />
                   <QuickToggle 
                    icon={<Battery size={20} />} 
                    label="Pil Tasarrufu" 
                    isActive={false} 
                    onClick={() => {}} 
                  />
                   <QuickToggle 
                    icon={<Shield size={20} />} 
                    label="Güvenlik" 
                    isActive={true} 
                    onClick={() => {}} 
                  />
                   <QuickToggle 
                    icon={<Cast size={20} />} 
                    label="Yansıt" 
                    isActive={false} 
                    onClick={() => {}} 
                  />
                   <QuickToggle 
                    icon={<Settings size={20} />} 
                    label="Tüm Ayarlar" 
                    isActive={false} 
                    onClick={() => {}} 
                  />
             </div>
             {/* Slider */}
             <div className="mt-4 flex items-center gap-4">
                 <div className="w-full h-10 bg-[#333] rounded-md relative flex items-center px-4 overflow-hidden group">
                     <span className="text-xs font-bold absolute left-4 z-10 mix-blend-difference">75%</span>
                     <div className="h-full absolute left-0 top-0 bg-gray-600/50 group-hover:bg-gray-600 transition-colors w-full rounded-md">
                         <div className={`h-full ${theme.primary} transition-all duration-300`} style={{width: '75%'}}></div>
                     </div>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default ActionCenter;