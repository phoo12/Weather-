import asyncio
import json
from fastapi.responses import StreamingResponse
from .fetcher import current_data

async def streamer():
    while True:
        # Make a copy to avoid any threading issues
        data_snapshot = dict(current_data)
        yield f"data: {json.dumps(data_snapshot)}\n\n"
        await asyncio.sleep(5)  # Match the fetcher's 5-second interval

def sse():
    return StreamingResponse(
        streamer(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )