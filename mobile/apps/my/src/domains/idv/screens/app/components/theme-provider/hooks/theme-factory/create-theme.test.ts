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
        button.borderRadius = '10px';
        input.global.borderRadius = '10px';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Button />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          buttonPrimaryBg: 'green',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button } = expectedTheme.components;
        button.variant.primary.bg = 'green';
        button.variant.primary.active.bg = 'green';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<LinkButton />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          linkButtonColor: 'red',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { linkButton } = expectedTheme.components;
        linkButton.variant.default.color.text.initial = 'red';
        linkButton.variant.default.color.text.active = 'red';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Label />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          labelColor: 'purple',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { label } = expectedTheme.components;
        label.states.default.color = 'purple';
        expect(createTokens(variables, defaultTheme)).toEqual(expectedTheme);
      });
    });

    describe('<Hint />', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          hintColor: 'blue',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { hint } = expectedTheme.components;
        hint.states.default.color = 'blue';
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
      button.borderRadius = '0px';
      input.global.borderRadius = '0px';
      button.variant.primary.bg = 'purple';
      button.variant.primary.active.bg = 'purple';
      expect(createTheme(styleParams)).toEqual(expectedTheme);
    });
  });
});
