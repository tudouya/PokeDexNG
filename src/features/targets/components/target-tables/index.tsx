'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import type { Target } from '../../types';
import { ColumnDef } from '@tanstack/react-table';
import { parseAsInteger, useQueryState } from 'nuqs';

interface TargetTableParams {
  data: Target[];
  totalItems: number;
  columns: ColumnDef<Target>[];
}

export function TargetTable({ data, totalItems, columns }: TargetTableParams) {
  const [pageSize] = useQueryState('limit', parseAsInteger.withDefault(10));

  const pageCount = Math.ceil(totalItems / pageSize);

  const { table } = useDataTable({
    data,
    columns,
    pageCount: pageCount,
    shallow: false, // 触发网络请求更新查询字符串
    debounceMs: 500
  });

  return (
    <DataTable table={table} totalItems={totalItems}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
