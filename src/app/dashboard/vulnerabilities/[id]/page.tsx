import { Suspense } from 'react';
import PageContainer from '@/components/layout/page-container';
import { VulnerabilityDetail } from '@/features/vulnerabilities/components/vulnerability-detail';
import { VulnerabilityDetailSkeleton } from '@/features/vulnerabilities/components/vulnerability-detail/skeleton';

export const metadata = {
  title: 'Dashboard: 漏洞详情'
};

interface VulnerabilityDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function VulnerabilityDetailPage({
  params
}: VulnerabilityDetailPageProps) {
  const { id } = await params;
  const vulnerabilityId = parseInt(id);

  if (isNaN(vulnerabilityId)) {
    throw new Error('无效的漏洞ID');
  }

  return (
    <PageContainer scrollable={true}>
      <div className='space-y-4'>
        <Suspense fallback={<VulnerabilityDetailSkeleton />}>
          <VulnerabilityDetail id={vulnerabilityId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
