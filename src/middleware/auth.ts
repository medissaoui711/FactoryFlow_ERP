import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  // Mock user for prototype
  req.user = {
    uid: "test-uid-123",
    email: "admin@factory.com",
    name: "Admin",
    auth_time: 0,
    exp: 0,
    iat: 0,
    iss: "",
    sub: "",
    aud: "test",
    firebase: {
      identities: {},
      sign_in_provider: ""
    }
  } as DecodedIdToken;
  next();
};
