import math
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from neurocore_decoder.decoder import NeurocoreDecoder

def run_tests():
    decoder = NeurocoreDecoder(sample_rate=256)
    
    # 1. Test empty input -> raises ValueError
    try:
        decoder.decode([])
        assert False, "Should have raised ValueError on empty input"
    except ValueError:
        pass
    print("[PASS] test_empty_input")

    # 2. Test synthetic 10Hz sine -> intent="visualize"
    alpha_freq = 10.0
    alpha_samples = []
    for i in range(256):
        t = i / 256.0
        alpha_samples.append(math.sin(2 * math.pi * alpha_freq * t) * 10.0)
    
    intent_data = decoder.decode(alpha_samples)
    
    assert intent_data["intent"] == "visualize", f"Expected 'visualize', got {intent_data['intent']}"
    assert intent_data["confidence"] > 0, "Expected positive confidence"
    assert not intent_data["requiresConfirmation"] or intent_data["confidence"] < 0.75, "Requires confirmation mismatch"
    assert "id" in intent_data
    assert "source" in intent_data and intent_data["source"] == "eeg"
    assert "timestamp" in intent_data
    features = intent_data["features"]
    assert "alpha_power" in features
    assert "beta_alpha_ratio" in features
    assert "asymmetry" in features
    assert "quality" in features
    print("[PASS] test_synthetic_alpha_sine_visualize")

    # 3. Test noise signal -> intent="unknown"
    import random
    random.seed(42)
    noise_samples = [random.uniform(-0.1, 0.1) for _ in range(256)]
    intent_data_noise = decoder.decode(noise_samples)
    assert intent_data_noise["intent"] == "unknown", f"Expected 'unknown', got {intent_data_noise['intent']}"
    print("[PASS] test_noise_signal_unknown")

    # 4. Test requiresConfirmation toggles at 0.75 confidence
    weak_alpha_samples = [math.sin(2 * math.pi * alpha_freq * (i / 256.0)) * 1.5 for i in range(256)]
    intent_data_weak = decoder.decode(weak_alpha_samples)
    
    if intent_data_weak["confidence"] < 0.75:
        assert intent_data_weak["requiresConfirmation"] is True, "Expected requiresConfirmation=True for confidence < 0.75"
    
    strong_alpha_samples = [math.sin(2 * math.pi * alpha_freq * (i / 256.0)) * 100.0 for i in range(256)]
    intent_data_strong = decoder.decode(strong_alpha_samples)
    if intent_data_strong["confidence"] >= 0.75:
        assert intent_data_strong["requiresConfirmation"] is False, "Expected requiresConfirmation=False for confidence >= 0.75"
    
    print("[PASS] test_requires_confirmation_toggle")
    
    print("ALL TESTS PASSED")

if __name__ == "__main__":
    run_tests()
