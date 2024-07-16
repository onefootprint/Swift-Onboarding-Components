import themes from '@onefootprint/design-tokens';

import createTheme, { createTokens } from './create-theme';
import type { FootprintAppearanceVariables } from './theme.types';

const defaultTheme = themes.light;

describe('create theme', () => {
  describe('createTokens', () => {
    it('should return the default theme when no variables are passed', () => {
      const variables: FootprintAppearanceVariables = {};
      expect(createTokens(defaultTheme, variables)).toEqual(defaultTheme);
    });

    describe('global definitions', () => {
      it('should extend the theme correctly', () => {
        const variables: FootprintAppearanceVariables = {
          borderRadius: '10px',
        };
        const expectedTheme = structuredClone(defaultTheme);
        const { button, input, radioSelect } = expectedTheme.components;
        expectedTheme.borderRadius.default = '10px';
        button.borderRadius = '10px';
        input.global.borderRadius = '10px';
        radioSelect.borderRadius = '10px';
        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
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
        button.variant.primary.loading.bg = 'green';
        button.variant.primary.disabled.bg = 'green';

        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
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
        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
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
        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
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
        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
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
        expect(createTokens(defaultTheme, variables)).toEqual(expectedTheme);
      });
    });
  });

  describe('createTheme', () => {
    it('should generate the theme correctly', () => {
      const styleParams = '{"variables":{"borderRadius": "0px", "buttonPrimaryBg": "purple"}}';

      const expectedTheme = structuredClone(defaultTheme);
      const { button, input, radioSelect } = expectedTheme.components;
      expectedTheme.borderRadius.default = '0px';
      button.borderRadius = '0px';
      input.global.borderRadius = '0px';
      radioSelect.borderRadius = '0px';
      button.variant.primary.bg = 'purple';
      button.variant.primary.active.bg = 'purple';
      button.variant.primary.loading.bg = 'purple';
      button.variant.primary.disabled.bg = 'purple';
      expect(createTheme(defaultTheme, styleParams)).toEqual(expectedTheme);
    });
  });
});
