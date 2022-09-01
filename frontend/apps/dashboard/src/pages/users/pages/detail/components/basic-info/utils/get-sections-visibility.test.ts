import { UserDataAttribute } from 'types';

import getSectionsVisibility from './get-sections-visibility';

describe('getSectionsVisibility', () => {
  describe('when only the basic info is visible', () => {
    it('should return sections visibility', () => {
      const userDataAttributes = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
      ];
      const sectionsVisibility = getSectionsVisibility(userDataAttributes);
      expect(sectionsVisibility).toEqual({
        basic: true,
        identity: false,
        address: false,
      });
    });
  });

  describe('when identity is visible', () => {
    it('should return sections visibility', () => {
      const userDataAttributes = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.ssn4,
      ];
      const sectionsVisibility = getSectionsVisibility(userDataAttributes);
      expect(sectionsVisibility).toEqual({
        basic: true,
        identity: true,
        address: false,
      });

      const userDataAttributes1 = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.ssn9,
      ];
      const sectionsVisibility1 = getSectionsVisibility(userDataAttributes1);
      expect(sectionsVisibility1).toEqual({
        basic: true,
        identity: true,
        address: false,
      });

      const userDataAttributes2 = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.ssn9,
        UserDataAttribute.dob,
      ];
      const sectionsVisibility2 = getSectionsVisibility(userDataAttributes2);
      expect(sectionsVisibility2).toEqual({
        basic: true,
        identity: true,
        address: false,
      });
    });
  });

  describe('when adderss is visible', () => {
    it('should return sections visibility', () => {
      const userDataAttributes = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.country,
        UserDataAttribute.zip,
      ];
      const sectionsVisibility = getSectionsVisibility(userDataAttributes);
      expect(sectionsVisibility).toEqual({
        basic: true,
        identity: false,
        address: true,
      });

      const userDataAttributes1 = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.addressLine1,
        UserDataAttribute.addressLine2,
        UserDataAttribute.country,
        UserDataAttribute.state,
        UserDataAttribute.zip,
      ];
      const sectionsVisibility1 = getSectionsVisibility(userDataAttributes1);
      expect(sectionsVisibility1).toEqual({
        basic: true,
        identity: false,
        address: true,
      });
    });
  });

  describe('when all the sections are visible', () => {
    it('should return sections visibility', () => {
      const userDataAttributes = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.ssn9,
        UserDataAttribute.dob,
        UserDataAttribute.country,
        UserDataAttribute.zip,
      ];
      const sectionsVisibility = getSectionsVisibility(userDataAttributes);
      expect(sectionsVisibility).toEqual({
        basic: true,
        identity: true,
        address: true,
      });

      const userDataAttributes1 = [
        UserDataAttribute.firstName,
        UserDataAttribute.lastName,
        UserDataAttribute.email,
        UserDataAttribute.ssn9,
        UserDataAttribute.dob,
        UserDataAttribute.addressLine1,
        UserDataAttribute.addressLine2,
        UserDataAttribute.country,
        UserDataAttribute.state,
        UserDataAttribute.zip,
      ];
      const sectionsVisibility1 = getSectionsVisibility(userDataAttributes1);
      expect(sectionsVisibility1).toEqual({
        basic: true,
        identity: true,
        address: true,
      });
    });
  });
});
