# 技术决策记录 (Architecture Decision Records)

这个目录包含项目中重要的技术决策记录，采用ADR格式。

## ADR格式说明

每个ADR文件应遵循以下命名格式：`NNNN-title-of-decision.md`

- NNNN：4位数字序号（如0001, 0002）
- title-of-decision：决策标题的kebab-case格式

## 当前决策记录

| 编号           | 标题 | 状态 | 日期 |
| -------------- | ---- | ---- | ---- |
| _暂无决策记录_ |      |      |      |

## 决策状态

- **建议中** (Proposed): 决策正在讨论中
- **已接受** (Accepted): 决策已被采用
- **已弃用** (Deprecated): 决策已过时，但仍在使用中
- **已替换** (Superseded): 决策被新决策替换
- **已拒绝** (Rejected): 决策被明确拒绝

## 如何创建新的ADR

1. 确定下一个序号（查看现有文件编号）
2. 复制 `template.md` 并重命名为 `NNNN-your-decision-title.md`
3. 填写模板内容
4. 更新本README文件的决策列表
5. 提交代码审查
