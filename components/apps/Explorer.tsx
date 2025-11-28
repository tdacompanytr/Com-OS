import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ThemeConfig } from '../../types';
import { 
    FolderClosed, FileText, Image as ImageIcon, Music, Download, 
    Monitor, HardDrive, Search, ArrowLeft, ArrowRight, ArrowUp, 
    FileType, Star, Pin, Trash2, MoreHorizontal, X, ExternalLink, FolderPlus,
    Copy, Scissors, ClipboardPaste
} from 'lucide-react';

interface ExplorerAppProps {
  theme?: ThemeConfig;
  initialPath?: string;
  onOpenApp: (appId: string, data?: any) => void;
}

type FilterType = 'all' | 'image' | 'doc' | 'music' | 'large';

// Mock FS with Real Playable URLs for demo purposes
const INITIAL_FILE_SYSTEM: Record<string, {name: string, type: 'folder' | 'file' | 'drive', icon?: any, size?: string, url?: string}[]> = {
    'Bu Bilgisayar': [
        { name: 'Yerel Disk (C:)', type: 'drive', size: '120 GB boş' },
        { name: 'Masaüstü', type: 'folder' },
        { name: 'Belgeler', type: 'folder' },
        { name: 'İndirilenler', type: 'folder' },
        { name: 'Resimler', type: 'folder' },
        { name: 'Müzik', type: 'folder' },
    ],
    'Yerel Disk (C:)': [
        { name: 'Windows', type: 'folder' },
        { name: 'Program Files', type: 'folder' },
        { name: 'Users', type: 'folder' },
        { name: 'ComOS_Logs.txt', type: 'file', size: '2 KB' },
        { name: 'Swapfile.sys', type: 'file', size: '2.5 GB' },
    ],
    'Belgeler': [
        { name: 'Ödevler', type: 'folder' },
        { name: 'Proje Notları.txt', type: 'file', size: '14 KB' },
        { name: 'Özgeçmiş.docx', type: 'file', size: '450 KB' },
        { name: 'Mali Tablo.xlsx', type: 'file', size: '2.1 MB' },
    ],
    'Resimler': [
        { name: 'Tatil', type: 'folder' },
        { name: 'Profil.jpg', type: 'file', size: '2.4 MB' },
        { name: 'Manzara.png', type: 'file', size: '4.1 MB' },
        { name: 'Ekran Görüntüsü.png', type: 'file', size: '500 KB' },
    ],
    'İndirilenler': [
        { name: 'BigBuckBunny.mp4', type: 'file', size: '158 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
        { name: 'odev.zip', type: 'file', size: '12 MB' },
        { name: 'Film_Fragman.mkv', type: 'file', size: '120 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
    ],
    'Müzik': [
        { name: 'Pop Listesi', type: 'folder' },
        { name: 'Jazz_Vibes.mp3', type: 'file', size: '4.5 MB', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { name: 'Ambient_Relax.wav', type: 'file', size: '12 MB', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    ],
    'Masaüstü': [
        { name: 'Dosyalarım', type: 'folder' },
        { name: 'Kısayol.lnk', type: 'file', size: '1 KB' },
        { name: 'Yapılacaklar.txt', type: 'file', size: '2 KB' },
        { name: 'Demo_Video.mp4', type: 'file', size: '50 MB', url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' }
    ]
};

const ExplorerApp: React.FC<ExplorerAppProps> = ({ theme, initialPath = 'Bu Bilgisayar', onOpenApp }) => {
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [addressInput, setAddressInput] = useState(initialPath);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    
    // File System State
    const [fileSystem, setFileSystem] = useState(INITIAL_FILE_SYSTEM);

    // Favorites State
    const [favorites, setFavorites] = useState<string[]>(['Masaüstü', 'İndirilenler', 'Belgeler', 'Resimler']);
    
    // Clipboard State
    const [clipboard, setClipboard] = useState<{
        item: {name: string, type: 'folder' | 'file' | 'drive', size?: string, url?: string};
        operation: 'copy' | 'cut';
        sourcePath: string;
    } | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        type: 'folder' | 'favorite' | 'file' | 'background';
        itemName: string;
        itemData?: any;
    } | null>(null);

    // Sync address input with current path
    useEffect(() => {
        setAddressInput(currentPath);
        setSearchQuery('');
        setActiveFilter('all');
        setContextMenu(null);
    }, [currentPath]);

    const handleNavigate = (name: string, type: string, fileData?: any) => {
        if (type === 'folder' || type === 'drive') {
            if (!fileSystem[name]) {
                setFileSystem(prev => ({ ...prev, [name]: [] }));
            }
            setCurrentPath(name);
        } else if (type === 'file') {
            const app = getSuggestedApp(name);
            if (app) {
                // Pass full file data (including URL) to the app
                onOpenApp(app.id, fileData);
            }
        }
    };

    const handleAddressSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigateToAddress();
        }
    };

    const navigateToAddress = () => {
        const targetPath = addressInput.trim();
        // Check if the path exists in our file system keys
        if (fileSystem[targetPath] || targetPath === 'Bu Bilgisayar') {
            setCurrentPath(targetPath);
        } else {
            // If invalid, revert to current path (Windows behavior)
            // Could also add error handling UI here
            setAddressInput(currentPath);
        }
    };

    const handleUp = () => {
        if (currentPath === 'Bu Bilgisayar') return;
        if (['Yerel Disk (C:)', 'Masaüstü', 'Belgeler', 'İndirilenler', 'Resimler', 'Müzik'].includes(currentPath)) {
            setCurrentPath('Bu Bilgisayar');
        } else {
            setCurrentPath('Yerel Disk (C:)'); // Default fallback
        }
    };

    const handleCreateFolder = () => {
        const currentFiles = fileSystem[currentPath] || [];
        let baseName = "Yeni Klasör";
        let newName = baseName;
        let counter = 2;

        while (currentFiles.some(f => f.name === newName)) {
            newName = `${baseName} (${counter})`;
            counter++;
        }

        const newFolder = { name: newName, type: 'folder' as const };

        setFileSystem(prev => ({
            ...prev,
            [currentPath]: [...(prev[currentPath] || []), newFolder],
            [newName]: []
        }));
    };

    // --- Clipboard Operations ---

    const handleCopy = () => {
        if (contextMenu) {
            const items = fileSystem[currentPath] || [];
            const item = items.find(i => i.name === contextMenu.itemName);
            if (item) {
                setClipboard({
                    item: item,
                    operation: 'copy',
                    sourcePath: currentPath
                });
            }
        }
        setContextMenu(null);
    };

    const handleCut = () => {
        if (contextMenu) {
            const items = fileSystem[currentPath] || [];
            const item = items.find(i => i.name === contextMenu.itemName);
            if (item) {
                setClipboard({
                    item: item,
                    operation: 'cut',
                    sourcePath: currentPath
                });
            }
        }
        setContextMenu(null);
    };

    const handlePaste = () => {
        if (!clipboard) return;

        const currentFiles = fileSystem[currentPath] || [];
        let newName = clipboard.item.name;
        let counter = 2;

        const nameParts = newName.split('.');
        const ext = nameParts.length > 1 ? `.${nameParts.pop()}` : '';
        const baseName = nameParts.join('.');

        while (currentFiles.some(f => f.name === newName)) {
            newName = `${baseName} (${counter})${ext}`;
            counter++;
        }

        const newItem = { ...clipboard.item, name: newName };

        setFileSystem(prev => {
            const newState = { ...prev };
            
            newState[currentPath] = [...(newState[currentPath] || []), newItem];

            if (clipboard.item.type === 'folder') {
                const sourceContent = prev[clipboard.item.name] || [];
                newState[newName] = [...sourceContent];
            }

            if (clipboard.operation === 'cut') {
                const sourceFiles = newState[clipboard.sourcePath] || [];
                newState[clipboard.sourcePath] = sourceFiles.filter(f => f.name !== clipboard.item.name);
            }

            return newState;
        });

        if (clipboard.operation === 'cut') {
            setClipboard(null);
        }
        setContextMenu(null);
    };


    const parseSizeToBytes = (sizeStr?: string) => {
        if (!sizeStr) return 0;
        const num = parseFloat(sizeStr.replace(',', '.'));
        if (sizeStr.includes('GB')) return num * 1024 * 1024 * 1024;
        if (sizeStr.includes('MB')) return num * 1024 * 1024;
        if (sizeStr.includes('KB')) return num * 1024;
        return num;
    };

    const rawFiles = fileSystem[currentPath] || [];

    const filteredFiles = useMemo(() => {
        return rawFiles.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            let matchesFilter = true;
            const ext = item.name.split('.').pop()?.toLowerCase() || '';

            switch (activeFilter) {
                case 'image': matchesFilter = ['jpg', 'png', 'gif', 'bmp', 'jpeg', 'svg'].includes(ext); break;
                case 'doc': matchesFilter = ['txt', 'docx', 'xlsx', 'pdf', 'ppt'].includes(ext); break;
                case 'music': matchesFilter = ['mp3', 'wav', 'aac', 'flac'].includes(ext); break;
                case 'large': matchesFilter = parseSizeToBytes(item.size) > 1024 * 1024; break;
                default: matchesFilter = true;
            }

            if (activeFilter !== 'all' && item.type !== 'file') return false;
            return matchesSearch && matchesFilter;
        });
    }, [rawFiles, searchQuery, activeFilter]);

    const getIcon = (item: any) => {
        if (item.type === 'drive') return <HardDrive className="w-10 h-10 text-gray-500" />;
        if (item.type === 'folder') return <FolderClosed className="w-10 h-10 text-yellow-400 fill-yellow-400" />;
        
        const ext = item.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'png', 'gif', 'bmp'].includes(ext)) return <ImageIcon className="w-10 h-10 text-blue-400" />;
        if (['mp3', 'wav', 'flac'].includes(ext)) return <Music className="w-10 h-10 text-pink-400" />;
        if (['mp4', 'mkv', 'avi'].includes(ext)) return <FileType className="w-10 h-10 text-purple-400" />;
        if (['exe', 'msi'].includes(ext)) return <Download className="w-10 h-10 text-green-500" />;
        if (['zip', 'rar'].includes(ext)) return <FolderClosed className="w-10 h-10 text-orange-400" />;
        
        return <FileText className="w-10 h-10 text-gray-400" />;
    };

    // Determine which app opens the file based on extension
    const getSuggestedApp = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        
        if (['txt', 'log', 'ini', 'md', 'json', 'js', 'css'].includes(ext)) {
            return { id: 'notepad', name: 'Not Defteri' };
        }
        if (['html', 'htm'].includes(ext)) {
            return { id: 'browser', name: 'Com Tarayıcı' };
        }
        if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) {
            return { id: 'video', name: 'Filmler ve TV' };
        }
        if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) {
            return { id: 'music', name: 'Com Müzik' };
        }
        return null;
    };

    // Context Menu Handlers
    const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'favorite' | 'file' | 'background', item: any) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, type, itemName: item.name || '', itemData: item });
    };

    const handlePinToFavorites = () => {
        if (contextMenu && !favorites.includes(contextMenu.itemName)) {
            setFavorites([...favorites, contextMenu.itemName]);
        }
        setContextMenu(null);
    };

    const handleUnpinFromFavorites = () => {
        if (contextMenu) {
            setFavorites(favorites.filter(f => f !== contextMenu.itemName));
        }
        setContextMenu(null);
    };

    const handleOpenWith = (appId: string) => {
        onOpenApp(appId, contextMenu?.itemData);
        setContextMenu(null);
    };

    // Helper for Sidebar Icons
    const getSidebarIcon = (name: string) => {
        if (name === 'Masaüstü') return <Monitor size={16} className="text-blue-500" />;
        if (name === 'İndirilenler') return <Download size={16} className="text-blue-500" />;
        if (name === 'Resimler') return <ImageIcon size={16} className="text-blue-500" />;
        if (name === 'Belgeler') return <FileText size={16} className="text-blue-500" />;
        if (name === 'Müzik') return <Music size={16} className="text-blue-500" />;
        return <FolderClosed size={16} className="text-yellow-500" />;
    };

    const suggestedApp = contextMenu?.type === 'file' ? getSuggestedApp(contextMenu.itemName) : null;

    return (
        <div 
            className="flex flex-col h-full bg-white select-none relative" 
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => handleContextMenu(e, 'background', {})}
        >
            
            {/* Context Menu Popup */}
            {contextMenu && (
                <div 
                    className="absolute z-50 bg-[#f9f9f9] border border-gray-300 shadow-xl rounded-sm py-1 w-64 text-sm"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.type === 'file' && suggestedApp && (
                        <>
                            <button 
                                onClick={() => handleOpenWith(suggestedApp.id)}
                                className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2 font-medium"
                            >
                                <ExternalLink size={14} /> Birlikte Aç: {suggestedApp.name}
                            </button>
                            <div className="h-[1px] bg-gray-200 my-1 mx-2" />
                        </>
                    )}

                    {(contextMenu.type === 'background' || contextMenu.type === 'folder') && (
                         <button 
                            onClick={() => { handleCreateFolder(); setContextMenu(null); }}
                            className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                        >
                            <FolderPlus size={14} /> Yeni Klasör
                        </button>
                    )}

                    {(contextMenu.type === 'file' || contextMenu.type === 'folder') && (
                        <>
                            <div className="h-[1px] bg-gray-200 my-1 mx-2" />
                            <button 
                                onClick={handleCut}
                                className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                            >
                                <Scissors size={14} /> Kes
                            </button>
                            <button 
                                onClick={handleCopy}
                                className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                            >
                                <Copy size={14} /> Kopyala
                            </button>
                        </>
                    )}

                    {(contextMenu.type === 'background' || contextMenu.type === 'folder') && clipboard && (
                         <button 
                            onClick={handlePaste}
                            className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                        >
                            <ClipboardPaste size={14} /> Yapıştır
                        </button>
                    )}

                    {contextMenu.type === 'folder' && (
                        <button 
                            onClick={handlePinToFavorites}
                            className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                        >
                            <Pin size={14} /> Sık Kullanılanlara Sabitle
                        </button>
                    )}
                    {contextMenu.type === 'favorite' && (
                        <button 
                            onClick={handleUnpinFromFavorites}
                            className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] flex items-center gap-2"
                        >
                            <X size={14} /> Sık Kullanılanlardan Kaldır
                        </button>
                    )}
                    <div className="h-[1px] bg-gray-200 my-1 mx-2" />
                    <button className="w-full text-left px-4 py-1.5 hover:bg-[#e5f3ff] text-gray-500 cursor-not-allowed">
                        Özellikler
                    </button>
                </div>
            )}

            {/* Ribbon / Toolbar */}
            <div className="bg-[#f3f3f3] border-b border-gray-200 p-2 flex items-center gap-4 text-xs overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
                     <button 
                        onClick={handleCreateFolder}
                        className="flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white active:bg-gray-200"
                        title="Yeni Klasör oluştur"
                     >
                         <FolderPlus size={18} className="text-gray-600" />
                         <span>Yeni Klasör</span>
                     </button>
                     <button 
                         onClick={() => {
                             if (!favorites.includes(currentPath) && currentPath !== 'Bu Bilgisayar' && currentPath !== 'Yerel Disk (C:)') {
                                 setFavorites([...favorites, currentPath]);
                             }
                         }}
                         className="flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white active:bg-gray-200"
                         title="Şu anki klasörü sabitle"
                     >
                         <Pin size={18} className="text-gray-600" />
                         <span>Sabitle</span>
                     </button>
                     {clipboard && (
                        <button 
                            onClick={handlePaste}
                            className="flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white active:bg-gray-200"
                            title="Yapıştır"
                        >
                            <ClipboardPaste size={18} className="text-gray-600" />
                            <span>Yapıştır</span>
                        </button>
                     )}
                </div>
                
                <div className="flex items-center gap-1 border-r border-gray-300 pr-4">
                     <button 
                        onClick={() => setActiveFilter('all')}
                        className={`flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white ${activeFilter === 'all' ? 'bg-white shadow-sm' : ''}`}
                     >
                         <FileType size={18} className="text-gray-600" />
                         <span>Tümü</span>
                     </button>
                     <button 
                        onClick={() => setActiveFilter('doc')}
                        className={`flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white ${activeFilter === 'doc' ? 'bg-white shadow-sm text-blue-600' : ''}`}
                     >
                         <FileText size={18} className={activeFilter === 'doc' ? 'text-blue-600' : 'text-gray-600'} />
                         <span>Belgeler</span>
                     </button>
                     <button 
                        onClick={() => setActiveFilter('image')}
                        className={`flex flex-col items-center gap-1 px-2 py-1 rounded hover:bg-white ${activeFilter === 'image' ? 'bg-white shadow-sm text-purple-600' : ''}`}
                     >
                         <ImageIcon size={18} className={activeFilter === 'image' ? 'text-purple-600' : 'text-gray-600'} />
                         <span>Resimler</span>
                     </button>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                    <div className="px-2">
                        {filteredFiles.length} öğe gösteriliyor
                    </div>
                </div>
            </div>

            {/* Address Bar */}
            <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white" onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 text-gray-500">
                    <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled><ArrowLeft size={16} /></button>
                    <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-30" disabled><ArrowRight size={16} /></button>
                    <button className="p-1 hover:bg-gray-100 rounded" onClick={handleUp}><ArrowUp size={16} /></button>
                </div>
                
                <div className="flex-1 border border-gray-300 flex items-center px-2 py-1 text-sm rounded-sm hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white">
                    <Monitor size={14} className="mr-2 text-gray-500" />
                    <input 
                        className="flex-1 font-normal text-gray-700 outline-none bg-transparent"
                        value={addressInput}
                        onChange={(e) => setAddressInput(e.target.value)}
                        onKeyDown={handleAddressSubmit}
                        onBlur={() => setAddressInput(currentPath)} // Reset if didn't submit
                    />
                    <button onClick={navigateToAddress} className="hover:bg-gray-100 p-0.5 rounded">
                        <ArrowRight size={14} className="text-gray-400" />
                    </button>
                </div>

                <div className="w-64 border border-gray-300 flex items-center px-2 py-1 text-sm rounded-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                    <Search size={14} className="mr-2 text-gray-400" />
                    <input 
                        className="w-full outline-none bg-transparent placeholder-gray-400 text-gray-700" 
                        placeholder={`"${currentPath}" içinde ara`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                    )}
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-white border-r border-gray-200 p-2 overflow-y-auto hidden md:block" onClick={(e) => e.stopPropagation()}>
                    <div className="text-xs text-gray-500 font-semibold mb-2 px-2 mt-2 flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" /> 
                        Sık Kullanılanlar
                    </div>
                    <div className="space-y-0.5 mb-4">
                        {favorites.map(item => (
                            <div 
                                key={item} 
                                className={`flex items-center justify-between px-2 py-1.5 rounded-sm hover:bg-[#e5f3ff] cursor-pointer text-sm transition-colors group ${currentPath === item ? 'bg-[#cce8ff] border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                                onClick={() => setCurrentPath(item)}
                                onContextMenu={(e) => handleContextMenu(e, 'favorite', {name: item})}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {getSidebarIcon(item)}
                                    <span className="truncate">{item}</span>
                                </div>
                                <Pin size={10} className="text-gray-400 opacity-0 group-hover:opacity-100 rotate-45" />
                            </div>
                        ))}
                    </div>

                    <div className="text-xs text-gray-500 font-semibold mb-2 px-2 border-t border-gray-100 pt-2">Bu Bilgisayar</div>
                    <div 
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-[#e5f3ff] cursor-pointer text-sm transition-colors ${currentPath === 'Yerel Disk (C:)' ? 'bg-[#cce8ff] border-l-2 border-blue-500' : 'border-l-2 border-transparent'}`}
                        onClick={() => setCurrentPath('Yerel Disk (C:)')}
                    >
                        <HardDrive size={16} className="text-gray-500" />
                        Yerel Disk (C:)
                    </div>
                </div>

                {/* Main View */}
                <div className="flex-1 bg-white p-4 overflow-y-auto">
                    {filteredFiles.length > 0 ? (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1">
                            {filteredFiles.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    className="group flex flex-col items-center gap-1 p-2 hover:bg-[#e5f3ff] hover:outline hover:outline-1 hover:outline-[#99d1ff] rounded-sm cursor-pointer transition-colors"
                                    onDoubleClick={() => handleNavigate(item.name, item.type, item)}
                                    onContextMenu={(e) => {
                                        handleContextMenu(e, item.type as any, item);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative">
                                        {getIcon(item)}
                                    </div>
                                    <span className="text-xs text-center break-words w-full px-1 line-clamp-2 group-hover:text-black text-gray-700">
                                        {item.name}
                                    </span>
                                    {item.size && <span className="text-[10px] text-gray-400">{item.size}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Search size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Sonuç bulunamadı.</p>
                            {(searchQuery || activeFilter !== 'all') ? (
                                <button 
                                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                                    className="mt-2 text-blue-500 hover:underline text-xs"
                                >
                                    Filtreleri Temizle
                                </button>
                            ) : (
                                <button 
                                    onClick={handleCreateFolder}
                                    className="mt-2 text-blue-500 hover:underline text-xs flex items-center gap-1"
                                >
                                    <FolderPlus size={12} /> Yeni Klasör oluştur
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Footer */}
            <div className="bg-white border-t border-gray-200 px-4 py-1 text-xs text-gray-500 flex gap-4 h-6 items-center">
                <span>{filteredFiles.length} öğe</span>
                <span className="border-l border-gray-300 pl-4">
                    {activeFilter !== 'all' ? `Filtre: ${activeFilter}` : 'Seçili öğe yok'}
                </span>
            </div>
        </div>
    );
};

export default ExplorerApp;