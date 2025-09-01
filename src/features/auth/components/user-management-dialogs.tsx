'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ================================
// 类型定义和验证schemas
// ================================

/**
 * 用户创建对话框属性
 */
export interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSuccess: (userData: {
    user: {
      id: number;
      email: string;
      username: string;
      fullName: string | null;
      isActive: boolean;
      roles: Array<{ id: number; name: string; displayName: string }>;
    };
    temporaryPassword: string;
  }) => void;
  availableRoles: Array<{ id: number; name: string; displayName: string }>;
}

/**
 * 密码重置对话框属性
 */
export interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; username: string; email: string } | null;
  onResetSuccess: (resetData: {
    userId: number;
    temporaryPassword: string;
    expiresAt: Date;
  }) => void;
}

/**
 * 用户停用对话框属性
 */
export interface DeactivateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: number;
    username: string;
    email: string;
    isActive: boolean;
  } | null;
  onStatusChanged: (statusData: {
    userId: number;
    isActive: boolean;
    statusChangeReason: string;
    changedAt: Date;
  }) => void;
}

// Zod验证schemas
const createUserSchema = z.object({
  email: z.string().email('邮箱格式不正确').min(1, '邮箱不能为空'),
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名不能超过20个字符')
    .regex(/^[a-zA-Z0-9_-]+$/, '用户名只能包含字母、数字、下划线和横线'),
  fullName: z
    .string()
    .max(50, '全名不能超过50个字符')
    .optional()
    .or(z.literal('')),
  roleIds: z
    .array(z.number())
    .min(1, '至少选择一个角色')
    .max(5, '最多选择5个角色')
});

const resetPasswordSchema = z.object({
  confirmAction: z.boolean().refine((val) => val === true, {
    message: '请确认要重置此用户的密码'
  })
});

const deactivateUserSchema = z.object({
  reason: z
    .string()
    .min(5, '停用原因至少5个字符')
    .max(200, '停用原因不能超过200个字符'),
  confirmAction: z.boolean().refine((val) => val === true, {
    message: '请确认要停用此用户'
  })
});

const reactivateUserSchema = z.object({
  reason: z
    .string()
    .min(5, '激活原因至少5个字符')
    .max(200, '激活原因不能超过200个字符'),
  confirmAction: z.boolean().refine((val) => val === true, {
    message: '请确认要激活此用户'
  })
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
type DeactivateUserFormData = z.infer<typeof deactivateUserSchema>;
type ReactivateUserFormData = z.infer<typeof reactivateUserSchema>;

// ================================
// 用户创建对话框
// ================================

/**
 * 用户创建对话框组件
 * 提供创建新用户并分配角色的界面
 */
export function CreateUserDialog({
  open,
  onOpenChange,
  onCreateSuccess,
  availableRoles
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      username: '',
      fullName: '',
      roleIds: []
    }
  });

  const handleSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('用户创建成功', {
          description: `已为用户 ${data.username} 生成临时密码`
        });
        onCreateSuccess(result.data);
        form.reset();
        onOpenChange(false);
      } else if (result.status === 'fail') {
        // 处理验证错误
        if (result.data.errors) {
          Object.entries(result.data.errors).forEach(([field, messages]) => {
            form.setError(field as keyof CreateUserFormData, {
              message: Array.isArray(messages) ? messages[0] : messages
            });
          });
        } else {
          toast.error('创建用户失败', {
            description: result.data.message
          });
        }
      } else {
        toast.error('创建用户失败', {
          description: result.message || '服务器内部错误'
        });
      }
    } catch (error) {
      console.error('Create user failed:', error);
      toast.error('创建用户失败', {
        description: '网络错误，请稍后重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>创建新用户</DialogTitle>
          <DialogDescription>
            创建新用户账户并分配初始角色。系统将生成安全的临时密码。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='user@example.com'
                      type='email'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    用户的邮箱地址，用于登录和通知
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>用户名</FormLabel>
                  <FormControl>
                    <Input placeholder='username' {...field} />
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
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>全名（可选）</FormLabel>
                  <FormControl>
                    <Input placeholder='张三' {...field} />
                  </FormControl>
                  <FormDescription>用户的真实姓名，用于显示</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='roleIds'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>分配角色</FormLabel>
                  <FormControl>
                    <Select
                      value={
                        field.value.length > 0 ? field.value[0].toString() : ''
                      }
                      onValueChange={(value) => {
                        const roleId = parseInt(value);
                        field.onChange([roleId]);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='选择用户角色' />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    为用户分配初始角色，后续可以修改
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? '创建中...' : '创建用户'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// 密码重置对话框
// ================================

/**
 * 密码重置对话框组件
 * 提供重置用户密码的界面
 */
export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onResetSuccess
}: ResetPasswordDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmAction: false
    }
  });

  const handleSubmit = async (data: ResetPasswordFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/auth/users/${user.id}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const result = await response.json();

      if (result.status === 'success') {
        toast.success('密码重置成功', {
          description: `已为用户 ${user.username} 生成新的临时密码`
        });
        onResetSuccess(result.data);
        form.reset();
        onOpenChange(false);
      } else if (result.status === 'fail') {
        toast.error('密码重置失败', {
          description: result.data.message
        });
      } else {
        toast.error('密码重置失败', {
          description: result.message || '服务器内部错误'
        });
      }
    } catch (error) {
      console.error('Reset password failed:', error);
      toast.error('密码重置失败', {
        description: '网络错误，请稍后重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>重置用户密码</DialogTitle>
          <DialogDescription>
            为用户 <span className='font-semibold'>{user?.username}</span>{' '}
            重置密码。 系统将生成安全的临时密码，用户需要在首次登录时更改。
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            <div className='rounded-lg border border-orange-200 bg-orange-50 p-4'>
              <div className='flex'>
                <div className='flex-shrink-0'>
                  <svg
                    className='h-5 w-5 text-orange-400'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-orange-800'>
                    重要提示
                  </h3>
                  <div className='mt-2 text-sm text-orange-700'>
                    <ul className='list-disc space-y-1 pl-5'>
                      <li>用户的当前密码将被覆盖</li>
                      <li>临时密码将在24小时后过期</li>
                      <li>用户必须在首次登录时更改密码</li>
                      <li>此操作将被记录在审计日志中</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name='confirmAction'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={field.value}
                      onChange={field.onChange}
                      className='mt-1'
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>我确认要重置此用户的密码</FormLabel>
                    <FormDescription>
                      确认后将立即生成新的临时密码
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type='submit'
                variant='destructive'
                disabled={isSubmitting || !form.watch('confirmAction')}
              >
                {isSubmitting ? '重置中...' : '重置密码'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// 用户停用/激活对话框
// ================================

/**
 * 用户状态管理对话框组件
 * 提供停用或激活用户的界面
 */
export function DeactivateUserDialog({
  open,
  onOpenChange,
  user,
  onStatusChanged
}: DeactivateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDeactivating = user?.isActive === true;

  const schema = isDeactivating ? deactivateUserSchema : reactivateUserSchema;
  const form = useForm<DeactivateUserFormData | ReactivateUserFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: '',
      confirmAction: false
    }
  });

  const handleSubmit = async (
    data: DeactivateUserFormData | ReactivateUserFormData
  ) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const endpoint = isDeactivating
        ? `/api/auth/users/${user.id}/deactivate`
        : `/api/auth/users/${user.id}/reactivate`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: data.reason
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        const action = isDeactivating ? '停用' : '激活';
        toast.success(`用户${action}成功`, {
          description: `已成功${action}用户 ${user.username}`
        });
        onStatusChanged(result.data);
        form.reset();
        onOpenChange(false);
      } else if (result.status === 'fail') {
        const action = isDeactivating ? '停用' : '激活';
        toast.error(`用户${action}失败`, {
          description: result.data.message
        });
      } else {
        const action = isDeactivating ? '停用' : '激活';
        toast.error(`用户${action}失败`, {
          description: result.message || '服务器内部错误'
        });
      }
    } catch (error) {
      console.error('User status change failed:', error);
      const action = isDeactivating ? '停用' : '激活';
      toast.error(`用户${action}失败`, {
        description: '网络错误，请稍后重试'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
    }
    onOpenChange(open);
  };

  const actionText = isDeactivating ? '停用' : '激活';
  const actionColor = isDeactivating ? 'destructive' : 'default';

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{actionText}用户</DialogTitle>
          <DialogDescription>
            {actionText}用户{' '}
            <span className='font-semibold'>{user?.username}</span>。
            {isDeactivating
              ? '停用后用户将无法登录系统，但历史数据将被保留。'
              : '激活后用户可以重新登录系统。'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className='space-y-4'
          >
            {isDeactivating && (
              <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-red-800'>
                      停用影响
                    </h3>
                    <div className='mt-2 text-sm text-red-700'>
                      <ul className='list-disc space-y-1 pl-5'>
                        <li>用户将立即无法登录</li>
                        <li>所有现有会话将失效</li>
                        <li>历史数据和审计日志将被保留</li>
                        <li>此操作可以撤销</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{actionText}原因</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`请输入${actionText}原因...`}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    请详细说明{actionText}此用户的原因，将记录在审计日志中
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmAction'
              render={({ field }) => (
                <FormItem className='flex flex-row items-start space-y-0 space-x-3'>
                  <FormControl>
                    <input
                      type='checkbox'
                      checked={field.value}
                      onChange={field.onChange}
                      className='mt-1'
                    />
                  </FormControl>
                  <div className='space-y-1 leading-none'>
                    <FormLabel>我确认要{actionText}此用户</FormLabel>
                    <FormDescription>
                      确认后将立即执行{actionText}操作
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type='submit'
                variant={actionColor}
                disabled={isSubmitting || !form.watch('confirmAction')}
              >
                {isSubmitting ? `${actionText}中...` : actionText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
