import { fromUSDateToISO8601Format, strInputToUSDate } from './index';

describe('strInputToUSDate', () => {
  it.each`
    locale     | str             | output
    ${'en-US'} | ${'1/1/1997'}   | ${'01/01/1997'}
    ${'en-US'} | ${'1/2/1997'}   | ${'01/02/1997'}
    ${'en-US'} | ${'12/12/1997'} | ${'12/12/1997'}
    ${'en-US'} | ${'12/25/1997'} | ${'12/25/1997'}
    ${'es-MX'} | ${'1/2/1997'}   | ${'02/01/1997'}
    ${'es-MX'} | ${'12/25/1997'} | ${'25/12/1997'}
    ${'es-MX'} | ${'12/12/1997'} | ${'12/12/1997'}
  `(`for $locale, $str = $output`, ({ locale, str, output }) => {
    expect(strInputToUSDate(locale, str)).toBe(output);
  });
});

describe('fromUSDateToISO8601Format', () => {
  it.each`
    date            | output
    ${'1/1/1997'}   | ${'1997-01-01'}
    ${'1/02/1997'}  | ${'1997-01-02'}
    ${'01/2/1997'}  | ${'1997-01-02'}
    ${'12/12/1997'} | ${'1997-12-12'}
    ${'12/25/1997'} | ${'1997-12-25'}
  `(`for return ISO 8601 Format = $output`, ({ date, output }) => {
    expect(fromUSDateToISO8601Format(date)).toBe(output);
  });
});
