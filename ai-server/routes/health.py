from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
        "service": "Kisan Mithra AI Server"
    }