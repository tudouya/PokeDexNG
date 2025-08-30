/**
 * 密码加密和验证工具
 * 使用bcrypt进行安全的密码哈希处理
 */

import bcrypt from 'bcryptjs';

/**
 * 密码复杂度配置
 */
export const PASSWORD_CONFIG = {
  minLength: 8,
  maxLength: 128,
  saltRounds: 12, // bcrypt 盐轮数，平衡安全性和性能
  // 密码复杂度要求
  requirements: {
    minLowercase: 1, // 至少1个小写字母
    minUppercase: 1, // 至少1个大写字母
    minNumbers: 1, // 至少1个数字
    minSymbols: 1 // 至少1个特殊字符
  }
} as const;

/**
 * 密码验证错误类型
 */
export type PasswordValidationError =
  | 'too_short'
  | 'too_long'
  | 'missing_lowercase'
  | 'missing_uppercase'
  | 'missing_number'
  | 'missing_symbol';

/**
 * 加密密码
 * @param plainPassword 明文密码
 * @returns Promise<string> 加密后的密码哈希
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt(PASSWORD_CONFIG.saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(
      `密码加密失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 验证密码
 * @param plainPassword 明文密码
 * @param hashedPassword 加密后的密码哈希
 * @returns Promise<boolean> 密码是否匹配
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(
      `密码验证失败: ${error instanceof Error ? error.message : '未知错误'}`
    );
  }
}

/**
 * 验证密码复杂度
 * @param password 要验证的密码
 * @returns PasswordValidationError[] 验证错误列表，空数组表示验证通过
 */
export function validatePasswordComplexity(
  password: string
): PasswordValidationError[] {
  const errors: PasswordValidationError[] = [];

  // 长度检查
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push('too_short');
  }
  if (password.length > PASSWORD_CONFIG.maxLength) {
    errors.push('too_long');
  }

  // 复杂度检查
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (!hasLowercase) errors.push('missing_lowercase');
  if (!hasUppercase) errors.push('missing_uppercase');
  if (!hasNumber) errors.push('missing_number');
  if (!hasSymbol) errors.push('missing_symbol');

  return errors;
}

/**
 * 获取密码复杂度错误的中文描述
 * @param errors 验证错误数组
 * @returns string[] 错误描述数组
 */
export function getPasswordErrorMessages(
  errors: PasswordValidationError[]
): string[] {
  const messages: Record<PasswordValidationError, string> = {
    too_short: `密码长度至少${PASSWORD_CONFIG.minLength}位`,
    too_long: `密码长度不能超过${PASSWORD_CONFIG.maxLength}位`,
    missing_lowercase: '密码必须包含至少1个小写字母',
    missing_uppercase: '密码必须包含至少1个大写字母',
    missing_number: '密码必须包含至少1个数字',
    missing_symbol: '密码必须包含至少1个特殊字符'
  };

  return errors.map((error) => messages[error]);
}

/**
 * 生成安全的随机密码
 * @param length 密码长度，默认12位
 * @returns string 生成的密码
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  // 确保包含每种类型的字符
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱字符顺序
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

/**
 * 验证密码并返回用户友好的错误信息
 * @param password 要验证的密码
 * @returns { isValid: boolean, errors: string[] }
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const validationErrors = validatePasswordComplexity(password);
  return {
    isValid: validationErrors.length === 0,
    errors: getPasswordErrorMessages(validationErrors)
  };
}
