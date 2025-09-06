import { Prisma } from '@prisma/client';

// 基于 Prisma 生成的类型
export type Vulnerability = Prisma.VulnerabilityGetPayload<{
  include: {
    target: true;
    category: true;
    template: true;
    foundByUser: true;
    assignedToUser: true;
  };
}>;

// 漏洞严重程度枚举
export type VulnerabilitySeverity =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW'
  | 'INFO';

// 漏洞状态枚举
export type VulnerabilityStatus =
  | 'OPEN'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'FIXED'
  | 'VERIFIED'
  | 'REOPEN'
  | 'WONT_FIX'
  | 'FALSE_POSITIVE'
  | 'DUPLICATE'
  | 'ACCEPTED_RISK';

// 业务影响级别
export type BusinessImpact = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

// 数据暴露级别
export type DataExposureLevel =
  | 'SENSITIVE'
  | 'PII'
  | 'INTERNAL'
  | 'PUBLIC'
  | 'NONE';

// 可利用性级别
export type ExploitabilityLevel =
  | 'FUNCTIONAL'
  | 'POC'
  | 'THEORETICAL'
  | 'UNKNOWN';

// 创建漏洞输入类型
export interface CreateVulnerabilityInput {
  // 基础信息
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  status?: VulnerabilityStatus;

  // 关联关系
  targetId: number;
  categoryId?: number;
  templateId?: number; // 预留模板功能

  // 时间管理
  foundDate?: Date;
  dueDate?: Date;

  // 漏洞位置
  affectedModule?: string;
  affectedParameter?: string;
  affectedUrl?: string;
  affectedEndpoint?: string;

  // 复现和证明
  reproductionSteps?: string;
  proofOfConcept?: string;
  requestData?: string;
  responseData?: string;

  // 影响评估
  impact?: string;
  businessImpact?: BusinessImpact;
  affectedUsers?: number;
  dataExposure?: DataExposureLevel;

  // 修复建议
  recommendation?: string;
  workaround?: string;
  references?: string;

  // 安全评分
  cvssScore?: number;
  cvssVector?: string;
  cvssVersion?: string;
  exploitability?: ExploitabilityLevel;

  // 标准映射
  cweId?: string;
  cveId?: string;
  owaspId?: string;
}

// 更新漏洞输入类型
export interface UpdateVulnerabilityInput
  extends Partial<CreateVulnerabilityInput> {
  id: number;
}

// 漏洞列表查询参数
export interface VulnerabilityListParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: VulnerabilitySeverity[];
  status?: VulnerabilityStatus[];
  targetId?: number;
  categoryId?: number;
  assignedTo?: number;
  sortBy?: 'createdAt' | 'foundDate' | 'severity' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// API 响应类型
export interface VulnerabilityListResponse {
  vulnerabilities: Vulnerability[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 漏洞详情DTO（用于API返回）
export interface VulnerabilityDTO {
  id: number;
  title: string;
  description: string;
  severity: VulnerabilitySeverity;
  status: VulnerabilityStatus;

  target: {
    id: number;
    name: string;
    url?: string | null;
    projectName?: string | null;
  };

  category?: {
    id: number;
    name: string;
  } | null;

  template?: {
    id: number;
    name: string;
  } | null;

  foundByUser?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;

  assignedToUser?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;

  confirmedByUser?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;

  verifiedByUser?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;

  // 时间字段
  foundDate: string;
  dueDate?: string | null;
  confirmedAt?: string | null;
  fixedAt?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // 漏洞位置
  affectedModule?: string | null;
  affectedParameter?: string | null;
  affectedUrl?: string | null;
  affectedEndpoint?: string | null;

  // 复现和证明
  reproductionSteps?: string | null;
  proofOfConcept?: string | null;
  requestData?: string | null;
  responseData?: string | null;

  // 影响评估
  impact?: string | null;
  businessImpact?: BusinessImpact | null;
  affectedUsers?: number | null;
  dataExposure?: DataExposureLevel | null;

  // 修复建议
  recommendation?: string | null;
  workaround?: string | null;
  references?: string | null;

  // 安全评分
  cvssScore?: number | null;
  cvssVector?: string | null;
  cvssVersion?: string | null;
  exploitability?: ExploitabilityLevel | null;

  // 标准映射
  cweId?: string | null;
  cveId?: string | null;
  owaspId?: string | null;
}

// ==================== 评论相关类型 ====================

// 评论作者信息
export interface CommentAuthor {
  id: number;
  username: string;
  fullName?: string | null;
  email: string;
}

// 评论DTO（用于API返回）
export interface CommentDTO {
  id: number;
  vulnerabilityId: number;
  parentId?: number | null;
  content: string;
  isInternal: boolean;
  mentionedUsers?: number[] | null;

  author: CommentAuthor;
  replies: CommentDTO[];

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

// 创建评论输入类型
export interface CreateCommentInput {
  vulnerabilityId: number;
  parentId?: number;
  content: string;
  isInternal?: boolean;
  mentionedUsers?: number[];
}

// 更新评论输入类型
export interface UpdateCommentInput {
  content: string;
  isInternal?: boolean;
  mentionedUsers?: number[];
}

// 评论列表查询参数
export interface CommentListParams {
  vulnerabilityId: number;
  includeReplies?: boolean;
  includeDeleted?: boolean;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// 评论统计信息
export interface CommentStats {
  total: number;
  internal: number;
  external: number;
  replies: number;
  participants: number;
  lastCommentAt?: string | null;
}
