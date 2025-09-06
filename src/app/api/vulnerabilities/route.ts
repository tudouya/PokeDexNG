import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { vulnerabilityService } from '@/features/vulnerabilities/services/vulnerability.service';
import {
  CreateVulnerabilitySchema,
  VulnerabilityListParamsSchema
} from '@/features/vulnerabilities/validations/vulnerability.validation';
import { ValidationError } from '@/lib/errors';

// GET /api/vulnerabilities - 获取漏洞列表
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!)
        : 10,
      search: searchParams.get('search') || undefined,
      severity: searchParams.getAll('severity') || undefined,
      status: searchParams.getAll('status') || undefined,
      targetId: searchParams.get('targetId')
        ? parseInt(searchParams.get('targetId')!)
        : undefined,
      categoryId: searchParams.get('categoryId')
        ? parseInt(searchParams.get('categoryId')!)
        : undefined,
      assignedTo: searchParams.get('assignedTo')
        ? parseInt(searchParams.get('assignedTo')!)
        : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
    };

    // 验证参数
    const validatedParams = VulnerabilityListParamsSchema.parse(params);

    // 获取漏洞列表
    const result = await vulnerabilityService.findMany(validatedParams);

    return NextResponse.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取漏洞列表失败:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { status: 'fail', data: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: '获取漏洞列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/vulnerabilities - 创建漏洞
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const body = await request.json();

    // 验证输入数据
    const validatedData = CreateVulnerabilitySchema.parse({
      ...body,
      // 处理日期字段
      foundDate: body.foundDate ? new Date(body.foundDate) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    });

    // 创建漏洞
    const vulnerability = await vulnerabilityService.create(
      validatedData,
      session.user.id
    );

    return NextResponse.json(
      {
        status: 'success',
        data: vulnerability
      },
      { status: 201 }
    );
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('创建漏洞失败:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { status: 'fail', data: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { status: 'fail', data: { message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: '创建漏洞失败' },
      { status: 500 }
    );
  }
}
