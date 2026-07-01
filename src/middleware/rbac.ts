import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { db } from '../db/db.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthenticatedUserRequest extends AuthRequest {
  dbUser?: any; // or specific user type
}

export const requireRole = (roles: string[]) => {
  return async (req: AuthenticatedUserRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Fetch user from DB to get their role
      const dbUsers = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
      
      let dbUser;
      if (dbUsers.length === 0) {
        // For prototyping, create the user if they don't exist
        const newUser = await db.insert(users).values({
          uid: req.user.uid,
          email: req.user.email || '',
          name: req.user.name || '',
          role: req.user.email === 'admin@factory.com' ? 'admin' : 'user'
        }).returning();
        dbUser = newUser[0];
      } else {
        dbUser = dbUsers[0];
      }

      req.dbUser = dbUser;

      // Check role
      if (!roles.includes(dbUser.role) && dbUser.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
