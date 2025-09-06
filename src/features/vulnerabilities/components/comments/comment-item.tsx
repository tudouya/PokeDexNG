'use client';

import { useState, useCallback, useRef } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  MessageSquare,
  Edit,
  Trash2,
  Reply,
  Shield,
  Eye,
  ChevronDown,
  ChevronUp,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RichContentViewer } from '@/components/ui/rich-content-viewer';
import {
  RichTextEditor,
  type RichTextEditorRef
} from '@/components/ui/rich-text-editor';
import { CommentDTO } from '../../types';

interface CommentItemProps {
  comment: CommentDTO;
  currentUserId?: number;
  depth?: number;
  maxDepth?: number;
  onReply?: (parentId: number, content: string) => Promise<void>;
  onEdit?: (commentId: number, content: string) => Promise<void>;
  onDelete?: (commentId: number) => Promise<void>;
  isSubmitting?: boolean;
}

export function CommentItem({
  comment,
  currentUserId,
  depth = 0,
  maxDepth = 3,
  onReply,
  onEdit,
  onDelete,
  isSubmitting = false
}: CommentItemProps) {
  // 状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  // 富文本编辑器引用
  const editEditorRef = useRef<RichTextEditorRef>(null);
  const replyEditorRef = useRef<RichTextEditorRef>(null);

  // 检查权限
  const canEdit = currentUserId === comment.author.id;
  const canDelete = currentUserId === comment.author.id;
  const canReply = depth < maxDepth && onReply;

  // 处理编辑
  const handleEdit = useCallback(async () => {
    const content = editEditorRef.current?.getContent() || '';
    if (!content.trim() || content === '<p></p>' || !onEdit) return;

    try {
      await onEdit(comment.id, content);
      setIsEditing(false);
    } catch (error) {
      console.error('编辑评论失败:', error);
    }
  }, [onEdit, comment.id]);

  // 处理回复
  const handleReply = useCallback(async () => {
    const content = replyEditorRef.current?.getContent() || '';
    if (!content.trim() || content === '<p></p>' || !onReply) return;

    try {
      await onReply(comment.id, content);
      replyEditorRef.current?.clear();
      setIsReplying(false);
      setShowReplies(true); // 显示回复列表
    } catch (error) {
      console.error('回复评论失败:', error);
    }
  }, [onReply, comment.id]);

  // 取消编辑
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    editEditorRef.current?.setContent(comment.content);
  }, [comment.content]);

  // 取消回复
  const cancelReply = useCallback(() => {
    setIsReplying(false);
    replyEditorRef.current?.clear();
  }, []);

  // 处理删除
  const handleDelete = useCallback(async () => {
    if (!onDelete) return;

    if (window.confirm('确认删除这条评论吗？此操作不可撤销。')) {
      try {
        await onDelete(comment.id);
      } catch (error) {
        console.error('删除评论失败:', error);
      }
    }
  }, [onDelete, comment.id]);

  return (
    <div className={`${depth > 0 ? 'border-border ml-8 border-l pl-4' : ''}`}>
      <div className='space-y-3'>
        {/* 评论头部 */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex min-w-0 flex-1 items-start gap-3'>
            {/* 用户头像 */}
            <Avatar className='h-8 w-8 flex-shrink-0'>
              <AvatarFallback>
                {comment.author.fullName?.[0] ||
                  comment.author.username[0] ||
                  comment.author.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* 评论信息 */}
            <div className='min-w-0 flex-1 space-y-1'>
              {/* 作者和时间 */}
              <div className='flex flex-wrap items-center gap-2'>
                <span className='text-sm font-medium'>
                  {comment.author.fullName || comment.author.username}
                </span>

                {comment.isInternal && (
                  <Badge variant='secondary' className='gap-1 text-xs'>
                    <Shield className='h-3 w-3' />
                    内部
                  </Badge>
                )}

                <span className='text-muted-foreground text-xs'>
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                    locale: zhCN
                  })}
                </span>

                {comment.updatedAt !== comment.createdAt && (
                  <span className='text-muted-foreground text-xs'>
                    (已编辑)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 操作菜单 */}
          {(canEdit || canDelete || canReply) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                {canReply && (
                  <DropdownMenuItem
                    onClick={() => setIsReplying(true)}
                    className='gap-2'
                  >
                    <Reply className='h-4 w-4' />
                    回复
                  </DropdownMenuItem>
                )}

                {canEdit && (
                  <DropdownMenuItem
                    onClick={() => setIsEditing(true)}
                    className='gap-2'
                  >
                    <Edit className='h-4 w-4' />
                    编辑
                  </DropdownMenuItem>
                )}

                {(canEdit || canDelete) && canReply && (
                  <DropdownMenuSeparator />
                )}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className='text-destructive focus:text-destructive gap-2'
                    disabled={isSubmitting}
                  >
                    <Trash2 className='h-4 w-4' />
                    删除
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* 评论内容 */}
        <div className='ml-11'>
          {isEditing ? (
            <div className='space-y-3'>
              <RichTextEditor
                ref={editEditorRef}
                content={comment.content}
                placeholder='编辑评论...'
                minHeight='100px'
                maxHeight='300px'
                editable={!isSubmitting}
                className='border-0'
              />
              <div className='flex items-center gap-2'>
                <Button size='sm' onClick={handleEdit} disabled={isSubmitting}>
                  保存
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className='prose prose-sm max-w-none'>
              <RichContentViewer content={comment.content} />
            </div>
          )}
        </div>

        {/* 回复输入框 */}
        {isReplying && (
          <div className='ml-11 space-y-3'>
            <RichTextEditor
              ref={replyEditorRef}
              placeholder={`回复 @${comment.author.fullName || comment.author.username}...`}
              minHeight='80px'
              maxHeight='200px'
              editable={!isSubmitting}
              className='border-0'
            />
            <div className='flex items-center gap-2'>
              <Button size='sm' onClick={handleReply} disabled={isSubmitting}>
                回复
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={cancelReply}
                disabled={isSubmitting}
              >
                取消
              </Button>
            </div>
          </div>
        )}

        {/* 回复列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className='ml-11'>
            {/* 折叠/展开按钮 */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowReplies(!showReplies)}
              className='text-muted-foreground hover:text-foreground mb-2 h-6 gap-1 px-2 text-xs'
            >
              {showReplies ? (
                <ChevronUp className='h-3 w-3' />
              ) : (
                <ChevronDown className='h-3 w-3' />
              )}
              {comment.replies.length} 条回复
            </Button>

            {/* 回复内容 */}
            {showReplies && (
              <div className='space-y-4'>
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={currentUserId}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    onReply={onReply}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 分隔线（只在顶级评论间显示） */}
      {depth === 0 && <div className='border-border mt-6 border-t' />}
    </div>
  );
}
