
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

const MetaballsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    class Ball {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      isMouseBall: boolean = false;

      constructor(color: string, isMouseBall: boolean = false) {
        this.radius = Math.random() * 80 + 100;
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.color = color;
        this.isMouseBall = isMouseBall;
      }

      update() {
        if (this.isMouseBall) return;

        // Move towards mouse as a 'heat source'
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Use a small threshold to avoid division by zero and NaN results
        if (dist > 1 && dist < 600) {
          this.vx += (dx / dist) * 0.15;
          this.vy += (dy / dist) * 0.15;
        }

        // Friction
        this.vx *= 0.98;
        this.vy *= 0.98;

        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls or wrap around
        if (this.x + this.radius < 0) this.x = width + this.radius;
        if (this.x - this.radius > width) this.x = -this.radius;
        if (this.y + this.radius < 0) this.y = height + this.radius;
        if (this.y - this.radius > height) this.y = -this.radius;
      }

      draw(ctx: CanvasRenderingContext2D) {
        // Final safety check to ensure values are finite
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.radius)) return;

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const balls: Ball[] = [
      new Ball('rgba(255, 182, 193, 0.9)'), // Light Pink
      new Ball('rgba(255, 182, 193, 0.7)'),
      new Ball('rgba(224, 176, 255, 0.9)'), // Light Purple
      new Ball('rgba(224, 176, 255, 0.7)'),
      new Ball('rgba(144, 238, 144, 0.9)'), // Light Green
      new Ball('rgba(144, 238, 144, 0.7)'),
      // Interaction source ball (mouse following)
      new Ball('rgba(255, 255, 255, 0.2)', true) 
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Update mouse ball specifically
      const mouseBall = balls[balls.length - 1];
      mouseBall.x = mouseRef.current.x;
      mouseBall.y = mouseRef.current.y;
      mouseBall.radius = 180;

      balls.forEach((ball) => {
        ball.update();
        ball.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        // Metaballs effect: blur + high contrast
        filter: 'blur(40px) contrast(30)',
        backgroundColor: '#0a0a0a',
        opacity: 0.4,
      }}
    />
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [prompt, setPrompt] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [protocol, setProtocol] = useState<ExtractionProtocol | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setPrompt(MEMORY_PROMPTS[Math.floor(Math.random() * MEMORY_PROMPTS.length)]);
  };

  return (
    <main className="min-h-screen relative flex flex-col p-6 md:p-12 overflow-y-auto">
      <MetaballsBackground />

      <header className="relative z-10 flex justify-between items-center mb-16 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold tracking-[0.3em] uppercase">Freedom Extraction Lab</h1>
          <p className="text-[10px] text-white/40 tracking-widest uppercase mt-1">Liberation Analysis Unit v3.0</p>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-[10px] text-white/60 font-mono tracking-tighter uppercase">Status: </span>
          <span className="text-[10px] text-blue-400 font-mono tracking-tighter uppercase">System Nominal</span>
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
                What is the acidity and essence of your liberation?<br/>
                We analyze the chemical properties of freedom to extract it into a physical solution.
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
          <span>Liberation Index</span>
          <span>Chemical Protocol</span>
          <span>Neural Mapping</span>
        </div>
      </footer>
    </main>
  );
};

export default App;
