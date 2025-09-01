'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  loginCredentialsSchema,
  type LoginCredentials
} from '@/lib/validations/auth';

/**
 * 登录表单组件
 *
 * 特性：
 * - React Hook Form + Zod 验证
 * - 新的简洁认证系统
 * - 密码可见性切换
 * - 加载状态和错误处理
 * - 支持用户名或邮箱登录
 * - 自动重定向到回调URL
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginCredentialsSchema),
    defaultValues: {
      identifier: '',
      password: ''
    }
  });

  /**
   * 处理登录表单提交
   */
  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);

    try {
      const result = await login(data.identifier, data.password);

      if (result.success) {
        toast.success('登录成功');
        // 重定向到回调URL
        router.push(callbackUrl);
      } else {
        // 登录失败，显示错误信息
        toast.error(result.error || '登录失败');

        // 设置表单错误
        form.setError('password', {
          type: 'manual',
          message: result.error || '用户名或密码错误'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('系统错误，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 切换密码可见性
   */
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className='mx-auto w-full max-w-md'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          {/* 用户名/邮箱字段 */}
          <FormField
            control={form.control}
            name='identifier'
            render={({ field }) => (
              <FormItem>
                <FormLabel>用户名或邮箱</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type='text'
                    placeholder='请输入用户名或邮箱地址'
                    disabled={isLoading}
                    autoComplete='username'
                    className='w-full'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 密码字段 */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>密码</FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder='请输入密码'
                      disabled={isLoading}
                      autoComplete='current-password'
                      className='w-full pr-12'
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute inset-y-0 right-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className='text-muted-foreground h-4 w-4' />
                      ) : (
                        <Eye className='text-muted-foreground h-4 w-4' />
                      )}
                      <span className='sr-only'>
                        {showPassword ? '隐藏密码' : '显示密码'}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 登录按钮 */}
          <Button
            type='submit'
            className='w-full'
            disabled={isLoading}
            size='lg'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
