'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { Target } from '../../types';
import { useDeleteTarget, useRestoreTarget } from '../../hooks/useTargets';
import { Edit, MoreHorizontal, Trash, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Target;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Use separate hooks for delete and restore operations
  const { deleteTarget, deleting: isDeleting } = useDeleteTarget(data.id);
  const { restoreTarget, restoring: isRestoring } = useRestoreTarget(data.id);

  const onConfirm = async () => {
    try {
      setLoading(true);

      if (data.isDeleted) {
        // 恢复目标
        const success = await restoreTarget();
        if (success) {
          toast.success('目标恢复成功');
          // 使用window.location.reload()确保数据刷新
          window.location.reload();
        } else {
          toast.error('目标恢复失败');
        }
      } else {
        // 删除目标
        const success = await deleteTarget();
        if (success) {
          toast.success('目标删除成功');
          // 使用window.location.reload()确保数据刷新
          window.location.reload();
        } else {
          toast.error('目标删除失败');
        }
      }
    } catch (error) {
      toast.error('操作失败，请重试');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>打开菜单</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>操作</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => router.push(`/dashboard/targets/${data.id}`)}
          >
            <Eye className='mr-2 h-4 w-4' /> 查看详情
          </DropdownMenuItem>

          {!data.isDeleted && (
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/targets/${data.id}/edit`)}
            >
              <Edit className='mr-2 h-4 w-4' /> 编辑
            </DropdownMenuItem>
          )}

          <DropdownMenuItem onClick={() => setOpen(true)}>
            {data.isDeleted ? (
              <>
                <RotateCcw className='mr-2 h-4 w-4' /> 恢复
              </>
            ) : (
              <>
                <Trash className='mr-2 h-4 w-4' /> 删除
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
