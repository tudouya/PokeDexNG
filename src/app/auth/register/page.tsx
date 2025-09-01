import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PokeDex | 注册',
  description: '渗透测试漏洞管理平台注册页面'
};

/**
 * 注册页面
 * 渗透测试漏洞管理平台的用户注册界面
 */
export default function RegisterPage() {
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
              &ldquo;专业的渗透测试团队需要专业的漏洞管理平台。&rdquo;
            </p>
            <footer className='text-sm'>— 安全专家</footer>
          </blockquote>
        </div>
      </div>

      {/* 右侧注册表单区 */}
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <h1 className='text-2xl font-semibold tracking-tight'>创建账户</h1>
            <p className='text-muted-foreground text-sm'>
              注册功能正在开发中，请联系管理员获取账户
            </p>
          </div>

          <div className='border-muted-foreground/25 w-full rounded-lg border border-dashed p-8 text-center'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='bg-muted rounded-full p-3'>
                <svg
                  className='text-muted-foreground h-6 w-6'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
              </div>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>用户注册</p>
                <p className='text-muted-foreground text-sm'>
                  目前采用邀请制注册，请联系系统管理员申请账户
                </p>
              </div>
            </div>
          </div>

          <div className='text-muted-foreground text-center text-sm'>
            已有账户？{' '}
            <Link
              href='/auth/login'
              className='text-primary underline-offset-4 hover:underline'
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
