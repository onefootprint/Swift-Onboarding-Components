import type { Entity } from '@onefootprint/types';
import { BusinessDI, IdDI, ListKind } from '@onefootprint/types';

import hasDataForListKind from './has-data-for-list-kind';

describe('hasDataForListKind', () => {
  it('should return true for email address', () => {
    const entity = {
      decryptedAttributes: {
        [IdDI.email]: 'piip@onefootprint.com',
      },
      decryptableAttributes: [IdDI.email],
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
      decryptedAttributes: {
        [IdDI.phoneNumber]: '+16504444440',
      },
      decryptableAttributes: [IdDI.phoneNumber],
      workflows: [],
    } as unknown as Entity;

    expect(hasDataForListKind(ListKind.emailAddress, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.emailDomain, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.phoneCountryCode, userEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.phoneNumber, userEntity)).toBe(true);
    expect(hasDataForListKind(ListKind.ssn9, userEntity)).toBe(false);
    expect(hasDataForListKind(ListKind.ipAddress, userEntity)).toBe(false);

    const businessEntity = {
      decryptedAttributes: {
        [BusinessDI.phoneNumber]: '+16504444440',
      },
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
      decryptedAttributes: {
        [IdDI.ssn9]: '123456789',
      },
      decryptableAttributes: [IdDI.ssn9],
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
      decryptedAttributes: {},
      decryptableAttributes: [],
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
