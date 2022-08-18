import { UserDataAttribute } from '../../types';
import { States } from '../types';
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
        isMissingBasicAttribute([UserDataAttribute.city], {
          [UserDataAttribute.city]: 'Antalya',
        }),
      ).toEqual(false);
      expect(
        isMissingBasicAttribute(
          [UserDataAttribute.firstName, UserDataAttribute.city],
          { [UserDataAttribute.firstName]: 'Belce' },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the basic attributes', () => {
      expect(
        isMissingResidentialAttribute(
          [UserDataAttribute.firstName, UserDataAttribute.city],
          {
            [UserDataAttribute.firstName]: undefined,
          },
        ),
      ).toEqual(true);
      expect(
        isMissingBasicAttribute(
          [UserDataAttribute.firstName, UserDataAttribute.city],
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
        isMissingResidentialAttribute([UserDataAttribute.city], {}),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute([UserDataAttribute.city], {
          [UserDataAttribute.city]: 'Eskisehir',
        }),
      ).toEqual(false);
      expect(
        isMissingResidentialAttribute(
          [UserDataAttribute.city, UserDataAttribute.zip],
          {
            [UserDataAttribute.city]: 'Eskisehir',
            [UserDataAttribute.zip]: '94107',
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the residential attributes', () => {
      expect(
        isMissingResidentialAttribute([UserDataAttribute.city], {
          [UserDataAttribute.city]: undefined,
        }),
      ).toEqual(true);
      expect(
        isMissingResidentialAttribute(
          [UserDataAttribute.firstName, UserDataAttribute.country],
          {
            [UserDataAttribute.city]: 'Bodrum',
          },
        ),
      ).toEqual(true);
    });
  });

  describe('isMissingSsnAttribute', () => {
    it('should return false if missing attributes array is empty', () => {
      expect(isMissingSsnAttribute([], {})).toEqual(false);
    });

    it('should return false if the user has SSN', () => {
      expect(
        isMissingSsnAttribute([UserDataAttribute.ssn9], {
          [UserDataAttribute.ssn9]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return false if the user has last 4 digits of SSN', () => {
      expect(
        isMissingSsnAttribute([UserDataAttribute.ssn4], {
          [UserDataAttribute.ssn4]: '000000',
        }),
      ).toEqual(false);
    });

    it('should return true if the user does not have the SSN', () => {
      expect(isMissingSsnAttribute([UserDataAttribute.ssn9], {})).toEqual(true);
      expect(isMissingSsnAttribute([UserDataAttribute.ssn4], {})).toEqual(true);
      expect(
        isMissingSsnAttribute([UserDataAttribute.ssn4], {
          [UserDataAttribute.ssn9]: '0000000',
        }),
      ).toEqual(true);
      expect(
        isMissingSsnAttribute([UserDataAttribute.ssn9], {
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
          [UserDataAttribute.firstName, UserDataAttribute.country],
          {
            [UserDataAttribute.firstName]: 'Belce',
            [UserDataAttribute.country]: 'TR',
          },
        ),
      ).toEqual(false);
    });

    it('should return true if the user is missing any of the missing attributes', () => {
      expect(
        hasMissingAttributes(
          [UserDataAttribute.firstName, UserDataAttribute.country],
          {
            [UserDataAttribute.city]: 'Izmir',
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
        getMaxStepFromMissingAttributes([UserDataAttribute.firstName]),
      ).toEqual(1);

      expect(
        getMaxStepFromMissingAttributes([
          UserDataAttribute.firstName,
          UserDataAttribute.lastName,
        ]),
      ).toEqual(1);

      expect(
        getMaxStepFromMissingAttributes([
          UserDataAttribute.firstName,
          UserDataAttribute.ssn9,
        ]),
      ).toEqual(2);

      expect(
        getMaxStepFromMissingAttributes([
          UserDataAttribute.firstName,
          UserDataAttribute.city,
        ]),
      ).toEqual(2);

      expect(
        getMaxStepFromMissingAttributes([
          UserDataAttribute.firstName,
          UserDataAttribute.city,
          UserDataAttribute.ssn9,
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
          [UserDataAttribute.city],
          States.residentialAddress,
        ),
      ).toEqual(1);
    });

    it('calculates correctly with multiple missing attributes and pages', () => {
      expect(
        getCurrentStepFromMissingAttributes(
          [UserDataAttribute.firstName, UserDataAttribute.city],
          States.basicInformation,
        ),
      ).toEqual(1);

      expect(
        getCurrentStepFromMissingAttributes(
          [UserDataAttribute.firstName, UserDataAttribute.city],
          States.residentialAddress,
        ),
      ).toEqual(2);
    });
  });
});
