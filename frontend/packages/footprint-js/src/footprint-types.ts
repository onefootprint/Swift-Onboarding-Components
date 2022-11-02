import * as CSS from 'csstype';

export enum FootprintEvents {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export type FootprintMainStyles = Partial<{
  dialog: {
    bg: CSS.Property.Background;
    elevation: CSS.Property.BoxShadow;
    borderRadius: CSS.Property.BorderRadius;
  };
}>;

export type FootprintExternalStyles = Partial<{
  fpButton: {
    height: CSS.Property.Height;
    borderRadius: CSS.Property.BorderRadius;
  };
  loading: {
    bg: CSS.Property.Background;
    color: CSS.Property.Color;
    borderRadius: CSS.Property.BorderRadius;
    padding: CSS.Property.Padding;
  };
  overlay: {
    bg: CSS.Property.Background;
  };
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
