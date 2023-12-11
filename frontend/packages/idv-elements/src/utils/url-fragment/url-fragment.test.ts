/* eslint-disable @typescript-eslint/no-unused-vars */
import { hasInvalidHashFragment } from './url-fragment';

describe('hasInvalidHashFragment', () => {
  it.each`
    output   | name                   | url
    ${true}  | ${'invalid 0'}         | ${'http://localhost:3000/#'}
    ${true}  | ${'invalid 1'}         | ${'http://localhost:3000/#invalid'}
    ${true}  | ${'invalid 2'}         | ${'http://localhost:3000/#ttok_123'}
    ${false} | ${'no hash 1'}         | ${'http://localhost:3000/?no-hash'}
    ${false} | ${'no hash 2'}         | ${'http://localhost:3000/?public_key=ob_test_2TwubGlrWdKaJnWsQQKQYl'}
    ${false} | ${'with token'}        | ${'http://localhost:3000/#tok_123'}
    ${false} | ${'with bootstrap'}    | ${'http://localhost:3000/?public_key=ob_test_oO1b1qcrLtnFmvAEiwD3zO#%7B%22id.email...'}
    ${false} | ${'with variables'}    | ${'http://localhost:3000/?public_key=ob_test_oO1b1qcrLtnFmvAEiwD3zO&tokens=%257B%2522fontFamily%2522%253A%2522%255C%2522Inter%255C%2522%252C%2520ui-sans-serif%252C%2520system-ui%252C-apple-system%252CBlinkMacSystemFont%252CSegoe%2520UI%252CRoboto%252CHelvetica%2520Neue%252CArial%252CNoto%2520Sans%252Csans-serif%252CApple%2520Color%2520Emoji%252CSegoe%2520UI%2520Emoji%252CSegoe%2520UI%2520Symbol%252CNoto%2520Color%2520Emoji%2522%252C%2522linkColor%2522%253A%2522%25233F83F7%2522%252C%2522borderRadius%2522%253A%25223px%2522%252C%2522linkButtonColor%2522%253A%2522%25233F83F7%2522%252C%2522colorError%2522%253A%2522%2523FB5100%2522%252C%2522buttonBorderWidth%2522%253A%25221px%2522%252C%2522buttonPrimaryBg%2522%253A%2522%25231F86FF%2522%252C%2522buttonPrimaryColor%2522%253A%2522%2523FFFFFF%2522%252C%2522buttonPrimaryBorderColor%2522%253A%2522%25231971DA%2522%252C%2522buttonElevation%2522%253A%2522rgba(0%252C%25200%252C%25200%252C%25200)%25200px%25200px%25200px%25200px%252C%2520rgba(0%252C%25200%252C%25200%252C%25200)%25200px%25200px%25200px%25200px%252C%2520rgba(25%252C%2520113%252C%2520218%252C%25200.2)%25200px%25202px%25202px%25200px%2522%252C%2522buttonPrimaryHoverBg%2522%253A%2522%25231971DA%2522%252C%2522inputFocusElevation%2522%253A%2522unset%2522%252C%2522inputPlaceholderColor%2522%253A%2522%25239DA3AF%2522%252C%2522inputBorderWidth%2522%253A%25221px%2522%252C%2522inputHeight%2522%253A%252248px%2522%252C%2522inputBg%2522%253A%2522%2523E5E7EB%2522%252C%2522inputBorderColor%2522%253A%2522%2523C6C9CC%2522%252C%2522inputColor%2522%253A%2522%2523000%2522%252C%2522inputFocusBg%2522%253A%2522%2523FFF%2522%252C%2522inputFocusBorderColor%2522%253A%2522%2523000%2522%252C%2522labelColor%2522%253A%2522%2523101516%2522%252C%2522labelFont%2522%253A%2522500%252014px%252F21px%2520%255C%2522Inter%255C%2522%2522%257D&rules=%257B%2522container%2522%253A%257B%2522width%2522%253A%2522460px%2522%252C%2522margin%2522%253A%2522unset%2522%252C%2522height%2522%253A%2522100vh%2522%252C%2522maxHeight%2522%253A%2522unset%2522%252C%2522position%2522%253A%2522fixed%2522%252C%2522right%2522%253A0%252C%2522border%2522%253A%25221px%2520solid%2520%2523101516%2522%252C%2522boxShadow%2522%253A%25220px%25200px%25200px%25200px%252C%2520rgba(0%252C%25200%252C%25200%252C%25200)%25200px%25200px%25200px%25200px%252C%2520rgba(0%252C%25200%252C%25200%252C%25200.24)%25200px%25204px%252024px%25200px%2522%257D%252C%2522input%2522%253A%257B%2522transition%2522%253A%25220.15s%2520all%2520cubic-bezier(.4%252C0%252C.2%252C1)%2522%257D%257D&font_src=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter%3Awght%40400%3B500%3B600%26display%3Dswap'}
    ${false} | ${'with __ separator'} | ${'http://localhost:3000/?public_key=ob_test_oO1b1qcrLtnFmvAEiwD3zO&redirect_url=redirectUrl#%7B%22id.email%22%3A%22piip%40onefootprint.com%22%2C%22id.phoneNumber%22%3A%22%2B15555550100%22%2C%22id.firstName%22%3A%22Piip%22%2C%22id.middleName%22%3A%22I%22%2C%22id.lastName%22%3A%22Foot%22%2C%22id.dob%22%3A%2202%2F01%2F1992%22%2C%22id.ssn9%22%3A%22123451234%22%2C%22id.ssn4%22%3A%221234%22%2C%22id.addressLine1%22%3A%221234%20Main%20St%22%2C%22id.addressLine2%22%3A%22Apt%202%22%2C%22id.nationality%22%3A%22US%22%2C%22id.city%22%3A%22San%20Francisco%22%2C%22id.state%22%3A%22CA%22%2C%22id.country%22%3A%22US%22%2C%22id.zip%22%3A%2291212%22%2C%22id.usLegalStatus%22%3A%22citizen%22%2C%22id.citizenships%22%3A%5B%22US%22%5D%2C%22id.visaKind%22%3A%22f1%22%2C%22id.visaExpirationDate%22%3A%2201%2F01%2F2030%22%7D__%7B%22showCompletionPage%22%3Atrue%2C%22showLogo%22%3Atrue%7D__%7B%22locale%22%3A%22es-MX%22%7D%22'}
  `(`$output for $name`, ({ url, output, name }) => {
    expect(hasInvalidHashFragment(url)).toBe(output);
  });
});
