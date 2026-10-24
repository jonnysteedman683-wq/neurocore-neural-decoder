
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

## MCP tool

The decoder is also available as an MCP tool, `decode_eeg_intent(samples, sample_rate=256)`, over stdio. Install the optional extra and register it with any MCP client:

```bash
pip install ".[mcp]"
claude mcp add neurocore -- python -m neurocore_decoder.mcp_server
```

The tool validates input: `sample_rate` must be a power of two from 64 to 4096, there must be exactly `sample_rate` samples, and every sample must be a finite number. Results with `requiresConfirmation: true` are low confidence; treat them as proposals for a human to confirm, not commands.
