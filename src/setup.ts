import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export function setup(app: INestApplication): INestApplication {
  app.enableCors();
  app.use(helmet());

  return app;
}
