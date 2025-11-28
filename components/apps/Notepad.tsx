import React, { useState } from 'react';

const NotepadApp: React.FC = () => {
    const [text, setText] = useState('');
    const [status, setStatus] = useState('Hazır');

    const handleSave = () => {
        setStatus('Kaydediliyor...');
        setTimeout(() => {
            setStatus('Kaydedildi');
            setTimeout(() => setStatus('Hazır'), 2000);
        }, 500);
    };

    return (
        <div className="h-full flex flex-col bg-white font-sans text-sm">
            <div className="flex items-center gap-1 px-1 text-xs border-b border-gray-200 bg-white py-1 select-none">
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer" onClick={handleSave}>Dosya</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Düzenle</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Biçim</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Görünüm</div>
                <div className="hover:bg-blue-50 px-2 py-0.5 rounded cursor-pointer">Yardım</div>
            </div>
            <textarea 
                className="flex-1 w-full bg-white text-black p-2 resize-none focus:outline-none font-mono text-sm overflow-auto custom-scrollbar" 
                placeholder="Buraya yazın..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                spellCheck={false}
            />
            <div className="bg-[#f0f0f0] border-t border-gray-300 px-2 py-0.5 text-xs text-gray-600 flex justify-between">
                <span>{status}</span>
                <div className="flex gap-4">
                    <span>Sat 1, Süt 1</span>
                    <span>%100</span>
                    <span>Windows (CRLF)</span>
                    <span>UTF-8</span>
                </div>
            </div>
        </div>
    );
};

export default NotepadApp;