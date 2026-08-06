import json
from functools import lru_cache
from pathlib import Path
from typing import Any

import torch
from PIL import Image
from torchvision import models, transforms

from services.treatment_recommendation_service import get_treatment_recommendation

BASE_DIR = Path(__file__).resolve().parents[1]
PLANT_DISEASE_MODEL_PATH = BASE_DIR / "models" / "plant-disease" / "model.pt"
LABELS_PATH = BASE_DIR / "models" / "plant-disease" / "labels.json"

IMAGE_TRANSFORM = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)


def _load_labels() -> dict[int, str]:
    if not LABELS_PATH.exists():
        return {}

    with LABELS_PATH.open("r", encoding="utf-8") as file:
        labels_data = json.load(file)

    if isinstance(labels_data, dict):
        labels: dict[int, str] = {}
        for key, value in labels_data.items():
            try:
                labels[int(key)] = str(value)
            except (TypeError, ValueError):
                continue
        return labels

    if isinstance(labels_data, list):
        return {index: str(label) for index, label in enumerate(labels_data)}

    return {}


def _build_model(num_classes: int) -> torch.nn.Module:
    model = models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, num_classes)
    return model


@lru_cache(maxsize=1)
def _load_model() -> tuple[torch.nn.Module | None, dict[int, str], str | None]:
    if not PLANT_DISEASE_MODEL_PATH.exists():
        return None, {}, "Plant disease model not found. Please add model.pt to models/plant-disease/"

    labels = _load_labels()
    if not labels:
        return None, {}, "Plant disease labels not found. Please add labels.json to models/plant-disease/"

    try:
        model = _build_model(len(labels))
        checkpoint = torch.load(PLANT_DISEASE_MODEL_PATH, map_location="cpu")

        if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]
        else:
            state_dict = checkpoint

        model.load_state_dict(state_dict)
        model.eval()
        return model, labels, None
    except Exception as error:  # pragma: no cover - defensive runtime guard
        return None, {}, f"Failed to load plant disease model: {error}"


def _predict_image(model: torch.nn.Module, image_path: str, labels: dict[int, str]) -> list[dict[str, Any]]:
    with Image.open(image_path) as image:
        processed_image = IMAGE_TRANSFORM(image.convert("RGB")).unsqueeze(0)

    with torch.no_grad():
        logits = model(processed_image)
        probabilities = torch.softmax(logits, dim=1)[0]

    predictions: list[dict[str, Any]] = []
    sorted_indices = torch.argsort(probabilities, descending=True)

    for class_index in sorted_indices.tolist():
        confidence = float(probabilities[class_index].item())
        predictions.append(
            {
                "label": labels.get(class_index, str(class_index)),
                "confidence": round(confidence, 4),
            }
        )

    return predictions


def predict_plant_disease(image_path: str) -> dict[str, Any]:
    model, labels, load_error = _load_model()
    if load_error is not None or model is None:
        return {
            "modelReady": False,
            "message": load_error or "Failed to load plant disease model.",
        }

    try:
        predictions = _predict_image(model, image_path, labels)
        if not predictions:
            return {
                "modelReady": False,
                "message": "Unable to generate plant disease predictions.",
            }

        top_prediction = predictions[0]
        recommendation = get_treatment_recommendation(
            label=str(top_prediction["label"]),
            confidence=float(top_prediction["confidence"]),
        )

        return {
            "modelReady": True,
            "prediction": top_prediction["label"],
            "confidence": top_prediction["confidence"],
            "recommendation": recommendation,
            "allPredictions": predictions,
        }
    except Exception as error:
        return {
            "modelReady": False,
            "message": f"Plant disease prediction failed: {error}",
        }