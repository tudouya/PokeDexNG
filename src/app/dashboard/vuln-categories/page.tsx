import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import CategoryManagementView from '@/features/vulnerability-categories/components/category-management-view';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: 漏洞分类管理'
};

export default function Page() {
  return (
    <PageContainer scrollable={true}>
      <div className='mx-auto flex w-full max-w-6xl flex-col space-y-6'>
        <div className='flex items-start justify-between'>
          <Heading
            title='漏洞分类管理'
            description='管理漏洞分类体系，支持多层级结构、CWE/OWASP标准映射和知识库模板'
          />
        </div>
        <Separator />
        <Suspense
          fallback={
            <div className='flex h-64 items-center justify-center'>
              <div className='text-muted-foreground text-sm'>加载中...</div>
            </div>
          }
        >
          <CategoryManagementView />
        </Suspense>
      </div>
    </PageContainer>
  );
}
