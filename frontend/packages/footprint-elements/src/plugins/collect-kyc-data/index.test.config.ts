import { mockRequest } from '@onefootprint/test-utils';
import * as footprint from 'src/components/footprint-provider';

export const withUserVaultValidate = () => {
  mockRequest({
    method: 'post',
    path: '/hosted/user/vault/validate',
    response: {
      data: {
        data: 'success',
      },
    },
  });
};

export const withUserVault = () =>
  mockRequest({
    method: 'put',
    path: '/hosted/user/vault',
    response: {
      data: {
        data: 'success',
      },
    },
  });

// This needs to be mocked here and in the test itself as it is a esModule
jest.mock('src/components/footprint-provider', () => ({
  __esModule: true,
  ...jest.requireActual('src/components/footprint-provider'),
}));

const mockUseFootprintProvider = () =>
  jest.spyOn(footprint, 'useFootprintProvider').mockImplementation(() => ({
    cancel: jest.fn(),
    close: jest.fn(),
    complete: jest.fn(),
    on: jest.fn(),
    load: jest.fn(),
  }));

export default mockUseFootprintProvider;
