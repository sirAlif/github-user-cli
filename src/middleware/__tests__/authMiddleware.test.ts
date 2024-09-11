import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { basicAuthMiddleware } from '../authMiddleware';

// Set up a basic Express app for testing the middleware
const app = express();

// Add a test route that requires the basic auth middleware
app.use(basicAuthMiddleware);
app.get('/protected', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Authenticated' });
});

describe('basicAuthMiddleware', () => {
  const username = process.env.WEB_USER || 'yourusername';
  const password = process.env.WEB_PASSWORD || 'yourpassword';
  
  it('should return 401 if no Authorization header is provided', async () => {
    const response = await request(app).get('/protected');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Authorization header is missing');
  });
  
  it('should return 401 if the Authorization header is in the wrong format', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid authorization format');
  });
  
  it('should return 401 if the credentials are invalid', async () => {
    const invalidCredentials = Buffer.from('wronguser:wrongpassword').toString('base64');
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Basic ${invalidCredentials}`);
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid credentials');
  });
  
  it('should return 200 if the credentials are valid', async () => {
    const validCredentials = Buffer.from(`${username}:${password}`).toString('base64');
    const response = await request(app)
      .get('/protected')
      .set('Authorization', `Basic ${validCredentials}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Authenticated');
  });
  
  it('should bypass the auth middleware for /api-docs route', async () => {
    const response = await request(app).get('/api-docs');
    expect(response.status).not.toBe(401); // Should bypass authentication
  });
  
  it('should bypass the auth middleware for /favicon route', async () => {
    const response = await request(app).get('/favicon');
    expect(response.status).not.toBe(401); // Should bypass authentication
  });
});
