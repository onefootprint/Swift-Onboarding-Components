import type { Attribute, Entity } from '@onefootprint/types';
import { BusinessDI, DataKind, EntityKind, IdDI, ListKind } from '@onefootprint/types';

import hasDataForListKind from './has-data-for-list-kind';

describe('hasDataForListKind', () => {
  const defaultAttribute: Omit<Attribute, 'identifier'> = {
    source: 'test',
    dataKind: DataKind.vaultData,
    value: 'test-value',
    transforms: {},
    isDecryptable: true,
  };

  it('should return true for email address', () => {
    const entity = {
      data: [{ ...defaultAttribute, identifier: IdDI.email, value: 'testemail@gmail.com' }],
      workflows: [],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, entity)).toBe(true);
    expect(hasDataForListKind(ListKind.emailDomain, entity)).toBe(true);
    expect(hasDataForListKind(ListKind.phoneCountryCode, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneNumber, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.ssn9, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.ipAddress, entity)).toBe(false);
  });

  it('should return true for phone number', () => {
    const userEntity = {
      kind: EntityKind.person,
      data: [{ ...defaultAttribute, identifier: IdDI.phoneNumber, isDecryptable: true }],
      workflows: [],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.emailDomain, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneCountryCode, userEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.phoneNumber, userEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.ssn9, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.ipAddress, userEntity)).toBe(false);

    const businessEntity = {
      data: [{ ...defaultAttribute, identifier: BusinessDI.phoneNumber }],
      decryptableAttributes: [BusinessDI.phoneNumber],
      workflows: [],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, businessEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.emailDomain, businessEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneCountryCode, businessEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.phoneNumber, businessEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.ssn9, businessEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.ipAddress, businessEntity)).toBe(false);
  });

  it('should return true for ssn9', () => {
    const entity = {
      data: [{ ...defaultAttribute, identifier: IdDI.ssn9, isDecryptable: true }],
      workflows: [],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.emailDomain, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneCountryCode, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneNumber, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.ssn9, entity)).toBe(true);
    expect(hasDataForListKind(ListKind.ipAddress, entity)).toBe(false);
  });

  it('should return true for ip address', () => {
    const entity = {
      data: [],
      workflows: [
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
      ],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.emailDomain, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneCountryCode, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneNumber, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.ssn9, entity)).toBe(false);
    expect(hasDataForListKind(ListKind.ipAddress, entity)).toBe(true);
  });
});
