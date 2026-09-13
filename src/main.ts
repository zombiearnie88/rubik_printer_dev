import * as fs from 'fs';
import * as https from 'https';
import * as path from 'path';
import express = require('express');
import { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import multer = require('multer');
import { getPrinters, print } from 'unix-print';

const upload = multer({
  dest: path.join(process.cwd(), 'uploaded'),
  limits: {
    fileSize: 500000,
  },
  fileFilter: (_request, file, callback) => {
    const isPdf =
      file.mimetype === 'application/pdf' ||
      path.extname(file.originalname).toLowerCase() === '.pdf';

    if (!isPdf) {
      callback(new Error('Only PDF files are accepted'));
      return;
    }

    callback(null, true);
  },
});

export function createApp(): express.Express {
  const app = express();

  app.use(helmet({ frameguard: false }));
  app.use((_request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.options(/.*/, (_request, response) => response.sendStatus(204));

  app.get('/', async (_request, response, next) => {
    try {
      const printers = await getPrinters();
      response.json({ printers });
    } catch (error) {
      next(error);
    }
  });

  app.get('/printers', async (_request, response, next) => {
    try {
      response.json(await getPrinters());
    } catch (error) {
      next(error);
    }
  });

  app.post('/print', upload.single('file'), async (request, response, next) => {
    try {
      if (!request.file) {
        response.status(422).json({ message: 'PDF file is required' });
        return;
      }

      const printer = request.body?.printer;
      if (!printer) {
        response.status(422).json({ message: 'Printer is required' });
        return;
      }

      console.info({ body: request.body, file: request.file });
      response.json(await print(request.file.path, printer));
    } catch (error) {
      next(error);
    }
  });

  app.use(
    (
      error: Error & { status?: number; statusCode?: number },
      _request: Request,
      response: Response,
      _next: NextFunction,
    ) => {
      void _next;

      const status = error.status || error.statusCode || 500;
      response.status(status).json({
        message: error.message || 'Internal server error',
      });
    },
  );

  return app;
}

async function bootstrap(): Promise<void> {
  const node_env = process.env.NODE_ENV || 'development';
  console.info('Environment: ', node_env);

  const app = createApp();
  const httpsOptions = {
    key: fs.readFileSync('./cert/key.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
  };

  if (node_env === 'production') {
    const port = process.env.PORT || 1339;
    console.info('Backend has started running on Port: ', port);
    https.createServer(httpsOptions, app).listen(port);
  } else {
    console.info('Backend has started running on Port 1340');
    https.createServer(httpsOptions, app).listen(1340);
  }
}

if (require.main === module) {
  bootstrap();
}
