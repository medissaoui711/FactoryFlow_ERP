import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireRole } from './rbac';
import { db } from '../db/db';
import { users } from '../db/schema';

// Mock the database
vi.mock('../db/db.ts', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn()
  }
}));

describe('RBAC Middleware', () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      user: {
        uid: 'test-uid',
        email: 'test@factory.com',
        name: 'Test User'
      }
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    mockNext = vi.fn();
    vi.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    mockReq.user = null;
    const middleware = requireRole(['admin']);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('should allow access for matching role', async () => {
    const mockDbUser = { uid: 'test-uid', role: 'accountant' };
    (db as any).limit = vi.fn().mockResolvedValue([mockDbUser]);

    const middleware = requireRole(['accountant']);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.dbUser).toEqual(mockDbUser);
  });

  it('should deny access for non-matching role', async () => {
    const mockDbUser = { uid: 'test-uid', role: 'warehouse' };
    (db as any).limit = vi.fn().mockResolvedValue([mockDbUser]);

    const middleware = requireRole(['accountant']);
    await middleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Forbidden: Insufficient permissions' });
  });

  it('should always allow admin access', async () => {
    const mockDbUser = { uid: 'test-uid', role: 'admin' };
    (db as any).limit = vi.fn().mockResolvedValue([mockDbUser]);

    const middleware = requireRole(['accountant']); // doesn't include admin
    await middleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
