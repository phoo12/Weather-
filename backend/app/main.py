from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from .fetcher import start_fetcher, add_city_async, remove_city, get_all_cities, add_favorite, remove_favorite, get_favorites
from .sse import sse

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_fetcher()
    yield
    # Shutdown (if needed)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CityRequest(BaseModel):
    city: str

@app.get("/sse")
def get_sse():
    return sse()

@app.post("/cities")
async def add_city_endpoint(request: CityRequest):
    success = await add_city_async(request.city)
    if success:
        return {"message": f"Added {request.city}", "city": request.city}
    elif request.city in get_all_cities():
        return {"message": "City already being tracked", "city": request.city}
    else:
        raise HTTPException(status_code=404, detail="City not found")

@app.delete("/cities/{city}")
def remove_city_endpoint(city: str):
    success = remove_city(city)
    if success:
        return {"message": f"Removed {city}"}
    raise HTTPException(status_code=404, detail="City not found")

@app.get("/cities")
def list_cities():
    return {"cities": get_all_cities()}

@app.get("/favorites")
def list_favorites():
    return {"favorites": get_favorites()}

@app.post("/favorites")
async def add_favorite_endpoint(request: CityRequest):
    success = add_favorite(request.city)
    if success:
        return {"message": f"Added {request.city} to favorites", "city": request.city}
    else:
        return {"message": "City already in favorites", "city": request.city}

@app.delete("/favorites/{city}")
def remove_favorite_endpoint(city: str):
    success = remove_favorite(city)
    if success:
        return {"message": f"Removed {city} from favorites"}
    raise HTTPException(status_code=404, detail="City not in favorites")

@app.get("/")
def home():
    return {"message": "Backend running"}
