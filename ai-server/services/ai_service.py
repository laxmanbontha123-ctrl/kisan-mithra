from ultralytics import YOLO

MODEL_PATH = "models/object-detection/yolov8n.pt"

print("Loading YOLO model...")
model = YOLO(MODEL_PATH)
print("YOLO model loaded successfully!")


def predict_image(image_path: str):
    results = model(image_path)

    detections = []

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            detections.append({
                "class": model.names[class_id],
                "confidence": round(confidence, 2)
            })

    return detections
