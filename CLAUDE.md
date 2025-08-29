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
  - Zustand 5+ # 全局状态
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

**注：**基于next-shadcn-dashboard-starter构建，使用自建认证系统以保护敏感数据。

## 4. Architecture Principles（架构原则）

1. **数据主权** - 所有数据必须存储在自控环境
2. **零信任安全** - 每个请求都需要验证授权
3. **最小权限** - 用户只能访问必要的资源
4. **审计优先** - 所有敏感操作必须记录
5. **简单可控** - 避免复杂的第三方依赖
6. **防御纵深** - 多层安全防护机制

## 5. Development Conventions（开发约定）

### 文件组织

```
project_root/
├── src/
│   ├── app/          # Next.js App Router (API and UI routes)
│   ├── features/     # Feature modules (business logic)
│   ├── components/   # Shared UI components
│   ├── lib/          # Core libraries, services, and utilities
│   ├── hooks/        # Shared custom React Hooks
│   ├── stores/       # Global state management (Zod)
│   ├── config/       # Application configuration
│   ├── constants/    # Constant values
│   └── types/        # Global TypeScript types
└── tests/            # Global tests (cross-feature)
    ├── e2e/          # End-to-end tests
    ├── integration/  # Cross-feature integration tests
    └── component/    # Shared component tests
```

### 命名规范

- 文件名：kebab-case（如 `product-form.tsx`）
- 目录名：kebab-case（如 `products/`）
- 组件导出：named export + PascalCase（如 `export function ProductForm`）
- 工具函数：named export + camelCase（如 `export function formatDate`）
- 自定义Hooks：named export + camelCase（如 `export function useDebounce`）
- 常量：named export + UPPER_SNAKE_CASE（如 `export const MAX_FILE_SIZE`）
- 页面组件：default export（Next.js要求，如 `export default function HomePage`）

### 路由约定（Next.js 15 App Router）

- 路由组：`(name)/` - 组织路由但不影响URL
- 动态路由：`[param]/` - 如 `[productId]/`
- 捕获所有：`[[...slug]]/` - 如 `[[...sign-in]]/`
- 平行路由：`@name/` - 如 `@sales/`

### 导入约定

- 使用绝对导入：`@/` 前缀
- 避免相对导入：不使用 `../../../`
- UI组件：`@/components/ui/`
- Feature组件：`@/features/[feature]/components/`

### 状态管理策略

- 客户端状态：Zustand stores
- URL状态：通过Nuqs管理
- 表单状态：React Hook Form + Zod验证
- 服务端数据：简单API调用（无缓存层）

### 代码质量标准

- 每个函数单一职责
- 避免超过3层的嵌套
- 优先使用纯函数
- 错误处理明确且有意义
- 所有用户输入必须验证

## 6. Key Commands（关键命令）

```bash
# 初始设置
cp env.example.txt .env.local    # 创建环境变量（可选，支持Clerk无密钥模式）
npm install                      # 安装依赖

# 开发
npm run dev                      # 启动开发服务器（Turbopack加速）
npm run build                    # 构建生产版本
npm run start                    # 启动生产服务器

# 代码质量
npm run typecheck               # TypeScript类型检查（快速）
npm run typecheck:watch         # 持续监控类型检查
npm run lint                    # ESLint检查
npm run lint:fix               # 自动修复lint问题
npm run lint:strict            # 严格模式（零警告，用于CI）
npm run format                 # 格式化代码
npm run format:check           # 检查格式（不修改文件）

# 开发工作流（推荐）
npm run typecheck && npm run lint:strict  # 提交前完整检查
```

## 7. Feature Module Pattern（功能模块模式）

### 模块结构

```
features/
└── [feature-name]/
    ├── __tests__/        # 功能模块内部测试
    │   ├── components/   # 组件测试
    │   ├── hooks/        # Hooks测试
    │   └── services/     # 单元测试 (业务逻辑)
    ├── components/       # 功能特定组件
    ├── hooks/            # 功能特定hooks
    ├── services/         # 功能特定业务逻辑
    ├── stores/           # 功能特定状态管理
    ├── types/            # 功能特定类型
    └── index.ts          # 模块统一导出
```

### 模块原则

- 每个功能模块自包含
- 避免模块间直接依赖
- 通过共享组件和工具复用代码
- 保持模块边界清晰

## 8. Testing Strategy（测试策略）

为确保平台稳定、可靠并保护数据完整性，我们采用基于测试金字塔和功能模块化（Feature-First）原则的分层测试策略。

### 1. Guiding Principles（指导原则）

- **可测试性优先**: 在做技术决策时，优先选择最易于测试的方案。
- **测试行为，而非实现**: 测试应关注组件或函数的功能，而不是其内部实现细节。
- **清晰命名**: 测试描述应清晰地说明其测试的场景和预期结果。
- **确定性**: 测试必须是可靠且可重复的，每次运行都应产生相同的结果。
- **遵循约定**: 使用项目中已建立的测试工具和模式，保持一致性。

### 2. Testing Layers & Tooling（测试分层与工具）

- **单元测试 (Unit Tests)**: 测试单个函数、Hook或无外部依赖的服务。使用 `Jest`。
- **组件测试 (Component Tests)**: 测试UI组件的交互和渲染逻辑。使用 `Jest` + `React Testing Library`。
- **集成测试 (Integration Tests)**: 测试多个模块的协作，特别是涉及API路由和数据库交互的场景。使用 `Jest`。
- **端到端测试 (E2E Tests)**: 模拟真实用户，测试完整的核心业务流程。推荐使用 `Playwright`。

### 3. Directory & Naming Conventions（目录与命名约定）

- **就近原则**: 单元和组件测试与源代码放在所属功能模块的 `__tests__` 目录内。
- **全局测试**: 跨模块的集成测试和E2E测试放在根 `tests/` 目录。
- **命名规范**:
  - 单元/集成测试: `*.test.ts(x)`
  - 组件测试: `*.component.test.tsx`
  - E2E测试: `*.e2e.test.ts`

### 4. Execution Strategy（执行策略）

- **开发时**: 运行与当前开发任务相关的单元和组件测试，以获得快速反馈。
- **提交时 (CI)**: 自动运行所有单元、组件和集成测试。
- **发布前**: 运行完整的测试套件，包括E2E测试，确保关键流程无误。

## 9. Quick Links（快速链接）

- **模板文档**: `/TEMPLATE_README.md`
- **API文档**: 运行项目后访问 `/api-docs`（待实现）
- **部署指南**: `/docs/deployment.md`（待创建）
- **贡献指南**: `/CONTRIBUTING.md`（待创建）
- **项目看板**: GitHub Projects
- **问题追踪**: GitHub Issues
