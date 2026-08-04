import time
import math
import uuid
from .fft import fft
from .schemas import ALLOWED_FEATURES

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
        
        beta_alpha_ratio = beta_power / alpha_power if alpha_power > 0 else 0.0
        asymmetry = 0.0
        quality = 1.0
        
        noise_power = self.get_band_power(magnitudes, 50, 60)
        if noise_power > (alpha_power + beta_power):
            quality = max(0.0, quality - 0.5)

        alpha_density = alpha_power / 5.0  # 8 to 12 is 5 bins roughly
        beta_density = beta_power / 18.0   # 13 to 30 is 18 bins roughly

        intent = "unknown"
        confidence = 0.0

        if alpha_density > beta_density * 1.5 and alpha_power > 0.1:
            intent = "visualize"
            confidence = min(1.0, alpha_power / 10.0)
        elif beta_density > alpha_density * 1.5 and beta_power > 0.1:
            intent = "focus"
            confidence = min(1.0, beta_power / 10.0)

        requires_confirmation = confidence < 0.75

        features = {
            "alpha_power": alpha_power,
            "beta_alpha_ratio": beta_alpha_ratio,
            "asymmetry": asymmetry,
            "quality": quality
        }

        assert set(features.keys()) == ALLOWED_FEATURES, "Invalid features extracted"

        return {
            "id": str(uuid.uuid4()),
            "source": "eeg",
            "intent": intent,
            "confidence": confidence,
            "features": features,
            "timestamp": int(time.time() * 1000),
            "requiresConfirmation": requires_confirmation
        }

def main():
    print("NeurocoreDecoder module")

if __name__ == "__main__":
    main()
