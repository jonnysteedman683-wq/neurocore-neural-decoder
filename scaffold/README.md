# Neurocore Neural Decoder

A pure-Python EEG neural intent decoder based on a radix-2 FFT implementation.

## Usage

```python
from neurocore_decoder.decoder import NeurocoreDecoder

decoder = NeurocoreDecoder(sample_rate=256)

# Provide exactly 256 samples (1 second at 256Hz)
samples = [0.0] * 256 
intent_data = decoder.decode(samples)

print(intent_data)
# {
#   "id": "...",
#   "source": "eeg",
#   "intent": "rest",
#   "confidence": 1.0,
#   "features": { "alpha_power": 0.0, "beta_alpha_ratio": 0.0, "asymmetry": 0.0, "quality": 1.0 },
#   "timestamp": 1234567890123,
#   "requiresConfirmation": False
# }
```
