// 目标类型选项
export const TARGET_TYPE_OPTIONS = [
  { label: 'Web应用', value: 'WEB_APPLICATION' },
  { label: 'API接口', value: 'API' },
  { label: '服务器', value: 'SERVER' },
  { label: '网络设备', value: 'NETWORK' },
  { label: '移动应用', value: 'MOBILE_APP' },
  { label: '微信小程序', value: 'WECHAT_APP' },
  { label: '数据库', value: 'DATABASE' },
  { label: '其他', value: 'OTHER' }
];

// 状态选项
export const TARGET_STATUS_OPTIONS = [
  { label: '待测试', value: 'PENDING' },
  { label: '测试中', value: 'IN_PROGRESS' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '暂停', value: 'ON_HOLD' }
];

// 优先级选项
export const PRIORITY_OPTIONS = [
  { label: '低', value: 'LOW' },
  { label: '中', value: 'MEDIUM' },
  { label: '高', value: 'HIGH' },
  { label: '紧急', value: 'CRITICAL' }
];

// 部署环境选项
export const DEPLOYMENT_ENV_OPTIONS = [
  { label: '生产环境', value: 'PROD' },
  { label: '测试环境', value: 'UAT' },
  { label: '开发环境', value: 'DEV' },
  { label: '预发布', value: 'STAGING' }
];

// 网络区域选项
export const NETWORK_ZONE_OPTIONS = [
  { label: '互联网', value: 'INTERNET' },
  { label: '内网', value: 'INTRANET' },
  { label: 'DMZ区', value: 'DMZ' },
  { label: 'VPN', value: 'VPN' }
];
