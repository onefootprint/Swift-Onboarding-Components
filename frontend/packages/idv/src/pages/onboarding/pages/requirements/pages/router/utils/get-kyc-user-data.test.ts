import {
  BootstrapOnlyBusinessPrimaryOwnerStake,
  BootstrapOnlyBusinessSecondaryOwnersKey,
  BusinessDI,
  IdDI,
} from '@onefootprint/types';
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

  it('should reject non-objects', () => {
    // @ts-expect-error: Array is not a valid Object
    expect(filterUserData([])).toEqual({});
    // @ts-expect-error: Number is not a valid Object
    expect(filterUserData(1)).toEqual({});
    // @ts-expect-error: Symbol is not a valid Object
    expect(filterUserData(Symbol('banana'))).toEqual({});
    // @ts-expect-error: Map is not a valid Object
    expect(filterUserData(new Map())).toEqual({});
    // @ts-expect-error: Set is not a valid Object
    expect(filterUserData(new Set())).toEqual({});
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

  it('should filter out formation_date, formation_state, beneficial_owners, kyced_beneficial_owners', () => {
    const data = {
      [BusinessDI.corporationType]: { value: 'unknown', isBootstrap: true },
      [BusinessDI.formationDate]: { value: '1999-12-25', isBootstrap: true },
      [BusinessDI.formationState]: { value: 'MA', isBootstrap: true },
      [BusinessDI.beneficialOwners]: {
        value: [
          {
            first_name: 'Jane',
            middle_name: 'Samantha',
            last_name: 'Doe',
            email: 'jane.doe@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
      [BusinessDI.kycedBeneficialOwners]: {
        value: [
          {
            first_name: 'Jane',
            middle_name: 'Samantha',
            last_name: 'Doe',
            email: 'jane.doe@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
    };

    // @ts-expect-error: Property 'formation_date' and other were removed from the static types
    const filteredData = filterBusinessData(data);
    expect(filteredData).toEqual({ [BusinessDI.corporationType]: { value: 'unknown', isBootstrap: true } });
  });

  it('should allow business.secondary_owners', () => {
    const data = {
      [BusinessDI.formationDate]: { value: '1999-12-25', isBootstrap: true },
      [BusinessDI.formationState]: { value: 'MA', isBootstrap: true },
      [BootstrapOnlyBusinessPrimaryOwnerStake]: { value: 20, isBootstrap: true },
      [BootstrapOnlyBusinessSecondaryOwnersKey]: {
        value: [
          {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
    };

    // @ts-expect-error: Property 'formation_date' and other were removed from the static types
    const filteredData = filterBusinessData(data);
    expect(filteredData).toEqual({
      [BootstrapOnlyBusinessPrimaryOwnerStake]: { value: 20, isBootstrap: true },
      [BootstrapOnlyBusinessSecondaryOwnersKey]: {
        value: [
          {
            first_name: 'Jane',
            last_name: 'Doe',
            email: 'jane.doe@acme.com',
            phone_number: '+12025550179',
            ownership_stake: 50,
          },
        ],
        isBootstrap: true,
      },
    });
  });

  it('should reject non-objects', () => {
    // @ts-expect-error: Array is not a valid Object
    expect(filterBusinessData([])).toEqual({});
    // @ts-expect-error: Number is not a valid Object
    expect(filterBusinessData(1)).toEqual({});
    // @ts-expect-error: Symbol is not a valid Object
    expect(filterBusinessData(Symbol('banana'))).toEqual({});
    // @ts-expect-error: Map is not a valid Object
    expect(filterBusinessData(new Map())).toEqual({});
    // @ts-expect-error: Set is not a valid Object
    expect(filterBusinessData(new Set())).toEqual({});
  });
});
