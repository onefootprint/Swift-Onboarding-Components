import { mockRequest } from '@onefootprint/test-utils';
import type { GetClientSecurityResponse } from '@onefootprint/types';
import { asAdminUser, resetUser } from 'src/config/tests';

beforeEach(() => {
  asAdminUser();
});

afterAll(() => {
  resetUser();
});

export const allowedDomainsFixture: GetClientSecurityResponse = {
  allowedOrigins: ['https://www.onefootprint.com', 'https://www.acme.com'],
  isLive: true,
};

export const allowedDomainsEmptyFixture: GetClientSecurityResponse = {
  allowedOrigins: [],
  isLive: true,
};

export const withAllowedDomains = (response = allowedDomainsFixture) => {
  mockRequest({
    method: 'get',
    path: '/org/client_security_config',
    response,
  });
};

export const withAllowedDomainsError = () => {
  mockRequest({
    method: 'get',
    path: '/org/client_security_config',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

export const withEmptyAllowedDomains = () => {
  mockRequest({
    method: 'get',
    path: '/org/client_security_config',
    response: allowedDomainsEmptyFixture,
  });
};

export const withUpdateAllowedDomainError = () => {
  mockRequest({
    method: 'patch',
    path: '/org/client_security_config',
    statusCode: 400,
    response: {
      message: 'Something went wrong',
    },
  });
};

export const withUpdateAllowedDomain = () => {
  mockRequest({
    method: 'patch',
    path: '/org/client_security_config',
    response: allowedDomainsEmptyFixture,
  });
};
