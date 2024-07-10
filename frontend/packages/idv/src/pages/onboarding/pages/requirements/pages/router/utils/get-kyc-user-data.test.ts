import { BusinessDI, IdDI } from '@onefootprint/types';
import { filterBusinessData, filterUserData } from './get-kyc-user-data';

jest.mock('../../../../../../../utils/logger', () => ({
  __esModule: true,
  default: () => undefined,
  getLogger: () => ({
    logError: () => undefined,
    logInfo: () => undefined,
    logTrack: () => undefined,
    logWarn: () => undefined,
  }),
}));

describe('filterUserData', () => {
  it('should return filtered data when data contains only keys of the IdDI enum', () => {
    const data = {
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: 'john.doe@example.com', isBootstrap: true },
      // biome-ignore lint/complexity/useLiteralKeys: Property 'banana' does not exist on type 'UserData'.
      ['banana']: { value: 'yellow', isBootstrap: true },
      [BusinessDI.addressLine1]: { value: '1st Street', isBootstrap: true },
    };
    const filteredData = filterUserData(data);
    expect(filteredData).toEqual({
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: 'john.doe@example.com', isBootstrap: true },
    });
  });

  it('should return empty object when data is empty', () => {
    const data = {};
    const filteredData = filterUserData(data);
    expect(filteredData).toEqual({});
  });
});

describe('filterBusinessData', () => {
  it('should return filtered data when data contains only keys of the BusinessDI enum', () => {
    const data = {
      [IdDI.firstName]: { value: 'John', isBootstrap: true },
      [IdDI.lastName]: { value: 'Doe', isBootstrap: true },
      [IdDI.email]: { value: 'john.doe@example.com', isBootstrap: true },
      // biome-ignore lint/complexity/useLiteralKeys: Property 'banana' does not exist on type 'UserData'.
      ['banana']: { value: 'yellow', isBootstrap: true },
      [BusinessDI.addressLine1]: { value: '1st Street', isBootstrap: true },
    };
    const filteredData = filterBusinessData(data);
    expect(filteredData).toEqual({
      [BusinessDI.addressLine1]: { value: '1st Street', isBootstrap: true },
    });
  });

  it('should return empty object when data is empty', () => {
    const data = {};
    const filteredData = filterBusinessData(data);
    expect(filteredData).toEqual({});
  });
});
