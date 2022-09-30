import { CollectedDataOption, UserDataAttribute } from '@onefootprint/types';

import { States } from '../state-machine/types';
import {
  getCurrentStepFromMissingAttributes,
  getMaxStepFromMissingAttributes,
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
        isMissingBasicAttribute([CollectedDataOption.partialAddress]),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute([CollectedDataOption.partialAddress], {
          [UserDataAttribute.city]: 'Enclave',
        }),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute(
          [CollectedDataOption.name, CollectedDataOption.partialAddress],
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
          [CollectedDataOption.name, CollectedDataOption.partialAddress],
          {
            [UserDataAttribute.firstName]: undefined,
          },
        ),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedDataOption.name, CollectedDataOption.partialAddress],
          {
            [UserDataAttribute.firstName]: 'Belce',
          },
        ),
      ).toEqual(true);
      expect(
        isMissingBasicAttribute(
          [CollectedDataOption.name, CollectedDataOption.partialAddress],
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
            CollectedDataOption.name,
            CollectedDataOption.dob,
            CollectedDataOption.ssn4,
          ],
          {},
        ),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedDataOption.partialAddress], {
          [UserDataAttribute.zip]: '94117',
          [UserDataAttribute.country]: 'US',
        }),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute([CollectedDataOption.fullAddress], {
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
        isMissingResidentialAttribute([CollectedDataOption.partialAddress], {}),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedDataOption.fullAddress], {
          [UserDataAttribute.zip]: '94107',
          [UserDataAttribute.country]: 'US',
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([CollectedDataOption.partialAddress], {
          [UserDataAttribute.zip]: '94117',
          [UserDataAttribute.country]: undefined,
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [CollectedDataOption.dob, CollectedDataOption.partialAddress],
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
      expect(isMissingSsnAttribute([CollectedDataOption.dob], {})).toEqual(
        false,
      );
    });

    it('should return false if the user has SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedDataOption.ssn9], {
          [UserDataAttribute.ssn9]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return false if the user has last 4 digits of SSN', () => {
      expect(
        isMissingSsnAttribute([CollectedDataOption.ssn4], {
          [UserDataAttribute.ssn4]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return true if the user does not have the SSN', () => {
      expect(isMissingSsnAttribute([CollectedDataOption.ssn9], {})).toEqual(
        true,
      );
      expect(isMissingSsnAttribute([CollectedDataOption.ssn4], {})).toEqual(
        true,
      );
      expect(
        isMissingSsnAttribute([CollectedDataOption.ssn4], {
          [UserDataAttribute.ssn9]: '0000000',
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([CollectedDataOption.ssn9], {
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
          [CollectedDataOption.name, CollectedDataOption.ssn4],
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
            CollectedDataOption.name,
            CollectedDataOption.ssn4,
            CollectedDataOption.fullAddress,
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

  describe('getMaxStepFromMissingAttributes', () => {
    it('returns 0 when there are no missing attributes', () => {
      expect(getMaxStepFromMissingAttributes([])).toEqual(0);
    });

    it('returns correct max step', () => {
      expect(
        getMaxStepFromMissingAttributes([CollectedDataOption.name]),
      ).toEqual(1);

      expect(
        getMaxStepFromMissingAttributes([
          CollectedDataOption.name,
          CollectedDataOption.dob,
        ]),
      ).toEqual(1);

      expect(
        getMaxStepFromMissingAttributes([
          CollectedDataOption.name,
          CollectedDataOption.ssn9,
        ]),
      ).toEqual(2);

      expect(
        getMaxStepFromMissingAttributes([
          CollectedDataOption.name,
          CollectedDataOption.partialAddress,
        ]),
      ).toEqual(2);

      expect(
        getMaxStepFromMissingAttributes([
          CollectedDataOption.name,
          CollectedDataOption.fullAddress,
          CollectedDataOption.ssn9,
        ]),
      ).toEqual(3);
    });
  });

  describe('getCurrentStepFromMissingAttributes', () => {
    it('returns 0 when there are no missing attributes', () => {
      expect(
        getCurrentStepFromMissingAttributes([], States.basicInformation),
      ).toEqual(0);
    });

    it('returns 1 if showing the page with only missing attribute', () => {
      expect(
        getCurrentStepFromMissingAttributes(
          [CollectedDataOption.partialAddress],
          States.residentialAddress,
        ),
      ).toEqual(1);
    });

    it('calculates correctly with multiple missing attributes and pages', () => {
      expect(
        getCurrentStepFromMissingAttributes(
          [CollectedDataOption.name, CollectedDataOption.fullAddress],
          States.basicInformation,
        ),
      ).toEqual(1);

      expect(
        getCurrentStepFromMissingAttributes(
          [CollectedDataOption.dob, CollectedDataOption.fullAddress],
          States.residentialAddress,
        ),
      ).toEqual(2);
    });
  });
});
