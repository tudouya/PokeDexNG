/**
 * Users Management API Route
 * 提供用户列表查询和管理功能的API端点
 *
 * 满足要求：
 * - 3.1: 管理员用户管理界面，提供用户列表、搜索、筛选功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/auth/session';
import { getUserList } from '@/lib/services/user.service';
import {
  createSuccessResponse,
  createErrorResponse,
  createFailResponse
} from '@/lib/services/shared.utils';
import { checkPermission, PERMISSIONS } from '@/lib/auth/permissions';

/**
 * GET /api/users - 获取用户列表
 *
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 20)
 * - search: 搜索关键词 (用户名、邮箱、全名)
 * - isActive: 用户状态筛选 (true/false)
 * - roleId: 角色筛选
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证用户身份和权限
    const userId = await getCurrentUserId();

    if (!userId) {
      return createFailResponse({ error: '未授权访问' }, 401);
    }

    // 检查用户读取权限
    const hasPermission = await checkPermission(PERMISSIONS.USER.READ);

    if (!hasPermission) {
      return createFailResponse(
        {
          error: '权限不足：需要用户读取权限',
          details: {
            requiredPermission: PERMISSIONS.USER.READ
          }
        },
        403
      );
    }

    // 2. 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '20', 10),
      100
    ); // 最大100条
    const search = searchParams.get('search') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const roleIdParam = searchParams.get('roleId');

    const isActive =
      isActiveParam === null ? undefined : isActiveParam === 'true';
    const roleId = roleIdParam ? parseInt(roleIdParam, 10) : undefined;

    // 3. 获取用户列表
    const result = await getUserList({
      page,
      limit,
      search,
      isActive,
      roleId
    });

    // 4. 转换为安全的DTO格式
    const usersDTO = result.users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName
      }))
    }));

    return createSuccessResponse({
      users: usersDTO,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    });
  } catch (error) {
    console.error('Users API Error:', error);

    return createErrorResponse('获取用户列表失败', 500);
  }
}
