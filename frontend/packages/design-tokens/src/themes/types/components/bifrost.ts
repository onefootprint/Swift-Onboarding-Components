import type * as CSS from 'csstype';

type Overlay = {
  bg: CSS.Property.Background;
};

type Loading = {
  bg: CSS.Property.Background;
  borderRadius: CSS.Property.BoxShadow;
  color: CSS.Property.Color;
  padding: CSS.Property.Padding;
};

type FpButton = {
  height: CSS.Property.Height;
  borderRadius: CSS.Property.BorderRadius;
};

type Container = {
  bg: CSS.Property.Background;
  border: CSS.Property.Border;
  elevation: CSS.Property.BoxShadow;
  borderRadius: CSS.Property.BorderRadius;
};

export type Bifrost = {
  container: Container;
  fpButton: FpButton;
  loading: Loading;
  overlay: Overlay;
};
