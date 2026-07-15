export interface AppUser {
  id: string;
  name: string;
  email: string;
}

export interface DiseaseRecommendation {
  crop: string;
  disease: string;
  severity: "low" | "medium" | "high";
  summary: string;
  immediateActions: string[];
  preventionTips: string[];
  treatmentCategory?: string;
  suggestedProducts?: string[];
  dosageGuide?: string[];
  applicationTiming?: string[];
  safetyPrecautions?: string[];
  organicOptions?: string[];
  advisoryNote: string;
}

export interface DiseasePrediction {
  label: string;
  confidence: number;
}

export interface DiseaseAiResponse {
  modelReady: boolean;
  prediction?: string;
  confidence?: number;
  recommendation?: DiseaseRecommendation;
  allPredictions?: DiseasePrediction[];
  message?: string;
}

export interface DiseaseDetectApiResponse {
  success: boolean;
  message: string;
  aiResponse: DiseaseAiResponse;
}
