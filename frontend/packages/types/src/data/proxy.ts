export type ProxyConfigMethod = 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';

export type ProxyConfig = {
  accessReason: string;
  clientCertificate: string | null;
  createdAt: string;
  id: string;
  ingressContentType: string;
  isLive: boolean;
  method: ProxyConfigMethod;
  name: string;
  url: string;
};
