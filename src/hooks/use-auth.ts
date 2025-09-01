/**
 * 🎣 简洁认证 Hook
 *
 * 替换复杂的 NextAuth 客户端，使用新的会话系统：
 * - 轻量级会话管理
 * - SWR 支持的权限缓存
 * - 清晰的认证状态
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

// ================================
// 权限检查 Hook
// ================================

/**
 * 权限检查 Hook
 *
 * 使用 SWR 缓存权限信息，提高性能
 */
export function usePermissions(permissions?: string[]) {
  const { isAuthenticated } = useAuth();

  // 获取所有权限
  const { data: allPermissionsData, error: allError } = useSWR(
    isAuthenticated ? '/api/auth/permissions' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000 // 1分钟去重
    }
  );

  // 批量检查特定权限
  const { data: specificPermissionsData, error: specificError } = useSWR(
    isAuthenticated && permissions && permissions.length > 0
      ? ['/api/auth/permissions', { type: 'permissions', permissions }]
      : null,
    ([url, body]) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      }).then((res) => res.json()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  );

  const allPermissions = allPermissionsData?.data?.permissions || [];
  const specificResults = specificPermissionsData?.data?.permissions || {};

  return {
    // 所有权限列表
    permissions: allPermissions,

    // 检查单个权限
    hasPermission: (permission: string) => {
      return allPermissions.includes(permission);
    },

    // 检查多个权限（使用批量查询结果）
    hasPermissions: (perms: string[]) => {
      if (permissions && permissions.length > 0) {
        // 如果提供了权限列表，使用批量查询结果
        return perms.reduce(
          (acc, perm) => {
            acc[perm] = specificResults[perm] || false;
            return acc;
          },
          {} as Record<string, boolean>
        );
      } else {
        // 否则使用本地权限列表
        return perms.reduce(
          (acc, perm) => {
            acc[perm] = allPermissions.includes(perm);
            return acc;
          },
          {} as Record<string, boolean>
        );
      }
    },

    // 加载状态
    isLoading: !allPermissionsData && !allError,

    // 错误状态
    error: allError || specificError
  };
}

// ================================
// 便捷权限检查 Hooks
// ================================

/**
 * 检查用户管理权限
 */
export function useUserPermissions() {
  const permissions = [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'user.manage'
  ];

  const { hasPermissions } = usePermissions(permissions);
  const results = hasPermissions(permissions);

  return {
    canCreate: results['user.create'],
    canRead: results['user.read'],
    canUpdate: results['user.update'],
    canDelete: results['user.delete'],
    canManage: results['user.manage']
  };
}

/**
 * 检查项目管理权限
 */
export function useProjectPermissions() {
  const permissions = [
    'project.create',
    'project.read',
    'project.update',
    'project.delete',
    'project.manage'
  ];

  const { hasPermissions } = usePermissions(permissions);
  const results = hasPermissions(permissions);

  return {
    canCreate: results['project.create'],
    canRead: results['project.read'],
    canUpdate: results['project.update'],
    canDelete: results['project.delete'],
    canManage: results['project.manage']
  };
}

/**
 * 检查漏洞管理权限
 */
export function useVulnerabilityPermissions() {
  const permissions = [
    'vulnerability.create',
    'vulnerability.read',
    'vulnerability.update',
    'vulnerability.delete',
    'vulnerability.manage'
  ];

  const { hasPermissions } = usePermissions(permissions);
  const results = hasPermissions(permissions);

  return {
    canCreate: results['vulnerability.create'],
    canRead: results['vulnerability.read'],
    canUpdate: results['vulnerability.update'],
    canDelete: results['vulnerability.delete'],
    canManage: results['vulnerability.manage']
  };
}
