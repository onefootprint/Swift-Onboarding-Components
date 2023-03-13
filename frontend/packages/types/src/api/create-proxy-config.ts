import {
  ProxyConfigDetails,
  ProxyConfigHeader,
  ProxyConfigMethod,
  ProxyConfigIngressRule,
} from '../data';

export type CreateProxyConfigRequest = {
  accessReason: string;
  clientIdentity: null | {
    certificate: string;
    key: string;
  };
  headers: ProxyConfigHeader[];
  ingressSettings: {
    contentType: 'json';
    rules: ProxyConfigIngressRule[];
  };
  method: ProxyConfigMethod;
  name: string;
  pinnedServerCertificates: string[];
  secretHeaders: ProxyConfigHeader[];
  url: string;
};

export type CreateProxyConfigResponse = ProxyConfigDetails;
