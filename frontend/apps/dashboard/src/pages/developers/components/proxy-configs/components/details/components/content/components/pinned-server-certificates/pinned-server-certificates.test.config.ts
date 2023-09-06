import type { ProxyConfigDetails } from '@onefootprint/types';

export const configWithNoPinnedServerCertificate: ProxyConfigDetails = {
  id: '1',
  isLive: true,
  name: 'testName',
  createdAt: '2022-09-19T16:24:35.367322Z',
  status: 'enabled',
  url: 'http://proxy.acmebank.com',
  method: 'POST',
  deactivatedAt: null,
  clientCertificate: null,
  accessReason: 'checking customer data',
  headers: [],
  ingressContentType: 'json',
  ingressRules: [],
  pinnedServerCertificates: [],
  secretHeaders: [],
};

export const configWithPinnedServerCertificate: ProxyConfigDetails = {
  id: '1',
  isLive: true,
  name: 'testName',
  createdAt: '2022-09-19T16:24:35.367322Z',
  status: 'enabled',
  url: 'http://proxy.acmebank.com',
  method: 'POST',
  deactivatedAt: null,
  clientCertificate: null,
  accessReason: 'checking customer data',
  headers: [],
  ingressContentType: 'json',
  ingressRules: [],
  pinnedServerCertificates: ['test'],
  secretHeaders: [],
};
