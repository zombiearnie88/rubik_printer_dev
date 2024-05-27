import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setup } from './setup';

async function bootstrap(): Promise<INestApplication> {
  const node_env = process.env.NODE_ENV || 'development';
  console.info('Environment: ', node_env);
  const app = await NestFactory.create(AppModule, {
    logger:
      node_env === 'development'
        ? ['verbose', 'error', 'warn', 'debug']
        : ['error', 'warn', 'debug'],
  });

  setup(app);

  if (node_env === 'production') {
    const port = process.env.PORT || 1339;
    await app.listen(port);
    console.info('Backend has started running on Port: ', port);
  } else {
    console.info('Backend has started running on Port 1339');
  }

  return app;
}

export const viteNodeApp = bootstrap();
