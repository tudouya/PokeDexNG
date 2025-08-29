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

### 命名规范

- **文件/目录**: `kebab-case`
- **Prisma模型**: `PascalCase`
- **数据库表**: `snake_case`
- **TypeScript**: `PascalCase` (类型/接口/DTO), `camelCase` (函数/变量)

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

## 7. Backend Architecture & Conventions（后端架构与约定）

### 1. API 设计规范

- **风格**: 严格遵循 RESTful API 设计风格。
- **数据契约**: **必须** 使用DTO (Data Transfer Objects) 作为API的数据契约，严禁直接暴露数据库模型。
- **响应结构**: 采用统一的JSON响应格式 (`{ data: T | null, error: string | null }`)。
- **版本控制**: 默认为v1，未来可通过URL进行版本控制 (e.g., `/api/v2/...`)。

### 2. 认证与授权

- **机制**: 使用 NextAuth.js 管理的 JWT 进行无状态认证。
- **流程**: RBAC 检查必须在服务层执行，API路由仅做初步会话校验。
- **原则**: 所有API端点默认拒绝访问，必须显式授权。

### 3. 服务层模式

- **职责分离**: API路由 (`route.ts`) 仅作为瘦控制器，负责解析HTTP请求和序列化响应。
- **业务逻辑**: 所有核心业务逻辑、数据验证和复杂计算必须封装在 `src/lib/services/` 的服务模块中。
- **DTO转换**: 服务层 **核心职责** 之一是将内部数据库模型映射为安全的、面向外部的DTO。

### 4. 数据库与ORM约定

- **单一事实来源**: `prisma/schema.prisma` 是数据库结构的唯一权威。
- **迁移**: 任何数据库变更必须通过 `prisma migrate dev` 生成迁移文件。
- **查询**: 禁止在代码中使用原生SQL，所有数据访问必须通过Prisma Client。

### 5. 配置与密钥管理

- **环境变量**: 所有配置（数据库连接、API密钥、JWT密钥）必须通过环境变量加载。
- **安全性**: 严禁将任何敏感信息硬编码在代码中。`.env` 文件必须在 `.gitignore` 中。
- **启动校验**: 应用启动时必须校验所有必需的环境变量是否存在。

## 8. Key Commands（关键命令）

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

## 9. Feature Module Pattern（功能模块模式）

### 模块结构

```
features/
└── [feature-name]/
    ├── __tests__/
    │   ├── services/     # 业务逻辑单元测试
    │   └── components/   # 组件测试
    ├── services/         # 功能特定的后端业务逻辑
    ├── components/       # 功能特定的前端组件
    ├── hooks/            # 功能特定的React Hooks
    ├── validations/      # 功能特定的Zod schemas
    ├── types/            # 功能特定的类型定义 (包括DTO)
    └── index.ts          # 模块统一导出
```

### 模块原则

- **共享优先**: 优先将可复用逻辑（Services, Components, Hooks）放在顶层 `lib/`, `components/`, `hooks/` 目录中。
- **功能特定**: 仅当某段代码与特定业务功能紧密耦合且不可复用时，才将其放入 `features/` 目录。

## 10. Testing Strategy（测试策略）

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

## 11. Quick Links（快速链接）

- **模板文档**: `/TEMPLATE_README.md`
- **API文档**: 运行项目后访问 `/api-docs`（待实现）
- **部署指南**: `/docs/deployment.md`（待创建）
- **贡献指南**: `/CONTRIBUTING.md`（待创建）
- **项目看板**: GitHub Projects
- **问题追踪**: GitHub Issues
