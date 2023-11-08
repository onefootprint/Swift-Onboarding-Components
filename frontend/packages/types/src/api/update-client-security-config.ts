import type { ClientSecurityConfig } from '../data/client-security-config';

export type UpdateClientSecurityConfigRequest = {
  allowedOrigins: string[];
};

export type UpdateClientSecurityConfigResponse = ClientSecurityConfig;
