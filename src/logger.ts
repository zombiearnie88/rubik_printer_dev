import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    const { method, originalUrl } = request;
    const node_env = process.env.NODE_ENV || 'development';
    // console.log({request})
    response.on('close', () => {
      const { statusCode } = response;

      if (node_env === 'development') {
        this.logger.verbose(`${method} ${originalUrl} ${statusCode}`);
        // this.logger.verbose({query,params});
      }
    });

    next();
  }
}
