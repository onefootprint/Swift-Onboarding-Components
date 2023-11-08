import type { ClientSecurityConfig } from '../data/client-security-config';

export type GetClientSecurityConfigRequest = {
  id: string;
};

export type GetClientSecurityResponse = ClientSecurityConfig;
