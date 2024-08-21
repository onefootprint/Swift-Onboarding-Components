import { getCountryCodeFromLocale } from '.';

describe('getCountryCodeFromLocale', () => {
  it.each`
    locale     | output
    ${'ab-CD'} | ${'CD'}
    ${'ab-cd'} | ${'CD'}
    ${'ab_CD'} | ${'CD'}
    ${'ab_cd'} | ${'CD'}
  `('should return $output', ({ locale, output }) => {
    expect(getCountryCodeFromLocale(locale)).toBe(output);
  });
});
