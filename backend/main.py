from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router  # Make sure this import points to your routers.py file

app = FastAPI()

# 1. SETUP CORS (Crucial for React -> FastAPI communication)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INCLUDE ROUTER WITH PREFIX
# This lines maps @router.post("/auth") -> http://localhost:8000/api/auth
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Tap Bot API is running!"}
