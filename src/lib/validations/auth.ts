import * as z from 'zod';
import {
  validatePasswordComplexity,
  PASSWORD_CONFIG
} from '@/lib/auth/password';

/**
 * 邮箱验证 schema
 * 支持邮箱格式验证和基础长度限制
 */
export const emailSchema = z
  .string()
  .min(1, { message: '邮箱地址不能为空' })
  .email({ message: '请输入有效的邮箱地址' })
  .max(255, { message: '邮箱地址不能超过255个字符' });

/**
 * 用户名验证 schema
 * 支持字母、数字、下划线和连字符，3-50个字符
 */
export const usernameSchema = z
  .string()
  .min(3, { message: '用户名至少需要3个字符' })
  .max(50, { message: '用户名不能超过50个字符' })
  .regex(/^[a-zA-Z0-9_-]+$/, {
    message: '用户名只能包含字母、数字、下划线和连字符'
  });

/**
 * 密码验证 schema
 * 集成现有的密码复杂度验证逻辑
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_CONFIG.minLength, {
    message: `密码长度至少${PASSWORD_CONFIG.minLength}位`
  })
  .max(PASSWORD_CONFIG.maxLength, {
    message: `密码长度不能超过${PASSWORD_CONFIG.maxLength}位`
  })
  .refine(
    (password) => {
      const errors = validatePasswordComplexity(password);
      return errors.length === 0;
    },
    {
      message: '密码必须包含至少1个小写字母、1个大写字母、1个数字和1个特殊字符'
    }
  );

/**
 * 邮箱/用户名登录凭据验证 schema
 * 支持邮箱或用户名作为登录标识
 */
export const loginCredentialsSchema = z.object({
  identifier: z
    .string()
    .min(1, { message: '请输入邮箱地址或用户名' })
    .refine(
      (value) => {
        // 如果包含@符号，验证为邮箱格式
        if (value.includes('@')) {
          return z.string().email().safeParse(value).success;
        }
        // 否则验证为用户名格式
        return usernameSchema.safeParse(value).success;
      },
      {
        message: '请输入有效的邮箱地址或用户名'
      }
    ),
  password: z.string().min(1, { message: '密码不能为空' })
  // 登录时不验证密码复杂度，只验证非空
});

/**
 * 严格密码验证 schema（用于注册和重置密码）
 */
export const strictLoginSchema = z.object({
  identifier: loginCredentialsSchema.shape.identifier,
  password: passwordSchema
});

/**
 * 邮箱登录 schema
 */
export const emailLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { message: '密码不能为空' })
});

/**
 * 用户名登录 schema
 */
export const usernameLoginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, { message: '密码不能为空' })
});

/**
 * 注册验证 schema
 */
export const registerSchema = z
  .object({
    email: emailSchema,
    username: usernameSchema.optional(),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: '请确认密码' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword']
  });

/**
 * 重置密码请求 schema
 */
export const resetPasswordRequestSchema = z.object({
  email: emailSchema
});

/**
 * 重置密码确认 schema
 */
export const resetPasswordConfirmSchema = z
  .object({
    token: z.string().min(1, { message: '重置令牌不能为空' }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: '请确认密码' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不匹配',
    path: ['confirmPassword']
  });

/**
 * 修改密码 schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, { message: '请输入当前密码' }),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, { message: '请确认新密码' })
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的新密码不匹配',
    path: ['confirmPassword']
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '新密码不能与当前密码相同',
    path: ['newPassword']
  });

// TypeScript 类型导出
export type EmailSchema = z.infer<typeof emailSchema>;
export type UsernameSchema = z.infer<typeof usernameSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type StrictLoginCredentials = z.infer<typeof strictLoginSchema>;
export type EmailLogin = z.infer<typeof emailLoginSchema>;
export type UsernameLogin = z.infer<typeof usernameLoginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirm = z.infer<typeof resetPasswordConfirmSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
