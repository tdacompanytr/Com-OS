import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Square, Maximize2 } from 'lucide-react';
import { WindowState, ThemeConfig } from '../../types';

interface WindowProps {
  windowState: WindowState;
  isActive: boolean;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onFocus: (id: string) => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  theme: ThemeConfig;
}

const Window: React.FC<WindowProps> = ({ windowState, isActive, onClose, onMinimize, onFocus, children, icon, theme }) => {
  const [position, setPosition] = useState({ x: windowState.x, y: windowState.y });
  const [size, setSize] = useState({ w: windowState.width, h: windowState.height });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Splash Screen State
  const [isLoading, setIsLoading] = useState(true);

  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     // Simulate App Splash Screen
     const timer = setTimeout(() => {
         setIsLoading(false);
     }, 600); // 600ms splash duration
     return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
     if(isDragging) {
        const handleMouseMove = (e: MouseEvent) => {
           setPosition({
              x: e.clientX - dragOffset.x,
              y: e.clientY - dragOffset.y
           });
        };
        const handleMouseUp = () => {
           setIsDragging(false);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
           document.removeEventListener('mousemove', handleMouseMove);
           document.removeEventListener('mouseup', handleMouseUp);
        };
     }
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
     onFocus(windowState.id);
     if (!isMaximized) {
        setIsDragging(true);
        const rect = windowRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
               x: e.clientX - rect.left,
               y: e.clientY - rect.top
            });
        }
     }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (windowState.isMinimized) return null;

  return (
    <div
      ref={windowRef}
      className={`absolute flex flex-col bg-[#1f1f1f] border border-[#333] transition-all duration-200 ease-out origin-center
          ${isLoading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} 
          ${isActive && !isMaximized ? `shadow-[0_0_20px_rgba(0,0,0,0.5)] ${theme.shadow || 'shadow-blue-500/30'}` : 'shadow-xl'}
      `}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100%' : size.w,
        height: isMaximized ? 'calc(100% - 40px)' : size.h, // Subtract taskbar height
        zIndex: windowState.zIndex,
        borderRadius: isMaximized ? 0 : '0.375rem',
        // Dynamic border color for active window
        borderColor: isActive && !isMaximized ? '' : '#333'
      }}
      onMouseDown={() => onFocus(windowState.id)}
    >
      {/* Active Border Glow (Extra div to handle exact border coloring) */}
      {isActive && !isMaximized && (
          <div className={`absolute inset-0 pointer-events-none rounded-md border ${theme.border} opacity-50 z-50`} />
      )}

      {/* Title Bar */}
      <div 
        className={`h-8 flex items-center justify-between select-none ${isActive ? 'bg-[#2d2d2d]' : 'bg-[#1a1a1a]'} text-white transition-colors duration-200`}
        onDoubleClick={toggleMaximize}
      >
        <div 
            className="flex-1 flex items-center h-full px-3 gap-2 overflow-hidden cursor-default"
            onMouseDown={handleMouseDown}
        >
            <div className="w-4 h-4">{icon}</div>
            <span className="text-xs font-normal truncate">{windowState.title}</span>
        </div>
        
        <div className="flex items-center h-full">
            <button onClick={(e) => { e.stopPropagation(); onMinimize(windowState.id); }} className="h-full w-10 flex items-center justify-center hover:bg-[#3d3d3d] transition-colors">
                <Minus size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); toggleMaximize(); }} className="h-full w-10 flex items-center justify-center hover:bg-[#3d3d3d] transition-colors">
                {isMaximized ? <Maximize2 size={12} /> : <Square size={12} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose(windowState.id); }} className="h-full w-10 flex items-center justify-center hover:bg-red-600 transition-colors">
                <X size={14} />
            </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 relative overflow-hidden bg-white">
          {isLoading ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1f1f1f] z-10 animate-in fade-in duration-300">
                 <div className="scale-150 mb-4 animate-bounce duration-[2000ms]">{icon}</div>
             </div>
          ) : (
             <div className="w-full h-full animate-in fade-in zoom-in-95 duration-300">
                {children}
             </div>
          )}
      </div>
    </div>
  );
};

export default Window;