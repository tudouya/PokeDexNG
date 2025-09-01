/**
 * Prisma Client 单例模式
 * 避免在开发模式下创建过多数据库连接
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 优雅关闭数据库连接（仅在Node.js环境，不在Edge Runtime）
if (
  typeof window === 'undefined' &&
  typeof process !== 'undefined' &&
  process.on
) {
  const gracefulShutdown = async (signal: string) => {
    try {
      console.log(`Received ${signal}, closing database connections...`);
      await prisma.$disconnect();
      console.log('Database connections closed successfully');
    } catch (error) {
      console.error('Error during database shutdown:', error);
    }
  };

  process.on('beforeExit', () => gracefulShutdown('beforeExit'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}
