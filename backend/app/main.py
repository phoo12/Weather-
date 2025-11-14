from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .fetcher import start_fetcher
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

@app.get("/sse")
def get_sse():
    return sse()

@app.get("/")
def home():
    return {"message": "Backend running"}