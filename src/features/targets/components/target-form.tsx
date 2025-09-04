'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Target as TargetIcon,
  Globe,
  BarChart,
  FileText
} from 'lucide-react';
import {
  CreateTargetSchema,
  type CreateTargetInput
} from '../validations/target.validation';
import { useCreateTarget, useUpdateTarget } from '../hooks/useTargets';
import type { Target } from '../types';
import {
  TARGET_TYPE_OPTIONS,
  TARGET_STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  DEPLOYMENT_ENV_OPTIONS,
  NETWORK_ZONE_OPTIONS
} from './target-tables/options';

interface TargetFormProps {
  initialData?: Target | null;
  mode?: 'create' | 'edit';
}

export function TargetForm({ initialData, mode = 'create' }: TargetFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { create } = useCreateTarget();
  const { update } = useUpdateTarget(initialData?.id || 0);

  const form = useForm<CreateTargetInput>({
    resolver: zodResolver(CreateTargetSchema),
    defaultValues: initialData
      ? {
          projectName: initialData.projectName || '',
          name: initialData.name,
          type: initialData.type,
          url: initialData.url || '',
          description: initialData.description || '',
          deploymentEnv: initialData.deploymentEnv || 'PROD',
          networkZone: initialData.networkZone || 'INTERNET',
          scope: initialData.scope || '',
          status: initialData.status,
          priority: initialData.priority,
          remark: initialData.remark || ''
        }
      : {
          projectName: '',
          name: '',
          type: 'WEB_APPLICATION',
          url: '',
          description: '',
          deploymentEnv: 'PROD',
          networkZone: 'INTERNET',
          scope: '',
          status: 'PENDING',
          priority: 'MEDIUM',
          remark: ''
        }
  });

  const onSubmit = async (values: CreateTargetInput) => {
    try {
      setLoading(true);

      if (mode === 'edit' && initialData) {
        const result = await update(values);
        if (result) {
          toast.success('目标更新成功');
          router.push('/dashboard/targets');
        }
      } else {
        const result = await create(values);
        if (result) {
          toast.success('目标创建成功');
          router.push('/dashboard/targets');
        }
      }
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='mx-auto w-full max-w-6xl'>
      <CardHeader>
        <CardTitle>{mode === 'edit' ? '编辑目标' : '新增目标'}</CardTitle>
        <CardDescription>
          {mode === 'edit' ? '更新目标信息' : '创建新的渗透测试目标'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
            {/* 组1：核心信息 */}
            <div className='space-y-6'>
              <div>
                <h3 className='flex items-center gap-2 text-lg font-medium'>
                  <TargetIcon className='h-5 w-5' />
                  核心信息
                </h3>
                <p className='text-muted-foreground text-sm'>
                  目标的基本识别信息（带*为必填项）
                </p>
              </div>
              <Separator />
              <div className='space-y-4'>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                  {/* 目标名称 */}
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目标名称 *</FormLabel>
                        <FormControl>
                          <Input placeholder='输入目标名称' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 目标类型 */}
                  <FormField
                    control={form.control}
                    name='type'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>目标类型 *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='选择目标类型' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TARGET_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 目标URL - 单独一行全宽 */}
                <FormField
                  control={form.control}
                  name='url'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>目标URL</FormLabel>
                      <FormControl>
                        <Input placeholder='https://example.com' {...field} />
                      </FormControl>
                      <FormDescription>
                        目标的访问地址，支持HTTP/HTTPS（可选）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className='my-8' />

            {/* 组2：环境配置 */}
            <div className='space-y-6'>
              <div>
                <h3 className='flex items-center gap-2 text-lg font-medium'>
                  <Globe className='h-5 w-5' />
                  环境配置
                </h3>
                <p className='text-muted-foreground text-sm'>
                  目标的部署环境和网络信息
                </p>
              </div>
              <Separator />
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* 部署环境 */}
                <FormField
                  control={form.control}
                  name='deploymentEnv'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部署环境</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择部署环境' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPLOYMENT_ENV_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 网络区域 */}
                <FormField
                  control={form.control}
                  name='networkZone'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>网络区域</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择网络区域' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {NETWORK_ZONE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className='my-8' />

            {/* 组3：管理信息 */}
            <div className='space-y-6'>
              <div>
                <h3 className='flex items-center gap-2 text-lg font-medium'>
                  <BarChart className='h-5 w-5' />
                  管理信息
                </h3>
                <p className='text-muted-foreground text-sm'>
                  项目归属和优先级设置
                </p>
              </div>
              <Separator />
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* 项目名称（可选）*/}
                <FormField
                  control={form.control}
                  name='projectName'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        项目名称
                        <span className='text-muted-foreground ml-2 text-sm'>
                          (可选)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder='如有所属项目，请输入项目名称'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 优先级 */}
                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>优先级</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择优先级' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 当前状态 */}
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>当前状态</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='选择状态' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TARGET_STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className='my-8' />

            {/* 组4：详细描述 */}
            <div className='space-y-6'>
              <div>
                <h3 className='flex items-center gap-2 text-lg font-medium'>
                  <FileText className='h-5 w-5' />
                  详细描述
                </h3>
                <p className='text-muted-foreground text-sm'>
                  提供更多目标相关信息
                </p>
              </div>
              <Separator />
              <div className='space-y-4'>
                {/* 描述 */}
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>描述</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='描述目标的详细信息...'
                          className='resize-none'
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 测试范围 */}
                <FormField
                  control={form.control}
                  name='scope'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>测试范围</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='描述测试范围和边界...'
                          className='resize-none'
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 备注 */}
                <FormField
                  control={form.control}
                  name='remark'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>备注</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='其他备注信息...'
                          className='resize-none'
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button type='submit' disabled={loading}>
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {mode === 'edit' ? '更新目标' : '创建目标'}
              </Button>
              <Button
                type='button'
                variant='outline'
                onClick={() => router.back()}
              >
                取消
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
