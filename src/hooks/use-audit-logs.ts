/**
 * Audit Logs Data Fetching Hook
 * 用于获取审计日志数据的React Hook
 *
 * 满足要求：
 * - 4.4: 为审计跟踪显示提供数据获取能力
 * - 遵循项目Hook模板模式
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthApiResponse } from '@/types/auth';

/**
 * 审计日志条目类型定义
 */
export interface AuditLogEntry {
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
 * 审计日志响应类型
 */
export interface AuditLogsResponse {
  auditLogs: AuditLogEntry[];
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
 * 审计日志查询参数
 */
export interface AuditLogsQueryParams {
  page?: number;
  limit?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Hook选项
 */
export interface UseAuditLogsOptions {
  userId: number;
  immediate?: boolean;
  params?: AuditLogsQueryParams;
}

/**
 * Hook返回类型
 */
export interface UseAuditLogsReturn {
  data: AuditLogsResponse | null;
  auditLogs: AuditLogEntry[];
  pagination: AuditLogsResponse['pagination'] | null;
  targetUser: AuditLogsResponse['targetUser'] | null;
  filters: AuditLogsResponse['filters'] | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: AuditLogsQueryParams) => Promise<void>;
  mutate: (data: AuditLogsResponse) => void;
}

/**
 * 审计日志数据获取Hook
 *
 * @param options Hook配置选项
 * @returns 审计日志数据和操作方法
 */
export function useAuditLogs(options: UseAuditLogsOptions): UseAuditLogsReturn {
  const { userId, immediate = true, params: initialParams = {} } = options;

  const [data, setData] = useState<AuditLogsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] =
    useState<AuditLogsQueryParams>(initialParams);

  /**
   * 获取审计日志数据
   */
  const fetchAuditLogs = useCallback(
    async (params?: AuditLogsQueryParams) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const actualParams = { ...queryParams, ...params };
        const searchParams = new URLSearchParams();

        // 构建查询参数
        if (actualParams.page) {
          searchParams.append('page', actualParams.page.toString());
        }
        if (actualParams.limit) {
          searchParams.append('limit', actualParams.limit.toString());
        }
        if (actualParams.action) {
          searchParams.append('action', actualParams.action);
        }
        if (actualParams.startDate) {
          searchParams.append('startDate', actualParams.startDate);
        }
        if (actualParams.endDate) {
          searchParams.append('endDate', actualParams.endDate);
        }

        const url = `/api/users/${userId}/audit-logs${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AuthApiResponse<AuditLogsResponse> =
          await response.json();

        if (result.status === 'success') {
          setData(result.data);
          setQueryParams(actualParams);
        } else if (result.status === 'fail') {
          throw new Error(result.data?.message || '获取审计日志失败');
        } else {
          throw new Error(result.message || '服务器错误');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取审计日志失败';
        setError(errorMessage);
        console.error('Fetch audit logs error:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId, queryParams]
  );

  /**
   * 手动更新数据
   */
  const mutate = useCallback((newData: AuditLogsResponse) => {
    setData(newData);
  }, []);

  /**
   * 重新获取数据
   */
  const refetch = useCallback(
    async (params?: AuditLogsQueryParams) => {
      await fetchAuditLogs(params);
    },
    [fetchAuditLogs]
  );

  // 初始化时获取数据
  useEffect(() => {
    if (immediate && userId) {
      fetchAuditLogs();
    }
  }, [fetchAuditLogs, immediate, userId]);

  // 计算派生状态
  const auditLogs = useMemo(() => data?.auditLogs || [], [data]);
  const pagination = useMemo(() => data?.pagination || null, [data]);
  const targetUser = useMemo(() => data?.targetUser || null, [data]);
  const filters = useMemo(() => data?.filters || null, [data]);

  return {
    data,
    auditLogs,
    pagination,
    targetUser,
    filters,
    loading,
    error,
    refetch,
    mutate
  };
}
