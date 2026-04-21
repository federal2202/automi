import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth';

// Enhanced logging utility
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error);
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  static debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static database(operation: string, query?: string, params?: any) {
    console.log(`[DB] ${new Date().toISOString()} - ${operation}`, {
      query,
      params
    });
  }

  static apiCall(service: string, operation: string, params?: any) {
    console.log(`[API] ${new Date().toISOString()} - ${service}.${operation}`, params ? JSON.stringify(params, null, 2) : '');
  }
}

// HTTP Request logging middleware
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, url, ip, headers } = req;
  
  // Log incoming request
  Logger.info(`Incoming ${method} ${url}`, {
    ip,
    userAgent: headers['user-agent'],
    contentType: headers['content-type'],
    authorization: headers['authorization'] ? 'Bearer ***' : 'None',
    body: req.body && Object.keys(req.body).length > 0 ? 
      { ...req.body, password: req.body.password ? '***' : undefined } : undefined
  });

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    
    // Log response (hide sensitive data)
    const responseData = typeof data === 'object' ? { ...data } : data;
    if (responseData && typeof responseData === 'object') {
      if (responseData.accessToken) responseData.accessToken = '***';
      if (responseData.refreshToken) responseData.refreshToken = '***';
    }

    Logger.info(`Response ${method} ${url} - ${res.statusCode} (${duration}ms)`, {
      status: res.statusCode,
      data: responseData
    });

    return originalJson.call(this, data);
  };

  next();
}

// Authentication logging middleware
export function authLogger(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user) {
    Logger.debug(`Authenticated request`, {
      userId: req.user.id,
      email: req.user.email,
      route: `${req.method} ${req.url}`
    });
  }
  next();
}