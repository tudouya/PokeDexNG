# 标准Hook模板

本文档定义了项目中**必须使用**的标准数据获取Hook模板。所有数据获取逻辑都必须基于这些模板实现。

## 核心原则

- **统一响应处理**: 所有Hook必须处理JSend标准响应格式
- **错误类型化**: 区分网络错误、服务器错误、验证错误
- **请求取消**: 避免内存泄漏和竞态条件
- **类型安全**: 完整的TypeScript类型定义

## JSend响应格式

```typescript
// 成功响应
type JSendSuccess<T> = {
  status: 'success';
  data: T;
};

// 客户端错误（验证失败等）
type JSendFail<T = Record<string, string>> = {
  status: 'fail';
  data: T;
};

// 服务器错误
type JSendError = {
  status: 'error';
  message: string;
  code?: number;
  data?: any;
};

type JSendResponse<T, E = any> = JSendSuccess<T> | JSendFail<E> | JSendError;
```

## 错误类型定义

```typescript
export type ApiError =
  | { type: 'network'; message: string }
  | { type: 'server'; message: string; code?: number }
  | { type: 'validation'; details: Record<string, string> }
  | { type: 'not_found'; resource: string }
  | { type: 'unauthorized'; message: string };
```

## 基础数据获取Hook

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';

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
```

## Zustand集成Hook

```typescript
import { useVulnerabilityStore } from '@/lib/stores/vulnerability-store';

export function useVulnerabilities() {
  const store = useVulnerabilityStore();
  const { data, loading, error, execute } = useApiData<Vulnerability[]>(
    '/api/vulnerabilities',
    { immediate: true }
  );

  const fetchVulnerabilities = useCallback(
    async (filters?: VulnFilters) => {
      const queryParams = filters
        ? `?${new URLSearchParams(filters).toString()}`
        : '';
      const vulnerabilities = await execute();

      if (vulnerabilities) {
        store.setVulnerabilities(vulnerabilities);
      }

      return vulnerabilities;
    },
    [execute, store]
  );

  const createVulnerability = useCallback(
    async (data: CreateVulnDTO) => {
      const { execute: createExecute } = useApiData<Vulnerability>(
        '/api/vulnerabilities',
        { method: 'POST' }
      );

      const newVuln = await createExecute(data);
      if (newVuln) {
        store.addVulnerability(newVuln);
      }

      return newVuln;
    },
    [store]
  );

  return {
    vulnerabilities: store.vulnerabilities,
    loading: loading || store.loading,
    error: error || store.error,
    fetchVulnerabilities,
    createVulnerability,
    refetch: fetchVulnerabilities
  };
}
```

## 分页数据Hook

```typescript
export function usePaginatedData<T>(
  baseEndpoint: string,
  initialParams: PaginationParams = { page: 1, limit: 20 }
) {
  const [params, setParams] = useState(initialParams);
  const [allData, setAllData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);

  const endpoint = `${baseEndpoint}?${new URLSearchParams({
    page: params.page.toString(),
    limit: params.limit.toString(),
    ...params.filters
  }).toString()}`;

  const { data, loading, error, execute } = useApiData<{
    items: T[];
    total: number;
    page: number;
    totalPages: number;
  }>(endpoint);

  const fetchPage = useCallback(
    async (pageParams?: Partial<PaginationParams>) => {
      const newParams = { ...params, ...pageParams };
      setParams(newParams);

      const result = await execute();
      if (result) {
        setAllData(result.items);
        setTotal(result.total);
      }

      return result;
    },
    [execute, params]
  );

  const nextPage = useCallback(() => {
    if (data && params.page < Math.ceil(total / params.limit)) {
      fetchPage({ page: params.page + 1 });
    }
  }, [data, params.page, params.limit, total, fetchPage]);

  const prevPage = useCallback(() => {
    if (params.page > 1) {
      fetchPage({ page: params.page - 1 });
    }
  }, [params.page, fetchPage]);

  return {
    data: allData,
    loading,
    error,
    total,
    currentPage: params.page,
    totalPages: data ? Math.ceil(total / params.limit) : 0,
    hasNextPage: data ? params.page < Math.ceil(total / params.limit) : false,
    hasPrevPage: params.page > 1,
    fetchPage,
    nextPage,
    prevPage,
    refetch: () => fetchPage()
  };
}
```

## 表单提交Hook

```typescript
export function useFormSubmit<T, R = any>(
  endpoint: string,
  method: 'POST' | 'PUT' = 'POST'
) {
  const { loading, error, execute } = useApiData<R, T>(endpoint, { method });
  const [success, setSuccess] = useState(false);

  const submit = useCallback(
    async (formData: T): Promise<R | null> => {
      setSuccess(false);
      const result = await execute(formData);

      if (result) {
        setSuccess(true);
        // 3秒后清除成功状态
        setTimeout(() => setSuccess(false), 3000);
      }

      return result;
    },
    [execute]
  );

  const reset = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
}
```

## 文件上传Hook

```typescript
export function useFileUpload(endpoint: string = '/api/upload') {
  const [progress, setProgress] = useState(0);
  const { loading, error, execute } = useApiData<{
    url: string;
    filename: string;
  }>(endpoint, { method: 'POST' });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              setProgress((e.loaded / e.total) * 100);
            }
          });

          xhr.addEventListener('load', async () => {
            if (xhr.status === 200) {
              const response = JSON.parse(xhr.responseText);
              if (response.status === 'success') {
                resolve(response.data.url);
              } else {
                reject(new Error(response.message || '上传失败'));
              }
            } else {
              reject(new Error('上传失败'));
            }
            setProgress(0);
          });

          xhr.addEventListener('error', () => {
            reject(new Error('网络错误'));
            setProgress(0);
          });

          xhr.open('POST', endpoint);
          xhr.send(formData);
        });
      } catch (err) {
        setProgress(0);
        throw err;
      }
    },
    [endpoint]
  );

  return {
    upload,
    loading,
    error,
    progress
  };
}
```

## 使用示例

### 基础数据获取

```typescript
// 组件中使用
function VulnerabilityList() {
  const { data: vulnerabilities, loading, error, refetch } = useApiData<Vulnerability[]>(
    '/api/vulnerabilities',
    { immediate: true }
  );

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay error={error} onRetry={refetch} />;

  return (
    <div>
      {vulnerabilities?.map(vuln => (
        <VulnCard key={vuln.id} vulnerability={vuln} />
      ))}
    </div>
  );
}
```

### 表单提交

```typescript
function CreateVulnForm() {
  const { submit, loading, error, success } = useFormSubmit<CreateVulnDTO>(
    '/api/vulnerabilities'
  );

  const { register, handleSubmit, reset } = useForm<CreateVulnDTO>();

  const onSubmit = async (data: CreateVulnDTO) => {
    const result = await submit(data);
    if (result) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 表单字段 */}
      <button type="submit" disabled={loading}>
        {loading ? '创建中...' : '创建漏洞'}
      </button>

      {error && <ErrorMessage error={error} />}
      {success && <SuccessMessage message="漏洞创建成功" />}
    </form>
  );
}
```

## 错误处理组件

```typescript
// 通用错误显示组件
function ErrorDisplay({ error, onRetry }: {
  error: ApiError;
  onRetry?: () => void;
}) {
  const getErrorMessage = (error: ApiError): string => {
    switch (error.type) {
      case 'network':
        return `网络错误: ${error.message}`;
      case 'server':
        return `服务器错误: ${error.message}`;
      case 'validation':
        return Object.entries(error.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      case 'not_found':
        return '请求的资源不存在';
      case 'unauthorized':
        return error.message;
      default:
        return '未知错误';
    }
  };

  return (
    <div className="error-container">
      <p>{getErrorMessage(error)}</p>
      {error.type === 'network' && onRetry && (
        <button onClick={onRetry}>重试</button>
      )}
    </div>
  );
}
```

## 测试指南

```typescript
// Hook测试示例
import { renderHook, waitFor } from '@testing-library/react';
import { useApiData } from '@/hooks/useApiData';

describe('useApiData', () => {
  it('should handle successful response', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'success', data: mockData })
    });

    const { result } = renderHook(() =>
      useApiData<typeof mockData>('/api/test')
    );

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle validation errors', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        status: 'fail',
        data: { email: '邮箱格式不正确' }
      })
    });

    const { result } = renderHook(() => useApiData('/api/test'));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toEqual({
        type: 'validation',
        details: { email: '邮箱格式不正确' }
      });
    });
  });
});
```

## 注意事项

1. **所有数据获取必须使用这些模板**
2. **禁止在组件中直接使用fetch**
3. **错误处理必须统一**
4. **请求取消必须正确实现**
5. **类型定义必须完整**

遵循这些模板可以确保：

- 一致的错误处理体验
- 避免内存泄漏
- 提高代码可维护性
- 简化测试编写
