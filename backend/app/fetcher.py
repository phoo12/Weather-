import asyncio
import httpx
from typing import Dict, Set

LOCATION = "Bangkok"
URL = f"https://wttr.in/{LOCATION}?format=j1"

current_data = {"temperature": None, "humidity": None}

async def fetch_loop():
    global current_data
    while True:
        try:
            async with httpx.AsyncClient() as client:
                r = await client.get(URL)
                data = r.json()
                temp = data["current_condition"][0]["temp_C"]
                hum = data["current_condition"][0]["humidity"]
                current_data["temperature"] = temp
                current_data["humidity"] = hum
                print("Fetched:", current_data)
        except Exception as e:
            print(f"Error fetching data: {e}")
        await asyncio.sleep(5)

def start_fetcher():
    asyncio.create_task(fetch_loop())