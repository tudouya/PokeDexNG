import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { CategoryDetail } from '@/features/vulnerability-categories/components/category-detail';
import { vulnerabilityCategoryService } from '@/features/vulnerability-categories';

interface CategoryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const { id } = await params;
  return {
    title: `Dashboard: 分类详情 #${id}`
  };
}

export default async function CategoryDetailPage({
  params
}: CategoryDetailPageProps) {
  const { id } = await params;
  const categoryId = parseInt(id, 10);

  if (isNaN(categoryId)) {
    notFound();
  }

  // 获取分类数据（包含子分类）
  const category =
    await vulnerabilityCategoryService.findWithChildren(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <PageContainer scrollable>
      <div className='flex-1 space-y-4'>
        <Breadcrumbs />
        <CategoryDetail category={category} />
      </div>
    </PageContainer>
  );
}
