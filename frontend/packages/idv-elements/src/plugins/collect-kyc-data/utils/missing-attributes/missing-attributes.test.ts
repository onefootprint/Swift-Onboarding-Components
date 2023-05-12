import { CollectedKycDataOption, IdDI } from '@onefootprint/types';

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
          [IdDI.city]: { value: 'Enclave' },
        }),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {
            [IdDI.firstName]: { value: 'Belce' },
            [IdDI.lastName]: { value: 'Dogru' },
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the basic attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {},
        ),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.name, CollectedKycDataOption.partialAddress],
          {
            [IdDI.firstName]: { value: 'Belce' },
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
          [IdDI.zip]: { value: '94117' },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.fullAddress], {
          [IdDI.addressLine1]: { value: '94117' },
          [IdDI.city]: { value: 'Enclave' },
          [IdDI.state]: { value: 'NY' },
          [IdDI.zip]: { value: '94117' },
          [IdDI.country]: { value: 'US' },
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
          [IdDI.zip]: { value: '94107' },
          [IdDI.country]: { value: 'US' },
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedKycDataOption.partialAddress], {
          [IdDI.zip]: { value: '94117' },
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedKycDataOption.dob, CollectedKycDataOption.partialAddress],
          {
            [IdDI.zip]: { value: '94117' },
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
          [IdDI.ssn9]: { value: '000000' },
        }),
      ).toEqual(false);
    });

    it('should return false if the user has last 4 digits of SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn4], {
          [IdDI.ssn4]: { value: '000000' },
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
          [IdDI.ssn9]: { value: '0000000' },
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedKycDataOption.ssn9], {
          [IdDI.ssn4]: { value: '0000' },
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
            [IdDI.firstName]: { value: 'Belce' },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.ssn4]: { value: '0000' },
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
            [IdDI.firstName]: { value: 'Belce' },
            [IdDI.lastName]: { value: 'Dogru' },
            [IdDI.ssn4]: { value: '0000' },
          },
        ),
      ).toEqual(true);
    });
  });
});
