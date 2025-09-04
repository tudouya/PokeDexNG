import { prisma } from '@/lib/db';
import type {
  Target,
  CreateTargetDTO,
  UpdateTargetDTO,
  FindTargetsDTO,
  PaginatedTargets,
  TargetStats
} from '../types';
import type {
  Prisma,
  TargetStatus,
  TargetType,
  Priority
} from '@prisma/client';

export class TargetService {
  // 创建目标
  async create(data: CreateTargetDTO): Promise<Target> {
    const target = await prisma.target.create({
      data: {
        projectName: data.projectName || null,
        name: data.name,
        type: data.type,
        url: data.url || null,
        description: data.description || null,
        deploymentEnv: data.deploymentEnv || 'PROD',
        networkZone: data.networkZone || 'INTERNET',
        scope: data.scope || null,
        status: data.status || 'PENDING',
        priority: data.priority || 'MEDIUM',
        remark: data.remark || null
      }
    });

    return target;
  }

  // 查询目标列表（分页）
  async findAll(params: FindTargetsDTO): Promise<PaginatedTargets> {
    const {
      page = 1,
      limit = 10,
      projectName,
      type,
      status,
      priority,
      deploymentEnv,
      networkZone,
      search,
      includeDeleted = false
    } = params;

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where: Prisma.TargetWhereInput = {
      isDeleted: includeDeleted ? undefined : false
    };

    if (projectName) {
      where.projectName = { contains: projectName };
    }
    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (priority) {
      where.priority = priority;
    }
    if (deploymentEnv) {
      where.deploymentEnv = deploymentEnv;
    }
    if (networkZone) {
      where.networkZone = networkZone;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { url: { contains: search } }
      ];
    }

    // 执行查询
    const [targets, total] = await Promise.all([
      prisma.target.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.target.count({ where })
    ]);

    return {
      data: targets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // 查询单个目标
  async findOne(id: number, includeDeleted = false): Promise<Target | null> {
    const target = await prisma.target.findFirst({
      where: {
        id,
        isDeleted: includeDeleted ? undefined : false
      }
    });

    return target;
  }

  // 更新目标
  async update(id: number, data: UpdateTargetDTO): Promise<Target | null> {
    const existingTarget = await this.findOne(id);
    if (!existingTarget) {
      return null;
    }

    const updatedTarget = await prisma.target.update({
      where: { id },
      data: {
        // 明确白名单可更新字段，防止mass assignment
        ...(data.projectName !== undefined && {
          projectName: data.projectName
        }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.url !== undefined && {
          url: data.url === '' ? null : data.url
        }),
        ...(data.description !== undefined && {
          description: data.description === '' ? null : data.description
        }),
        ...(data.deploymentEnv !== undefined && {
          deploymentEnv: data.deploymentEnv
        }),
        ...(data.networkZone !== undefined && {
          networkZone: data.networkZone
        }),
        ...(data.scope !== undefined && {
          scope: data.scope === '' ? null : data.scope
        }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.remark !== undefined && {
          remark: data.remark === '' ? null : data.remark
        }),
        // 自动更新时间戳
        updatedAt: new Date()
      }
    });

    return updatedTarget;
  }

  // 软删除目标
  async softDelete(id: number): Promise<Target | null> {
    const target = await this.findOne(id);
    if (!target) {
      return null;
    }

    const deletedTarget = await prisma.target.update({
      where: { id },
      data: { isDeleted: true }
    });

    return deletedTarget;
  }

  // 恢复删除的目标
  async restore(id: number): Promise<Target | null> {
    const target = await prisma.target.findFirst({
      where: { id, isDeleted: true }
    });
    if (!target) {
      return null;
    }

    const restoredTarget = await prisma.target.update({
      where: { id },
      data: { isDeleted: false }
    });

    return restoredTarget;
  }

  // 永久删除目标
  async hardDelete(id: number): Promise<boolean> {
    try {
      await prisma.target.delete({
        where: { id }
      });
      return true;
    } catch {
      return false;
    }
  }

  // 获取目标统计信息
  async getStats(projectName?: string): Promise<TargetStats> {
    const where: Prisma.TargetWhereInput = {
      isDeleted: false
    };

    if (projectName) {
      where.projectName = projectName;
    }

    const [total, statusGroups, priorityGroups, typeGroups] = await Promise.all(
      [
        prisma.target.count({ where }),
        prisma.target.groupBy({
          by: ['status'],
          where,
          _count: { status: true }
        }),
        prisma.target.groupBy({
          by: ['priority'],
          where,
          _count: { priority: true }
        }),
        prisma.target.groupBy({
          by: ['type'],
          where,
          _count: { type: true }
        })
      ]
    );

    // 构建统计对象
    const byStatus = statusGroups.reduce(
      (acc, group) => {
        acc[group.status as TargetStatus] = group._count.status;
        return acc;
      },
      {} as Record<TargetStatus, number>
    );

    const byPriority = priorityGroups.reduce(
      (acc, group) => {
        acc[group.priority as Priority] = group._count.priority;
        return acc;
      },
      {} as Record<Priority, number>
    );

    const byType = typeGroups.reduce(
      (acc, group) => {
        acc[group.type as TargetType] = group._count.type;
        return acc;
      },
      {} as Record<TargetType, number>
    );

    return {
      total,
      byStatus,
      byPriority,
      byType
    };
  }

  // 检查目标名称是否重复（在同一项目内）
  async checkNameExists(
    projectName: string,
    name: string,
    excludeId?: number
  ): Promise<boolean> {
    const existingTarget = await prisma.target.findFirst({
      where: {
        projectName,
        name,
        isDeleted: false,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    return !!existingTarget;
  }
}

// 导出单例实例
export const targetService = new TargetService();
