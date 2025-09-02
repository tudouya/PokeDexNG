'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileViewPage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card className='max-w-2xl'>
          <CardHeader>
            <div className='flex items-center gap-4'>
              <Skeleton className='h-16 w-16 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-6 w-48' />
                <Skeleton className='h-4 w-64' />
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-8 w-full' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <div className='flex gap-2'>
                <Skeleton className='h-6 w-16' />
                <Skeleton className='h-6 w-20' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className='flex w-full flex-col p-4'>
        <Card className='max-w-2xl'>
          <CardContent className='flex items-center justify-center py-8'>
            <p className='text-muted-foreground'>请先登录查看个人信息</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate avatar fallback from full name or username
  const avatarFallback = user.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.username.slice(0, 2).toUpperCase();

  return (
    <div className='flex w-full flex-col p-4'>
      <Card className='max-w-2xl'>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <Avatar className='h-16 w-16'>
              {user.avatar && (
                <AvatarImage
                  src={user.avatar}
                  alt={user.fullName || user.username}
                />
              )}
              <AvatarFallback className='text-lg font-semibold'>
                {avatarFallback}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1'>
              <CardTitle className='text-2xl'>
                {user.fullName || user.username}
              </CardTitle>
              <CardDescription className='text-sm'>
                {user.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold'>基本信息</h3>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <label className='text-muted-foreground text-sm font-medium'>
                  用户名
                </label>
                <p className='bg-muted/50 rounded-md px-3 py-2 text-sm'>
                  {user.username}
                </p>
              </div>
              <div className='space-y-2'>
                <label className='text-muted-foreground text-sm font-medium'>
                  邮箱地址
                </label>
                <p className='bg-muted/50 rounded-md px-3 py-2 text-sm'>
                  {user.email}
                </p>
              </div>
              {user.fullName && (
                <div className='space-y-2'>
                  <label className='text-muted-foreground text-sm font-medium'>
                    全名
                  </label>
                  <p className='bg-muted/50 rounded-md px-3 py-2 text-sm'>
                    {user.fullName}
                  </p>
                </div>
              )}
              <div className='space-y-2'>
                <label className='text-muted-foreground text-sm font-medium'>
                  用户ID
                </label>
                <p className='bg-muted/50 rounded-md px-3 py-2 text-sm'>
                  #{user.id}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
