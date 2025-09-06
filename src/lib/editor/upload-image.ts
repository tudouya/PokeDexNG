/**
 * 上传图片到服务器
 * @param file 图片文件
 * @returns 图片访问URL
 */
export async function uploadImage(file: File): Promise<string> {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    throw new Error('只能上传图片文件');
  }

  // 验证文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('图片文件大小不能超过5MB');
  }

  // 创建表单数据
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== 'success') {
      const message = result?.message || result?.data?.message || '上传失败';
      throw new Error(message);
    }

    return result.data.url;
  } catch (error) {
    console.error('图片上传失败:', error);
    throw error;
  }
}

/**
 * 从剪贴板获取图片文件
 * @param clipboardEvent 剪贴板事件
 * @returns 图片文件数组
 */
export function getImagesFromClipboard(clipboardEvent: ClipboardEvent): File[] {
  const items = clipboardEvent.clipboardData?.items;
  if (!items) return [];

  const images: File[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        images.push(file);
      }
    }
  }

  return images;
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @returns 验证结果
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 检查文件类型
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: '只支持 JPEG、PNG、GIF、WebP 格式的图片'
    };
  }

  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: '图片文件大小不能超过5MB'
    };
  }

  // 检查文件名
  if (!file.name || file.name.length > 255) {
    return {
      valid: false,
      error: '文件名无效或过长'
    };
  }

  return { valid: true };
}
