import json
import os
from functools import lru_cache
from typing import Any

from ultralytics import YOLO

PLANT_DISEASE_MODEL_PATH = "models/plant-disease/model.pt"
LABELS_PATH = "models/plant-disease/labels.json"


def _load_labels() -> dict[int, str]:
    if not os.path.exists(LABELS_PATH):
        return {}

    with open(LABELS_PATH, "r", encoding="utf-8") as file:
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


def _resolve_model_label(model: YOLO, class_id: int) -> str:
    names = getattr(model, "names", {})

    if isinstance(names, dict):
        return str(names.get(class_id, class_id))

    if isinstance(names, list) and 0 <= class_id < len(names):
        return str(names[class_id])

    return str(class_id)


@lru_cache(maxsize=1)
def _load_model() -> YOLO | None:
    if not os.path.exists(PLANT_DISEASE_MODEL_PATH):
        return None

    return YOLO(PLANT_DISEASE_MODEL_PATH)


def predict_plant_disease(image_path: str) -> dict[str, Any]:
    if not os.path.exists(PLANT_DISEASE_MODEL_PATH):
        return {
            "modelReady": False,
            "message": "Plant disease model not found. Please add model.pt to models/plant-disease/",
        }

    model = _load_model()
    if model is None:
        return {
            "modelReady": False,
            "message": "Plant disease model not found. Please add model.pt to models/plant-disease/",
        }

    labels = _load_labels()
    results = model(image_path)

    predictions: list[dict[str, Any]] = []

    for result in results:
        probs = getattr(result, "probs", None)
        if probs is not None:
            top_index = int(probs.top1)
            top_confidence_value = probs.top1conf.item() if hasattr(probs.top1conf, "item") else probs.top1conf
            top_confidence = float(top_confidence_value)
            label = labels.get(top_index, _resolve_model_label(model, top_index))
            predictions.append(
                {
                    "label": label,
                    "classId": top_index,
                    "confidence": round(top_confidence, 4),
                }
            )
            continue

        boxes = getattr(result, "boxes", None)
        if boxes is None:
            continue

        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = labels.get(class_id, _resolve_model_label(model, class_id))
            predictions.append(
                {
                    "label": label,
                    "classId": class_id,
                    "confidence": round(confidence, 4),
                }
            )

    return {
        "modelReady": True,
        "message": "Plant disease prediction completed",
        "predictions": predictions,
    }