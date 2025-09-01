import { Metadata } from 'next';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'PokeDex | 登录',
  description: '渗透测试漏洞管理平台登录页面'
};

/**
 * 登录页面
 * 渗透测试漏洞管理平台的用户登录界面
 */
export default function LoginPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* 左侧品牌展示区 */}
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          PokeDex
        </div>
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;将手工报告编写时间从2小时降到10分钟，实现漏洞全生命周期管理。&rdquo;
            </p>
            <footer className='text-sm'>— 渗透测试团队</footer>
          </blockquote>
        </div>
      </div>

      {/* 右侧登录表单区 */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>欢迎回来</h1>
            <p className='text-muted-foreground text-sm'>
              请输入您的凭据以登录账户
            </p>
          </div>

          <LoginForm />

          <div className='text-muted-foreground text-center text-sm'>
            还没有账户？{' '}
            <a
              href='/auth/register'
              className='text-primary underline-offset-4 hover:underline'
            >
              立即注册
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
