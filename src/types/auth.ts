/**
 * Authentication Type Definitions
 * 认证系统类型定义 - 为RBAC权限控制系统提供类型安全
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
  roles: string[]; // 角色名称数组
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
// NextAuth Session Extensions
// ============================================================================

/**
 * 扩展的用户会话信息
 * 集成RBAC权限数据到NextAuth会话中
 */
export interface ExtendedUser {
  id: number;
  email: string;
  username: string;
  fullName?: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

/**
 * NextAuth会话扩展类型
 * 包含完整的RBAC权限信息
 */
export interface AuthSession {
  user: ExtendedUser;
  expires: string;
}

/**
 * NextAuth JWT Token扩展
 * 存储在JWT中的用户信息
 */
export interface AuthToken {
  id: number;
  email: string;
  username: string;
  name?: string;
  picture?: string;
  roles: string[];
  permissions?: string[];
  iat: number;
  exp: number;
}

// ============================================================================
// Role and Permission Types
// ============================================================================

/**
 * 权限信息DTO
 */
export interface PermissionDTO {
  id: number;
  name: string; // 格式: resource.action (如: project.create)
  displayName: string;
  description?: string;
  category: string; // project, vulnerability, report, user, system
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色信息DTO
 */
export interface RoleDTO {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: PermissionDTO[];
}

/**
 * 用户-角色关联信息DTO
 */
export interface UserRoleDTO {
  id: number;
  userId: number;
  roleId: number;
  assignedBy?: number;
  assignedByUsername?: string;
  createdAt: string;
  updatedAt: string;
  role: RoleDTO;
}

/**
 * 角色分配请求DTO
 */
export interface AssignRoleDTO {
  userId: number;
  roleId: number;
}

/**
 * 权限检查结果
 */
export interface PermissionCheck {
  hasPermission: boolean;
  requiredPermission: string;
  userPermissions: string[];
}

// ============================================================================
// Audit and Security Types
// ============================================================================

/**
 * 认证事件类型
 * 用于审计日志记录
 */
export type AuthEventType =
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'password_changed'
  | 'user_created'
  | 'user_updated'
  | 'user_deactivated'
  | 'role_assigned'
  | 'role_removed';

/**
 * 审计日志DTO
 */
export interface AuditLogDTO {
  id: number;
  userId?: number;
  username?: string;
  action: string;
  resourceType: string;
  resourceId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

/**
 * 认证事件数据
 * 用于记录认证相关的审计日志
 */
export interface AuthEvent {
  userId?: number;
  action: AuthEventType;
  resourceType: 'auth' | 'user' | 'role';
  resourceId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: {
    provider?: string;
    isNewUser?: boolean;
    failureReason?: string;
    previousRoles?: string[];
    newRoles?: string[];
  };
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
  user: ExtendedUser | null;
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
// Permission Utilities Types
// ============================================================================

/**
 * 权限资源类型
 */
export type ResourceType =
  | 'project'
  | 'vulnerability'
  | 'report'
  | 'user'
  | 'system';

/**
 * 权限操作类型
 */
export type ActionType =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'manage'
  | 'assign';

/**
 * 权限字符串构建器
 */
export type Permission = `${ResourceType}.${ActionType}`;

/**
 * 预定义的系统权限
 */
export const PERMISSIONS = {
  // 项目管理权限
  PROJECT: {
    CREATE: 'project.create',
    READ: 'project.read',
    UPDATE: 'project.update',
    DELETE: 'project.delete',
    MANAGE: 'project.manage'
  },
  // 漏洞管理权限
  VULNERABILITY: {
    CREATE: 'vulnerability.create',
    READ: 'vulnerability.read',
    UPDATE: 'vulnerability.update',
    DELETE: 'vulnerability.delete',
    MANAGE: 'vulnerability.manage'
  },
  // 报告管理权限
  REPORT: {
    CREATE: 'report.create',
    READ: 'report.read',
    UPDATE: 'report.update',
    DELETE: 'report.delete',
    MANAGE: 'report.manage'
  },
  // 用户管理权限
  USER: {
    CREATE: 'user.create',
    READ: 'user.read',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    MANAGE: 'user.manage',
    ASSIGN: 'user.assign'
  },
  // 系统管理权限
  SYSTEM: {
    MANAGE: 'system.manage',
    READ: 'system.read'
  }
} as const;

/**
 * 角色名称常量
 */
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  TESTER: 'tester',
  VIEWER: 'viewer'
} as const;

/**
 * 角色类型
 */
export type RoleType = (typeof ROLES)[keyof typeof ROLES];

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
  PERMISSION_DENIED = 'PERMISSION_DENIED',
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
