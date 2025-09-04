import { z } from 'zod';
import { TargetType, TargetStatus, Priority } from '@prisma/client';

// 目标类型枚举验证
export const TargetTypeSchema = z.nativeEnum(TargetType);
export const TargetStatusSchema = z.nativeEnum(TargetStatus);
export const PrioritySchema = z.nativeEnum(Priority);

// 创建目标验证模式
export const CreateTargetSchema = z.object({
  projectName: z
    .string()
    .max(255, '项目名称不能超过255个字符')
    .optional()
    .or(z.literal('')),
  name: z
    .string()
    .min(1, '目标名称不能为空')
    .max(255, '目标名称不能超过255个字符'),
  type: TargetTypeSchema.default(TargetType.WEB_APPLICATION),
  url: z
    .string()
    .url('URL格式不正确')
    .max(500, 'URL不能超过500个字符')
    .refine((url) => {
      if (!url) return true; // 允许空值
      try {
        const parsedUrl = new URL(url);
        const allowedProtocols = ['http:', 'https:'];
        return allowedProtocols.includes(parsedUrl.protocol);
      } catch {
        return false;
      }
    }, '仅支持 HTTP 和 HTTPS 协议的URL')
    .optional()
    .or(z.literal('')),
  description: z.string().max(10000, '描述不能超过10000个字符').optional(),
  deploymentEnv: z.string().max(50, '部署环境不能超过50个字符').optional(),
  networkZone: z.string().max(50, '网络区域不能超过50个字符').optional(),
  scope: z.string().max(10000, '测试范围不能超过10000个字符').optional(),
  status: TargetStatusSchema.default(TargetStatus.PENDING),
  priority: PrioritySchema.default(Priority.MEDIUM),
  remark: z.string().max(10000, '备注不能超过10000个字符').optional()
});

// 更新目标验证模式
export const UpdateTargetSchema = CreateTargetSchema.partial();

// 查询目标验证模式
export const FindTargetsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, '页码必须大于0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, '每页数量必须在1-100之间'),
  projectName: z.string().optional(),
  type: TargetTypeSchema.optional(),
  status: TargetStatusSchema.optional(),
  priority: PrioritySchema.optional(),
  deploymentEnv: z.string().optional(),
  networkZone: z.string().optional(),
  search: z.string().optional(),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === 'true')
});

// ID参数验证
export const TargetIdSchema = z.object({
  id: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, 'ID必须是正整数')
});

// 导出类型推断
export type CreateTargetInput = z.infer<typeof CreateTargetSchema>;
export type UpdateTargetInput = z.infer<typeof UpdateTargetSchema>;
export type FindTargetsInput = z.infer<typeof FindTargetsSchema>;
export type TargetIdInput = z.infer<typeof TargetIdSchema>;
