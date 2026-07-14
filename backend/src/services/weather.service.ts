import axios from 'axios';

export interface CurrentWeatherData {
  temperature: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  condition: string;
  rainProbability: number | null;
}

export interface WeatherAlert {
  type: 'rain' | 'wind' | 'heat' | 'disease-risk';
  severity: 'high' | 'medium';
  title: string;
  message: string;
}

export interface WeatherAlertsResponse {
  success: true;
  weather: {
    temperature: number | null;
    humidity: number | null;
    windSpeed: number | null;
    condition: string;
    rainProbability: number | null;
  };
  alerts: WeatherAlert[];
  message?: string;
}

export interface ForecastHour {
  time: string;
  temperature: number | null;
  humidity: number | null;
  rainProbability: number | null;
  windSpeed: number | null;
}

export interface WeatherForecastResponse {
  success: true;
  forecast: ForecastHour[];
  advisory: string;
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
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail',
};

export class WeatherService {
  private async fetchCurrentWeather(latitude: number, longitude: number): Promise<CurrentWeatherData> {
    const response = await axios.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation_probability',
        timezone: 'auto',
      },
      timeout: 10000,
    });

    const current = response.data.current;
    const weatherCode = typeof current?.weather_code === 'number' ? current.weather_code : null;

    return {
      temperature: typeof current?.temperature_2m === 'number' ? current.temperature_2m : null,
      humidity: typeof current?.relative_humidity_2m === 'number' ? current.relative_humidity_2m : null,
      windSpeed: typeof current?.wind_speed_10m === 'number' ? current.wind_speed_10m : null,
      weatherCode,
      condition: weatherCode !== null ? weatherConditionMap[weatherCode] ?? 'Unknown condition' : 'Unknown condition',
      rainProbability: typeof current?.precipitation_probability === 'number' ? current.precipitation_probability : null,
    };
  }

  private buildAlerts(weather: CurrentWeatherData): WeatherAlert[] {
    const alerts: WeatherAlert[] = [];

    if (weather.rainProbability !== null && weather.rainProbability >= 70) {
      alerts.push({
        type: 'rain',
        severity: 'high',
        title: 'Heavy rain chance',
        message: 'High rain probability. Avoid pesticide spraying and check field drainage.',
      });
    }

    if (weather.windSpeed !== null && weather.windSpeed >= 30) {
      alerts.push({
        type: 'wind',
        severity: 'medium',
        title: 'Strong wind',
        message: 'Strong winds expected. Avoid spraying and protect young plants.',
      });
    }

    if (weather.temperature !== null && weather.temperature >= 38) {
      alerts.push({
        type: 'heat',
        severity: 'high',
        title: 'High temperature',
        message: 'High heat may stress crops. Irrigate carefully during cooler hours.',
      });
    }

    if (weather.humidity !== null && weather.humidity >= 85) {
      alerts.push({
        type: 'disease-risk',
        severity: 'medium',
        title: 'Disease risk',
        message: 'High humidity can increase fungal and bacterial disease risk. Monitor crop leaves.',
      });
    }

    return alerts;
  }

  public async getCurrentWeather(latitude: number, longitude: number) {
    const weather = await this.fetchCurrentWeather(latitude, longitude);

    return {
      success: true as const,
      data: weather,
    };
  }

  public async getWeatherAlerts(latitude: number, longitude: number): Promise<WeatherAlertsResponse> {
    const weather = await this.fetchCurrentWeather(latitude, longitude);
    const alerts = this.buildAlerts(weather);

    return {
      success: true,
      weather: {
        temperature: weather.temperature,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        condition: weather.condition,
        rainProbability: weather.rainProbability,
      },
      alerts,
      ...(alerts.length === 0 ? { message: 'No major weather alerts right now.' } : {}),
    };
  }

  public async getWeatherForecast(latitude: number, longitude: number): Promise<WeatherForecastResponse> {
    const response = await axios.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        hourly: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability',
        forecast_hours: 24,
        timezone: 'auto',
      },
      timeout: 10000,
    });

    const hourly = response.data.hourly;
    const times = hourly?.time ?? [];
    const temperatures = hourly?.temperature_2m ?? [];
    const humidities = hourly?.relative_humidity_2m ?? [];
    const rainProbabilities = hourly?.precipitation_probability ?? [];
    const windSpeeds = hourly?.wind_speed_10m ?? [];

    const forecast = times.slice(0, 24).map((time, index) => ({
      time,
      temperature: typeof temperatures[index] === 'number' ? temperatures[index] : null,
      humidity: typeof humidities[index] === 'number' ? humidities[index] : null,
      rainProbability: typeof rainProbabilities[index] === 'number' ? rainProbabilities[index] : null,
      windSpeed: typeof windSpeeds[index] === 'number' ? windSpeeds[index] : null,
    } satisfies ForecastHour));

    const hasRainRisk = forecast.some((hour) => hour.rainProbability !== null && hour.rainProbability >= 70);
    const hasHeatRisk = forecast.some((hour) => hour.temperature !== null && hour.temperature >= 38);
    const hasWindRisk = forecast.some((hour) => hour.windSpeed !== null && hour.windSpeed >= 30);

    let advisory = 'Weather looks suitable for normal farm activities.';
    if (hasRainRisk || hasHeatRisk || hasWindRisk) {
      const advisories: string[] = [];

      if (hasRainRisk) {
        advisories.push('Avoid pesticide spraying because heavy rain is likely in the next 24 hours.');
      }

      if (hasHeatRisk) {
        advisories.push('Plan irrigation during cooler hours because high temperatures may stress crops.');
      }

      if (hasWindRisk) {
        advisories.push('Avoid spraying because strong winds are expected in the next 24 hours.');
      }

      advisory = advisories.join(' ');
    }

    return {
      success: true,
      forecast,
      advisory,
    };
  }
}

export const weatherService = new WeatherService();
export default weatherService;
