const request = require('supertest');
const app     = require('..');

describe('POST /api/shorten', () => {
  test('201 with a code for a valid URL', async () => {
    const res = await request(app).post('/api/shorten')
      .send({ url: 'https://example.com/long/path' });
    expect(res.status).toBe(201);
    expect(res.body.code).toMatch(/^[A-Za-z0-9_-]{4,10}$/);
  });

  test('400 for missing or invalid URL', async () => {
    const r1 = await request(app).post('/api/shorten').send({});
    expect(r1.status).toBe(400);

    const r2 = await request(app).post('/api/shorten').send({ url: 'not-a-url' });
    expect(r2.status).toBe(400);
  });
});

describe('GET /api/r/:code', () => {
  test('302 redirect when found', async () => {
    const create = await request(app).post('/api/shorten')
      .send({ url: 'https://example.com/' });
    const res = await request(app).get('/api/r/' + create.body.code);
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://example.com/');
  });

  test('404 when code unknown', async () => {
    const res = await request(app).get('/api/r/nope');
    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  test('200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
