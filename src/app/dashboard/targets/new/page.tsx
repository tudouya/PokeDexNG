import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TargetForm } from '@/features/targets/components/target-form';

export const metadata = {
  title: 'Dashboard: 新增目标'
};

export default function NewTargetPage() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <TargetForm mode='create' />
      </div>
    </PageContainer>
  );
}
