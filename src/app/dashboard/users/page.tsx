/**
 * User Management Page
 * 用户管理界面 - 为管理员提供用户列表、搜索、筛选和状态管理功能
 *
 * 满足要求：
 * - 3.1: 管理员用户管理界面，使用TanStack Table构建用户列表
 * - 提供搜索、筛选、排序功能
 * - 显示用户角色和状态指示器
 */

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useDataTable } from '@/hooks/use-data-table';
import { useUsers, type UserListItem } from '@/hooks/use-users';
import { useDebounce } from '@/hooks/use-debounce';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import PageContainer from '@/components/layout/page-container';
import {
  IconSearch,
  IconFilter,
  IconRefresh,
  IconUserPlus,
  IconDots,
  IconEdit,
  IconKey,
  IconUserX,
  IconUserCheck,
  IconUser
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

/**
 * 用户状态徽章组件
 */
function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant={isActive ? 'default' : 'secondary'}
      className={
        isActive
          ? 'bg-green-100 text-green-800 hover:bg-green-100'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-100'
      }
    >
      {isActive ? '活跃' : '停用'}
    </Badge>
  );
}

/**
 * 用户角色显示组件
 */
function UserRoles({ roles }: { roles: UserListItem['roles'] }) {
  if (roles.length === 0) {
    return <span className='text-muted-foreground'>无角色</span>;
  }

  if (roles.length === 1) {
    return <Badge variant='outline'>{roles[0].displayName}</Badge>;
  }

  return (
    <div className='flex flex-wrap gap-1'>
      <Badge variant='outline'>{roles[0].displayName}</Badge>
      {roles.length > 1 && (
        <Badge variant='secondary' className='text-xs'>
          +{roles.length - 1}
        </Badge>
      )}
    </div>
  );
}

/**
 * 用户操作菜单组件
 */
function UserActionsMenu({ user }: { user: UserListItem }) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/dashboard/users/${user.id}`);
  };

  const handleEdit = () => {
    // Navigate to user details page in edit mode
    router.push(`/dashboard/users/${user.id}?edit=true`);
  };

  const handleResetPassword = () => {
    // TODO: 重置用户密码
  };

  const handleToggleStatus = () => {
    // TODO: 切换用户状态
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm'>
          <IconDots className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>用户操作</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewDetails}>
          <IconUser className='mr-2 h-4 w-4' />
          查看详情
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <IconEdit className='mr-2 h-4 w-4' />
          编辑用户
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResetPassword}>
          <IconKey className='mr-2 h-4 w-4' />
          重置密码
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleToggleStatus}>
          {user.isActive ? (
            <>
              <IconUserX className='mr-2 h-4 w-4' />
              停用用户
            </>
          ) : (
            <>
              <IconUserCheck className='mr-2 h-4 w-4' />
              激活用户
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * 用户管理页面
 */
export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 防抖搜索词
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 构建查询参数
  const queryParams = useMemo(
    () => ({
      search: debouncedSearchTerm || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      page: 1,
      limit: 20
    }),
    [debouncedSearchTerm, statusFilter]
  );

  // 获取用户数据
  const { users, loading, error, refetch, pagination } = useUsers({
    immediate: true,
    params: queryParams
  });

  // 定义表格列
  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        accessorKey: 'username',
        header: '用户名',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className='flex flex-col'>
              <span className='font-medium'>{user.username}</span>
              <span className='text-muted-foreground text-sm'>
                {user.email}
              </span>
            </div>
          );
        }
      },
      {
        accessorKey: 'fullName',
        header: '姓名',
        cell: ({ getValue }) => {
          const fullName = getValue<string | null>();
          return (
            fullName || <span className='text-muted-foreground'>未设置</span>
          );
        }
      },
      {
        accessorKey: 'roles',
        header: '角色',
        cell: ({ getValue }) => {
          const roles = getValue<UserListItem['roles']>();
          return <UserRoles roles={roles} />;
        }
      },
      {
        accessorKey: 'isActive',
        header: '状态',
        cell: ({ getValue }) => {
          const isActive = getValue<boolean>();
          return <UserStatusBadge isActive={isActive} />;
        }
      },
      {
        accessorKey: 'lastLoginAt',
        header: '最后登录',
        cell: ({ getValue }) => {
          const lastLoginAt = getValue<string | null>();
          if (!lastLoginAt) {
            return <span className='text-muted-foreground'>从未登录</span>;
          }
          return (
            <span className='text-sm'>
              {format(new Date(lastLoginAt), 'yyyy-MM-dd HH:mm', {
                locale: zhCN
              })}
            </span>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: '创建时间',
        cell: ({ getValue }) => {
          const createdAt = getValue<string>();
          return (
            <span className='text-sm'>
              {format(new Date(createdAt), 'yyyy-MM-dd', { locale: zhCN })}
            </span>
          );
        }
      },
      {
        id: 'actions',
        header: '操作',
        cell: ({ row }) => <UserActionsMenu user={row.original} />
      }
    ],
    []
  );

  // 使用数据表格Hook
  const table = useDataTable({
    data: users,
    columns,
    pageCount: pagination?.totalPages || 0,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 20
      }
    }
  });

  // 处理刷新
  const handleRefresh = () => {
    refetch();
  };

  // 处理创建用户
  const handleCreateUser = () => {
    // TODO: 打开创建用户对话框
  };

  if (error) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>加载用户列表失败: {error}</p>
          <Button onClick={handleRefresh} variant='outline'>
            <IconRefresh className='mr-2 h-4 w-4' />
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-6'>
        {/* 页面标题 */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>用户管理</h1>
            <p className='text-muted-foreground'>
              管理系统用户账户、角色权限和状态
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <IconUserPlus className='mr-2 h-4 w-4' />
            创建用户
          </Button>
        </div>

        {/* 搜索和筛选栏 */}
        <div className='flex items-center gap-4'>
          <div className='relative max-w-sm flex-1'>
            <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
            <Input
              placeholder='搜索用户名、邮箱或姓名...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className='min-w-[140px]'>
              <IconFilter className='mr-2 h-4 w-4' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>全部状态</SelectItem>
              <SelectItem value='active'>活跃用户</SelectItem>
              <SelectItem value='inactive'>停用用户</SelectItem>
            </SelectContent>
          </Select>

          <Button variant='outline' onClick={handleRefresh} disabled={loading}>
            <IconRefresh
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            刷新
          </Button>
        </div>

        {/* 用户统计 */}
        {pagination && (
          <div className='text-muted-foreground flex items-center gap-6 text-sm'>
            <span>总计 {pagination.total} 个用户</span>
            <span>
              第 {pagination.page} 页，共 {pagination.totalPages} 页
            </span>
            <span>活跃用户：{users.filter((u) => u.isActive).length}</span>
            <span>停用用户：{users.filter((u) => !u.isActive).length}</span>
          </div>
        )}

        {/* 用户列表表格 */}
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant='ghost'
                          onClick={() => header.column.toggleSorting()}
                          className='h-auto p-0 font-semibold hover:bg-transparent'
                        >
                          {typeof header.column.columnDef.header === 'string'
                            ? header.column.columnDef.header
                            : typeof header.column.columnDef.header ===
                                'function'
                              ? header.column.columnDef.header(
                                  header.getContext()
                                )
                              : null}
                        </Button>
                      ) : typeof header.column.columnDef.header === 'string' ? (
                        header.column.columnDef.header
                      ) : typeof header.column.columnDef.header ===
                        'function' ? (
                        header.column.columnDef.header(header.getContext())
                      ) : null}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // 加载状态
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {columns.map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <div className='bg-muted h-4 animate-pulse rounded' />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.table.getRowModel().rows?.length ? (
                // 数据行
                table.table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {cell.getValue() !== undefined &&
                        cell.column.columnDef.cell
                          ? typeof cell.column.columnDef.cell === 'function'
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.column.columnDef.cell
                          : (cell.getValue() as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // 空状态
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    <div className='flex flex-col items-center gap-2'>
                      <p>暂无用户数据</p>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={handleRefresh}
                      >
                        重新加载
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 分页控制 */}
        {pagination && pagination.totalPages > 1 && (
          <div className='flex items-center justify-between'>
            <div className='text-muted-foreground text-sm'>
              显示 {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              条，共 {pagination.total} 条
            </div>
            <div className='flex items-center space-x-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.table.previousPage()}
                disabled={!table.table.getCanPreviousPage()}
              >
                上一页
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => table.table.nextPage()}
                disabled={!table.table.getCanNextPage()}
              >
                下一页
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
