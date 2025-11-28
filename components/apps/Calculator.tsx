import React, { useState } from 'react';
import { RotateCcw, History } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface CalculatorAppProps {
  theme?: ThemeConfig;
}

const CalculatorApp: React.FC<CalculatorAppProps> = ({ theme }) => {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [shouldReset, setShouldReset] = useState(false);

  const handleNumber = (num: string) => {
    if (currentValue === '0' || shouldReset) {
      setCurrentValue(num);
      setShouldReset(false);
    } else {
      setCurrentValue(prev => prev + num);
    }
  };

  const handleOperator = (op: string) => {
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
    }

    // Format to avoid long decimals
    const resultStr = String(Math.round(result * 100000000) / 100000000);
    
    setHistory(prev => [`${previous} ${operation} ${current} = ${resultStr}`, ...prev].slice(0, 5));
    setCurrentValue(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setShouldReset(true);
  };

  const clear = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const deleteLast = () => {
    if (currentValue.length === 1) {
      setCurrentValue('0');
    } else {
      setCurrentValue(prev => prev.slice(0, -1));
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f3f3f3]">
      {/* Header / History toggle */}
      <div className="flex justify-between items-center p-2 text-gray-500">
        <span className="text-xs font-semibold pl-2">Standart</span>
        <History size={16} className="mr-2 hover:bg-gray-200 rounded p-0.5 box-content cursor-pointer" />
      </div>

      {/* Display */}
      <div className="flex-1 p-4 text-right flex flex-col justify-end select-text mb-2">
         <div className="text-sm text-gray-500 h-6">
            {previousValue} {operation}
         </div>
         <div className="text-4xl font-semibold text-black overflow-hidden truncate">
            {currentValue}
         </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-[2px] bg-[#f3f3f3] h-[65%] p-[2px]">
         {/* Functional Rows */}
         <button onClick={() => setCurrentValue('0')} className="bg-[#f9f9f9] hover:bg-[#e6e6e6] text-xs">CE</button>
         <button onClick={clear} className="bg-[#f9f9f9] hover:bg-[#e6e6e6] text-xs">C</button>
         <button onClick={deleteLast} className="bg-[#f9f9f9] hover:bg-[#e6e6e6] text-xs">SİL</button>
         <button onClick={() => handleOperator('/')} className="bg-[#f9f9f9] hover:bg-blue-100 hover:text-blue-600 text-lg font-light">÷</button>

         <button onClick={() => handleNumber('7')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">7</button>
         <button onClick={() => handleNumber('8')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">8</button>
         <button onClick={() => handleNumber('9')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">9</button>
         <button onClick={() => handleOperator('X')} className="bg-[#f9f9f9] hover:bg-blue-100 hover:text-blue-600 text-lg font-light">×</button>

         <button onClick={() => handleNumber('4')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">4</button>
         <button onClick={() => handleNumber('5')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">5</button>
         <button onClick={() => handleNumber('6')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">6</button>
         <button onClick={() => handleOperator('-')} className="bg-[#f9f9f9] hover:bg-blue-100 hover:text-blue-600 text-lg font-light">-</button>

         <button onClick={() => handleNumber('1')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">1</button>
         <button onClick={() => handleNumber('2')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">2</button>
         <button onClick={() => handleNumber('3')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">3</button>
         <button onClick={() => handleOperator('+')} className="bg-[#f9f9f9] hover:bg-blue-100 hover:text-blue-600 text-lg font-light">+</button>

         <button onClick={() => {
             const val = parseFloat(currentValue);
             setCurrentValue((val * -1).toString());
         }} className="bg-white hover:bg-[#fcfcfc] text-lg">+/-</button>
         <button onClick={() => handleNumber('0')} className="bg-white hover:bg-[#fcfcfc] font-semibold text-lg">0</button>
         <button onClick={() => !currentValue.includes('.') && handleNumber('.')} className="bg-white hover:bg-[#fcfcfc] text-lg">,</button>
         <button onClick={calculate} className={`${theme ? theme.accentBg : 'bg-blue-500'} hover:opacity-90 text-white text-xl`}>=</button>
      </div>
    </div>
  );
};

export default CalculatorApp;