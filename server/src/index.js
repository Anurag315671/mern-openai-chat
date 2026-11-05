import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import conversationRoutes from './routes/conversations.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});
app.use('/api/conversations', conversationRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');
    app.listen(config.port, () => console.log(`API server listening on http://localhost:${config.port}`));
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}
start();
