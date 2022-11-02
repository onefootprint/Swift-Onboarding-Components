import { UserDataAttribute } from '@onefootprint/types';

import getFullNameDataValue from './get-full-name-data';

describe('getFullNameData', () => {
  describe('when both first name and last name are non-empty strings', () => {
    it('should show full name', () => {
      const fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
        },
      });
      expect(fullName).toEqual('Piip Footprint');
    });
  });

  describe('when both first name and last name are encrypted', () => {
    it('should show an encrypted full name', () => {
      const fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: null,
          [UserDataAttribute.lastName]: null,
        },
      });
      expect(fullName).toEqual(null);
    });
  });

  describe('when one of the fields are encrypted', () => {
    it('should show only the available name', () => {
      let fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: null,
        },
      });
      expect(fullName).toEqual('Piip');

      fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: null,
          [UserDataAttribute.lastName]: 'Footprint',
        },
      });
      expect(fullName).toEqual('Footprint');
    });
  });

  describe('when both fields are omitted from kycData', () => {
    it('should have undefined value', () => {
      const fullName = getFullNameDataValue({
        kycData: {},
      });
      expect(fullName).toEqual(undefined);
    });
  });

  describe('when one of the fields are omitted from kycData', () => {
    it('should show the available name', () => {
      let fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
        },
      });
      expect(fullName).toEqual('Piip');

      fullName = getFullNameDataValue({
        kycData: {
          [UserDataAttribute.firstName]: null,
        },
      });
      expect(fullName).toEqual(null);
    });
  });
});
