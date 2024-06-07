import { getCountryFromPhoneNumber, getNationalNumber } from './phone-input.utils';

describe('getCountryFromPhoneNumber', () => {
  it.each`
    phone               | code         | output
    ${undefined}        | ${'DE'}      | ${'DE'}
    ${'+12544555666'}   | ${'DE'}      | ${'DE'}
    ${'+12544555666'}   | ${'US'}      | ${'US'}
    ${'+12544555666'}   | ${undefined} | ${'US'}
    ${'+4915206073691'} | ${undefined} | ${'DE'}
    ${'+523336630979'}  | ${undefined} | ${'MX'}
  `(`for $phone, $code = $output`, ({ phone, code, output }) => {
    const result = getCountryFromPhoneNumber(phone, code);
    expect(result.value).toBe(output);
  });
});

describe('getNationalNumber', () => {
  it.each`
    prefix       | value             | output
    ${'prefix-'} | ${'prefix-value'} | ${'value'}
    ${'prefix_'} | ${'prefix_value'} | ${'value'}
  `(`remove prefix from $value`, ({ prefix, value, output }) => {
    expect(getNationalNumber(prefix, value)).toBe(output);
  });
});
