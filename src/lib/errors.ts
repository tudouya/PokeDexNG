import { ZodError } from 'zod';

// 验证错误类
export class ValidationError extends Error {
  public errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.errors = errors;
  }

  // 从 Zod 错误创建验证错误
  static fromZodError(error: ZodError): ValidationError {
    const errors: Record<string, string[]> = {};

    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(err.message);
    });

    return new ValidationError(errors);
  }
}

// 权限错误类
export class AuthorizationError extends Error {
  constructor(message: string = '权限不足') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// 认证错误类
export class AuthenticationError extends Error {
  constructor(message: string = '请先登录') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

// 资源未找到错误类
export class NotFoundError extends Error {
  constructor(message: string = '资源不存在') {
    super(message);
    this.name = 'NotFoundError';
  }
}

// 业务逻辑错误类
export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
}

// 错误处理工具函数
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    return {
      status: 'fail' as const,
      data: error.errors,
      statusCode: 400
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      status: 'fail' as const,
      data: { message: error.message },
      statusCode: 401
    };
  }

  if (error instanceof AuthorizationError) {
    return {
      status: 'fail' as const,
      data: { message: error.message },
      statusCode: 403
    };
  }

  if (error instanceof NotFoundError) {
    return {
      status: 'fail' as const,
      data: { message: error.message },
      statusCode: 404
    };
  }

  if (error instanceof BusinessError) {
    return {
      status: 'fail' as const,
      data: { message: error.message },
      statusCode: 400
    };
  }

  if (error instanceof ZodError) {
    const validationError = ValidationError.fromZodError(error);
    return {
      status: 'fail' as const,
      data: validationError.errors,
      statusCode: 400
    };
  }

  if (error instanceof Error) {
    return {
      status: 'error' as const,
      message: '服务器内部错误',
      statusCode: 500
    };
  }

  return {
    status: 'error' as const,
    message: '未知错误',
    statusCode: 500
  };
}

// JSend 响应格式类型
export type JSendResponse<T = any> =
  | { status: 'success'; data: T }
  | { status: 'fail'; data: any }
  | { status: 'error'; message: string; data?: any };
