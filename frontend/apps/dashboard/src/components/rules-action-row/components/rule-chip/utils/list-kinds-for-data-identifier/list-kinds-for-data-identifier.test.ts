import { BusinessDI, IdDI, ListKind } from '@onefootprint/types';

import listKindsForDataIdentifier from './list-kinds-for-data-identifier';

describe('listKindsForDataIdentifier', () => {
  describe('when no DI is inputted', () => {
    it('should return all kinds', () => {
      expect(listKindsForDataIdentifier()).toEqual([
        'email_address',
        'email_domain',
        'ssn9',
        'phone_number',
        'phone_country_code',
      ]);
    });
  });

  describe('when id.email is inputted', () => {
    it('should return ListKind.emailAddress', () => {
      expect(listKindsForDataIdentifier(IdDI.email)).toEqual([
        ListKind.emailDomain,
        ListKind.emailAddress,
      ]);
    });
  });

  describe('when id.ssn9 is inputted', () => {
    it('should return ListKind.ssn9', () => {
      expect(listKindsForDataIdentifier(IdDI.ssn9)).toEqual([ListKind.ssn9]);
    });
  });

  describe('when IdDI.phoneNumber is inputted', () => {
    it('should return ListKind.phoneNumber and ListKind.phoneCountryCode', () => {
      expect(listKindsForDataIdentifier(IdDI.phoneNumber)).toEqual([
        ListKind.phoneCountryCode,
        ListKind.phoneNumber,
      ]);
    });
  });

  describe('when BusinessDI.phoneNumber is inputted', () => {
    it('should return ListKind.phoneNumber and ListKind.phoneCountryCode', () => {
      expect(listKindsForDataIdentifier(BusinessDI.phoneNumber)).toEqual([
        ListKind.phoneCountryCode,
        ListKind.phoneNumber,
      ]);
    });
  });
});
