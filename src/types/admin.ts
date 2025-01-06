export interface PabxInstance {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'suspended' | 'maintenance';
  credits: number;
  extensionsLimit: number;
  extensionsUsed: number;
  lastSync: Date;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  password: string;
  plano: string;
  status: 'ativo' | 'inativo';
  role: 'admin' | 'user';
  accountid: string;
  limite: number;
  last_login?: string;
  created_at?: string;
}

export interface Plano {
  id: string;
  nome: string;
  limite: number;
  descricao?: string;
}

export interface SystemMetrics {
  totalInstances: number;
  totalUsers: number;
  totalExtensions: number;
  totalCredits: number;
}