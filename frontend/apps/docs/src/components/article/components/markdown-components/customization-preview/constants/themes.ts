import type { Theme } from '../customization-preview.types';

export const themes: Theme[] = [
  {
    name: 'Footprint',
    src: 'https://id.preview.onefootprint.com?public_key=pb_live_NCIvO0m9VVlxPy2p1BwzFf',
    image: '/customization/theme-footprint.png',
    code: `const publicKey = 'ob_test_VMooXd04EUlnu3AvMYKjMW';
const appearance = {
  theme: 'light',
};

const component = footprint.init({ kind: 'verify', appearance, publicKey });
component.render();`,
  },
  {
    name: 'Ever Green',
    src: 'https://id.preview.onefootprint.com?public_key=pb_live_NCIvO0m9VVlxPy2p1BwzFf&tokens=%257B%2522fontFamily%2522%253A%2522%255C%2522Inter%255C%2522%2522%252C%2522linkColor%2522%253A%2522%2523101010%2522%252C%2522colorError%2522%253A%2522%2523E33D19%2522%252C%2522buttonPrimaryBg%2522%253A%2522%25230C6948%2522%252C%2522buttonPrimaryHoverBg%2522%253A%2522%2523095439%2522%252C%2522buttonPrimaryColor%2522%253A%2522%2523FFF%2522%252C%2522linkButtonColor%2522%253A%2522%25230C6948%2522%252C%2522labelColor%2522%253A%2522%2523101010%2522%252C%2522labelFont%2522%253A%2522600%252015px%252F18px%2520%255C%2522Inter%255C%2522%2522%252C%2522inputBorderRadius%2522%253A%25228px%2522%252C%2522inputBorderWidth%2522%253A%25221px%2522%252C%2522inputFont%2522%253A%2522500%252015px%252F21.42px%2520%255C%2522Inter%255C%2522%2522%252C%2522inputHeight%2522%253A%252250px%2522%252C%2522inputPlaceholderColor%2522%253A%2522%2523B5B5B5%2522%252C%2522inputColor%2522%253A%2522%2523101010%2522%252C%2522inputBg%2522%253A%2522%2523FFFFFF%2522%252C%2522inputBorderColor%2522%253A%2522%2523B5B5B5%2522%252C%2522inputHoverBorderColor%2522%253A%2522%2523707070%2522%252C%2522inputFocusBorderColor%2522%253A%2522%2523707070%2522%252C%2522inputFocusElevation%2522%253A%2522none%2522%252C%2522inputErrorFocusElevation%2522%253A%2522none%2522%252C%2522hintColor%2522%253A%2522%2523101010%2522%252C%2522hintFont%2522%253A%2522400%252013px%252F20px%2520%255C%2522Inter%255C%2522%2522%252C%2522dropdownBorderColor%2522%253A%2522%2523B5B5B5%2522%252C%2522dropdownBorderRadius%2522%253A%25228px%2522%252C%2522dropdownElevation%2522%253A%2522unset%2522%252C%2522dropdownBg%2522%253A%2522%2523FFF%2522%252C%2522dropdownHoverBg%2522%253A%2522%2523F9F9F9%2522%257D&rules=%257B%2522button%2522%253A%257B%2522transition%2522%253A%2522all%2520.2s%2520linear%2522%257D%257D&font_src=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter%3Awght%40400%3B500%3B600%26display%3Dswap',
    image: '/customization/theme-ever-green.png',
    code: `const publicKey = 'ob_test_VMooXd04EUlnu3AvMYKjMW';
const appearance = {
  theme: 'light',
  variables: {
    fontFamily: '"SF UI Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    linkColor: '#101010',
    colorError: '#D14343',
    buttonPrimaryBg: '#0C6948',
    buttonPrimaryHoverBg: '#429777',
    buttonPrimaryActiveBg: '#095439',
    buttonPrimaryColor: '#FFF',
    linkButtonColor: '#0C6948',
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

const component = footprint.init({ kind: 'verify', appearance, publicKey });
component.render();`,
  },
];

export const [defaultTheme] = themes;
