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
  button: string;
}>;

export type FootprintAppearance = {
  theme: FootprintAppearanceTheme;
  variables: FootprintAppearanceVariables;
  rules?: FootprintAppearanceRules;
};

export type ShowFootprint = {
  appearance?: FootprintAppearance;
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
