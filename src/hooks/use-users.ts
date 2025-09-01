/**
 * Users Data Fetching Hook
 * 用于获取用户列表数据的React Hook
 *
 * 满足要求：
 * - 3.1: 为用户管理界面提供数据获取能力
 * - 遵循项目Hook模板模式
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AuthApiResponse, AuthSuccessResponse } from '@/types/auth';

/**
 * 用户DTO类型定义
 */
export interface UserListItem {
  id: number;
  email: string;
  username: string;
  fullName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<{
    id: number;
    name: string;
    displayName: string;
  }>;
}

/**
 * 用户列表响应类型
 */
export interface UsersListResponse {
  users: UserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * 用户查询参数
 */
export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  roleId?: number;
}

/**
 * Hook选项
 */
export interface UseUsersOptions {
  immediate?: boolean;
  params?: UsersQueryParams;
}

/**
 * Hook返回类型
 */
export interface UseUsersReturn {
  data: UsersListResponse | null;
  users: UserListItem[];
  pagination: UsersListResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  refetch: (params?: UsersQueryParams) => Promise<void>;
  mutate: (data: UsersListResponse) => void;
}

/**
 * 用户列表数据获取Hook
 *
 * @param options Hook配置选项
 * @returns 用户列表数据和操作方法
 */
export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { immediate = true, params: initialParams = {} } = options;

  const [data, setData] = useState<UsersListResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] =
    useState<UsersQueryParams>(initialParams);

  // 使用useRef存储当前查询参数的稳定引用
  const currentParamsRef = useRef<UsersQueryParams>(initialParams);

  /**
   * 获取用户列表数据
   */
  const fetchUsers = useCallback(
    async (params?: UsersQueryParams) => {
      setLoading(true);
      setError(null);

      try {
        // 使用当前参数和传入参数合并，避免依赖state
        const actualParams = { ...currentParamsRef.current, ...params };

        // 更新ref中的当前参数
        currentParamsRef.current = actualParams;

        const searchParams = new URLSearchParams();

        // 构建查询参数
        if (actualParams.page) {
          searchParams.append('page', actualParams.page.toString());
        }
        if (actualParams.limit) {
          searchParams.append('limit', actualParams.limit.toString());
        }
        if (actualParams.search) {
          searchParams.append('search', actualParams.search);
        }
        if (actualParams.isActive !== undefined) {
          searchParams.append('isActive', actualParams.isActive.toString());
        }
        if (actualParams.roleId) {
          searchParams.append('roleId', actualParams.roleId.toString());
        }

        const url = `/api/users${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AuthApiResponse<UsersListResponse> =
          await response.json();

        if (result.status === 'success') {
          setData(result.data);
          // 只在成功时更新state中的queryParams，用于UI显示
          setQueryParams(actualParams);
        } else if (result.status === 'fail') {
          throw new Error(result.data?.message || '获取用户列表失败');
        } else {
          throw new Error(result.message || '服务器错误');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取用户列表失败';
        setError(errorMessage);
        console.error('Fetch users error:', err);
      } finally {
        setLoading(false);
      }
    },
    [] // 移除queryParams依赖，避免循环
  );

  /**
   * 手动更新数据
   */
  const mutate = useCallback((newData: UsersListResponse) => {
    setData(newData);
  }, []);

  /**
   * 重新获取数据
   */
  const refetch = useCallback(
    async (params?: UsersQueryParams) => {
      await fetchUsers(params);
    },
    [fetchUsers]
  );

  // 初始化时获取数据
  useEffect(() => {
    if (immediate) {
      fetchUsers();
    }
  }, [fetchUsers, immediate]);

  // 计算派生状态
  const users = useMemo(() => data?.users || [], [data]);
  const pagination = useMemo(() => data?.pagination || null, [data]);

  return {
    data,
    users,
    pagination,
    loading,
    error,
    refetch,
    mutate
  };
}
