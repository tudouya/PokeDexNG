import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { vulnerabilityService } from '@/features/vulnerabilities/services/vulnerability.service';

// GET /api/vulnerabilities/targets - 获取目标选项
export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const targets = await vulnerabilityService.getTargetOptions();

    return NextResponse.json({
      status: 'success',
      data: targets
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取目标选项失败:', error);

    return NextResponse.json(
      { status: 'error', message: '获取目标选项失败' },
      { status: 500 }
    );
  }
}
