import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Plus, X, Globe, Clock, Trash2, Search, MoreVertical, Eraser, ExternalLink, AlertTriangle, Link2Off, Star, Layout, Bookmark } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface Tab {
  id: string;
  url: string;
  inputValue: string;
  title: string;
  history: string[];
  currentIndex: number;
  error?: string | null; // URL Error state
}

interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  timestamp: Date;
}

interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  icon?: React.ReactNode;
}

interface BrowserAppProps {
    theme?: ThemeConfig;
}

// Block list removed to allow all sites to attempt loading
const BLOCKED_DOMAINS: string[] = [];

const BrowserApp: React.FC<BrowserAppProps> = ({ theme }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      url: 'https://www.google.com/search?igu=1',
      inputValue: 'https://www.google.com',
      title: 'Google',
      history: ['https://www.google.com/search?igu=1'],
      currentIndex: 0,
      error: null
    }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('1');
  const [showMenu, setShowMenu] = useState(false);
  
  // Global History State
  const [globalHistory, setGlobalHistory] = useState<HistoryEntry[]>([
    { id: 'initial-1', url: 'https://www.google.com', title: 'Google', timestamp: new Date() }
  ]);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([
      { id: 'bm-1', url: 'https://www.google.com/search?igu=1', title: 'Google' },
      { id: 'bm-2', url: 'https://www.wikipedia.org', title: 'Wikipedia' },
      { id: 'bm-3', url: 'com://history', title: 'Geçmiş' }
  ]);
  const [showBookmarksBar, setShowBookmarksBar] = useState(true);
  
  // Local state for History Page Search
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Helper to get active tab safely
  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => tab.id === id ? { ...tab, ...updates } : tab));
  };

  const getDomainFromUrl = (url: string) => {
    if (url === 'com://history') return 'Geçmiş';
    try {
      if (!url.startsWith('http')) return 'Arama';
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch {
      return 'Yeni Sekme';
    }
  };

  const addToGlobalHistory = (url: string, title: string) => {
    if (url === 'com://history' || !url) return;
    
    // Avoid duplicates at the top of the stack if visited immediately again
    setGlobalHistory(prev => {
        const newEntry: HistoryEntry = {
            id: Date.now().toString() + Math.random().toString(),
            url,
            title: title || url,
            timestamp: new Date()
        };
        return [newEntry, ...prev];
    });
  };

  const createNewTab = () => {
    const newId = Date.now().toString();
    const newTab: Tab = {
      id: newId,
      url: 'https://www.google.com/search?igu=1',
      inputValue: '',
      title: 'Yeni Sekme',
      history: ['https://www.google.com/search?igu=1'],
      currentIndex: 0,
      error: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) {
        const defaultUrl = 'https://www.google.com/search?igu=1';
        updateTab(id, {
            url: defaultUrl,
            inputValue: '',
            title: 'Yeni Sekme',
            history: [defaultUrl],
            currentIndex: 0,
            error: null
        });
        return;
    }

    const tabIndex = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    
    setTabs(newTabs);
    
    if (id === activeTabId) {
        const newActiveIndex = tabIndex === 0 ? 0 : tabIndex - 1;
        setActiveTabId(newTabs[newActiveIndex].id);
    }
  };

  const isValidUrlStructure = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  // Helper to make some sites iframe friendly
  const convertUrlToEmbedFriendly = (url: string) => {
      let newUrl = url;
      // YouTube
      if (newUrl.includes('youtube.com/watch?v=')) {
          newUrl = newUrl.replace('watch?v=', 'embed/');
      } else if (newUrl.includes('youtu.be/')) {
          newUrl = newUrl.replace('youtu.be/', 'youtube.com/embed/');
      }
      // Add more as needed
      return newUrl;
  };

  const navigate = (newUrl: string) => {
    // 1. Reset Error State
    updateTab(activeTabId, { error: null });

    let finalUrl = newUrl.trim();
    
    // Internal pages
    if (finalUrl === 'com://history') {
        // Pass through
    } 
    // Check if it's meant to be a URL
    else if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
        if (!isValidUrlStructure(finalUrl)) {
            // Instead of showing error, fallback to search
            finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
        }
    }
    // Handle domains without protocol or search queries
    else {
        // If it has spaces, it's definitely a search
        if (finalUrl.includes(' ')) {
             finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
        } 
        // If it has no spaces and has a dot, try to treat as domain
        else if (finalUrl.includes('.')) {
             const potentialUrl = `https://${finalUrl}`;
             if (isValidUrlStructure(potentialUrl)) {
                 finalUrl = potentialUrl;
             } else {
                 // Fallback to search if valid URL construction fails
                 finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
             }
        } 
        // Default to search
        else {
             finalUrl = `https://www.google.com/search?q=${encodeURIComponent(finalUrl)}&igu=1`;
        }
    }

    // Apply Smart Embed Logic
    finalUrl = convertUrlToEmbedFriendly(finalUrl);

    const newHistory = activeTab.history.slice(0, activeTab.currentIndex + 1);
    newHistory.push(finalUrl);
    
    const domain = getDomainFromUrl(finalUrl);

    updateTab(activeTabId, {
        url: finalUrl,
        inputValue: finalUrl,
        history: newHistory,
        currentIndex: newHistory.length - 1,
        title: domain,
        error: null
    });

    // Add to global history if it's a web page
    if (finalUrl !== 'com://history') {
        addToGlobalHistory(finalUrl, domain);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      navigate(activeTab.inputValue);
    }
  };

  const goBack = () => {
    if (activeTab.currentIndex > 0) {
        const newIndex = activeTab.currentIndex - 1;
        const prevUrl = activeTab.history[newIndex];
        updateTab(activeTabId, {
            currentIndex: newIndex,
            url: prevUrl,
            inputValue: prevUrl,
            title: getDomainFromUrl(prevUrl),
            error: null
        });
    }
  };

  const goForward = () => {
    if (activeTab.currentIndex < activeTab.history.length - 1) {
        const newIndex = activeTab.currentIndex + 1;
        const nextUrl = activeTab.history[newIndex];
        updateTab(activeTabId, {
            currentIndex: newIndex,
            url: nextUrl,
            inputValue: nextUrl,
            title: getDomainFromUrl(nextUrl),
            error: null
        });
    }
  };

  const reload = () => {
      const current = activeTab.url;
      updateTab(activeTabId, { url: '', error: null });
      setTimeout(() => {
          updateTab(activeTabId, { url: current });
      }, 10);
  };

  const clearTabHistory = () => {
      const currentUrl = activeTab.url;
      updateTab(activeTabId, {
          history: [currentUrl],
          currentIndex: 0
      });
      setShowMenu(false);
  };

  const openInExternalTab = () => {
      if (activeTab.url && activeTab.url !== 'com://history') {
          window.open(activeTab.url, '_blank');
      }
  };

  // --- Bookmark Logic ---

  const isBookmarked = useMemo(() => {
      return bookmarks.some(b => b.url === activeTab.url);
  }, [bookmarks, activeTab.url]);

  const toggleBookmark = () => {
      if (activeTab.error) return;
      
      if (isBookmarked) {
          setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
      } else {
          setBookmarks(prev => [...prev, {
              id: Date.now().toString(),
              url: activeTab.url,
              title: activeTab.title || 'Site'
          }]);
      }
  };

  const removeBookmark = (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  // --- History Page Logic ---
  
  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setGlobalHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearAllHistory = () => {
      if(window.confirm('Tüm tarama geçmişini silmek istediğinize emin misiniz?')) {
          setGlobalHistory([]);
      }
  };

  const filteredHistory = globalHistory.filter(item => 
      item.title.toLowerCase().includes(historySearchTerm.toLowerCase()) || 
      item.url.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const themeText = theme ? theme.text : 'text-blue-500';
  const themeBg = theme ? theme.accentBg : 'bg-blue-500';

  return (
    <div className="flex flex-col h-full bg-[#dfe3e7] font-segoe" onClick={() => setShowMenu(false)}>
      {/* Tab Bar */}
      <div className="flex items-end px-2 pt-2 gap-1 overflow-x-auto select-none">
          {tabs.map(tab => (
              <div 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`
                    group relative flex items-center gap-2 px-3 py-2 text-xs max-w-[200px] min-w-[120px] rounded-t-lg cursor-pointer transition-colors
                    ${activeTabId === tab.id ? 'bg-white text-gray-800 shadow-sm z-10' : 'bg-transparent text-gray-600 hover:bg-white/50'}
                `}
              >
                  <Globe size={12} className={activeTabId === tab.id ? themeText : 'text-gray-400'} />
                  <span className="truncate flex-1">{tab.error ? 'Hata' : tab.title}</span>
                  <button 
                    onClick={(e) => closeTab(e, tab.id)}
                    className={`p-0.5 rounded-full hover:bg-gray-200 ${activeTabId === tab.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                      <X size={12} />
                  </button>
              </div>
          ))}
          <button 
            onClick={createNewTab}
            className="p-1.5 hover:bg-white/60 rounded-full text-gray-600 mb-1 ml-1"
          >
              <Plus size={16} />
          </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex flex-col bg-white border-b border-gray-200 z-20">
          <div className="flex items-center gap-2 p-2 pb-1">
            <button onClick={goBack} disabled={activeTab.currentIndex === 0} className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 text-gray-600">
            <ArrowLeft size={16} />
            </button>
            <button onClick={goForward} disabled={activeTab.currentIndex === activeTab.history.length - 1} className="p-1.5 hover:bg-gray-100 rounded-full disabled:opacity-30 text-gray-600">
            <ArrowRight size={16} />
            </button>
            <button onClick={reload} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600">
            <RotateCw size={14} />
            </button>
            
            <div className="flex-1 relative">
            <input
                className={`w-full bg-[#f1f3f4] hover:bg-[#eceef1] focus:bg-white border border-transparent focus:${theme?.border || 'border-blue-500'} focus:shadow-sm rounded-full py-1.5 px-10 text-sm focus:outline-none transition-all text-gray-700 placeholder-gray-500`}
                value={activeTab.inputValue}
                onChange={(e) => updateTab(activeTabId, { inputValue: e.target.value })}
                onKeyDown={handleKeyDown}
                onFocus={(e) => e.target.select()}
                placeholder="URL değiştirmek için buraya yazın veya com://history"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {activeTab.url === 'com://history' ? <Clock size={14} /> : <Globe size={14} />}
            </div>
            
            {/* Bookmark Star Button */}
            <button 
                onClick={toggleBookmark}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-500 transition-colors"
                title="Yer İmlerine Ekle"
            >
                <Star size={14} className={isBookmarked ? "fill-yellow-500 text-yellow-500" : ""} />
            </button>
            </div>

            <button 
                onClick={openInExternalTab}
                className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"
                title="Harici Tarayıcıda Aç"
            >
                <ExternalLink size={18} />
            </button>
            
            <div className="relative">
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className={`p-1.5 hover:bg-gray-100 rounded-full ${showMenu ? 'bg-gray-200' : 'text-gray-600'}`}
                >
                    <MoreVertical size={18} />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50">
                        <button 
                            onClick={(e) => { e.stopPropagation(); clearTabHistory(); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Eraser size={14} />
                            Sekme Geçmişini Temizle
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); navigate('com://history'); setShowMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Clock size={14} />
                            Geçmişi Görüntüle
                        </button>
                        <div className="h-[1px] bg-gray-100 my-1 mx-2"></div>
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowBookmarksBar(!showBookmarksBar); setShowMenu(false); }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        >
                            <Bookmark size={14} />
                            {showBookmarksBar ? 'Yer İmleri Çubuğunu Gizle' : 'Yer İmleri Çubuğunu Göster'}
                        </button>
                    </div>
                )}
            </div>
          </div>
          
          {/* Bookmarks Bar */}
          {showBookmarksBar && (
              <div className="flex items-center gap-1 px-2 pb-1.5 pt-0.5 text-xs border-t border-transparent">
                  {bookmarks.map(bm => (
                      <div 
                        key={bm.id}
                        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer text-gray-700 max-w-[150px] group relative"
                        onClick={() => navigate(bm.url)}
                        onContextMenu={(e) => removeBookmark(e, bm.id)}
                        title={bm.title + " (Silmek için sağ tıkla)"}
                      >
                          <Globe size={12} className="text-gray-400 shrink-0" />
                          <span className="truncate">{bm.title}</span>
                      </div>
                  ))}
              </div>
          )}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {tabs.map(tab => (
            <div 
                key={tab.id} 
                className={`w-full h-full bg-white ${activeTabId === tab.id ? 'flex flex-col' : 'hidden'}`}
            >
                {tab.error ? (
                    // --- Error UI Removed, Fallback to Search handled in navigate ---
                    // This block is effectively unreachable now due to updated logic, but kept as safety fallback
                    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
                         <div className="bg-red-100 p-4 rounded-full mb-6">
                            <Link2Off size={48} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Yönlendirme Yapılıyor...</h2>
                        <button onClick={() => navigate('https://www.google.com/search?igu=1')} className="text-blue-500 underline">Ana Sayfa</button>
                    </div>
                ) : tab.url === 'com://history' ? (
                    // --- History Page UI ---
                    <div className="flex-1 overflow-y-auto bg-[#f8f9fa]">
                        <div className="max-w-3xl mx-auto p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-2xl font-light text-gray-700 flex items-center gap-3">
                                    <Clock className={themeText} />
                                    Geçmiş
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Geçmişte ara" 
                                            className="pl-9 pr-4 py-1.5 rounded-full border border-gray-300 focus:border-blue-500 focus:outline-none text-sm w-64"
                                            value={historySearchTerm}
                                            onChange={(e) => setHistorySearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={clearAllHistory}
                                        className="text-sm px-4 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-red-600 font-medium transition-colors"
                                    >
                                        Geçmişi Temizle
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {filteredHistory.length === 0 ? (
                                    <div className="p-12 text-center text-gray-500">
                                        <Clock size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>Geçmiş kaydı bulunamadı.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100">
                                        {filteredHistory.map((item) => (
                                            <div key={item.id} className="group flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                                                <div className="text-xs text-gray-400 w-16 text-right shrink-0">
                                                    {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                                                    <Globe size={16} />
                                                </div>
                                                <div 
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                    onClick={() => navigate(item.url)}
                                                >
                                                    <div className={`font-medium text-gray-800 truncate hover:${themeText} hover:underline`}>{item.title}</div>
                                                    <div className="text-xs text-gray-500 truncate">{item.url}</div>
                                                </div>
                                                <button 
                                                    onClick={(e) => deleteHistoryItem(e, item.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Geçmişten sil"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // --- Iframe Browser UI ---
                    <div className="w-full h-full flex flex-col relative">
                        {tab.url ? (
                            <iframe 
                                src={tab.url} 
                                className="w-full h-full border-none flex-1" 
                                title={`Tab ${tab.id}`}
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation allow-top-navigation-by-user-activation"
                                referrerPolicy="no-referrer"
                            />
                        ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                Yükleniyor...
                            </div>
                        )}
                        
                        {/* Always show helper because any site might fail in iframe */}
                        {activeTabId === tab.id && !tab.url.startsWith('com://') && (
                            <div className="absolute bottom-4 right-4 z-20 group">
                                    <div className="bg-white/90 backdrop-blur border border-gray-300 shadow-lg rounded-md p-3 flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="text-xs text-gray-600">
                                        Site yüklenmiyor mu?
                                    </div>
                                    <button 
                                        onClick={() => window.open(tab.url, '_blank')}
                                        className={`text-xs bg-gray-100 hover:bg-gray-200 ${themeText} px-2 py-1 rounded border border-gray-200 flex items-center gap-1`}
                                    >
                                        <ExternalLink size={12} />
                                        Dışarıda Aç
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

export default BrowserApp;