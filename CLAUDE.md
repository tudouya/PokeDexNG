# CLAUDE.md - Pokedex

## 1. Mission（使命）

为渗透测试人员提供漏洞管理平台，将手工报告编写时间从2小时降到10分钟，实现漏洞全生命周期管理。

## 2. Boundaries（边界）

**核心功能：**

- 项目管理 - 渗透测试项目全生命周期管理
- 漏洞记录 - 完整记录漏洞信息、POC、复现步骤
- 知识管理 - 构建可复用的漏洞知识库
- 报告生成 - 自动生成专业渗透测试报告

**平台定位：**
这是一个漏洞信息管理平台，专注于：

- ✅ 记录和组织渗透测试发现
- ✅ 安全存储POC和敏感信息
- ✅ 协作和知识共享
- ✅ 自动化报告生成

**明确边界：**

- 不是扫描工具 - 不执行自动化漏洞扫描
- 不是攻击平台 - 不提供漏洞利用执行环境
- 不是通用PM工具 - 专注于安全测试场景

## 3. Tech Stack（技术栈）

```yaml
核心框架:
  - Next.js 15 (App Router)
  - TypeScript 5.7+
  - React 19

数据存储:
  - MySQL 8.0+ # 自建数据库
  - Prisma 5+ # 类型安全ORM

认证授权:
  - NextAuth.js v5 # 自建认证系统
  - bcryptjs 2.4+ # 密码加密
  - 自研RBAC # 权限系统

监控与质量:
  - ESLint 8+ # 代码检查
  - Prettier 3+ # 代码格式化
  - Husky 9+ # Git钩子

UI与交互:
  - shadcn/ui # UI组件库
  - Tailwind CSS v4
  - Recharts 2.15+ # 图表
  - Tanstack Table 8+ # 表格
  - React Hook Form 7+ + Zod 3+

状态管理:
  - Zustand 5+ # 全局状态管理
  - Nuqs 2+ # URL状态

用户体验:
  - Kbar # 命令面板(⌘+K)
  - Sonner # 通知系统
  - Motion 11+ # 动画
  - nextjs-toploader 3+ # 加载进度

开发工具:
  - lint-staged 15+ # 暂存区检查
  - date-fns 4+ # 日期处理
  - @dnd-kit 6+ # 拖拽功能
  - uuid 11+ # 唯一ID
```

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

#### Feature Module详细结构

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
  - ✅ 编译成功
  - ✅ 通过所有现有测试
  - ✅ 为新功能包含测试
  - ✅ 遵循项目的格式化和Linting规范
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
- **统一响应**: `{ data: T | null, error: string | null }`
- **认证**: NextAuth.js v5 + JWT（RBAC在服务层检查）

### 代码结构
```typescript
// API路由：仅做控制器
export async function POST(request: Request) {
  const user = await getServerSession();
  const data = await vulnerabilityService.create(user, body);
  return Response.json({ data, error: null });
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

### 代码结构
```typescript
// 自定义Hook：数据获取逻辑
export function useVulnerabilities() {
  const { data, loading, error } = useVulnStore();
  
  const fetchVulns = useCallback(async () => {
    // 与API交互逻辑
  }, []);
  
  return { vulnerabilities: data, loading, error, fetchVulns };
}

// 表单：React Hook Form + Zod
const VulnForm = () => {
  const form = useForm<CreateVulnSchema>({
    resolver: zodResolver(createVulnSchema)
  });
  
  return <Form {...form}>...</Form>;
};
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
# 初始设置
cp env.example.txt .env.local    # 创建环境变量
npm install                      # 安装依赖

# 开发
npm run dev                      # 启动开发服务器
npm run build                    # 构建生产版本
npm run start                    # 启动生产服务器

# 数据库
npx prisma migrate dev           # 应用数据库迁移
npx prisma studio                # 启动Prisma Studio

# 代码质量
npm run typecheck               # TypeScript类型检查
npm run lint                    # ESLint检查
npm run lint:fix               # 自动修复lint问题
npm run format                 # 格式化代码
```

## 11. Quick Links（快速链接）

- **模板文档**: `/TEMPLATE_README.md`
- **API文档**: 运行项目后访问 `/api-docs`（待实现）
- **部署指南**: `/docs/deployment.md`（待创建）
- **贡献指南**: `/CONTRIBUTING.md`（待创建）
- **项目看板**: GitHub Projects
- **问题追踪**: GitHub Issues
