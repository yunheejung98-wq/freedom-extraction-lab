
import React, { useState, useEffect, useRef } from 'react';
import { analyzeMemory } from './services/geminiService';
import { AppState, ExtractionProtocol } from './types';
import { LoadingScanner } from './components/LoadingScanner';
import { ResultCard } from './components/ResultCard';

const MEMORY_PROMPTS = [
  "A memory of a moment you felt truly free",
  "A scene of liberation you never want to forget",
  "The sensation of breaking a boundary or chain",
  "A specific place where you found ultimate freedom",
  "The last time you breathed without any weight on your shoulders"
];

// Thermal Energy Visual Background Component (Legacy Code Adapted)
const ThermalBackground: React.FC<{ themeColor?: { r: number, g: number, b: number } }> = ({ 
  themeColor = { r: 255, g: 80, b: 30 } 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Linear interpolation helper (replacing GSAP for simplicity)
    const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

    class HeatParticle {
      x: number;
      y: number;
      size: number;
      initialSize: number;
      maxSize: number;
      life: number;
      decay: number;
      vx: number;
      vy: number;
      color: { r: number, g: number, b: number };

      constructor(x: number, y: number, r: number, g: number, b: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 40 + 20;
        this.initialSize = this.size;
        this.maxSize = this.size * 3;
        this.life = 1.0;
        this.decay = Math.random() * 0.015 + 0.005;
        this.color = { r, g, b };
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size = lerp(this.initialSize, this.maxSize, 1 - this.life);
      }

      draw(context: CanvasRenderingContext2D) {
        const alpha = Math.max(0, this.life);
        const gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        
        // Center is hot (white), outer is themed
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.2, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fill();
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      // Emit multiple particles for rich texture
      for (let i = 0; i < 2; i++) {
        particlesRef.current.push(new HeatParticle(
          e.clientX + (Math.random() - 0.5) * 20,
          e.clientY + (Math.random() - 0.5) * 20,
          themeColor.r, themeColor.g, themeColor.b
        ));
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      // Overwrite with dark background
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Bloom/Additive blending
      ctx.globalCompositeOperation = 'screen';

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.update();
        p.draw(ctx);
        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }

      // Performance cap
      if (particlesRef.current.length > 500) {
        particlesRef.current.shift();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [themeColor]);

  return (
    <div 
      className="fixed inset-0 z-0 bg-[#050505] pointer-events-none"
      style={{ filter: 'blur(35px) contrast(1.8)' }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [prompt, setPrompt] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [protocol, setProtocol] = useState<ExtractionProtocol | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Background color theme state
  const [bgTheme, setBgTheme] = useState({ r: 255, g: 80, b: 30 }); // Default Warm

  useEffect(() => {
    setPrompt(MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)]);
  }, []);

  const handleStart = () => {
    setState('INPUTTING');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryInput.trim()) return;

    setState('ANALYZING');
    setError(null);

    try {
      const result = await analyzeMemory(memoryInput);
      setProtocol(result);
      
      // Update background theme based on pH result (mapped from legacy logic)
      if (result.phValue <= 5) { // Acidic/Cold: Blues
        setBgTheme({ r: 50, g: 100, b: 255 });
      } else if (result.phValue > 5 && result.phValue < 9) { // Neutral/Stable: Purples
        setBgTheme({ r: 180, g: 70, b: 255 });
      } else { // Alkaline/Hot: Reds
        setBgTheme({ r: 255, g: 80, b: 30 });
      }

      setState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError('Extraction failed. The freedom memory might be too complex to stabilize.');
      setState('INPUTTING');
    }
  };

  const handleReset = () => {
    setMemoryInput('');
    setProtocol(null);
    setState('IDLE');
    setBgTheme({ r: 255, g: 80, b: 30 });
    setPrompt(MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)]);
  };

  return (
    <main className="min-h-screen relative flex flex-col p-6 md:p-12 overflow-y-auto">
      <ThermalBackground themeColor={bgTheme} />

      <header className="relative z-10 flex justify-between items-center mb-16 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-[0.3em] uppercase">Freedom Extraction Lab</h1>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">Liberation Analysis Unit v3.0</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] text-white/60 font-mono tracking-tighter uppercase">Status: </span>
          <span className="text-[10px] text-orange-400 font-mono tracking-tighter uppercase animate-pulse">Thermal Trace Active</span>
        </div>
      </header>

      <section className="relative z-10 flex-grow flex flex-col items-center justify-center">
        {state === 'IDLE' && (
          <div className="text-center space-y-12 max-w-2xl">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-extralight tracking-tight leading-tight">
                Translate <span className="font-bold italic">Freedom</span> into Matter
              </h2>
              <p className="text-white/60 text-lg font-light leading-relaxed">
                What is the thermal signature and essence of your liberation?<br/>
                Move your mouse to trace the heat of your memories.
              </p>
            </div>
            <button 
              onClick={handleStart}
              className="group relative px-12 py-4 overflow-hidden border border-white/20 transition-all hover:border-white/80"
            >
              <div className="relative z-10 text-sm tracking-[0.5em] uppercase font-bold group-hover:scale-105 transition-transform">
                Enter Extraction Chamber
              </div>
              <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-10" />
            </button>
          </div>
        )}

        {state === 'INPUTTING' && (
          <div className="w-full max-w-2xl glass p-10 rounded-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Prompt</label>
                <h3 className="text-2xl font-light text-white/90">{prompt}</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Memory Transcript</label>
                <textarea
                  autoFocus
                  required
                  value={memoryInput}
                  onChange={(e) => setMemoryInput(e.target.value)}
                  placeholder="Record your memory of freedom here. Detailed descriptions lead to more accurate chemical stabilization..."
                  className="w-full h-48 bg-transparent border border-white/10 rounded-sm p-4 text-lg font-light focus:outline-none focus:border-white/40 transition-colors resize-none leading-relaxed"
                />
              </div>

              {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

              <button 
                type="submit"
                className="w-full py-5 bg-white/5 border border-white/20 hover:bg-white hover:text-black font-bold uppercase tracking-widest text-xs transition-all duration-300"
              >
                Synthesize Freedom Data
              </button>
            </form>
          </div>
        )}

        {state === 'ANALYZING' && <LoadingScanner />}

        {state === 'RESULT' && protocol && (
          <div className="w-full animate-in fade-in zoom-in-95 duration-1000">
            <ResultCard protocol={protocol} onReset={handleReset} />
          </div>
        )}
      </section>

      <footer className="relative z-10 mt-16 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/20 tracking-widest uppercase border-t border-white/5 pt-8">
        <div>© 2024 Freedom Extraction Project</div>
        <div className="mt-4 md:mt-0 space-x-6">
          <span>Thermal Mapping</span>
          <span>Chemical Protocol</span>
          <span>Neural Trace</span>
        </div>
      </footer>
    </main>
  );
};

export default App;
