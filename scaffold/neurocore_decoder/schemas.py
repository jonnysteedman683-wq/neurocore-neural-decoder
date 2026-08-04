NEURO_INTENT_SCHEMA = {
    "type": "dict",
    "keys": {
        "id": "str",
        "source": "str", # always "eeg"
        "intent": "str",
        "confidence": "float", # 0..1
        "features": "dict",
        "timestamp": "int", # ms
        "requiresConfirmation": "bool"
    }
}

ALLOWED_FEATURES = {'alpha_power', 'beta_alpha_ratio', 'asymmetry', 'quality'}
