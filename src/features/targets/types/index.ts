import type { TargetType, TargetStatus, Priority } from '@prisma/client';

// Target基础类型
export interface Target {
  id: number;
  projectName?: string | null;
  name: string;
  type: TargetType;
  url?: string | null;
  description?: string | null;
  deploymentEnv?: string | null;
  networkZone?: string | null;
  scope?: string | null;
  status: TargetStatus;
  priority: Priority;
  remark?: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 创建目标DTO
export interface CreateTargetDTO {
  projectName?: string;
  name: string;
  type?: TargetType;
  url?: string;
  description?: string;
  deploymentEnv?: string;
  networkZone?: string;
  scope?: string;
  status?: TargetStatus;
  priority?: Priority;
  remark?: string;
}

// 更新目标DTO
export interface UpdateTargetDTO {
  projectName?: string;
  name?: string;
  type?: TargetType;
  url?: string;
  description?: string;
  deploymentEnv?: string;
  networkZone?: string;
  scope?: string;
  status?: TargetStatus;
  priority?: Priority;
  remark?: string;
}

// 查询目标DTO
export interface FindTargetsDTO {
  page?: number;
  limit?: number;
  projectName?: string;
  type?: TargetType;
  status?: TargetStatus;
  priority?: Priority;
  deploymentEnv?: string;
  networkZone?: string;
  search?: string; // 搜索目标名称
  includeDeleted?: boolean;
}

// 分页结果类型
export interface PaginatedTargets {
  data: Target[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 目标统计类型
export interface TargetStats {
  total: number;
  byStatus: Record<TargetStatus, number>;
  byPriority: Record<Priority, number>;
  byType: Record<TargetType, number>;
}
