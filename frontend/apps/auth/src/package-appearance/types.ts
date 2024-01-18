import type { Theme } from '@onefootprint/design-tokens';
import type { FootprintAppearance } from '@onefootprint/footprint-js';

type Strategy = 'queryParameters' | 'obConfig' | 'styleParams';
export type AppearanceResponse = {
  appearance: FootprintAppearance | null;
  fontSrc: string | null;
  rules: string | null;
  theme: Theme;
  variant: string | null;
};
export type AppearanceOptions = {
  authToken?: string;
  defaultTheme?: Theme;
  kybBoAuthToken?: string;
  obConfig?: string;
  params?: Record<string, string>;
  strategy: Strategy[];
  variant?: string;
};
export type OnboardingConfigRequestType = {
  authToken?: string;
  kybBoAuthToken?: string;
  obConfig?: string;
};
