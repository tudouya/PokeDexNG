// NextRequest imported but not used in this file
import { targetService } from '@/features/targets';
import {
  UpdateTargetSchema,
  TargetIdSchema
} from '@/features/targets/validations/target.validation';
import {
  withAuthApiHandler,
  createSuccessResponse,
  validateAndSanitize,
  NotFoundError
} from '@/lib/services/shared.utils';

// GET /api/targets/[id] - 获取单个目标
export const GET = withAuthApiHandler(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    // Next.js 15: await params before use
    const { id: paramId } = await params;
    // 验证ID参数
    const { id } = TargetIdSchema.parse({ id: paramId });

    // 查询目标
    const target = await targetService.findOne(id);

    if (!target) {
      throw new NotFoundError('目标');
    }

    return createSuccessResponse(target);
  }
);

// PUT /api/targets/[id] - 更新目标
export const PUT = withAuthApiHandler(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    // Next.js 15: await params before use
    const { id: paramId } = await params;
    // 验证ID参数
    const { id } = TargetIdSchema.parse({ id: paramId });

    // 验证和消毒请求数据
    const validatedData = await validateAndSanitize(
      request,
      UpdateTargetSchema
    );

    // 检查目标名称是否重复（如果修改了名称）
    if (validatedData.name && validatedData.projectName) {
      const nameExists = await targetService.checkNameExists(
        validatedData.projectName,
        validatedData.name,
        id // 排除当前目标
      );

      if (nameExists) {
        throw new Error('同一项目内目标名称不能重复');
      }
    }

    // 更新目标
    const target = await targetService.update(id, validatedData);

    if (!target) {
      throw new NotFoundError('目标');
    }

    return createSuccessResponse(target);
  }
);

// DELETE /api/targets/[id] - 软删除目标
export const DELETE = withAuthApiHandler(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    // Next.js 15: await params before use
    const { id: paramId } = await params;
    // 验证ID参数
    const { id } = TargetIdSchema.parse({ id: paramId });

    // 软删除目标
    const target = await targetService.softDelete(id);

    if (!target) {
      throw new NotFoundError('目标');
    }

    return createSuccessResponse({
      message: '目标已删除',
      target
    });
  }
);
