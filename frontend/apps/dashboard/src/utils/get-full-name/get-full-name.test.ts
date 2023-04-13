import getFullName from './get-full-name';

describe('getFullName', () => {
  describe('when both first name and last name are non-empty strings', () => {
    it('should show full name', () => {
      const fullName = getFullName('Jane', 'Doe');
      expect(fullName).toEqual('Jane Doe');
    });
  });

  describe('when both first name and last name are encrypted', () => {
    it('should show an encrypted full name', () => {
      const fullName = getFullName(null, null);
      expect(fullName).toEqual(null);
    });
  });

  describe('when one of the fields are encrypted', () => {
    it('should show only the available name', () => {
      const onlyFirstName = getFullName('Jane', null);
      expect(onlyFirstName).toEqual('Jane');

      const onlyLastName = getFullName(null, 'Doe');
      expect(onlyLastName).toEqual('Doe');
    });
  });

  describe('when both fields are omitted from kycData', () => {
    it('should have undefined value', () => {
      const fullName = getFullName();
      expect(fullName).toEqual(undefined);
    });
  });

  describe('when one of the fields are omitted from kycData', () => {
    it('should show the available name', () => {
      const onlyFirstName = getFullName('Jane');
      expect(onlyFirstName).toEqual('Jane');
      const onlyFirstNameNull = getFullName(null);
      expect(onlyFirstNameNull).toEqual(null);
    });
  });
});
