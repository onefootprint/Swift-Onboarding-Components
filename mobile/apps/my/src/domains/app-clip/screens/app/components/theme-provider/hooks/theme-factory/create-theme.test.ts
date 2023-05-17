import themes from '@onefootprint/design-tokens';

import { FootprintAppearance } from '../../theme.types';
import { generateTokens, parseAppearance } from './create-theme';

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

  describe('generateTokens', () => {
    it('should return the default theme when no variables are passed', () => {
      const appearance = {
        variables: {},
      };
      expect(generateTokens(appearance, defaultTheme)).toEqual(defaultTheme);
    });

    describe('button', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            borderRadius: '10px',
            buttonPrimaryBg: 'red',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        button.variant.primary.bg = 'red';
        button.variant.primary.hover.bg = 'red';
        button.global.borderRadius = '10px';
        expect(generateTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('link button', () => {
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
        expect(generateTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('label', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            labelColor: 'purple',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputLabel } = expectedTheme.components;
        inputLabel.states.default.color = 'purple';
        expect(generateTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('hint', () => {
      it('should extend the theme correctly', () => {
        const appearance: FootprintAppearance = {
          variables: {
            hintColor: 'blue',
          },
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputHint } = expectedTheme.components;
        inputHint.states.default.color = 'blue';
        expect(generateTokens(appearance, defaultTheme)).toEqual(expectedTheme);
      });
    });
  });
});
