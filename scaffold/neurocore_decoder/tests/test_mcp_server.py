import asyncio
import math
import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from neurocore_decoder.mcp_server import decode_eeg_intent


def sine(freq, amplitude, rate=256):
    return [math.sin(2 * math.pi * freq * (i / rate)) * amplitude for i in range(rate)]


def test_decodes_valid_window():
    res = decode_eeg_intent([0.0] * 256)
    assert res["intent"] == "rest"
    assert res["source"] == "eeg"


@pytest.mark.parametrize("samples,rate", [
    ([0.0] * 10, 256),
    ([0.0] * 100, 100),
    ([0.0] * 32, 32),
    ([0.0] * 8192, 8192),
    ([float("nan")] + [0.0] * 255, 256),
    ([float("inf")] + [0.0] * 255, 256),
    (["1"] + [0.0] * 255, 256),
    ([True] + [0.0] * 255, 256),
])
def test_rejects_bad_input(samples, rate):
    with pytest.raises(ValueError):
        decode_eeg_intent(samples, rate)


def test_tool_is_registered_and_callable():
    pytest.importorskip("mcp", reason="the MCP server is an optional extra")
    from neurocore_decoder.mcp_server import create_server

    server = create_server()
    names = {tool.name for tool in server._tool_manager.list_tools()}
    assert names == {"decode_eeg_intent"}
    res = asyncio.run(server._tool_manager.call_tool("decode_eeg_intent", {"samples": sine(10.0, 5.0)}))
    assert res["intent"] in {"rest", "focus", "deep_focus"}


def test_stdio_round_trip():
    pytest.importorskip("mcp", reason="the MCP server is an optional extra")
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

    scaffold = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
    params = StdioServerParameters(
        command=sys.executable, args=["-m", "neurocore_decoder.mcp_server"],
        env={**os.environ, "PYTHONPATH": scaffold},
    )

    async def run():
        async with stdio_client(params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                ok = await session.call_tool("decode_eeg_intent", {"samples": [0.0] * 256})
                bad = await session.call_tool("decode_eeg_intent", {"samples": [0.0] * 5})
                return ok, bad

    ok, bad = asyncio.run(run())
    assert not ok.isError and ok.structuredContent["intent"] == "rest"
    assert bad.isError and "Expected exactly 256 samples" in bad.content[0].text
