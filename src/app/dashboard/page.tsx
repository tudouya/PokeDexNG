import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import {
  IconTrendingDown,
  IconTrendingUp,
  IconShield,
  IconBug,
  IconReport,
  IconUsers
} from '@tabler/icons-react';

/**
 * Dashboard 首页
 * 渗透测试漏洞管理平台的主面板
 *
 * 认证检查由中间件统一处理，此页面只专注于业务逻辑
 */
export default async function Dashboard() {
  // 获取当前会话
  const sessionData = await getSession();

  // 获取用户详细信息
  const user = sessionData
    ? await prisma.user.findUnique({
        where: { id: sessionData.user.id },
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          avatar: true
        }
      })
    : null;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-2'>
        <div className='flex items-center justify-between space-y-2'>
          <h2 className='text-2xl font-bold tracking-tight'>
            欢迎回来，{user?.fullName || user?.username || '用户'} 👋
          </h2>
        </div>

        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>活跃项目</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                12
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconTrendingUp />
                  +2
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                本月新增项目 <IconShield className='size-4' />
              </div>
              <div className='text-muted-foreground'>渗透测试项目进行中</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>发现漏洞</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                89
              </CardTitle>
              <CardAction>
                <Badge
                  variant='outline'
                  className='border-red-200 text-red-600 dark:border-red-900 dark:text-red-400'
                >
                  <IconBug />
                  高危: 5
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                需要立即关注 <IconBug className='size-4' />
              </div>
              <div className='text-muted-foreground'>包含5个高危漏洞</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>生成报告</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                23
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconReport />
                  本周: 8
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                报告生成效率提升 <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>平均10分钟完成</div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>团队成员</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                8
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <IconUsers />
                  在线: 6
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='line-clamp-1 flex gap-2 font-medium'>
                协作效率高 <IconTrendingUp className='size-4' />
              </div>
              <div className='text-muted-foreground'>75% 成员在线</div>
            </CardFooter>
          </Card>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <CardTitle>最新漏洞</CardTitle>
              <CardDescription>近期发现的安全问题</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className='text-muted-foreground text-sm'>
                暂无最新漏洞数据，功能开发中...
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>项目进度</CardTitle>
              <CardDescription>当前项目状态概览</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className='text-muted-foreground text-sm'>
                项目进度追踪功能开发中...
              </p>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>知识库</CardTitle>
              <CardDescription>漏洞知识和经验分享</CardDescription>
            </CardHeader>
            <CardFooter>
              <p className='text-muted-foreground text-sm'>
                知识库管理功能开发中...
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
