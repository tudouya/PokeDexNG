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
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    // 构建审计上下文
    const auditContext = {
      ipAddress:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };

    // 调用AuthService处理登出业务逻辑
    if (userId) {
      await authService.logout(userId, auditContext);
    } else {
      // 没有用户会话的情况下也要清除可能存在的会话cookie
      await authService.logout(0, auditContext);
    }

    return Response.json({
      status: 'success',
      data: {
        message: '已成功登出'
      }
    });
  } catch (error) {
    console.error('登出过程出错:', error);

    // 即使出错也尝试清除会话，确保用户安全
    try {
      const { clearSession } = await import('@/lib/auth/session');
      await clearSession();
    } catch (clearError) {
      console.error('清除会话失败:', clearError);
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
