/**
 * 主页
 * 认证和重定向逻辑由中间件统一处理
 * - 未登录用户 -> 重定向到 /auth/login
 * - 已登录用户 -> 重定向到 /dashboard
 */
export default function Page() {
  // 这个页面实际上不会被渲染，因为中间件会处理所有的重定向逻辑
  // 如果代码执行到这里，说明中间件出现了问题
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='mb-4 text-2xl font-bold'>PokeDex</h1>
        <p className='text-muted-foreground'>正在重定向...</p>
      </div>
    </div>
  );
}
