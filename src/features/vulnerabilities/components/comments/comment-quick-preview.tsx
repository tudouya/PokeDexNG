'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  ArrowDown,
  Shield,
  Clock,
  Users,
  MessageCircle
} from 'lucide-react';
import { useVulnerabilityComments } from '../../hooks/useVulnerabilityComments';

interface CommentQuickPreviewProps {
  vulnerabilityId: number;
  onScrollToComments?: () => void;
  className?: string;
}

export function CommentQuickPreview({
  vulnerabilityId,
  onScrollToComments,
  className
}: CommentQuickPreviewProps) {
  // 获取评论数据
  const { comments, stats, loading, error } = useVulnerabilityComments({
    vulnerabilityId,
    includeReplies: false, // 快速预览不包含回复
    sortOrder: 'desc', // 最新的在前
    limit: 3, // 只显示最新3条
    autoRefresh: true,
    refreshInterval: 30000
  });

  // 获取最新评论（包括所有回复）
  const recentComments = useMemo(() => {
    const allComments: Array<{
      id: number;
      content: string;
      author: { name?: string | null; email: string };
      isInternal: boolean;
      createdAt: string;
      isReply: boolean;
      parentAuthor?: string;
    }> = [];

    // 收集所有评论和回复
    comments.forEach((comment) => {
      allComments.push({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        isInternal: comment.isInternal,
        createdAt: comment.createdAt,
        isReply: false
      });

      // 添加回复
      comment.replies.forEach((reply) => {
        allComments.push({
          id: reply.id,
          content: reply.content,
          author: reply.author,
          isInternal: reply.isInternal,
          createdAt: reply.createdAt,
          isReply: true,
          parentAuthor: comment.author.fullName || comment.author.username
        });
      });
    });

    // 按时间排序，最新的在前
    return allComments
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 3);
  }, [comments]);

  // 截断文本
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MessageSquare className='h-4 w-4' />
            最新讨论
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground flex items-center justify-center py-4 text-sm'>
            加载中...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <MessageSquare className='h-4 w-4' />
            最新讨论
          </CardTitle>
          {stats && stats.total > 0 && (
            <Badge variant='secondary' className='text-xs'>
              {stats.total}
            </Badge>
          )}
        </div>
        {stats && (
          <CardDescription>{stats.participants} 位成员参与讨论</CardDescription>
        )}
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* 统计摘要 */}
        {stats && (
          <div className='grid grid-cols-2 gap-3 text-center'>
            <div className='bg-muted/30 rounded-lg p-2'>
              <div className='text-sm font-medium'>{stats.total}</div>
              <div className='text-muted-foreground text-xs'>总评论</div>
            </div>
            <div className='bg-muted/30 rounded-lg p-2'>
              <div className='text-sm font-medium'>{stats.participants}</div>
              <div className='text-muted-foreground text-xs'>参与者</div>
            </div>
          </div>
        )}

        {/* 最新评论列表 */}
        {recentComments.length > 0 ? (
          <div className='space-y-3'>
            <Separator />
            <div className='space-y-3'>
              {recentComments.map((comment, index) => (
                <div key={comment.id} className='space-y-2'>
                  <div className='flex items-start gap-2'>
                    <Avatar className='h-6 w-6 flex-shrink-0'>
                      <AvatarFallback className='text-xs'>
                        {comment.author.name?.[0] ||
                          comment.author.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='flex items-center gap-2 text-xs'>
                        <span className='truncate font-medium'>
                          {comment.author.name || comment.author.email}
                        </span>

                        {comment.isInternal && (
                          <Badge
                            variant='secondary'
                            className='h-4 px-1 text-xs'
                          >
                            <Shield className='h-2 w-2' />
                          </Badge>
                        )}

                        <span className='text-muted-foreground'>
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: zhCN
                          })}
                        </span>
                      </div>

                      {comment.isReply && (
                        <div className='text-muted-foreground text-xs'>
                          回复 @{comment.parentAuthor}
                        </div>
                      )}

                      <div className='text-foreground text-xs leading-relaxed'>
                        {truncateText(comment.content.replace(/<[^>]*>/g, ''))}
                      </div>
                    </div>
                  </div>

                  {index < recentComments.length - 1 && (
                    <Separator className='my-2' />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className='space-y-2 py-4 text-center'>
            <MessageCircle className='text-muted-foreground mx-auto h-6 w-6' />
            <p className='text-muted-foreground text-sm'>暂无讨论</p>
          </div>
        )}

        {/* 查看所有评论按钮 */}
        {(stats?.total ?? 0) > 0 && (
          <>
            <Separator />
            <Button
              variant='outline'
              size='sm'
              className='w-full gap-2'
              onClick={onScrollToComments}
            >
              <ArrowDown className='h-4 w-4' />
              查看所有讨论 ({stats?.total})
            </Button>
          </>
        )}

        {/* 活跃度指示器 */}
        {stats && stats.lastCommentAt && (
          <div className='text-muted-foreground flex items-center justify-center gap-1 text-center text-xs'>
            <Clock className='h-3 w-3' />
            最后活跃：
            {formatDistanceToNow(new Date(stats.lastCommentAt), {
              addSuffix: true,
              locale: zhCN
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
