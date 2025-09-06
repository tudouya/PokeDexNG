import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import {
  CommentDTO,
  CreateCommentInput,
  CommentStats
} from '@/features/vulnerabilities/types';

// GET /api/vulnerabilities/[id]/comments - 获取评论列表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '未授权访问' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const vulnerabilityId = parseInt(id);
    if (isNaN(vulnerabilityId)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的漏洞ID' } },
        { status: 400 }
      );
    }

    // 检查用户是否有权限查看该漏洞
    const vulnerability = await prisma.vulnerability.findUnique({
      where: { id: vulnerabilityId },
      select: { id: true }
    });

    if (!vulnerability) {
      return NextResponse.json(
        { status: 'fail', data: { message: '漏洞不存在' } },
        { status: 404 }
      );
    }

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const includeReplies = searchParams.get('includeReplies') !== 'false';
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 构建查询条件
    const whereCondition: any = {
      vulnerabilityId: vulnerabilityId,
      parentId: includeReplies ? undefined : null
    };

    if (!includeDeleted) {
      whereCondition.isDeleted = false;
    }

    // 获取评论列表
    const comments = await prisma.vulnerabilityComment.findMany({
      where: whereCondition,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        replies: includeReplies
          ? {
              where: includeDeleted ? {} : { isDeleted: false },
              include: {
                author: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          : false
      },
      orderBy: { createdAt: sortOrder },
      take: limit,
      skip: offset
    });

    // 转换为DTO格式
    const commentsDTO: CommentDTO[] = comments.map((comment) => ({
      id: comment.id,
      vulnerabilityId: comment.vulnerabilityId,
      parentId: comment.parentId,
      content: comment.content,
      isInternal: comment.isInternal,
      mentionedUsers: comment.mentionedUsers as number[] | null,
      author: comment.author,
      replies: includeReplies
        ? (comment.replies as any[])?.map((reply) => ({
            id: reply.id,
            vulnerabilityId: reply.vulnerabilityId,
            parentId: reply.parentId,
            content: reply.content,
            isInternal: reply.isInternal,
            mentionedUsers: reply.mentionedUsers as number[] | null,
            author: reply.author,
            replies: [],
            createdAt: reply.createdAt.toISOString(),
            updatedAt: reply.updatedAt.toISOString(),
            isDeleted: reply.isDeleted
          })) || []
        : [],
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isDeleted: comment.isDeleted
    }));

    // 获取评论统计信息
    const stats = await prisma.vulnerabilityComment.aggregate({
      where: {
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
      },
      _count: {
        id: true
      }
    });

    const internalCount = await prisma.vulnerabilityComment.count({
      where: {
        vulnerabilityId: vulnerabilityId,
        isDeleted: false,
        isInternal: true
      }
    });

    const replyCount = await prisma.vulnerabilityComment.count({
      where: {
        vulnerabilityId: vulnerabilityId,
        isDeleted: false,
        parentId: { not: null }
      }
    });

    const participants = await prisma.vulnerabilityComment.findMany({
      where: {
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
      },
      select: { authorId: true },
      distinct: ['authorId']
    });

    const lastComment = await prisma.vulnerabilityComment.findFirst({
      where: {
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    });

    const commentStats: CommentStats = {
      total: stats._count.id,
      internal: internalCount,
      external: stats._count.id - internalCount,
      replies: replyCount,
      participants: participants.length,
      lastCommentAt: lastComment?.createdAt.toISOString() || null
    };

    return NextResponse.json({
      status: 'success',
      data: {
        comments: commentsDTO,
        stats: commentStats,
        pagination: {
          limit,
          offset,
          total: stats._count.id
        }
      }
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取评论列表失败:', error);
    return NextResponse.json(
      { status: 'error', message: '获取评论列表失败' },
      { status: 500 }
    );
  }
}

// POST /api/vulnerabilities/[id]/comments - 添加评论
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '未授权访问' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const vulnerabilityId = parseInt(id);
    if (isNaN(vulnerabilityId)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的漏洞ID' } },
        { status: 400 }
      );
    }

    // 检查用户是否有权限访问该漏洞
    const vulnerability = await prisma.vulnerability.findUnique({
      where: { id: vulnerabilityId },
      select: { id: true }
    });

    if (!vulnerability) {
      return NextResponse.json(
        { status: 'fail', data: { message: '漏洞不存在' } },
        { status: 404 }
      );
    }

    // 解析请求体
    const body: Omit<CreateCommentInput, 'vulnerabilityId'> =
      await request.json();

    // 验证必填字段
    if (!body.content?.trim()) {
      return NextResponse.json(
        { status: 'fail', data: { message: '评论内容不能为空' } },
        { status: 400 }
      );
    }

    // 如果是回复，检查父评论是否存在
    if (body.parentId) {
      const parentComment = await prisma.vulnerabilityComment.findUnique({
        where: {
          id: body.parentId,
          vulnerabilityId: vulnerabilityId,
          isDeleted: false
        }
      });

      if (!parentComment) {
        return NextResponse.json(
          { status: 'fail', data: { message: '父评论不存在' } },
          { status: 400 }
        );
      }
    }

    // 创建评论
    const comment = await prisma.vulnerabilityComment.create({
      data: {
        vulnerabilityId: vulnerabilityId,
        parentId: body.parentId || null,
        authorId: session.user.id,
        content: body.content.trim(),
        isInternal: body.isInternal || false,
        mentionedUsers: body.mentionedUsers
          ? JSON.parse(JSON.stringify(body.mentionedUsers))
          : null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // 转换为DTO格式
    const commentDTO: CommentDTO = {
      id: comment.id,
      vulnerabilityId: comment.vulnerabilityId,
      parentId: comment.parentId,
      content: comment.content,
      isInternal: comment.isInternal,
      mentionedUsers: comment.mentionedUsers as number[] | null,
      author: comment.author,
      replies: [],
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isDeleted: comment.isDeleted
    };

    return NextResponse.json(
      {
        status: 'success',
        data: commentDTO
      },
      { status: 201 }
    );
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('创建评论失败:', error);
    return NextResponse.json(
      { status: 'error', message: '创建评论失败' },
      { status: 500 }
    );
  }
}
