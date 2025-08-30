# 0001. RBAC权限粒度设计

**状态**: 建议中  
**日期**: 2025-01-18  
**决策者**: 开发团队  
**技术故事**: 数据库设计阶段 - 权限系统架构决策

## 背景和问题陈述

在设计Pokedex渗透测试平台的RBAC权限系统时，我们面临一个核心架构决策：如何平衡权限控制的灵活性与系统复杂度。

具体问题：

- 是否在权限表中定义细粒度权限（如`vulnerability.read.own`, `vulnerability.read.all`）？
- 还是使用粗粒度权限结合业务逻辑来实现数据访问控制？

这个决策将影响：

- 权限表的复杂度和维护成本
- 业务逻辑的清晰度
- 系统的扩展性和性能

## 考虑的选项

### 选项1: 细粒度权限控制

将所有可能的权限组合都定义在权限表中。

```typescript
// 权限示例
permissions = [
  'vulnerability.read.own', // 读取自己的漏洞
  'vulnerability.read.project', // 读取项目内漏洞
  'vulnerability.read.all', // 读取所有漏洞
  'vulnerability.update.own', // 更新自己的漏洞
  'vulnerability.update.all' // 更新所有漏洞
  // ... 更多组合
];
```

- **优点**:

  - 权限控制最精确，配置灵活
  - 完全通过RBAC配置，不依赖业务逻辑
  - 符合传统企业级权限管理思路
  - 易于审计和合规检查

- **缺点**:
  - 权限表数量爆炸式增长（预估50+权限）
  - 角色分配复杂，容易出错
  - 维护成本高，新增资源需要定义多个权限
  - 权限检查逻辑复杂，性能开销大
  - 可能过度设计（违背YAGNI原则）

### 选项2: 粗粒度权限 + 业务逻辑

在权限表中只定义基础的CRUD权限，通过业务代码控制数据访问范围。

```typescript
// 权限示例
permissions = [
  'vulnerability.read', // 读取漏洞权限
  'vulnerability.create', // 创建漏洞权限
  'vulnerability.update', // 更新漏洞权限
  'vulnerability.delete' // 删除漏洞权限
];

// 业务逻辑控制数据范围
function getVulnerabilities(userId: string, userRoles: string[]) {
  if (!hasPermission(userRoles, 'vulnerability.read')) {
    throw new Error('无权限');
  }

  // 根据角色决定数据范围
  if (isSecurityEngineer(userRoles)) {
    return getVulnerabilitiesCreatedBy(userId); // 只看自己创建的
  } else if (isProjectManager(userRoles)) {
    return getVulnerabilitiesInMyProjects(userId); // 看管理项目中的
  } else if (isAdmin(userRoles)) {
    return getAllVulnerabilities(); // 看所有
  }
}
```

- **优点**:

  - 权限表精简（预估20个核心权限）
  - RBAC配置简单，易于理解
  - 业务逻辑清晰，数据访问规则集中管理
  - 符合YAGNI原则，避免过度设计
  - 性能优异，权限检查开销小

- **缺点**:
  - 数据访问控制逻辑硬编码在业务代码中
  - 权限变更可能需要修改代码
  - 不够灵活，无法通过配置实现复杂权限组合
  - 需要在代码中维护角色与数据范围的映射关系

### 选项3: 混合方案

核心权限使用细粒度控制，非核心权限使用粗粒度+业务逻辑。

- **优点**:

  - 平衡了灵活性和复杂度
  - 可以针对不同场景选择不同策略

- **缺点**:
  - 系统复杂度最高
  - 权限设计不一致，增加认知负担
  - 难以制定统一的开发规范

## 决策

选择选项2：粗粒度权限 + 业务逻辑

### 理由

1. **符合项目实际情况**: 渗透测试团队规模通常不大(5-20人)，权限需求相对固定，不需要过度复杂的权限配置
2. **符合YAGNI原则**: 当前阶段不需要极其灵活的权限控制，避免过度设计
3. **开发效率高**: 业务逻辑清晰，开发和维护成本低
4. **性能优异**: 权限检查简单快速，数据库查询优化容易
5. **可扩展性**: 后期如需要更复杂控制，可以渐进式添加细粒度权限

## 后果

### 积极后果

- RBAC系统简洁易懂，降低学习和维护成本
- 开发速度快，业务逻辑集中管理
- 系统性能优异，权限检查开销最小
- 符合项目"实用主义"哲学，避免过度工程化

### 消极后果

- 权限变更可能需要修改代码，不能完全通过配置实现
- 对于极其复杂的权限需求，可能需要重构方案
- 需要在业务代码中维护权限逻辑的一致性

### 中性后果

- 需要制定清晰的权限检查编码规范
- 权限相关的业务逻辑需要充分的单元测试覆盖

## 实施计划

- [x] 定义基础的CRUD权限命名规范
- [ ] 实现权限检查中间件和工具函数
- [ ] 在业务服务层实现数据范围控制逻辑
- [ ] 编写权限检查的单元测试
- [ ] 制定权限相关的编码规范文档

## 监控和度量

- **成功指标**:
  - 权限相关bug数量 < 1个/月
  - 新增权限需求的实现时间 < 1天
  - 权限检查性能开销 < 10ms
- **风险指标**:
  - 权限逻辑散落在多处，难以维护
  - 出现权限绕过的安全问题
  - 业务逻辑与权限检查耦合过紧
- **审查时间**: 6个月后或团队规模超过20人时重新评估

## 相关资料

- [RBAC参考文档](../rbac_ref.md)
- [项目编程哲学 - YAGNI原则](../../CLAUDE.md#philosophy--architecture)
- [Backend架构原则](../../CLAUDE.md#backend-essentials)

---

_此决策记录遵循 [Architecture Decision Records](https://adr.github.io/) 格式_
