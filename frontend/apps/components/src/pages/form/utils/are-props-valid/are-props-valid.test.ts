import arePropsValid from './are-props-valid';

describe('arePropsValid', () => {
  it('should return true if props are valid', () => {
    expect(
      arePropsValid({
        authToken: 'token',
        title: 'title',
        variant: 'drawer',
      }),
    ).toBe(true);
  });

  it('should return false if props are not valid', () => {
    expect(arePropsValid(undefined)).toBe(false);
    expect(arePropsValid({})).toBe(false);
    expect(arePropsValid({ authtoken: 1234 })).toBe(false);
    expect(arePropsValid({ title: 1234 })).toBe(false);
    expect(arePropsValid({ variant: '' })).toBe(false);
  });
});
