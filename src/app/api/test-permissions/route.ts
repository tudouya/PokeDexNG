/**
 * 🧪 权限系统测试API端点
 *
 * 用于验证新权限系统是否正常工作
 * 生产环境应删除此文件
 */

import {
  checkPermission,
  checkMultiplePermissions
} from '@/lib/auth/permissions';
import { PERMISSIONS } from '@/lib/auth/constants';

export async function GET() {
  try {
    // 测试单个权限检查
    const canReadUsers = await checkPermission(PERMISSIONS.USER.READ);
    const canCreateUsers = await checkPermission(PERMISSIONS.USER.CREATE);
    const canDeleteUsers = await checkPermission(PERMISSIONS.USER.DELETE);

    // 测试批量权限检查
    const multipleResults = await checkMultiplePermissions([
      PERMISSIONS.USER.READ,
      PERMISSIONS.USER.CREATE,
      PERMISSIONS.PROJECT.READ,
      PERMISSIONS.VULNERABILITY.READ,
      PERMISSIONS.SYSTEM.ADMIN
    ]);

    return Response.json({
      message: '新权限系统测试结果',
      singlePermissionTests: {
        'user.read': canReadUsers,
        'user.create': canCreateUsers,
        'user.delete': canDeleteUsers
      },
      multiplePermissionTest: multipleResults,
      timestamp: new Date().toISOString(),
      systemStatus: '✅ 权限系统正常运行'
    });
  } catch (error) {
    console.error('权限系统测试失败:', error);

    return Response.json(
      {
        message: '权限系统测试失败',
        error: error instanceof Error ? error.message : '未知错误',
        systemStatus: '❌ 权限系统异常',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
