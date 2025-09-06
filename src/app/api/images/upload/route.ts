import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import sharp from 'sharp';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// 支持的图片类型
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// 最大文件大小 (5MB)
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请先登录' } },
        { status: 401 }
      );
    }

    // 获取表单数据
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { status: 'fail', data: { message: '请选择图片文件' } },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          status: 'fail',
          data: { message: '只支持 JPEG、PNG、GIF、WebP 格式的图片' }
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { status: 'fail', data: { message: '图片文件大小不能超过5MB' } },
        { status: 400 }
      );
    }

    // 生成文件信息
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = uuidv4();
    const extension = getExtensionFromMimeType(file.type);
    const fileName = `${fileId}.${extension}`;

    // 创建存储路径（按年月分组）
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const uploadDir = join(process.cwd(), 'uploads', 'images', year, month);
    const filePath = join(uploadDir, fileName);

    // 确保目录存在
    const { mkdir } = await import('fs/promises');
    await mkdir(uploadDir, { recursive: true });

    try {
      // 使用sharp优化图片
      let processedBuffer = buffer;

      // 如果不是GIF，进行压缩优化
      if (file.type !== 'image/gif') {
        const sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();

        // 如果图片宽度超过1920px，进行缩放
        if (metadata.width && metadata.width > 1920) {
          sharpInstance.resize(1920, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
        }

        // 根据类型进行优化
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          processedBuffer = await sharpInstance
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        } else if (file.type === 'image/png') {
          processedBuffer = await sharpInstance
            .png({ quality: 85, progressive: true })
            .toBuffer();
        } else if (file.type === 'image/webp') {
          processedBuffer = await sharpInstance
            .webp({ quality: 85 })
            .toBuffer();
        } else {
          processedBuffer = await sharpInstance.toBuffer();
        }
      }

      // 写入文件
      await writeFile(filePath, processedBuffer);

      // 返回成功响应
      const imageUrl = `/api/images/${year}/${month}/${fileName}`;

      return NextResponse.json(
        {
          status: 'success',
          data: {
            id: fileId,
            url: imageUrl,
            originalName: file.name,
            fileName: fileName,
            fileSize: processedBuffer.length,
            mimeType: file.type,
            uploadedAt: new Date().toISOString()
          }
        },
        { status: 201 }
      );
    } catch (imageError) {
      // TODO: Replace with proper logging system
      // console.error('图片处理失败:', imageError);
      return NextResponse.json(
        { status: 'fail', data: { message: '图片处理失败' } },
        { status: 500 }
      );
    }
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('图片上传失败:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { status: 'fail', data: { message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { status: 'error', message: '图片上传失败' },
      { status: 500 }
    );
  }
}

// 根据MIME类型获取文件扩展名
function getExtensionFromMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };

  return mimeMap[mimeType] || 'jpg';
}
