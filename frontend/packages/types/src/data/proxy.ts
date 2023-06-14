export type ProxyConfigMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export type ProxyConfigHeader = {
  name: string;
  value: string;
};

export type ProxyConfigSecretHeader = {
  name: string;
  id: string;
};

export type ProxyConfigIngressRule = {
  token: string;
  target: string;
};

export type ProxyConfigStatus = 'enabled' | 'disabled';

export type ProxyConfig = {
  id: string;
  isLive: boolean;
  name: string;
  createdAt: string;
  status: ProxyConfigStatus;
  url: string;
  method: ProxyConfigMethod;
  deactivatedAt: null | string;
};

export type ProxyConfigDetails = ProxyConfig & {
  clientCertificate: string | null;
  accessReason: string;
  headers: ProxyConfigHeader[];
  ingressContentType: 'json' | null;
  ingressRules: ProxyConfigIngressRule[];
  pinnedServerCertificates: string[];
  secretHeaders: ProxyConfigSecretHeader[];
};
