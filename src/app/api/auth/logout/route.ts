/**
 * 🚪 用户登出 API
 *
 * POST /api/auth/logout
 *
 * 使用AuthService处理登出业务逻辑，API路由只负责HTTP处理
 */

import { NextRequest } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { authService } from '@/lib/services/auth.service';

/**
 * 用户登出
 */
export async function POST(_request: NextRequest) {
  try {
    // Get user ID but don't use it for logout - auth service handles session clearing
    await getCurrentUserId();

    // 调用AuthService处理登出业务逻辑
    await authService.logout();

    return Response.json({
      status: 'success',
      data: {
        message: '已成功登出'
      }
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('登出过程出错:', error);

    // 即使出错也尝试清除会话，确保用户安全
    try {
      const { clearSession } = await import('@/lib/auth/session');
      await clearSession();
    } catch (clearError) {
      // TODO: Replace with proper logging system
      // console.error('清除会话失败:', clearError);
    }

    return Response.json(
      {
        status: 'error',
        message: '登出过程中出现问题，但会话已清除'
      },
      { status: 500 }
    );
  }
}
