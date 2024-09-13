import { Request, Response, NextFunction } from 'express';

/**
 * Basic authentication credentials.
 * Uses environment variables `WEB_USER` and `WEB_PASSWORD` if available,
 * otherwise defaults to 'yourusername' and 'yourpassword'.
 */
const USERNAME = process.env.WEB_USER || 'yourusername';
const PASSWORD = process.env.WEB_PASSWORD || 'yourpassword';

/**
 * Middleware function to handle basic authentication.
 *
 * @param {Request} req - The request object from Express.
 * @param {Response} res - The response object from Express.
 * @param {NextFunction} next - The next middleware function in the chain.
 *
 * This middleware checks for the `Authorization` header and verifies the
 * credentials using Basic Auth. If the credentials are valid, it allows the request
 * to proceed to the next middleware or route. If the credentials are invalid or
 * missing, it responds with a 401 status and an error message.
 *
 * - Bypasses authentication for requests to `/api-docs` or `/favicon`.
 *
 * @returns {Response | void} Returns a 401 response if authentication fails,
 * or calls `next()` to proceed if successful.
 */
export const basicAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (req.path.includes('api-docs') || req.path.includes('favicon')) {
    return next();
  }
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }
  
  const [scheme, credentials] = authHeader.split(' ');
  
  if (scheme !== 'Basic' || !credentials) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }
  
  const [username, password] = Buffer.from(credentials, 'base64').toString().split(':');
  
  if (username === USERNAME && password === PASSWORD) {
    return next(); // Authentication successful, proceed to next middleware or route
  } else {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
};
