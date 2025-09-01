  架构分层: 原项目确实有完整的权限检查系统，但它是为Node.js环境设计的。Edge
  Runtime的引入创造了一个新的运行时边界，需要不同的实现策略。

  运行时差异: Node.js可以访问数据库、文件系统、原生模块；Edge
  Runtime只能使用Web标准APIs。这是两个完全不同的执行环境，需要不同的代码。

  权限检查的两个层次: 现在系统有两层权限检查 -
  Edge层（基于JWT，快速但静态）和Node层（基于数据库，慢但实时）。这是一种混合架构的最佳实践。


  原有的权限检查逻辑（存在且完善）

  项目中确实有完整的权限检查逻辑，主要分布在两个文件中：

  1. /src/lib/services/permission.service.ts

  // 第77-154行 - 主要权限检查函数
  export async function hasPermission(userId: number, permission: string): Promise<boolean> {
    // 使用Prisma查询数据库
    const userWithPermissions = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true }
                }
              }
            }
          }
        }
      }
    });
    // ... 权限匹配逻辑
  }

  2. /src/lib/services/shared.utils.ts

  // 第396-432行 - 简化的权限检查
  export async function checkPermission(userId: number, permission: string): Promise<boolean> {
    const userPermissions = await prisma.user.findUnique({
      where: { id: userId, isActive: true },
      include: { /* ... */ }
    });
    // ... 权限检查逻辑
  }

  // 第439-447行 - 强制权限检查
  export async function requirePermission(userId: number, permission: string): Promise<void> {
    const hasPermission = await checkPermission(userId, permission);
    if (!hasPermission) {
      throw new AuthorizationError(`需要权限: ${permission}`);
    }
  }

  为什么需要新的权限检查工具？

  运行时环境对比

  | 特性       | Node.js Runtime | Edge Runtime |
  |----------|-----------------|--------------|
  | 运行位置     | 服务器             | CDN边缘节点      |
  | Prisma支持 | ✅ 完全支持          | ❌ 不支持        |
  | 数据库访问    | ✅ 可以直接连接        | ❌ 不能连接       |
  | 文件系统     | ✅ fs模块          | ❌ 无文件系统      |
  | 启动时间     | 50-100ms        | < 1ms        |
  | 内存占用     | 约50MB           | 约1-2MB       |

  具体问题

  1. Middleware必须在Edge Runtime运行
  // middleware.ts 运行在 Edge Runtime
  export function middleware(request: NextRequest) {
    // ❌ 不能使用原有的权限服务
    // await hasPermission(userId, permission); // 会报错：Prisma is not defined

    // ✅ 必须使用新的Edge兼容方法
    const token = await getToken({ req: request });
    const permissions = token.permissions || [];
  }
  2. 原有服务依赖数据库
    - 所有原有权限函数都调用 prisma.user.findUnique()
    - Edge Runtime中没有数据库连接
    - 必须从JWT token中读取预存的权限
  3. 不同的使用场景

  3. API路由（Node.js Runtime）：
  // ✅ 可以使用原有权限服务
  import { hasPermission } from '@/lib/services/permission.service';

  export async function GET(request: Request) {
    // 可以查询数据库，获取最新权限
    const hasAccess = await hasPermission(userId, 'user.read');
  }

  3. Middleware（Edge Runtime）：
  // ✅ 必须使用新的权限检查工具
  import { checkPermissionFromToken } from '@/lib/auth/permission-check';

  export async function middleware(request: NextRequest) {
    // 从JWT读取权限，不查询数据库
    const result = await checkPermissionFromToken(request, 'user.read');
  }

  两套系统的协同工作

  现在系统有两套权限检查机制，它们互补工作：

  1. Edge层（新工具） - 快速初筛
    - 在middleware中执行
    - 基于JWT token中的权限快照
    - 毫秒级响应
    - 适合路由保护
  2. Node层（原有服务） - 精确验证
    - 在API路由中执行
    - 实时查询数据库
    - 获取最新权限状态
    - 适合敏感操作

  实际应用示例

  // 1. Middleware层 - 使用新工具进行快速检查
  export async function middleware(request: NextRequest) {
    // Edge Runtime兼容的权限检查
    const hasPermission = await checkPermissionFromToken(
      request,
      PERMISSIONS.USER.READ
    );
    if (!hasPermission) {
      return NextResponse.redirect('/unauthorized');
    }
  }

  // 2. API层 - 可以选择使用原有服务进行二次验证
  export async function POST(request: Request) {
    const session = await getServerSession();

    // 方案A：使用session中的权限（来自JWT，已在middleware检查过）
    const permissionCheck = checkPermissionFromSession(
      session,
      PERMISSIONS.USER.CREATE
    );

    // 方案B：使用原有服务进行实时数据库查询（更安全但更慢）
    // const hasPermission = await hasPermission(
    //   session.user.id,
    //   PERMISSIONS.USER.CREATE
    // );
  }

  总结

  - 原有权限检查逻辑存在且完善，但只能在Node.js环境使用
  - 新的权限检查工具是必需的，专门为Edge Runtime设计
  - 两套系统互补，不是替代关系而是协同关系
  - 选择依据：在哪个运行时环境决定使用哪套系统