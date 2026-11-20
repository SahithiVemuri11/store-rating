import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

// PrismaClient singleton for database connection management
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Verify database connectivity on application startup
 */
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Connected to Database successfully.');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Disconnect database on graceful shutdown
 */
export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected.');
}
