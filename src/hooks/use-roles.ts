/**
 * Roles Data Fetching Hook
 * 用于获取角色列表数据的React Hook
 *
 * 满足要求：
 * - 3.3: 为角色分配功能提供可用角色数据
 * - 遵循项目Hook模板模式
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthApiResponse } from '@/types/auth';

/**
 * 角色信息类型定义
 */
export interface Role {
  id: number;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  userCount: number;
  permissions: Array<{
    id: number;
    name: string;
    displayName: string;
    category: string;
    description: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 角色列表响应类型
 */
export interface RolesResponse {
  roles: Role[];
  total: number;
  categories: string[];
}

/**
 * 角色查询参数
 */
export interface RolesQueryParams {
  includeSystem?: boolean;
}

/**
 * Hook选项
 */
export interface UseRolesOptions {
  immediate?: boolean;
  params?: RolesQueryParams;
}

/**
 * Hook返回类型
 */
export interface UseRolesReturn {
  data: RolesResponse | null;
  roles: Role[];
  categories: string[];
  loading: boolean;
  error: string | null;
  refetch: (params?: RolesQueryParams) => Promise<void>;
  mutate: (data: RolesResponse) => void;
  getRoleById: (id: number) => Role | null;
  getRolesByCategory: (category: string) => Role[];
}

/**
 * 角色数据获取Hook
 *
 * @param options Hook配置选项
 * @returns 角色数据和操作方法
 */
export function useRoles(options: UseRolesOptions = {}): UseRolesReturn {
  const { immediate = true, params: initialParams = {} } = options;

  const [data, setData] = useState<RolesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] =
    useState<RolesQueryParams>(initialParams);

  /**
   * 获取角色列表数据
   */
  const fetchRoles = useCallback(
    async (params?: RolesQueryParams) => {
      setLoading(true);
      setError(null);

      try {
        const actualParams = { ...queryParams, ...params };
        const searchParams = new URLSearchParams();

        // 构建查询参数
        if (actualParams.includeSystem !== undefined) {
          searchParams.append(
            'includeSystem',
            actualParams.includeSystem.toString()
          );
        }

        const url = `/api/roles${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AuthApiResponse<RolesResponse> = await response.json();

        if (result.status === 'success') {
          setData(result.data);
          setQueryParams(actualParams);
        } else if (result.status === 'fail') {
          throw new Error(result.data?.message || '获取角色列表失败');
        } else {
          throw new Error(result.message || '服务器错误');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取角色列表失败';
        setError(errorMessage);
        console.error('Fetch roles error:', err);
      } finally {
        setLoading(false);
      }
    },
    [queryParams]
  );

  /**
   * 手动更新数据
   */
  const mutate = useCallback((newData: RolesResponse) => {
    setData(newData);
  }, []);

  /**
   * 重新获取数据
   */
  const refetch = useCallback(
    async (params?: RolesQueryParams) => {
      await fetchRoles(params);
    },
    [fetchRoles]
  );

  /**
   * 根据ID获取角色
   */
  const getRoleById = useCallback(
    (id: number): Role | null => {
      return data?.roles.find((role) => role.id === id) || null;
    },
    [data]
  );

  /**
   * 根据权限分类获取角色
   */
  const getRolesByCategory = useCallback(
    (category: string): Role[] => {
      if (!data) return [];

      return data.roles.filter((role) =>
        role.permissions.some((permission) => permission.category === category)
      );
    },
    [data]
  );

  // 初始化时获取数据
  useEffect(() => {
    if (immediate) {
      fetchRoles();
    }
  }, [fetchRoles, immediate]);

  // 计算派生状态
  const roles = useMemo(() => data?.roles || [], [data]);
  const categories = useMemo(() => data?.categories || [], [data]);

  return {
    data,
    roles,
    categories,
    loading,
    error,
    refetch,
    mutate,
    getRoleById,
    getRolesByCategory
  };
}
