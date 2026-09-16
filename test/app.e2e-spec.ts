import * as request from 'supertest';
import { createApp } from '../src/main';

describe('Printer server (e2e)', () => {
  const app = createApp();

  it('allows requests from every origin', () => {
    return request(app)
      .options('/print')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type, authorization')
      .expect(204)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
      .expect('Access-Control-Allow-Headers', 'content-type, authorization');
  });

  it('allows private-network preflight requests', () => {
    return request(app)
      .options('/printers')
      .set('Origin', 'https://example.com')
      .set('Access-Control-Request-Method', 'GET')
      .set('Access-Control-Request-Private-Network', 'true')
      .expect(204)
      .expect('Access-Control-Allow-Origin', '*')
      .expect('Access-Control-Allow-Private-Network', 'true');
  });

  it('/ (GET)', () => {
    return request(app).get('/').expect(200).expect('Content-Type', /json/);
  });
});
