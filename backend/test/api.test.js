import assert from 'node:assert/strict';
import { after, test } from 'node:test';

process.env.NODE_ENV = 'test';
process.env.CLIENT_URL = 'https://portfolio.test';
delete process.env.MONGODB_URI;

const { createApp } = await import('../src/server.js');
const server = createApp().listen(0);
await new Promise((resolve) => server.once('listening', resolve));
const baseUrl = `http://127.0.0.1:${server.address().port}`;
const api = (path, options) => fetch(`${baseUrl}${path}`, options);

after(() => new Promise((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve());
}));

test('health endpoint returns the documented response', async () => {
  const response = await api('/api/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    success: true,
    message: 'Ritesh Portfolio API is running'
  });
});

test('CORS allows only the configured frontend origin', async () => {
  const allowed = await api('/api/health', { headers: { Origin: 'https://portfolio.test' } });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://portfolio.test');

  const blocked = await api('/api/health', { headers: { Origin: 'https://untrusted.test' } });
  assert.equal(blocked.status, 403);
  assert.equal((await blocked.json()).success, false);
});

test('admin endpoints reject requests without a JWT', async () => {
  const protectedRequests = [
    ['GET', '/api/auth/me'],
    ['POST', '/api/auth/logout'],
    ['POST', '/api/projects'],
    ['PUT', '/api/projects/507f1f77bcf86cd799439011'],
    ['DELETE', '/api/projects/507f1f77bcf86cd799439011'],
    ['POST', '/api/skills'],
    ['PUT', '/api/skills/507f1f77bcf86cd799439011'],
    ['DELETE', '/api/skills/507f1f77bcf86cd799439011'],
    ['GET', '/api/messages'],
    ['GET', '/api/visitors/stats']
  ];

  for (const [method, path] of protectedRequests) {
    const response = await api(path, { method });
    assert.equal(response.status, 401, `${method} ${path}`);
    assert.equal((await response.json()).success, false);
  }
});

test('contact and login validate before reaching database routes', async () => {
  const jsonHeaders = { 'Content-Type': 'application/json' };
  const missingPhone = await api('/api/contact', {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'Visitor', email: 'visitor@example.com', subject: 'Hello', message: 'A sufficiently long message.' })
  });
  assert.equal(missingPhone.status, 400);
  assert.equal((await missingPhone.json()).message, 'Please enter a valid mobile number.');

  const invalidPhone = await api('/api/contact', {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'Visitor', phone: 'abc', email: 'visitor@example.com', subject: 'Hello', message: 'A sufficiently long message.' })
  });
  assert.equal(invalidPhone.status, 400);
  assert.equal((await invalidPhone.json()).message, 'Please enter a valid mobile number.');

  const validPhone = await api('/api/contact', {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'Visitor', phone: '+91 98765 43210', email: 'visitor@example.com', subject: 'Hello', message: 'A sufficiently long message.' })
  });
  assert.equal(validPhone.status, 503);
  assert.equal((await validPhone.json()).message, 'Database service is not configured.');

  const contact = await api('/api/contact', {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ name: 'Visitor', phone: '+91 98765 43210', email: 'invalid-email', subject: 'Hello', message: 'A sufficiently long message.' })
  });
  assert.equal(contact.status, 400);
  assert.equal((await contact.json()).message, 'Please enter a valid email address.');

  const login = await api('/api/auth/login', {
    method: 'POST', headers: jsonHeaders,
    body: JSON.stringify({ email: 'invalid-email', password: 'x' })
  });
  assert.equal(login.status, 400);
  assert.equal((await login.json()).success, false);
});

test('unknown paths and malformed JSON use consistent error responses', async () => {
  const missing = await api('/api/not-a-route');
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { success: false, message: 'Resource not found.' });

  const malformed = await api('/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken'
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).message, 'Request body must be valid JSON.');
});
