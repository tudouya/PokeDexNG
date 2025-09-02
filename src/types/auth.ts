/**
 * Authentication Type Definitions
 * 简化认证系统类型定义 - 仅包含基本认证功能
 */

// ============================================================================
// Base Authentication Types
// ============================================================================

/**
 * 登录凭据接口
 * 支持用户名或邮箱登录
 */
export interface LoginCredentials {
  username: string; // 用户名或邮箱
  password: string;
}

/**
 * 注册用户请求DTO
 * 用于创建新用户的数据传输对象
 */
export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
  fullName?: string;
  avatar?: string;
}

/**
 * 安全的用户数据传输对象
 * 不包含敏感信息（如密码哈希），用于API响应
 */
export interface UserDTO {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string; // ISO 8601 string
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

/**
 * 用户个人资料更新DTO
 * 用于用户更新自己的个人信息
 */
export interface UpdateUserProfileDTO {
  fullName?: string;
  avatar?: string;
}

/**
 * 密码更改请求DTO
 */
export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// Session Types
// ============================================================================

/**
 * 简化的用户会话信息
 */
export interface SessionUser {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

/**
 * 认证会话类型
 */
export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * JSend标准响应格式 - 成功响应
 */
export interface AuthSuccessResponse<T = any> {
  status: 'success';
  data: T;
}

/**
 * JSend标准响应格式 - 失败响应（客户端错误）
 */
export interface AuthFailResponse {
  status: 'fail';
  data: {
    message: string;
    field?: string;
    errors?: Record<string, string[]>;
  };
}

/**
 * JSend标准响应格式 - 错误响应（服务器错误）
 */
export interface AuthErrorResponse {
  status: 'error';
  message: string;
  code?: string;
}

/**
 * 统一的API响应类型
 */
export type AuthApiResponse<T = any> =
  | AuthSuccessResponse<T>
  | AuthFailResponse
  | AuthErrorResponse;

// ============================================================================
// Authentication State Types
// ============================================================================

/**
 * 认证状态枚举
 */
export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  ERROR = 'error'
}

/**
 * 认证状态管理接口
 */
export interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * 登录表单状态
 */
export interface LoginFormState {
  credentials: LoginCredentials;
  isSubmitting: boolean;
  error: string | null;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * 认证错误类型
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USERNAME_EXISTS = 'USERNAME_EXISTS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * 认证错误详情
 */
export interface AuthError {
  type: AuthErrorType;
  message: string;
  field?: string;
  details?: Record<string, any>;
}
