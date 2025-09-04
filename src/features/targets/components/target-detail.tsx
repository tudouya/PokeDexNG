'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Target as TargetIcon,
  Globe,
  BarChart,
  FileText,
  Edit,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Target } from '../types';

interface TargetDetailProps {
  target: Target;
}

// 类型显示名称映射
const typeDisplayNames = {
  WEB_APPLICATION: 'Web应用',
  API: 'API接口',
  SERVER: '服务器',
  NETWORK: '网络设备',
  MOBILE_APP: '移动应用',
  WECHAT_APP: '微信小程序',
  DATABASE: '数据库',
  OTHER: '其他'
} as const;

// 状态显示名称映射
const statusDisplayNames = {
  PENDING: '待测试',
  IN_PROGRESS: '测试中',
  COMPLETED: '已完成',
  ON_HOLD: '暂停'
} as const;

// 优先级显示名称映射
const priorityDisplayNames = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  CRITICAL: '紧急'
} as const;

// 优先级颜色映射
const priorityColors = {
  LOW: 'secondary',
  MEDIUM: 'default',
  HIGH: 'default',
  CRITICAL: 'destructive'
} as const;

// 状态颜色映射
const statusColors = {
  PENDING: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  ON_HOLD: 'secondary'
} as const;

export function TargetDetail({ target }: TargetDetailProps) {
  const router = useRouter();

  return (
    <div className='space-y-6'>
      {/* 标题栏 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button variant='outline' size='icon' onClick={() => router.back()}>
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <div>
            <h1 className='text-2xl font-bold'>{target.name}</h1>
            <p className='text-muted-foreground'>
              {target.projectName && `${target.projectName} • `}
              创建于 {new Date(target.createdAt).toLocaleDateString('zh-CN')}
            </p>
          </div>
        </div>

        {!target.isDeleted && (
          <Button
            onClick={() => router.push(`/dashboard/targets/${target.id}/edit`)}
          >
            <Edit className='mr-2 h-4 w-4' />
            编辑目标
          </Button>
        )}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* 核心信息卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <TargetIcon className='h-5 w-5' />
              核心信息
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium'>目标类型</p>
                <Badge variant='outline'>{typeDisplayNames[target.type]}</Badge>
              </div>

              <div>
                <p className='text-sm font-medium'>当前状态</p>
                <Badge variant={statusColors[target.status]}>
                  {statusDisplayNames[target.status]}
                </Badge>
              </div>

              <div>
                <p className='text-sm font-medium'>优先级</p>
                <Badge variant={priorityColors[target.priority]}>
                  {priorityDisplayNames[target.priority]}
                </Badge>
              </div>

              <div>
                <p className='text-sm font-medium'>项目名称</p>
                <p className='text-muted-foreground text-sm'>
                  {target.projectName || '-'}
                </p>
              </div>
            </div>

            {target.url && (
              <div>
                <p className='mb-2 text-sm font-medium'>目标URL</p>
                <a
                  href={target.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                >
                  {target.url}
                  <ExternalLink className='h-3 w-3' />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 环境配置卡片 */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5' />
              环境配置
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-sm font-medium'>部署环境</p>
                <Badge variant='secondary' className='text-xs'>
                  {target.deploymentEnv}
                </Badge>
              </div>

              <div>
                <p className='text-sm font-medium'>网络区域</p>
                <Badge variant='secondary' className='text-xs'>
                  {target.networkZone}
                </Badge>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <p className='font-medium'>创建时间</p>
                <p className='text-muted-foreground'>
                  {new Date(target.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>

              <div>
                <p className='font-medium'>更新时间</p>
                <p className='text-muted-foreground'>
                  {new Date(target.updatedAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 详细描述卡片 */}
      {(target.description || target.scope || target.remark) && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <FileText className='h-5 w-5' />
              详细描述
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {target.description && (
              <div>
                <p className='mb-2 text-sm font-medium'>描述</p>
                <p className='text-muted-foreground text-sm whitespace-pre-wrap'>
                  {target.description}
                </p>
              </div>
            )}

            {target.scope && (
              <div>
                <p className='mb-2 text-sm font-medium'>测试范围</p>
                <p className='text-muted-foreground text-sm whitespace-pre-wrap'>
                  {target.scope}
                </p>
              </div>
            )}

            {target.remark && (
              <div>
                <p className='mb-2 text-sm font-medium'>备注</p>
                <p className='text-muted-foreground text-sm whitespace-pre-wrap'>
                  {target.remark}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
