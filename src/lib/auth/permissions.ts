/**
 * 🛡️ 统一权限检查系统
 *
 * 核心理念：
 * - 权限信息实时从数据库查询，确保准确性
 * - 使用新的简洁会话系统
 * - 无缓存复杂性，遵循YAGNI原则
 * - 简洁易懂，易于维护
 */

import { prisma } from '@/lib/db';
import { getCurrentUserId } from './session';

// ================================
// 权限常量 - 保持与现有系统一致
// ================================

export const PERMISSIONS = {
  // 系统管理
  SYSTEM: {
    ADMIN: 'system.admin',
    CONFIG: 'system.config',
    AUDIT: 'system.audit',
    BACKUP: 'system.backup'
  },

  // 用户管理
  USER: {
    CREATE: 'user.create',
    READ: 'user.read',
    UPDATE: 'user.update',
    DELETE: 'user.delete',
    MANAGE: 'user.manage',
    ASSIGN: 'user.assign'
  },

  // 项目管理
  PROJECT: {
    CREATE: 'project.create',
    READ: 'project.read',
    UPDATE: 'project.update',
    DELETE: 'project.delete',
    MANAGE: 'project.manage'
  },

  // 漏洞管理
  VULNERABILITY: {
    CREATE: 'vulnerability.create',
    READ: 'vulnerability.read',
    UPDATE: 'vulnerability.update',
    DELETE: 'vulnerability.delete',
    MANAGE: 'vulnerability.manage'
  },

  // 报告管理
  REPORT: {
    CREATE: 'report.create',
    READ: 'report.read',
    UPDATE: 'report.update',
    DELETE: 'report.delete',
    GENERATE: 'report.generate'
  }
} as const;

/**
 * 🎯 唯一的权限检查函数
 *
 * 服务器端使用，直接查询数据库
 * 支持通配符权限（如 user.* 匹配 user.read）
 *
 * @param permission 权限名称，格式：resource.action
 * @returns Promise<boolean> 是否具有权限
 */
export async function checkPermission(permission: string): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return false;

    // 检查是否有匹配的权限
    return user.userRoles.some((userRole) =>
      userRole.role.permissions.some((rolePermission) => {
        const permissionName = rolePermission.permission.name;
        // 精确匹配或通配符匹配
        return (
          permissionName === permission ||
          permissionName === `${permission.split('.')[0]}.*`
        );
      })
    );
  } catch (error) {
    console.error('权限检查失败:', error);
    // 安全失败：出错时拒绝访问
    return false;
  }
}

/**
 * 🛡️ API路由权限装饰器
 *
 * 用于保护API路由，权限不足时抛出错误
 *
 * @param permission 需要的权限
 * @throws Error 权限不足时抛出错误
 */
export async function requirePermission(permission: string): Promise<void> {
  const hasPermission = await checkPermission(permission);
  if (!hasPermission) {
    throw new Error(`权限不足，需要权限: ${permission}`);
  }
}

/**
 * 📊 批量权限检查
 *
 * 同时检查多个权限，提高效率
 *
 * @param permissions 权限列表
 * @returns Promise<Record<string, boolean>> 权限检查结果映射
 */
export async function checkMultiplePermissions(
  permissions: string[]
): Promise<Record<string, boolean>> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      // 未认证，所有权限都是false
      return permissions.reduce(
        (acc, permission) => {
          acc[permission] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return permissions.reduce(
        (acc, permission) => {
          acc[permission] = false;
          return acc;
        },
        {} as Record<string, boolean>
      );
    }

    // 提取用户所有权限
    const userPermissions = new Set<string>();
    user.userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        userPermissions.add(rolePermission.permission.name);
      });
    });

    // 检查每个权限
    const results: Record<string, boolean> = {};
    permissions.forEach((permission) => {
      results[permission] =
        userPermissions.has(permission) ||
        userPermissions.has(`${permission.split('.')[0]}.*`);
    });

    return results;
  } catch (error) {
    console.error('批量权限检查失败:', error);
    // 安全失败：出错时拒绝所有权限
    return permissions.reduce(
      (acc, permission) => {
        acc[permission] = false;
        return acc;
      },
      {} as Record<string, boolean>
    );
  }
}

/**
 * 🔍 获取用户权限列表
 *
 * 用于调试和管理界面显示用户权限
 *
 * @returns Promise<string[]> 用户权限列表
 */
export async function getUserPermissions(): Promise<string[]> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return [];

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isActive: true
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) return [];

    // 提取并去重权限
    const permissionsSet = new Set<string>();
    user.userRoles.forEach((userRole) => {
      userRole.role.permissions.forEach((rolePermission) => {
        permissionsSet.add(rolePermission.permission.name);
      });
    });

    return Array.from(permissionsSet).sort();
  } catch (error) {
    console.error('获取用户权限失败:', error);
    return [];
  }
}
