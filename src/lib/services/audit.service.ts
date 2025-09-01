/**
 * 审计日志管理服务
 * 处理系统级和用户级审计日志的查询、统计等相关业务逻辑
 *
 * 设计原则：
 * - Service层直接使用Prisma，不引入Repository抽象
 * - 承担所有审计日志相关的业务逻辑和数据访问
 * - 提供清晰的接口供API路由调用
 */

import { prisma } from '@/lib/db';

/**
 * 审计日志DTO类型
 */
export interface AuditLogDTO {
  id: number;
  action: string;
  resourceType: string;
  resourceId: number | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string | null;
  } | null;
}

/**
 * 系统级审计日志响应DTO
 */
export interface SystemAuditLogsDTO {
  auditLogs: AuditLogDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    action?: string;
    resourceType?: string;
    resourceId?: number;
    userId?: number;
    ipAddress?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
  stats: {
    total: number;
    actionStats: Array<{ action: string; count: number }>;
    resourceTypeStats: Array<{ resourceType: string; count: number }>;
    userStats: Array<{
      userId: number | null;
      count: number;
      user: {
        username: string;
        email: string;
        fullName: string | null;
      } | null;
    }>;
  };
}

/**
 * 用户级审计日志响应DTO
 */
export interface UserAuditLogsDTO {
  auditLogs: AuditLogDTO[];
  targetUser: {
    id: number;
    username: string;
    email: string;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    action?: string;
    startDate?: string;
    endDate?: string;
  };
}

/**
 * 系统级审计日志查询选项
 */
export interface SystemAuditQueryOptions {
  page?: number;
  limit?: number;
  action?: string;
  resourceType?: string;
  resourceId?: number;
  userId?: number;
  ipAddress?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 用户级审计日志查询选项
 */
export interface UserAuditQueryOptions {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * 审计服务类
 */
export class AuditService {
  /**
   * 获取系统级审计日志（带完整统计信息）
   * @param options 查询选项
   * @returns 系统级审计日志响应
   */
  async getSystemAuditLogs(
    options: SystemAuditQueryOptions = {}
  ): Promise<SystemAuditLogsDTO> {
    const {
      page = 1,
      limit = 50,
      action,
      resourceType,
      resourceId,
      userId,
      ipAddress,
      search,
      startDate,
      endDate
    } = options;

    // 确保分页参数合理
    const actualPage = Math.max(1, page);
    const actualLimit = Math.min(200, Math.max(1, limit));
    const offset = (actualPage - 1) * actualLimit;

    // 构建查询条件
    const where: any = {};

    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;
    if (resourceId !== undefined && !isNaN(resourceId))
      where.resourceId = resourceId;
    if (userId !== undefined && !isNaN(userId)) where.userId = userId;

    if (ipAddress) {
      where.ipAddress = {
        contains: ipAddress,
        mode: 'insensitive'
      };
    }

    // 日期范围过滤
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // 搜索功能 - 在action和resourceType中搜索
    if (search) {
      where.OR = [
        {
          action: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          resourceType: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // 并行查询审计日志和统计数据
    const [auditLogs, totalCount, statsData] = await Promise.all([
      // 主要审计日志查询
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: actualLimit
      }),

      // 总数查询
      prisma.auditLog.count({ where }),

      // 统计数据查询
      Promise.all([
        // 按操作类型统计
        prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // 按资源类型统计
        prisma.auditLog.groupBy({
          by: ['resourceType'],
          where,
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        }),

        // 按用户统计
        prisma.auditLog.groupBy({
          by: ['userId'],
          where: {
            ...where,
            userId: { not: null }
          },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 10
        })
      ])
    ]);

    const [actionStats, resourceTypeStats, userStats] = statsData;

    // 转换审计日志为DTO
    const auditLogsDTO = auditLogs.map((log) => this.toAuditLogDTO(log));

    // 获取用户统计的详细信息
    const userStatsWithDetails = await Promise.all(
      userStats.map(async (stat) => {
        const user = await prisma.user.findUnique({
          where: { id: stat.userId! },
          select: {
            username: true,
            email: true,
            fullName: true
          }
        });

        return {
          userId: stat.userId,
          count: stat._count.id,
          user: user || null
        };
      })
    );

    return {
      auditLogs: auditLogsDTO,
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / actualLimit),
        hasNext: actualPage < Math.ceil(totalCount / actualLimit),
        hasPrev: actualPage > 1
      },
      filters: {
        action,
        resourceType,
        resourceId,
        userId,
        ipAddress,
        search,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      },
      stats: {
        total: totalCount,
        actionStats: actionStats.map((stat) => ({
          action: stat.action,
          count: stat._count.id
        })),
        resourceTypeStats: resourceTypeStats.map((stat) => ({
          resourceType: stat.resourceType,
          count: stat._count.id
        })),
        userStats: userStatsWithDetails
      }
    };
  }

  /**
   * 获取用户相关的审计日志
   * @param userId 目标用户ID
   * @param options 查询选项
   * @returns 用户级审计日志响应
   */
  async getUserAuditLogs(
    userId: number,
    options: UserAuditQueryOptions = {}
  ): Promise<UserAuditLogsDTO> {
    const { page = 1, limit = 20, action, startDate, endDate } = options;

    // 确保分页参数合理
    const actualPage = Math.max(1, page);
    const actualLimit = Math.min(100, Math.max(1, limit));
    const offset = (actualPage - 1) * actualLimit;

    // 验证目标用户是否存在
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true }
    });

    if (!targetUser) {
      throw new Error('用户不存在');
    }

    // 构建查询条件
    const where: any = {
      OR: [
        // 用户作为操作者的日志
        { userId },
        // 用户作为操作目标的日志
        {
          resourceType: 'user',
          resourceId: userId
        },
        // 用户相关的其他操作（从changes字段中查找targetUserId）
        {
          changes: {
            path: ['targetUserId'],
            equals: userId
          }
        }
      ]
    };

    // 添加操作类型筛选
    if (action) {
      where.action = action;
    }

    // 添加日期范围筛选
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // 查询审计日志
    const [auditLogs, totalCount] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: actualLimit
      }),
      prisma.auditLog.count({ where })
    ]);

    // 转换审计日志为DTO
    const auditLogsDTO = auditLogs.map((log) => this.toAuditLogDTO(log));

    return {
      auditLogs: auditLogsDTO,
      targetUser: {
        id: targetUser.id,
        username: targetUser.username,
        email: targetUser.email
      },
      pagination: {
        page: actualPage,
        limit: actualLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / actualLimit)
      },
      filters: {
        action,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    };
  }

  /**
   * 记录审计日志（内部方法）
   * @param logData 审计日志数据
   */
  async logAuditEvent(logData: {
    userId?: number;
    action: string;
    resourceType: string;
    resourceId?: number;
    changes?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: logData.userId || null,
        action: logData.action,
        resourceType: logData.resourceType,
        resourceId: logData.resourceId || null,
        changes: logData.changes || null,
        ipAddress: logData.ipAddress || null,
        userAgent: logData.userAgent || null
      }
    });
  }

  /**
   * 获取特定操作类型的统计信息
   * @param action 操作类型
   * @param days 统计天数（默认30天）
   * @returns 统计信息
   */
  async getActionStatistics(
    action: string,
    days: number = 30
  ): Promise<{
    total: number;
    dailyStats: Array<{ date: string; count: number }>;
  }> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.auditLog.findMany({
      where: {
        action,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true
      }
    });

    // 按日期统计
    const dailyStats = new Map<string, number>();
    logs.forEach((log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      dailyStats.set(date, (dailyStats.get(date) || 0) + 1);
    });

    const dailyStatsArray = Array.from(dailyStats.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total: logs.length,
      dailyStats: dailyStatsArray
    };
  }

  /**
   * 将审计日志数据转换为DTO
   * @param log 审计日志数据
   * @returns 审计日志DTO
   */
  private toAuditLogDTO(log: any): AuditLogDTO {
    return {
      id: log.id,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      changes: log.changes,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
      user: log.user
        ? {
            id: log.user.id,
            username: log.user.username,
            email: log.user.email,
            fullName: log.user.fullName
          }
        : null
    };
  }
}

// 导出单例实例
export const auditService = new AuditService();
