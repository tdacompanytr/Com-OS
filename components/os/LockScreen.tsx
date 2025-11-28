import React, { useState, useEffect } from 'react';
import { ArrowRight, User } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface LockScreenProps {
  onUnlock: () => void;
  wallpaper: string;
  theme: ThemeConfig;
  password?: string;
}

const LockScreen: React.FC<LockScreenProps> = ({ onUnlock, wallpaper, theme, password }) => {
  const [isSliding, setIsSliding] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Password handling
  const [inputPassword, setInputPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleInteraction = () => {
    if (!isSliding) setIsSliding(true);
  };

  const handleLogin = () => {
    if (!password) {
        onUnlock();
        return;
    }
    
    if (inputPassword === password) {
        onUnlock();
    } else {
        setLoginError(true);
        setInputPassword('');
        setTimeout(() => setLoginError(false), 500); // Reset animation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          if (isSliding) {
             handleLogin();
          } else {
             handleInteraction();
          }
      } else if (!isSliding) {
          handleInteraction();
      }
  };

  return (
    <div 
      className="fixed inset-0 z-[10001] bg-cover bg-center overflow-hidden select-none"
      style={{ backgroundImage: `url(${wallpaper})` }}
      onClick={handleInteraction}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
        <div className="absolute inset-0 bg-black/20" />

        {/* Date & Time Layer (Slides away) */}
        <div 
            className={`absolute inset-0 flex flex-col items-center pt-32 text-white transition-transform duration-500 ease-in-out ${isSliding ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
             <div className="text-8xl font-light tracking-tight drop-shadow-md">
                 {time.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
             </div>
             <div className="text-2xl font-normal mt-2 drop-shadow-md">
                 {time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
             </div>
        </div>

        {/* Login Layer (Slides up) */}
        <div 
            className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md transition-all duration-500 ease-in-out ${isSliding ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
            onClick={(e) => e.stopPropagation()} // Prevent sliding down when clicking form
        >
             <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500 delay-200">
                 <div className="w-48 h-48 rounded-full bg-gray-600 border-4 border-white/10 flex items-center justify-center shadow-2xl relative overflow-hidden">
                     <User size={80} className="text-gray-300" />
                 </div>
                 
                 <div className="text-center">
                     <h2 className="text-3xl font-semibold text-white mb-1">Tda Kullanıcısı</h2>
                     {password && isSliding && <p className="text-gray-300 text-sm opacity-0 animate-in fade-in delay-500">Parola korumalı</p>}
                 </div>

                 {password ? (
                     <div className="flex flex-col w-full max-w-[280px]">
                        <div className="flex mb-2">
                            <input 
                                type="password" 
                                className={`flex-1 bg-white/90 text-black px-3 py-1.5 outline-none border-2 focus:bg-white focus:border-white/50 placeholder-gray-500 text-sm ${loginError ? 'border-red-500 animate-shake' : 'border-transparent'}`}
                                placeholder="Parola"
                                value={inputPassword}
                                onChange={e => setInputPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                autoFocus={isSliding}
                            />
                            <button 
                                onClick={handleLogin}
                                className="bg-white/40 hover:bg-white/60 w-10 flex items-center justify-center border-2 border-transparent transition-colors"
                            >
                                <ArrowRight size={20} className="text-white drop-shadow-md" />
                            </button>
                        </div>
                        {loginError && <div className="text-white text-xs font-semibold drop-shadow-md bg-red-500/80 px-2 py-1 rounded">Parola yanlış. Tekrar deneyin.</div>}
                    </div>
                 ) : (
                    <button 
                        onClick={onUnlock}
                        className={`${theme.primary} hover:opacity-90 text-white px-8 py-2 rounded-sm flex items-center gap-2 transition-all shadow-lg active:scale-95`}
                    >
                        Oturum Aç <ArrowRight size={18} />
                    </button>
                 )}
             </div>
             
             <div className="absolute bottom-12 flex gap-8 text-white/80">
                 <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                     <div className="p-3 bg-white/10 rounded-full"><span className="text-xs">TR</span></div>
                     <span className="text-xs">Türkçe Q</span>
                 </div>
                 <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white">
                     <div className="p-3 bg-white/10 rounded-full"><span className="text-xs">Erişim</span></div>
                     <span className="text-xs">Kolaylığı</span>
                 </div>
             </div>
        </div>
    </div>
  );
};

export default LockScreen;