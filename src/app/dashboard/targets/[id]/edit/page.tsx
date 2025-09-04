import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TargetForm } from '@/features/targets/components/target-form';
import { targetService } from '@/features/targets';

interface EditTargetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditTargetPageProps) {
  const { id } = await params;
  return {
    title: `Dashboard: 编辑目标 #${id}`
  };
}

export default async function EditTargetPage({ params }: EditTargetPageProps) {
  const { id } = await params;
  const targetId = parseInt(id, 10);

  if (isNaN(targetId)) {
    notFound();
  }

  // 获取目标数据
  const target = await targetService.findOne(targetId);

  if (!target) {
    notFound();
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <TargetForm mode='edit' initialData={target} />
      </div>
    </PageContainer>
  );
}
