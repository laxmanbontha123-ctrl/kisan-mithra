import express, {Request, Response} from "express";
import {Auth, DecodedIdToken} from "firebase-admin/auth";
import * as logger from "firebase-functions/logger";

interface CurrentWeatherData {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  condition: string;
  rainProbability: number | null;
}

interface WeatherAlert {
  type: "rain" | "wind" | "heat" | "disease-risk";
  severity: "high" | "medium";
  title: string;
  message: string;
}

interface ForecastHour {
  time: string;
  temperature: number | null;
  humidity: number | null;
  rainProbability: number | null;
  windSpeed: number | null;
}

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    precipitation_probability?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
    relative_humidity_2m?: Array<number | null>;
    precipitation_probability?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
  };
}

const weatherConditionMap: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

/**
 * Returns a Firebase bearer token from a request.
 *
 * @param {Request} request Express request.
 * @return {string} Firebase ID token or an empty string.
 */
function getBearerToken(request: Request): string {
  const authorization = request.headers.authorization;

  if (
    typeof authorization !== "string" ||
    !authorization.startsWith("Bearer ")
  ) {
    return "";
  }

  return authorization.slice(7).trim();
}

/**
 * Authenticates a Weather API request.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {Promise<DecodedIdToken|null>} Decoded Firebase token.
 */
async function authenticateRequest(
  request: Request,
  response: Response,
  adminAuth: Auth,
): Promise<DecodedIdToken | null> {
  const idToken = getBearerToken(request);

  if (!idToken) {
    response.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return null;
  }

  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    logger.warn("Weather authentication failed.", error);
    response.status(401).json({
      success: false,
      message: "Authentication expired. Please login again.",
    });
    return null;
  }
}

/**
 * Parses and validates latitude and longitude query parameters.
 *
 * @param {Request} request Express request.
 * @param {Response} response Express response.
 * @return {{latitude:number, longitude:number}|null} Coordinates.
 */
function parseCoordinates(
  request: Request,
  response: Response,
): {latitude: number; longitude: number} | null {
  const latValue = request.query.lat;
  const lonValue = request.query.lon;

  if (typeof latValue !== "string" || typeof lonValue !== "string") {
    response.status(400).json({
      success: false,
      message: "Latitude and longitude are required.",
    });
    return null;
  }

  const latitude = Number(latValue);
  const longitude = Number(lonValue);

  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90
  ) {
    response.status(400).json({
      success: false,
      message: "Latitude must be between -90 and 90.",
    });
    return null;
  }

  if (
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    response.status(400).json({
      success: false,
      message: "Longitude must be between -180 and 180.",
    });
    return null;
  }

  return {latitude, longitude};
}

/**
 * Fetches forecast data from Open-Meteo with a timeout.
 *
 * @param {Record<string,string>} parameters Open-Meteo query parameters.
 * @return {Promise<OpenMeteoResponse>} Open-Meteo response data.
 */
async function fetchOpenMeteo(
  parameters: Record<string, string>,
): Promise<OpenMeteoResponse> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  for (const [key, value] of Object.entries(parameters)) {
    url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const apiResponse = await fetch(url, {signal: controller.signal});

    if (!apiResponse.ok) {
      throw new Error(`Open-Meteo returned HTTP ${apiResponse.status}.`);
    }

    return await apiResponse.json() as OpenMeteoResponse;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetches and normalizes current weather data.
 *
 * @param {number} latitude Latitude.
 * @param {number} longitude Longitude.
 * @return {Promise<CurrentWeatherData>} Current weather.
 */
async function fetchCurrentWeather(
  latitude: number,
  longitude: number,
): Promise<CurrentWeatherData> {
  const data = await fetchOpenMeteo({
    latitude: String(latitude),
    longitude: String(longitude),
    current:
      "temperature_2m,relative_humidity_2m,wind_speed_10m," +
      "weather_code,precipitation_probability",
    timezone: "auto",
  });

  const current = data.current;
  const weatherCode =
    typeof current?.weather_code === "number" ? current.weather_code : null;

  return {
    temperature:
      typeof current?.temperature_2m === "number" ?
        current.temperature_2m :
        null,
    humidity:
      typeof current?.relative_humidity_2m === "number" ?
        current.relative_humidity_2m :
        null,
    windSpeed:
      typeof current?.wind_speed_10m === "number" ?
        current.wind_speed_10m :
        null,
    weatherCode,
    condition:
      weatherCode !== null ?
        weatherConditionMap[weatherCode] ?? "Unknown condition" :
        "Unknown condition",
    rainProbability:
      typeof current?.precipitation_probability === "number" ?
        current.precipitation_probability :
        null,
  };
}

/**
 * Builds farmer-focused alerts from current weather.
 *
 * @param {CurrentWeatherData} weather Current weather data.
 * @return {WeatherAlert[]} Weather alerts.
 */
function buildAlerts(weather: CurrentWeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (weather.rainProbability !== null && weather.rainProbability >= 70) {
    alerts.push({
      type: "rain",
      severity: "high",
      title: "Heavy rain chance",
      message:
        "High rain probability. Avoid pesticide spraying and check " +
        "field drainage.",
    });
  }

  if (weather.windSpeed !== null && weather.windSpeed >= 30) {
    alerts.push({
      type: "wind",
      severity: "medium",
      title: "Strong wind",
      message:
        "Strong winds expected. Avoid spraying and protect young plants.",
    });
  }

  if (weather.temperature !== null && weather.temperature >= 38) {
    alerts.push({
      type: "heat",
      severity: "high",
      title: "High temperature",
      message:
        "High heat may stress crops. Irrigate carefully during cooler hours.",
    });
  }

  if (weather.humidity !== null && weather.humidity >= 85) {
    alerts.push({
      type: "disease-risk",
      severity: "medium",
      title: "Disease risk",
      message:
        "High humidity can increase fungal and bacterial disease risk. " +
        "Monitor crop leaves.",
    });
  }

  return alerts;
}

/**
 * Registers authenticated Weather API routes.
 *
 * @param {express.Express} app Express application.
 * @param {Auth} adminAuth Firebase Admin Auth client.
 * @return {void}
 */
export function registerWeatherRoutes(
  app: express.Express,
  adminAuth: Auth,
): void {
  app.get(
    "/api/weather/current",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );
      const coordinates = parseCoordinates(request, response);

      if (!decodedToken || !coordinates) {
        return;
      }

      try {
        const weather = await fetchCurrentWeather(
          coordinates.latitude,
          coordinates.longitude,
        );
        response.status(200).json({success: true, data: weather});
      } catch (error) {
        logger.error("Fetching current weather failed.", error);
        response.status(502).json({
          success: false,
          message: "Unable to fetch current weather.",
        });
      }
    },
  );

  app.get(
    "/api/weather/alerts",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );
      const coordinates = parseCoordinates(request, response);

      if (!decodedToken || !coordinates) {
        return;
      }

      try {
        const weather = await fetchCurrentWeather(
          coordinates.latitude,
          coordinates.longitude,
        );
        const alerts = buildAlerts(weather);

        response.status(200).json({
          success: true,
          weather: {
            temperature: weather.temperature,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed,
            condition: weather.condition,
            rainProbability: weather.rainProbability,
          },
          alerts,
          ...(alerts.length === 0 ?
            {message: "No major weather alerts right now."} :
            {}),
        });
      } catch (error) {
        logger.error("Fetching weather alerts failed.", error);
        response.status(502).json({
          success: false,
          message: "Unable to fetch weather alerts.",
        });
      }
    },
  );

  app.get(
    "/api/weather/forecast",
    async (request: Request, response: Response): Promise<void> => {
      const decodedToken = await authenticateRequest(
        request,
        response,
        adminAuth,
      );
      const coordinates = parseCoordinates(request, response);

      if (!decodedToken || !coordinates) {
        return;
      }

      try {
        const data = await fetchOpenMeteo({
          latitude: String(coordinates.latitude),
          longitude: String(coordinates.longitude),
          hourly:
            "temperature_2m,relative_humidity_2m,wind_speed_10m," +
            "precipitation_probability",
          forecast_hours: "24",
          timezone: "auto",
        });

        const hourly = data.hourly;
        const times = hourly?.time ?? [];
        const temperatures = hourly?.temperature_2m ?? [];
        const humidities = hourly?.relative_humidity_2m ?? [];
        const rainProbabilities = hourly?.precipitation_probability ?? [];
        const windSpeeds = hourly?.wind_speed_10m ?? [];
        const forecast: ForecastHour[] = times
          .slice(0, 24)
          .map((time, index) => ({
            time,
            temperature:
              typeof temperatures[index] === "number" ?
                temperatures[index] :
                null,
            humidity:
              typeof humidities[index] === "number" ?
                humidities[index] :
                null,
            rainProbability:
              typeof rainProbabilities[index] === "number" ?
                rainProbabilities[index] :
                null,
            windSpeed:
              typeof windSpeeds[index] === "number" ?
                windSpeeds[index] :
                null,
          }));

        const hasRainRisk = forecast.some(
          (hour) =>
            hour.rainProbability !== null && hour.rainProbability >= 70,
        );
        const hasHeatRisk = forecast.some(
          (hour) => hour.temperature !== null && hour.temperature >= 38,
        );
        const hasWindRisk = forecast.some(
          (hour) => hour.windSpeed !== null && hour.windSpeed >= 30,
        );
        const advisories: string[] = [];

        if (hasRainRisk) {
          advisories.push(
            "Avoid pesticide spraying because heavy rain is likely in " +
            "the next 24 hours.",
          );
        }

        if (hasHeatRisk) {
          advisories.push(
            "Plan irrigation during cooler hours because high " +
            "temperatures may stress crops.",
          );
        }

        if (hasWindRisk) {
          advisories.push(
            "Avoid spraying because strong winds are expected in the " +
            "next 24 hours.",
          );
        }

        response.status(200).json({
          success: true,
          forecast,
          advisory:
            advisories.length > 0 ?
              advisories.join(" ") :
              "Weather looks suitable for normal farm activities.",
        });
      } catch (error) {
        logger.error("Fetching weather forecast failed.", error);
        response.status(502).json({
          success: false,
          message: "Unable to fetch weather forecast.",
        });
      }
    },
  );
}
