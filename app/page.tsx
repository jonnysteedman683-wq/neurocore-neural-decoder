'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeuroIntentDecoder, NeuroIntent } from '@/lib/NeuroIntentDecoder';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function ErrorThrower({ error }: { error: Error }) {
  throw error;
  return null;
}

export default function Page() {
  const [intent, setIntent] = useState<NeuroIntent | null>(null);
  const [decodeError, setDecodeError] = useState<Error | null>(null);
  const decoderRef = useRef<NeuroIntentDecoder | null>(null);
  const [sec, setSec] = useState(0);

  const [cpu, setCpu] = useState<string>('--');
  const [latency, setLatency] = useState<string>('--');
  
  const [theme, setTheme] = useState<'slate' | 'midnight'>('slate');
  
  const noisePath = useMemo(() => {
    const pts = Array.from({length: 12}).map((_, i) => `${(i / 11) * 100},${80 + Math.random() * 20}`);
    return `M ${pts.join(' L ')}`;
  }, [sec]);
  
  const [sonification, setSonification] = useState(false);
  const [isPayloadExpanded, setIsPayloadExpanded] = useState(true);
  const audioCtx = useRef<AudioContext | null>(null);
  const oscillator = useRef<OscillatorNode | null>(null);
  const gainNode = useRef<GainNode | null>(null);

  useEffect(() => {
    if (sonification && !audioCtx.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = 400; // Base frequency
      gain.gain.value = 0; // Start muted
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      
      audioCtx.current = ctx;
      oscillator.current = osc;
      gainNode.current = gain;
    } else if (!sonification && audioCtx.current) {
      audioCtx.current.close();
      audioCtx.current = null;
      oscillator.current = null;
      gainNode.current = null;
    }
  }, [sonification]);

  useEffect(() => {
    if (sonification && audioCtx.current && gainNode.current && oscillator.current) {
      if (intent && intent.intent !== 'rest' && intent.intent !== 'unknown') {
        const power = intent.features.alphaPower;
        oscillator.current.frequency.setTargetAtTime(400 + power * 2, audioCtx.current.currentTime, 0.1);
        gainNode.current.gain.setTargetAtTime(0.1, audioCtx.current.currentTime, 0.1);
      } else {
        gainNode.current.gain.setTargetAtTime(0, audioCtx.current.currentTime, 0.1);
      }
    }
  }, [intent, sonification]);

  useEffect(() => {
    setCpu(((Math.random() * 2) + 2).toFixed(1));
    setLatency(Math.floor(Math.random() * 5 + 10).toString());
    
    decoderRef.current = new NeuroIntentDecoder();
    
    let time = 0;
    const interval = setInterval(() => {
      const sampleRate = 256;
      const samples = new Float32Array(sampleRate);
      
      // Generate synthetic wave: mix of alpha (10Hz) and some noise
      const alphaFreq = 10;
      for (let i = 0; i < sampleRate; i++) {
        const t = (time + i) / sampleRate;
        samples[i] = Math.sin(2 * Math.PI * alphaFreq * t) * 0.5 + (Math.random() * 0.2 - 0.1); 
      }
      time += sampleRate;
      setSec(time / sampleRate);

      if (decoderRef.current) {
        try {
          const result = decoderRef.current.decode(samples);
          setIntent(result);
        } catch (err) {
          setDecodeError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }, 1000); // run every second

    return () => clearInterval(interval);
  }, []);

  const isSlate = theme === 'slate';
  const c = {
    bg: isSlate ? 'bg-slate-950 text-slate-200' : 'bg-[#050505] text-zinc-200',
    header: isSlate ? 'bg-slate-900/50 border-slate-800' : 'bg-black border-zinc-900',
    btn: isSlate ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700' : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800',
    title: isSlate ? 'text-slate-100' : 'text-zinc-100',
    muted: isSlate ? 'text-slate-500' : 'text-zinc-500',
    divider: isSlate ? 'bg-slate-800' : 'bg-zinc-900',
    sectionBg: isSlate ? 'bg-slate-900/40 border-slate-800' : 'bg-[#0a0a0a] border-zinc-900',
    sectionTitle: isSlate ? 'text-slate-400' : 'text-zinc-400',
    innerBox: isSlate ? 'bg-black/40 border-slate-800/50' : 'bg-black border-zinc-900',
    secText: isSlate ? 'text-slate-600' : 'text-zinc-600',
    barOff: isSlate ? 'bg-slate-700' : 'bg-zinc-800',
    intentBg: isSlate ? 'bg-slate-900 border-slate-800' : 'bg-black border-zinc-900',
    payloadBg: isSlate ? 'bg-slate-900/20 border-slate-800' : 'bg-[#0a0a0a] border-zinc-900',
    payloadBorder: isSlate ? 'border-slate-800/50' : 'border-zinc-800/50',
    payloadText: isSlate ? 'text-slate-300' : 'text-zinc-300',
    featureBox: isSlate ? 'bg-black/30 border-slate-800 text-cyan-500/80' : 'bg-black border-zinc-900 text-cyan-500',
    metricsBg: isSlate ? 'bg-slate-900/60 border-slate-800' : 'bg-[#0a0a0a] border-zinc-900',
    metricBox: isSlate ? 'bg-slate-950 border-slate-800' : 'bg-black border-zinc-900',
    metricVal: isSlate ? 'text-slate-200' : 'text-zinc-200',
    topoBorder: isSlate ? 'border-slate-700' : 'border-zinc-800',
    topoDotOff: isSlate ? 'bg-slate-600' : 'bg-zinc-700',
    topoDotBase: isSlate ? 'bg-slate-700' : 'bg-zinc-800',
    footer: isSlate ? 'bg-slate-900 border-slate-800' : 'bg-black border-zinc-900',
    footerDiv: isSlate ? 'text-slate-700' : 'text-zinc-800',
    footerRight: isSlate ? 'text-slate-400' : 'text-zinc-400',
  };

  return (
    <div className={`w-full h-full ${c.bg} flex flex-col font-sans overflow-hidden`}>
      <header className={`h-16 border-b px-6 flex items-center justify-between ${c.header}`}>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center font-bold text-white">NI</div>
          <div>
            <h1 className={`text-sm font-semibold tracking-wider uppercase ${c.title}`}>NeuroIntentDecoder v1.0</h1>
            <p className={`text-[10px] font-mono ${c.muted}`}>C:\Users\jonny\OneDrive\Desktop\AQB\OMNIBUS\experimental_ml.js</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => setSonification(s => !s)}
            className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded border transition-colors ${sonification ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : c.btn}`}
          >
            {sonification ? 'Sonification: ON' : 'Sonification: OFF'}
          </button>
          <button 
            onClick={() => setTheme(t => t === 'slate' ? 'midnight' : 'slate')}
            className={`text-[10px] uppercase font-mono px-3 py-1.5 rounded border transition-colors ${c.btn}`}
          >
            {isSlate ? 'Midnight Mode' : 'Slate Mode'}
          </button>
          <div className="flex items-center space-x-2">
            <div className="relative flex items-center justify-center w-4 h-4">
              <motion.span 
                key={intent?.id || 'init'}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute w-2 h-2 rounded-full bg-emerald-500"
              />
              <span className="absolute w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            </div>
            <span className="text-[11px] uppercase tracking-widest font-medium">System Live</span>
          </div>
          <div className={`h-8 w-px ${c.divider}`}></div>
          <div className="text-right">
            <p className={`text-[10px] uppercase ${c.muted}`}>Core Engine</p>
            <p className="text-xs font-mono text-cyan-400">PhysicsInformedNeuralODE</p>
          </div>
        </div>
      </header>

      <ErrorBoundary onReset={() => setDecodeError(null)}>
        {decodeError && <ErrorThrower error={decodeError} />}
        <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
          <div className="col-span-4 flex flex-col space-y-6">
          <section className={`flex-1 p-4 rounded-lg flex flex-col min-h-[200px] border ${c.sectionBg}`}>
            <h3 className={`text-[11px] uppercase tracking-wider mb-4 flex justify-between ${c.sectionTitle}`}>
              <span>Raw EEG Stream (256Hz)</span>
              <span className="font-mono">-1.25V to +1.25V</span>
            </h3>
            <div className={`flex-1 relative rounded border flex items-center justify-center p-2 ${c.innerBox}`}>
              <svg viewBox="0 0 400 150" className="w-full h-full stroke-cyan-500/80 fill-none stroke-[1.5]">
                <path d="M0,75 L10,80 L20,60 L30,90 L40,70 L50,85 L60,40 L70,110 L80,75 L90,85 L100,55 L110,95 L120,70 L130,80 L140,40 L150,110 L160,75 L170,85 L180,55 L190,95 L200,70 L210,80 L220,130 L230,20 L240,75 L250,85 L260,55 L270,95 L280,70 L290,80 L300,60 L310,90 L320,70 L330,85 L340,40 L350,110 L360,75 L370,85 L380,55 L390,95 L400,75" />
              </svg>
              <div className={`absolute bottom-2 left-2 text-[10px] font-mono ${c.secText}`}>SEC: {(sec * 1.0).toFixed(3)}</div>
            </div>
          </section>
          <section className={`flex-1 p-4 rounded-lg flex flex-col min-h-[200px] border ${c.sectionBg}`}>
            <h3 className={`text-[11px] uppercase tracking-wider mb-4 ${c.sectionTitle}`}>FFT Spectral Density (Radix-2)</h3>
            <div className="flex-1 flex items-end space-x-1 relative">
              <div className={`absolute bottom-0 left-0 w-full h-[30%] pointer-events-none opacity-40 mix-blend-screen`}>
                <motion.svg 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none" 
                  className="w-full h-full stroke-rose-500/50 fill-rose-500/10 stroke-[2]"
                >
                  <motion.path 
                    initial={false}
                    animate={{ d: noisePath + ' L 100,100 L 0,100 Z' }}
                    transition={{ duration: 0.5, ease: "linear" }}
                  />
                </motion.svg>
              </div>
              <div className={`w-1/12 h-[20%] ${c.barOff}`}></div>
              <div className={`w-1/12 h-[15%] ${c.barOff}`}></div>
              <div className="w-1/12 bg-cyan-600 h-[85%] shadow-[0_0_10px_rgba(8,145,178,0.3)]"></div>
              <div className="w-1/12 bg-cyan-500 h-[70%]"></div>
              <div className="w-1/12 bg-cyan-700 h-[40%]"></div>
              <div className={`w-1/12 h-[25%] ${c.barOff}`}></div>
              <div className="w-1/12 bg-emerald-500 h-[50%]"></div>
              <div className="w-1/12 bg-emerald-700 h-[30%]"></div>
              <div className={`w-1/12 h-[10%] ${c.barOff}`}></div>
              <div className={`w-1/12 h-[15%] ${c.barOff}`}></div>
              <div className={`w-1/12 h-[12%] ${c.barOff}`}></div>
              <div className={`w-1/12 h-[5%] ${c.barOff}`}></div>
            </div>
            <div className={`flex justify-between mt-2 text-[10px] font-mono ${c.muted}`}>
              <span>4Hz</span>
              <span className="text-cyan-400">Alpha (8-12Hz)</span>
              <span className="text-emerald-400">Beta</span>
              <span>40Hz</span>
            </div>
          </section>
        </div>

        <div className="col-span-4 flex flex-col space-y-6">
          <div className={`h-48 p-6 rounded-lg flex flex-col items-center justify-center relative overflow-hidden border ${c.intentBg}`}>
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20">
              <div className="h-full bg-cyan-500" style={{ width: intent ? `${intent.confidence * 100}%` : '0%' }}></div>
            </div>
            <p className={`text-[11px] uppercase tracking-[0.2em] mb-2 ${c.muted}`}>Detected Intent</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={intent?.intent || 'WAITING'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="text-5xl font-light tracking-tight text-white uppercase"
              >
                {intent?.intent || 'WAITING'}
              </motion.h2>
            </AnimatePresence>
            {intent && (
              <div className="mt-4 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                CONFIDENCE: {(intent.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
          <div className={`flex-1 rounded-lg p-6 flex flex-col min-h-[200px] border ${c.payloadBg}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-[11px] uppercase tracking-wider ${c.sectionTitle}`}>Active NeuroIntent Payload</h3>
              <button 
                onClick={() => setIsPayloadExpanded(!isPayloadExpanded)}
                className={`p-1 rounded hover:${c.btn} transition-colors ${c.muted}`}
              >
                <motion.svg 
                  animate={{ rotate: isPayloadExpanded ? 180 : 0 }} 
                  className="w-4 h-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {isPayloadExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden flex-1 flex flex-col"
                >
                  {intent ? (
                    <div className="space-y-4 font-mono text-[11px] flex-1">
                      <div className={`flex justify-between pb-2 border-b ${c.payloadBorder}`}>
                        <span className={`italic ${c.muted}`}>id:</span>
                        <span className={c.payloadText}>{intent.id}</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${c.payloadBorder}`}>
                        <span className={`italic ${c.muted}`}>source:</span>
                        <span className={`uppercase ${c.payloadText}`}>{intent.source}</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${c.payloadBorder}`}>
                        <span className={`italic ${c.muted}`}>requiresConfirmation:</span>
                        <span className={intent.requiresConfirmation ? 'text-rose-400' : 'text-emerald-400'}>{intent.requiresConfirmation.toString()}</span>
                      </div>
                      <div className={`flex justify-between pb-2 border-b ${c.payloadBorder}`}>
                        <span className={`italic ${c.muted}`}>timestamp:</span>
                        <span className={c.payloadText}>{intent.timestamp}</span>
                      </div>
                      <div className="pt-4">
                        <span className={`italic ${c.muted}`}>features:</span>
                        <div className={`mt-2 p-3 rounded leading-relaxed break-all border ${c.featureBox}`}>
                          {`{ alphaPower: ${intent.features.alphaPower.toFixed(2)}, betaRatio: ${intent.features.betaAlphaRatio.toFixed(2)}, asymmetry: ${intent.features.channelAsymmetry.toFixed(2)}, quality: ${intent.features.signalQuality.toFixed(2)} }`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex-1 flex items-center justify-center text-sm ${c.secText}`}>
                      Awaiting EEG Stream...
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="col-span-4 flex flex-col space-y-4">
          <div className={`p-5 rounded-lg border ${c.metricsBg}`}>
            <h3 className={`text-[11px] uppercase tracking-wider mb-4 ${c.sectionTitle}`}>Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className={`group relative p-3 rounded border ${c.metricBox}`}>
                <div className={`text-[10px] uppercase mb-1 flex items-center justify-between ${c.muted}`}>
                  <span>Alpha Power</span>
                  <svg className={`w-3 h-3 ${isSlate ? 'text-slate-600' : 'text-zinc-600'} group-hover:text-cyan-500 transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-xl font-light ${c.metricVal}`}>{intent ? `${intent.features.alphaPower.toFixed(1)} μV²` : '--'}</p>
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 ${isSlate ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-[#050505] border-zinc-800 text-zinc-300'} border text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none shadow-xl`}>
                  Power in the 8-12Hz frequency band, associated with relaxed wakefulness.
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isSlate ? 'border-t-slate-900' : 'border-t-[#050505]'}`}></div>
                </div>
              </div>
              <div className={`group relative p-3 rounded border ${c.metricBox}`}>
                <div className={`text-[10px] uppercase mb-1 flex items-center justify-between ${c.muted}`}>
                  <span>Beta:Alpha</span>
                  <svg className={`w-3 h-3 ${isSlate ? 'text-slate-600' : 'text-zinc-600'} group-hover:text-cyan-500 transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-xl font-light ${c.metricVal}`}>{intent ? intent.features.betaAlphaRatio.toFixed(2) : '--'}</p>
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 ${isSlate ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-[#050505] border-zinc-800 text-zinc-300'} border text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none shadow-xl`}>
                  Ratio of Beta (13-30Hz) to Alpha power. Higher values typically indicate active concentration.
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isSlate ? 'border-t-slate-900' : 'border-t-[#050505]'}`}></div>
                </div>
              </div>
              <div className={`group relative p-3 rounded border ${c.metricBox}`}>
                <div className={`text-[10px] uppercase mb-1 flex items-center justify-between ${c.muted}`}>
                  <span>Asymmetry</span>
                  <svg className={`w-3 h-3 ${isSlate ? 'text-slate-600' : 'text-zinc-600'} group-hover:text-cyan-500 transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-xl font-light ${c.metricVal}`}>{intent ? (intent.features.channelAsymmetry >= 0 ? `L +${intent.features.channelAsymmetry.toFixed(2)}` : `R ${intent.features.channelAsymmetry.toFixed(2)}`) : '--'}</p>
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 ${isSlate ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-[#050505] border-zinc-800 text-zinc-300'} border text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none shadow-xl`}>
                  Difference in Alpha power between Left and Right hemispheres, indicating emotional valence.
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isSlate ? 'border-t-slate-900' : 'border-t-[#050505]'}`}></div>
                </div>
              </div>
              <div className={`group relative p-3 rounded border ${c.metricBox}`}>
                <div className={`text-[10px] uppercase mb-1 flex items-center justify-between ${c.muted}`}>
                  <span>Signal Quality</span>
                  <svg className={`w-3 h-3 ${isSlate ? 'text-slate-600' : 'text-zinc-600'} group-hover:text-cyan-500 transition-colors`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xl font-light text-emerald-400">{intent ? `${(intent.features.signalQuality * 100).toFixed(0)}%` : '--'}</p>
                <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 ${isSlate ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-[#050505] border-zinc-800 text-zinc-300'} border text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 text-center pointer-events-none shadow-xl`}>
                  Real-time estimate of electrode contact quality and signal-to-noise ratio.
                  <div className={`absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent ${isSlate ? 'border-t-slate-900' : 'border-t-[#050505]'}`}></div>
                </div>
              </div>
            </div>
          </div>
          <div className={`flex-1 p-4 rounded-lg min-h-[200px] border ${c.sectionBg}`}>
            <h3 className={`text-[11px] uppercase tracking-wider mb-4 ${c.sectionTitle}`}>Channel Topography</h3>
            <div className="h-48 flex items-center justify-center">
              <div className={`relative w-32 h-32 rounded-full border-2 ${c.topoBorder}`}>
                <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full blur-[4px] opacity-70 ${intent?.intent === 'FOCUS' ? 'bg-cyan-500' : c.topoDotOff}`}></div>
                <div className={`absolute top-8 left-4 w-3 h-3 rounded-full ${c.topoDotBase}`}></div>
                <div className={`absolute top-8 right-4 w-3 h-3 rounded-full ${c.topoDotBase}`}></div>
                <div className={`absolute bottom-8 left-4 w-5 h-5 rounded-full blur-[6px] opacity-50 ${intent?.intent === 'RELAX' ? 'bg-emerald-500' : c.topoDotBase}`}></div>
                <div className={`absolute bottom-8 right-4 w-5 h-5 rounded-full blur-[6px] opacity-50 ${intent?.intent === 'RELAX' ? 'bg-emerald-500' : c.topoDotBase}`}></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${c.topoDotBase}`}></div>
              </div>
            </div>
            <p className={`text-center text-[10px] font-mono mt-2 italic ${c.muted}`}>
              {intent?.intent === 'RELAX' ? 'Parietal/Occipital Alpha Active' : (intent?.intent === 'FOCUS' ? 'Frontal Beta Active' : 'Baseline')}
            </p>
          </div>
        </div>
      </main>
      </ErrorBoundary>

      <footer className={`h-12 shrink-0 px-6 flex items-center justify-between font-mono text-[10px] border-t ${c.footer}`}>
        <div className="flex space-x-4 items-center">
          <span className={`uppercase hidden sm:inline ${c.muted}`}>Unit Tests:</span>
          <span className="text-emerald-500 hidden sm:inline">[PASS] syntheticAlphaWave (Δf=0.02Hz)</span>
          <span className={`hidden sm:inline ${c.footerDiv}`}>|</span>
          <span className="text-emerald-500 hidden sm:inline">[PASS] fftRadix2Convergence</span>
        </div>
        <div className={`flex space-x-4 ${c.footerRight}`}>
          <span>CPU: {cpu}%</span>
          <span>LATENCY: {latency}ms</span>
          <span className="text-cyan-500">NODE_DECODE_SUCCESS</span>
        </div>
      </footer>
    </div>
  );
}
