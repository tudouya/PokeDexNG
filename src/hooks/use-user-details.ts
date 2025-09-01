/**
 * User Details Data Fetching Hook
 * 用于获取单个用户详细信息的React Hook
 *
 * 满足要求：
 * - 4.4: 为用户详情页面提供数据获取能力
 * - 遵循项目Hook模板模式
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { AuthApiResponse } from '@/types/auth';

/**
 * 用户详细信息类型定义
 */
export interface UserDetails {
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
    description: string | null;
    permissions: Array<{
      id: number;
      name: string;
      displayName: string;
      category: string;
    }>;
  }>;
}

/**
 * 用户更新请求类型
 */
export interface UpdateUserRequest {
  email?: string;
  username?: string;
  fullName?: string;
  roleIds?: number[];
  reason?: string;
}

/**
 * Hook选项
 */
export interface UseUserDetailsOptions {
  userId: number;
  immediate?: boolean;
}

/**
 * Hook返回类型
 */
export interface UseUserDetailsReturn {
  data: UserDetails | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (data: UpdateUserRequest) => Promise<void>;
  toggleUserStatus: (
    action: 'deactivate' | 'reactivate',
    reason?: string
  ) => Promise<void>;
  mutate: (data: UserDetails) => void;
}

/**
 * 用户详细信息数据获取Hook
 *
 * @param options Hook配置选项
 * @returns 用户详细信息数据和操作方法
 */
export function useUserDetails(
  options: UseUserDetailsOptions
): UseUserDetailsReturn {
  const { userId, immediate = true } = options;

  const [data, setData] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取用户详细信息
   */
  const fetchUserDetails = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AuthApiResponse<UserDetails> = await response.json();

      if (result.status === 'success') {
        setData(result.data);
      } else if (result.status === 'fail') {
        throw new Error(result.data?.message || '获取用户详情失败');
      } else {
        throw new Error(result.message || '服务器错误');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取用户详情失败';
      setError(errorMessage);
      console.error('Fetch user details error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 更新用户信息
   */
  const updateUser = useCallback(
    async (updateData: UpdateUserRequest) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AuthApiResponse<any> = await response.json();

        if (result.status === 'success') {
          // 更新成功后重新获取数据
          await fetchUserDetails();
        } else if (result.status === 'fail') {
          throw new Error(result.data?.message || '更新用户信息失败');
        } else {
          throw new Error(result.message || '服务器错误');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '更新用户信息失败';
        setError(errorMessage);
        console.error('Update user error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchUserDetails]
  );

  /**
   * 切换用户状态（激活/停用）
   */
  const toggleUserStatus = useCallback(
    async (action: 'deactivate' | 'reactivate', reason?: string) => {
      if (!userId) return;

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          action,
          ...(reason && { reason })
        });

        const response = await fetch(
          `/api/users/${userId}?${params.toString()}`,
          {
            method: 'DELETE'
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: AuthApiResponse<any> = await response.json();

        if (result.status === 'success') {
          // 状态更新成功后重新获取数据
          await fetchUserDetails();
        } else if (result.status === 'fail') {
          throw new Error(result.data?.message || '更新用户状态失败');
        } else {
          throw new Error(result.message || '服务器错误');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '更新用户状态失败';
        setError(errorMessage);
        console.error('Toggle user status error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchUserDetails]
  );

  /**
   * 手动更新数据
   */
  const mutate = useCallback((newData: UserDetails) => {
    setData(newData);
  }, []);

  /**
   * 重新获取数据
   */
  const refetch = useCallback(async () => {
    await fetchUserDetails();
  }, [fetchUserDetails]);

  // 初始化时获取数据
  useEffect(() => {
    if (immediate && userId) {
      fetchUserDetails();
    }
  }, [fetchUserDetails, immediate, userId]);

  return {
    data,
    loading,
    error,
    refetch,
    updateUser,
    toggleUserStatus,
    mutate
  };
}
