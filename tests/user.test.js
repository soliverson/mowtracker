const request = require('supertest');
const app = require('../app');

describe('Login Route', () => {
  it('should show login form', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('Login');
  });
});
