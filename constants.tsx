import React from 'react';
import { AppId, MarketItem, ThemeConfig } from './types';
import { Globe, ShoppingBag, Settings, Calculator, FileText, Cpu, Gamepad2, FolderClosed, Film, Music } from 'lucide-react';

export const WALLPAPER_URL = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80";

export const PRESET_WALLPAPERS = [
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Default Dark
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Yosemite (Landscape)
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Synthwave (Purple)
  "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Mountains (Dark)
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80", // Abstract Liquid
  "https://images.unsplash.com/photo-1533134486753-c833f0ed4866?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"  // Deep Black/Red
];

export const THEMES: Record<string, ThemeConfig> = {
  blue: {
    id: 'blue',
    name: 'Mavi',
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
    accentBg: 'bg-blue-500',
    shadow: 'shadow-blue-500/50'
  },
  red: {
    id: 'red',
    name: 'Kırmızı',
    primary: 'bg-red-600',
    hover: 'hover:bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
    accentBg: 'bg-red-500',
    shadow: 'shadow-red-500/50'
  },
  green: {
    id: 'green',
    name: 'Yeşil',
    primary: 'bg-green-600',
    hover: 'hover:bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
    accentBg: 'bg-green-500',
    shadow: 'shadow-green-500/50'
  },
  purple: {
    id: 'purple',
    name: 'Mor',
    primary: 'bg-purple-600',
    hover: 'hover:bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
    accentBg: 'bg-purple-500',
    shadow: 'shadow-purple-500/50'
  },
  orange: {
    id: 'orange',
    name: 'Turuncu',
    primary: 'bg-orange-600',
    hover: 'hover:bg-orange-500',
    text: 'text-orange-500',
    border: 'border-orange-500',
    accentBg: 'bg-orange-500',
    shadow: 'shadow-orange-500/50'
  },
  pink: {
    id: 'pink',
    name: 'Pembe',
    primary: 'bg-pink-600',
    hover: 'hover:bg-pink-500',
    text: 'text-pink-500',
    border: 'border-pink-500',
    accentBg: 'bg-pink-500',
    shadow: 'shadow-pink-500/50'
  }
};

// Export icons so App.tsx can use them for dynamic apps
export const GameIcon = () => <Gamepad2 className="w-full h-full text-indigo-400" />;

export const APP_REGISTRY: Record<string, { title: string; icon: React.ReactElement }> = {
  explorer: { title: "Dosya Gezgini", icon: <FolderClosed className="w-full h-full text-yellow-400 fill-yellow-400" /> },
  browser: { title: "Com Tarayıcı", icon: <Globe className="w-full h-full text-blue-400" /> },
  market: { title: "Com Mağaza", icon: <ShoppingBag className="w-full h-full text-white" /> },
  settings: { title: "Ayarlar", icon: <Settings className="w-full h-full text-gray-400" /> },
  calculator: { title: "Hesap Makinesi", icon: <Calculator className="w-full h-full text-cyan-400" /> },
  notepad: { title: "Not Defteri", icon: <FileText className="w-full h-full text-white" /> },
  assistant: { title: "Com Asistan", icon: <Cpu className="w-full h-full text-purple-400" /> },
  video: { title: "Filmler ve TV", icon: <Film className="w-full h-full text-pink-500" /> },
  music: { title: "Com Müzik", icon: <Music className="w-full h-full text-orange-400" /> },
};

// Generate 100+ Mock Games for the Market
const PREFIXES = ["Süper", "Mega", "Siber", "Uzay", "Zindan", "Piksel", "Savaş", "Yarış", "Zombi", "Kozmik", "Gölge", "Işık", "Karanlık"];
const NOUNS = ["Görev", "Savaşçı", "Yarışçı", "Simülatör", "Yönetici", "Dövüşçü", "Efsaneler", "Macera", "Zanaat", "Dünya", "Galaksi", "İmparatorluk", "Şehir"];
const SUFFIXES = ["2024", "HD", "Remastered", "Online", "Royale", "Taktik", "RYO", "Pro", "X", "Sıfır"];

export const generateMarketItems = (): MarketItem[] => {
  const items: MarketItem[] = [];
  let id = 1;
  
  // Specific featured items
  items.push({ id: id++, name: "Siber Şehir", category: "RYO", rating: 4.8, price: "₺899.99", imageColor: "bg-yellow-400" });
  items.push({ id: id++, name: "Com Yarışçı", category: "Yarış", rating: 4.5, price: "Ücretsiz", imageColor: "bg-blue-600" });
  items.push({ id: id++, name: "MadenYap", category: "Simülasyon", rating: 4.9, price: "₺429.99", imageColor: "bg-green-600" });

  // Procedural generation
  for (let i = 0; i < 110; i++) {
    const p = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const s = Math.random() > 0.5 ? SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)] : "";
    const name = `${p} ${n} ${s}`.trim();
    
    items.push({
      id: id++,
      name: name,
      category: ["Aksiyon", "RYO", "Strateji", "Basit Eğlence", "Spor"][Math.floor(Math.random() * 5)],
      rating: +(3 + Math.random() * 2).toFixed(1),
      price: Math.random() > 0.7 ? "Ücretsiz" : `₺${(Math.random() * 500 + 50).toFixed(2)}`,
      imageColor: `bg-${['red', 'blue', 'green', 'purple', 'indigo', 'pink', 'orange'][Math.floor(Math.random() * 7)]}-${Math.floor(Math.random() * 4 + 5)}00`
    });
  }
  return items;
};

export const MARKET_ITEMS = generateMarketItems();