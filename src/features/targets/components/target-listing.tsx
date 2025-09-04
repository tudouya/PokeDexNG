'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTargets } from '../hooks/useTargets';
import { TargetTable } from './target-tables';
import { columns } from './target-tables/columns';
import type { FindTargetsDTO } from '../types';
import { useSearchParams } from 'next/navigation';

export default function TargetListingPage() {
  const searchParams = useSearchParams();
  // 使用useMemo稳定filters对象引用，避免不必要的重新渲染
  const filters = useMemo<FindTargetsDTO>(() => {
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    const projectName = searchParams.get('projectName') || undefined;
    const type = (searchParams.get('type') as any) || undefined;
    const status = (searchParams.get('status') as any) || undefined;
    const priority = (searchParams.get('priority') as any) || undefined;
    const search = searchParams.get('search') || undefined;

    return {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      projectName,
      type,
      status,
      priority,
      search,
      includeDeleted: false
    };
  }, [searchParams]);

  // 使用Hook获取数据
  const { targets, total, loading, error, refresh } = useTargets(filters);

  // 错误处理
  if (error) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <div className='text-center'>
          <h3 className='mb-2 text-lg font-medium text-gray-900'>加载失败</h3>
          <p className='mb-4 text-gray-500'>
            {error.type === 'network' ? '网络连接失败' : '服务器错误'}
          </p>
          <button
            onClick={() => refresh()}
            className='rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <TargetTable data={targets} totalItems={total} columns={columns} />
    </div>
  );
}
