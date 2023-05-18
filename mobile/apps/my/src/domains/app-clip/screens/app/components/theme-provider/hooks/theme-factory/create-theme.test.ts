import themes from '@onefootprint/design-tokens';

import { FootprintAppearanceVariables } from '../../theme.types';
import createTheme, { createTokens } from './create-theme';

const defaultTheme = themes.light;

describe('create theme', () => {
  describe('createTokens', () => {
    it('should return the default theme when no variables are passed', () => {
      const variables: FootprintAppearanceVariables = {};
      expect(createTokens(variables, defaultTheme)).toEqual(defaultTheme);
    });

    describe('global definitions', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          borderRadius: '10px',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button, input } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        button.global.borderRadius = '10px';
        input.global.borderRadius = '10px';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Button />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          buttonPrimaryBg: 'red',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button } = expectedTheme.components;
        button.variant.primary.bg = 'red';
        button.variant.primary.hover.bg = 'red';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<LinkButton />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          borderRadius: '10px',
          linkButtonColor: 'red',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { linkButton } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        linkButton.variant.default.color.text.initial = 'red';
        linkButton.variant.default.color.text.hover = 'red';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Label />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          labelColor: 'purple',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputLabel } = expectedTheme.components;
        inputLabel.states.default.color = 'purple';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Hint />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          hintColor: 'blue',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { inputHint } = expectedTheme.components;
        inputHint.states.default.color = 'blue';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Input />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          inputBg: 'black',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { input } = expectedTheme.components;
        input.state.default.initial.bg = 'black';
        input.state.default.hover.bg = 'black';
        input.state.default.focus.bg = 'black';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });
  });

  describe('createTheme', () => {
    it('should generate the theme correctly', () => {
      const styleParams =
        '{"variables":"%7B%22borderRadius%22%3A%220px%22%2C%22buttonPrimaryBg%22%3A%22purple%22%7D"}';

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
