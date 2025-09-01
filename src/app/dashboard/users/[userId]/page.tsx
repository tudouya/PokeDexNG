/**
 * User Details Page
 * 用户详细信息页面 - 提供用户资料编辑、角色管理和审计跟踪功能
 *
 * 满足要求：
 * - 3.3: 详细用户管理和角色管理界面
 * - 4.4: 包括审计跟踪显示，用于合规性要求
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  IconArrowLeft,
  IconEdit,
  IconDeviceFloppy,
  IconX,
  IconUserCheck,
  IconUserX,
  IconKey,
  IconHistory,
  IconShield,
  IconMail,
  IconUser,
  IconCalendar,
  IconClock,
  IconRefresh,
  IconAlertTriangle
} from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

import {
  useUserDetails,
  type UpdateUserRequest
} from '@/hooks/use-user-details';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { useRoles } from '@/hooks/use-roles';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from 'sonner';

// 表单验证模式
const UserUpdateSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z
    .string()
    .min(3, '用户名长度至少3个字符')
    .max(20, '用户名长度最多20个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线'),
  fullName: z.string().max(50, '全名长度不能超过50个字符').optional(),
  roleIds: z.array(z.number()),
  reason: z.string().optional()
});

type UserUpdateForm = z.infer<typeof UserUpdateSchema>;

interface PageProps {
  params: Promise<{ userId: string }>;
}

/**
 * 用户状态徽章组件
 */
function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
      }
    >
      {isActive ? '活跃' : '停用'}
    </Badge>
  );
}

/**
 * 权限类别徽章组件
 */
function PermissionCategoryBadge({ category }: { category: string }) {
  const colors = {
    project: 'bg-blue-100 text-blue-800',
    vulnerability: 'bg-red-100 text-red-800',
    report: 'bg-green-100 text-green-800',
    user: 'bg-purple-100 text-purple-800',
    system: 'bg-gray-100 text-gray-800'
  };

  return (
    <Badge
      variant='outline'
      className={colors[category as keyof typeof colors] || colors.system}
    >
      {category}
    </Badge>
  );
}

/**
 * 审计日志动作格式化
 */
function formatAuditAction(action: string): { label: string; color: string } {
  const actions: Record<string, { label: string; color: string }> = {
    user_created: { label: '创建用户', color: 'text-green-600' },
    user_updated: { label: '更新用户', color: 'text-blue-600' },
    user_roles_updated: { label: '角色变更', color: 'text-purple-600' },
    user_deactivated: { label: '停用用户', color: 'text-red-600' },
    user_reactivated: { label: '激活用户', color: 'text-green-600' },
    password_reset: { label: '重置密码', color: 'text-orange-600' },
    login_success: { label: '登录成功', color: 'text-green-600' },
    login_failed: { label: '登录失败', color: 'text-red-600' },
    permission_denied: { label: '权限拒绝', color: 'text-red-600' }
  };

  return actions[action] || { label: action, color: 'text-gray-600' };
}

export default function UserDetailsPage(props: PageProps) {
  const [params, setParams] = useState<{ userId: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [statusChangeReason, setStatusChangeReason] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  // 解析路由参数
  useEffect(() => {
    props.params.then((resolvedParams) => {
      setParams(resolvedParams);
    });
  }, [props.params]);

  // 检查是否应该开启编辑模式
  useEffect(() => {
    if (searchParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, [searchParams]);

  const userId = params ? parseInt(params.userId, 10) : 0;

  // 数据获取Hooks
  const {
    data: userDetails,
    loading: userLoading,
    error: userError,
    refetch: refetchUser,
    updateUser,
    toggleUserStatus
  } = useUserDetails({ userId, immediate: !!userId });

  const {
    auditLogs,
    loading: auditLoading,
    error: auditError,
    refetch: refetchAuditLogs,
    pagination: auditPagination
  } = useAuditLogs({ userId, immediate: !!userId });

  const {
    roles: availableRoles,
    loading: rolesLoading,
    error: rolesError
  } = useRoles({ immediate: true });

  // 表单处理
  const form = useForm<UserUpdateForm>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues: {
      email: '',
      username: '',
      fullName: '',
      roleIds: [],
      reason: ''
    }
  });

  // 当用户数据加载完成时更新表单
  useEffect(() => {
    if (userDetails) {
      form.reset({
        email: userDetails.email,
        username: userDetails.username,
        fullName: userDetails.fullName || '',
        roleIds: userDetails.roles.map((role) => role.id),
        reason: ''
      });
    }
  }, [userDetails, form]);

  // 处理表单提交
  const onSubmit = async (data: UserUpdateForm) => {
    try {
      await updateUser(data);
      setIsEditing(false);
      toast.success('用户信息更新成功');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  // 处理状态切换
  const handleToggleStatus = async (action: 'deactivate' | 'reactivate') => {
    try {
      await toggleUserStatus(action, statusChangeReason);
      setStatusChangeReason('');
      toast.success(`用户已${action === 'deactivate' ? '停用' : '激活'}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '操作失败');
    }
  };

  // 处理刷新
  const handleRefresh = () => {
    refetchUser();
    refetchAuditLogs();
  };

  if (!params || isNaN(userId)) {
    return (
      <div className='container mx-auto py-6'>
        <Alert>
          <IconAlertTriangle className='h-4 w-4' />
          <AlertDescription>无效的用户ID</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userLoading || rolesLoading) {
    return (
      <div className='container mx-auto py-6'>
        <div className='space-y-6'>
          {/* 骨架屏 */}
          <div className='flex items-center gap-4'>
            <div className='bg-muted h-10 w-10 animate-pulse rounded-full' />
            <div className='space-y-2'>
              <div className='bg-muted h-6 w-48 animate-pulse rounded' />
              <div className='bg-muted h-4 w-32 animate-pulse rounded' />
            </div>
          </div>
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className='bg-muted h-5 w-32 animate-pulse rounded' />
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    <div className='bg-muted h-4 w-full animate-pulse rounded' />
                    <div className='bg-muted h-4 w-3/4 animate-pulse rounded' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className='container mx-auto py-6'>
        <Alert>
          <IconAlertTriangle className='h-4 w-4' />
          <AlertDescription>
            加载用户信息失败: {userError}
            <Button
              variant='outline'
              size='sm'
              className='ml-4'
              onClick={refetchUser}
            >
              <IconRefresh className='mr-2 h-4 w-4' />
              重试
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className='container mx-auto py-6'>
        <Alert>
          <IconAlertTriangle className='h-4 w-4' />
          <AlertDescription>用户不存在</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='container mx-auto space-y-6 py-6'>
      {/* 页面标题和操作栏 */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='sm' onClick={() => router.back()}>
            <IconArrowLeft className='mr-2 h-4 w-4' />
            返回
          </Button>

          <div className='flex items-center gap-4'>
            <Avatar className='h-12 w-12'>
              <AvatarFallback>
                {userDetails.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-2xl font-bold'>{userDetails.username}</h1>
                <UserStatusBadge isActive={userDetails.isActive} />
              </div>
              <p className='text-muted-foreground'>{userDetails.email}</p>
              {userDetails.fullName && (
                <p className='text-muted-foreground text-sm'>
                  {userDetails.fullName}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={userLoading}
          >
            <IconRefresh
              className={`mr-2 h-4 w-4 ${userLoading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>

          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <IconEdit className='mr-2 h-4 w-4' />
              编辑
            </Button>
          ) : (
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                <IconX className='mr-2 h-4 w-4' />
                取消
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={form.formState.isSubmitting}
              >
                <IconDeviceFloppy className='mr-2 h-4 w-4' />
                保存
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 用户基本信息卡片 */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <IconUser className='h-4 w-4' />
              账户信息
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-2xl font-bold'>{userDetails.username}</div>
            <div className='text-muted-foreground text-sm'>
              ID: {userDetails.id}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <IconMail className='h-4 w-4' />
              联系方式
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-sm'>{userDetails.email}</div>
            {userDetails.fullName && (
              <div className='text-muted-foreground text-sm'>
                {userDetails.fullName}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <IconClock className='h-4 w-4' />
              最后登录
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            {userDetails.lastLoginAt ? (
              <>
                <div className='text-sm'>
                  {format(new Date(userDetails.lastLoginAt), 'yyyy-MM-dd', {
                    locale: zhCN
                  })}
                </div>
                <div className='text-muted-foreground text-xs'>
                  {format(new Date(userDetails.lastLoginAt), 'HH:mm:ss', {
                    locale: zhCN
                  })}
                </div>
              </>
            ) : (
              <div className='text-muted-foreground text-sm'>从未登录</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-sm font-medium'>
              <IconCalendar className='h-4 w-4' />
              创建时间
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='text-sm'>
              {format(new Date(userDetails.createdAt), 'yyyy-MM-dd', {
                locale: zhCN
              })}
            </div>
            <div className='text-muted-foreground text-xs'>
              {format(new Date(userDetails.createdAt), 'HH:mm:ss', {
                locale: zhCN
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主内容区域 */}
      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='profile'>用户资料</TabsTrigger>
          <TabsTrigger value='roles'>角色权限</TabsTrigger>
          <TabsTrigger value='audit'>审计日志</TabsTrigger>
          <TabsTrigger value='actions'>操作管理</TabsTrigger>
        </TabsList>

        {/* 用户资料标签页 */}
        <TabsContent value='profile' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>管理用户的基本资料信息</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form className='space-y-6'>
                    <div className='grid gap-6 md:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name='username'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>用户名</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              3-20个字符，只能包含字母、数字、下划线和横线
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>邮箱地址</FormLabel>
                            <FormControl>
                              <Input type='email' {...field} />
                            </FormControl>
                            <FormDescription>
                              用于登录和接收通知
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name='fullName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>全名</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            用户的真实姓名（可选）
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name='reason'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>修改原因</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            说明本次修改的原因（将记录到审计日志中）
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              ) : (
                <div className='space-y-6'>
                  <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>用户名</label>
                      <div className='text-muted-foreground text-sm'>
                        {userDetails.username}
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>邮箱地址</label>
                      <div className='text-muted-foreground text-sm'>
                        {userDetails.email}
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>全名</label>
                    <div className='text-muted-foreground text-sm'>
                      {userDetails.fullName || '未设置'}
                    </div>
                  </div>

                  <div className='grid gap-6 md:grid-cols-2'>
                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>账户状态</label>
                      <div>
                        <UserStatusBadge isActive={userDetails.isActive} />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <label className='text-sm font-medium'>最后更新</label>
                      <div className='text-muted-foreground text-sm'>
                        {format(
                          new Date(userDetails.updatedAt),
                          'yyyy-MM-dd HH:mm:ss',
                          { locale: zhCN }
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 角色权限标签页 */}
        <TabsContent value='roles' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>角色分配</CardTitle>
              <CardDescription>管理用户的角色和权限分配</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className='space-y-6'>
                  <FormField
                    control={form.control}
                    name='roleIds'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>选择角色</FormLabel>
                        <FormDescription>
                          为用户分配适当的角色，角色决定了用户的权限
                        </FormDescription>
                        <div className='space-y-3'>
                          {availableRoles.map((role) => (
                            <div
                              key={role.id}
                              className='flex items-start space-x-3'
                            >
                              <Checkbox
                                checked={field.value.includes(role.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, role.id]);
                                  } else {
                                    field.onChange(
                                      field.value.filter((id) => id !== role.id)
                                    );
                                  }
                                }}
                              />
                              <div className='space-y-1 leading-none'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>
                                    {role.displayName}
                                  </span>
                                  {role.isSystem && (
                                    <Badge
                                      variant='outline'
                                      className='text-xs'
                                    >
                                      系统角色
                                    </Badge>
                                  )}
                                </div>
                                {role.description && (
                                  <p className='text-muted-foreground text-sm'>
                                    {role.description}
                                  </p>
                                )}
                                <div className='flex flex-wrap gap-1'>
                                  {Array.from(
                                    new Set(
                                      role.permissions.map((p) => p.category)
                                    )
                                  ).map((category) => (
                                    <PermissionCategoryBadge
                                      key={category}
                                      category={category}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ) : (
                <div className='space-y-6'>
                  <div className='space-y-4'>
                    <h4 className='text-sm font-medium'>当前角色</h4>
                    {userDetails.roles.length > 0 ? (
                      <div className='space-y-4'>
                        {userDetails.roles.map((role) => (
                          <div key={role.id} className='rounded-lg border p-4'>
                            <div className='mb-3 flex items-center justify-between'>
                              <div className='flex items-center gap-2'>
                                <h5 className='font-medium'>
                                  {role.displayName}
                                </h5>
                                <Badge variant='outline'>{role.name}</Badge>
                              </div>
                            </div>

                            {role.description && (
                              <p className='text-muted-foreground mb-3 text-sm'>
                                {role.description}
                              </p>
                            )}

                            <div className='space-y-2'>
                              <h6 className='text-muted-foreground text-xs font-medium'>
                                权限列表
                              </h6>
                              <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                                {role.permissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className='flex items-center gap-2 text-sm'
                                  >
                                    <IconShield className='h-3 w-3' />
                                    <span>{permission.displayName}</span>
                                    <PermissionCategoryBadge
                                      category={permission.category}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-muted-foreground py-8 text-center'>
                        <IconShield className='mx-auto mb-2 h-8 w-8 opacity-50' />
                        <p>该用户暂未分配任何角色</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 审计日志标签页 */}
        <TabsContent value='audit' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <IconHistory className='h-5 w-5' />
                审计日志
              </CardTitle>
              <CardDescription>查看与该用户相关的所有操作记录</CardDescription>
            </CardHeader>
            <CardContent>
              {auditLoading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='rounded-lg border p-4'>
                      <div className='space-y-2'>
                        <div className='bg-muted h-4 w-32 animate-pulse rounded' />
                        <div className='bg-muted h-3 w-full animate-pulse rounded' />
                        <div className='bg-muted h-3 w-3/4 animate-pulse rounded' />
                      </div>
                    </div>
                  ))}
                </div>
              ) : auditError ? (
                <Alert>
                  <IconAlertTriangle className='h-4 w-4' />
                  <AlertDescription>
                    加载审计日志失败: {auditError}
                  </AlertDescription>
                </Alert>
              ) : auditLogs.length > 0 ? (
                <div className='space-y-4'>
                  {auditLogs.map((log) => {
                    const actionInfo = formatAuditAction(log.action);

                    return (
                      <div key={log.id} className='rounded-lg border p-4'>
                        <div className='mb-2 flex items-start justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className={`font-medium ${actionInfo.color}`}>
                              {actionInfo.label}
                            </span>
                            <Badge variant='outline' className='text-xs'>
                              {log.resourceType}
                            </Badge>
                          </div>
                          <span className='text-muted-foreground text-xs'>
                            {format(
                              new Date(log.createdAt),
                              'yyyy-MM-dd HH:mm:ss',
                              { locale: zhCN }
                            )}
                          </span>
                        </div>

                        <div className='space-y-2'>
                          {log.user && (
                            <div className='text-sm'>
                              <span className='text-muted-foreground'>
                                操作者:
                              </span>{' '}
                              {log.user.fullName || log.user.username} (
                              {log.user.email})
                            </div>
                          )}

                          {log.ipAddress && (
                            <div className='text-muted-foreground text-xs'>
                              IP: {log.ipAddress}
                            </div>
                          )}

                          {log.changes &&
                            Object.keys(log.changes).length > 0 && (
                              <div className='mt-3'>
                                <details className='text-sm'>
                                  <summary className='text-muted-foreground hover:text-foreground cursor-pointer'>
                                    查看详细信息
                                  </summary>
                                  <pre className='bg-muted mt-2 overflow-x-auto rounded p-3 text-xs'>
                                    {JSON.stringify(log.changes, null, 2)}
                                  </pre>
                                </details>
                              </div>
                            )}
                        </div>
                      </div>
                    );
                  })}

                  {auditPagination && auditPagination.totalPages > 1 && (
                    <div className='flex items-center justify-center pt-4'>
                      <div className='text-muted-foreground text-sm'>
                        显示第 {auditPagination.page} 页，共{' '}
                        {auditPagination.totalPages} 页
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-muted-foreground py-8 text-center'>
                  <IconHistory className='mx-auto mb-2 h-8 w-8 opacity-50' />
                  <p>暂无审计日志</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 操作管理标签页 */}
        <TabsContent value='actions' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>用户操作</CardTitle>
              <CardDescription>管理用户状态和执行管理操作</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* 状态管理 */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>状态管理</h4>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm'>当前状态:</span>
                    <UserStatusBadge isActive={userDetails.isActive} />
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={
                          userDetails.isActive ? 'destructive' : 'default'
                        }
                        size='sm'
                      >
                        {userDetails.isActive ? (
                          <>
                            <IconUserX className='mr-2 h-4 w-4' />
                            停用用户
                          </>
                        ) : (
                          <>
                            <IconUserCheck className='mr-2 h-4 w-4' />
                            激活用户
                          </>
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          确认{userDetails.isActive ? '停用' : '激活'}用户
                        </AlertDialogTitle>
                        <AlertDialogDescription className='space-y-4'>
                          <p>
                            {userDetails.isActive
                              ? `停用用户 "${userDetails.username}" 后，该用户将无法登录系统，所有现有会话将被终止。`
                              : `激活用户 "${userDetails.username}" 后，该用户将能够重新登录系统。`}
                          </p>

                          <div className='space-y-2'>
                            <label
                              htmlFor='reason'
                              className='text-sm font-medium'
                            >
                              操作原因
                            </label>
                            <Textarea
                              id='reason'
                              placeholder='请说明操作原因...'
                              value={statusChangeReason}
                              onChange={(e) =>
                                setStatusChangeReason(e.target.value)
                              }
                            />
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleToggleStatus(
                              userDetails.isActive ? 'deactivate' : 'reactivate'
                            )
                          }
                        >
                          确认{userDetails.isActive ? '停用' : '激活'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <Separator />

              {/* 密码管理 */}
              <div className='space-y-4'>
                <h4 className='text-sm font-medium'>密码管理</h4>
                <div className='space-y-2'>
                  <p className='text-muted-foreground text-sm'>
                    重置用户密码将生成一个临时密码，用户首次登录时需要修改密码。
                  </p>
                  <Button variant='outline' size='sm' disabled>
                    <IconKey className='mr-2 h-4 w-4' />
                    重置密码
                    <Badge variant='secondary' className='ml-2'>
                      即将推出
                    </Badge>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
