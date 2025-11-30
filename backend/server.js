import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { languageMiddleware } from './middleware/language.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['*'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(languageMiddleware);

app.use('/api', routes);

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: req.t('common.route_not_found') });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API available at http://0.0.0.0:${PORT}/api`);
  console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
});

export default app;
