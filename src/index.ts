import 'reflect-metadata';
import express from 'express';

import { AppDataSource } from './config/container';
import { PORT }         from './config/env';
import routes           from './routes';
import { logger }       from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

async function bootstrap() {
  await AppDataSource.initialize();
  const app = express();

  app.use(express.json());
  app.use(logger);
  app.use('/api/v1', routes);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}/api/v1`);
  });
}

bootstrap().catch(err => {
  console.error('No se pudo iniciar la app', err);
});
