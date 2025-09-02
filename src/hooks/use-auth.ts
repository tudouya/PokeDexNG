/**
 * 🎣 简洁认证 Hook
 *
 * 轻量级认证系统，仅包含基本功能：
 * - 用户会话管理
 * - 登录/登出功能
 * - 认证状态检查
 * - 简洁的 API 接口
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import useSWR from 'swr';

// ================================
// 类型定义
// ================================

export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string | null;
  avatar?: string; // 处理后的avatar，null值已转为undefined
  createdAt: Date;
  lastLoginAt?: Date | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// ================================
// Fetcher 函数
// ================================

const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include' // 包含 cookies
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === 'error') {
    throw new Error(data.message || '服务器错误');
  }

  return data;
};

// ================================
// 核心认证 Hook
// ================================

/**
 * 认证状态管理 Hook
 *
 * 提供用户会话信息和认证状态
 */
export function useAuth(): AuthState & {
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => void;
} {
  const [error, setError] = useState<string | null>(null);

  // 使用 SWR 获取会话信息
  const {
    data,
    error: swrError,
    isLoading,
    mutate
  } = useSWR('/api/auth/session', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: false,
    errorRetryCount: 1
  });

  // 处理 SWR 错误
  useEffect(() => {
    if (swrError) {
      setError('获取用户信息失败');
    } else {
      setError(null);
    }
  }, [swrError]);

  // 登录函数
  const login = useCallback(
    async (username: string, password: string) => {
      try {
        setError(null);

        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.status === 'success') {
          // 登录成功，刷新会话数据
          await mutate();
          return { success: true };
        } else {
          const errorMessage =
            result.data?.error || result.message || '登录失败';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (err) {
        const errorMessage = '登录过程中出现错误';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    [mutate]
  );

  // 登出函数
  const logout = useCallback(async () => {
    try {
      setError(null);

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // 清除本地状态
      await mutate(null, false);

      // 重定向到登录页
      window.location.href = '/auth/login';
    } catch (err) {
      console.error('登出失败:', err);
      // 即使失败也清除本地状态
      await mutate(null, false);
      window.location.href = '/auth/login';
    }
  }, [mutate]);

  // 刷新会话
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  // 计算认证状态并处理avatar字段
  const rawUser = data?.data?.user || null;
  const user = rawUser
    ? {
        ...rawUser,
        avatar: rawUser.avatar || undefined // 将null转换为undefined
      }
    : null;
  const isAuthenticated = data?.data?.authenticated || false;

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    refresh
  };
}
