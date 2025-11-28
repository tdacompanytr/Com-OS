import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MarketItem, ThemeConfig } from '../../types';
import { Play, RotateCcw, Coins, TrendingUp, Zap, Skull, Car, Map, MousePointer2 } from 'lucide-react';

interface GameRunnerProps {
    gameData: MarketItem;
    theme: ThemeConfig;
}

type GameMode = 'RACING' | 'RPG' | 'CLICKER' | 'ARCADE';

const GameRunner: React.FC<GameRunnerProps> = ({ gameData, theme }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    
    // Clicker Game State
    const [money, setMoney] = useState(0);
    const [income, setIncome] = useState(1);
    const [autoIncome, setAutoIncome] = useState(0);

    // Determine Game Mode based on Category
    const getGameMode = (category: string | string[]): GameMode => {
        const cat = Array.isArray(category) ? category[0] : category;
        if (cat.includes('Yarış')) return 'RACING';
        if (cat.includes('RYO') || cat.includes('Macera')) return 'RPG';
        if (cat.includes('Strateji') || cat.includes('Simülasyon')) return 'CLICKER';
        return 'ARCADE';
    };

    const mode = getGameMode(gameData.category);

    // Game Loop State Refs
    const gameState = useRef({
        playerX: 50, // Percentage
        playerY: 80, // Percentage (Variable in RPG)
        objects: [] as {x: number, y: number, type: 'enemy' | 'coin' | 'road', speed: number, color?: string}[],
        score: 0,
        speedMultiplier: 1,
        gameLoopId: 0,
        lastFrameTime: 0
    });

    const extractColor = (twClass: string) => {
        if(twClass.includes('red')) return '#ef4444';
        if(twClass.includes('blue')) return '#3b82f6';
        if(twClass.includes('green')) return '#22c55e';
        if(twClass.includes('purple')) return '#a855f7';
        if(twClass.includes('yellow')) return '#eab308';
        if(twClass.includes('pink')) return '#ec4899';
        if(twClass.includes('indigo')) return '#6366f1';
        if(twClass.includes('orange')) return '#f97316';
        return '#ffffff';
    };

    const themeColor = extractColor(gameData.imageColor);

    // --- GAME LOGIC ---

    const startGame = () => {
        setIsPlaying(true);
        setGameOver(false);
        setScore(0);
        
        // Reset Logic per mode
        if (mode === 'RPG') {
            gameState.current = {
                playerX: 50,
                playerY: 50,
                objects: [], // Coins/Enemies
                score: 0,
                speedMultiplier: 1,
                gameLoopId: requestAnimationFrame(gameLoop),
                lastFrameTime: performance.now()
            };
        } else if (mode === 'RACING') {
             gameState.current = {
                playerX: 50,
                playerY: 80,
                objects: [], // Cars/Stripes
                score: 0,
                speedMultiplier: 1,
                gameLoopId: requestAnimationFrame(gameLoop),
                lastFrameTime: performance.now()
            };
        } else if (mode === 'ARCADE') {
            gameState.current = {
                playerX: 50,
                playerY: 85,
                objects: [],
                score: 0,
                speedMultiplier: 1,
                gameLoopId: requestAnimationFrame(gameLoop),
                lastFrameTime: performance.now()
            };
        } else if (mode === 'CLICKER') {
            // Clicker doesn't use the canvas loop generally, but we use a timer
            setMoney(0);
            setIncome(1);
            setAutoIncome(0);
        }
    };

    const gameLoop = (timestamp: number) => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        // Calculate Delta Time? Simplified for now
        update(ctx, canvasRef.current.width, canvasRef.current.height);
        
        if (!gameOver) {
            gameState.current.gameLoopId = requestAnimationFrame(gameLoop);
        }
    };

    const update = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        if (mode === 'RACING') updateRacing(ctx, w, h);
        else if (mode === 'RPG') updateRPG(ctx, w, h);
        else updateArcade(ctx, w, h);
    };

    // --- ENGINES ---

    const updateRacing = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        // 1. Draw Road
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, w, h);
        
        // Grass on sides
        ctx.fillStyle = '#166534';
        ctx.fillRect(0, 0, w * 0.15, h);
        ctx.fillRect(w * 0.85, 0, w * 0.15, h);

        // Road Stripes (Visual)
        if (Math.random() < 0.1) {
             gameState.current.objects.push({ x: 50, y: -10, type: 'road', speed: 1.5 * gameState.current.speedMultiplier });
        }

        // Enemies (Cars)
        if (Math.random() < 0.02) {
            const lane = Math.random() < 0.5 ? 30 : 70; // Two lanes roughly
            // Add some jitter
            const xPos = 20 + Math.random() * 60; 
            gameState.current.objects.push({ 
                x: xPos, 
                y: -10, 
                type: 'enemy', 
                speed: (0.8 + Math.random() * 0.5) * gameState.current.speedMultiplier,
                color: ['#ef4444', '#3b82f6', '#eab308'][Math.floor(Math.random() * 3)]
            });
        }

        // Update Objects
        gameState.current.objects.forEach(obj => {
            obj.y += obj.speed;
        });
        
        // Cleanup
        gameState.current.objects = gameState.current.objects.filter(obj => obj.y < 110);

        // Draw Stripes
        ctx.fillStyle = '#fff';
        gameState.current.objects.filter(o => o.type === 'road').forEach(stripe => {
            const sx = (stripe.x / 100) * w;
            const sy = (stripe.y / 100) * h;
            ctx.fillRect(sx - 2, sy, 4, 40);
        });

        // Draw Player Car
        const px = (gameState.current.playerX / 100) * w;
        const py = (gameState.current.playerY / 100) * h;
        const pW = (8 / 100) * w; // Car Width
        const pH = (12 / 100) * w; // Car Height

        // Car Body
        ctx.fillStyle = themeColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = themeColor;
        ctx.fillRect(px - pW/2, py - pH/2, pW, pH);
        ctx.shadowBlur = 0;
        // Car Lights
        ctx.fillStyle = '#fff'; // Headlights
        ctx.fillRect(px - pW/2 + 2, py - pH/2, 4, 4);
        ctx.fillRect(px + pW/2 - 6, py - pH/2, 4, 4);
        ctx.fillStyle = '#ef4444'; // Taillights
        ctx.fillRect(px - pW/2 + 2, py + pH/2 - 4, 4, 4);
        ctx.fillRect(px + pW/2 - 6, py + pH/2 - 4, 4, 4);


        // Draw Enemy Cars & Collision
        gameState.current.objects.filter(o => o.type === 'enemy').forEach(enemy => {
            const ex = (enemy.x / 100) * w;
            const ey = (enemy.y / 100) * h;
            
            ctx.fillStyle = enemy.color || '#ff0000';
            ctx.fillRect(ex - pW/2, ey - pH/2, pW, pH);

            // Simple Box Collision
            if (
                px < ex + pW &&
                px + pW > ex &&
                py < ey + pH &&
                py + pH > ey
            ) {
                endGame();
            }
        });

        // Score
        gameState.current.score++;
        gameState.current.speedMultiplier = 1 + (gameState.current.score / 2000);
        if (gameState.current.score % 10 === 0) setScore(gameState.current.score);
    };

    const updateRPG = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        // 1. Draw Terrain
        ctx.fillStyle = '#064e3b'; // Dark green
        ctx.fillRect(0, 0, w, h);
        
        // Grid pattern
        ctx.strokeStyle = '#065f46';
        ctx.lineWidth = 1;
        for(let i=0; i<w; i+=40) { ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,h); ctx.stroke(); }
        for(let i=0; i<h; i+=40) { ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(w,i); ctx.stroke(); }

        // Spawn Loot (Coins)
        if (gameState.current.objects.length < 5 && Math.random() < 0.05) {
             gameState.current.objects.push({ 
                 x: 10 + Math.random() * 80, 
                 y: 10 + Math.random() * 80, 
                 type: 'coin', 
                 speed: 0 
            });
        }
        
        // Spawn Enemy (Chasers)
        if (Math.random() < 0.01) {
             gameState.current.objects.push({ 
                 x: Math.random() < 0.5 ? 0 : 100, 
                 y: Math.random() * 100, 
                 type: 'enemy', 
                 speed: 0.2 + (gameState.current.score / 500)
            });
        }

        const px = (gameState.current.playerX / 100) * w;
        const py = (gameState.current.playerY / 100) * h;
        const pSize = 20;

        // Update Enemies (Chase Logic)
        gameState.current.objects.forEach(obj => {
            if (obj.type === 'enemy') {
                if (obj.x < gameState.current.playerX) obj.x += obj.speed;
                else obj.x -= obj.speed;
                
                if (obj.y < gameState.current.playerY) obj.y += obj.speed;
                else obj.y -= obj.speed;
            }
        });

        // Draw Player (Hero)
        ctx.fillStyle = themeColor;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
        // Sword/Item indicator
        ctx.fillStyle = '#fff';
        ctx.fillRect(px + 8, py - 5, 10, 2);

        // Draw Objects & Collision
        gameState.current.objects = gameState.current.objects.filter(obj => {
            const ox = (obj.x / 100) * w;
            const oy = (obj.y / 100) * h;

            // Draw
            if (obj.type === 'coin') {
                ctx.fillStyle = '#fbbf24'; // Gold
                ctx.beginPath();
                ctx.arc(ox, oy, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#d97706';
                ctx.stroke();
            } else {
                ctx.fillStyle = '#dc2626'; // Red Enemy
                ctx.fillRect(ox - 10, oy - 10, 20, 20);
            }

            // Collision
            const dx = px - ox;
            const dy = py - oy;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 20) {
                if (obj.type === 'coin') {
                    setScore(s => s + 50);
                    return false; // Remove coin
                } else if (obj.type === 'enemy') {
                    endGame();
                    return true;
                }
            }
            return true;
        });
    };

    const updateArcade = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
         // Background
         ctx.fillStyle = '#111';
         ctx.fillRect(0, 0, w, h);
 
         // Starfield
         ctx.fillStyle = '#fff';
         if(Math.random() < 0.5) ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);

         // Spawn Obstacles
         if (Math.random() < 0.05) {
             gameState.current.objects.push({
                 x: Math.random() * 100,
                 y: -10,
                 type: 'enemy',
                 speed: 0.5 + (gameState.current.score / 500)
             });
         }
 
         // Update positions
         gameState.current.objects.forEach(obs => obs.y += obs.speed);
         
         // Remove off-screen obstacles
         gameState.current.objects = gameState.current.objects.filter(obs => obs.y < 110);
 
         // Player
         const px = (gameState.current.playerX / 100) * w;
         const py = (gameState.current.playerY / 100) * h;
         const pSize = (5 / 100) * w;
         
         ctx.fillStyle = themeColor;
         ctx.shadowBlur = 20;
         ctx.shadowColor = themeColor;
         ctx.fillRect(px - pSize/2, py - pSize/2, pSize, pSize);
         ctx.shadowBlur = 0;
 
         // Obstacles
         ctx.fillStyle = '#ff4444';
         gameState.current.objects.forEach(obs => {
             const ox = (obs.x / 100) * w;
             const oy = (obs.y / 100) * h;
             const oSize = (5 / 100) * w;
             ctx.fillRect(ox - oSize/2, oy - oSize/2, oSize, oSize);

             // Collision
             if (
                px < ox + oSize/2 &&
                px + pSize > ox - oSize/2 &&
                py < oy + oSize/2 &&
                py + pSize > oy - oSize/2
            ) {
                endGame();
            }
         });

         // Score
        gameState.current.score++;
        if (gameState.current.score % 10 === 0) setScore(gameState.current.score);
    }

    const endGame = () => {
        setGameOver(true);
        setIsPlaying(false);
        if (gameState.current.gameLoopId) cancelAnimationFrame(gameState.current.gameLoopId);
    };

    // --- CONTROLS ---

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isPlaying) return;
        const speed = 5;

        // RACING & ARCADE (Left/Right only)
        if (mode === 'RACING' || mode === 'ARCADE') {
            if (e.key === 'ArrowLeft') gameState.current.playerX = Math.max(5, gameState.current.playerX - speed);
            if (e.key === 'ArrowRight') gameState.current.playerX = Math.min(95, gameState.current.playerX + speed);
        }
        
        // RPG (4 Directions)
        if (mode === 'RPG') {
            if (e.key === 'ArrowLeft') gameState.current.playerX = Math.max(5, gameState.current.playerX - speed);
            if (e.key === 'ArrowRight') gameState.current.playerX = Math.min(95, gameState.current.playerX + speed);
            if (e.key === 'ArrowUp') gameState.current.playerY = Math.max(5, gameState.current.playerY - speed);
            if (e.key === 'ArrowDown') gameState.current.playerY = Math.min(95, gameState.current.playerY + speed);
        }
    }, [isPlaying, mode]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (score > highScore) setHighScore(score);
    }, [score, highScore]);

    // Clicker Loop
    useEffect(() => {
        if (mode === 'CLICKER' && isPlaying) {
            const interval = setInterval(() => {
                setMoney(m => m + autoIncome);
                setScore(s => s + autoIncome); // Score tracks lifetime earnings
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [mode, isPlaying, autoIncome]);


    // --- RENDER ---

    const renderClickerGame = () => (
        <div className="w-full h-full bg-[#1a1a1a] flex flex-col p-8 text-white">
            <div className="flex justify-between items-center mb-12">
                <div>
                     <div className="text-gray-400 text-sm">Şirket Hesabı</div>
                     <div className="text-5xl font-bold font-mono text-green-400">₺{money.toFixed(0)}</div>
                </div>
                <div className="text-right">
                    <div className="text-gray-400 text-sm">Pasif Gelir</div>
                    <div className="text-xl font-mono text-blue-400">+{autoIncome}/sn</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 flex-1">
                <div className="flex flex-col items-center justify-center gap-6 bg-[#252525] rounded-xl p-8 shadow-lg">
                    <button 
                        onClick={() => {
                            setMoney(m => m + income);
                            setScore(s => s + income);
                            // Visual pop effect could go here
                        }}
                        className={`w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-4 border-[#333]`}
                        style={{ background: themeColor }}
                    >
                         <MousePointer2 size={48} className="text-black/50" />
                         <span className="text-2xl font-bold text-black shadow-none">TIKLA</span>
                         <span className="text-sm font-bold text-black/70">+₺{income}</span>
                    </button>
                    <p className="text-gray-400 text-sm">Para kazanmak için butona bas</p>
                </div>

                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                     <h3 className="font-semibold text-gray-300 border-b border-gray-700 pb-2">Mağaza</h3>
                     
                     <button 
                        disabled={money < 50}
                        onClick={() => {
                            if(money >= 50) {
                                setMoney(m => m - 50);
                                setIncome(i => i + 1);
                            }
                        }}
                        className="w-full bg-[#333] hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between transition-colors"
                     >
                         <div className="flex items-center gap-3">
                             <div className="bg-blue-900 p-2 rounded"><Zap size={20} className="text-blue-400" /></div>
                             <div className="text-left">
                                 <div className="font-bold">Daha İyi Fare</div>
                                 <div className="text-xs text-gray-400">Tıklama başına +1</div>
                             </div>
                         </div>
                         <div className="font-mono text-yellow-500">₺50</div>
                     </button>

                     <button 
                        disabled={money < 200}
                        onClick={() => {
                            if(money >= 200) {
                                setMoney(m => m - 200);
                                setAutoIncome(i => i + 5);
                            }
                        }}
                        className="w-full bg-[#333] hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between transition-colors"
                     >
                         <div className="flex items-center gap-3">
                             <div className="bg-green-900 p-2 rounded"><TrendingUp size={20} className="text-green-400" /></div>
                             <div className="text-left">
                                 <div className="font-bold">Yatırım Yap</div>
                                 <div className="text-xs text-gray-400">+5/sn Pasif Gelir</div>
                             </div>
                         </div>
                         <div className="font-mono text-yellow-500">₺200</div>
                     </button>

                     <button 
                        disabled={money < 1000}
                        onClick={() => {
                            if(money >= 1000) {
                                setMoney(m => m - 1000);
                                setAutoIncome(i => i + 25);
                            }
                        }}
                        className="w-full bg-[#333] hover:bg-[#444] disabled:opacity-50 disabled:cursor-not-allowed p-4 rounded-lg flex items-center justify-between transition-colors"
                     >
                         <div className="flex items-center gap-3">
                             <div className="bg-purple-900 p-2 rounded"><Coins size={20} className="text-purple-400" /></div>
                             <div className="text-left">
                                 <div className="font-bold">Fabrika Kur</div>
                                 <div className="text-xs text-gray-400">+25/sn Pasif Gelir</div>
                             </div>
                         </div>
                         <div className="font-mono text-yellow-500">₺1000</div>
                     </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-black text-white select-none">
            {/* Header */}
            <div className="h-14 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded bg-opacity-20`} style={{backgroundColor: themeColor}}>
                        {mode === 'RACING' && <Car size={18} style={{color: themeColor}} />}
                        {mode === 'RPG' && <Map size={18} style={{color: themeColor}} />}
                        {mode === 'CLICKER' && <MousePointer2 size={18} style={{color: themeColor}} />}
                        {mode === 'ARCADE' && <Zap size={18} style={{color: themeColor}} />}
                    </div>
                    <div>
                        <h2 className="text-base font-bold leading-tight">{gameData.name}</h2>
                        <span className="text-[10px] text-gray-400 bg-[#333] px-1.5 py-0.5 rounded">{gameData.category}</span>
                    </div>
                </div>
                <div className="flex gap-4 text-lg font-mono">
                    <div className="text-gray-400 text-sm flex flex-col items-end leading-none">
                        <span>SKOR</span>
                        <span className="text-white text-lg">{score}</span>
                    </div>
                    <div className="text-yellow-600 text-sm flex flex-col items-end leading-none">
                         <span>REKOR</span>
                         <span className="text-yellow-400 text-lg">{highScore}</span>
                    </div>
                </div>
            </div>
            
            {/* Game Area */}
            <div className="flex-1 relative overflow-hidden bg-[#111]">
                
                {mode === 'CLICKER' && isPlaying ? (
                    renderClickerGame()
                ) : (
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full block"
                        width={800}
                        height={600}
                    />
                )}
                
                {/* Overlay UI for Canvas Games */}
                {(!isPlaying && mode !== 'CLICKER') && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 p-8 text-center">
                        {gameOver ? (
                            <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                                <Skull size={64} className="text-red-500 mb-4" />
                                <h1 className="text-5xl font-black text-white mb-2 uppercase tracking-wider">Oyun Bitti</h1>
                                <p className="text-gray-400 mb-8 text-xl">Toplam Skorun: <span className="text-white font-mono">{score}</span></p>
                            </div>
                        ) : (
                            <div className="animate-in slide-in-from-bottom-10 duration-500 flex flex-col items-center">
                                <div className="mb-6 relative">
                                    <div className="absolute inset-0 blur-2xl opacity-50" style={{backgroundColor: themeColor}}></div>
                                    <h1 className="relative text-5xl font-black mb-2 drop-shadow-lg uppercase italic" style={{color: themeColor}}>{gameData.name}</h1>
                                </div>
                                <p className="text-gray-300 mb-8 max-w-md leading-relaxed">
                                    {mode === 'RACING' && "Trafikte makas atarak ilerle. Arabalara çarpma!"}
                                    {mode === 'RPG' && "Haritayı keşfet, altınları topla ve düşmanlardan kaç!"}
                                    {mode === 'ARCADE' && "Reflekslerini kullan. Düşen engellerden kaçın!"}
                                </p>
                                
                                <div className="flex gap-4 mb-8">
                                    {mode === 'RPG' ? (
                                         <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
                                            <div className="flex gap-1">
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">▲</div>
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">◄</div>
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">▼</div>
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">►</div>
                                            </div>
                                            <span>Hareket</span>
                                         </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
                                            <div className="flex gap-1">
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">◄</div>
                                                <div className="w-8 h-8 border border-gray-600 rounded flex items-center justify-center">►</div>
                                            </div>
                                            <span>Yönlendir</span>
                                         </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <button 
                            onClick={startGame}
                            className="group flex items-center gap-3 px-10 py-4 rounded-sm text-xl font-bold transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            style={{backgroundColor: themeColor, color: '#000'}}
                        >
                            {gameOver ? <RotateCcw size={24} className="group-hover:-rotate-180 transition-transform duration-500" /> : <Play size={24} className="fill-current" />}
                            {gameOver ? 'TEKRAR DENE' : 'OYUNU BAŞLAT'}
                        </button>
                    </div>
                )}

                {/* Overlay UI for Clicker Start Screen */}
                {(!isPlaying && mode === 'CLICKER') && (
                     <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-8 text-center">
                          <h1 className="text-4xl font-bold mb-4" style={{color: themeColor}}>{gameData.name}</h1>
                          <p className="text-gray-400 mb-8">Şirketini yönet, yatırımlar yap ve servetine servet kat!</p>
                          <button 
                            onClick={startGame}
                            className="px-8 py-3 rounded font-bold text-black"
                            style={{backgroundColor: themeColor}}
                        >
                            Yönetime Başla
                        </button>
                     </div>
                )}
            </div>
        </div>
    );
};

export default GameRunner;