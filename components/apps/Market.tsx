import React, { useState, useMemo } from 'react';
import { MARKET_ITEMS } from '../../constants';
import { MarketItem, ThemeConfig } from '../../types';
import { Search, Star, Download, Gamepad2, Check } from 'lucide-react';

interface MarketAppProps {
  onInstallApp: (item: MarketItem) => void;
  installedAppIds: string[];
  theme: ThemeConfig;
}

const MarketApp: React.FC<MarketAppProps> = ({ onInstallApp, installedAppIds, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  const categories = ['Tümü', 'Aksiyon', 'RYO', 'Strateji', 'Yarış', 'Simülasyon', 'Basit Eğlence'];

  const filteredItems = useMemo(() => {
    return MARKET_ITEMS.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const featuredItem = MARKET_ITEMS.find(i => i.name === "Siber Şehir");

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-white font-segoe">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#333] bg-[#252525]">
        <div className="flex items-center gap-2">
           <Gamepad2 className={theme.text} />
           <h1 className="text-lg font-semibold tracking-wide">Com Mağaza</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Oyun ve uygulama ara" 
            className={`pl-8 pr-4 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-sm text-sm w-64 focus:outline-none focus:border-${theme.id}-500 transition-colors`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-1 p-2 bg-[#1e1e1e] overflow-x-auto border-b border-[#2d2d2d]">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-sm text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat 
                ? `bg-[#333] text-white border-b-2 ${theme.border}` 
                : 'hover:bg-[#2d2d2d] text-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Featured Hero */}
        {selectedCategory === 'Tümü' && searchTerm === '' && featuredItem && (
          <div className="p-4 pb-0">
             <div className="bg-gradient-to-r from-yellow-600 to-red-900 rounded-lg p-8 text-white shadow-xl relative overflow-hidden group border border-[#444]">
                 <div className="relative z-10 flex flex-col items-start gap-2">
                    <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Öne Çıkan</span>
                    <h2 className="text-4xl font-bold mb-1 drop-shadow-md">{featuredItem.name}</h2>
                    <p className="max-w-md text-gray-100 text-sm mb-4 drop-shadow-sm">Bu yüksek kaliteli RYO'da geleceği deneyimleyin. Açık dünya, ışın izleme ve sınırsız olasılıklar.</p>
                    <button 
                      onClick={() => onInstallApp(featuredItem)}
                      disabled={installedAppIds.includes(`game-${featuredItem.id}`)}
                      className="bg-white text-black px-6 py-2 rounded-sm font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       {installedAppIds.includes(`game-${featuredItem.id}`) ? 'Yüklendi' : `Hemen al - ${featuredItem.price}`}
                    </button>
                 </div>
                 {/* Decorative background elements */}
                 <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-black/60 to-transparent"></div>
                 <div className="absolute -right-20 -top-20 w-80 h-80 bg-yellow-500/20 rounded-full blur-3xl"></div>
             </div>
          </div>
        )}

        <div className="p-4">
            <h2 className="text-lg font-semibold mb-3">{searchTerm ? 'Arama Sonuçları' : `En İyi ${selectedCategory} Oyunları`}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredItems.map((item) => {
                const isInstalled = installedAppIds.includes(`game-${item.id}`);
                return (
                  <div key={item.id} className="bg-[#252525] hover:bg-[#2f2f2f] p-3 rounded-md transition-all group cursor-pointer border border-transparent hover:border-[#444] hover:shadow-lg hover:-translate-y-1">
                  <div className={`w-full aspect-[3/4] ${item.imageColor} rounded-sm mb-3 shadow-inner flex items-center justify-center relative overflow-hidden`}>
                      {/* Gloss effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                      <span className="text-4xl font-bold text-white/20 select-none uppercase">{item.name.substring(0, 2)}</span>
                  </div>
                  <h3 className="font-semibold text-sm truncate text-gray-200" title={item.name}>{item.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{item.category}</p>
                  <div className="flex items-center justify-between">
                      <span className="text-xs bg-[#333] px-2 py-1 rounded text-gray-300">{item.price}</span>
                      <div className="flex items-center gap-0.5 text-xs text-gray-400">
                      <span>{item.rating}</span>
                      <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                      </div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(!isInstalled) onInstallApp(item);
                    }}
                    className={`w-full mt-3 text-white text-xs py-2 rounded-sm transition-all flex items-center justify-center gap-2 font-medium 
                      ${isInstalled 
                        ? 'bg-[#333] cursor-default opacity-100' 
                        : `${theme.primary} ${theme.hover} opacity-0 group-hover:opacity-100`}`}
                  >
                      {isInstalled ? <><Check size={14} /> Yüklendi</> : 'Yükle'}
                  </button>
                  </div>
              );
            })}
            </div>
            {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <p className="text-lg">"{searchTerm}" için sonuç bulunamadı</p>
                <p className="text-sm">"Siber", "Görev" veya "Yarış" aramayı deneyin</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MarketApp;