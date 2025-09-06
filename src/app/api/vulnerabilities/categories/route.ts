import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { vulnerabilityService } from '@/features/vulnerabilities/services/vulnerability.service';

// GET /api/vulnerabilities/categories - 获取分类选项
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const categories = await vulnerabilityService.getCategoryOptions();

    return NextResponse.json({
      status: 'success',
      data: categories
    });
  } catch (error) {
    console.error('获取分类选项失败:', error);

    return NextResponse.json(
      { status: 'error', message: '获取分类选项失败' },
      { status: 500 }
    );
  }
}
