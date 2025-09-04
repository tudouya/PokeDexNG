'use client';

import { useCallback, useState, useMemo, useEffect } from 'react';
import { useApiData } from '@/hooks/useApiData';
import type {
  Target,
  CreateTargetDTO,
  UpdateTargetDTO,
  FindTargetsDTO,
  PaginatedTargets,
  TargetStats
} from '../types';

// 目标列表Hook
export function useTargets(initialParams?: FindTargetsDTO) {
  const [currentParams, setCurrentParams] = useState<
    FindTargetsDTO | undefined
  >(initialParams);

  const queryString = useMemo(() => {
    const params = {
      page: currentParams?.page?.toString() || '1',
      limit: currentParams?.limit?.toString() || '10',
      ...(currentParams?.projectName && {
        projectName: currentParams.projectName
      }),
      ...(currentParams?.type && { type: currentParams.type }),
      ...(currentParams?.status && { status: currentParams.status }),
      ...(currentParams?.priority && { priority: currentParams.priority }),
      ...(currentParams?.deploymentEnv && {
        deploymentEnv: currentParams.deploymentEnv
      }),
      ...(currentParams?.networkZone && {
        networkZone: currentParams.networkZone
      }),
      ...(currentParams?.search && { search: currentParams.search }),
      ...(currentParams?.includeDeleted && { includeDeleted: 'true' })
    };

    const filteredEntries = Object.entries(params).filter(
      ([_, value]) => value !== undefined
    );
    return '?' + new URLSearchParams(filteredEntries).toString();
  }, [currentParams]);

  const { data, loading, error, execute, refetch } =
    useApiData<PaginatedTargets>(`/api/targets${queryString}`, {
      immediate: true
    });

  const refresh = useCallback(
    async (newParams?: FindTargetsDTO) => {
      if (newParams) {
        setCurrentParams(newParams);
      }
      return await execute();
    },
    [execute]
  );

  // 同步外部参数变化
  useEffect(() => {
    if (initialParams) {
      setCurrentParams(initialParams);
    }
  }, [initialParams]);

  return {
    targets: data?.data || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    loading,
    error,
    refresh,
    refetch
  };
}

// 单个目标Hook
export function useTarget(id: number) {
  const { data, loading, error, execute, refetch } = useApiData<Target>(
    `/api/targets/${id}`,
    { immediate: !!id }
  );

  return {
    target: data,
    loading,
    error,
    refresh: refetch,
    refetch
  };
}

// 创建目标Hook
export function useCreateTarget() {
  const [success, setSuccess] = useState(false);
  const { loading, error, execute } = useApiData<Target, CreateTargetDTO>(
    '/api/targets',
    { method: 'POST' }
  );

  const create = useCallback(
    async (data: CreateTargetDTO): Promise<Target | null> => {
      setSuccess(false);
      const result = await execute(data);

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
    create,
    creating: loading,
    error,
    success,
    reset
  };
}

// 更新目标Hook
export function useUpdateTarget(id: number) {
  const [success, setSuccess] = useState(false);
  const { loading, error, execute } = useApiData<Target, UpdateTargetDTO>(
    `/api/targets/${id}`,
    { method: 'PUT' }
  );

  const update = useCallback(
    async (data: UpdateTargetDTO): Promise<Target | null> => {
      setSuccess(false);
      const result = await execute(data);

      if (result) {
        setSuccess(true);
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
    update,
    updating: loading,
    error,
    success,
    reset
  };
}

// 删除目标Hook
export function useDeleteTarget(id: number) {
  const [success, setSuccess] = useState(false);
  const { loading, error, execute } = useApiData<{
    message: string;
    target: Target;
  }>(`/api/targets/${id}`, { method: 'DELETE' });

  const deleteTarget = useCallback(async (): Promise<boolean> => {
    setSuccess(false);
    const result = await execute();

    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return true;
    }

    return false;
  }, [execute]);

  const reset = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    deleteTarget,
    deleting: loading,
    error,
    success,
    reset
  };
}

// 恢复目标Hook
export function useRestoreTarget(id: number) {
  const [success, setSuccess] = useState(false);
  const { loading, error, execute } = useApiData<{
    message: string;
    target: Target;
  }>(`/api/targets/${id}/restore`, { method: 'POST' });

  const restoreTarget = useCallback(async (): Promise<boolean> => {
    setSuccess(false);
    const result = await execute();

    if (result) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return true;
    }

    return false;
  }, [execute]);

  const reset = useCallback(() => {
    setSuccess(false);
  }, []);

  return {
    restoreTarget,
    restoring: loading,
    error,
    success,
    reset
  };
}

// 目标统计Hook
export function useTargetStats(projectName?: string) {
  const queryString = projectName
    ? `?projectName=${encodeURIComponent(projectName)}`
    : '';

  const { data, loading, error, refetch } = useApiData<TargetStats>(
    `/api/targets/stats${queryString}`,
    { immediate: true }
  );

  return {
    stats: data,
    loading,
    error,
    refresh: refetch
  };
}
