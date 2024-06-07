import type { Entity } from '@onefootprint/types';
import { BusinessDI, EntityKind, IdDI, ListKind } from '@onefootprint/types';

import getEntityDataForListKind from './get-attribute-for-list-kind';

describe('getEntityDataForListKind', () => {
  it('should return email address', () => {
    const entity = {
      kind: EntityKind.person,
      decryptableAttributes: [IdDI.email, IdDI.phoneNumber],
    } as Entity;
    expect(getEntityDataForListKind(ListKind.emailAddress, entity)).toEqual(IdDI.email);
    expect(getEntityDataForListKind(ListKind.emailDomain, entity)).toEqual(IdDI.email);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, entity)).toEqual(IdDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.phoneNumber, entity)).toEqual(IdDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.ssn9, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });

  it('should return phone number', () => {
    const businessEntity = {
      kind: EntityKind.business,
      decryptableAttributes: [BusinessDI.phoneNumber],
    } as Entity;
    expect(getEntityDataForListKind(ListKind.emailAddress, businessEntity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.emailDomain, businessEntity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneNumber, businessEntity)).toEqual(BusinessDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, businessEntity)).toEqual(BusinessDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.ssn9, businessEntity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.ipAddress, businessEntity)).toEqual(undefined);

    const userEntity = {
      kind: EntityKind.person,
      decryptableAttributes: [IdDI.phoneNumber, IdDI.ssn9],
    } as Entity;
    expect(getEntityDataForListKind(ListKind.emailAddress, userEntity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.emailDomain, userEntity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneNumber, userEntity)).toEqual(IdDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, userEntity)).toEqual(IdDI.phoneNumber);
    expect(getEntityDataForListKind(ListKind.ssn9, userEntity)).toEqual(IdDI.ssn9);
    expect(getEntityDataForListKind(ListKind.ipAddress, userEntity)).toEqual(undefined);
  });

  it('should return ssn9', () => {
    const entity = {
      kind: EntityKind.person,
      decryptableAttributes: [IdDI.ssn9],
    } as Entity;
    expect(getEntityDataForListKind(ListKind.emailAddress, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.emailDomain, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneNumber, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.ssn9, entity)).toEqual(IdDI.ssn9);
    expect(getEntityDataForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });

  it('should return ip addresses', () => {
    const entity = {
      kind: EntityKind.person,
      decryptableAttributes: [IdDI.ssn9],
    } as Entity;
    expect(getEntityDataForListKind(ListKind.emailAddress, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.emailDomain, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneNumber, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.phoneCountryCode, entity)).toEqual(undefined);
    expect(getEntityDataForListKind(ListKind.ssn9, entity)).toEqual(IdDI.ssn9);
    expect(getEntityDataForListKind(ListKind.ipAddress, entity)).toEqual(undefined);
  });
});
