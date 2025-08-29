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
src/
├── app/          # Next.js 15 App Router
│   ├── (auth)/   # 认证路由组
│   └── (dashboard)/ # 主应用路由组
├── features/     # 功能模块（按业务划分）
├── components/   # 共享UI组件
│   ├── ui/       # 基础UI组件
│   └── layout/   # 布局组件
├── hooks/        # 自定义React Hooks
├── lib/          # 核心工具函数
├── constants/    # 常量定义
├── config/       # 配置文件
└── types/        # TypeScript类型定义
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
└── feature-name/
    ├── components/   # 功能特定组件
    ├── hooks/        # 功能特定hooks
    ├── utils/        # 功能特定工具
    ├── types/        # 功能特定类型
    └── constants/    # 功能特定常量
```

### 模块原则
- 每个功能模块自包含
- 避免模块间直接依赖
- 通过共享组件和工具复用代码
- 保持模块边界清晰

## 8. Decision Log（决策日志）

### 为什么选择Next.js？
- 需要SSR提升性能和SEO
- 内置API路由简化架构
- 优秀的开发体验和生态系统

### 为什么用MySQL + Prisma？
- 关系型数据适合漏洞管理场景
- Prisma提供类型安全和迁移管理
- 团队对MySQL运维经验丰富

### 为什么自建认证而不用Clerk？
- 漏洞信息属于敏感数据，需要数据主权
- 合规要求不允许使用第三方认证
- 需要与业务逻辑深度集成的权限控制

### 为什么不需要Redis？
- 企业内部系统，并发量极小
- 避免过度工程化，保持简单

## 9. Important Notes（重要说明）

### 安全考虑
- 所有用户输入必须经过验证
- 敏感操作需要权限检查
- 漏洞信息加密存储
- 完整的操作审计日志

### 开发提示
- 基于starter模板进行功能开发
- 优先实现核心功能（项目、漏洞、报告）
- 每个功能模块独立开发和测试
- 定期review代码安全性

## 10. Quick Links（快速链接）

- **模板文档**: `/TEMPLATE_README.md`
- **API文档**: 运行项目后访问 `/api-docs`（待实现）
- **部署指南**: `/docs/deployment.md`（待创建）
- **贡献指南**: `/CONTRIBUTING.md`（待创建）
- **项目看板**: GitHub Projects
- **问题追踪**: GitHub Issues
