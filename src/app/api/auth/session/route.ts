/**
 * 👤 会话状态 API
 *
 * GET /api/auth/session
 *
 * 使用AuthService获取当前用户的会话信息
 */

import { getCurrentUserId } from '@/lib/auth/session';
import { authService } from '@/lib/services/auth.service';

/**
 * 获取当前会话信息
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json({
        status: 'success',
        data: {
          user: null,
          authenticated: false
        }
      });
    }

    // 调用AuthService获取用户信息
    const user = await authService.getCurrentUser(userId);

    if (!user) {
      // 用户不存在或已被禁用，清除会话
      const { clearSession } = await import('@/lib/auth/session');
      await clearSession();

      return Response.json({
        status: 'success',
        data: {
          user: null,
          authenticated: false
        }
      });
    }

    return Response.json({
      status: 'success',
      data: {
        user,
        authenticated: true
      }
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取会话信息出错:', error);

    return Response.json(
      {
        status: 'error',
        message: '获取会话信息失败'
      },
      { status: 500 }
    );
  }
}
