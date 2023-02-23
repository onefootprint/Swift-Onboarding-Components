import { mockRequest } from '@onefootprint/test-utils';
import { ProxyConfig } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const proxyConfigsFixture: ProxyConfig[] = [
  {
    id: 'proxy_id_NKT7DsRti47gM7eqYEJ7gy',
    isLive: true,
    name: 'My first proxy config',
    createdAt: '2023-02-23T14:08:58.519954Z',
    url: 'http://localhost:8080/',
    method: 'POST',
    clientCertificate: null,
    ingressContentType: 'json',
    accessReason: 'Generate credit card number for user.',
  },
];

export const withProxyConfigs = (
  proxyConfigs: ProxyConfig[] = proxyConfigsFixture,
) =>
  mockRequest({
    method: 'get',
    path: '/org/proxy_configs',
    response: proxyConfigs,
  });

export const withProxyConfigsError = () =>
  mockRequest({
    method: 'get',
    path: '/org/proxy_configs',
    statusCode: 400,
    response: {
      error: {
        message: 'Something went wrong',
      },
    },
  });
