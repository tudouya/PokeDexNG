/**
 * 🔐 简洁认证会话管理
 *
 * 参考 nextjs/saas-starter 的简洁设计:
 * - JWT 只存储 userId 和过期时间
 * - 权限信息实时从数据库查询
 * - 支持安全的密码处理
 * - Cookie 管理和会话验证
 */

import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { User } from '@prisma/client';

// JWT 密钥和配置
const key = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
);
const SALT_ROUNDS = 10;

/**
 * Session 数据类型 - 只存储必要信息
 */
export type SessionData = {
  user: { id: number };
  expires: string;
};

/**
 * 简化的用户类型 - 用于创建会话
 */
export type SessionUser = Pick<User, 'id'>;

// ================================
// 密码处理函数
// ================================

/**
 * 哈希密码
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

/**
 * 验证密码
 */
export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(plainTextPassword, hashedPassword);
}

// ================================
// JWT 处理函数
// ================================

/**
 * 签名 JWT token
 */
export async function signToken(payload: SessionData): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

/**
 * 验证 JWT token
 */
export async function verifyToken(token: string): Promise<SessionData> {
  const { payload } = await jwtVerify(token, key, {
    algorithms: ['HS256']
  });
  return payload as SessionData;
}

// ================================
// 会话管理函数
// ================================

/**
 * 获取当前会话
 * @returns 会话数据或 null
 */
export async function getSession(): Promise<SessionData | null> {
  try {
    const sessionCookie = (await cookies()).get('session')?.value;
    if (!sessionCookie) {
      return null;
    }

    const sessionData = await verifyToken(sessionCookie);

    // 检查会话是否过期
    if (new Date(sessionData.expires) < new Date()) {
      // 会话过期，删除 cookie
      (await cookies()).delete('session');
      return null;
    }

    return sessionData;
  } catch (error) {
    // Token 验证失败，删除无效 cookie
    (await cookies()).delete('session');
    return null;
  }
}

/**
 * 创建用户会话
 * @param user 用户信息
 */
export async function setSession(user: SessionUser): Promise<void> {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const sessionData: SessionData = {
    user: { id: user.id },
    expires: expiresInOneDay.toISOString()
  };

  const encryptedSession = await signToken(sessionData);

  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

/**
 * 清除用户会话
 */
export async function clearSession(): Promise<void> {
  (await cookies()).delete('session');
}

/**
 * 刷新会话（延长过期时间）
 * @param currentSession 当前会话数据
 */
export async function refreshSession(
  currentSession: SessionData
): Promise<void> {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const newSessionData: SessionData = {
    ...currentSession,
    expires: expiresInOneDay.toISOString()
  };

  const encryptedSession = await signToken(newSessionData);

  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

// ================================
// 辅助函数
// ================================

/**
 * 获取当前用户 ID
 * @returns 用户 ID 或 null
 */
export async function getCurrentUserId(): Promise<number | null> {
  const session = await getSession();
  return session?.user?.id || null;
}

/**
 * 验证环境变量配置
 */
export function validateAuthConfig(): void {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error('AUTH_SECRET environment variable is required');
  }

  if (secret.length < 32) {
    throw new Error('AUTH_SECRET must be at least 32 characters long');
  }

  if (process.env.NODE_ENV === 'production' && secret === 'your-secret-here') {
    throw new Error(
      'AUTH_SECRET must be changed from default value in production'
    );
  }
}

// 启动时验证配置
if (typeof window === 'undefined') {
  validateAuthConfig();
}
