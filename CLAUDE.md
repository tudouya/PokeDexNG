# CLAUDE.MD - Pokedex

> 一个为渗透测试人员设计的，用于发现、记录和管理漏洞的协作平台。
> 版本: v1.0.0 | 最后更新: 2025-08-12

## 1. Project High-Level Goal

Pokedex旨在用一个集中式的协作平台取代手动编写渗透测试报告的流程。它将作为所有已发现漏洞的权威性**漏洞库** (Vulnerability Database)，允许安全工程师高效地记录来自手动渗透测试和自动化扫描的发现物。该系统将追踪漏洞从发现、确认、指派、修复到验证的完整生命周期。通过构建一个可复用的**漏洞知识库** (Vulnerability Knowledge Base)，系统将能标准化漏洞描述和修复建议，极大地提升报告效率和一致性。最终目标是简化安全团队与开发团队之间的工作流程，缩短漏洞修复时间（MTTR），并为管理层提供对组织整体安全态势的清晰洞察。

- **项目类型**: Web应用, 内部安全管理工具 (SaaS或私有化部署)
- **核心功能**:
  - **项目管理** (Project Management) - 渗透测试项目全生命周期管理
  - **目标管理** (Target Management) - 测试目标和资产管理
  - **漏洞管理** (Vulnerability Management) - 漏洞发现、记录、追踪、修复全流程
  - **分类管理** (Category Management) - 漏洞分类体系和标准化管理
  - **知识库** (Knowledge Base) - 漏洞模板库和修复建议库
  - **报告中心** (Report Center) - 专业测试报告生成和模板管理
  - **用户管理** (User & RBAC Management) - 用户、角色、权限动态管理
  - **仪表盘** (Dashboard) - 系统概览、数据分析、关键指标监控
  - **系统设置** (System Configuration) - 安全策略、第三方集成、操作日志
- **目标用户**:
  - 渗透测试工程师 / 安全工程师
  - 开发工程师 / 研发负责人
  - 安全经理 / 团队负责人
- **关键指标**:
  - 录入单个漏洞的平均时间
  - 漏洞的平均修复时间 (Mean Time To Remediate, MTTR)
  - 报告生成所需时间
  - 平台用户活跃度 (DAU/MAU)

## 2. Tech Stack & Versions

> **架构参考**: 基于 [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) 技术栈整合渗透测试专业需求

### 🏗️ **核心技术栈**

- **Language**: TypeScript (严格模式)
- **Framework**: Next.js (App Router)
- **Runtime**: React (客户端/服务端组件)
- **Package Manager**: npm
- **Database**: MySQL 8.0+ + Prisma ORM
- **Authentication**: NextAuth.js + bcryptjs (密码哈希)

### 🎨 **UI & 组件系统**

- **设计系统**: shadcn/ui (Radix UI + Tailwind CSS)
- **动效组件**: Magic UI (AnimatedShinyText, BorderBeam, NumberTicker, RetroGrid)
- **图标系统**: Lucide React + Radix UI Icons + Tabler Icons
- **主题系统**: next-themes (亮色/暗色模式)
- **样式方案**: Tailwind CSS + CVA (组件变体管理)
- **图表可视化**: Recharts

### 📊 **状态管理 & 数据层**

- **全局状态**: Zustand (轻量级状态管理)
- **URL状态同步**: Nuqs (Type-safe search params)
- **服务端状态**: Tanstack Query (异步数据获取和缓存)
- **表单管理**: React Hook Form + Zod (表单验证)
- **表格组件**: Tanstack Data Tables (服务端分页、搜索、过滤)

### 🎯 **核心业务库**

- **文档处理与解析**:

  - ✅ mammoth (Word文档解析，漏洞导入)
  - ✅ docx (Word文档生成，报告导出)
  - ✅ officeparser (多格式文档解析支持)
  - ❌ 对象存储服务 (报告附件上传) - _计划中_
  - ❌ 文件压缩处理 (批量下载) - _计划中_
  - ❌ 图像处理优化 - _计划中_

- **报告生成引擎**:

  - ✅ handlebars (模板引擎，报告模板渲染)
  - ✅ pdfkit (PDF文档生成)
  - ✅ puppeteer (HTML转PDF，高保真报告生成)
  - ✅ 自研报告生成引擎 (`src/lib/report-engine/`)
  - ✅ 自研模板系统 (`src/lib/report-templates/`)

- **安全与认证**:

  - bcryptjs (密码哈希)
  - 自研RBAC权限系统 (`src/lib/services/rbac.service.ts`)
  - 输入验证和XSS防护 (Zod验证)

- **数据处理与分析**:

  - ✅ 自研漏洞分析服务 (`src/lib/services/vulnerability-analytics.ts`)
  - ✅ 自研置信度计算器 (`src/lib/services/confidence-calculator.ts`)
  - ✅ 自研数据提取器 (`src/lib/services/vulnerability-extractors/`)
  - ✅ 自研文档解析器 (智能漏洞导入)

- **业务领域服务** (自研):
  - ✅ 项目服务 (`src/lib/project-service.ts`)
  - ✅ 目标服务 (`src/lib/target-service.ts`)
  - ✅ 漏洞服务 (`src/lib/services/vulnerability-service.ts`)
  - ✅ 认证服务 (`src/lib/services/auth.service.ts`)
  - ✅ 角色服务 (`src/lib/services/role-service.ts`)

**状态说明**:

- ✅ **已实现** - 当前项目中正在使用
- ❌ **计划中/待实现** - 文档中规划但尚未实现的功能

### 🧪 **测试工具链**

- **测试框架**: Jest + React Testing Library
- **测试环境**: jest-environment-jsdom (浏览器环境模拟)
- **TypeScript支持**: ts-jest (TypeScript测试转换)
- **用户交互测试**: @testing-library/user-event
- **DOM断言**: @testing-library/jest-dom
- **Mock工具**: 内置Mock服务 (NextAuth、Prisma、Router等)

### 🛠️ **开发工具**

- **代码质量**:
  - ESLint (静态代码分析，Next.js配置)
  - Prettier (代码格式化，Tailwind类排序)
- **Git工作流**:
  - Husky (Git Hooks)
  - lint-staged (暂存文件检查)
- **构建工具**:
  - Next.js Built-in (SWC编译器)
  - Turbopack (开发模式性能优化)
- **用户体验**:
  - Kbar (⌘+K命令面板)
  - Sonner (Toast通知系统)

### 🚧 **技术债务**

#### **当前债务**

- **RBAC系统重构** (进行中)
  - ✅ 权限缓存系统 (15分钟TTL，100MB内存限制) - 已完成
  - ❌ **IP阻止实现** - 需要完整实现存储层和业务逻辑
    - 现状：仅有接口定义 (`src/lib/rbac/types/audit.types.ts`)
    - 缺少：具体实现类、存储提供者、中间件集成
    - 需要：30分钟IP阻止、失败登录跟踪、自动解除机制
  - ⏳ 简化安全强化 (将775行代码减少到<200行)
- **测试架构重构** (计划中)
  - 重新分类现有80+测试文件，建立真正的测试金字塔
  - 建立单元/集成/组件/E2E测试边界
  - 目标：80%整体覆盖率，90%安全关键代码覆盖率
- **组件库标准化** (计划中)
  - 统一组件接口和命名约定
  - 重构可复用组件以提高一致性
- **用户体验一致性** (计划中)
  - **原生alert弹框标准化** - 项目管理模块仍使用原生alert通知
    - 现状：发现2个`alert()`调用需要替换
      - `src/features/projects/components/projects-list-page.tsx:135` - 删除项目失败提示
      - `src/features/projects/components/project-detail-page.tsx:75` - 更新项目状态失败提示
    - 问题：与其他模块的toast通知系统(Sonner)不一致，原生alert会阻塞UI
    - 需要：导入`toast`并替换`alert()`为`toast.error()`调用
    - 影响：改善错误提示的用户体验，保持视觉一致性
    - 预计工期：30分钟（快速修复）
- **性能优化** (计划中)
  - 大数据集的数据库查询优化
  - 权限检查性能调优
- **模块导入规范统一** (计划中)
  - **混合导入规范问题** - 项目中同时使用绝对路径(`@/`)和相对路径(`../`)导入
    - 现状：在TypeScript严格模式修复过程中，部分模块改用了相对路径导入
      - `src/features/permissions/hooks/use-permission-check.ts` - 使用相对路径导入
      - `src/features/permissions/services/permission-api.ts` - 使用相对路径导入
      - `src/lib/services/report-data-formatter.ts` - 使用相对路径导入
    - 问题：导入规范不一致，影响代码可维护性和团队协作
    - 根因：TypeScript编译器在某些情况下无法正确解析`@/`路径映射
    - 需要：制定统一的模块导入规范并全项目应用
    - 建议方案：优先使用绝对路径(`@/`)，解决路径映射配置问题
    - 预计工期：2小时（规范制定 + 全项目重构）

#### **缓解计划**

1. **RBAC重构** (2025-Q1)
   - ✅ 阶段1：接口定义和缓存系统 - 已完成
   - 🔄 阶段2：IP阻止实现和中间件集成 - 进行中
   - ⏳ 阶段3：UI组件简化和性能验证 - 计划中
2. **测试架构重构** (2025-Q1)
   - 重新分类和组织测试文件
   - 建立测试分层标准和执行策略
3. **用户体验一致性优化** (2025-Q1 高优先级)
   - 原生alert弹框替换 (30分钟极速修复)
     - 替换2个项目管理模块中的`alert()`调用
     - 导入并使用Sonner toast系统
   - 建立UI组件一致性检查清单和代码审查规范
4. **性能优化** (2025-Q2)
   - 数据库查询分析和优化
   - 权限检查性能基准测试
5. **模块导入规范统一** (2025-Q1 中优先级)
   - 调查并修复TypeScript路径映射配置问题
   - 建立统一的模块导入规范文档
   - 全项目重构：将相对路径导入统一为绝对路径(`@/`)导入
   - 建立ESLint规则强制执行导入规范
   - 集成到CI/CD流程中进行自动检查

### 📦 **UI扩展库**

- **日期选择**: react-day-picker (日期选择器)
- **防抖处理**: use-debounce (性能优化Hook)
- **样式工具**:
  - clsx (条件类名拼接)
  - class-variance-authority (组件变体管理)
  - tailwind-merge (Tailwind类合并)
- **动画系统**: motion (Framer Motion分支)
- **类型支持**: TypeScript类型定义包 (@types/\*)

## 3. Project Structure

> **架构选择**: Feature First Architecture
> **架构参考**: 基于 [Kiranism/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter) 的功能模块化架构设计

```
pokedex/
├── prisma/                           # 数据库模型定义
│   └── schema.prisma                 # 🔥 Prisma数据库架构
│
├── public/                           # 静态资源
│   ├── favicon.svg                   # 网站图标
│   ├── logo.svg                      # 项目Logo
│   └── reports/                      # 🔥 报告文件存储
│       ├── assets/                   # 报告资源文件
│       ├── generated/                # 生成的报告
│       └── temp/                     # 临时文件
│
├── report_tpl/                       # 🔥 报告模板文件
│   ├── nwcd_template.md             # 宁夏西云数据模板
│   ├── lvmeng.md                    # 绿盟模板
│   └── *.md                         # 其他报告模板
│
├── scripts/                          # 数据库管理脚本
│   ├── database/                     # 数据库操作脚本
│   ├── user-management/              # 用户管理脚本
│   └── *.js/*.ts                     # 初始化和迁移脚本
│
├── src/                              # ⭐ 源代码（功能模块化架构）
│   ├── app/                          # Next.js 15 App Router
│   │   ├── api/                      # API路由层
│   │   │   ├── auth/                 # 认证API
│   │   │   ├── projects/             # 🔥 项目管理API
│   │   │   ├── targets/              # 🔥 目标管理API
│   │   │   ├── vulnerabilities/      # 🔥 漏洞管理API
│   │   │   ├── reports/              # 🔥 报告生成API
│   │   │   └── users/                # 用户管理API
│   │   ├── projects/                 # 🔥 项目管理页面（扁平化路由）
│   │   ├── targets/                  # 🔥 目标管理页面
│   │   ├── vulnerabilities/          # 🔥 漏洞管理页面
│   │   ├── reports/                  # 🔥 报告生成页面
│   │   ├── users/                    # 用户管理页面
│   │   ├── categories/               # 漏洞分类页面
│   │   ├── permissions/              # 权限管理页面
│   │   ├── settings/                 # 系统设置页面
│   │   ├── profile/                  # 个人资料页面
│   │   ├── knowledge-base/           # 知识库页面
│   │   ├── security/                 # 安全管理页面
│   │   └── dashboard/                # Dashboard主页
│   │   ├── globals.css               # 全局样式
│   │   ├── layout.tsx                # 根布局
│   │   └── page.tsx                  # 登录页（根路由）
│   │
│   ├── components/                   # 共享UI组件层
│   │   ├── ui/                       # shadcn/ui基础组件
│   │   ├── magicui/                  # Magic UI动效组件
│   │   ├── layout/                   # 布局组件
│   │   ├── auth/                     # 认证组件
│   │   ├── providers/                # Context提供者
│   │   └── features/                 # 功能特定组件
│   │
│   ├── features/                     # ⭐ 功能模块（按业务域组织）
│   │   ├── vulnerabilities/          # 🔥 漏洞管理模块
│   │   │   ├── components/           # 漏洞相关组件
│   │   │   ├── hooks/                # 漏洞相关Hooks
│   │   │   ├── services/             # 漏洞业务逻辑服务
│   │   │   ├── stores/               # 漏洞状态管理
│   │   │   ├── types/                # 漏洞类型定义
│   │   │   ├── __tests__/            # 漏洞模块测试
│   │   │   └── index.ts              # 模块统一导出
│   │   ├── projects/                 # 🔥 项目管理模块
│   │   ├── targets/                  # 🔥 目标管理模块
│   │   ├── reports/                  # 🔥 报告生成模块
│   │   ├── users/                    # 用户管理模块
│   │   └── categories/               # 漏洞分类模块
│   │
│   ├── lib/                          # 核心工具库
│   │   ├── auth.ts                   # NextAuth.js配置
│   │   ├── database.ts               # 🔥 数据库服务层
│   │   ├── prisma.ts                 # Prisma客户端
│   │   ├── services/                 # 业务服务层
│   │   │   ├── auth.service.ts       # 认证服务
│   │   │   ├── permission-service.ts # 🔥 权限服务
│   │   │   └── *.service.ts          # 其他业务服务
│   │   ├── report-engine/            # 🔥 报告生成引擎
│   │   ├── report-templates/         # 🔥 报告模板系统
│   │   ├── schemas/                  # Zod验证模式
│   │   ├── security/                 # 🔥 安全相关工具
│   │   ├── types/                    # TypeScript类型定义
│   │   └── utils/                    # 通用工具函数
│   │
│   ├── stores/                       # ⭐ 全局状态管理
│   │   ├── theme-store.ts            # 主题状态管理
│   │   ├── user-store.ts             # 用户状态管理
│   │   ├── dashboard-store.ts        # Dashboard状态
│   │   ├── url-state-hooks.ts        # URL状态同步
│   │   ├── __tests__/                # Store单元测试
│   │   └── index.ts                  # Store统一导出
│   │
│   ├── hooks/                        # 自定义React Hooks
│   ├── config/                       # 应用配置
│   ├── constants/                    # 常量定义
│   └── types/                        # 全局类型定义
│
├── tests/                            # ⭐ 测试目录（标准化结构）
│   ├── e2e/                          # 端到端测试
│   │   ├── core-workflows.test.tsx   # 核心业务流程测试
│   │   └── rbac-integration.test.ts  # 权限系统集成测试
│   ├── integration/                  # 集成测试（跨模块）
│   └── manual/                       # 手动测试清单
│
├── components.json                   # shadcn/ui配置
├── jest.config.js                    # ⭐ Jest测试配置
├── jest.setup.js                     # Jest测试初始化
├── next.config.js                    # Next.js配置
├── tailwind.config.js                # Tailwind CSS配置
├── middleware.ts                     # Next.js中间件
└── tsconfig.json                     # TypeScript配置
```

## 4. Development Philosophy & Standards

> **参考来源**: 基于 [Getting Good Results from Claude Code](https://www.dzombak.com/blog/2025/08/getting-good-results-from-claude-code/) 整合渗透测试工具开发需求

### 🎯 **核心开发理念**

**基础信念**:

- **渐进式改进胜过大爆炸** - 小步快跑，每次变更可编译并通过测试
- **从现有代码中学习** - 深入研究项目模式，遵循既有约定
- **实用主义胜过教条主义** - 适应项目现实，选择最适合的方案
- **清晰意图胜过聪明代码** - 代码要boring和明显，避免过度设计

**简洁性原则**:

- 单一职责：每个函数/类只负责一件事
- 避免过早抽象：先实现，再优化
- 选择boring的解决方案：避免聪明的技巧
- 如果需要解释，说明太复杂了

### 📋 **开发流程标准**

#### 1. **规划与分阶段**

复杂工作分解为3-5个阶段，明确每个阶段的交付物和成功标准。

#### 2. **实现流程**

1. **理解** - 研究代码库中的现有模式
2. **测试** - 先写测试用例 (红灯)
3. **实现** - 最小代码通过测试 (绿灯)
4. **重构** - 在测试通过的前提下清理代码
5. **提交** - 明确的提交信息关联到计划

#### 3. **遇到困难时的处理策略**

**卡住时的处理方式**:

1. **记录当前状态**:

   - 尝试了什么方法
   - 具体错误信息
   - 当前的理解和假设

2. **寻求不同视角**:

   - 搜索类似问题的解决方案
   - 询问团队成员意见
   - 查看相关文档和示例

3. **考虑简化方案**:
   - 能否拆分成更小的问题？
   - 是否过度设计了？
   - 有没有更直接的实现方式？

### 🏗️ **技术标准**

#### **架构原则**

- **组合胜过继承** - 使用依赖注入
- **接口胜过单例** - 便于测试和灵活性
- **显式胜过隐式** - 清晰的数据流和依赖关系
- **测试优先思维** - 修复失败测试优于跳过，但允许临时标记

#### **代码质量要求**

**每次提交必须**:

- ✅ 编译成功
- ✅ 通过所有现有测试
- ✅ 为新功能包含测试
- ✅ 遵循项目格式/检查规范

**提交前检查清单**:

- [ ] 运行格式化工具和检查工具
- [ ] 自我审查变更内容
- [ ] 确保提交信息解释了"为什么"

#### **错误处理标准**

- **快速失败** - 提供描述性错误信息
- **包含调试上下文** - 便于问题定位
- **适当层级处理** - 在合适的层次处理错误
- **永不静默吞异常** - 避免隐藏问题

### ⚖️ **决策框架**

当存在多个有效方法时，按以下优先级选择：

1. **🧪 可测试性** - 我能轻松测试这个吗？
2. **📖 可读性** - 6个月后有人能理解这个吗？
3. **🔄 一致性** - 这符合项目模式吗？
4. **✨ 简洁性** - 这是最简单可行的方案吗？
5. **↩️ 可逆性** - 后续修改有多困难？

### 🎯 **质量门禁**

#### **完成定义 (Definition of Done)**

- [ ] 测试编写完成并通过
- [ ] 代码遵循项目约定
- [ ] 无linter/formatter警告
- [ ] 提交信息清晰明确
- [ ] 实现符合计划
- [ ] 无TODO项（除非有issue编号）

#### **测试指导原则**

- **测试行为，不测试实现** - 关注功能而非内部细节
- **一个测试一个断言** - 便于快速定位问题
- **清晰的测试命名** - 描述具体场景
- **使用现有测试工具** - 遵循项目测试模式
- **测试必须确定性** - 每次运行结果一致

### 📂 **测试目录标准化**

**测试架构策略** (基于测试金字塔和Feature First原则):

```
src/features/vulnerabilities/__tests__/    # 功能模块测试 (就近原则)
├── components/                            # 组件测试 (UI交互逻辑)
├── hooks/                                # Hook测试 (状态管理逻辑)
├── services/                             # 单元测试 (业务逻辑服务)
└── vulnerability-integration.test.tsx    # 模块内集成测试

tests/                                    # 跨模块测试
├── unit/                                 # 纯函数和工具类单元测试
├── integration/                          # 跨功能集成测试 (API + 数据库)
├── component/                            # 跨模块组件测试
└── e2e/                                  # 真正的端到端测试 (浏览器 + 服务器 + 数据库)
```

**理由**: 遵循测试金字塔原则，单元测试就近维护，集成测试统一管理，E2E测试验证完整用户流程。

**测试分类定义**:

- **单元测试**: 测试单个函数、类或组件，无外部依赖
- **组件测试**: 测试UI组件的用户交互逻辑
- **集成测试**: 测试多个模块协作，包含真实数据库和API
- **E2E测试**: 测试完整用户流程，包含真实浏览器环境

**命名规范**:

- ✅ 单元测试: `*.test.ts` / `*.test.tsx`
- ✅ 组件测试: `*.component.test.tsx`
- ✅ 集成测试: `*-integration.test.ts` / `*-integration.test.tsx`
- ✅ E2E测试: `*.e2e.test.ts` (在tests/e2e/下)

**测试执行策略**:

1. **开发时**: 主要运行单元测试 (快速反馈 < 30秒)
2. **提交时**: 运行单元测试 + 集成测试 (CI/CD < 5分钟)
3. **发布前**: 运行完整测试套件包括E2E (完整验证 < 15分钟)
4. **夜间任务**: 运行性能测试和兼容性测试

**测试优先级策略**:

1. **核心业务逻辑单元测试** - 漏洞管理、权限验证、数据验证等安全关键功能
2. **API端点集成测试** - 优先保证接口与数据库集成的正确性
3. **关键组件测试** - 漏洞表单、报告生成等核心UI组件
4. **关键用户路径E2E** - 登录→创建项目→添加漏洞→生成报告完整流程

### ⚠️ **重要提醒**

**避免的做法**:

- ❌ 随意绕过提交钩子 (除非紧急情况)
- ❌ 长期忽略失败测试
- ❌ 提交无法编译的代码
- ❌ 基于假设工作 - 先验证现有代码
- ❌ 在根目录创建 `__tests__/` 目录 (使用规范结构)

**推荐的做法**:

- ✅ 小步提交可工作的代码
- ✅ 及时更新相关文档
- ✅ 从现有实现中学习模式
- ✅ 卡住时寻求帮助或换思路
- ✅ 遵循项目测试目录结构

---

## 📚 扩展文档

更多详细文档请参考 **[docs/README.md](docs/README.md)** - 完整的文档导航和专业指南。
