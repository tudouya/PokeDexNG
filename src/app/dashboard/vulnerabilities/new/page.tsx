import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { VulnerabilityForm } from '@/features/vulnerabilities/components/vulnerability-form';

export const metadata = {
  title: 'Dashboard: 录入漏洞'
};

export default function NewVulnerabilityPage() {
  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <VulnerabilityForm mode='create' />
      </div>
    </PageContainer>
  );
}
