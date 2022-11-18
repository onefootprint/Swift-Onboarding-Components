import type { Theme } from '../customization-preview.types';

export const themes: Theme[] = [
  {
    name: 'Footprint',
    src: 'https://id.preview.onefootprint.com?public_key=ob_test_VMooXd04EUlnu3AvMYKjMW',
    image: '/customization/theme-footprint.png',
    code: `const appearance = {
  theme: 'light',
  publicKey: 'ob_test_VMooXd04EUlnu3AvMYKjMW'
};

footprint.show({ appearance, publicKey });`,
  },
  {
    name: 'Ever Green',
    src: 'https://id.preview.onefootprint.com?public_key=ob_test_VMooXd04EUlnu3AvMYKjMW&tokens=%257B%2522fontFamily%2522%253A%2522%255C%2522SF%2520UI%2520Text%255C%2522%252C%2520-apple-system%252C%2520BlinkMacSystemFont%252C%2520%255C%2522Segoe%2520UI%255C%2522%252C%2520Roboto%252C%2520Helvetica%252C%2520Arial%252C%2520sans-serif%252C%2520%255C%2522Apple%2520Color%2520Emoji%255C%2522%252C%2520%255C%2522Segoe%2520UI%2520Emoji%255C%2522%252C%2520%255C%2522Segoe%2520UI%2520Symbol%255C%2522%2522%252C%2522linkColor%2522%253A%2522%2523101010%2522%252C%2522colorError%2522%253A%2522%2523D14343%2522%252C%2522buttonPrimaryBg%2522%253A%2522%252352BD95%2522%252C%2522buttonPrimaryHoverBg%2522%253A%2522%2523429777%2522%252C%2522buttonPrimaryActiveBg%2522%253A%2522%2523317159%2522%252C%2522buttonPrimaryColor%2522%253A%2522%2523FFF%2522%252C%2522buttonBorderRadius%2522%253A%25224px%2522%252C%2522linkButtonColor%2522%253A%2522%252352BD95%2522%252C%2522labelColor%2522%253A%2522%2523101840%2522%252C%2522inputBorderRadius%2522%253A%25224px%2522%252C%2522inputBorderWidth%2522%253A%25221px%2522%252C%2522inputPlaceholderColor%2522%253A%2522%2523B5B5B5%2522%252C%2522inputColor%2522%253A%2522%2523474d66%2522%252C%2522inputBg%2522%253A%2522%2523FFFFFF%2522%252C%2522inputBorderColor%2522%253A%2522%2523d8dae5%2522%252C%2522inputFocusElevation%2522%253A%2522none%2522%252C%2522inputErrorFocusElevation%2522%253A%2522box-shadow%253A%25200%25200%25200%25202px%2520%2523d6e0ff%253B%2522%252C%2522inputHoverBorderColor%2522%253A%2522%2523ADC2FF%2522%252C%2522hintColor%2522%253A%2522%2523696f8c%2522%257D',
    image: '/customization/theme-ever-green.png',
    code: `const appearance = {
  theme: 'light',
  publicKey: 'ob_test_VMooXd04EUlnu3AvMYKjMW'
  variables: {
    fontFamily: '"SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    linkColor: '#101010',
    colorError: '#D14343',
    buttonPrimaryBg: '#52BD95',
    buttonPrimaryHoverBg: '#429777',
    buttonPrimaryActiveBg: '#317159',
    buttonPrimaryColor: '#FFF',
    buttonBorderRadius: '4px',
    linkButtonColor: '#52BD95',
    labelColor: '#101840',
    inputBorderRadius: '4px',
    inputBorderWidth: '1px',
    inputPlaceholderColor: '#B5B5B5',
    inputColor: '#474d66',
    inputBg: '#FFFFFF',
    inputBorderColor: '#d8dae5',
    inputFocusElevation: 'none',
    inputErrorFocusElevation: 'box-shadow: 0 0 0 2px #d6e0ff;',
    inputHoverBorderColor: '#ADC2FF',
    hintColor: '#696f8c',
  }
};

footprint.show({ appearance, publicKey });`,
  },
];

export const [defaultTheme] = themes;
