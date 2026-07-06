import type { Request, Response } from 'express';
import { weatherService } from '../services/weather.service';

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

export const getCurrentWeather = async (req: Request, res: Response): Promise<void> => {
  const latParam = req.query.lat;
  const lonParam = req.query.lon;

  if (!isNonEmptyString(latParam) || !isNonEmptyString(lonParam)) {
    res.status(400).json({ success: false, message: 'latitude and longitude are required.' });
    return;
  }

  const latitude = Number(latParam);
  const longitude = Number(lonParam);

  if (!Number.isFinite(latitude)) {
    res.status(400).json({ success: false, message: 'latitude must be a valid number.' });
    return;
  }

  if (!Number.isFinite(longitude)) {
    res.status(400).json({ success: false, message: 'longitude must be a valid number.' });
    return;
  }

  if (latitude < -90 || latitude > 90) {
    res.status(400).json({ success: false, message: 'latitude must be between -90 and 90.' });
    return;
  }

  if (longitude < -180 || longitude > 180) {
    res.status(400).json({ success: false, message: 'longitude must be between -180 and 180.' });
    return;
  }

  try {
    const result = await weatherService.getCurrentWeather(latitude, longitude);
    res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch weather data.';
    res.status(502).json({ success: false, message });
  }
};

export default { getCurrentWeather };
