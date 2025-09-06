import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { VulnerabilityListing } from '@/features/vulnerabilities/components/vulnerability-listing';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Dashboard: 漏洞管理'
};

// 加载骨架屏组件
function VulnerabilityListingSkeleton() {
  return (
    <div className='space-y-6'>
      {/* 搜索筛选区域骨架屏 */}
      <div className='space-y-4 rounded-lg border p-6'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-32' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
          <div className='md:col-span-2'>
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <Skeleton className='h-10 w-full' />
        </div>
      </div>

      {/* 漏洞列表骨架屏 */}
      <div className='space-y-4'>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className='rounded-lg border p-6'>
            <div className='space-y-4'>
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-6 w-3/4' />
                  <Skeleton className='h-4 w-full' />
                </div>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='h-6 w-16' />
                  <Skeleton className='h-6 w-16' />
                </div>
              </div>
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-12' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VulnerabilitiesPage() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='漏洞管理'
            description='记录和管理渗透测试发现的安全漏洞，跟踪修复进度和风险评估'
          />
          <Link
            href='/dashboard/vulnerabilities/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> 录入漏洞
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<VulnerabilityListingSkeleton />}>
          <VulnerabilityListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}
