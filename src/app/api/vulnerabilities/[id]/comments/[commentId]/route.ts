import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import {
  CommentDTO,
  UpdateCommentInput
} from '@/features/vulnerabilities/types';

// PATCH /api/vulnerabilities/[id]/comments/[commentId] - 编辑评论
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '未授权访问' } },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    const vulnerabilityId = parseInt(id);
    const commentIdParsed = parseInt(commentId);

    if (isNaN(vulnerabilityId) || isNaN(commentIdParsed)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的ID参数' } },
        { status: 400 }
      );
    }

    // 解析请求体
    const body: UpdateCommentInput = await request.json();

    // 验证必填字段
    if (!body.content?.trim()) {
      return NextResponse.json(
        { status: 'fail', data: { message: '评论内容不能为空' } },
        { status: 400 }
      );
    }

    // 检查评论是否存在且用户是否有权限编辑
    const existingComment = await prisma.vulnerabilityComment.findUnique({
      where: {
        id: commentIdParsed,
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
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

    if (!existingComment) {
      return NextResponse.json(
        { status: 'fail', data: { message: '评论不存在' } },
        { status: 404 }
      );
    }

    // 检查权限：只有评论作者可以编辑
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无权限编辑此评论' } },
        { status: 403 }
      );
    }

    // 更新评论
    const updatedComment = await prisma.vulnerabilityComment.update({
      where: { id: commentIdParsed },
      data: {
        content: body.content.trim(),
        isInternal: body.isInternal ?? existingComment.isInternal,
        mentionedUsers: body.mentionedUsers
          ? JSON.parse(JSON.stringify(body.mentionedUsers))
          : existingComment.mentionedUsers
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        replies: {
          where: { isDeleted: false },
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
      }
    });

    // 转换为DTO格式
    const commentDTO: CommentDTO = {
      id: updatedComment.id,
      vulnerabilityId: updatedComment.vulnerabilityId,
      parentId: updatedComment.parentId,
      content: updatedComment.content,
      isInternal: updatedComment.isInternal,
      mentionedUsers: updatedComment.mentionedUsers as number[] | null,
      author: updatedComment.author,
      replies: updatedComment.replies.map((reply) => ({
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
      })),
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      isDeleted: updatedComment.isDeleted
    };

    return NextResponse.json({
      status: 'success',
      data: commentDTO
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('更新评论失败:', error);
    return NextResponse.json(
      { status: 'error', message: '更新评论失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/vulnerabilities/[id]/comments/[commentId] - 删除评论
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '未授权访问' } },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    const vulnerabilityId = parseInt(id);
    const commentIdParsed = parseInt(commentId);

    if (isNaN(vulnerabilityId) || isNaN(commentIdParsed)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的ID参数' } },
        { status: 400 }
      );
    }

    // 检查评论是否存在且用户是否有权限删除
    const existingComment = await prisma.vulnerabilityComment.findUnique({
      where: {
        id: commentIdParsed,
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
      }
    });

    if (!existingComment) {
      return NextResponse.json(
        { status: 'fail', data: { message: '评论不存在' } },
        { status: 404 }
      );
    }

    // 检查权限：只有评论作者可以删除
    // 注意：在实际应用中，管理员可能也应该有删除权限
    if (existingComment.authorId !== session.user.id) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无权限删除此评论' } },
        { status: 403 }
      );
    }

    // 软删除评论（标记为已删除，不真正删除数据）
    await prisma.vulnerabilityComment.update({
      where: { id: commentIdParsed },
      data: { isDeleted: true }
    });

    // 如果有子评论，也需要一并处理
    // 这里选择保留子评论，只删除父评论
    // 如果需要级联删除，可以uncomment下面的代码
    /*
    await prisma.vulnerabilityComment.updateMany({
      where: {
        parentId: commentId,
        isDeleted: false
      },
      data: { isDeleted: true }
    });
    */

    return NextResponse.json({
      status: 'success',
      data: { message: '评论已删除' }
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('删除评论失败:', error);
    return NextResponse.json(
      { status: 'error', message: '删除评论失败' },
      { status: 500 }
    );
  }
}

// GET /api/vulnerabilities/[id]/comments/[commentId] - 获取单个评论详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { status: 'fail', data: { message: '未授权访问' } },
        { status: 401 }
      );
    }

    const { id, commentId } = await params;
    const vulnerabilityId = parseInt(id);
    const commentIdParsed = parseInt(commentId);

    if (isNaN(vulnerabilityId) || isNaN(commentIdParsed)) {
      return NextResponse.json(
        { status: 'fail', data: { message: '无效的ID参数' } },
        { status: 400 }
      );
    }

    // 获取评论详情
    const comment = await prisma.vulnerabilityComment.findUnique({
      where: {
        id: commentIdParsed,
        vulnerabilityId: vulnerabilityId,
        isDeleted: false
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true
          }
        },
        replies: {
          where: { isDeleted: false },
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
      }
    });

    if (!comment) {
      return NextResponse.json(
        { status: 'fail', data: { message: '评论不存在' } },
        { status: 404 }
      );
    }

    // 转换为DTO格式
    const commentDTO: CommentDTO = {
      id: comment.id,
      vulnerabilityId: comment.vulnerabilityId,
      parentId: comment.parentId,
      content: comment.content,
      isInternal: comment.isInternal,
      mentionedUsers: comment.mentionedUsers as number[] | null,
      author: comment.author,
      replies: comment.replies.map((reply) => ({
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
      })),
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      isDeleted: comment.isDeleted
    };

    return NextResponse.json({
      status: 'success',
      data: commentDTO
    });
  } catch (error) {
    // TODO: Replace with proper logging system
    // console.error('获取评论详情失败:', error);
    return NextResponse.json(
      { status: 'error', message: '获取评论详情失败' },
      { status: 500 }
    );
  }
}
