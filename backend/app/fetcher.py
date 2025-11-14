import asyncio
import httpx
import json
import os

CITIES = set()  # Start with empty set
FAVORITES = set()  # Set for favorite cities

FAVORITES_FILE = "favorites.json"

current_data = {}

async def fetch_city_data(city):
    URL = f"https://wttr.in/{city}?format=j1"
    try:
        async with httpx.AsyncClient() as client:
            r = await client.get(URL)
            if r.status_code == 404:
                # City not found
                return {"temperature": None, "humidity": None, "description": None, "windSpeed": None, "pressure": None, "visibility": None}
            data = r.json()
            current = data["current_condition"][0]
            temp = current["temp_C"]
            hum = current["humidity"]
            desc = current["weatherDesc"][0]["value"] if current.get("weatherDesc") else None
            wind = current.get("windspeedKmph")
            press = current.get("pressure")
            vis = current.get("visibility")
            return {"temperature": temp, "humidity": hum, "description": desc, "windSpeed": wind, "pressure": press, "visibility": vis}
    except Exception as e:
        print(f"Error fetching data for {city}: {e}")
        return {"temperature": None, "humidity": None, "description": None, "windSpeed": None, "pressure": None, "visibility": None}

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

def load_favorites():
    global FAVORITES
    if os.path.exists(FAVORITES_FILE):
        try:
            with open(FAVORITES_FILE, 'r') as f:
                favorites_list = json.load(f)
                FAVORITES = set(favorites_list)
        except Exception as e:
            print(f"Error loading favorites: {e}")
            FAVORITES = set()

def save_favorites():
    try:
        with open(FAVORITES_FILE, 'w') as f:
            json.dump(list(FAVORITES), f)
    except Exception as e:
        print(f"Error saving favorites: {e}")

def start_fetcher():
    load_favorites()
    CITIES.update(FAVORITES)  # Load favorites into CITIES on startup
    asyncio.create_task(fetch_loop())

async def add_city_async(city):
    if city not in CITIES:
        # Validate city by attempting to fetch data
        test_data = await fetch_city_data(city)
        if test_data["temperature"] is not None:
            CITIES.add(city)
            current_data[city] = test_data
            return True
    return False

def add_favorite(city):
    if city not in FAVORITES:
        FAVORITES.add(city)
        CITIES.add(city)  # Ensure favorite is in CITIES
        save_favorites()
        return True
    return False

def remove_favorite(city):
    if city in FAVORITES:
        FAVORITES.remove(city)
        if city in CITIES:
            CITIES.remove(city)
            if city in current_data:
                del current_data[city]
        save_favorites()
        return True
    return False

def get_favorites():
    return list(FAVORITES)

def remove_city(city):
    if city in CITIES and city not in FAVORITES:  # Only remove if not a favorite
        CITIES.remove(city)
        if city in current_data:
            del current_data[city]
        return True
    return False

def get_all_cities():
    return list(CITIES)
