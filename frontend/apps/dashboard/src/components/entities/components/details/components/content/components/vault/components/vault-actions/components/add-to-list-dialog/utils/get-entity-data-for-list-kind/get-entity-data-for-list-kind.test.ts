import type { EntityWorkflow } from '@onefootprint/types';
import { BusinessDI, EntityKind, IdDI, ListKind } from '@onefootprint/types';

import getEntityDataForListKind from './get-entity-data-for-list-kind';

describe('getEntityDataForListKind', () => {
  it('should return email address', () => {
    const vaultData = {
      [IdDI.email]: 'piip@onefootprint.com',
    };
    expect(getEntityDataForListKind(ListKind.emailAddress, EntityKind.person, vaultData)).toEqual([
      'piip@onefootprint.com',
    ]);
    expect(getEntityDataForListKind(ListKind.emailDomain, EntityKind.person, vaultData)).toEqual(['onefootprint.com']);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneNumber, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ssn9, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ipAddress, EntityKind.person, vaultData)).toEqual([]);
  });

  it('should return phone number', () => {
    const vaultData = {
      [BusinessDI.phoneNumber]: '+16503434343',
    };
    expect(getEntityDataForListKind(ListKind.emailAddress, EntityKind.business, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.emailDomain, EntityKind.business, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneNumber, EntityKind.business, vaultData)).toEqual(['+16503434343']);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, EntityKind.business, vaultData)).toEqual(['1']);
    expect(getEntityDataForListKind(ListKind.ssn9, EntityKind.business, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ipAddress, EntityKind.business, vaultData)).toEqual([]);

    const userVaultData = {
      [IdDI.phoneNumber]: '+16503434343',
    };
    expect(getEntityDataForListKind(ListKind.emailAddress, EntityKind.person, userVaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.emailDomain, EntityKind.person, userVaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneNumber, EntityKind.person, userVaultData)).toEqual(['+16503434343']);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, EntityKind.person, userVaultData)).toEqual(['1']);
    expect(getEntityDataForListKind(ListKind.ssn9, EntityKind.person, userVaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ipAddress, EntityKind.person, userVaultData)).toEqual([]);
  });

  it('should return ssn9', () => {
    const vaultData = {
      [IdDI.ssn9]: '123456789',
    };
    expect(getEntityDataForListKind(ListKind.emailAddress, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.emailDomain, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneNumber, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, EntityKind.person, vaultData)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ssn9, EntityKind.person, vaultData)).toEqual(['123456789']);
    expect(getEntityDataForListKind(ListKind.ipAddress, EntityKind.person, vaultData)).toEqual([]);
  });

  it('should return ip addresses', () => {
    const workflows = [
      {
        insightEvent: [
          {
            ipAddress: '1.1.1.1',
          },
          {
            ipAddress: '2.2.2.2',
          },
        ],
      },
    ] as unknown as EntityWorkflow[];
    const vaultData = {};
    expect(getEntityDataForListKind(ListKind.emailAddress, EntityKind.person, vaultData, workflows)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.emailDomain, EntityKind.person, vaultData, workflows)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneNumber, EntityKind.person, vaultData, workflows)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, EntityKind.person, vaultData, workflows)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ssn9, EntityKind.person, vaultData, workflows)).toEqual([]);
    expect(getEntityDataForListKind(ListKind.ipAddress, EntityKind.person, vaultData, workflows)).toEqual([
      '1.1.1.1',
      '2.2.2.2',
    ]);
  });
});
