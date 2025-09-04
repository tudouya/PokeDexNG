import { NextRequest } from 'next/server';
import { targetService } from '@/features/targets';
import {
  withAuthApiHandler,
  createSuccessResponse
} from '@/lib/services/shared.utils';
import { z } from 'zod';

const StatsQuerySchema = z.object({
  projectName: z.string().optional()
});

// GET /api/targets/stats - 获取目标统计信息
export const GET = withAuthApiHandler(async (request) => {
  const { searchParams } = new URL(request.url);

  // 将 URLSearchParams 转换为普通对象
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // 验证查询参数
  const { projectName } = StatsQuerySchema.parse(params);

  // 获取统计信息
  const stats = await targetService.getStats(projectName);

  return createSuccessResponse(stats);
});
