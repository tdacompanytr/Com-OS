import React, { useState, useEffect } from 'react';
import { Save, FilePlus, FolderInput } from 'lucide-react';

interface NotepadAppProps {
    initialData?: {
        name: string;
        content: string;
        folder: string;
    };
    onSave: (folder: string, name: string, content: string) => void;
}

const NotepadApp: React.FC<NotepadAppProps> = ({ initialData, onSave }) => {
    const [text, setText] = useState('');
    const [fileName, setFileName] = useState('Adsız.txt');
    const [currentFolder, setCurrentFolder] = useState<string | null>(null);
    const [status, setStatus] = useState('Hazır');
    const [showSaveAs, setShowSaveAs] = useState(false);
    const [saveNameInput, setSaveNameInput] = useState('Yeni Not.txt');

    useEffect(() => {
        if (initialData) {
            setText(initialData.content || '');
            setFileName(initialData.name);
            setCurrentFolder(initialData.folder);
            setSaveNameInput(initialData.name);
        }
    }, [initialData]);

    const handleSave = () => {
        if (currentFolder && fileName !== 'Adsız.txt') {
            // Overwrite existing
            performSave(currentFolder, fileName);
        } else {
            // Save As needed
            setShowSaveAs(true);
        }
    };

    const handleSaveAs = () => {
        setShowSaveAs(true);
    };

    const performSave = (folder: string, name: string) => {
        setStatus('Kaydediliyor...');
        onSave(folder, name, text);
        setFileName(name);
        setCurrentFolder(folder);
        setTimeout(() => {
            setStatus('Kaydedildi');
            setShowSaveAs(false);
            setTimeout(() => setStatus('Hazır'), 2000);
        }, 500);
    };

    return (
        <div className="h-full flex flex-col bg-white font-sans text-sm relative">
            {/* Menu Bar */}
            <div className="flex items-center gap-1 px-1 text-xs border-b border-gray-200 bg-white py-1 select-none">
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer text-gray-700" onClick={() => setText('')}>Yeni</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer text-gray-700" onClick={handleSave}>Kaydet</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer text-gray-700" onClick={handleSaveAs}>Farklı Kaydet</div>
                <div className="flex-1"></div>
                <div className="text-gray-400 px-2">{fileName}</div>
            </div>

            {/* Text Area */}
            <textarea 
                className="flex-1 w-full bg-white text-black p-2 resize-none focus:outline-none font-mono text-sm overflow-auto custom-scrollbar leading-relaxed" 
                placeholder="Buraya yazın..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
            />

            {/* Status Bar */}
            <div className="bg-[#f0f0f0] border-t border-gray-300 px-2 py-0.5 text-xs text-gray-600 flex justify-between">
                <span>{status}</span>
                <div className="flex gap-4">
                    <span>{text.length} Karakter</span>
                    <span>UTF-8</span>
                </div>
            </div>

            {/* Save As Modal */}
            {showSaveAs && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 backdrop-blur-[1px]">
                    <div className="bg-[#f0f0f0] border border-gray-300 shadow-xl p-4 w-80 rounded-sm">
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Save size={16} /> Farklı Kaydet
                        </h3>
                        
                        <div className="mb-3">
                            <label className="block text-xs text-gray-500 mb-1">Dosya Adı:</label>
                            <input 
                                type="text" 
                                value={saveNameInput}
                                onChange={(e) => setSaveNameInput(e.target.value)}
                                className="w-full border border-gray-300 p-1 text-sm focus:border-blue-500 outline-none"
                                autoFocus
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs text-gray-500 mb-1">Konum:</label>
                            <select 
                                className="w-full border border-gray-300 p-1 text-sm outline-none bg-white"
                                disabled
                            >
                                <option>Masaüstü</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowSaveAs(false)}
                                className="px-4 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-xs"
                            >
                                İptal
                            </button>
                            <button 
                                onClick={() => performSave('Masaüstü', saveNameInput)}
                                className="px-4 py-1 border border-blue-600 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotepadApp;