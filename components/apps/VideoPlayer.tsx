import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { ThemeConfig } from '../../types';

interface VideoPlayerProps {
    file?: { name: string; url?: string };
    theme?: ThemeConfig;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ file, theme }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);

    const themeColor = theme ? theme.primary.replace('bg-', 'text-') : 'text-blue-500';
    const activeColor = theme ? theme.primary : 'bg-blue-600';

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateProgress = () => {
            setProgress((video.currentTime / video.duration) * 100);
            setDuration(video.duration);
        };

        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const seekTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
        videoRef.current.currentTime = seekTime;
        setProgress(parseFloat(e.target.value));
    };

    const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;
        const vol = parseFloat(e.target.value);
        videoRef.current.volume = vol;
        setVolume(vol);
        setIsMuted(vol === 0);
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div 
            className="flex flex-col h-full bg-black text-white relative group"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
        >
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {file?.url ? (
                    <video 
                        ref={videoRef}
                        src={file.url}
                        className="w-full h-full object-contain"
                        onClick={togglePlay}
                    />
                ) : (
                    <div className="text-gray-500">Video yüklenemedi veya dosya yok.</div>
                )}
                
                {/* Big Play Button Overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                        <div className="bg-black/60 p-6 rounded-full border-2 border-white/20">
                            <Play size={48} className="fill-white translate-x-1" />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls Bar */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 py-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Progress Bar */}
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono text-gray-300">{formatTime(videoRef.current?.currentTime || 0)}</span>
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress || 0} 
                        onChange={handleSeek}
                        className={`flex-1 h-1 appearance-none rounded-lg cursor-pointer bg-gray-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:${activeColor}`}
                    />
                    <span className="text-xs font-mono text-gray-300">{formatTime(duration)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="hover:text-blue-400 transition-colors">
                            {isPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current" />}
                        </button>
                        <div className="flex items-center gap-1">
                            <SkipBack size={20} className="hover:text-gray-300 cursor-pointer" />
                            <SkipForward size={20} className="hover:text-gray-300 cursor-pointer" />
                        </div>
                        <div className="flex items-center gap-2 group/vol">
                            <button onClick={() => {
                                if (videoRef.current) {
                                    videoRef.current.muted = !isMuted;
                                    setIsMuted(!isMuted);
                                }
                            }}>
                                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={isMuted ? 0 : volume} 
                                onChange={handleVolume}
                                className="w-0 overflow-hidden group-hover/vol:w-20 transition-all h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                         <span className="text-sm font-medium truncate max-w-[200px] text-gray-300">{file?.name}</span>
                         <Maximize size={20} className="hover:text-gray-300 cursor-pointer" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;