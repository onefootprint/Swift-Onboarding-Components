import getFullNameDataValue from './get-full-name-data';

describe('getFullNameData', () => {
  describe('when both first name and last name are non-empty strings', () => {
    it('should show full name', () => {
      const fullName = getFullNameDataValue('Jane', 'Doe');
      expect(fullName).toEqual('Jane Doe');
    });
  });

  describe('when both first name and last name are encrypted', () => {
    it('should show an encrypted full name', () => {
      const fullName = getFullNameDataValue(null, null);
      expect(fullName).toEqual(null);
    });
  });

  describe('when one of the fields are encrypted', () => {
    it('should show only the available name', () => {
      const onlyFirstName = getFullNameDataValue('Jane', null);
      expect(onlyFirstName).toEqual('Jane');

      const onlyLastName = getFullNameDataValue(null, 'Doe');
      expect(onlyLastName).toEqual('Doe');
    });
  });

  describe('when both fields are omitted from kycData', () => {
    it('should have undefined value', () => {
      const fullName = getFullNameDataValue();
      expect(fullName).toEqual(undefined);
    });
  });

  describe('when one of the fields are omitted from kycData', () => {
    it('should show the available name', () => {
      const onlyFirstName = getFullNameDataValue('Jane');
      expect(onlyFirstName).toEqual('Jane');
      const onlyFirstNameNull = getFullNameDataValue(null);
      expect(onlyFirstNameNull).toEqual(null);
    });
  });
});
