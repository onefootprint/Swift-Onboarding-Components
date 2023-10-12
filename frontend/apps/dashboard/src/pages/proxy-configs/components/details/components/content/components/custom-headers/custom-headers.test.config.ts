import type { ProxyConfigDetails } from '@onefootprint/types';

export const configWithoutHeaders: ProxyConfigDetails = {
  accessReason: 'Lorem',
  clientCertificate: null,
  createdAt: '2023-09-01T12:22:44.696145Z',
  deactivatedAt: null,
  headers: [],
  id: 'proxy_id_2d2BZOL3nhdfV9ec7Uesyu',
  ingressContentType: 'json',
  ingressRules: [{ token: 'custom.bank', target: 'bank.account_number' }],
  isLive: false,
  method: 'POST',
  name: 'Lorem',
  pinnedServerCertificates: [],
  secretHeaders: [],
  status: 'enabled',
  url: 'https://acme.com/',
};

export const configWithHeaders: ProxyConfigDetails = {
  ...configWithoutHeaders,
  headers: [{ name: 'header-name', value: 'header-value' }],
};
