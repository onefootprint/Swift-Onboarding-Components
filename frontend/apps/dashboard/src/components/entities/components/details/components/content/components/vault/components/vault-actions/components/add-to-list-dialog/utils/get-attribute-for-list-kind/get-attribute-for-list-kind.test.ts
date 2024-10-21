import type { Attribute, Entity } from '@onefootprint/types';
import { BusinessDI, DataKind, EntityKind, IdDI, ListKind } from '@onefootprint/types';

import getAttributeForListKind from './get-attribute-for-list-kind';

describe('getAttributeForListKind', () => {
  const defaultAttribute: Omit<Attribute, 'identifier'> = {
    source: 'test',
    dataKind: DataKind.vaultData,
    value: 'test-value',
    transforms: {},
    isDecryptable: true,
  };

  it('should return email address', () => {
    const entity = {
      kind: EntityKind.person,
      data: [
        { ...defaultAttribute, identifier: IdDI.email },
        { ...defaultAttribute, identifier: IdDI.phoneNumber },
      ],
    } as Entity;
    expect(getAttributeForListKind(ListKind.emailAddress, entity)).toEqual(IdDI.email);
    expect(getAttributeForListKind(ListKind.emailDomain, entity)).toEqual(IdDI.email);
    expect(getAttributeForListKind(ListKind.phoneCountryCode, entity)).toEqual(IdDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.phoneNumber, entity)).toEqual(IdDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.ssn9, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });

  it('should return phone number', () => {
    const businessEntity = {
      kind: EntityKind.business,
      data: [{ ...defaultAttribute, identifier: BusinessDI.phoneNumber }],
    } as Entity;
    expect(getAttributeForListKind(ListKind.emailAddress, businessEntity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.emailDomain, businessEntity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneNumber, businessEntity)).toEqual(BusinessDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.phoneCountryCode, businessEntity)).toEqual(BusinessDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.ssn9, businessEntity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.ipAddress, businessEntity)).toEqual(undefined);

    const userEntity = {
      kind: EntityKind.person,
      data: [
        { ...defaultAttribute, identifier: IdDI.phoneNumber },
        { ...defaultAttribute, identifier: IdDI.ssn9 },
      ],
    } as Entity;
    expect(getAttributeForListKind(ListKind.emailAddress, userEntity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.emailDomain, userEntity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneNumber, userEntity)).toEqual(IdDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.phoneCountryCode, userEntity)).toEqual(IdDI.phoneNumber);
    expect(getAttributeForListKind(ListKind.ssn9, userEntity)).toEqual(IdDI.ssn9);
    expect(getAttributeForListKind(ListKind.ipAddress, userEntity)).toEqual(undefined);
  });

  it('should return ssn9', () => {
    const entity = {
      kind: EntityKind.person,
      data: [{ ...defaultAttribute, identifier: IdDI.ssn9 }],
    } as Entity;
    expect(getAttributeForListKind(ListKind.emailAddress, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.emailDomain, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneNumber, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneCountryCode, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.ssn9, entity)).toEqual(IdDI.ssn9);
    expect(getAttributeForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });

  it('should return undefined for ip addresses', () => {
    const entity = {
      kind: EntityKind.person,
      data: [{ ...defaultAttribute, identifier: IdDI.ssn9 }],
    } as Entity;
    expect(getAttributeForListKind(ListKind.emailAddress, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.emailDomain, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneNumber, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.phoneCountryCode, entity)).toEqual(undefined);
    expect(getAttributeForListKind(ListKind.ssn9, entity)).toEqual(IdDI.ssn9);
    expect(getAttributeForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });
});
