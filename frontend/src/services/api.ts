const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

type DiseaseRecommendation = {
  crop: string;
  disease: string;
  severity: "low" | "medium" | "high";
  summary: string;
  immediateActions: string[];
  preventionTips: string[];
  advisoryNote: string;
};

type DiseasePrediction = {
  modelReady: boolean;
  prediction?: string;
  confidence?: number;
  recommendation?: DiseaseRecommendation;
  allPredictions?: Array<{ label: string; confidence: number }>;
  message?: string;
};

export type DiseaseDetectResponse = {
  success: boolean;
  message: string;
  aiResponse?: DiseasePrediction;
};

export type WeatherAlert = {
  type: "rain" | "wind" | "heat" | "disease-risk";
  severity: "high" | "medium";
  title: string;
  message: string;
};

export type WeatherAlertsResponse = {
  success: boolean;
  weather: {
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    condition: string;
    rainProbability: number | null;
  };
  alerts: WeatherAlert[];
  message?: string;
};

function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = ["token", "authToken", "accessToken", "jwtToken"];
  for (const key of tokenKeys) {
    const token = window.localStorage.getItem(key);
    if (token) {
      return token;
    }
  }

  return null;
}

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  },

  detectDisease: async (imageFile: File): Promise<DiseaseDetectResponse> => {
    const formData = new FormData();
    formData.append("image", imageFile);

    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}/api/disease/detect`, {
      method: "POST",
      headers,
      body: formData,
    });

    let payload: DiseaseDetectResponse | null = null;
    try {
      payload = (await response.json()) as DiseaseDetectResponse;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(payload?.message || `Disease scan failed with status ${response.status}`);
    }

    if (!payload) {
      throw new Error("Invalid response from disease detection service");
    }

    return payload;
  },

  getWeatherAlerts: async (lat: number, lon: number): Promise<WeatherAlertsResponse> => {
    const response = await api.get<WeatherAlertsResponse>(`/api/weather/alerts?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`);
    return response;
  },
};
