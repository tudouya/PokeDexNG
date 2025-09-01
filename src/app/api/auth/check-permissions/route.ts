/**
 * 📊 批量权限检查API端点
 *
 * POST /api/auth/check-permissions
 * Body: { permissions: string[] }
 *
 * 返回多个权限的检查结果
 */

import { checkMultiplePermissions } from '@/lib/auth/permissions';
import { NextRequest } from 'next/server';

/**
 * 批量权限检查
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { permissions } = body;

    // 验证请求数据
    if (!Array.isArray(permissions)) {
      return Response.json(
        {
          results: {},
          error: 'permissions 必须是字符串数组'
        },
        { status: 400 }
      );
    }

    // 限制权限检查数量（防止滥用）
    if (permissions.length > 20) {
      return Response.json(
        {
          results: {},
          error: '一次最多检查20个权限'
        },
        { status: 400 }
      );
    }

    // 验证权限格式
    const invalidPermissions = permissions.filter(
      (permission: any) =>
        typeof permission !== 'string' || !permission.includes('.')
    );

    if (invalidPermissions.length > 0) {
      return Response.json(
        {
          results: {},
          error: `无效的权限格式: ${invalidPermissions.join(', ')}`
        },
        { status: 400 }
      );
    }

    // 执行批量权限检查
    const results = await checkMultiplePermissions(permissions);

    return Response.json({
      results,
      checked: permissions.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('批量权限检查API错误:', error);

    return Response.json(
      {
        results: {},
        error: '权限检查服务不可用'
      },
      { status: 500 }
    );
  }
}
