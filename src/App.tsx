import { useState, useRef, useCallback, useEffect } from 'react';
import './App.css';
import wekamawe from "./assets/WekaMaweWekaMawenimbayaa-KENYAHAKUNAMATATA360ph264-ezgif.com-video-cutter.mp4";
import { supabase } from './lib/supabase';
import type { Valentine } from './lib/supabase';

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

// App modes
type AppMode = 'create' | 'answer' | 'results' | 'already-answered';

const COLORS = ['#be123c', '#e11d48', '#fda4af', '#fb7185', '#f43f5e', '#ec4899'];
const VIDEO_URL = wekamawe;

// Generate random code
const generateCode = () => {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
};

function App() {
  // Mode & data states
  const [mode, setMode] = useState<AppMode>('create');
  const [senderName, setSenderName] = useState('');
  const [valentineData, setValentineData] = useState<Valentine | null>(null);
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [resultsCopied, setResultsCopied] = useState(false);

  // Original states for the YES/NO experience
  const [showQuestion, setShowQuestion] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [noAttempts, setNoAttempts] = useState(0);
  const [fireworks, setFireworks] = useState<Firework[]>([]);
  const [noButtonText, setNoButtonText] = useState("No");
  
  const fireworkIdRef = useRef(0);

  // Check URL params on load
  useEffect(() => {
    const checkUrl = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const resultsCode = params.get('results');

      if (resultsCode) {
        // Check results mode
        await loadResults(resultsCode);
      } else if (code) {
        // Answer mode
        await loadValentine(code);
      } else {
        setMode('create');
        setLoading(false);
      }
    };
    checkUrl();
  }, []);

  const loadValentine = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        setError('Valentine not found 💔');
        setLoading(false);
        return;
      }

      setValentineData(data);
      
      if (data.reply) {
        setMode('already-answered');
      } else {
        setMode('answer');
      }
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const loadResults = async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('valentines')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        setError('Valentine not found 💔');
        setLoading(false);
        return;
      }

      setValentineData(data);
      setMode('results');
    } catch {
      setError('Something went wrong');
    }
    setLoading(false);
  };

  const createValentine = async () => {
    if (!senderName.trim()) return;
    
    setLoading(true);
    const code = generateCode();
    
    try {
      const { error } = await supabase
        .from('valentines')
        .insert([{ code, sender_name: senderName.trim() }]);

      if (error) {
        setError('Failed to create. Try again!');
        setLoading(false);
        return;
      }

      const baseUrl = window.location.origin + window.location.pathname;
      const link = `${baseUrl}?code=${code}`;
      const resultsLink = `${baseUrl}?results=${code}`;
      
      setGeneratedLink(link);
      setValentineData({ code, sender_name: senderName });
      
      // Store results link for later
      localStorage.setItem(`valentine_${code}`, resultsLink);
      
    } catch {
      setError('Failed to create');
    }
    setLoading(false);
  };

  const saveReply = async (reply: 'yes' | 'no') => {
    if (!valentineData) return;
    
    try {
      await supabase
        .from('valentines')
        .update({ reply, replied_at: new Date().toISOString() })
        .eq('code', valentineData.code);
    } catch {
      // Continue anyway - UX first
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = generatedLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyResultsLink = async () => {
    const resultsLink = `${window.location.origin + window.location.pathname}?results=${valentineData?.code}`;
    try {
      await navigator.clipboard.writeText(resultsLink);
      setResultsCopied(true);
      setTimeout(() => setResultsCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = resultsLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setResultsCopied(true);
      setTimeout(() => setResultsCopied(false), 2000);
    }
  };

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

  const handleYes = async () => {
    setShowQuestion(false);
    setShowCelebration(true);
    startFireworksShow();
    if (mode === 'answer') {
      await saveReply('yes');
    }
  };

  const handleNoClick = async () => {
    const newAttempts = noAttempts + 1;
    setNoAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setShowQuestion(false);
      setShowVideo(true);
      if (mode === 'answer') {
        await saveReply('no');
      };
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

        {/* Loading State */}
        {loading && (
          <div className="smart-glass rounded-2xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="smart-glass rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">💔</div>
            <p className="text-slate-600 text-lg">{error}</p>
            <button
              onClick={() => window.location.href = window.location.pathname}
              className="btn-secondary mt-6 py-3 px-6 rounded-xl"
            >
              Go Home
            </button>
          </div>
        )}

        {/* CREATE MODE - Sender creates a valentine */}
        {!loading && !error && mode === 'create' && !generatedLink && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shadow-inner animate-heartbeat-subtle">
                <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-serif text-slate-800 mb-3 tracking-tight">
              Send a Valentine 💌
            </h1>
            
            <p className="text-slate-500 text-lg mb-8 font-light leading-relaxed">
              Create your special link to share
            </p>

            <input
              type="text"
              placeholder="Your name..."
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100 text-center text-lg mb-6"
              maxLength={30}
            />

            <button
              onClick={createValentine}
              disabled={!senderName.trim()}
              className="btn-primary w-full py-4 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create My Valentine Link ✨
            </button>
            
            <div className="mt-8 text-xs text-slate-400 font-light tracking-widest uppercase">
              February 14, 2026
            </div>
          </div>
        )}

        {/* LINK CREATED - Show the link to copy */}
        {!loading && !error && mode === 'create' && generatedLink && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="text-5xl mb-6">🎉</div>

            <h1 className="text-2xl md:text-3xl font-serif text-slate-800 mb-3 tracking-tight">
              Your Valentine Link is Ready!
            </h1>
            
            <p className="text-slate-500 mb-6 font-light">
              Send this link to your special someone:
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 break-all text-sm text-slate-600 font-mono">
              {generatedLink}
            </div>

            <button
              onClick={copyLink}
              className="btn-primary w-full py-4 rounded-xl text-lg font-medium shadow-lg shadow-rose-200 mb-4"
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>

            <div className="bg-rose-50 rounded-xl p-4 text-sm text-rose-700">
              <p className="font-medium mb-2">💡 Save this to check their reply:</p>
              <p className="text-xs break-all font-mono mb-2">
                {window.location.origin + window.location.pathname}?results={valentineData?.code}
              </p>
              <button
                onClick={copyResultsLink}
                className="text-xs bg-rose-100 hover:bg-rose-200 text-rose-700 px-3 py-1 rounded-lg transition-colors"
              >
                {resultsCopied ? '✓ Copied!' : 'Copy Results Link'}
              </button>
            </div>
            
            <button
              onClick={() => {
                setGeneratedLink('');
                setSenderName('');
                setValentineData(null);
              }}
              className="btn-secondary mt-4 py-3 px-6 rounded-xl text-sm"
            >
              Create Another
            </button>
          </div>
        )}

        {/* ANSWER MODE - Recipient sees the question */}
        {!loading && !error && mode === 'answer' && showQuestion && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center shadow-inner animate-heartbeat-subtle">
                <svg className="w-8 h-8 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>

            <p className="text-slate-500 text-sm mb-2 font-light">
              From <span className="font-medium text-rose-500">{valentineData?.sender_name}</span>
            </p>

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
                Yes, Absolutely 💕
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

        {/* CELEBRATION - After YES */}
        {!loading && !error && (mode === 'answer' || mode === 'create') && showCelebration && (
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
              {mode === 'answer' ? (
                <>You've made <span className="font-medium text-rose-500">{valentineData?.sender_name}</span>'s day! 💕</>
              ) : (
                <>You've made this day incredibly special.<br/>I can't wait to celebrate with you.</>
              )}
            </p>

            <div className="inline-block py-2 px-6 rounded-full bg-rose-50 text-rose-600 font-medium text-sm tracking-wide">
              YOU & ME 💕
            </div>
          </div>
        )}

        {/* VIDEO - After too many NO's */}
        {!loading && !error && (mode === 'answer' || mode === 'create') && showVideo && (
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

        {/* RESULTS MODE - Sender checks reply */}
        {!loading && !error && mode === 'results' && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="mb-6">
              {valentineData?.reply === 'yes' ? (
                <div className="text-6xl">💕</div>
              ) : valentineData?.reply === 'no' ? (
                <div className="text-6xl">💔</div>
              ) : (
                <div className="text-6xl">⏳</div>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif text-slate-800 mb-3 tracking-tight">
              {valentineData?.reply === 'yes' 
                ? "They said YES! 🎉" 
                : valentineData?.reply === 'no'
                  ? "They said no... 😢"
                  : "Waiting for reply..."}
            </h1>
            
            <p className="text-slate-500 mb-6 font-light">
              {valentineData?.reply 
                ? `Replied on ${new Date(valentineData.replied_at || '').toLocaleDateString()}`
                : "They haven't answered yet. Check back later!"}
            </p>

            {valentineData?.reply === 'yes' && (
              <div className="bg-rose-50 rounded-xl p-4 text-rose-700">
                Time to plan something special! 💝
              </div>
            )}

            <button
              onClick={() => window.location.href = window.location.pathname}
              className="btn-secondary mt-6 py-3 px-6 rounded-xl"
            >
              Create Another Valentine
            </button>
          </div>
        )}

        {/* ALREADY ANSWERED */}
        {!loading && !error && mode === 'already-answered' && (
          <div className="smart-glass rounded-2xl p-10 md:p-12 text-center animate-fade-in">
            <div className="text-5xl mb-6">
              {valentineData?.reply === 'yes' ? '💕' : '💔'}
            </div>

            <h1 className="text-2xl md:text-3xl font-serif text-slate-800 mb-3 tracking-tight">
              Already Answered!
            </h1>
            
            <p className="text-slate-500 font-light">
              This valentine has already been answered with: <br/>
              <span className="font-medium text-lg text-rose-500">
                {valentineData?.reply === 'yes' ? 'YES 💕' : 'No 😢'}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
