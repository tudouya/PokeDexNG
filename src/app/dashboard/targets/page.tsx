import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import TargetListingPage from '@/features/targets/components/target-listing';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: 目标管理'
};

export default function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='flex flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='目标管理'
            description='管理渗透测试目标，包括Web应用、API接口、服务器等各类测试对象'
          />
          <Link
            href='/dashboard/targets/new'
            className={cn(buttonVariants(), 'text-xs md:text-sm')}
          >
            <IconPlus className='mr-2 h-4 w-4' /> 新增目标
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={7} rowCount={10} filterCount={3} />
          }
        >
          <TargetListingPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
