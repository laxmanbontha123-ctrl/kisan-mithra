import express, { type Request, type Response } from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import cropRoutes from './routes/crop.routes';
import weatherRoutes from './routes/weather.routes';
import imageRoutes from './routes/image.routes';
import diseaseRoutes from './routes/disease.routes';
import agriProductRoutes from './routes/agri-product.routes';
import agriShopRoutes from './routes/agri-shop.routes';

dotenv.config();

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://kisan-mithra.vercel.app",
      "https://kisan-mithra-77gp6fv8k-kisan-mithra.vercel.app",
    ];

    const extraOrigins = (process.env.FRONTEND_URL ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const allAllowedOrigins = [...allowedOrigins, ...extraOrigins];

    if (!origin || allAllowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
      return;
    }

    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));


app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/agri-products', agriProductRoutes);
app.use('/api/agri-shops', agriShopRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Kisan Mithra Backend Running',
    timestamp: new Date().toISOString(),
  });
});

export default app;


