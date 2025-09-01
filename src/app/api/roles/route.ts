/**
 * Roles API Route
 * 提供角色列表查询功能的API端点
 *
 * 满足要求：
 * - 3.3: 为角色分配功能提供可用角色列表
 * - 4.4: 支持用户详情页面的角色管理功能
 */

import {
  createSuccessResponse,
  requireAuthWithPermission,
  withApiHandler
} from '@/lib/services/shared.utils';
import { PERMISSIONS } from '@/lib/auth/constants';
import { roleService } from '@/lib/services/role.service';

/**
 * GET /api/roles - 获取可分配的角色列表
 *
 * Query Parameters:
 * - includeSystem: 是否包含系统角色 (默认: false)
 */
export const GET = withApiHandler(async (request: Request) => {
  // 检查权限 - 需要用户管理权限
  await requireAuthWithPermission(PERMISSIONS.USER.MANAGE);

  // 解析查询参数
  const { searchParams } = new URL(request.url);
  const includeSystem = searchParams.get('includeSystem') === 'true';

  // 查询角色列表
  const rolesData = await roleService.getAssignableRoles(includeSystem);

  return createSuccessResponse({
    roles: rolesData,
    total: rolesData.length,
    categories: Array.from(
      new Set(
        rolesData.flatMap((role) => role.permissions.map((p) => p.category))
      )
    ).sort()
  });
});
