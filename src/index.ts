import 'reflect-metadata';
import express from 'express';
import cors from 'cors';

import { AppDataSource } from './config/container';
import { PORT } from './config/env';
import routes from './routes';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

async function bootstrap() {
  await AppDataSource.initialize();
  const app = express();
  const allowedOrigins = [
    'http://localhost:3000',
    'https://anima-landing-production.up.railway.app'
  ]

  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }))
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // Agregar este middleware
  app.use(logger);
  app.use('/api/v1', routes);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(
      `Servidor escuchando en https://api-animastudio-ckhrecg0byfeh2fs.centralus-01.azurewebsites.net/api/v1`,
    );
  });
}

bootstrap().catch((err) => {
  console.error('No se pudo iniciar la app', err);
});
