import { Router } from 'express';
import { getCurrentWeather, getWeatherAlerts, getWeatherForecast } from '../controllers/weather.controller';

const router = Router();

router.get('/current', getCurrentWeather);
router.get('/alerts', getWeatherAlerts);
router.get('/forecast', getWeatherForecast);

export default router;
