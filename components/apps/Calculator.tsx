
import React, { useState, useEffect } from 'react';
import { RotateCcw, History, Menu, Calendar, Calculator as CalcIcon, Beaker, Ruler, Zap, Database, Banknote, ChevronDown } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface CalculatorAppProps {
  theme?: ThemeConfig;
}

type Mode = 'STANDARD' | 'SCIENTIFIC' | 'DATE' | 'CURRENCY' | 'VOLUME' | 'LENGTH' | 'SPEED' | 'DATA';

// Conversion Rates and Units
const CONVERSION_DATA: Record<string, { units: Record<string, number>, label: string }> = {
    'CURRENCY': {
        label: 'Para Birimi',
        units: { 'TRY': 1, 'USD': 0.030, 'EUR': 0.028, 'GBP': 0.024, 'JPY': 4.5 } // Mock rates base TRY
    },
    'VOLUME': {
        label: 'Hacim',
        units: { 'ml': 1, 'l': 0.001, 'gal': 0.000264, 'fl_oz': 0.0338 } // Base ml
    },
    'LENGTH': {
        label: 'Uzunluk',
        units: { 'mm': 1000, 'cm': 100, 'm': 1, 'km': 0.001, 'in': 39.37, 'ft': 3.28 } // Base m
    },
    'SPEED': {
        label: 'Hız',
        units: { 'km/h': 1, 'mph': 0.621, 'm/s': 0.277, 'ft/s': 0.911 } // Base km/h
    },
    'DATA': {
        label: 'Veri',
        units: { 'B': 1073741824, 'KB': 1048576, 'MB': 1024, 'GB': 1, 'TB': 0.000976 } // Base GB
    }
};

const CalculatorApp: React.FC<CalculatorAppProps> = ({ theme }) => {
  const [mode, setMode] = useState<Mode>('STANDARD');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Standard/Scientific State
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [shouldReset, setShouldReset] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  // Converter State
  const [convValue, setConvValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');

  // Date Calc State
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(new Date().toISOString().split('T')[0]);

  const playClickSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
    } catch {}
  };

  // Init default units when mode changes
  useEffect(() => {
      if (['CURRENCY', 'VOLUME', 'LENGTH', 'SPEED', 'DATA'].includes(mode)) {
          const keys = Object.keys(CONVERSION_DATA[mode].units);
          setFromUnit(keys[0]);
          setToUnit(keys[1] || keys[0]);
          setConvValue('1');
      }
  }, [mode]);

  // --- LOGIC: Standard & Scientific ---

  const handleNumber = (num: string) => {
    playClickSound();
    if (currentValue === '0' || shouldReset) {
      setCurrentValue(num);
      setShouldReset(false);
    } else {
      setCurrentValue(prev => prev + num);
    }
  };

  const handleOperator = (op: string) => {
    playClickSound();
    if (operation && !shouldReset && previousValue) {
       calculate();
    }
    setPreviousValue(currentValue);
    setOperation(op);
    setShouldReset(true);
  };

  const calculate = () => {
    if (!previousValue || !operation) return;
    
    const current = parseFloat(currentValue);
    const previous = parseFloat(previousValue);
    let result = 0;

    switch (operation) {
      case '+': result = previous + current; break;
      case '-': result = previous - current; break;
      case 'X': result = previous * current; break;
      case '/': result = previous / current; break;
      case 'mod': result = previous % current; break;
      case '^': result = Math.pow(previous, current); break;
    }

    const resultStr = String(Math.round(result * 100000000) / 100000000);
    setHistory(prev => [`${previous} ${operation} ${current} = ${resultStr}`, ...prev].slice(0, 5));
    setCurrentValue(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setShouldReset(true);
  };

  const handleScientific = (func: string) => {
      playClickSound();
      const val = parseFloat(currentValue);
      let res = 0;
      switch(func) {
          case 'sin': res = Math.sin(val); break;
          case 'cos': res = Math.cos(val); break;
          case 'tan': res = Math.tan(val); break;
          case 'sqrt': res = Math.sqrt(val); break;
          case 'sqr': res = val * val; break;
          case 'log': res = Math.log10(val); break;
          case 'ln': res = Math.log(val); break;
          case '1/x': res = 1 / val; break;
          case 'pi': res = Math.PI; break;
          case 'e': res = Math.E; break;
          case 'abs': res = Math.abs(val); break;
      }
      setCurrentValue(String(res));
      setShouldReset(true);
  };

  const clear = () => {
    playClickSound();
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const deleteLast = () => {
    playClickSound();
    if (currentValue.length === 1) {
      setCurrentValue('0');
    } else {
      setCurrentValue(prev => prev.slice(0, -1));
    }
  };

  // --- LOGIC: Converters ---
  
  const getConvertedValue = () => {
      if (!CONVERSION_DATA[mode]) return '0';
      const units = CONVERSION_DATA[mode].units;
      const val = parseFloat(convValue);
      if (isNaN(val)) return '...';
      
      const ratioFrom = units[fromUnit];
      const ratioTo = units[toUnit];
      
      const inBase = val / ratioFrom; 
      const result = inBase * ratioTo;
      
      // Formatting
      if (result < 0.000001) return result.toExponential(4);
      return parseFloat(result.toPrecision(6)).toString();
  };

  const handleConvNumber = (num: string) => {
      playClickSound();
      setConvValue(prev => prev === '0' ? num : prev + num);
  };

  // --- LOGIC: Date ---
  
  const getDateDiff = () => {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const weeks = Math.floor(diffDays / 7);
      const days = diffDays % 7;
      return { totalDays: diffDays, text: `${weeks} hafta, ${days} gün` };
  };

  // --- COMPONENTS ---

  const MenuButton = ({ icon, label, target }: { icon: any, label: string, target: Mode }) => (
      <button 
        onClick={() => { setMode(target); setIsMenuOpen(false); }}
        className={`w-full flex items-center gap-3 px-2 py-2.5 rounded hover:bg-gray-200 text-left ${mode === target ? 'bg-gray-200 font-semibold border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
      >
          {icon}
          <span className="text-sm text-black">{label}</span>
      </button>
  );

  const KeypadButton = ({ label, onClick, highlight = false, textClass = 'text-black' }: any) => (
      <button 
        onClick={onClick} 
        className={`${highlight ? (theme ? theme.accentBg + ' text-white' : 'bg-blue-600 text-white') : 'bg-white hover:bg-[#fcfcfc]'} ${textClass} text-lg font-medium border-[0.5px] border-gray-100 flex items-center justify-center transition-colors active:opacity-80`}
      >
          {label}
      </button>
  );

  const OperatorButton = ({ label, onClick }: any) => (
      <button 
        onClick={onClick} 
        className="bg-[#f9f9f9] hover:bg-blue-100 hover:text-blue-600 text-black text-lg font-light border-[0.5px] border-gray-100 transition-colors"
      >
          {label}
      </button>
  );

  const getModeTitle = () => {
      switch(mode) {
          case 'STANDARD': return 'Standart';
          case 'SCIENTIFIC': return 'Bilimsel';
          case 'DATE': return 'Tarih Hesaplama';
          case 'CURRENCY': return 'Para Birimi';
          case 'VOLUME': return 'Hacim';
          case 'LENGTH': return 'Uzunluk';
          case 'SPEED': return 'Hız';
          case 'DATA': return 'Veri';
          default: return 'Hesap Makinesi';
      }
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f3f3] relative overflow-hidden">
      
      {/* Sidebar Menu */}
      <div 
        className={`absolute inset-0 z-20 bg-black/40 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMenuOpen(false)}
      />
      <div className={`absolute left-0 top-0 bottom-0 w-64 bg-[#f3f3f3] shadow-2xl z-30 transform transition-transform duration-200 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
           <div className="p-0">
               <button onClick={() => setIsMenuOpen(false)} className="p-3 hover:bg-gray-200 m-1 rounded w-10 h-10 flex items-center justify-center">
                   <Menu size={20} className="text-black" />
               </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-1 space-y-1 custom-scrollbar">
               <div className="px-3 py-1 text-xs font-bold text-gray-500 mt-2">Hesap Makinesi</div>
               <MenuButton icon={<CalcIcon size={18} />} label="Standart" target="STANDARD" />
               <MenuButton icon={<Beaker size={18} />} label="Bilimsel" target="SCIENTIFIC" />
               <MenuButton icon={<Calendar size={18} />} label="Tarih Hesaplama" target="DATE" />
               
               <div className="px-3 py-1 text-xs font-bold text-gray-500 mt-4">Dönüştürücü</div>
               <MenuButton icon={<Banknote size={18} />} label="Para Birimi" target="CURRENCY" />
               <MenuButton icon={<Zap size={18} />} label="Hacim" target="VOLUME" />
               <MenuButton icon={<Ruler size={18} />} label="Uzunluk" target="LENGTH" />
               <MenuButton icon={<Zap size={18} />} label="Hız" target="SPEED" />
               <MenuButton icon={<Database size={18} />} label="Veri" target="DATA" />
           </div>
           
           <div className="p-2 border-t border-gray-300">
               <button className="w-full py-2 text-sm text-gray-600 hover:bg-gray-200 rounded text-left px-3">Hakkında</button>
           </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center h-12 px-1 shrink-0 bg-[#f3f3f3]">
        <div className="flex items-center gap-3 pl-1">
            <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-gray-200 rounded text-black transition-colors"
            >
                <Menu size={18} />
            </button>
            <span className="text-xl font-semibold text-black">{getModeTitle()}</span>
        </div>
        <div className="pr-2">
            {mode === 'STANDARD' && <History size={16} className="text-gray-500 hover:text-black cursor-pointer" />}
        </div>
      </div>

      {/* --- RENDER CONTENT BASED ON MODE --- */}
      
      {/* 1. STANDARD & SCIENTIFIC */}
      {(mode === 'STANDARD' || mode === 'SCIENTIFIC') && (
          <>
            {/* Display */}
            <div className="flex-1 p-4 text-right flex flex-col justify-end select-text mb-2 bg-[#f3f3f3]">
                <div className="text-sm text-gray-500 h-6 truncate font-mono">
                    {history.length > 0 ? history[0] : (previousValue ? `${previousValue} ${operation}` : '')}
                </div>
                <div className={`font-semibold text-black overflow-hidden truncate ${currentValue.length > 10 ? 'text-4xl' : 'text-6xl'}`}>
                    {currentValue}
                </div>
            </div>

            {/* Keypads */}
            {mode === 'STANDARD' ? (
                <div className="grid grid-cols-4 gap-[2px] bg-[#f3f3f3] h-[65%] p-[2px]">
                    <OperatorButton label="%" onClick={() => handleOperator('mod')} />
                    <OperatorButton label="CE" onClick={() => setCurrentValue('0')} />
                    <OperatorButton label="C" onClick={clear} />
                    <OperatorButton label="SİL" onClick={deleteLast} />

                    <OperatorButton label="1/x" onClick={() => handleScientific('1/x')} />
                    <OperatorButton label="x²" onClick={() => handleScientific('sqr')} />
                    <OperatorButton label="√x" onClick={() => handleScientific('sqrt')} />
                    <OperatorButton label="÷" onClick={() => handleOperator('/')} />

                    <KeypadButton label="7" onClick={() => handleNumber('7')} />
                    <KeypadButton label="8" onClick={() => handleNumber('8')} />
                    <KeypadButton label="9" onClick={() => handleNumber('9')} />
                    <OperatorButton label="×" onClick={() => handleOperator('X')} />

                    <KeypadButton label="4" onClick={() => handleNumber('4')} />
                    <KeypadButton label="5" onClick={() => handleNumber('5')} />
                    <KeypadButton label="6" onClick={() => handleNumber('6')} />
                    <OperatorButton label="-" onClick={() => handleOperator('-')} />

                    <KeypadButton label="1" onClick={() => handleNumber('1')} />
                    <KeypadButton label="2" onClick={() => handleNumber('2')} />
                    <KeypadButton label="3" onClick={() => handleNumber('3')} />
                    <OperatorButton label="+" onClick={() => handleOperator('+')} />

                    <KeypadButton label="+/-" onClick={() => setCurrentValue(String(parseFloat(currentValue) * -1))} />
                    <KeypadButton label="0" onClick={() => handleNumber('0')} />
                    <KeypadButton label="," onClick={() => !currentValue.includes('.') && handleNumber('.')} />
                    <KeypadButton label="=" onClick={calculate} highlight={true} />
                </div>
            ) : (
                <div className="grid grid-cols-5 gap-[2px] bg-[#f3f3f3] h-[70%] p-[2px]">
                    {/* Scientific Extra Column */}
                    <div className="grid grid-rows-5 gap-[2px]">
                         <OperatorButton label="sin" onClick={() => handleScientific('sin')} />
                         <OperatorButton label="cos" onClick={() => handleScientific('cos')} />
                         <OperatorButton label="tan" onClick={() => handleScientific('tan')} />
                         <OperatorButton label="log" onClick={() => handleScientific('log')} />
                         <OperatorButton label="π" onClick={() => handleScientific('pi')} />
                    </div>
                    
                    {/* Standard Grid fitted into remaining 4 cols */}
                    <div className="col-span-4 grid grid-cols-4 gap-[2px]">
                         <OperatorButton label="Mod" onClick={() => handleOperator('mod')} />
                         <OperatorButton label="CE" onClick={() => setCurrentValue('0')} />
                         <OperatorButton label="C" onClick={clear} />
                         <OperatorButton label="⌫" onClick={deleteLast} />

                         <OperatorButton label="x²" onClick={() => handleScientific('sqr')} />
                         <OperatorButton label="|" onClick={() => handleScientific('abs')} />
                         <OperatorButton label="exp" onClick={() => handleScientific('e')} />
                         <OperatorButton label="÷" onClick={() => handleOperator('/')} />

                         <KeypadButton label="7" onClick={() => handleNumber('7')} />
                         <KeypadButton label="8" onClick={() => handleNumber('8')} />
                         <KeypadButton label="9" onClick={() => handleNumber('9')} />
                         <OperatorButton label="×" onClick={() => handleOperator('X')} />

                         <KeypadButton label="4" onClick={() => handleNumber('4')} />
                         <KeypadButton label="5" onClick={() => handleNumber('5')} />
                         <KeypadButton label="6" onClick={() => handleNumber('6')} />
                         <OperatorButton label="-" onClick={() => handleOperator('-')} />

                         <KeypadButton label="1" onClick={() => handleNumber('1')} />
                         <KeypadButton label="2" onClick={() => handleNumber('2')} />
                         <KeypadButton label="3" onClick={() => handleNumber('3')} />
                         <OperatorButton label="+" onClick={() => handleOperator('+')} />

                         <KeypadButton label="+/-" onClick={() => setCurrentValue(String(parseFloat(currentValue) * -1))} />
                         <KeypadButton label="0" onClick={() => handleNumber('0')} />
                         <KeypadButton label="," onClick={() => !currentValue.includes('.') && handleNumber('.')} />
                         <KeypadButton label="=" onClick={calculate} highlight={true} />
                    </div>
                </div>
            )}
          </>
      )}

      {/* 2. DATE CALCULATOR */}
      {mode === 'DATE' && (
          <div className="p-6 flex flex-col gap-6 text-black">
              <div>
                  <label className="text-sm text-gray-500 font-semibold mb-1 block">Başlangıç</label>
                  <input type="date" value={date1} onChange={e => setDate1(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded" />
              </div>
              <div>
                  <label className="text-sm text-gray-500 font-semibold mb-1 block">Bitiş</label>
                  <input type="date" value={date2} onChange={e => setDate2(e.target.value)} className="w-full p-2 bg-white border border-gray-300 rounded" />
              </div>
              
              <div className="mt-4">
                  <div className="text-sm text-gray-500 mb-2">Fark</div>
                  <div className="text-4xl font-bold">{getDateDiff().totalDays} Gün</div>
                  <div className="text-gray-500 text-lg mt-1">{getDateDiff().text}</div>
              </div>
          </div>
      )}

      {/* 3. CONVERTERS (Currency, Volume, etc.) */}
      {['CURRENCY', 'VOLUME', 'LENGTH', 'SPEED', 'DATA'].includes(mode) && (
          <div className="flex flex-col h-full text-black">
              <div className="p-6 flex flex-col gap-8">
                  {/* From */}
                  <div>
                      <div className="text-4xl font-bold mb-2 break-all">{convValue}</div>
                      <div className="flex items-center gap-2 text-gray-500">
                          <select 
                            value={fromUnit} 
                            onChange={e => setFromUnit(e.target.value)} 
                            className="bg-transparent font-semibold cursor-pointer outline-none"
                          >
                              {Object.keys(CONVERSION_DATA[mode].units).map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <ChevronDown size={14} />
                      </div>
                  </div>
                  
                  {/* To */}
                  <div>
                      <div className="text-4xl font-bold mb-2 text-gray-400 break-all">{getConvertedValue()}</div>
                      <div className="flex items-center gap-2 text-gray-500">
                          <select 
                            value={toUnit} 
                            onChange={e => setToUnit(e.target.value)} 
                            className="bg-transparent font-semibold cursor-pointer outline-none"
                          >
                              {Object.keys(CONVERSION_DATA[mode].units).map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                          <ChevronDown size={14} />
                      </div>
                  </div>
              </div>

              {/* Numpad for Converter */}
              <div className="grid grid-cols-3 gap-[2px] bg-[#f3f3f3] flex-1 p-[2px] mt-auto max-h-[50%]">
                    {['7','8','9','4','5','6','1','2','3'].map(n => (
                        <KeypadButton key={n} label={n} onClick={() => handleConvNumber(n)} />
                    ))}
                    <KeypadButton label="CE" onClick={() => setConvValue('0')} />
                    <KeypadButton label="0" onClick={() => handleConvNumber('0')} />
                    <KeypadButton label="⌫" onClick={() => setConvValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} />
              </div>
          </div>
      )}

    </div>
  );
};

export default CalculatorApp;
