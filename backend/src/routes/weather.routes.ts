import { Router } from 'express';
import { getCurrentWeather, getWeatherAlerts } from '../controllers/weather.controller';

const router = Router();

router.get('/current', getCurrentWeather);
router.get('/alerts', getWeatherAlerts);

export default router;
