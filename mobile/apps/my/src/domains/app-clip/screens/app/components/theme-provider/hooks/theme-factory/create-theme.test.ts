import themes from '@onefootprint/design-tokens';

import { FootprintAppearance } from '../../theme.types';
import createTheme, { createTokens, parseAppearance } from './create-theme';

const defaultTheme = themes.light;

describe('create theme', () => {
  describe('parseAppearance', () => {
    describe('when the appearance is valid', () => {
      it('should return the parsed appearance', () => {
        const input =
          '{"variables":{"borderRadius": "10px","buttonPrimaryBg":"purple"}}';
        expect(parseAppearance(input)).toEqual({
          variables: {
            borderRadius: '10px',
            buttonPrimaryBg: 'purple',
          },
        });
      });
    });

    describe('when the appearance is invalid', () => {
      it('should return null', () => {
        const input = '';
        expect(parseAppearance(input)).toEqual(null);
      });
    });
  });

  describe('createTokens', () => {
    it('should return the default theme when no variables are passed', () => {
      const appearance = {
        variables: {},
      };
      expect(createTokens(appearance, defaultTheme)).toEqual(defaultTheme);
    });

    describe('global definitions', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            borderRadius: '10px',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button, input } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        button.global.borderRadius = '10px';
        input.global.borderRadius = '10px';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Button />', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            buttonPrimaryBg: 'red',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button } = expectedTheme.components;
        button.variant.primary.bg = 'red';
        button.variant.primary.hover.bg = 'red';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<LinkButton />', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            borderRadius: '10px',
            linkButtonColor: 'red',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { linkButton } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        linkButton.variant.default.color.text.initial = 'red';
        linkButton.variant.default.color.text.hover = 'red';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Label />', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            labelColor: 'purple',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputLabel } = expectedTheme.components;
        inputLabel.states.default.color = 'purple';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Hint />', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            hintColor: 'blue',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputHint } = expectedTheme.components;
        inputHint.states.default.color = 'blue';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Input />', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            inputBg: 'black',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { input } = expectedTheme.components;
        input.state.default.initial.bg = 'black';
        input.state.default.hover.bg = 'black';
        input.state.default.focus.bg = 'black';
        expect(createTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });
  });

  describe('createTheme', () => {
    it('should generate the theme correctly', () => {
      const styleParams =
        '{"variables":{"borderRadius": "0px", "buttonPrimaryBg":"purple"}}';
      const expectedTheme = structuredClone(defaultTheme);
      const { button, input } = expectedTheme.components;
      expectedTheme.borderRadius.default = '0px';
      button.global.borderRadius = '0px';
      input.global.borderRadius = '0px';
      button.variant.primary.bg = 'purple';
      button.variant.primary.hover.bg = 'purple';
      expect(createTheme(styleParams)).toEqual(expectedTheme);
    });
  });
});
