import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { vulnerabilityService } from '@/features/vulnerabilities/services/vulnerability.service';
import { UpdateVulnerabilitySchema } from '@/features/vulnerabilities/validations/vulnerability.validation';
import { ValidationError } from '@/lib/errors';

// GET /api/vulnerabilities/[id] - 获取漏洞详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的漏洞ID' } },
        { status: 400 }
      );
    }

    const vulnerability = await vulnerabilityService.findById(
      id,
      session.user.id
    );

    return NextResponse.json({
      status: 'success',
      data: vulnerability
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取漏洞详情失败:', error);

    if (error instanceof Error && error.message === '漏洞不存在') {
      return NextResponse.json(
        { status: 'fail', data: { message: '漏洞不存在' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: '获取漏洞详情失败' },
      { status: 500 }
    );
  }
}

// PUT /api/vulnerabilities/[id] - 更新漏洞
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的漏洞ID' } },
        { status: 400 }
      );
    }

    const body = await request.json();

    // 验证输入数据
    const validatedData = UpdateVulnerabilitySchema.parse({
      id,
      ...body,
      // 处理日期字段
      foundDate: body.foundDate ? new Date(body.foundDate) : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined
    });

    // 更新漏洞
    const vulnerability = await vulnerabilityService.update(
      validatedData,
      session.user.id
    );

    return NextResponse.json({
      status: 'success',
      data: vulnerability
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('更新漏洞失败:', error);

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
      { status: 'error', message: '更新漏洞失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/vulnerabilities/[id] - 删除漏洞
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const { id: idString } = await params;
    const id = parseInt(idString);
    if (isNaN(id)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的漏洞ID' } },
        { status: 400 }
      );
    }

    await vulnerabilityService.delete(id, session.user.id);

    return NextResponse.json({
      status: 'success',
      data: true
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('删除漏洞失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { status: 'fail', data: { message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: '删除漏洞失败' },
      { status: 500 }
    );
  }
}
