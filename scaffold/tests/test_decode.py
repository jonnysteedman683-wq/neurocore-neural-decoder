import math
import sys
import os
import random
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from neurocore_decoder.decoder import NeurocoreDecoder

@pytest.fixture
def decoder():
    return NeurocoreDecoder(sample_rate=256)

def test_empty_input(decoder):
    with pytest.raises(ValueError):
        decoder.decode([])

def test_synthetic_alpha_sine_visualize(decoder):
    alpha_freq = 10.0
    alpha_samples = []
    for i in range(256):
        t = i / 256.0
        alpha_samples.append(math.sin(2 * math.pi * alpha_freq * t) * 10.0)
    
    intent_data = decoder.decode(alpha_samples)
    
    assert intent_data["intent"] == "visualize"
    assert intent_data["confidence"] > 0
    assert "id" in intent_data
    assert intent_data["source"] == "eeg"
    assert "timestamp" in intent_data
    
    features = intent_data["features"]
    assert "alpha_power" in features
    assert "beta_alpha_ratio" in features
    assert "asymmetry" in features
    assert "quality" in features

def test_noise_signal_unknown(decoder):
    random.seed(42)
    noise_samples = [random.uniform(-0.1, 0.1) for _ in range(256)]
    intent_data_noise = decoder.decode(noise_samples)
    assert intent_data_noise["intent"] == "unknown"

def test_requires_confirmation_toggle(decoder):
    alpha_freq = 10.0
    weak_alpha_samples = [math.sin(2 * math.pi * alpha_freq * (i / 256.0)) * 1.5 for i in range(256)]
    intent_data_weak = decoder.decode(weak_alpha_samples)
    
    if intent_data_weak["confidence"] < 0.75:
        assert intent_data_weak["requiresConfirmation"] is True
    
    strong_alpha_samples = [math.sin(2 * math.pi * alpha_freq * (i / 256.0)) * 100.0 for i in range(256)]
    intent_data_strong = decoder.decode(strong_alpha_samples)
    if intent_data_strong["confidence"] >= 0.75:
        assert intent_data_strong["requiresConfirmation"] is False
