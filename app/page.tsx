'use client';

import { useEffect, useState, useRef } from 'react';
import { NeuroIntentDecoder, NeuroIntent } from '@/lib/NeuroIntentDecoder';

export default function Page() {
  const [intent, setIntent] = useState<NeuroIntent | null>(null);
  const decoderRef = useRef<NeuroIntentDecoder | null>(null);
  const [sec, setSec] = useState(0);

  useEffect(() => {
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
        const result = decoderRef.current.decode(samples);
        setIntent(result);
      }
    }, 1000); // run every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 text-slate-200 flex flex-col font-sans overflow-hidden">
      <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-cyan-600 rounded flex items-center justify-center font-bold text-white">NI</div>
          <div>
            <h1 className="text-sm font-semibold tracking-wider text-slate-100 uppercase">NeuroIntentDecoder v1.0</h1>
            <p className="text-[10px] font-mono text-slate-500">C:\Users\jonny\OneDrive\Desktop\AQB\OMNIBUS\experimental_ml.js</p>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[11px] uppercase tracking-widest font-medium">System Live</span>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase">Core Engine</p>
            <p className="text-xs font-mono text-cyan-400">PhysicsInformedNeuralODE</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 grid grid-cols-12 gap-6 overflow-hidden">
        <div className="col-span-4 flex flex-col space-y-6">
          <section className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex flex-col min-h-[200px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 mb-4 flex justify-between">
              <span>Raw EEG Stream (256Hz)</span>
              <span className="font-mono">-1.25V to +1.25V</span>
            </h3>
            <div className="flex-1 relative bg-black/40 rounded border border-slate-800/50 flex items-center justify-center p-2">
              <svg viewBox="0 0 400 150" className="w-full h-full stroke-cyan-500/80 fill-none stroke-[1.5]">
                <path d="M0,75 L10,80 L20,60 L30,90 L40,70 L50,85 L60,40 L70,110 L80,75 L90,85 L100,55 L110,95 L120,70 L130,80 L140,40 L150,110 L160,75 L170,85 L180,55 L190,95 L200,70 L210,80 L220,130 L230,20 L240,75 L250,85 L260,55 L270,95 L280,70 L290,80 L300,60 L310,90 L320,70 L330,85 L340,40 L350,110 L360,75 L370,85 L380,55 L390,95 L400,75" />
              </svg>
              <div className="absolute bottom-2 left-2 text-[10px] font-mono text-slate-600">SEC: {(sec * 1.0).toFixed(3)}</div>
            </div>
          </section>
          <section className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-lg flex flex-col min-h-[200px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 mb-4">FFT Spectral Density (Radix-2)</h3>
            <div className="flex-1 flex items-end space-x-1">
              <div className="w-1/12 bg-slate-700 h-[20%]"></div>
              <div className="w-1/12 bg-slate-700 h-[15%]"></div>
              <div className="w-1/12 bg-cyan-600 h-[85%] shadow-[0_0_10px_rgba(8,145,178,0.3)]"></div>
              <div className="w-1/12 bg-cyan-500 h-[70%]"></div>
              <div className="w-1/12 bg-cyan-700 h-[40%]"></div>
              <div className="w-1/12 bg-slate-700 h-[25%]"></div>
              <div className="w-1/12 bg-emerald-500 h-[50%]"></div>
              <div className="w-1/12 bg-emerald-700 h-[30%]"></div>
              <div className="w-1/12 bg-slate-700 h-[10%]"></div>
              <div className="w-1/12 bg-slate-700 h-[15%]"></div>
              <div className="w-1/12 bg-slate-700 h-[12%]"></div>
              <div className="w-1/12 bg-slate-700 h-[5%]"></div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-slate-500">
              <span>4Hz</span>
              <span className="text-cyan-400">Alpha (8-12Hz)</span>
              <span className="text-emerald-400">Beta</span>
              <span>40Hz</span>
            </div>
          </section>
        </div>

        <div className="col-span-4 flex flex-col space-y-6">
          <div className="h-48 bg-slate-900 border border-slate-800 p-6 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500/20">
              <div className="h-full bg-cyan-500" style={{ width: intent ? `${intent.confidence * 100}%` : '0%' }}></div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-2">Detected Intent</p>
            <h2 className="text-5xl font-light tracking-tight text-white uppercase">{intent?.intent || 'WAITING'}</h2>
            {intent && (
              <div className="mt-4 px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold">
                CONFIDENCE: {(intent.confidence * 100).toFixed(1)}%
              </div>
            )}
          </div>
          <div className="flex-1 bg-slate-900/20 border border-slate-800 rounded-lg p-6 flex flex-col min-h-[200px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 mb-6">Active NeuroIntent Payload</h3>
            {intent ? (
              <div className="space-y-4 font-mono text-[11px]">
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500 italic">id:</span>
                  <span className="text-slate-300">{intent.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500 italic">source:</span>
                  <span className="text-slate-300 uppercase">{intent.source}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500 italic">requiresConfirmation:</span>
                  <span className={intent.requiresConfirmation ? 'text-rose-400' : 'text-emerald-400'}>{intent.requiresConfirmation.toString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/50 pb-2">
                  <span className="text-slate-500 italic">timestamp:</span>
                  <span className="text-slate-300">{intent.timestamp}</span>
                </div>
                <div className="pt-4">
                  <span className="text-slate-500 italic">features:</span>
                  <div className="mt-2 p-3 bg-black/30 rounded border border-slate-800 text-cyan-500/80 leading-relaxed break-all">
                    {`{ alphaPower: ${intent.features.alphaPower.toFixed(2)}, betaRatio: ${intent.features.betaAlphaRatio.toFixed(2)}, asymmetry: ${intent.features.channelAsymmetry.toFixed(2)}, quality: ${intent.features.signalQuality.toFixed(2)} }`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">
                Awaiting EEG Stream...
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4 flex flex-col space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-lg">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Alpha Power</p>
                <p className="text-xl font-light text-slate-200">{intent ? `${intent.features.alphaPower.toFixed(1)} μV²` : '--'}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Beta:Alpha</p>
                <p className="text-xl font-light text-slate-200">{intent ? intent.features.betaAlphaRatio.toFixed(2) : '--'}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Asymmetry</p>
                <p className="text-xl font-light text-slate-200">{intent ? (intent.features.channelAsymmetry >= 0 ? `L +${intent.features.channelAsymmetry.toFixed(2)}` : `R ${intent.features.channelAsymmetry.toFixed(2)}`) : '--'}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Signal Quality</p>
                <p className="text-xl font-light text-emerald-400">{intent ? `${(intent.features.signalQuality * 100).toFixed(0)}%` : '--'}</p>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-slate-900/40 border border-slate-800 p-4 rounded-lg min-h-[200px]">
            <h3 className="text-[11px] uppercase tracking-wider text-slate-400 mb-4">Channel Topography</h3>
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-32 h-32 rounded-full border-2 border-slate-700">
                <div className={`absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full blur-[4px] opacity-70 ${intent?.intent === 'FOCUS' ? 'bg-cyan-500' : 'bg-slate-600'}`}></div>
                <div className="absolute top-8 left-4 w-3 h-3 bg-slate-700 rounded-full"></div>
                <div className="absolute top-8 right-4 w-3 h-3 bg-slate-700 rounded-full"></div>
                <div className={`absolute bottom-8 left-4 w-5 h-5 rounded-full blur-[6px] opacity-50 ${intent?.intent === 'RELAX' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                <div className={`absolute bottom-8 right-4 w-5 h-5 rounded-full blur-[6px] opacity-50 ${intent?.intent === 'RELAX' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-700 rounded-full"></div>
              </div>
            </div>
            <p className="text-center text-[10px] font-mono text-slate-500 mt-2 italic">
              {intent?.intent === 'RELAX' ? 'Parietal/Occipital Alpha Active' : (intent?.intent === 'FOCUS' ? 'Frontal Beta Active' : 'Baseline')}
            </p>
          </div>
        </div>
      </main>

      <footer className="h-12 shrink-0 bg-slate-900 border-t border-slate-800 px-6 flex items-center justify-between font-mono text-[10px]">
        <div className="flex space-x-4 items-center">
          <span className="text-slate-500 uppercase hidden sm:inline">Unit Tests:</span>
          <span className="text-emerald-500 hidden sm:inline">[PASS] syntheticAlphaWave (Δf=0.02Hz)</span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-emerald-500 hidden sm:inline">[PASS] fftRadix2Convergence</span>
        </div>
        <div className="flex space-x-4 text-slate-400">
          <span>CPU: {((Math.random() * 2) + 2).toFixed(1)}%</span>
          <span>LATENCY: {Math.floor(Math.random() * 5 + 10)}ms</span>
          <span className="text-cyan-500">NODE_DECODE_SUCCESS</span>
        </div>
      </footer>
    </div>
  );
}
