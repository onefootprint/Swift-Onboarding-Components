import { ProxyConfig } from '../data';

export type GetProxyConfigsRequest = {
  status?: string;
};

export type GetProxyConfigsResponse = ProxyConfig[];
