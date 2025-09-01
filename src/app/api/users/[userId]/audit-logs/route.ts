/**
 * User Audit Logs API Route
 * 提供用户审计日志查询功能的API端点
 *
 * 满足要求：
 * - 4.4: 包括审计跟踪显示功能，用于合规性要求
 * - 3.3: 显示用户操作的完整审计日志
 */

import {
  createSuccessResponse,
  createFailResponse,
  requireAuthWithPermission,
  withApiHandler
} from '@/lib/services/shared.utils';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { auditService } from '@/lib/services/audit.service';

/**
 * GET /api/users/[userId]/audit-logs - 获取用户相关的审计日志
 *
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 20, 最大: 100)
 * - action: 过滤特定操作类型
 * - startDate: 开始日期 (ISO string)
 * - endDate: 结束日期 (ISO string)
 */
export const GET = withApiHandler(
  async (
    request: Request,
    context: { params: Promise<{ userId: string }> }
  ) => {
    const params = await context.params;
    const userId = parseInt(params.userId, 10);

    if (isNaN(userId)) {
      return createFailResponse({ userId: '无效的用户ID' }, 400);
    }

    // 检查权限 - 需要系统审计权限
    await requireAuthWithPermission(PERMISSIONS.SYSTEM.AUDIT);

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const action = searchParams.get('action') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    try {
      // 调用AuditService获取用户审计日志
      const auditData = await auditService.getUserAuditLogs(userId, {
        page,
        limit,
        action,
        startDate,
        endDate
      });

      return createSuccessResponse(auditData);
    } catch (error) {
      if (error instanceof Error && error.message === '用户不存在') {
        return createFailResponse({ error: '用户不存在' }, 404);
      }
      throw error; // 让withApiHandler处理其他错误
    }
  }
);
