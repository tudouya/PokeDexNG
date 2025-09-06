// NextRequest imported but not used in this file
import { targetService } from '@/features/targets';
import {
  CreateTargetSchema,
  FindTargetsSchema
} from '@/features/targets/validations/target.validation';
import {
  withAuthApiHandler,
  createSuccessResponse,
  validateAndSanitize
  // NotFoundError - imported but not used in this file
} from '@/lib/services/shared.utils';

// GET /api/targets - 获取目标列表
export const GET = withAuthApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  // 将 URLSearchParams 转换为普通对象
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // 验证查询参数
  const validatedParams = FindTargetsSchema.parse(params);

  // 查询目标列表
  const result = await targetService.findAll(validatedParams);

  return createSuccessResponse(result);
});

// POST /api/targets - 创建新目标
export const POST = withAuthApiHandler(async (request) => {
  // 验证和消毒请求数据
  const validatedData = await validateAndSanitize(request, CreateTargetSchema);

  // 检查目标名称是否重复（在同一项目内）
  const nameExists = await targetService.checkNameExists(
    validatedData.projectName || '',
    validatedData.name
  );

  if (nameExists) {
    throw new Error('同一项目内目标名称不能重复');
  }

  // 创建目标
  const target = await targetService.create(validatedData);

  return createSuccessResponse(target);
});
