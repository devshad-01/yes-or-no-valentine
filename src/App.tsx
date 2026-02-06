import { useState, useRef, useCallback } from 'react';
import './App.css';
import wekamawe from "./assets/WekaMaweWekaMawenimbayaa-KENYAHAKUNAMATATA360ph264-ezgif.com-video-cutter.mp4";

interface Firework {
  id: number;
  x: number;
  y: number;
  particles: Particle[];
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

const COLORS = ['#be123c', '#e11d48', '#fda4af', '#fb7185', '#f43f5e', '#ec4899'];
const VIDEO_URL = wekamawe;

function App() {
  const [showQuestion, setShowQuestion] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [noButtonText, setNoButtonText] = useState("No");
  
  const fireworkIdRef = useRef(0);

  const noTexts = [
    "No",
    "Are you sure?",
    "Really sure?",
    "Think again",
    "Last chance",
  ];

  const createFirework = useCallback((x: number, y: number) => {
    const particles: Particle[] = [];
    const particleCount = 40 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        angle: (Math.PI * 2 * i) / particleCount,
        distance: 60 + Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 2 + Math.random() * 3,
      });
    }

    const newFirework: Firework = {
      id: fireworkIdRef.current++,
      x,
      y,
      particles,
    };

    setFireworks(prev => [...prev, newFirework]);

    setTimeout(() => {
      setFireworks(prev => prev.filter(f => f.id !== newFirework.id));
    }, 1500);
  }, []);

  const startFireworksShow = useCallback(() => {
    const duration = 10000;
    const interval = 400;
    let elapsed = 0;

    const showFireworks = () => {
      if (elapsed >= duration) return;
      
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * (window.innerHeight * 0.5);
      createFirework(x, y);
      
      elapsed += interval;
      setTimeout(showFireworks, interval);
    };

    showFireworks();
  }, [createFirework]);

  const handleYes = () => {
    setShowQuestion(false);
    setShowCelebration(true);
    startFireworksShow();
  };

  const handleNoClick = () => {
    const newAttempts = noAttempts + 1;
    setNoAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setShowQuestion(false);
      setShowVideo(true);
    } else {
      const textIndex = Math.min(newAttempts, noTexts.length - 1);
      setNoButtonText(noTexts[textIndex]);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor - Subtle & Elegant */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-rose-200 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-rose-300 rounded-full blur-[120px]"></div>
      </div>

      {/* Fireworks Layer */}
      {fireworks.map(firework => (
        <div
          key={firework.id}
          className="firework"
          style={{ left: firework.x, top: firework.y }}
        >
          {firework.particles.map(particle => (
            <div
              key={particle.id}
              className="firework-particle"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`,
                transform: `
                  translate(
                    ${Math.cos(particle.angle) * particle.distance}px, 
                    ${Math.sin(particle.angle) * particle.distance}px
                  )
                `,
                transition: 'transform 1s cubic-bezier(0,0,0.2,1), opacity 1s ease-out',
              }}
            />
          ))}
        </div>
      ))}

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        {showQuestion && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shadow-inner animate-heartbeat-subtle">
                <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-slate-800 mb-3 tracking-tight">
              Hello, Love.
            </h1>
            
            <p className="text-slate-500 text-lg mb-8 font-light leading-relaxed">
              I have a question for you...
            </p>
            
            <h2 className="text-3xl md:text-4xl font-serif text-rose-600 mb-10 leading-tight">
              Will you be my Valentine?
            </h2>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleYes}
                className="btn-primary w-full py-4 rounded-xl text-lg font-medium shadow-lg shadow-rose-200"
              >
                Yes, Absolutely
              </button>
              
              <button
                onClick={handleNoClick}
                className="btn-secondary w-full py-4 rounded-xl text-lg font-medium"
              >
                {noButtonText}
              </button>
            </div>
            
            <div className="mt-8 text-xs text-slate-400 font-light tracking-widest uppercase">
              February 14, 2026
            </div>
          </div>
        )}

        {showCelebration && (
          <div className="smart-glass rounded-2xl p-12 text-center">
            <div className="mb-8">
               <svg className="w-20 h-20 text-rose-500 mx-auto animate-heartbeat-subtle" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
               </svg>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif text-slate-800 mb-6 tracking-tight">
              Wonderful!
            </h1>
            
            <p className="text-slate-600 text-xl font-light leading-relaxed mb-8">
              You've made this day incredibly special. <br/>
              I can't wait to celebrate with you.
            </p>

            <div className="inline-block py-2 px-6 rounded-full bg-rose-50 text-rose-600 font-medium text-sm tracking-wide">
              YOU & ME
            </div>
          </div>
        )}

        {showVideo && (
          <div className="smart-glass rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-serif text-slate-800 mb-4">
              Just a Moment...
            </h1>
            <p className="text-slate-500 mb-8 font-light">
              Please watch this special message.
            </p>
            
            <div className="video-frame w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl mb-8">
              <video
                className="w-full h-full object-cover"
                src={VIDEO_URL}
                autoPlay
                controls
                playsInline
              >
                Your browser does not support the video tag.
              </video>
            </div>

            <button
              onClick={() => {
                setShowVideo(false);
                setShowQuestion(true);
                setNoAttempts(0);
                setNoButtonText("No");
              }}
              className="btn-primary w-full py-4 rounded-xl text-lg font-medium shadow-lg shadow-rose-200"
            >
              Let me reconsider
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
