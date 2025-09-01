/**
 * System-wide Audit Log API Route
 * 提供系统级审计日志查询和监控功能
 *
 * 满足要求：
 * - 4.1: 系统级审计日志记录和访问控制
 * - 4.2: 审计数据的完整性和安全存储
 * - 4.3: 审计日志的查询和分析功能
 * - 4.4: 包括审计跟踪显示功能，用于合规性要求
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
 * GET /api/audit - 获取系统级审计日志
 *
 * 权限要求：system.audit - 系统审计权限
 *
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 50, 最大: 200)
 * - action: 过滤特定操作类型 (如: login, logout, permission_denied)
 * - resourceType: 过滤特定资源类型 (如: user, role, permission)
 * - resourceId: 过滤特定资源ID
 * - userId: 过滤特定用户ID
 * - startDate: 开始日期 (ISO string)
 * - endDate: 结束日期 (ISO string)
 * - ipAddress: 过滤特定IP地址
 * - search: 搜索关键词 (在action, resourceType中搜索)
 *
 * Response:
 * - auditLogs: 审计日志数组
 * - pagination: 分页信息
 * - filters: 当前过滤器
 * - stats: 统计信息
 */
export const GET = withApiHandler(async (request: Request) => {
  // 检查权限 - 需要系统审计权限 (要求4.1)
  await requireAuthWithPermission(PERMISSIONS.SYSTEM.AUDIT);

  const { searchParams } = new URL(request.url);

  // 解析分页参数
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  // 解析过滤参数
  const action = searchParams.get('action') || undefined;
  const resourceType = searchParams.get('resourceType') || undefined;
  const resourceId = searchParams.get('resourceId')
    ? parseInt(searchParams.get('resourceId')!, 10)
    : undefined;
  const userId = searchParams.get('userId')
    ? parseInt(searchParams.get('userId')!, 10)
    : undefined;
  const ipAddress = searchParams.get('ipAddress') || undefined;
  const search = searchParams.get('search') || undefined;

  // 解析日期参数
  let startDate: Date | undefined;
  let endDate: Date | undefined;

  try {
    if (searchParams.get('startDate')) {
      startDate = new Date(searchParams.get('startDate')!);
      if (isNaN(startDate.getTime())) {
        return createFailResponse({ startDate: '开始日期格式无效' }, 400);
      }
    }

    if (searchParams.get('endDate')) {
      endDate = new Date(searchParams.get('endDate')!);
      if (isNaN(endDate.getTime())) {
        return createFailResponse({ endDate: '结束日期格式无效' }, 400);
      }
    }

    // 验证日期范围
    if (startDate && endDate && startDate > endDate) {
      return createFailResponse({ dateRange: '开始日期不能晚于结束日期' }, 400);
    }
  } catch (error) {
    return createFailResponse(
      { dateFormat: '日期格式错误，请使用ISO格式' },
      400
    );
  }

  // 调用AuditService获取系统级审计日志
  const auditData = await auditService.getSystemAuditLogs({
    page,
    limit,
    action,
    resourceType,
    resourceId,
    userId,
    ipAddress,
    search,
    startDate,
    endDate
  });

  return createSuccessResponse(auditData);
});

/**
 * OPTIONS /api/audit - 预检请求处理
 * 支持CORS预检请求
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
