import React, { useMemo } from 'react';
import { ThemeConfig } from '../../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface CalendarFlyoutProps {
  isOpen: boolean;
  theme: ThemeConfig;
}

const CalendarFlyout: React.FC<CalendarFlyoutProps> = ({ isOpen, theme }) => {
  const today = new Date();
  const currentMonth = today.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
  
  // Generate calendar days
  const calendarDays = useMemo(() => {
     const date = new Date(today.getFullYear(), today.getMonth(), 1);
     const days = [];
     const firstDayIndex = (date.getDay() + 6) % 7; // Adjust for Monday start (Turkey)
     const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

     // Prev month filler
     for (let x = firstDayIndex; x > 0; x--) {
         days.push({ day: '', current: false });
     }

     for (let i = 1; i <= lastDay; i++) {
         days.push({ 
             day: i, 
             current: i === today.getDate(),
             isToday: i === today.getDate() && today.getMonth() === new Date().getMonth()
         });
     }
     return days;
  }, []);

  const daysOfWeek = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-12 right-0 w-[360px] bg-[#1f1f1f]/95 backdrop-blur-xl border border-[#333] z-[9998] text-white shadow-2xl animate-in slide-in-from-right-4 fade-in duration-200">
        <div className="p-4 border-b border-[#333]">
             <div className="text-sm font-semibold mb-1">{today.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">{currentMonth}</span>
                <div className="flex gap-2">
                    <button className="p-1 hover:bg-[#333] rounded"><ChevronUp size={16}/></button>
                    <button className="p-1 hover:bg-[#333] rounded"><ChevronDown size={16}/></button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(d => <div key={d} className="text-xs font-medium text-gray-400 p-2">{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center">
                {calendarDays.map((d, i) => (
                    <div 
                        key={i} 
                        className={`
                            p-2 text-sm rounded-sm border-2 border-transparent
                            ${d.day === '' ? '' : 'hover:border-gray-500 cursor-pointer'} 
                            ${d.isToday ? `${theme.primary} text-white font-bold` : d.current ? 'bg-[#333]' : ''}
                        `}
                    >
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
        
        <div className="bg-[#1a1a1a] p-4 border-t border-[#333]">
             <div className="flex justify-between items-center text-gray-400 text-xs">
                 <span>Etkinlik veya anımsatıcı yok</span>
                 <button className="hover:text-white">+</button>
             </div>
        </div>
    </div>
  );
};

export default CalendarFlyout;