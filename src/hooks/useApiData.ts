'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// JSend响应格式类型
export type JSendSuccess<T> = {
  status: 'success';
  data: T;
};

export type JSendFail<T = Record<string, string>> = {
  status: 'fail';
  data: T;
};

export type JSendError = {
  status: 'error';
  message: string;
  code?: number;
  data?: any;
};

export type JSendResponse<T, E = any> =
  | JSendSuccess<T>
  | JSendFail<E>
  | JSendError;

// 错误类型定义
export type ApiError =
  | { type: 'network'; message: string }
  | { type: 'server'; message: string; code?: number }
  | { type: 'validation'; details: Record<string, string> }
  | { type: 'not_found'; resource: string }
  | { type: 'unauthorized'; message: string };

export function useApiData<T, P = any>(
  endpoint: string,
  options?: {
    immediate?: boolean;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (params?: P): Promise<T | null> => {
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoading(true);
        setError(null);

        const config: RequestInit = {
          signal: controller.signal,
          method: options?.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers
          }
        };

        if (
          params &&
          (options?.method === 'POST' || options?.method === 'PUT')
        ) {
          config.body = JSON.stringify(params);
        }

        const response = await fetch(endpoint, config);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const json: JSendResponse<T> = await response.json();

        switch (json.status) {
          case 'success':
            setData(json.data);
            return json.data;

          case 'fail':
            if (response.status === 404) {
              setError({ type: 'not_found', resource: endpoint });
            } else if (response.status === 401 || response.status === 403) {
              setError({
                type: 'unauthorized',
                message: typeof json.data === 'string' ? json.data : '权限不足'
              });
            } else {
              setError({
                type: 'validation',
                details:
                  typeof json.data === 'object'
                    ? json.data
                    : { error: '验证失败' }
              });
            }
            return null;

          case 'error':
            setError({
              type: 'server',
              message: json.message,
              code: json.code
            });
            return null;

          default:
            throw new Error('无效的响应格式');
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return null; // 请求被取消，不设置错误
        }

        if (err instanceof TypeError && err.message.includes('fetch')) {
          setError({ type: 'network', message: '网络连接失败' });
        } else {
          setError({
            type: 'network',
            message: err instanceof Error ? err.message : '未知网络错误'
          });
        }
        return null;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [endpoint, options?.method]
  );

  // 组件卸载时取消请求
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // 自动执行选项
  useEffect(() => {
    if (options?.immediate) {
      execute();
    }
  }, [execute, options?.immediate]);

  return {
    data,
    loading,
    error,
    execute,
    refetch: () => execute(),
    setData // 用于乐观更新
  };
}
