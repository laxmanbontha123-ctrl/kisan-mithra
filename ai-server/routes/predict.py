from fastapi import APIRouter, UploadFile, File
import os
import shutil
from services.ai_service import predict_image

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    detections = predict_image(file_path)

    return {
        "success": True,
        "message": "Prediction completed",
        "detections": detections
    }