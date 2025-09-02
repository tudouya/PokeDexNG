/**
 * 认证服务
 * 处理用户登录、登出、会话管理等认证相关业务逻辑
 *
 * 设计原则：
 * - Service层直接使用Prisma，不引入Repository抽象
 * - 承担所有认证相关的业务逻辑和数据访问
 * - 提供清晰的接口供API路由调用
 */

import { prisma } from '@/lib/db';
import { comparePasswords, setSession, clearSession } from '@/lib/auth/session';

/**
 * 用户登录结果
 */
interface LoginResult {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  avatar: string | null;
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 用户登录
   * @param username 用户名或邮箱
   * @param password 密码
   * @returns 登录成功的用户信息
   * @throws 登录失败时抛出错误
   */
  async login(username: string, password: string): Promise<LoginResult> {
    // 1. 查找用户（支持用户名或邮箱登录）
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email: username }],
        isActive: true // 只允许活跃用户登录
      }
    });

    // 2. 处理用户不存在的情况
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 3. 验证密码
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 4. 登录成功处理
    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // 5. 创建会话
    await setSession({ id: user.id });

    // 6. 返回安全的用户信息（不包含密码哈希等敏感信息）
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar
    };
  }

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    // 清除会话
    await clearSession();
  }

  /**
   * 获取当前会话用户信息
   * @param userId 用户ID
   * @returns 用户信息，如果用户不存在或被禁用则返回null
   */
  async getCurrentUser(userId: number): Promise<LoginResult | null> {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatar: true,
        createdAt: true,
        lastLoginAt: true
        // 不返回密码哈希等敏感信息
      }
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      avatar: user.avatar
    };
  }

  /**
   * 验证用户是否存在且活跃
   * @param userId 用户ID
   * @returns 用户是否有效
   */
  async isValidUser(userId: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true }
    });

    return user?.isActive ?? false;
  }
}

// 导出单例实例（可选，也可以在使用时new）
export const authService = new AuthService();
