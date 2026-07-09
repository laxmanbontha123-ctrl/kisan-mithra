from fastapi import FastAPI
from routes.health import router as health_router
from routes.predict import router as predict_router
from routes.plant_disease import router as plant_disease_router

app = FastAPI(title="Kisan Mithra AI Server")

app.include_router(health_router)
app.include_router(predict_router)
app.include_router(plant_disease_router)

@app.get("/")
def home():
    return {
        "success": True,
        "message": "Kisan Mithra AI Server is running 🚀"
    }