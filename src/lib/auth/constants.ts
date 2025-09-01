/**
 * 🎯 权限常量定义
 *
 * 提供类型安全的权限名称引用
 * 集中管理所有权限，便于维护
 */

/**
 * 权限常量定义
 */
export const PERMISSIONS = {
  // 项目权限
  PROJECT: {
    CREATE: 'project.create',
    READ: 'project.read',
    UPDATE: 'project.update',
    DELETE: 'project.delete',
    MANAGE: 'project.manage'
  },

  // 漏洞权限
  VULNERABILITY: {
    CREATE: 'vulnerability.create',
    READ: 'vulnerability.read',
    UPDATE: 'vulnerability.update',
    DELETE: 'vulnerability.delete',
    MANAGE: 'vulnerability.manage'
  },

  // 报告权限
  REPORT: {
    CREATE: 'report.create',
    READ: 'report.read',
    UPDATE: 'report.update',
    DELETE: 'report.delete',
    EXPORT: 'report.export'
  },

  // 用户权限
  USER: {
    CREATE: 'user.create',
    READ: 'user.read',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    MANAGE: 'user.manage'
  },

  // 系统权限
  SYSTEM: {
    ADMIN: 'system.admin',
    CONFIG: 'system.config',
    AUDIT: 'system.audit',
    BACKUP: 'system.backup'
  }
} as const;

/**
 * 角色常量定义
 */
export const ROLES = {
  ADMIN: 'admin',
  TESTER: 'tester',
  VIEWER: 'viewer',
  MANAGER: 'manager'
} as const;

/**
 * 权限类型定义
 */
export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];

/**
 * 角色类型定义
 */
export type Role = (typeof ROLES)[keyof typeof ROLES];
