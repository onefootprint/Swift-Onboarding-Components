import * as CSS from 'csstype';

export type FootprintMainStyles = Partial<{
  borderRadius: CSS.Property.BorderRadius;

  dialogBg: CSS.Property.Background;
  dialogBoxShadow: CSS.Property.BoxShadow;
  dialogBorderRadius: CSS.Property.BorderRadius;

  buttonBorderRadius: CSS.Property.BorderRadius;
  buttonBorderWidth: CSS.Property.BorderWidth;
  buttonElevation: CSS.Property.BoxShadow;
  buttonElevationHover: CSS.Property.BoxShadow;
  buttonElevationActive: CSS.Property.BoxShadow;
  buttonOutlineOffset: CSS.Property.OutlineOffset;
  buttonPrimaryBg: CSS.Property.Background;
  buttonPrimaryColor: CSS.Property.Color;
  buttonPrimaryBorderColor: CSS.Property.BorderColor;
  buttonPrimaryHoverBg: CSS.Property.Background;
  buttonPrimaryHoverColor: CSS.Property.Color;
  buttonPrimaryHoverBorderColor: CSS.Property.BorderColor;
  buttonPrimaryActiveBg: CSS.Property.Background;
  buttonPrimaryActiveColor: CSS.Property.Color;
  buttonPrimaryActiveBorderColor: CSS.Property.BorderColor;
  buttonPrimaryDisabledBg: CSS.Property.Background;
  buttonPrimaryDisabledColor: CSS.Property.Color;
  buttonPrimaryDisabledBorderColor: CSS.Property.BorderColor;
  buttonPrimaryLoadingBg: CSS.Property.Background;
  buttonPrimaryLoadingColor: CSS.Property.Color;
  buttonSecondaryBg: CSS.Property.Background;
  buttonSecondaryColor: CSS.Property.Color;
  buttonSecondaryBorderColor: CSS.Property.BorderColor;
  buttonSecondaryHoverBg: CSS.Property.Background;
  buttonSecondaryHoverColor: CSS.Property.Color;
  buttonSecondaryHoverBorderColor: CSS.Property.BorderColor;
  buttonSecondaryActiveBg: CSS.Property.Background;
  buttonSecondaryActiveColor: CSS.Property.Color;
  buttonSecondaryActiveBorderColor: CSS.Property.BorderColor;
  buttonSecondaryDisabledBg: CSS.Property.Background;
  buttonSecondaryDisabledColor: CSS.Property.Color;
  buttonSecondaryDisabledBorderColor: CSS.Property.BorderColor;
  buttonSecondaryLoadingBg: CSS.Property.Background;
  buttonSecondaryLoadingColor: CSS.Property.Color;

  buttonLargeHeight: CSS.Property.Height;
  buttonLargeHorizonalPadding: CSS.Property.PaddingLeft;
}>;

export type FootprintExternalStyles = Partial<{
  fpButtonHeight: CSS.Property.Height;
  fpButtonBorderRadius: CSS.Property.Height;
  loadingBg: CSS.Property.Background;
  loadingColor: CSS.Property.Color;
  loadingBorderRadius: CSS.Property.BorderRadius;
  loadingPadding: CSS.Property.Padding;
  overlayBg: CSS.Property.Background;
}>;
