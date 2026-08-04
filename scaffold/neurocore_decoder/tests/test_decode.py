import math
import sys
import os
import random
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from neurocore_decoder.decoder import NeurocoreDecoder

@pytest.fixture
def decoder():
    return NeurocoreDecoder(sample_rate=256)

def test_invalid_input(decoder):
    with pytest.raises(ValueError):
        decoder.decode([])
    with pytest.raises(ValueError):
        decoder.decode([0.0]*10)

def test_intent_rest(decoder):
    samples = [0.0] * 256
    res = decoder.decode(samples)
    assert res["intent"] == "rest"
    assert res["confidence"] == 1.0
    assert not res["requiresConfirmation"]

def test_intent_focus(decoder):
    samples = [math.sin(2 * math.pi * 10.0 * (i / 256.0)) * 5.0 for i in range(256)]
    res = decoder.decode(samples)
    assert res["intent"] == "focus"
    assert res["confidence"] == 1.0
    assert res["features"]["alpha_power"] >= 10.0
    assert res["features"]["alpha_power"] <= 30.0

def test_intent_deep_focus(decoder):
    samples = [math.sin(2 * math.pi * 10.0 * (i / 256.0)) * 10.0 for i in range(256)]
    res = decoder.decode(samples)
    assert res["intent"] == "deep_focus"
    assert res["confidence"] == 1.0
    assert res["features"]["alpha_power"] > 30.0

def test_noise_floor_zero_confidence(decoder):
    samples = [math.sin(2 * math.pi * 2.0 * (i / 256.0)) * 10.0 for i in range(256)]
    res = decoder.decode(samples)
    assert res["confidence"] == 0.0
    assert res["requiresConfirmation"] is True
