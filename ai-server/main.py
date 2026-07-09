from fastapi import FastAPI
from routes.health import router as health_router
from routes.predict import router as predict_router

app = FastAPI(title="Kisan Mithra AI Server")

app.include_router(health_router)
app.include_router(predict_router)

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Kisan Mithra AI Server is running 🚀"
    }