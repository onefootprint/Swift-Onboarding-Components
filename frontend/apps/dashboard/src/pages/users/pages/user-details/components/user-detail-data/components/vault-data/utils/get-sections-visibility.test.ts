import { UserDataAttribute } from '@onefootprint/types';
import { IdDocDataAttribute } from 'src/pages/users/types/vault-data.types';

import getSectionsVisibility from './get-sections-visibility';

describe('getSectionsVisibility', () => {
  describe('when only the basic info is visible', () => {
    it('should return sections visibility', () => {
      const sectionsVisibility = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
        },
      });
      expect(sectionsVisibility).toEqual({
        basicSection: true,
        identitySection: false,
        addressSection: false,
        idDocSection: false,
      });
    });
  });

  describe('when identity is visible', () => {
    it('should return sections visibility', () => {
      const sectionsVisibility = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.ssn4]: '6009',
        },
      });
      expect(sectionsVisibility).toEqual({
        basicSection: true,
        identitySection: true,
        addressSection: false,
        idDocSection: false,
      });

      const sectionsVisibility1 = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.ssn9]: '453436009',
        },
      });
      expect(sectionsVisibility1).toEqual({
        basicSection: true,
        identitySection: true,
        addressSection: false,
        idDocSection: false,
      });

      const sectionsVisibility2 = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.ssn9]: '453436009',
          [UserDataAttribute.dob]: '01/01/2001',
        },
      });
      expect(sectionsVisibility2).toEqual({
        basicSection: true,
        identitySection: true,
        addressSection: false,
        idDocSection: false,
      });
    });
  });

  describe('when adderss is visible', () => {
    it('should return sections visibility', () => {
      const sectionsVisibility = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.zip]: null,
          [UserDataAttribute.country]: null,
        },
      });
      expect(sectionsVisibility).toEqual({
        basicSection: true,
        identitySection: false,
        addressSection: true,
        idDocSection: false,
      });

      const sectionsVisibility1 = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.zip]: null,
          [UserDataAttribute.state]: null,
          [UserDataAttribute.addressLine1]: null,
          [UserDataAttribute.addressLine2]: null,
          [UserDataAttribute.country]: null,
        },
      });
      expect(sectionsVisibility1).toEqual({
        basicSection: true,
        identitySection: false,
        addressSection: true,
        idDocSection: false,
      });
    });
  });

  describe('when id doc section is visible', () => {
    it('should return sections visibility', () => {
      const sectionsVisibility = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.zip]: null,
          [UserDataAttribute.country]: null,
        },
        idDoc: {
          [IdDocDataAttribute.frontImage]: 'image_bytes',
        },
      });
      expect(sectionsVisibility).toEqual({
        basicSection: true,
        identitySection: false,
        addressSection: true,
        idDocSection: true,
      });
    });
  });

  describe('when all the sections are visible', () => {
    it('should return sections visibility', () => {
      const sectionsVisibility = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.ssn9]: null,
          [UserDataAttribute.dob]: null,
          [UserDataAttribute.zip]: null,
          [UserDataAttribute.country]: null,
        },
        idDoc: {
          [IdDocDataAttribute.frontImage]: 'image_bytes',
        },
      });
      expect(sectionsVisibility).toEqual({
        basicSection: true,
        identitySection: true,
        addressSection: true,
        idDocSection: true,
      });

      const sectionsVisibility1 = getSectionsVisibility({
        kycData: {
          [UserDataAttribute.firstName]: 'Piip',
          [UserDataAttribute.lastName]: 'Footprint',
          [UserDataAttribute.email]: 'piip@onefootprint.com',
          [UserDataAttribute.ssn9]: null,
          [UserDataAttribute.dob]: null,
          [UserDataAttribute.zip]: null,
          [UserDataAttribute.state]: null,
          [UserDataAttribute.addressLine1]: null,
          [UserDataAttribute.addressLine2]: null,
          [UserDataAttribute.country]: null,
        },
        idDoc: {
          [IdDocDataAttribute.frontImage]: 'image_bytes',
        },
      });
      expect(sectionsVisibility1).toEqual({
        basicSection: true,
        identitySection: true,
        addressSection: true,
        idDocSection: true,
      });
    });
  });
});
