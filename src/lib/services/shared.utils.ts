/**
 * 共享服务工具函数
 * 为认证服务提供通用错误处理、验证和响应格式化功能
 *
 * 遵循 DRY 原则，使用组合而非继承的架构模式
 */

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getCurrentUserId } from '@/lib/auth/session';

// ================================
// 类型定义 - JSend 响应格式
// ================================

/**
 * JSend 标准响应格式类型定义
 * 基于 RFC 7807 和项目约定
 */
export type JSendSuccess<T> = {
  status: 'success';
  data: T;
};

export type JSendFail<T = Record<string, string>> = {
  status: 'fail';
  data: T;
};

export type JSendError = {
  status: 'error';
  message: string;
  code?: number;
  data?: any;
};

export type JSendResponse<T, E = any> =
  | JSendSuccess<T>
  | JSendFail<E>
  | JSendError;

/**
 * API 错误类型定义
 * 涵盖常见的认证和业务错误场景
 */
export type ApiError =
  | { type: 'network'; message: string }
  | { type: 'server'; message: string; code?: number }
  | { type: 'validation'; details: Record<string, string> }
  | { type: 'not_found'; resource: string }
  | { type: 'unauthorized'; message: string }
  | { type: 'forbidden'; message: string }
  | { type: 'conflict'; message: string; details?: any }
  | { type: 'rate_limit'; message: string; retryAfter?: number };

// ================================
// 响应格式化工具函数
// ================================

/**
 * 创建成功响应
 */
export function createSuccessResponse<T>(data: T): Response {
  return Response.json({ status: 'success', data }, { status: 200 });
}

/**
 * 创建失败响应（客户端错误）
 */
export function createFailResponse<T = Record<string, string>>(
  data: T,
  status: number = 400
): Response {
  return Response.json({ status: 'fail', data }, { status });
}

/**
 * 创建错误响应（服务器错误）
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: number,
  data?: any
): Response {
  return Response.json({ status: 'error', message, code, data }, { status });
}

// ================================
// 错误处理工具函数
// ================================

/**
 * 统一错误处理函数
 * 将不同类型的错误转换为标准的 JSend 响应
 */
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  // Zod 验证错误
  if (error instanceof z.ZodError) {
    const validationErrors: Record<string, string> = {};
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      validationErrors[field] = err.message;
    });

    return createFailResponse(validationErrors, 400);
  }

  // Prisma 错误
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // 唯一约束冲突
        const target = error.meta?.target as string[] | undefined;
        const field = target?.[0] || '字段';
        return createFailResponse({ [field]: `${field} 已存在` }, 409);

      case 'P2025': // 记录不存在
        return createFailResponse({ error: '请求的资源不存在' }, 404);

      case 'P2003': // 外键约束失败
        return createFailResponse({ error: '关联的资源不存在或已被删除' }, 400);

      case 'P2014': // 关系违反约束
        return createFailResponse({ error: '无法删除，存在关联数据' }, 400);

      default:
        console.error('Prisma Error:', error.code, error.message);
        return createErrorResponse('数据库操作失败', 500);
    }
  }

  // Prisma 其他错误
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    console.error('Prisma Unknown Error:', error.message);
    return createErrorResponse('数据库连接错误', 500);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error('Prisma Validation Error:', error.message);
    return createErrorResponse('数据验证错误', 500);
  }

  // 业务逻辑错误（自定义错误类）
  if (error instanceof AuthenticationError) {
    return createFailResponse({ error: error.message }, 401);
  }

  if (error instanceof AuthorizationError) {
    return createFailResponse({ error: error.message }, 403);
  }

  if (error instanceof ValidationError) {
    return createFailResponse(error.errors, 400);
  }

  if (error instanceof NotFoundError) {
    return createFailResponse({ error: error.message }, 404);
  }

  if (error instanceof ConflictError) {
    return createFailResponse(
      { error: error.message, details: error.details },
      409
    );
  }

  // 通用 Error 对象
  if (error instanceof Error) {
    // 开发环境下显示详细错误信息
    if (process.env.NODE_ENV === 'development') {
      return createErrorResponse(error.message, 500);
    }
    return createErrorResponse('服务器内部错误', 500);
  }

  // 未知错误
  return createErrorResponse('服务器内部错误', 500);
}

// ================================
// 自定义错误类
// ================================

export class AuthenticationError extends Error {
  constructor(message: string = '身份验证失败') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = '权限不足') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('数据验证失败');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string = '资源') {
    super(`${resource}不存在`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ConflictError';
  }
}

// ================================
// 验证工具函数
// ================================

/**
 * 输入数据消毒（防止 XSS）
 */
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (input && typeof input === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * 验证并消毒请求数据
 */
export async function validateAndSanitize<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    const sanitizedBody = sanitizeInput(body);
    return schema.parse(sanitizedBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw error; // 重新抛出，由 handleApiError 处理
    }
    throw new ValidationError({ body: '请求数据格式不正确' });
  }
}

// ================================
// 数据库事务工具函数
// ================================

/**
 * 执行数据库事务
 * 提供统一的事务处理和错误回滚
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(async (tx) => {
    try {
      return await fn(tx);
    } catch (error) {
      // 事务会自动回滚
      console.error('Transaction failed:', error);
      throw error;
    }
  });
}

// ================================
// 请求认证工具函数
// ================================

/**
 * 获取当前认证用户，如果未认证则抛出错误
 */
export async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new AuthenticationError('请先登录');
  }

  // 获取用户详细信息
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    throw new AuthenticationError('用户不存在或已被禁用');
  }

  return user;
}

// ================================
// API 路由包装器
// ================================

/**
 * API 路由包装器，提供统一的错误处理和审计日志
 */
export function withApiHandler(
  handler: (request: Request, context: any) => Promise<Response>
) {
  return async (request: Request, context: any): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * 需要认证的 API 路由包装器
 */
export function withAuthApiHandler<
  T extends Record<string, unknown> = Record<string, unknown>
>(
  handler: (
    request: Request,
    user: {
      id: number;
      username: string;
      email: string;
      fullName?: string | null;
      isActive: boolean;
    },
    context: T
  ) => Promise<Response>
) {
  return withApiHandler(async (request: Request, context: T) => {
    const user = await requireAuth();
    return await handler(request, user, context);
  });
}

// ================================
// 辅助工具函数
// ================================

/**
 * 生成安全的随机字符串
 */
export function generateSecureToken(length: number = 32): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);

  for (let i = 0; i < length; i++) {
    result += chars[randomArray[i] % chars.length];
  }

  return result;
}

/**
 * 延迟执行（用于防暴力破解）
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 安全的时间比较（防时序攻击）
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * 格式化错误信息以便日志记录
 */
export function formatErrorForLogging(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\nStack: ${error.stack}`;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

/**
 * 检查是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * 检查是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
