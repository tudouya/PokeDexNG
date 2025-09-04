import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TargetDetail } from '@/features/targets/components/target-detail';
import { targetService } from '@/features/targets';

interface TargetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: TargetDetailPageProps) {
  const { id } = await params;
  return {
    title: `Dashboard: 目标详情 #${id}`
  };
}

export default async function TargetDetailPage({
  params
}: TargetDetailPageProps) {
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
        <TargetDetail target={target} />
      </div>
    </PageContainer>
  );
}
