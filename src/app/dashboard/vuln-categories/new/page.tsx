import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategoryForm } from '@/features/vulnerability-categories';

export const metadata = {
  title: 'Dashboard: 新增漏洞分类'
};

interface NewCategoryPageProps {
  searchParams: Promise<{
    parentId?: string;
  }>;
}

export default async function NewCategoryPage({
  searchParams
}: NewCategoryPageProps) {
  const { parentId } = await searchParams;

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <CategoryForm
          mode='create'
          parentId={parentId ? parseInt(parentId, 10) : undefined}
        />
      </div>
    </PageContainer>
  );
}
