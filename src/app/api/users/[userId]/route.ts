/**
 * User Details API Routes
 * 提供单个用户的详细信息、更新、角色管理等功能的API端点
 *
 * 满足要求：
 * - 3.3: 管理员修改用户角色时立即更新权限并记录完整审计日志
 * - 4.4: 提供用户详细信息和角色管理功能
 */

// Removed NextRequest import since we use Request for withApiHandler compatibility
import {
  getUserWithDetails,
  updateUserRoles,
  validateUserData,
  type UpdateUserRolesRequest
} from '@/lib/services/user.service';
import {
  createSuccessResponse,
  createErrorResponse,
  createFailResponse,
  requireAuthWithPermission,
  extractAuditContext,
  handleApiError,
  withApiHandler,
  ValidationError
} from '@/lib/services/shared.utils';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db';
import { z } from 'zod';

// 用户更新请求验证模式
const UpdateUserSchema = z.object({
  email: z.string().email('邮箱格式不正确').optional(),
  username: z
    .string()
    .min(3, '用户名长度至少3个字符')
    .max(20, '用户名长度最多20个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线')
    .optional(),
  fullName: z.string().max(50, '全名长度不能超过50个字符').optional(),
  roleIds: z.array(z.number()).optional(),
  reason: z.string().optional()
});

type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;

/**
 * GET /api/users/[userId] - 获取用户详细信息
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

    // 检查权限
    const user = await requireAuthWithPermission(PERMISSIONS.USER.READ);

    // 获取用户详细信息
    const userDetails = await getUserWithDetails(userId);

    if (!userDetails) {
      return createFailResponse({ error: '用户不存在' }, 404);
    }

    // 转换为安全的DTO格式
    const userDTO = {
      id: userDetails.id,
      email: userDetails.email,
      username: userDetails.username,
      fullName: userDetails.fullName,
      isActive: userDetails.isActive,
      lastLoginAt: userDetails.lastLoginAt?.toISOString(),
      createdAt: userDetails.createdAt.toISOString(),
      updatedAt: userDetails.updatedAt.toISOString(),
      roles: userDetails.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        displayName: ur.role.displayName,
        description: ur.role.description,
        permissions: ur.role.permissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          displayName: rp.permission.displayName,
          category: rp.permission.category
        }))
      }))
    };

    return createSuccessResponse(userDTO);
  }
);

/**
 * PATCH /api/users/[userId] - 更新用户信息和角色
 */
export const PATCH = withApiHandler(
  async (
    request: Request,
    context: { params: Promise<{ userId: string }> }
  ) => {
    const params = await context.params;
    const targetUserId = parseInt(params.userId, 10);

    if (isNaN(targetUserId)) {
      return createFailResponse({ userId: '无效的用户ID' }, 400);
    }

    // 检查权限
    const adminUser = await requireAuthWithPermission(PERMISSIONS.USER.UPDATE);

    // 验证请求数据
    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    if (!existingUser) {
      return createFailResponse({ error: '用户不存在' }, 404);
    }

    const result: any = {};

    // 提取审计上下文
    const auditContext = await extractAuditContext(
      request,
      'user_updated',
      'user',
      targetUserId
    );

    // 更新基本用户信息
    if (
      validatedData.email ||
      validatedData.username ||
      validatedData.fullName !== undefined
    ) {
      // 验证用户数据的唯一性
      const validation = await validateUserData({
        email: validatedData.email,
        username: validatedData.username,
        fullName: validatedData.fullName,
        existingUserId: targetUserId
      });

      if (!validation.isValid) {
        throw new ValidationError(validation.errors);
      }

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: {
          ...(validatedData.email && { email: validatedData.email }),
          ...(validatedData.username && { username: validatedData.username }),
          ...(validatedData.fullName !== undefined && {
            fullName: validatedData.fullName
          }),
          updatedAt: new Date()
        }
      });

      result.user = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        isActive: updatedUser.isActive,
        lastLoginAt: updatedUser.lastLoginAt?.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      };
    }

    // 更新用户角色（如果提供了roleIds）
    if (validatedData.roleIds !== undefined) {
      const roleUpdateRequest: UpdateUserRolesRequest = {
        userId: targetUserId,
        roleIds: validatedData.roleIds,
        reason: validatedData.reason || '管理员更新用户角色'
      };

      const roleUpdateResult = await updateUserRoles(
        adminUser.id,
        roleUpdateRequest,
        auditContext
      );

      result.roleUpdate = {
        addedRoles: roleUpdateResult.addedRoles.map((r) => ({
          id: r.id,
          name: r.name,
          displayName: r.displayName
        })),
        removedRoles: roleUpdateResult.removedRoles.map((r) => ({
          id: r.id,
          name: r.name,
          displayName: r.displayName
        })),
        currentRoles: roleUpdateResult.currentRoles.map((r) => ({
          id: r.id,
          name: r.name,
          displayName: r.displayName
        }))
      };
    }

    return createSuccessResponse({
      message: '用户信息更新成功',
      ...result
    });
  }
);

/**
 * DELETE /api/users/[userId] - 停用/激活用户
 * 注意：这里不是真正删除，而是切换用户状态
 */
export const DELETE = withApiHandler(
  async (
    request: Request,
    context: { params: Promise<{ userId: string }> }
  ) => {
    const params = await context.params;
    const targetUserId = parseInt(params.userId, 10);

    if (isNaN(targetUserId)) {
      return createFailResponse({ userId: '无效的用户ID' }, 400);
    }

    // 检查权限
    const adminUser = await requireAuthWithPermission(PERMISSIONS.USER.DELETE);

    // 获取查询参数中的操作类型
    const url = new URL(request.url || '');
    const { searchParams } = url;
    const action = searchParams.get('action'); // 'deactivate' | 'reactivate'
    const reason = searchParams.get('reason') || '管理员操作';

    if (!action || !['deactivate', 'reactivate'].includes(action)) {
      return createFailResponse(
        { action: '无效的操作类型，支持：deactivate, reactivate' },
        400
      );
    }

    // 提取审计上下文
    const auditContext = await extractAuditContext(
      request,
      action === 'deactivate' ? 'user_deactivated' : 'user_reactivated',
      'user',
      targetUserId
    );

    // 动态导入函数以避免循环引用
    const { deactivateUser, reactivateUser } = await import(
      '@/lib/services/user.service'
    );

    if (action === 'deactivate') {
      const result = await deactivateUser(
        adminUser.id,
        targetUserId,
        reason,
        auditContext
      );
      return createSuccessResponse({
        message: '用户已停用',
        userId: result.userId,
        isActive: result.isActive,
        reason: result.statusChangeReason,
        changedAt: result.changedAt.toISOString()
      });
    } else {
      const result = await reactivateUser(
        adminUser.id,
        targetUserId,
        reason,
        auditContext
      );
      return createSuccessResponse({
        message: '用户已激活',
        userId: result.userId,
        isActive: result.isActive,
        reason: result.statusChangeReason,
        changedAt: result.changedAt.toISOString()
      });
    }
  }
);
