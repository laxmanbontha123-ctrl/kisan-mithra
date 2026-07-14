import type { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const parseCoordinates = (req: Request, res: Response): { latitude: number; longitude: number } | null => {
  const latParam = req.query.lat;
  const lonParam = req.query.lon;

  if (!isNonEmptyString(latParam) || !isNonEmptyString(lonParam)) {
    res.status(400).json({ success: false, message: 'latitude and longitude are required.' });
    return null;
  }

  const latitude = Number(latParam);
  const longitude = Number(lonParam);

  if (!Number.isFinite(latitude)) {
    res.status(400).json({ success: false, message: 'latitude must be a valid number.' });
    return null;
  }

  if (!Number.isFinite(longitude)) {
    res.status(400).json({ success: false, message: 'longitude must be a valid number.' });
    return null;
  }

  if (latitude < -90 || latitude > 90) {
    res.status(400).json({ success: false, message: 'latitude must be between -90 and 90.' });
    return null;
  }

  if (longitude < -180 || longitude > 180) {
    res.status(400).json({ success: false, message: 'longitude must be between -180 and 180.' });
    return null;
  }

  return { latitude, longitude };
};

export const getCurrentWeather = async (req: Request, res: Response): Promise<void> => {
  const coordinates = parseCoordinates(req, res);
  if (!coordinates) {
    return;
  }

  try {
    const result = await weatherService.getCurrentWeather(coordinates.latitude, coordinates.longitude);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch weather data.';
    res.status(502).json({ success: false, message });
  }
};

export const getWeatherAlerts = async (req: Request, res: Response): Promise<void> => {
  const coordinates = parseCoordinates(req, res);
  if (!coordinates) {
    return;
  }

  try {
    const result = await weatherService.getWeatherAlerts(coordinates.latitude, coordinates.longitude);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch weather data.';
    res.status(502).json({ success: false, message });
  }
};

export default { getCurrentWeather, getWeatherAlerts };
