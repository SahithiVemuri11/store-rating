import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
}

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string;
}

// Augment Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
