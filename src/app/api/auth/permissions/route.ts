/**
 * 🛡️ 权限查询 API
 *
 * GET /api/auth/permissions - 获取当前用户所有权限
 * POST /api/auth/permissions - 检查特定权限或批量权限
 *
 * 替换原有的多个权限检查端点，统一权限查询接口
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getUserPermissions,
  checkPermission,
  checkMultiplePermissions
} from '@/lib/auth/permissions';
import { getCurrentUserId } from '@/lib/auth/session';

// 权限检查请求 Schema
const permissionCheckSchema = z
  .object({
    type: z.enum(['permission', 'permissions']),
    permission: z.string().optional(),
    permissions: z.array(z.string()).optional()
  })
  .refine(
    (data) =>
      (data.type === 'permission' && data.permission) ||
      (data.type === 'permissions' &&
        data.permissions &&
        data.permissions.length > 0),
    {
      message: '请求数据格式错误',
      path: ['type']
    }
  );

/**
 * 获取当前用户的所有权限列表
 */
export async function GET() {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json(
        {
          status: 'fail',
          data: {
            error: '用户未登录'
          }
        },
        { status: 401 }
      );
    }

    const permissions = await getUserPermissions();

    return Response.json({
      status: 'success',
      data: {
        userId,
        permissions,
        count: permissions.length
      }
    });
  } catch (error) {
    console.error('获取用户权限失败:', error);

    return Response.json(
      {
        status: 'error',
        message: '权限查询服务不可用'
      },
      { status: 500 }
    );
  }
}

/**
 * 检查权限
 * 支持单个权限检查和批量权限检查
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return Response.json(
        {
          status: 'fail',
          data: {
            error: '用户未登录'
          }
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证请求数据
    const result = permissionCheckSchema.safeParse(body);
    if (!result.success) {
      return Response.json(
        {
          status: 'fail',
          data: {
            error: '请求数据格式错误',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const { type, permission, permissions } = result.data;

    if (type === 'permission' && permission) {
      // 单个权限检查
      const hasPermission = await checkPermission(permission);

      return Response.json({
        status: 'success',
        data: {
          permission,
          hasPermission
        }
      });
    }

    if (type === 'permissions' && permissions) {
      // 批量权限检查
      const permissionResults = await checkMultiplePermissions(permissions);

      return Response.json({
        status: 'success',
        data: {
          permissions: permissionResults,
          requestedCount: permissions.length,
          grantedCount: Object.values(permissionResults).filter(Boolean).length
        }
      });
    }

    return Response.json(
      {
        status: 'fail',
        data: {
          error: '无效的权限检查请求'
        }
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('权限检查失败:', error);

    return Response.json(
      {
        status: 'error',
        message: '权限检查服务不可用'
      },
      { status: 500 }
    );
  }
}
