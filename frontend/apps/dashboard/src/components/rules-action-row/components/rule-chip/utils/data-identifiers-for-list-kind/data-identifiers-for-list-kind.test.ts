import {
  BusinessDI,
  DataIdentifierKeys,
  IdDI,
  ListKind,
} from '@onefootprint/types';

import dataIdentifiersForListKind from './data-identifiers-for-list-kind';

describe('dataIdentifiersForListKind', () => {
  describe('when no ListKind is inputted', () => {
    it('should return all DIs', () => {
      expect(dataIdentifiersForListKind()).toEqual(DataIdentifierKeys);
      expect(dataIdentifiersForListKind(undefined)).toEqual(DataIdentifierKeys);
    });
  });

  describe('when ListKind.emailAddress is inputted', () => {
    it('should return id.email', () => {
      expect(dataIdentifiersForListKind(ListKind.emailAddress)).toEqual([
        IdDI.email,
      ]);
    });
  });

  describe('when ListKind.email_domain is inputted', () => {
    it('should return id.email', () => {
      expect(dataIdentifiersForListKind(ListKind.emailDomain)).toEqual([
        IdDI.email,
      ]);
    });
  });

  describe('when ListKind.ssn9 is inputted', () => {
    it('should return id.ssn9', () => {
      expect(dataIdentifiersForListKind(ListKind.ssn9)).toEqual([IdDI.ssn9]);
    });
  });

  describe('when ListKind.phoneNumber is inputted', () => {
    it('should return id.phone_number and business.phone_number', () => {
      expect(dataIdentifiersForListKind(ListKind.phoneNumber)).toEqual([
        IdDI.phoneNumber,
        BusinessDI.phoneNumber,
      ]);
    });
  });

  describe('when ListKind.phoneCountryCode is inputted', () => {
    it('should return id.phone_number and business.phone_number', () => {
      expect(dataIdentifiersForListKind(ListKind.phoneCountryCode)).toEqual([
        IdDI.phoneNumber,
        BusinessDI.phoneNumber,
      ]);
    });
  });

  describe('when ListKind.ipAddress is inputted', () => {
    it('should return id.phone_number', () => {
      expect(dataIdentifiersForListKind(ListKind.ipAddress)).toEqual([]);
    });
  });
});
