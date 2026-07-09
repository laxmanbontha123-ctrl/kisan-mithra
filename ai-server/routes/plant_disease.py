import os
import shutil

from fastapi import APIRouter, File, UploadFile

from services.plant_disease_service import predict_plant_disease

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/predict/plant-disease")
async def predict_plant_disease_route(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return predict_plant_disease(file_path)