import json
import os
import tempfile
from typing import Any

from firebase_admin import auth, firestore, initialize_app
from firebase_functions import https_fn, options

from services.plant_disease_service import predict_plant_disease


initialize_app()
database = firestore.client()

MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
}
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "3600",
}


def json_response(payload: dict[str, Any], status: int = 200) -> https_fn.Response:
    response = https_fn.Response(
        json.dumps(payload),
        status=status,
        content_type="application/json",
    )

    for header, value in CORS_HEADERS.items():
        response.headers[header] = value

    return response


def verify_request_user(request: https_fn.Request) -> str:
    authorization = request.headers.get("Authorization", "")

    if not authorization.startswith("Bearer "):
        raise ValueError("Authentication required.")

    id_token = authorization[7:].strip()

    if not id_token:
        raise ValueError("Authentication required.")

    decoded_token = auth.verify_id_token(id_token)
    uid = decoded_token.get("uid")

    if not isinstance(uid, str) or not uid:
        raise ValueError("Authenticated farmer was not found.")

    return uid


@https_fn.on_request(
    region="asia-south1",
    memory=options.MemoryOption.GB_2,
    timeout_sec=120,
    max_instances=3,
    concurrency=1,
)
def disease_ai(request: https_fn.Request) -> https_fn.Response:
    if request.method == "OPTIONS":
        response = https_fn.Response("", status=204)
        for header, value in CORS_HEADERS.items():
            response.headers[header] = value
        return response

    if request.method != "POST":
        return json_response(
            {
                "success": False,
                "message": "Only POST requests are allowed.",
            },
            status=405,
        )

    try:
        user_id = verify_request_user(request)
    except Exception:
        return json_response(
            {
                "success": False,
                "message": "Authentication expired. Please login again.",
            },
            status=401,
        )

    uploaded_image = request.files.get("image")

    if uploaded_image is None:
        return json_response(
            {
                "success": False,
                "message": "No image file uploaded.",
            },
            status=400,
        )

    image_type = (uploaded_image.mimetype or "").lower()
    image_suffix = ALLOWED_IMAGE_TYPES.get(image_type)

    if image_suffix is None:
        return json_response(
            {
                "success": False,
                "message": "Only JPG, JPEG, and PNG files are allowed.",
            },
            status=400,
        )

    image_bytes = uploaded_image.read(MAX_IMAGE_SIZE + 1)

    if not image_bytes:
        return json_response(
            {
                "success": False,
                "message": "The uploaded image is empty.",
            },
            status=400,
        )

    if len(image_bytes) > MAX_IMAGE_SIZE:
        return json_response(
            {
                "success": False,
                "message": "File size cannot exceed 10 MB.",
            },
            status=400,
        )

    temporary_path = ""

    try:
        with tempfile.NamedTemporaryFile(
            mode="wb",
            suffix=image_suffix,
            delete=False,
        ) as temporary_file:
            temporary_file.write(image_bytes)
            temporary_path = temporary_file.name

        ai_response = predict_plant_disease(temporary_path)
        payload: dict[str, Any] = {
            "success": True,
            "message": "Disease prediction completed.",
            "aiResponse": ai_response,
        }

        prediction = ai_response.get("prediction")
        confidence = ai_response.get("confidence")

        if (
            ai_response.get("modelReady") is True
            and isinstance(prediction, str)
            and isinstance(confidence, (int, float))
        ):
            recommendation = ai_response.get("recommendation")

            if not isinstance(recommendation, dict):
                recommendation = {}

            scan_reference = database.collection("diseaseScans").document()
            scan_reference.set(
                {
                    "userId": user_id,
                    "prediction": prediction,
                    "confidence": float(confidence),
                    "crop": recommendation.get("crop"),
                    "disease": recommendation.get("disease"),
                    "severity": recommendation.get("severity"),
                    "summary": recommendation.get("summary"),
                    "imageUrl": None,
                    "createdAt": firestore.SERVER_TIMESTAMP,
                }
            )
            payload["scanId"] = scan_reference.id

        return json_response(payload)
    except Exception as error:
        print(f"Disease prediction failed: {error}")
        return json_response(
            {
                "success": False,
                "message": "Disease prediction failed. Please try again.",
            },
            status=500,
        )
    finally:
        if temporary_path:
            try:
                os.remove(temporary_path)
            except OSError:
                pass
