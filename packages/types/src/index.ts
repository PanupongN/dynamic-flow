// Core Types
export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  connections: Connection[];
}

export type NodeType = 
  | 'text_input'
  | 'email_input'
  | 'number_input'
  | 'phone_input'
  | 'single_choice'
  | 'multiple_choice'
  | 'rating'
  | 'date_picker'
  | 'file_upload'
  | 'conditional'
  | 'calculation'
  | 'thank_you';

export interface NodeData {
  label: string;
  description?: string;
  required?: boolean;
  validation?: ValidationRule[];
  options?: ChoiceOption[];
  settings?: Record<string, any>;
}

export interface Connection {
  targetNodeId: string;
  condition?: ConditionRule;
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'email' | 'url' | 'regex';
  value?: any;
  message: string;
}

export interface ChoiceOption {
  id: string;
  label: string;
  value: string;
}

// Step and Field types for Flow Builder
export interface Step {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
  logic?: any[];
  loop?: {
    enabled: boolean;
    sourceFieldId?: string;
    minCount?: number;
    maxCount?: number;
    labelTemplate?: string;
  };
}

export interface Field {
  id: string;
  type: 'text_input' | 'email_input' | 'number_input' | 'phone_input' | 'single_choice' | 'multiple_choice' | 'date_picker' | 'file_upload' | 'textarea';
  label: string;
  required: boolean;
  placeholder?: string;
  options?: ChoiceOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

// Flow Definition
export interface Flow {
  id: string;
  title: string;
  description?: string;
  nodes: FlowNode[];
  settings: FlowSettings;
  theme: ThemeConfig;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface FlowSettings {
  allowMultipleSubmissions: boolean;
  showProgressBar: boolean;
  requireAuth: boolean;
  collectAnalytics: boolean;
  redirectUrl?: string;
  webhookUrl?: string;
}

// Theme System
export interface ThemeConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    border: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  spacing: {
    small: string;
    medium: string;
    large: string;
  };
  borderRadius: string;
  customCSS?: string;
}

// Multi-tenant Types
export interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain: string;
  branding: TenantBranding;
  settings: TenantSettings;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: Date;
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily?: string;
  customCSS?: string;
}

export interface TenantSettings {
  allowEmbedding: boolean;
  allowWhiteLabel: boolean;
  customDomain: boolean;
  ssoEnabled: boolean;
  apiAccess: boolean;
  maxForms: number;
  maxSubmissions: number;
}

// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  permissions: Permission[];
  createdAt: Date;
  lastLoginAt?: Date;
}

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';

export interface Permission {
  resource: string;
  actions: string[];
}

// Form Response Types
export interface FormResponse {
  id: string;
  flowId: string;
  tenantId: string;
  responses: ResponseData[];
  metadata: ResponseMetadata;
  submittedAt: Date;
}

export interface ResponseData {
  nodeId: string;
  value: any;
  type: NodeType;
}

export interface ResponseMetadata {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  completionTime: number; // in seconds
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Embed Types
export interface EmbedConfig {
  flowId: string;
  theme?: Partial<ThemeConfig>;
  width?: string;
  height?: string;
  autoResize?: boolean;
  hideHeader?: boolean;
  hideFooter?: boolean;
  customCSS?: string;
}
