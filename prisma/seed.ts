/**
 * Prisma 种子数据
 * 初始化RBAC权限系统的基础数据
 */

import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  generateSecurePassword,
  validatePassword
} from '../src/lib/auth/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始执行种子数据...');

  // 1. 创建权限
  console.log('📋 创建权限...');
  const permissions = [
    // 项目管理权限 (project)
    {
      name: 'project.create',
      displayName: '创建项目',
      description: '创建新的渗透测试项目',
      category: 'project'
    },
    {
      name: 'project.read',
      displayName: '查看项目',
      description: '查看项目信息和详情',
      category: 'project'
    },
    {
      name: 'project.update',
      displayName: '更新项目',
      description: '修改项目信息',
      category: 'project'
    },
    {
      name: 'project.delete',
      displayName: '删除项目',
      description: '删除项目（谨慎操作）',
      category: 'project'
    },
    {
      name: 'project.assign_users',
      displayName: '分配项目成员',
      description: '为项目分配和管理团队成员',
      category: 'project'
    },

    // 漏洞管理权限 (vulnerability)
    {
      name: 'vulnerability.create',
      displayName: '创建漏洞',
      description: '记录新发现的安全漏洞',
      category: 'vulnerability'
    },
    {
      name: 'vulnerability.read',
      displayName: '查看漏洞',
      description: '查看漏洞详情和信息',
      category: 'vulnerability'
    },
    {
      name: 'vulnerability.update',
      displayName: '更新漏洞',
      description: '修改漏洞信息和状态',
      category: 'vulnerability'
    },
    {
      name: 'vulnerability.delete',
      displayName: '删除漏洞',
      description: '删除漏洞记录',
      category: 'vulnerability'
    },
    {
      name: 'vulnerability.approve',
      displayName: '审批漏洞',
      description: '审批和确认漏洞的有效性',
      category: 'vulnerability'
    },

    // 报告管理权限 (report)
    {
      name: 'report.create',
      displayName: '创建报告',
      description: '创建渗透测试报告',
      category: 'report'
    },
    {
      name: 'report.read',
      displayName: '查看报告',
      description: '查看测试报告内容',
      category: 'report'
    },
    {
      name: 'report.update',
      displayName: '更新报告',
      description: '修改和完善报告内容',
      category: 'report'
    },
    {
      name: 'report.export',
      displayName: '导出报告',
      description: '将报告导出为PDF/Word等格式',
      category: 'report'
    },
    {
      name: 'report.publish',
      displayName: '发布报告',
      description: '正式发布报告给客户',
      category: 'report'
    },

    // 用户管理权限 (user)
    {
      name: 'user.create',
      displayName: '创建用户',
      description: '添加新的系统用户',
      category: 'user'
    },
    {
      name: 'user.read',
      displayName: '查看用户',
      description: '查看用户信息和列表',
      category: 'user'
    },
    {
      name: 'user.update',
      displayName: '更新用户',
      description: '修改用户基本信息',
      category: 'user'
    },
    {
      name: 'user.delete',
      displayName: '删除用户',
      description: '删除用户账户',
      category: 'user'
    },
    {
      name: 'user.manage_roles',
      displayName: '管理用户角色',
      description: '分配和管理用户的系统角色',
      category: 'user'
    },

    // 系统管理权限 (system)
    {
      name: 'system.audit',
      displayName: '查看审计日志',
      description: '查看系统操作的审计记录',
      category: 'system'
    },
    {
      name: 'system.settings',
      displayName: '修改系统设置',
      description: '修改系统全局配置',
      category: 'system'
    }
  ];

  // 批量创建权限（使用 upsert 避免重复）
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission
    });
  }
  console.log(`✅ 创建了 ${permissions.length} 个权限`);

  // 2. 创建角色
  console.log('👥 创建角色...');
  const roles = [
    {
      name: 'system_admin',
      displayName: '系统管理员',
      description: '系统超级用户，拥有所有权限，负责系统维护和用户管理',
      isSystem: true // 系统角色，不可删除
    },
    {
      name: 'security_manager',
      displayName: '安全经理',
      description: '安全团队负责人，负责项目管理、团队协调和质量把控',
      isSystem: true
    },
    {
      name: 'penetration_tester',
      displayName: '渗透测试工程师',
      description: '执行渗透测试，记录漏洞，编写技术报告',
      isSystem: true
    },
    {
      name: 'developer',
      displayName: '开发者',
      description: '系统开发和维护人员，拥有调试和只读权限',
      isSystem: true
    }
  ];

  const createdRoles: any[] = [];
  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role
    });
    createdRoles.push(createdRole);
  }
  console.log(`✅ 创建了 ${roles.length} 个角色`);

  // 3. 分配角色权限
  console.log('🔗 分配角色权限...');

  // 获取所有权限
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

  // 获取所有角色
  const roleMap = new Map(createdRoles.map((r) => [r.name, r.id]));

  // 权限分配定义
  const rolePermissions = {
    // 系统管理员：所有权限
    system_admin: allPermissions.map((p) => p.name),

    // 安全经理：项目管理 + 审批权限
    security_manager: [
      'project.create',
      'project.read',
      'project.update',
      'project.delete',
      'project.assign_users',
      'vulnerability.read',
      'vulnerability.approve',
      'report.create',
      'report.read',
      'report.update',
      'report.export',
      'report.publish',
      'user.read'
    ],

    // 渗透测试工程师：测试执行权限
    penetration_tester: [
      'project.read',
      'vulnerability.create',
      'vulnerability.read',
      'vulnerability.update',
      'vulnerability.delete',
      'report.create',
      'report.read',
      'report.update'
    ],

    // 开发者：只读权限 + 调试权限
    developer: [
      'project.read',
      'vulnerability.read',
      'report.read',
      'system.audit'
    ]
  };

  // 批量分配权限
  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const roleId = roleMap.get(roleName);
    if (!roleId) continue;

    for (const permissionName of permissionNames) {
      const permissionId = permissionMap.get(permissionName);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId,
            permissionId
          }
        },
        update: {},
        create: {
          roleId,
          permissionId
        }
      });
    }
  }
  console.log('✅ 完成角色权限分配');

  // 4. 创建超级管理员用户
  console.log('👤 创建超级管理员用户...');

  // 从环境变量读取管理员密码
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('❌ 缺少环境变量 ADMIN_PASSWORD');
    console.log(
      '💡 请设置环境变量：export ADMIN_PASSWORD="your-secure-password"'
    );
    process.exit(1);
  }

  const passwordValidation = validatePassword(adminPassword);

  if (!passwordValidation.isValid) {
    console.error('❌ 管理员密码不符合安全要求:', passwordValidation.errors);
    console.log('💡 密码必须包含大小写字母、数字和特殊字符，长度至少8位');
    process.exit(1);
  }

  const hashedPassword = await hashPassword(adminPassword);
  console.log('🔐 密码加密完成');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pokedex.com' },
    update: {},
    create: {
      email: 'admin@pokedex.com',
      username: 'admin',
      passwordHash: hashedPassword,
      fullName: '系统管理员',
      avatar: null,
      isActive: true
    }
  });

  // 为管理员分配系统管理员角色
  const adminRoleId = roleMap.get('system_admin');
  if (adminRoleId) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRoleId
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRoleId,
        assignedBy: adminUser.id // 自己分配给自己
      }
    });
  }
  console.log('✅ 创建超级管理员用户');

  // 5. 记录初始化审计日志
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'system.initialize',
      resourceType: 'system',
      resourceId: null,
      changes: {
        permissions: permissions.length,
        roles: roles.length,
        users: 1,
        message: 'RBAC系统初始化完成'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'Prisma Seed Script'
    }
  });

  console.log('🎉 种子数据执行完成！');
  console.log('');
  console.log('📊 统计信息:');
  console.log(`  - 权限: ${permissions.length} 个`);
  console.log(`  - 角色: ${roles.length} 个`);
  console.log('  - 用户: 1 个');
  console.log('');
  console.log('🔑 超级管理员账户:');
  console.log('  邮箱: admin@pokedex.com');
  console.log('  用户名: admin');
  console.log('  密码: [已从环境变量 ADMIN_PASSWORD 设置]');
  console.log('');
  console.log('⚠️  请确保密码强度足够，并定期更换！');
}

main()
  .catch((e) => {
    console.error('❌ 种子数据执行失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
