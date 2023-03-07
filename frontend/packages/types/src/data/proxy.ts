export type ProxyConfigMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export type ProxyConfigHeader = {
  name: string;
  value: string;
};

export type ProxyConfigSecretHeader = {
  name: string;
  id: string;
};

export type ProxyIngressRule = {
  token: string;
  target: string;
};

export type ProxyConfig = {
  id: string;
  isLive: boolean;
  name: string;
  createdAt: string;
  status: 'enabled' | 'disabled';
  url: string;
  method: ProxyConfigMethod;
  deactivatedAt: null | string;
};

export type ProxyConfigDetails = ProxyConfig & {
  clientCertificate: string | null;
  accessReason: string;
  headers: ProxyConfigHeader[];
  ingressContentType: string;
  ingressRules: ProxyIngressRule[];
  pinnedServerCertificates: string[];
  secretHeaders: ProxyConfigSecretHeader[];
};
