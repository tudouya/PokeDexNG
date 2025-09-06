import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

interface RouteParams {
  params: Promise<{
    year: string;
    month: string;
    filename: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 验证用户身份（确保只有登录用户可以访问图片）
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    const { year, month, filename } = await params;

    // 验证参数格式
    if (!year || !month || !filename) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的图片路径' } },
        { status: 400 }
      );
    }

    // 验证年份和月份格式
    if (!/^\d{4}$/.test(year) || !/^\d{2}$/.test(month)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的日期格式' } },
        { status: 400 }
      );
    }

    // 验证文件名格式（UUID + 扩展名）
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|jpeg|png|gif|webp)$/i.test(
        filename
      )
    ) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的文件名格式' } },
        { status: 400 }
      );
    }

    // 构建文件路径
    const filePath = join(
      process.cwd(),
      'uploads',
      'images',
      year,
      month,
      filename
    );

    try {
      // 检查文件是否存在
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) {
        return NextResponse.json(
          { status: 'fail', data: { message: '图片不存在' } },
          { status: 404 }
        );
      }

      // 读取文件
      const fileBuffer = await readFile(filePath);

      // 根据文件扩展名确定Content-Type
      const extension = filename.split('.').pop()?.toLowerCase();
      const contentType = getContentType(extension || '');

      // 设置缓存头
      const headers = new Headers({
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable', // 缓存1年
        ETag: `"${filename}"`
      });

      // 检查If-None-Match头（ETag缓存）
      const ifNoneMatch = request.headers.get('if-none-match');
      if (ifNoneMatch === `"${filename}"`) {
        return new NextResponse(null, { status: 304, headers });
      }

      return new NextResponse(fileBuffer, { headers });
    } catch (fileError) {
      // 文件不存在或读取失败
      return NextResponse.json(
        { status: 'fail', data: { message: '图片不存在' } },
        { status: 404 }
      );
    }
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('图片访问失败:', error);

    return NextResponse.json(
      { status: 'error', message: '图片访问失败' },
      { status: 500 }
    );
  }
}

// 根据文件扩展名获取Content-Type
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp'
  };

  return contentTypes[extension] || 'image/jpeg';
}
