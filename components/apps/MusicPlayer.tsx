import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, SkipBack, SkipForward, Music, Repeat, Shuffle, Heart } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface MusicPlayerProps {
    file?: { name: string; url?: string };
    theme?: ThemeConfig;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ file, theme }) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [visualizerHeight, setVisualizerHeight] = useState<number[]>(new Array(20).fill(10));

    const accentColor = theme ? theme.primary : 'bg-orange-500';
    const accentText = theme ? theme.text : 'text-orange-500';

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            setProgress((audio.currentTime / audio.duration) * 100);
            setDuration(audio.duration);
        };

        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', handleEnded);

        // Simulate Visualizer
        const interval = setInterval(() => {
            if (isPlaying) {
                setVisualizerHeight(prev => prev.map(() => Math.max(10, Math.random() * 60)));
            } else {
                setVisualizerHeight(new Array(20).fill(5));
            }
        }, 100);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('ended', handleEnded);
            clearInterval(interval);
        };
    }, [isPlaying]);

    // Auto-play when file changes
    useEffect(() => {
        if (file?.url && audioRef.current) {
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }, [file]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return;
        const seekTime = (parseFloat(e.target.value) / 100) * audioRef.current.duration;
        audioRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#121212] text-white">
            {file?.url && <audio ref={audioRef} src={file.url} />}
            
            {/* Album Art Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#2a2a2a] to-[#121212]">
                <div className="w-48 h-48 bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden group">
                    {/* Placeholder Art */}
                    <div className={`absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent to-white`} />
                    <Music size={64} className="text-gray-600" />
                    
                    {/* Simulated visualizer overlay */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-4 pb-2 h-20 opacity-50">
                        {visualizerHeight.slice(0, 10).map((h, i) => (
                             <div key={i} className={`w-2 rounded-t-sm transition-all duration-100 ${accentColor}`} style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                <div className="text-center w-full max-w-sm">
                    <h2 className="text-xl font-bold truncate mb-1">{file?.name || "Bilinmeyen Şarkı"}</h2>
                    <p className={`text-sm opacity-70 ${accentText}`}>Yerel Sanatçı</p>
                </div>
            </div>

            {/* Controls Area */}
            <div className="bg-[#181818] p-6 border-t border-[#282828]">
                {/* Progress */}
                <div className="flex items-center gap-3 mb-4 group">
                    <span className="text-xs text-gray-400 w-8 text-right">{formatTime(audioRef.current?.currentTime || 0)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress || 0} 
                        onChange={handleSeek}
                        className={`flex-1 h-1 appearance-none rounded-lg cursor-pointer bg-gray-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 transition-all`}
                    />
                    <span className="text-xs text-gray-400 w-8">{formatTime(duration)}</span>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-gray-400">
                         <Heart size={20} className="hover:text-red-500 cursor-pointer" />
                         <Shuffle size={20} className="hover:text-white cursor-pointer" />
                    </div>

                    <div className="flex items-center gap-6">
                        <SkipBack size={24} className="text-gray-300 hover:text-white cursor-pointer" />
                        <button 
                            onClick={togglePlay} 
                            className={`w-12 h-12 rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform ${theme ? theme.accentBg : 'bg-white'}`}
                        >
                            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current ml-1" />}
                        </button>
                        <SkipForward size={24} className="text-gray-300 hover:text-white cursor-pointer" />
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                        <Repeat size={20} className="hover:text-white cursor-pointer" />
                        <Volume2 size={20} className="hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MusicPlayer;