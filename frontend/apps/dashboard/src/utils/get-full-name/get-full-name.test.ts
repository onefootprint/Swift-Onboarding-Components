import getFullName from './get-full-name';

describe('getFullName', () => {
  describe('when all names are non-empty strings', () => {
    it('should show first+last name', () => {
      const fullName = getFullName('Jane', undefined, 'Doe');
      expect(fullName).toEqual('Jane Doe');
    });

    it('should show full name', () => {
      const fullName = getFullName('Jane', 'Middle', 'Doe');
      expect(fullName).toEqual('Jane Middle Doe');
    });
  });

  describe('when all names are encrypted', () => {
    it('should show an encrypted full name', () => {
      const fullName = getFullName(null, null, null);
      expect(fullName).toEqual(null);
    });
  });

  describe('when one of the fields are encrypted', () => {
    it('should show only the available name', () => {
      const onlyFirstName = getFullName('Jane', null);
      expect(onlyFirstName).toEqual('Jane');

      const onlyMiddleName = getFullName(null, 'Middle');
      expect(onlyMiddleName).toEqual('Middle');

      const onlyLastName = getFullName(null, 'Doe');
      expect(onlyLastName).toEqual('Doe');

      const onlyFirstAndMiddle = getFullName('Jane', 'Middle');
      expect(onlyFirstAndMiddle).toEqual('Jane Middle');

      const onlyFirstAndLast = getFullName('Jane', null, 'Doe');
      expect(onlyFirstAndLast).toEqual('Jane Doe');

      const onlyMiddleAndLast = getFullName(null, 'Middle', 'Doe');
      expect(onlyMiddleAndLast).toEqual('Middle Doe');
    });
  });

  describe('when all fields are omitted from kycData', () => {
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
