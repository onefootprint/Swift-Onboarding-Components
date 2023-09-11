import type { Role } from './role';

export type ApiKey = {
  createdAt: string;
  id: string;
  isLive: boolean;
  key: string | null;
  lastUsedAt: string | null;
  name: string;
  status: 'enabled' | 'disabled';
  role: Role;
};
