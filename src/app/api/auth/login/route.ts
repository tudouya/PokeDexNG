/**
 * 🔐 用户登录 API
 *
 * POST /api/auth/login
 *
 * 使用AuthService处理登录业务逻辑，API路由只负责HTTP处理
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth.service';

// 登录请求验证 Schema
const loginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(1, '密码不能为空')
});

/**
 * 用户登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证输入数据
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        {
          status: 'fail',
          data: {
            error: '输入数据格式错误',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    // 调用AuthService处理登录业务逻辑
    const user = await authService.login(username, password);

    // 返回成功响应
    return Response.json({
      status: 'success',
      data: {
        user,
        message: '登录成功'
      }
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('登录过程出错:', error);

    // 业务逻辑错误（用户名密码错误等）
    if (error instanceof Error) {
      return Response.json(
        {
          status: 'fail',
          data: {
            error: error.message
          }
        },
        { status: 401 }
      );
    }

    // 系统错误
    return Response.json(
      {
        status: 'error',
        message: '登录服务暂时不可用，请稍后重试'
      },
      { status: 500 }
    );
  }
}
