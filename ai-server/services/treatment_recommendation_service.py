from typing import Any


def _severity_from_confidence(confidence: float, base: str = "medium") -> str:
    if base == "low":
        return "low"

    if confidence >= 0.9:
        return "high"
    if confidence >= 0.7:
        return "medium"
    return "low"


def _build_recommendation(
    crop: str,
    disease: str,
    confidence: float,
    summary: str,
    immediate_actions: list[str],
    prevention_tips: list[str],
    base_severity: str = "medium",
) -> dict[str, Any]:
    return {
        "crop": crop,
        "disease": disease,
        "severity": _severity_from_confidence(confidence, base=base_severity),
        "summary": summary,
        "immediateActions": immediate_actions,
        "preventionTips": prevention_tips,
        "advisoryNote": "Consult local agriculture officer for chemical treatment and region-specific guidance.",
    }


def get_treatment_recommendation(label: str, confidence: float) -> dict[str, Any]:
    recommendations: dict[str, dict[str, Any]] = {
        "Pepper__bell___Bacterial_spot": _build_recommendation(
            crop="Pepper (bell)",
            disease="Bacterial spot",
            confidence=confidence,
            summary="Bacterial spot can spread quickly in warm, wet conditions and reduce fruit quality.",
            immediate_actions=[
                "Remove infected leaves and dispose of them away from the field.",
                "Isolate affected plants to limit spread.",
                "Avoid overhead watering and keep foliage dry.",
            ],
            prevention_tips=[
                "Improve airflow with proper spacing and pruning.",
                "Disinfect tools after handling infected plants.",
                "Rotate with non-host crops in the next season.",
            ],
        ),
        "Pepper__bell___healthy": _build_recommendation(
            crop="Pepper (bell)",
            disease="Healthy",
            confidence=confidence,
            summary="The plant appears healthy with no major disease signs detected.",
            immediate_actions=[
                "Continue regular field scouting at least twice a week.",
                "Maintain balanced irrigation and avoid water stress.",
                "Remove any damaged leaves to keep the canopy clean.",
            ],
            prevention_tips=[
                "Avoid overhead watering when possible.",
                "Improve airflow by keeping plants properly spaced.",
                "Keep tools and nursery material clean.",
            ],
            base_severity="low",
        ),
        "Potato___Early_blight": _build_recommendation(
            crop="Potato",
            disease="Early blight",
            confidence=confidence,
            summary="Early blight starts on older leaves and can reduce photosynthesis and tuber yield.",
            immediate_actions=[
                "Remove heavily infected lower leaves.",
                "Avoid overhead watering and wet foliage periods.",
                "Isolate affected rows where practical.",
            ],
            prevention_tips=[
                "Improve airflow through proper plant spacing.",
                "Use crop rotation and remove plant debris after harvest.",
                "Keep soil fertility balanced, especially nitrogen and potassium.",
            ],
        ),
        "Potato___Late_blight": _build_recommendation(
            crop="Potato",
            disease="Late blight",
            confidence=confidence,
            summary="Late blight is aggressive and can spread rapidly under cool, humid weather.",
            immediate_actions=[
                "Remove infected foliage immediately to reduce inoculum.",
                "Isolate affected plants or sections of the field.",
                "Avoid overhead irrigation and long leaf wetness.",
            ],
            prevention_tips=[
                "Improve airflow and reduce canopy humidity.",
                "Scout daily during high-risk weather.",
                "Use clean seed material and sanitize tools.",
            ],
        ),
        "Potato___healthy": _build_recommendation(
            crop="Potato",
            disease="Healthy",
            confidence=confidence,
            summary="No major disease symptoms are detected on the sampled leaf.",
            immediate_actions=[
                "Continue routine monitoring for new symptoms.",
                "Maintain uniform irrigation without waterlogging.",
                "Remove weeds that can restrict airflow.",
            ],
            prevention_tips=[
                "Avoid overhead watering late in the day.",
                "Keep field sanitation high and remove crop debris.",
                "Rotate crops to reduce disease carryover.",
            ],
            base_severity="low",
        ),
        "Tomato_Bacterial_spot": _build_recommendation(
            crop="Tomato",
            disease="Bacterial spot",
            confidence=confidence,
            summary="Bacterial spot causes leaf lesions and can affect fruit marketability.",
            immediate_actions=[
                "Remove infected leaves and destroy them safely.",
                "Isolate affected plants to reduce spread.",
                "Avoid overhead watering to keep leaves dry.",
            ],
            prevention_tips=[
                "Improve airflow through staking and pruning.",
                "Disinfect pruning tools regularly.",
                "Use clean seedlings and avoid working on wet plants.",
            ],
        ),
        "Tomato_Early_blight": _build_recommendation(
            crop="Tomato",
            disease="Early blight",
            confidence=confidence,
            summary="Early blight usually starts on older leaves and can defoliate plants if unmanaged.",
            immediate_actions=[
                "Remove infected leaves, especially near the soil line.",
                "Avoid overhead watering and splash from soil.",
                "Isolate plants with severe symptoms.",
            ],
            prevention_tips=[
                "Improve airflow by pruning lower leaves.",
                "Use mulch to limit soil splash onto foliage.",
                "Rotate crops and clean up residues after harvest.",
            ],
        ),
        "Tomato_Late_blight": _build_recommendation(
            crop="Tomato",
            disease="Late blight",
            confidence=confidence,
            summary="Late blight can escalate quickly and destroy tomato foliage and fruits.",
            immediate_actions=[
                "Remove infected leaves and fruits immediately.",
                "Isolate affected plants from healthy blocks.",
                "Avoid overhead irrigation and prolonged humidity.",
            ],
            prevention_tips=[
                "Improve airflow using support systems and spacing.",
                "Monitor crop daily during cool, wet periods.",
                "Disinfect tools and avoid handling wet plants.",
            ],
        ),
        "Tomato_Leaf_Mold": _build_recommendation(
            crop="Tomato",
            disease="Leaf mold",
            confidence=confidence,
            summary="Leaf mold thrives in humid conditions and can reduce plant vigor.",
            immediate_actions=[
                "Remove infected leaves to lower spore load.",
                "Improve ventilation immediately.",
                "Avoid overhead watering and late-day irrigation.",
            ],
            prevention_tips=[
                "Maintain good airflow and avoid dense canopies.",
                "Water at the root zone early in the day.",
                "Remove crop residues and disinfect greenhouse structures.",
            ],
        ),
        "Tomato_Septoria_leaf_spot": _build_recommendation(
            crop="Tomato",
            disease="Septoria leaf spot",
            confidence=confidence,
            summary="Septoria leaf spot causes heavy lower-leaf loss and can weaken plants over time.",
            immediate_actions=[
                "Remove infected lower leaves and fallen debris.",
                "Isolate severely affected plants.",
                "Avoid overhead watering to reduce spread.",
            ],
            prevention_tips=[
                "Improve airflow with pruning and spacing.",
                "Use mulch to reduce splash dispersal.",
                "Rotate away from solanaceous crops.",
            ],
        ),
        "Tomato_Spider_mites_Two_spotted_spider_mite": _build_recommendation(
            crop="Tomato",
            disease="Two-spotted spider mite",
            confidence=confidence,
            summary="Spider mites multiply rapidly in hot, dry conditions and can cause leaf bronzing.",
            immediate_actions=[
                "Isolate affected plants to slow spread.",
                "Remove heavily infested leaves.",
                "Wash leaf undersides gently with water where feasible.",
            ],
            prevention_tips=[
                "Reduce plant stress through consistent irrigation.",
                "Improve airflow and avoid dusty plant surfaces.",
                "Scout leaf undersides regularly for early detection.",
            ],
        ),
        "Tomato__Target_Spot": _build_recommendation(
            crop="Tomato",
            disease="Target spot",
            confidence=confidence,
            summary="Target spot can spread in humid weather and lower both leaf health and fruit quality.",
            immediate_actions=[
                "Remove infected leaves and affected fruits.",
                "Avoid overhead watering and reduce canopy moisture.",
                "Isolate heavily affected plants when possible.",
            ],
            prevention_tips=[
                "Improve airflow with pruning and spacing.",
                "Sanitize tools and remove crop residues.",
                "Monitor closely during warm and humid periods.",
            ],
        ),
        "Tomato__Tomato_YellowLeaf__Curl_Virus": _build_recommendation(
            crop="Tomato",
            disease="Tomato yellow leaf curl virus",
            confidence=confidence,
            summary="This viral disease can stunt plants and reduce yield significantly.",
            immediate_actions=[
                "Isolate and remove strongly affected plants.",
                "Remove nearby weeds that may host vectors.",
                "Avoid moving tools from infected to healthy plants without cleaning.",
            ],
            prevention_tips=[
                "Control whitefly pressure through integrated pest management.",
                "Use physical barriers like insect netting where practical.",
                "Start with clean seedlings and maintain field hygiene.",
            ],
        ),
        "Tomato__Tomato_mosaic_virus": _build_recommendation(
            crop="Tomato",
            disease="Tomato mosaic virus",
            confidence=confidence,
            summary="Tomato mosaic virus spreads mechanically and can cause mottling and growth reduction.",
            immediate_actions=[
                "Isolate symptomatic plants and remove severely affected ones.",
                "Disinfect hands and tools after plant contact.",
                "Avoid handling plants when leaves are wet.",
            ],
            prevention_tips=[
                "Use clean seed and resistant varieties where available.",
                "Improve airflow and general crop hygiene.",
                "Control weeds that may harbor viral reservoirs.",
            ],
        ),
        "Tomato_healthy": _build_recommendation(
            crop="Tomato",
            disease="Healthy",
            confidence=confidence,
            summary="No major disease signs are detected on this tomato leaf.",
            immediate_actions=[
                "Maintain regular monitoring to catch early changes.",
                "Continue balanced irrigation and nutrition.",
                "Remove damaged or senescent leaves to keep canopy clean.",
            ],
            prevention_tips=[
                "Avoid overhead watering and prolonged leaf wetness.",
                "Improve airflow through pruning, staking, and spacing.",
                "Keep tools clean and field sanitation consistent.",
            ],
            base_severity="low",
        ),
    }

    if label in recommendations:
        return recommendations[label]

    return {
        "crop": "Unknown",
        "disease": label,
        "severity": _severity_from_confidence(confidence),
        "summary": "The predicted condition is not yet mapped to a specific treatment guide.",
        "immediateActions": [
            "Isolate affected plants until diagnosis is confirmed.",
            "Remove visibly infected leaves and dispose safely.",
            "Avoid overhead watering and reduce leaf wetness.",
        ],
        "preventionTips": [
            "Improve airflow with spacing and pruning.",
            "Sanitize tools between plants.",
            "Monitor crop daily and document symptom progression.",
        ],
        "advisoryNote": "Consult local agriculture officer for chemical treatment and region-specific guidance.",
    }