import { fromUSDateToISO8601Format, isISO8601Format, strInputToUSDate } from './index';

describe('strInputToUSDate', () => {
  it.each`
    locale     | str             | output
    ${'en-US'} | ${''}           | ${''}
    ${'en-US'} | ${null}         | ${''}
    ${'en-US'} | ${undefined}    | ${''}
    ${'en-US'} | ${' '}          | ${''}
    ${'en-US'} | ${true}         | ${''}
    ${'en-US'} | ${1}            | ${''}
    ${'en-US'} | ${'1/1/1997'}   | ${'01/01/1997'}
    ${'en-US'} | ${'1/2/1997'}   | ${'01/02/1997'}
    ${'en-US'} | ${'12/12/1997'} | ${'12/12/1997'}
    ${'en-US'} | ${'12/25/1997'} | ${'12/25/1997'}
    ${'es-MX'} | ${'1/2/1997'}   | ${'02/01/1997'}
    ${'es-MX'} | ${'25/12/1997'} | ${'12/25/1997'}
    ${'es-MX'} | ${'12/12/1997'} | ${'12/12/1997'}
    ${'es-MX'} | ${'14/07/1997'} | ${'07/14/1997'}
  `('for $locale, $str = $output', ({ locale, str, output }) => {
    expect(strInputToUSDate(locale, str)).toBe(output);
  });
});

describe('fromUSDateToISO8601Format', () => {
  it.each`
    date            | output
    ${''}           | ${undefined}
    ${' '}          | ${undefined}
    ${null}         | ${undefined}
    ${undefined}    | ${undefined}
    ${[]}           | ${undefined}
    ${true}         | ${undefined}
    ${1}            | ${undefined}
    ${'1/1/1997'}   | ${'1997-01-01'}
    ${'1/02/1997'}  | ${'1997-01-02'}
    ${'01/2/1997'}  | ${'1997-01-02'}
    ${'12/12/1997'} | ${'1997-12-12'}
    ${'12/25/1997'} | ${'1997-12-25'}
  `('for return ISO 8601 Format = $output', ({ date, output }) => {
    expect(fromUSDateToISO8601Format(date)).toBe(output);
  });
});

describe('isISO8601Format', () => {
  it('should return true for valid ISO 8601 date strings', () => {
    expect(isISO8601Format('2022-01-01')).toBe(true);
    expect(isISO8601Format('1990-12-31')).toBe(true);
    expect(isISO8601Format('2022-02-28')).toBe(true);
    expect(isISO8601Format('2022-02-29')).toBe(true); // leap year
  });

  it('should return false for invalid ISO 8601 date strings', () => {
    expect(isISO8601Format('2022-01-01T00:00:00')).toBe(false); // includes time
    expect(isISO8601Format('2022-01-01Z')).toBe(false); // includes UTC offset
    expect(isISO8601Format('2022-01-01+01:00')).toBe(false); // includes UTC offset
    expect(isISO8601Format('2022-01-01-01:00')).toBe(false); // includes UTC offset
  });

  it('should return false for non-string inputs', () => {
    // @ts-expect-error: intentional test
    expect(isISO8601Format(undefined)).toBe(false);
    // @ts-expect-error: intentional test
    expect(isISO8601Format(null)).toBe(false);
    // @ts-expect-error: intentional test
    expect(isISO8601Format(12345)).toBe(false);
    // @ts-expect-error: intentional test
    expect(isISO8601Format(true)).toBe(false);
    // @ts-expect-error: intentional test
    expect(isISO8601Format([])).toBe(false);
    // @ts-expect-error: intentional test
    expect(isISO8601Format({})).toBe(false);
  });
});
