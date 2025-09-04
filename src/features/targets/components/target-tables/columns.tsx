'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Target } from '../../types';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, AlertCircle, Clock, Pause } from 'lucide-react';
import { CellAction } from './cell-action';
import {
  TARGET_TYPE_OPTIONS,
  TARGET_STATUS_OPTIONS,
  PRIORITY_OPTIONS
} from './options';

// 状态图标映射
const statusIcons = {
  PENDING: Clock,
  IN_PROGRESS: AlertCircle,
  COMPLETED: CheckCircle2,
  ON_HOLD: Pause
};

// 状态颜色映射
const statusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  ON_HOLD: 'secondary'
} as const;

// 优先级颜色映射
const priorityColors = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'default',
  CRITICAL: 'destructive'
} as const;

// 目标类型显示名称映射
const typeDisplayNames = {
  WEB_APPLICATION: 'Web应用',
  API: 'API接口',
  SERVER: '服务器',
  NETWORK: '网络设备',
  MOBILE_APP: '移动应用',
  WECHAT_APP: '微信小程序',
  DATABASE: '数据库',
  OTHER: '其他'
};

// 状态显示名称映射
const statusDisplayNames = {
  PENDING: '待测试',
  IN_PROGRESS: '测试中',
  COMPLETED: '已完成',
  ON_HOLD: '暂停'
};

// 优先级显示名称映射
const priorityDisplayNames = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '紧急'
};

export const columns: ColumnDef<Target>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='目标名称' />
    ),
    cell: ({ cell }) => {
      const name = cell.getValue<string>();
      return <div className='font-medium'>{name}</div>;
    },
    meta: {
      label: 'Name',
      placeholder: '搜索目标名称...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='类型' />
    ),
    cell: ({ cell }) => {
      const type = cell.getValue<keyof typeof typeDisplayNames>();
      return (
        <Badge variant='outline' className='capitalize'>
          {typeDisplayNames[type]}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'type',
      variant: 'select',
      options: TARGET_TYPE_OPTIONS
    }
  },
  {
    accessorKey: 'projectName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='项目名称' />
    ),
    cell: ({ cell }) => {
      const projectName = cell.getValue<string>();
      return <div className='text-muted-foreground text-sm'>{projectName}</div>;
    }
  },
  {
    accessorKey: 'url',
    header: 'URL',
    cell: ({ cell }) => {
      const url = cell.getValue<string | null>();
      if (!url) return <span className='text-muted-foreground'>-</span>;

      return (
        <div className='max-w-[200px] truncate'>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-sm text-blue-600 hover:underline'
          >
            {url}
          </a>
        </div>
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<keyof typeof statusDisplayNames>();
      const Icon = statusIcons[status];
      const color = statusColors[status];

      return (
        <Badge variant={color} className='flex items-center gap-1'>
          <Icon className='h-3 w-3' />
          {statusDisplayNames[status]}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'status',
      variant: 'select',
      options: TARGET_STATUS_OPTIONS
    }
  },
  {
    id: 'priority',
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='优先级' />
    ),
    cell: ({ cell }) => {
      const priority = cell.getValue<keyof typeof priorityDisplayNames>();
      const color = priorityColors[priority];

      return <Badge variant={color}>{priorityDisplayNames[priority]}</Badge>;
    },
    enableColumnFilter: true,
    meta: {
      label: 'priority',
      variant: 'select',
      options: PRIORITY_OPTIONS
    }
  },
  {
    accessorKey: 'deploymentEnv',
    header: '环境',
    cell: ({ cell }) => {
      const env = cell.getValue<string | null>();
      if (!env) return <span className='text-muted-foreground'>-</span>;

      return (
        <Badge variant='secondary' className='text-xs'>
          {env}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='创建时间' />
    ),
    cell: ({ cell }) => {
      const date = cell.getValue<Date>();
      return (
        <div className='text-muted-foreground text-sm'>
          {new Date(date).toLocaleDateString('zh-CN')}
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
