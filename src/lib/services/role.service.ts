/**
 * 角色管理服务
 * 处理角色查询、权限管理等相关业务逻辑
 *
 * 设计原则：
 * - Service层直接使用Prisma，不引入Repository抽象
 * - 承担所有角色相关的业务逻辑和数据访问
 * - 提供清晰的接口供API路由调用
 */

import { prisma } from '@/lib/db';

/**
 * 角色DTO类型
 */
interface RoleDTO {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissions: PermissionDTO[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 权限DTO类型
 */
interface PermissionDTO {
  id: number;
  name: string;
  displayName: string;
  category: string;
  description: string | null;
}

/**
 * 查询选项接口
 */
interface QueryRoleOptions {
  includeSystem?: boolean;
  includePermissions?: boolean;
  includeUserCount?: boolean;
}

/**
 * 角色服务类
 */
export class RoleService {
  /**
   * 获取可分配的角色列表
   * @param includeSystem 是否包含系统角色
   * @returns 角色列表
   */
  async getAssignableRoles(includeSystem: boolean = false): Promise<RoleDTO[]> {
    const roles = await prisma.role.findMany({
      where: includeSystem ? {} : { isSystem: false },
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                displayName: true,
                category: true,
                description: true
              }
            }
          }
        },
        _count: {
          select: { userRoles: true }
        }
      },
      orderBy: [
        { isSystem: 'asc' }, // 系统角色排在后面
        { name: 'asc' }
      ]
    });

    return roles.map((role) => this.toRoleDTO(role));
  }

  /**
   * 根据ID获取单个角色
   * @param roleId 角色ID
   * @param options 查询选项
   * @returns 角色信息或null
   */
  async getRoleById(
    roleId: number,
    options: QueryRoleOptions = {}
  ): Promise<RoleDTO | null> {
    const { includePermissions = true, includeUserCount = true } = options;

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        ...(includePermissions && {
          permissions: {
            include: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  displayName: true,
                  category: true,
                  description: true
                }
              }
            }
          }
        }),
        ...(includeUserCount && {
          _count: {
            select: { userRoles: true }
          }
        })
      }
    });

    if (!role) {
      return null;
    }

    return this.toRoleDTO(role);
  }

  /**
   * 获取所有权限列表（用于角色权限分配）
   * @param category 权限分类筛选
   * @returns 权限列表
   */
  async getAllPermissions(category?: string): Promise<PermissionDTO[]> {
    const permissions = await prisma.permission.findMany({
      where: category ? { category } : {},
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    return permissions.map((permission) => ({
      id: permission.id,
      name: permission.name,
      displayName: permission.displayName,
      category: permission.category,
      description: permission.description
    }));
  }

  /**
   * 获取权限分类列表
   * @returns 权限分类数组
   */
  async getPermissionCategories(): Promise<string[]> {
    const categories = await prisma.permission.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });

    return categories.map((c) => c.category);
  }

  /**
   * 检查角色是否存在
   * @param roleId 角色ID
   * @returns 角色是否存在
   */
  async roleExists(roleId: number): Promise<boolean> {
    const count = await prisma.role.count({
      where: { id: roleId }
    });

    return count > 0;
  }

  /**
   * 检查角色是否为系统角色
   * @param roleId 角色ID
   * @returns 是否为系统角色
   */
  async isSystemRole(roleId: number): Promise<boolean> {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { isSystem: true }
    });

    return role?.isSystem ?? false;
  }

  /**
   * 获取用户的角色列表
   * @param userId 用户ID
   * @returns 用户的角色列表
   */
  async getUserRoles(userId: number): Promise<RoleDTO[]> {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true,
                    category: true,
                    description: true
                  }
                }
              }
            },
            _count: {
              select: { userRoles: true }
            }
          }
        }
      }
    });

    return userRoles.map((ur) => this.toRoleDTO(ur.role));
  }

  /**
   * 将角色数据转换为DTO
   * @param role 角色数据
   * @returns 角色DTO
   */
  private toRoleDTO(role: any): RoleDTO {
    return {
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isSystem: role.isSystem,
      permissions: role.permissions
        ? role.permissions.map((rp: any) => ({
            id: rp.permission.id,
            name: rp.permission.name,
            displayName: rp.permission.displayName,
            category: rp.permission.category,
            description: rp.permission.description
          }))
        : [],
      userCount: role._count?.userRoles ?? 0,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    };
  }
}

// 导出单例实例（可选，也可以在使用时new）
export const roleService = new RoleService();
