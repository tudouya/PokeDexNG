/**
 * 🛡️ 简洁认证中间件
 *
 * 核心职责：
 * - 只做用户认证检查
 * - 不做权限验证（权限检查由API路由层负责）
 * - 使用新的 JWT 会话系统
 * - 保持 Edge Runtime 高性能
 */

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT 验证密钥
const key = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 获取会话信息
  const sessionCookie = request.cookies.get('session')?.value;
  let isAuthenticated = false;

  // 验证用户是否已登录
  if (sessionCookie) {
    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ['HS256']
      });

      // 检查是否过期
      if (
        !payload.expires ||
        new Date(payload.expires as string) >= new Date()
      ) {
        isAuthenticated = true;
      }
    } catch (error) {
      // JWT验证失败，视为未登录
      isAuthenticated = false;
    }
  }

  // 1. 处理根路径 - 智能重定向
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 2. 处理已登录用户访问认证页面 - 重定向到dashboard
  if (isAuthenticated && isAuthPage(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. 处理未登录用户访问受保护路径 - 重定向到登录页面
  if (!isAuthenticated && requiresAuth(pathname)) {
    return redirectToLogin(pathname, request.url);
  }

  // 4. 已登录用户访问受保护路径 - 刷新会话并继续
  if (isAuthenticated && requiresAuth(pathname)) {
    const response = NextResponse.next();

    if (request.method === 'GET') {
      // 延长会话过期时间
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // 重新签名 token（简化版刷新）
      try {
        const { SignJWT } = await import('jose');
        const { payload } = await jwtVerify(sessionCookie!, key, {
          algorithms: ['HS256']
        });

        const newToken = await new SignJWT({
          ...payload,
          expires: expiresInOneDay.toISOString()
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('1 day from now')
          .sign(key);

        response.cookies.set({
          name: 'session',
          value: newToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          expires: expiresInOneDay
        });
      } catch (refreshError) {
        // TODO: Replace with proper logging system
        // console.warn('会话刷新失败:', refreshError);
        // 刷新失败但不影响当前请求
      }
    }

    return response;
  }

  return NextResponse.next();
}

/**
 * 重定向到登录页
 */
function redirectToLogin(pathname: string, requestUrl: string): NextResponse {
  const loginUrl = new URL('/auth/login', requestUrl);
  loginUrl.searchParams.set('callbackUrl', pathname);
  return NextResponse.redirect(loginUrl);
}

/**
 * 判断路径是否为认证页面（已登录用户应该重定向的页面）
 */
function isAuthPage(pathname: string): boolean {
  const authPages = ['/auth/login', '/auth/register'];

  return authPages.some(
    (path) => pathname === path || pathname.startsWith(path)
  );
}

/**
 * 判断路径是否需要认证
 */
function requiresAuth(pathname: string): boolean {
  // 需要认证的路径
  const protectedPaths = [
    '/dashboard',
    '/api' // 所有API路由都需要认证
  ];

  // 公开路径（无需认证）
  const publicPaths = [
    '/auth', // 认证相关页面
    '/api/auth', // 认证 API（登录、登出、会话等）
    '/api/health' // 健康检查等公开API
  ];

  // 检查是否为公开路径
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));
  if (isPublicPath) return false;

  // 检查是否为受保护路径
  return protectedPaths.some((path) => pathname.startsWith(path));
}

export const config = {
  matcher: [
    '/', // 根路径 - 智能重定向
    '/auth/:path*', // 认证页面 - 已登录用户需要重定向
    '/dashboard/:path*', // 仪表盘页面 - 需要认证
    '/api/:path*' // 所有API路由 - 部分需要认证
  ]
  // Next.js 15 中middleware默认使用Edge Runtime，无需显式配置
};
