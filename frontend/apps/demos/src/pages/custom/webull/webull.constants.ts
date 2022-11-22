import { FootprintAppearance } from '@onefootprint/footprint-js';

export const publicKey = process.env.NEXT_PUBLIC_TENANT_KEY as string;

export const appearance: FootprintAppearance = {
  fontSrc:
    'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap',
  variables: {
    fontFamily: '"Open Sans"',
    linkColor: '#0D86FF',
    colorError: '#FA4C67',

    buttonPrimaryBg: '#0D86FF',
    buttonPrimaryHoverBg: '#0A75E0',
    buttonPrimaryColor: '#FFF',
    buttonBorderRadius: '12px',

    linkButtonColor: '#0D86FF',

    labelColor: '#101010',
    labelFont: '600 15px/18px "Open Sans"',

    inputBorderRadius: '12px',
    inputBorderWidth: '1px',
    inputFont: '500 15px/21.42px "Open Sans"',
    inputHeight: '50px',
    inputPlaceholderColor: '#B5B5B5',
    inputColor: '#101010',
    inputBg: '#f3f6fa',
    inputBorderColor: 'transparent',
    inputFocusBg: '#FFFFFF',
    inputFocusBorderColor: '#0B90FF',
    inputFocusElevation: 'none',

    hintColor: '#979BA1',
    hintFont: '400 13px/20px "Open Sans"',
  },
  rules: {
    'input:focus': {
      outline: '2px solid #0D86FF1F',
    },
  },
};
