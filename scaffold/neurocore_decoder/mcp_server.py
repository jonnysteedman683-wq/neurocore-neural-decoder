"""MCP server exposing the decoder as a tool, over stdio.

Needs the optional `mcp` extra (the decoder itself stays dependency-free):

    pip install "neurocore-neural-decoder[mcp]"
    neurocore-mcp            # or: python -m neurocore_decoder.mcp_server

Claude Code:  claude mcp add neurocore -- python -m neurocore_decoder.mcp_server
"""
from __future__ import annotations

import math
from typing import Any

from .decoder import NeurocoreDecoder

MAX_SAMPLE_RATE = 4096


def decode_eeg_intent(samples: list[float], sample_rate: int = 256) -> dict[str, Any]:
    """Decode one window of single-channel EEG into an intent (rest / focus / deep_focus).

    samples: exactly `sample_rate` readings (one second of signal).
    sample_rate: Hz; a power of two between 64 and 4096 (the FFT is radix-2).
    Low-confidence results set requiresConfirmation: treat them as proposals, not commands.
    """
    if isinstance(sample_rate, bool) or not isinstance(sample_rate, int):
        raise ValueError("sample_rate must be an integer")
    if not 64 <= sample_rate <= MAX_SAMPLE_RATE or sample_rate & (sample_rate - 1):
        raise ValueError(f"sample_rate must be a power of two between 64 and {MAX_SAMPLE_RATE}")
    if not isinstance(samples, list) or len(samples) != sample_rate:
        raise ValueError(f"Expected exactly {sample_rate} samples")
    values: list[float] = []
    for value in samples:
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            raise ValueError("Samples must be finite numbers")
        values.append(float(value))
    return NeurocoreDecoder(sample_rate=sample_rate).decode(values)


def create_server():
    from mcp.server.fastmcp import FastMCP

    server = FastMCP(
        "neurocore",
        instructions=(
            "EEG intent decoder. Results with requiresConfirmation=true are low confidence "
            "and should be confirmed by a human before acting on them."
        ),
    )
    server.tool()(decode_eeg_intent)
    return server


def main() -> None:
    create_server().run()  # stdio transport


if __name__ == "__main__":
    main()
