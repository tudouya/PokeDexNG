'use client';

import { useState, useMemo, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  RichTextEditor,
  type RichTextEditorRef
} from '@/components/ui/rich-text-editor';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Send,
  Loader2,
  RefreshCw,
  Shield,
  MessageCircle,
  Users,
  Clock,
  AlertCircle,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CommentItem } from './comment-item';
import { useVulnerabilityComments } from '../../hooks/useVulnerabilityComments';

interface CommentSectionProps {
  vulnerabilityId: number;
  className?: string;
}

export function CommentSection({
  vulnerabilityId,
  className
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [isInternal, setIsInternal] = useState(false);
  const editorRef = useRef<RichTextEditorRef>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showInternalOnly, setShowInternalOnly] = useState(false);

  // 使用评论Hook
  const {
    comments,
    stats,
    loading,
    error,
    refreshComments,
    addComment,
    updateComment,
    deleteComment,
    isSubmitting,
    clearError
  } = useVulnerabilityComments({
    vulnerabilityId,
    includeReplies: true,
    sortOrder,
    autoRefresh: false, // 禁用自动刷新，减少网络请求
    refreshInterval: 60000 // 如果启用，改为60秒
  });

  // 过滤评论
  const filteredComments = useMemo(() => {
    if (!showInternalOnly) return comments;
    return comments.filter((comment) => comment.isInternal);
  }, [comments, showInternalOnly]);

  // 处理发送新评论
  const handleSubmitComment = async () => {
    const content = editorRef.current?.getContent() || '';
    if (!content.trim() || content === '<p></p>') return;

    const success = await addComment({
      content: content,
      isInternal
    });

    if (success) {
      editorRef.current?.clear();
      setIsInternal(false);
    }
  };

  // 处理回复
  const handleReply = async (parentId: number, content: string) => {
    await addComment({
      parentId,
      content,
      isInternal
    });
  };

  // 处理编辑
  const handleEdit = async (commentId: number, content: string) => {
    await updateComment(commentId, { content });
  };

  // 处理删除
  const handleDelete = async (commentId: number) => {
    await deleteComment(commentId);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='text-muted-foreground h-5 w-5' />
            <CardTitle>讨论与评论</CardTitle>
            {stats && (
              <Badge variant='secondary' className='ml-2'>
                {stats.total} 条评论
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-2'>
            {/* 筛选选项 */}
            <Select
              value={showInternalOnly ? 'internal' : 'all'}
              onValueChange={(value) =>
                setShowInternalOnly(value === 'internal')
              }
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>全部评论</SelectItem>
                <SelectItem value='internal'>内部评论</SelectItem>
              </SelectContent>
            </Select>

            {/* 排序选项 */}
            <Select
              value={sortOrder}
              onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
            >
              <SelectTrigger className='w-32'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='asc'>时间升序</SelectItem>
                <SelectItem value='desc'>时间降序</SelectItem>
              </SelectContent>
            </Select>

            {/* 刷新按钮 */}
            <Button
              variant='outline'
              size='sm'
              onClick={refreshComments}
              disabled={loading}
              className='gap-1'
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>

        <CardDescription>
          团队成员可以在这里讨论漏洞相关问题、分享见解和协作解决方案
        </CardDescription>

        {/* 统计信息 */}
        {stats && (
          <div className='text-muted-foreground flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <MessageCircle className='h-4 w-4' />
              <span>{stats.total} 条评论</span>
            </div>
            <div className='flex items-center gap-1'>
              <Users className='h-4 w-4' />
              <span>{stats.participants} 位参与者</span>
            </div>
            {stats.lastCommentAt && (
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>
                  最新回复 {new Date(stats.lastCommentAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* 错误提示 */}
        {error && (
          <Alert variant='destructive'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='flex items-center justify-between'>
              {error}
              <Button variant='outline' size='sm' onClick={clearError}>
                关闭
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* 新评论输入框 */}
        {isAuthenticated && (
          <div className='space-y-4'>
            <div className='space-y-3'>
              <RichTextEditor
                ref={editorRef}
                placeholder='分享您的想法、见解或问题...'
                minHeight='120px'
                maxHeight='300px'
                editable={!isSubmitting}
                className='border-0'
              />

              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='internal-comment'
                      checked={isInternal}
                      onCheckedChange={setIsInternal}
                      disabled={isSubmitting}
                    />
                    <Label
                      htmlFor='internal-comment'
                      className='flex items-center gap-1 text-sm'
                    >
                      <Shield className='h-3 w-3' />
                      内部评论
                    </Label>
                  </div>

                  {isInternal && (
                    <span className='text-muted-foreground text-xs'>
                      只有团队成员可以看到此评论
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleSubmitComment}
                  disabled={isSubmitting}
                  className='gap-2'
                >
                  {isSubmitting ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <Send className='h-4 w-4' />
                  )}
                  发送评论
                </Button>
              </div>
            </div>

            <Separator />
          </div>
        )}

        {/* 评论列表 */}
        <div className='space-y-6'>
          {loading && comments.length === 0 ? (
            <div className='flex items-center justify-center py-8'>
              <div className='text-muted-foreground flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span>加载评论中...</span>
              </div>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className='space-y-2 py-8 text-center'>
              <MessageSquare className='text-muted-foreground mx-auto h-8 w-8' />
              <p className='text-muted-foreground'>
                {showInternalOnly ? '暂无内部评论' : '暂无评论'}
              </p>
              {!isAuthenticated && (
                <p className='text-muted-foreground text-sm'>
                  请登录后参与讨论
                </p>
              )}
            </div>
          ) : (
            <div className='space-y-6'>
              {filteredComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onReply={handleReply}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          )}
        </div>

        {/* 加载更多按钮（如果需要分页） */}
        {filteredComments.length > 0 &&
          stats &&
          filteredComments.length < stats.total && (
            <div className='pt-4 text-center'>
              <Button
                variant='outline'
                onClick={refreshComments}
                disabled={loading}
              >
                加载更多评论
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
