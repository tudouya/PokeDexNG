import { NextRequest } from 'next/server';
import { targetService } from '@/features/targets';
import { TargetIdSchema } from '@/features/targets/validations/target.validation';
import {
  withAuthApiHandler,
  createSuccessResponse,
  NotFoundError
} from '@/lib/services/shared.utils';

// POST /api/targets/[id]/restore - 恢复已删除的目标
export const POST = withAuthApiHandler(
  async (request, user, { params }: { params: Promise<{ id: string }> }) => {
    // Next.js 15: await params before use
    const { id: paramId } = await params;
    // 验证ID参数
    const { id } = TargetIdSchema.parse({ id: paramId });

    // 恢复目标
    const target = await targetService.restore(id);

    if (!target) {
      throw new NotFoundError('目标');
    }

    return createSuccessResponse({
      message: '目标已恢复',
      target
    });
  }
);
