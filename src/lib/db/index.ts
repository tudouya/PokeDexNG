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

// 优雅退出时关闭数据库连接
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
