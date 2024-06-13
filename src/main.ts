import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { setup } from './setup';
import * as fs from 'fs';

async function bootstrap(): Promise<INestApplication> {
  const node_env = process.env.NODE_ENV || 'development';
  console.info('Environment: ', node_env);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      node_env === 'development'
        ? ['verbose', 'error', 'warn', 'debug']
        : ['error', 'warn', 'debug'],
    httpsOptions: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem'),
    },
  });

  setup(app);

  if (node_env === 'production') {
    const port = process.env.PORT || 1339;
    console.info('Backend has started running on Port: ', port);
    await app.listen(port);
  } else {
    console.info('Backend has started running on Port 1339');
    await app.listen(1339);
  }

  return app;
}

bootstrap();
// export const viteNodeApp = bootstrap();
