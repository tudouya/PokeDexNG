# CLAUDE.md - Pokedex

## 1. Mission（使命）

为渗透测试人员提供漏洞管理平台，将手工报告编写时间从2小时降到10分钟，实现漏洞全生命周期管理。

## 2. Boundaries（边界）

**核心功能：**

- 目标管理 - 测试目标资产信息管理（网站、服务器、API等）
- 漏洞记录 - 完整记录漏洞信息、POC、复现步骤
- 漏洞分类 - 基于OWASP等标准的漏洞分类和严重性管理
- 报告生成 - 自动生成专业渗透测试报告

**长期目标：**

- 漏洞模板 - 常见漏洞的快速录入模板
- 知识库 - 构建可复用的企业漏洞知识库

**平台定位：**
这是一个漏洞信息管理平台，专注于：

- 记录和组织渗透测试发现
- 安全存储POC和敏感信息
- 协作和知识共享
- 自动化报告生成

**明确边界：**

- 不是扫描工具 - 不执行自动化漏洞扫描
- 不是攻击平台 - 不提供漏洞利用执行环境
- 不是项目管理工具 - 专注于目标和漏洞管理

## 3. Tech Stack（技术栈）

**核心**: Next.js 15 (App Router) / TypeScript / React 19  
**数据**: MySQL + Prisma ORM  
**认证**: NextAuth.js v5 + bcryptjs
**UI**: shadcn/ui + Tailwind CSS v4 + React Hook Form + Zod  
**状态**: Zustand (全局) + Nuqs (URL)  
**表格图表**: Tanstack Table + Recharts  
**用户体验**: Kbar (⌘+K) + Sonner (通知) + Motion (动画)  
**开发工具**: ESLint + Prettier + Husky + lint-staged

## 4. Philosophy & Architecture（理念与架构原则）

### 核心理念

1. **渐进式改进** - 优先选择可通过编译和测试的小步变更。
2. **从现有代码学习** - 在实现前，先研究和规划。
3. **实用主义** - 适应项目现实，而非拘泥于教条。
4. **清晰意图** - 代码应清晰直白，避免过度聪明的技巧。

### 核心编程准则

1. **DRY (Don't Repeat Yourself)** - 避免重复。任何一段知识（代码、逻辑、配置）在系统中都应该有单一、明确、权威的表示。优先选择复用，而不是复制粘贴。
2. **YAGNI (You Ain't Gonna Need It)** - 保持简单。只实现当前阶段真正需要的功能，避免为未来可能的需求进行过度设计和过早的抽象。

### 架构原则

1. **数据主权** - 所有数据必须存储在自控环境。
2. **零信任安全** - 每个请求都需要验证授权。
3. **最小权限** - 用户只能访问必要的资源。
4. **审计优先** - 所有敏感操作必须记录。
5. **组合优于继承** - 优先使用依赖注入和组合模式。
6. **显式优于隐式** - 保证清晰的数据流和依赖关系。

## 5. Decision Framework（决策框架）

当存在多个有效方法时，按以下优先级选择：

1. **可测试性** - 我能轻松地为它编写测试吗？
2. **可读性** - 六个月后，其他人能理解这段代码吗？
3. **一致性** - 这是否符合项目现有的模式和约定？
4. **简洁性** - 这是能解决问题的最简单的方案吗？
5. **可逆性** - 如果未来需要修改，这个决策的成本有多高？

## 6. Development Conventions（开发约定）

### 文件组织

```
project_root/
├── prisma/                # Prisma 数据库定义
│   ├── schema.prisma      # 数据库模型 Schema
│   └── migrations/        # 数据库迁移历史
│
├── src/                   # 应用程序源代码
│   ├── app/               # Next.js 15 App Router
│   │   ├── api/           # API路由 (后端控制器层)
│   │   ├── (auth)/        # 认证页面路由组
│   │   └── (dashboard)/   # 主应用页面路由组
│   ├── features/          # 功能模块 (特定业务域的代码)
│   ├── components/        # 共享UI组件 (跨功能复用)
│   ├── lib/               # 核心共享库
│   │   ├── auth/          # 认证配置和工具
│   │   ├── db/            # 数据库连接 (Prisma Client)
│   │   ├── validations/   # 共享的数据验证 schemas (Zod)
│   │   ├── services/      # 共享的业务服务层
│   │   └── utils/         # 通用工具函数
│   ├── hooks/             # 共享的自定义React Hooks
│   ├── constants/         # 全局常量
│   ├── config/            # 应用配置
│   └── types/             # 全局TypeScript类型定义 (包括共享DTO)
│
└── ... (package.json, next.config.js, etc.)
```

### Feature Module详细结构

```
features/
└── [feature-name]/          # 具体功能模块名（如：vulnerability-management）
    ├── __tests__/           # 模块测试
    │   ├── services/        # 业务逻辑单元测试
    │   └── components/      # 组件测试
    ├── services/            # 功能特定的后端业务逻辑
    ├── components/          # 功能特定的前端组件
    ├── hooks/              # 功能特定的React Hooks
    ├── validations/        # 功能特定的Zod schemas
    ├── types/              # 功能特定的类型定义 (包括DTO)
    └── index.ts            # 模块统一导出
```

### 模块组织原则

- **共享优先**: 优先将可复用逻辑（Services, Components, Hooks）放在顶层 `lib/`, `components/`, `hooks/` 目录中。
- **功能特定**: 仅当某段代码与特定业务功能紧密耦合且不可复用时，才将其放入 `features/` 目录。
- **测试就近**: 每个功能模块的测试应放在该模块的 `__tests__` 目录中，便于维护和理解。
- **统一导出**: 每个 feature 模块必须有 `index.ts` 文件，统一导出该模块的公共接口。

### 命名规范

#### 文件和目录

- **文件名**: `kebab-case` (如 `product-form.tsx`)
- **目录名**: `kebab-case` (如 `products/`)

#### 导出规范

- **组件导出**: named export + PascalCase (如 `export function ProductForm`)
- **工具函数**: named export + camelCase (如 `export function formatDate`)
- **自定义Hooks**: named export + camelCase (如 `export function useDebounce`)
- **常量**: named export + UPPER_SNAKE_CASE (如 `export const MAX_FILE_SIZE`)
- **页面组件**: default export (Next.js要求，如 `export default function HomePage`)

#### 数据层命名

- **Prisma模型**: `PascalCase`
- **数据库表**: `snake_case`
- **TypeScript类型/接口/DTO**: `PascalCase`

### 路由约定（Next.js 15 App Router）

- **路由组**: `(name)/` - 组织路由但不影响URL (如 `(dashboard)/`)
- **动态路由**: `[param]/` - 动态路由参数 (如 `[productId]/`)
- **捕获所有**: `[[...slug]]/` - 可选的捕获所有路由 (如 `[[...sign-in]]/`)
- **平行路由**: `@name/` - 同时渲染多个页面 (如 `@sales/`)

### 导入约定

- **使用绝对导入**: 始终使用 `@/` 前缀，避免相对导入 `../../../`
- **UI组件路径**: `@/components/ui/`
- **Feature组件路径**: `@/features/[feature]/components/`
- **工具函数路径**: `@/lib/utils/`
- **类型定义路径**: `@/types/`

### 代码质量标准

- **每次提交必须**:
  - 编译成功
  - 通过所有现有测试
  - 为新功能包含测试
  - 遵循项目的格式化和Linting规范
- **提交前检查**:
  - 运行格式化和Linting工具
  - 自我审查变更内容
  - 确保提交信息解释了“为什么”

### 错误处理标准

- **快速失败** - 提供具有描述性的错误信息。
- **包含上下文** - 错误信息应包含足以调试的上下文。
- **分层处理** - 在合适的抽象层级处理错误。
- **禁止静默忽略** - 绝不静默地吞掉异常。

## 7. Backend Essentials（后端要点）

### API 约定

- **RESTful风格** + DTO模式（禁止直接暴露Prisma模型）
- **响应格式**: 采用JSend标准（success/fail/error三态）
- **认证**: NextAuth.js v5 + JWT（RBAC在服务层检查）

### 代码结构

```typescript
// API路由：仅做控制器，返回JSend格式
export async function POST(request: Request) {
  try {
    const user = await getServerSession();
    const body = await request.json();
    const data = await vulnerabilityService.create(user, body);
    return Response.json({ status: 'success', data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return Response.json({ status: 'fail', data: error.errors }, { status: 400 });
    }
    return Response.json({ status: 'error', message: '服务器错误' }, { status: 500 });
  }
}

// 服务层：业务逻辑 + DTO转换
export const vulnerabilityService = {
  async create(user: User, input: CreateVulnDTO): Promise<VulnDTO> {
    const vuln = await prisma.vulnerability.create({...});
    return toVulnDTO(vuln); // 转换为安全的DTO
  }
}
```

### 环境配置

```bash
# .env.local（必需变量）
DATABASE_URL="mysql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
```

## 8. Frontend Essentials（前端要点）

### 状态管理

- **本地状态**: React内置 `useState/useReducer`
- **全局状态**: Zustand（用户会话、API数据、配置）
- **URL状态**: Nuqs（筛选器、分页等可分享状态）

### 数据获取规范

- **必须使用** `/docs/templates/hooks.md` 中定义的标准Hook模板
- **禁止** 直接在组件中调用fetch或自行实现数据获取逻辑
- **所有API调用** 必须通过标准化Hook处理JSend响应格式
- **错误处理** 必须使用统一的错误类型和显示组件

### 代码结构示例

```typescript
// ✅ 正确：使用标准Hook模板
import { useApiData } from '@/hooks/useApiData';

export function VulnerabilityList() {
  const { data, loading, error, refetch } = useApiData<Vulnerability[]>(
    '/api/vulnerabilities',
    { immediate: true }
  );

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return <div>{/* 渲染数据 */}</div>;
}

// ❌ 错误：直接使用fetch
export function BadExample() {
  useEffect(() => {
    fetch('/api/vulnerabilities').then(/* ... */); // 禁止这样做
  }, []);
}
```

## 9. Testing Strategy（测试策略）

### 核心原则

- **测试行为而非实现** - 关注功能是否正常，而非内部细节
- **就近原则** - 测试文件放在被测代码的 `__tests__` 目录
- **命名清晰** - 测试描述应说明场景和预期结果

### 测试命令

```bash
# 运行测试
npm test                 # 运行所有测试
npm test -- --watch     # 监听模式
npm test -- --coverage  # 生成覆盖率报告

# 测试特定文件
npm test -- user.test.ts
```

### 文件命名

- 单元/集成测试: `*.test.ts(x)`
- 组件测试: `*.component.test.tsx`
- E2E测试: `*.e2e.test.ts`

## 10. Key Commands（关键命令）

```bash
cp env.example.txt .env.local && npm install  # 初始设置
npm run dev                                   # 开发
npx prisma migrate dev                        # 数据库迁移
npx prisma studio                             # 数据库管理
npm run typecheck && npm run lint:fix         # 代码检查
```

## 11. Quick Links（快速链接）

### 开发资源

- **Hook模板**: `/docs/templates/hooks.md`
- **技术决策**: `/docs/decisions/` - 重要架构和技术选择的决策记录
- **技术债务**: `/docs/tech-debt.md` - 已知问题、临时方案、待重构项
- **临时想法**: `/docs/ideas.md` - 功能建议、改进想法、实验性方案
- **Starter模板**: `https://github.com/Kiranism/next-shadcn-dashboard-starter`