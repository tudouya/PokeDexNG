import { useState, useEffect } from 'react';
import {
  CreateVulnerabilityInput,
  UpdateVulnerabilityInput,
  VulnerabilityListParams,
  VulnerabilityListResponse,
  VulnerabilityDTO
} from '../types';

// JSend API 响应类型
interface JSendResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  data?: T;
  message?: string;
}

// 创建漏洞 Hook
export function useCreateVulnerability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    input: CreateVulnerabilityInput
  ): Promise<VulnerabilityDTO | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/vulnerabilities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      const result: JSendResponse<VulnerabilityDTO> = await response.json();

      if (result.status === 'success' && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || '创建漏洞失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建漏洞失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}

// 更新漏洞 Hook
export function useUpdateVulnerability(id: number) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    input: Partial<CreateVulnerabilityInput>
  ): Promise<VulnerabilityDTO | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vulnerabilities/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      });

      const result: JSendResponse<VulnerabilityDTO> = await response.json();

      if (result.status === 'success' && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || '更新漏洞失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新漏洞失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}

// 获取漏洞列表 Hook
export function useVulnerabilities(params?: VulnerabilityListParams) {
  const [data, setData] = useState<VulnerabilityListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVulnerabilities = async (
    fetchParams?: VulnerabilityListParams
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      const finalParams = { ...params, ...fetchParams };

      Object.entries(finalParams || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, v.toString()));
          } else {
            queryParams.set(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/vulnerabilities?${queryParams}`);
      const result: JSendResponse<VulnerabilityListResponse> =
        await response.json();

      if (result.status === 'success' && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || '获取漏洞列表失败');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取漏洞列表失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVulnerabilities();
  }, [JSON.stringify(params)]);

  const refetch = (newParams?: VulnerabilityListParams) => {
    return fetchVulnerabilities(newParams);
  };

  return { data, loading, error, refetch };
}

// 获取漏洞详情 Hook
export function useVulnerability(id: number) {
  const [data, setData] = useState<VulnerabilityDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVulnerability = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vulnerabilities/${id}`);
      const result: JSendResponse<VulnerabilityDTO> = await response.json();

      if (result.status === 'success' && result.data) {
        setData(result.data);
      } else {
        throw new Error(result.message || '获取漏洞详情失败');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : '获取漏洞详情失败';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id > 0) {
      fetchVulnerability();
    }
  }, [id]);

  return { data, loading, error, refetch: fetchVulnerability };
}

// 删除漏洞 Hook
export function useDeleteVulnerability() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteVulnerability = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vulnerabilities/${id}`, {
        method: 'DELETE'
      });

      const result: JSendResponse<boolean> = await response.json();

      if (result.status === 'success') {
        return true;
      } else {
        throw new Error(result.message || '删除漏洞失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除漏洞失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteVulnerability, loading, error };
}

// 获取目标选项 Hook
export function useTargetOptions() {
  const [data, setData] = useState<
    Array<{ id: number; name: string; projectName?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/vulnerabilities/targets');
        const result: JSendResponse<
          Array<{ id: number; name: string; projectName?: string }>
        > = await response.json();

        if (result.status === 'success' && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.message || '获取目标选项失败');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取目标选项失败';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  return { data, loading, error };
}

// 获取分类选项 Hook
export function useCategoryOptions() {
  const [data, setData] = useState<
    Array<{ id: number; name: string; parentName?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/vulnerabilities/categories');
        const result: JSendResponse<
          Array<{ id: number; name: string; parentName?: string }>
        > = await response.json();

        if (result.status === 'success' && result.data) {
          setData(result.data);
        } else {
          throw new Error(result.message || '获取分类选项失败');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '获取分类选项失败';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, loading, error };
}

// 更新漏洞状态 Hook
export function useUpdateVulnerabilityStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    id: number,
    status: string,
    changeReason?: string
  ): Promise<VulnerabilityDTO | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/vulnerabilities/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, changeReason })
      });

      const result: JSendResponse<VulnerabilityDTO> = await response.json();

      if (result.status === 'success' && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || '更新状态失败');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新状态失败';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}
