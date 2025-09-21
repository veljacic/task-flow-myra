import { Request } from 'express';

export interface ClientInfo {
  ip: string;
  userAgent: string;
}

export const extractClientInfo = (req: Request): ClientInfo => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  return {
    ip,
    userAgent,
  };
};
