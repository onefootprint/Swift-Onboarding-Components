import ssnFormatter from '.';

describe('ssnFormatter', () => {
  it('should correctly format ssn', () => {
    expect(ssnFormatter('231234312')).toEqual('231-23-4312');
    expect(ssnFormatter('123456789')).toEqual('123-45-6789');
  });

  it('should return null when ssn is not nine digits', () => {
    expect(ssnFormatter('12')).toEqual('');
  });
});
