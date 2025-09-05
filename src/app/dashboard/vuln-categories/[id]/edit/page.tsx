import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategoryForm } from '@/features/vulnerability-categories';
import { vulnerabilityCategoryService } from '@/features/vulnerability-categories';

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: EditCategoryPageProps) {
  const { id } = await params;
  return {
    title: `Dashboard: 编辑分类 #${id}`
  };
}

export default async function EditCategoryPage({
  params
}: EditCategoryPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  // 获取分类数据
  const category = await vulnerabilityCategoryService.findOne(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <CategoryForm mode='edit' initialData={category} />
      </div>
    </PageContainer>
  );
}
