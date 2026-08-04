import time
import math
import uuid
from .fft import fft

class NeurocoreDecoder:
    def __init__(self, sample_rate: int = 256):
        self.sample_rate = sample_rate

    def get_band_power(self, magnitudes: list[float], start_freq: float, end_freq: float) -> float:
        start_index = int((start_freq * len(magnitudes) * 2) / self.sample_rate)
        end_index = int((end_freq * len(magnitudes) * 2) / self.sample_rate)
        
        start_index = max(0, start_index)
        end_index = min(len(magnitudes) - 1, end_index)
        
        power = 0.0
        for i in range(start_index, end_index + 1):
            power += magnitudes[i] ** 2
        return power

    def decode(self, samples: list[float]) -> dict:
        if not samples:
            raise ValueError("Empty input")
        
        if len(samples) != self.sample_rate:
            raise ValueError(f"Expected {self.sample_rate} samples, got {len(samples)}")

        fft_result = fft(samples)
        n = len(fft_result)
        
        magnitudes = []
        for i in range(n // 2):
            c = fft_result[i]
            mag = math.sqrt(c.real ** 2 + c.imag ** 2) / (n / 2)
            magnitudes.append(mag)

        alpha_power = self.get_band_power(magnitudes, 8, 12)
        beta_power = self.get_band_power(magnitudes, 13, 30)
        noise_floor = self.get_band_power(magnitudes, 0, 4)
        
        beta_alpha_ratio = beta_power / alpha_power if alpha_power > 0 else 0.0
        asymmetry = 0.0
        
        quality = 1.0
        if noise_floor > 5.0:
            quality = 0.0
            
        confidence = float(quality)

        if alpha_power < 10.0:
            intent = "rest"
        elif alpha_power <= 30.0:
            intent = "focus"
        else:
            intent = "deep_focus"

        requires_confirmation = confidence < 0.75

        features = {
            "alpha_power": alpha_power,
            "beta_alpha_ratio": beta_alpha_ratio,
            "asymmetry": asymmetry,
            "quality": quality
        }

        return {
            "id": str(uuid.uuid4()),
            "source": "eeg",
            "intent": intent,
            "confidence": confidence,
            "features": features,
            "timestamp": int(time.time() * 1000),
            "requiresConfirmation": requires_confirmation
        }
