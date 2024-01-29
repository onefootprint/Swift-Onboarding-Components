import type { Theme } from '@onefootprint/design-tokens';
import themes from '@onefootprint/design-tokens';
import type {
  FootprintAppearance,
  FootprintAppearanceRules,
  FootprintAppearanceVariables,
} from '@onefootprint/footprint-js';
import type { GetPublicOnboardingConfigResponse } from '@onefootprint/types';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';

import variablesMap from './constants/variables-map';
import type {
  AppearanceOptions,
  AppearanceResponse,
  OnboardingConfigRequestType,
} from './types';

const IS_BROWSER = typeof window !== 'undefined';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const AUTH_HEADER = 'x-fp-authorization';
const CLIENT_PUBLIC_KEY_HEADER = 'X-Onboarding-Config-Key';
const KYB_BO_SESSION_AUTHORIZATION_HEADER = 'X-Kyb-Bo-Token';
const buttons = ['button', 'button:hover', 'button:focus', 'button:active'];
const input = ['input', 'input:hover', 'input:focus', 'input:active'];
const pinInput = [
  'pinInput',
  'pinInput:hover',
  'pinInput:focus',
  'pinInput:active',
];
const label = ['label'];
const hint = ['hint'];
const link = ['link', 'link:hover', 'link:focus'];
const linkButton = [
  'linkButton',
  'linkButton:hover',
  'linkButton:focus',
  'linkButton:active',
];

const rulesWhitelist = [
  ...buttons,
  ...input,
  ...pinInput,
  ...label,
  ...hint,
  ...link,
  ...linkButton,
];

const footprintClassNamesMap = {
  button: '.fp-button',
  input: '.fp-input',
  pinInput: '.fp-pin-input',
  label: '.fp-label',
  hint: '.fp-hint',
  linkButton: '.fp-link-button',
  link: 'a',
};

const parse = (params: string) => {
  try {
    if (typeof params !== 'string') {
      throw new Error('Input parameter must be a string.');
    }

    const parsed = JSON.parse(decodeURIComponent(params));
    return parsed;
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(`Error parsing appearance rules: ${e.message}`);
    }
    return null;
  }
};

const filterNonWhitelistRules = (
  rules: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
  whitelist: string[] = rulesWhitelist,
) => {
  const clonedRules = { ...rules };
  Object.entries(rules).forEach(([rule]) => {
    if (!whitelist.includes(rule)) {
      delete clonedRules[rule];
    }
  });
  return clonedRules;
};

const getSelector = (
  selector: string,
  selectors: Record<string, string> = footprintClassNamesMap,
) => {
  if (selector.includes(':')) {
    const separatorPosition = selector.indexOf(':');
    const component = selector.slice(0, separatorPosition);
    const pseudoSelector = selector.slice(separatorPosition, selector.length);
    return `.fp-custom-appearance${selectors[component]}${pseudoSelector}`;
  }
  return `.fp-custom-appearance${selectors[selector]}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const convertObjectToCSS = (rules: Record<string, any>) => {
  const toKebabCase = (selector: string) =>
    selector
      .split(/(?=[A-Z])/)
      .join('-')
      .toLowerCase();
  const formatValue = (selector: string, value: string) => {
    if (selector === 'content') {
      return `"${value}"`;
    }
    return value;
  };

  return Object.keys(rules).reduce(
    (acc, selector) =>
      `${acc + toKebabCase(selector)}:${formatValue(
        selector,
        rules[selector],
      )};`,
    '',
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createStylesFromRules = (rules: Record<string, any>) => {
  let styles = ` `;
  Object.entries(rules).forEach(([selector, stylesObject]) => {
    const fpSelector = getSelector(selector);
    const css = convertObjectToCSS(stylesObject);
    styles = `${styles}${fpSelector}{${css}} `;
  });
  return styles.trim();
};

const createRules = (rules?: FootprintAppearanceRules) => {
  if (!rules || Object.keys(rules).length === 0) return null;
  const filteredRules = filterNonWhitelistRules(rules);
  const styles = createStylesFromRules(filteredRules);
  return styles;
};

const mutateTheme = (options: {
  theme: Theme;
  cssVariable: string;
  cssValue: string;
}) => {
  const { theme, cssVariable, cssValue } = options;
  set(theme, cssVariable, cssValue);
  return theme;
};

const iterateOverVariables = (options: {
  theme: Theme;
  variables: Record<string, unknown>;
  tokenName: string;
  tokenValue: unknown;
}) => {
  let { theme } = options;
  const { variables, tokenName, tokenValue } = options;
  const definitions = variablesMap.get(tokenName);
  if (definitions) {
    const cssVariable = definitions.var;
    theme = mutateTheme({
      cssValue: tokenValue as string,
      cssVariable,
      theme,
    });
    if (definitions.assignDefault) {
      definitions.assignDefault.forEach(innerTokenName => {
        const shouldOverwrite = !variables.innerTokenName;
        if (shouldOverwrite) {
          theme = iterateOverVariables({
            theme,
            variables,
            tokenName: innerTokenName,
            tokenValue,
          });
        }
      });
    }
    return theme;
  }
  return theme;
};

const createTheme = (
  baseTheme: Theme,
  variables?: FootprintAppearanceVariables,
): Theme => {
  const clonedBasedTheme = cloneDeep(baseTheme);
  if (!variables || Object.keys(variables).length === 0)
    return clonedBasedTheme;
  return Object.entries(variables).reduce(
    (theme, [tokenName, tokenValue]) =>
      iterateOverVariables({ theme, variables, tokenName, tokenValue }),
    clonedBasedTheme,
  );
};

const getAppearanceFromUrl = (
  params: Record<string, string | undefined>,
): FootprintAppearance | null => {
  const { font_src: fontSrc, variables, rules, variant } = params;
  if (!variables && !rules) {
    return null;
  }
  const appearance = {
    fontSrc: fontSrc || null,
    rules: rules ? parse(rules) : null,
    variables: variables ? parse(variables) : null,
    variant: variant || null,
  } as FootprintAppearance;
  return appearance;
};

const getAuthHeaders = (payload: OnboardingConfigRequestType) => {
  const headers: Record<string, string> = {};
  const { authToken, kybBoAuthToken, obConfig } = payload;
  if (obConfig) {
    headers[CLIENT_PUBLIC_KEY_HEADER] = obConfig;
  } else if (kybBoAuthToken) {
    headers[KYB_BO_SESSION_AUTHORIZATION_HEADER] = kybBoAuthToken;
  } else if (authToken) {
    headers[AUTH_HEADER] = authToken;
  }
  return headers;
};

const getOnboardingConfig = async (
  authHeaders: Record<string, string>,
): Promise<GetPublicOnboardingConfigResponse> => {
  const response = await fetch(`${API_BASE_URL}/org/onboarding_config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const tenant = await response.json();
  return tenant;
};

const getAppearanceFromObConfig = async (
  payload: OnboardingConfigRequestType,
): Promise<FootprintAppearance | null> => {
  const authHeaders = getAuthHeaders(payload);
  if (!Object.values(authHeaders).length) {
    return null;
  }

  try {
    const tenant = await getOnboardingConfig(authHeaders);
    return tenant.appearance || null;
  } catch (_) {
    return null;
  }
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
      const appearance = getAppearanceFromUrl({ ...params, variables });
      if (appearance) {
        return {
          appearance,
          fontSrc: appearance.fontSrc || null,
          rules: createRules(appearance.rules),
          theme: createTheme(defaultTheme, appearance.variables),
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

const createStyle = (styleId: string, styles: string) => {
  const prevStyle = document.getElementById(styleId);
  if (prevStyle) {
    prevStyle.remove();
  }
  const style = document.createElement('style');
  style.type = 'text/css';
  style.setAttribute('id', styleId);
  style.textContent = styles;
  document.head.append(style);
};

// eslint-disable-next-line import/prefer-default-export
export const getCustomAppearanceFork = async (options: AppearanceOptions) => {
  const appearance = await getCustomAppearance(options);
  if (!appearance || !IS_BROWSER) return appearance;

  if (appearance.fontSrc) {
    createStyle(
      'footprint-custom-fonts',
      `@import url('${appearance.fontSrc}');`,
    );
  }
  if (appearance.rules) {
    createStyle('footprint-custom-rules', appearance.rules);
  }
  if (appearance.variant) {
    document.body.setAttribute('data-variant', appearance.variant);
  }

  return appearance;
};
