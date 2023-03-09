import { CollectedKycDataOption, UserDataAttribute } from '@onefootprint/types';

import {
  hasMissingAttributes,
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from './missing-attributes';

describe('MissingAttributesUtils', () => {
  describe('isMissingBasicAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingBasicAttribute([], {})).toEqual(false);
    });

    it('should return false if the user has the missing basic attributes', () => {
      expect(
        isMissingBasicAttribute([CollectedKycDataOption.partialAddress]),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute([CollectedKycDataOption.partialAddress], {
          [UserDataAttribute.city]: 'Enclave',
        }),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.lastName]: 'Dogru',
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the basic attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {
            [UserDataAttribute.firstName]: undefined,
          },
        ),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {
            [UserDataAttribute.firstName]: 'Belce',
          },
        ),
      ).toEqual(true);
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {},
        ),
      ).toEqual(true);
    });
  });

  describe('isMissingResidentialAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingResidentialAttribute([], {})).toEqual(false);
    });

    it('should return false if the user has the missing residential attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [
            CollectedKycDataOption.name,
            CollectedKycDataOption.dob,
            CollectedKycDataOption.ssn4,
          ],
          {},
        ),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.partialAddress], {
          [UserDataAttribute.zip]: '94117',
          [UserDataAttribute.country]: 'US',
        }),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [UserDataAttribute.addressLine1]: '94117',
          [UserDataAttribute.addressLine2]: undefined,
          [UserDataAttribute.city]: 'Enclave',
          [UserDataAttribute.state]: 'NY',
          [UserDataAttribute.zip]: '94117',
          [UserDataAttribute.country]: 'US',
        }),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the residential attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.partialAddress],
          {},
        ),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [UserDataAttribute.zip]: '94107',
          [UserDataAttribute.country]: 'US',
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.partialAddress], {
          [UserDataAttribute.zip]: '94117',
          [UserDataAttribute.country]: undefined,
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.dob, CollectedKycDataOption.partialAddress],
          {
            [UserDataAttribute.zip]: '94117',
            [UserDataAttribute.country]: undefined,
          },
        ),
      ).toEqual(true);
    });
  });

  describe('isMissingSsnAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingSsnAttribute([], {})).toEqual(false);
      expect(isMissingSsnAttribute([CollectedKycDataOption.dob], {})).toEqual(
        false,
      );
    });

    it('should return false if the user has SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [UserDataAttribute.ssn9]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return false if the user has last 4 digits of SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [UserDataAttribute.ssn4]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return true if the user does not have the SSN', () => {
      expect(isMissingSsnAttribute([CollectedKycDataOption.ssn9], {})).toEqual(
        true,
      );
      expect(isMissingSsnAttribute([CollectedKycDataOption.ssn4], {})).toEqual(
        true,
      );
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [UserDataAttribute.ssn9]: '0000000',
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [UserDataAttribute.ssn4]: '0000',
        }),
      ).toEqual(true);
    });
  });

  describe('hasMissingAttributes', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(hasMissingAttributes([], {})).toEqual(false);
    });

    it('should return false if the user has all the missing attributes', () => {
      expect(
        hasMissingAttributes(
          [CollectedKycDataOption.name, CollectedKycDataOption.ssn4],
          {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.lastName]: 'Dogru',
            [UserDataAttribute.ssn4]: '0000',
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the missing attributes', () => {
      expect(
        hasMissingAttributes(
          [
            CollectedKycDataOption.name,
            CollectedKycDataOption.ssn4,
            CollectedKycDataOption.fullAddress,
          ],
          {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.lastName]: 'Dogru',
            [UserDataAttribute.ssn4]: '0000',
          },
        ),
      ).toEqual(true);
    });
  });
});
