from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import redis_client
from app.api import auth, game, tasks, referral

app = FastAPI()

origins = [
    "http://localhost:3000",  # Common React port
    "http://localhost:5173",  # Common Vite port
    "*"                       # Allow all (easiest for dev)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Who can call the API
    allow_credentials=True,      # Allow cookies/auth headers
    allow_methods=["*"],         # Allow POST, GET, OPTIONS, PUT, DELETE
    allow_headers=["*"],         # Allow "Content-Type", "Authorization"
)

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(game.router, prefix="/api", tags=["Game"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(referral.router, prefix="/api", tags=["Referral"])

@app.on_event("startup")
async def startup_event():
    try:
        await redis_client.ping()
        print("Connected to Redis")
    except Exception as e:
        print(f"Redis Connection Error: {e}")

@app.get("/")
def root():
    return {"message": "API Running"}
