export interface NeuroIntentFeatures {
  alphaPower: number;
  betaAlphaRatio: number;
  channelAsymmetry: number;
  signalQuality: number;
}

export interface NeuroIntent {
  id: string;
  source: 'eeg';
  intent: string;
  confidence: number;
  features: NeuroIntentFeatures;
  timestamp: number;
  requiresConfirmation: boolean;
}

export class NeuroIntentDecoder {
  private sampleRate: number = 256;

  public decode(samples: Float32Array): NeuroIntent {
    if (samples.length !== 256) {
      throw new Error("Expected 256 samples for 1 second of EEG data at 256Hz");
    }

    const n = samples.length;
    const real = new Float32Array(samples);
    const imag = new Float32Array(n);

    this.radix2Fft(real, imag);

    const magnitudes = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / (n / 2);
    }

    const alphaPower = this.getBandPower(magnitudes, 8, 12);
    const betaPower = this.getBandPower(magnitudes, 13, 30);
    const betaAlphaRatio = alphaPower > 0 ? betaPower / alphaPower : 0;
    
    // Simulated asymmetry for a single-channel input
    const channelAsymmetry = 0.0;
    
    // Signal quality penalizes 50/60Hz noise
    let signalQuality = 1.0;
    const noisePower = this.getBandPower(magnitudes, 50, 60);
    if (noisePower > (alphaPower + betaPower)) {
      signalQuality = Math.max(0, signalQuality - 0.5);
    }

    let intent = "UNKNOWN";
    let confidence = 0;

    if (alphaPower > betaPower * 1.5) {
      intent = "RELAX";
      confidence = Math.min(1.0, alphaPower / 10);
    } else if (betaPower > alphaPower * 1.5) {
      intent = "FOCUS";
      confidence = Math.min(1.0, betaPower / 10);
    }

    return {
      id: Math.random().toString(36).substring(2, 9),
      source: 'eeg',
      intent,
      confidence,
      features: {
        alphaPower,
        betaAlphaRatio,
        channelAsymmetry,
        signalQuality
      },
      timestamp: Date.now(),
      requiresConfirmation: confidence < 0.75
    };
  }

  private getBandPower(magnitudes: Float32Array, startFreq: number, endFreq: number): number {
    const startIndex = Math.floor((startFreq * magnitudes.length * 2) / this.sampleRate);
    const endIndex = Math.floor((endFreq * magnitudes.length * 2) / this.sampleRate);
    
    let power = 0;
    for (let i = Math.max(0, startIndex); i <= Math.min(magnitudes.length - 1, endIndex); i++) {
      power += magnitudes[i] * magnitudes[i];
    }
    return power;
  }

  private radix2Fft(real: Float32Array, imag: Float32Array): void {
    const n = real.length;
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        const tempReal = real[i];
        const tempImag = imag[i];
        real[i] = real[j];
        imag[i] = imag[j];
        real[j] = tempReal;
        imag[j] = tempImag;
      }
      let k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }

    for (let size = 2; size <= n; size <<= 1) {
      const halfSize = size >> 1;
      const angleStep = -Math.PI / halfSize;
      for (let i = 0; i < n; i += size) {
        let wReal = 1;
        let wImag = 0;
        const wRealStep = Math.cos(angleStep);
        const wImagStep = Math.sin(angleStep);
        for (let j = 0; j < halfSize; j++) {
          const match = i + j + halfSize;
          const tReal = wReal * real[match] - wImag * imag[match];
          const tImag = wReal * imag[match] + wImag * real[match];
          real[match] = real[i + j] - tReal;
          imag[match] = imag[i + j] - tImag;
          real[i + j] += tReal;
          imag[i + j] += tImag;
          
          const nextWReal = wReal * wRealStep - wImag * wImagStep;
          const nextWImag = wReal * wImagStep + wImag * wRealStep;
          wReal = nextWReal;
          wImag = nextWImag;
        }
      }
    }
  }
}

export function testNeuroIntentDecoder(): void {
  const sampleRate = 256;
  const samples = new Float32Array(sampleRate);
  const alphaFreq = 10;
  
  for (let i = 0; i < sampleRate; i++) {
    const t = i / sampleRate;
    samples[i] = Math.sin(2 * Math.PI * alphaFreq * t) + (Math.random() * 0.1); 
  }

  const decoder = new NeuroIntentDecoder();
  const intent = decoder.decode(samples);

  if (intent.features.alphaPower <= 0) {
    throw new Error("Test failed: Alpha power must be > 0");
  }
  if (intent.features.betaAlphaRatio >= 1) {
    throw new Error("Test failed: Beta/Alpha ratio must be < 1");
  }
  if (intent.intent !== "RELAX") {
    throw new Error("Test failed: Expected intent to be RELAX");
  }
}
