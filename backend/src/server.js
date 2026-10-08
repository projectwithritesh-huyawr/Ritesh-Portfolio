import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pathToFileURL } from 'node:url';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import visitorRoutes from './routes/visitorRoutes.js';

export const createApp = () => {
  const app = express();
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const allowedOrigins = configuredOrigins.length
    ? configuredOrigins
    : process.env.NODE_ENV === 'production'
      ? []
      : ['http://localhost:8000'];

  app.disable('x-powered-by');
  if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(Object.assign(new Error('Origin is not allowed by CORS.'), { statusCode: 403 }));
    }
  }));
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Ritesh Portfolio API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/visitors', visitorRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
};

export const startServer = async () => {
  const port = Number(process.env.PORT) || 5000;

  try {
    const connected = await connectDatabase();
    if (!connected) console.warn('MongoDB is not configured; database-backed routes will be unavailable.');
  } catch {
    console.error('MongoDB connection failed; the API will start without database access.');
  }

  const server = createApp().listen(port, () => {
    console.log(`Ritesh Portfolio API listening on port ${port}`);
  });
  return server;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}
