import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

export function setup(app: NestExpressApplication): INestApplication {
  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = dirname(__filename);
  app.enableCors();
  app.use(helmet({ frameguard: false }));
  // app.useStaticAssets(join(__dirname, '..', 'public'));
  // app.setBaseViewsDir(join(__dirname, '..', 'views'));
  // app.setViewEngine('hbs');

  return app;
}
