import type { Theme } from '@onefootprint/design-tokens';
import themes from '@onefootprint/design-tokens';
import type { FootprintAppearance } from '@onefootprint/footprint-js';

import createRules from './utils/create-rules';
import createStyle from './utils/create-style';
import createTheme from './utils/create-theme';
import getAppearanceFromObConfig from './utils/get-appearance-from-ob-config';
import getAppearanceFromStyleParams from './utils/get-appearance-from-style-params';
import getAppearanceFromUrl from './utils/get-appearance-from-url';

const IS_BROWSER = typeof window !== 'undefined';

export type Strategy = 'queryParameters' | 'obConfig' | 'styleParams';

type AppearanceOptions = {
  variant?: string;
  defaultTheme?: Theme;
  params?: Record<string, string>;
  strategy: Strategy[];
  authToken?: string;
  kybBoAuthToken?: string;
  obConfig?: string;
};

type AppearanceResponse = {
  appearance: FootprintAppearance | null;
  variant: string | null;
  fontSrc: string | null;
  rules: string | null;
  theme: Theme;
};

const getCustomAppearance = async ({
  variant = 'modal',
  defaultTheme = themes.light,
  params,
  strategy,
  authToken,
  obConfig,
  kybBoAuthToken,
}: AppearanceOptions): Promise<AppearanceResponse> => {
  if (strategy.includes('queryParameters')) {
    const variables = params?.variables || params?.tokens;
    if (variables || params?.rules) {
      const appearance = await getAppearanceFromUrl({ ...params, variables });
      if (appearance) {
        return {
          appearance,
          theme: createTheme(defaultTheme, appearance.variables),
          rules: createRules(appearance.rules),
          fontSrc: appearance.fontSrc || null,
          variant: appearance.variant || variant,
        };
      }
    }
  }
  if (strategy.includes('styleParams')) {
    if (authToken) {
      const appearance = await getAppearanceFromStyleParams(authToken);
      if (appearance) {
        return {
          appearance,
          theme: createTheme(defaultTheme, appearance.variables),
          rules: createRules(appearance.rules),
          fontSrc: appearance.fontSrc || null,
          variant: appearance.variant || variant,
        };
      }
    }
  }

  if (strategy.includes('obConfig')) {
    const appearance = await getAppearanceFromObConfig({
      obConfig,
      authToken,
      kybBoAuthToken,
    });
    if (appearance) {
      return {
        appearance,
        theme: createTheme(defaultTheme, appearance.variables),
        rules: createRules(appearance.rules),
        fontSrc: appearance.fontSrc || null,
        variant: appearance.variant || variant,
      };
    }
  }
  return {
    theme: defaultTheme,
    fontSrc: null,
    rules: null,
    variant,
    appearance: null,
  };
};

const appendClientSideStyles =
  (getCustomAppearanceFn: (options: AppearanceOptions) => Promise<AppearanceResponse>) =>
  async (options: AppearanceOptions) => {
    const appearance = await getCustomAppearanceFn(options);
    if (!appearance || !IS_BROWSER) return appearance;

    if (appearance.fontSrc) {
      createStyle('footprint-custom-fonts', `@import url('${appearance.fontSrc}');`);
    }
    if (appearance.rules) {
      createStyle('footprint-custom-rules', appearance.rules);
    }
    if (appearance.variant) {
      document.body.setAttribute('data-variant', appearance.variant);
    }

    return appearance;
  };

export default appendClientSideStyles(getCustomAppearance);
