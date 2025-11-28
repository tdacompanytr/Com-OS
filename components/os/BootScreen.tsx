import React, { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

interface BootScreenProps {
  onBootComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    // 1. Aşama: Sadece İkon (5 Saniye)
    const spinnerTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 5000);

    // 2. Aşama: Yükleniyor (Spinner çıktıktan sonra 10 Saniye, toplam 15sn)
    const completeTimer = setTimeout(() => {
      onBootComplete();
    }, 15000);

    return () => {
      clearTimeout(spinnerTimer);
      clearTimeout(completeTimer);
    };
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-[10000] cursor-none select-none">
      
      {/* Merkez Logo */}
      <div className="mb-16 animate-in fade-in duration-1000">
         <Cpu size={120} className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
      </div>
      
      {/* Windows Tarzı Dönen Noktalar - 5 saniye sonra gelir */}
      <div className="h-16 flex items-center justify-center">
        {showSpinner && (
          <div className="relative w-12 h-12 animate-in fade-in duration-500">
            {[...Array(5)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute w-2.5 h-2.5 bg-white rounded-full animate-[spin_2.5s_ease-in-out_infinite]"
                  style={{ 
                      animationDelay: `${i * 0.15}s`,
                      left: '50%',
                      top: '0',
                      transformOrigin: '0 24px',
                      opacity: 0.9
                  }}
                />
            ))}
          </div>
        )}
      </div>

      {/* Alt İmza */}
      <div className="fixed bottom-12 text-gray-400 font-medium tracking-widest text-sm animate-pulse">
         Made By Tda Company
      </div>
    </div>
  );
};

export default BootScreen;