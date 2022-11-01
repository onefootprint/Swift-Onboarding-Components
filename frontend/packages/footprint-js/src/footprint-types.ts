export enum FootprintEvents {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export type FootprintMainStyles = Partial<{
  fontFamily: string;
  borderRadius: string;
}>;

export type FootprintExternalStyles = Partial<{
  fpButtonHeight: string;
  fpButtonBorderRadius: string;

  loadingBg: string;
  loadingColor: string;
  loadingBorderRadius: string;
  loadingPadding: string;

  overlayBg: string;
}>;

export type FootprintAppearanceVariables = FootprintMainStyles &
  FootprintExternalStyles;

export type FootprintAppearanceTheme = 'light' | 'dark';

export type FootprintAppearance = {
  theme: FootprintAppearanceTheme;
  variables: FootprintAppearanceVariables;
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
