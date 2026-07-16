const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000";

type DiseaseRecommendation = {
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

export type WeatherForecastHour = {
  time: string;
  temperature: number | null;
  humidity: number | null;
  rainProbability: number | null;
  windSpeed: number | null;
};

export type WeatherForecastResponse = {
  success: boolean;
  forecast: WeatherForecastHour[];
  advisory: string;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  language: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLoginAt?: string | null;
};

export type AuthResponse = {
  success: boolean;
  message: string;
  token: string;
  user: AuthUser;
};

export type ProfileResponse = {
  success: boolean;
  user: AuthUser;
};

export type PhoneOtpResponse = {
  success: boolean;
  message: string;
  expiresInMinutes: number;
  devOtp?: string;
};

export type Crop = {
  id: string;
  cropName: string;
  cropVariety: string;
  landArea: number;
  soilType: string;
  irrigationMethod: string;
  location: string;
  latitude: number;
  longitude: number;
  sowingDate: string;
  expectedHarvestDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

export type CreateCropInput = {
  cropName: string;
  cropVariety: string;
  landArea: number;
  soilType: string;
  irrigationMethod: string;
  location: string;
  latitude: number;
  longitude: number;
  sowingDate: string;
  expectedHarvestDate?: string | null;
};

export type CropResponse = {
  success: boolean;
  message: string;
  data: Crop;
};

export type CropsResponse = {
  success: boolean;
  message: string;
  data: Crop[];
};

export type AgriProductRecommendation = {
  id: string;
  brandName: string;
  productName: string;
  category: string;
  crop: string;
  targetProblem: string;
  targetType: string;
  productPurpose: string;
  activeIngredient: string | null;
  formulation: string | null;
  dosageNote: string;
  safetyNote: string;
  organic: boolean;
  isVerified: boolean;
  shops: Array<{
    shopProductId: string;
    approximatePrice: number | null;
    priceUnit: string | null;
    availabilityStatus: string;
    lastVerifiedAt: string | null;
    shop: {
      id: string;
      name: string;
      phone: string | null;
      address: string;
      district: string;
      state: string;
      latitude: number;
      longitude: number;
      isVerified: boolean;
      mapsUrl: string;
    };
  }>;
};

export type AgriProductRecommendationsResponse = {
  success: boolean;
  message: string;
  data: AgriProductRecommendation[];
  disclaimer: string;
};

export type NearbyAgriShop = {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  rating: number | null;
  businessStatus: string | null;
  latitude: number;
  longitude: number;
  mapsUrl: string;
};

export type NearbyAgriShopsResponse = {
  success: boolean;
  configured: boolean;
  message: string;
  data: NearbyAgriShop[];
  disclaimer?: string;
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

function getJsonHeaders(): HeadersInit {
  const token = getAuthToken();

  return token
    ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    : { "Content-Type": "application/json" };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}

export const api = {
  get: async <T>(url: string): Promise<T> => {
    const token = getAuthToken();
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers,
    });

    return parseJsonResponse<T>(response);
  },

  register: async (input: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseJsonResponse<AuthResponse>(response);
  },

  login: async (input: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseJsonResponse<AuthResponse>(response);
  },

  requestPhoneOtp: async (input: { phone: string }): Promise<PhoneOtpResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/phone/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseJsonResponse<PhoneOtpResponse>(response);
  },

  verifyPhoneOtp: async (input: { phone: string; code: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/phone/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    return parseJsonResponse<AuthResponse>(response);
  },

  getProfile: async (): Promise<ProfileResponse> => {
    return api.get<ProfileResponse>("/api/auth/profile");
  },

  getCrops: async (): Promise<CropsResponse> => {
    return api.get<CropsResponse>("/api/crops");
  },

  createCrop: async (input: CreateCropInput): Promise<CropResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/crops`, {
      method: "POST",
      headers: getJsonHeaders(),
      body: JSON.stringify(input),
    });

    return parseJsonResponse<CropResponse>(response);
  },

  updateCrop: async (cropId: string, input: Partial<CreateCropInput>): Promise<CropResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/crops/${cropId}`, {
      method: "PUT",
      headers: getJsonHeaders(),
      body: JSON.stringify(input),
    });

    return parseJsonResponse<CropResponse>(response);
  },

  deleteCrop: async (cropId: string): Promise<{ success: boolean; message: string; data: null }> => {
    const response = await fetch(`${API_BASE_URL}/api/crops/${cropId}`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    });

    return parseJsonResponse<{ success: boolean; message: string; data: null }>(response);
  },



  getNearbyAgriShops: async (
    lat: number,
    lon: number,
  ): Promise<NearbyAgriShopsResponse> => {
    return api.get<NearbyAgriShopsResponse>(
      `/api/agri-shops/nearby?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    );
  },

  getAgriProductRecommendations: async (
    crop: string,
    problem: string,
  ): Promise<AgriProductRecommendationsResponse> => {
    return api.get<AgriProductRecommendationsResponse>(
      `/api/agri-products/recommendations?crop=${encodeURIComponent(crop)}&problem=${encodeURIComponent(problem)}`,
    );
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

    return parseJsonResponse<DiseaseDetectResponse>(response);
  },

  getWeatherAlerts: async (lat: number, lon: number): Promise<WeatherAlertsResponse> => {
    return api.get<WeatherAlertsResponse>(
      `/api/weather/alerts?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    );
  },

  getWeatherForecast: async (lat: number, lon: number): Promise<WeatherForecastResponse> => {
    return api.get<WeatherForecastResponse>(
      `/api/weather/forecast?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`,
    );
  },
};
