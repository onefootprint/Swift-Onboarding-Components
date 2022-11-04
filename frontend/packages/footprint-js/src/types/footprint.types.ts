import type * as CSS from 'csstype';

import type {
  FootprintExternalStyles,
  FootprintMainStyles,
} from './footprint-theme.type';

export enum FootprintEvents {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export type FootprintAppearanceVariables = FootprintMainStyles &
  FootprintExternalStyles;

export type FootprintAppearanceTheme = 'light' | 'dark';

export type FootprintAppearanceRules = Partial<{
  button: CSS.Properties;
  'button:hover': CSS.Properties;
  'button:focus': CSS.Properties;
  'button:active': CSS.Properties;
  input: CSS.Properties;
  'input:hover': CSS.Properties;
  'input:focus': CSS.Properties;
  'input:active': CSS.Properties;
  label: CSS.Properties;
  hint: CSS.Properties;
}>;

export type FootprintAppearance = {
  theme?: FootprintAppearanceTheme;
  variables?: FootprintAppearanceVariables;
  rules?: FootprintAppearanceRules;
};

export type ShowFootprint = {
  onCanceled?: () => void;
  onCompleted?: (validationToken: string) => void;
  publicKey?: string;
};

export type Footprint = {
  show: ({
    publicKey,
    onCompleted,
    onCanceled,
  }: ShowFootprint) => Promise<void>;
};
