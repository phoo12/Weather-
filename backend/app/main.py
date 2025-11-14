from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel
from .fetcher import start_fetcher, add_city_async, remove_city, get_all_cities
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
    return {"message": "City already being tracked", "city": request.city}

@app.delete("/cities/{city}")
def remove_city_endpoint(city: str):
    success = remove_city(city)
    if success:
        return {"message": f"Removed {city}"}
    raise HTTPException(status_code=404, detail="City not found")

@app.get("/cities")
def list_cities():
    return {"cities": get_all_cities()}

@app.get("/")
def home():
    return {"message": "Backend running"}
