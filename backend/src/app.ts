import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import cropRoutes from './routes/crop.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);

app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    message: 'Kisan Mithra Backend Running',
    timestamp: new Date().toISOString(),
  });
});

export default app;
