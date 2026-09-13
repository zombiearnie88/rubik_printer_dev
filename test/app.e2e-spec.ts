import * as request from 'supertest';
import { createApp } from '../src/main';

describe('Printer server (e2e)', () => {
  const app = createApp();

  it('/ (GET)', () => {
    return request(app).get('/').expect(200).expect('Content-Type', /json/);
  });
});
