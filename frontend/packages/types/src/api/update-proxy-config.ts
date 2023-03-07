import { ProxyConfigDetails } from '../data';

export type UpdateProxyConfigRequest = Partial<{
  status: ProxyConfigDetails['status'];
}>;

export type UpdateProxyConfigResponse = ProxyConfigDetails;
