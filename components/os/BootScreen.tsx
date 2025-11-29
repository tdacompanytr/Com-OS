import React, { useState, useEffect, useRef } from 'react';
import { Cpu } from 'lucide-react';

interface BootScreenProps {
  onBootComplete: () => void;
}

const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const [phase, setPhase] = useState<'bios' | 'setup' | 'boot'>('bios');
  const [showSpinner, setShowSpinner] = useState(false);
  const [biosLines, setBiosLines] = useState<string[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [setupHighlight, setSetupHighlight] = useState(0);
  
  // Refs for timers to clear them on unmount/phase change
  const timeoutsRef = useRef<any[]>([]);

  // --- MEMORY COUNTER LOGIC ---
  useEffect(() => {
    if (phase === 'bios') {
        const interval = setInterval(() => {
            setMemoryCount(prev => {
                if (prev >= 32768) {
                    clearInterval(interval);
                    return 32768;
                }
                return prev + 512;
            });
        }, 20);
        return () => clearInterval(interval);
    }
  }, [phase]);

  // --- KEY LISTENER (DEL for Setup) ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (phase === 'bios') {
              if (e.key === 'Delete' || e.key === 'F2') {
                  setPhase('setup');
                  // Clear existing boot timers
                  timeoutsRef.current.forEach(clearTimeout);
              }
          }
          else if (phase === 'setup') {
              if (e.key === 'ArrowDown') setSetupHighlight(prev => (prev + 1) % 6);
              if (e.key === 'ArrowUp') setSetupHighlight(prev => (prev - 1 + 6) % 6);
              if (e.key === 'Enter') { /* Simulation only */ }
              if (e.key === 'Escape') setPhase('boot');
              if (e.key === 'F10') setPhase('boot');
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase]);

  // --- PHASE 1: BIOS POST SEQUENCE ---
  useEffect(() => {
    if (phase === 'bios') {
        const lines = [
            "Tda Company BIOS v2.0 (c) 2025",
            "Main Processor: Com Core i9-14900K @ 6.0 GHz",
            "Detecting Primary Master... ComOS NVMe SSD 1TB",
            "Detecting Primary Slave... None",
            "Initializing USB Controllers... Done",
            "ACPI Controller... Initialized",
            "PCI Device Listing...",
            "Bus No. Device No. Func No. Vendor/Device Class Device Class IRQ",
            "----------------------------------------------------------------",
            "0       29         0        8086   24C2   0C03  USB Cntrlr   11",
            "0       31         1        8086   24C7   0101  IDE Cntrlr   14",
            "1       0          0        10DE   0040   0300  Display      10",
            "Verifying DMI Pool Data........ Update Success",
            "Booting from Local Disk...",
            "_",
        ];

        let delay = 0;
        
        // Initial delay
        timeoutsRef.current.push(setTimeout(() => {
             setBiosLines(["Award Modular BIOS v6.00PG, An Energy Star Ally"]);
        }, 100));
        
        delay += 500;

        // Line by line typing
        lines.forEach((line, index) => {
            const t = setTimeout(() => {
                setBiosLines(prev => {
                    const newLines = [...prev];
                    if (newLines.length > 0 && newLines[newLines.length - 1] === '_') {
                        newLines.pop();
                    }
                    newLines.push(line);
                    if (index < lines.length - 1) {
                         newLines.push('_');
                    }
                    return newLines;
                });
            }, delay);
            timeoutsRef.current.push(t);
            delay += Math.random() * 400 + 100; // Random speed
        });

        // Auto boot if no key pressed
        const bootTimer = setTimeout(() => {
            setPhase('boot');
        }, delay + 1500);
        timeoutsRef.current.push(bootTimer);

        return () => timeoutsRef.current.forEach(clearTimeout);
    }
  }, [phase]);

  // --- PHASE 3: MODERN BOOT SEQUENCE ---
  useEffect(() => {
      if (phase === 'boot') {
        const spinnerTimer = setTimeout(() => {
            setShowSpinner(true);
        }, 3000);

        const completeTimer = setTimeout(() => {
            onBootComplete();
        }, 8000);

        return () => {
            clearTimeout(spinnerTimer);
            clearTimeout(completeTimer);
        };
      }
  }, [phase, onBootComplete]);


  // --- RENDER: BIOS SETUP (BLUE SCREEN) ---
  if (phase === 'setup') {
      return (
          <div className="fixed inset-0 bg-[#0000AA] text-white font-mono select-none flex items-center justify-center p-8 z-[10000]">
              <div className="w-full max-w-5xl border-2 border-white h-full max-h-[600px] flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="bg-[#AAAAAA] text-blue-900 text-center font-bold py-1">
                      CMOS SETUP UTILITY - COPYRIGHT (C) 2025 Tda Company
                  </div>
                  
                  {/* Body */}
                  <div className="flex-1 flex p-2 gap-4">
                      {/* Left Menu */}
                      <div className="flex-1 border-2 border-white p-4 flex flex-col gap-2">
                          {['STANDARD CMOS FEATURES', 'ADVANCED BIOS FEATURES', 'INTEGRATED PERIPHERALS', 'POWER MANAGEMENT SETUP', 'PnP/PCI CONFIGURATIONS', 'PC HEALTH STATUS'].map((item, i) => (
                              <div key={item} className={`px-2 py-1 ${setupHighlight === i ? 'bg-[#AA0000] text-yellow-300 animate-pulse' : 'text-yellow-300'}`}>
                                  {item}
                              </div>
                          ))}
                          <div className="mt-8 text-yellow-300 px-2">LOAD FAIL-SAFE DEFAULTS</div>
                          <div className="text-yellow-300 px-2">LOAD OPTIMIZED DEFAULTS</div>
                          <div className="mt-4 text-red-500 bg-[#AAAAAA] px-2">SET SUPERVISOR PASSWORD</div>
                          <div className="text-red-500 bg-[#AAAAAA] px-2">SET USER PASSWORD</div>
                          <div className="mt-8 text-yellow-300 px-2">SAVE & EXIT SETUP</div>
                          <div className="text-yellow-300 px-2">EXIT WITHOUT SAVING</div>
                      </div>

                      {/* Right Info */}
                      <div className="w-1/3 border-2 border-white p-4 text-center flex flex-col items-center justify-center gap-4 text-sm">
                          <div className="text-red-500 font-bold bg-black px-4 py-2">
                              MENU LEVEL HELP
                          </div>
                          <div className="text-white">
                              Use [ARROW] keys to select an item. <br/><br/>
                              Press [ENTER] to execute command.
                          </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-[#AAAAAA] text-blue-900 flex justify-between px-4 py-1 text-sm font-bold">
                      <div>ESC: Quit  F10: Save & Exit</div>
                      <div>↑↓→←: Select Item</div>
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: BIOS POST (BLACK SCREEN) ---
  if (phase === 'bios') {
      return (
          <div className="fixed inset-0 bg-black text-[#cccccc] font-mono text-sm sm:text-base p-8 z-[10000] cursor-none select-none flex flex-col justify-start items-start leading-snug overflow-hidden">
              <div className="w-full max-w-6xl relative">
                  
                  {/* Energy Star Logo ASCII */}
                  <div className="absolute top-0 right-0 text-yellow-500 text-[10px] leading-[10px] hidden md:block whitespace-pre font-bold opacity-80">
{`       .
     .'  '.
   .'      '.
  |   energy |
   '.      .'
     '.  .'
       '`}
                  </div>

                  <div className="flex justify-between mb-4 border-b-2 border-white pb-2 font-bold text-white pr-32">
                      <span>Tda BIOS v2.0 Modular BIOS</span>
                      <span></span>
                  </div>

                  <div className="mb-4">
                      <div className="text-white">Main Processor: Com Core i9-14900K @ 6.0 GHz</div>
                      <div className="flex gap-2">
                          <span>Memory Testing:</span>
                          <span className="text-white font-bold">{memoryCount}K OK</span>
                      </div>
                  </div>

                  <div className="space-y-1 min-h-[300px]">
                      {biosLines.map((line, i) => (
                          <div key={i} className={line === '_' ? 'animate-pulse text-white font-bold' : ''}>{line}</div>
                      ))}
                  </div>
                  
                  <div className="fixed bottom-12 left-8 text-white font-bold bg-blue-900/50 px-2 animate-pulse">
                      Press DEL to enter Setup, ESC to Skip Memory Test
                  </div>
                  
                  <div className="fixed bottom-8 left-8 text-xs text-gray-500">
                      00-11-2025-Tda-ComOS-00
                  </div>
              </div>
          </div>
      );
  }

  // --- RENDER: MODERN BOOT (RED LOGO) ---
  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-[10000] cursor-none select-none">
      
      {/* Merkez Logo */}
      <div className="mb-16 animate-in fade-in duration-1000">
         <Cpu size={120} className="text-red-600 drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]" />
      </div>
      
      {/* Windows Tarzı Dönen Noktalar */}
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