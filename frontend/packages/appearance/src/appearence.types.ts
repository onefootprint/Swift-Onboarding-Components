import type { Theme } from '@onefootprint/design-tokens';

export type AppearanceStrategy = 'queryParameters' | 'obConfig' | 'styleParams';

export type AppearanceOptions = {
  variant?: string;
  authToken?: string;
  defaultTheme?: Theme;
  obConfig?: string;
  params?: Record<string, string>;
  strategy: AppearanceStrategy[];
};
