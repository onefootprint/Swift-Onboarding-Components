import type { CreateProxyConfigRequest } from '.';
import type { ProxyConfigDetails, ProxyConfigHeader, ProxyConfigStatus } from '../data';

export type UpdateProxyConfigRequest = {
  id: string;
  headers?: ProxyConfigHeader[];
  status?: ProxyConfigStatus;
} & Partial<Pick<CreateProxyConfigRequest, 'name' | 'method' | 'url' | 'accessReason' | 'ingressSettings'>>;

export type UpdateProxyConfigResponse = ProxyConfigDetails;
