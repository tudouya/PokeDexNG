/**
 * Prisma 种子数据
 * 简化版 - 仅创建管理员用户
 */

import { PrismaClient } from '@prisma/client';
import {
  generateSecurePassword,
  validatePassword
} from '../src/lib/auth/password';
import { hashPassword } from '../src/lib/auth/session';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始执行种子数据...');

  // 1. 创建超级管理员用户
  console.log('👤 创建超级管理员用户...');

  // 从环境变量读取管理员密码
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ 缺少环境变量 ADMIN_PASSWORD');
    console.log(
      '💡 请设置环境变量：export ADMIN_PASSWORD="your-secure-password"'
    );
    process.exit(1);
  }

  const passwordValidation = validatePassword(adminPassword);

  if (!passwordValidation.isValid) {
    console.error('❌ 管理员密码不符合安全要求:', passwordValidation.errors);
    console.log('💡 密码必须包含大小写字母、数字和特殊字符，长度至少8位');
    process.exit(1);
  }

  const hashedPassword = await hashPassword(adminPassword);
  console.log('🔐 密码加密完成');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pokedex.com' },
    update: {},
    create: {
      email: 'admin@pokedex.com',
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: '系统管理员',
      avatar: null,
      isActive: true
    }
  });

  console.log('✅ 创建超级管理员用户');

  console.log('🎉 种子数据执行完成！');
  console.log('');
  console.log('📊 统计信息:');
  console.log('  - 用户: 1 个');
  console.log('');
  console.log('🔑 超级管理员账户:');
  console.log('  邮箱: admin@pokedex.com');
  console.log('  用户名: admin');
  console.log('  密码: [已从环境变量 ADMIN_PASSWORD 设置]');
  console.log('');
  console.log('⚠️  请确保密码强度足够，并定期更换！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
