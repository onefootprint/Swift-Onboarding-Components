import validateCompanySymbols from './validate-company-symbols';

describe('validateCompanySymbols', () => {
  it('should return false when input is undefined', () => {
    expect(validateCompanySymbols(undefined)).toBe(false);
  });

  it('should validate an array of company symbols separated by commas', () => {
    const validInput = 'ABC,DEFG,HIJK';
    expect(validateCompanySymbols(validInput)).toBe(true);

    const invalidInput1 = 'AB,DEFGHI,HIJKL';
    expect(validateCompanySymbols(invalidInput1)).toBe(false);

    const invalidInput2 = '123,DEFG,HIJK';
    expect(validateCompanySymbols(invalidInput2)).toBe(false);
  });

  it('should ignore spaces between comma-separated symbols', () => {
    const inputWithSpaces = 'ABC , DEFG, HIJK';
    expect(validateCompanySymbols(inputWithSpaces)).toBe(true);
  });
});
