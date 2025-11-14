import asyncio
import httpx

CITIES = set()  # Start with empty set

current_data = {}

async def fetch_city_data(city):
    URL = f"https://wttr.in/{city}?format=j1"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(URL)
            data = r.json()
            temp = data["current_condition"][0]["temp_C"]
            hum = data["current_condition"][0]["humidity"]
            return {"temperature": temp, "humidity": hum}
    except Exception as e:
        print(f"Error fetching data for {city}: {e}")
        return {"temperature": None, "humidity": None}

async def fetch_loop():
    global current_data
    while True:
        if CITIES:
            tasks = [fetch_city_data(city) for city in CITIES]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for city, result in zip(CITIES, results):
                if isinstance(result, dict):
                    current_data[city] = result
                else:
                    print(f"Exception for {city}: {result}")
            print("Fetched data for all cities:", current_data)
        await asyncio.sleep(2)  # Reduced from 5 to 2 seconds for faster updates

def start_fetcher():
    asyncio.create_task(fetch_loop())

async def add_city_async(city):
    if city not in CITIES:
        CITIES.add(city)
        current_data[city] = {"temperature": None, "humidity": None}
        return True
    return False

def remove_city(city):
    if city in CITIES:
        CITIES.remove(city)
        if city in current_data:
            del current_data[city]
        return True
    return False

def get_all_cities():
    return list(CITIES)
