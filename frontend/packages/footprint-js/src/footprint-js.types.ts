import * as CSS from 'csstype';

export type FootprintShowParams = {
  publicKey: string;
  onCompleted: (validationToken: string) => void;
  onCanceled: () => void;
};

export type FootprintAppearanceVariables = Partial<{
  // globals
  borderRadius: CSS.Property.BorderRadius;
  colorError: CSS.Property.Color;
  colorWarning: CSS.Property.Color;
  colorSuccess: CSS.Property.Color;
  colorAccent: CSS.Property.Color;
  borderColorError: CSS.Property.BorderColor;

  // link
  linkColor: CSS.Property.Color;

  // dialog
  dialogBg: CSS.Property.Background;
  dialogBoxShadow: CSS.Property.BoxShadow;
  dialogBorderRadius: CSS.Property.BorderRadius;

  // typography
  fontFamily: CSS.Property.FontFamily;

  // label
  labelColor: CSS.Property.Color;
  labelFont: CSS.Property.Font;

  // input
  inputBorderRadius: CSS.Property.BorderRadius;
  inputBorderWidth: CSS.Property.BorderWidth;
  inputFont: CSS.Property.Font;
  inputHeight: CSS.Property.Height;
  inputPlaceholderColor: CSS.Property.Color;
  inputColor: CSS.Property.Color;
  inputBg: CSS.Property.Background;
  inputBorderColor: CSS.Property.BorderColor;
  inputElevation: CSS.Property.BoxShadow;
  inputHoverBg: CSS.Property.Background;
  inputHoverBorderColor: CSS.Property.BorderColor;
  inputHoverElevation: CSS.Property.BoxShadow;
  inputFocusBg: CSS.Property.Background;
  inputFocusBorderColor: CSS.Property.BorderColor;
  inputFocusElevation: CSS.Property.BoxShadow;
  inputErrorBg: CSS.Property.Background;
  inputErrorBorderColor: CSS.Property.BorderColor;
  inputErrorElevation: CSS.Property.BoxShadow;
  inputErrorHoverBg: CSS.Property.Background;
  inputErrorHoverBorderColor: CSS.Property.BorderColor;
  inputErrorHoverElevation: CSS.Property.BoxShadow;
  inputErrorFocusBg: CSS.Property.Background;
  inputErrorFocusBorderColor: CSS.Property.BorderColor;
  inputErrorFocusElevation: CSS.Property.BoxShadow;

  // hint
  hintColor: CSS.Property.Color;
  hintErrorColor: CSS.Property.Color;
  hintFont: CSS.Property.Font;

  // link button
  linkButtonColor: CSS.Property.Color;
  linkButtonHoverColor: CSS.Property.Color;
  linkButtonActiveColor: CSS.Property.Color;
  linkButtonDestructiveColor: CSS.Property.Color;
  linkButtonDestructiveHoverColor: CSS.Property.Color;
  linkButtonDestructiveActiveColor: CSS.Property.Color;

  // button
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
  buttonsPrimaryLoadingBorderColor: CSS.Property.BorderColor;
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

  // Dropdown
  dropdownBg: CSS.Property.Background;
  dropdownHoverBg: CSS.Property.Background;
  dropdownBorderColor: CSS.Property.BorderColor;
  dropdownBorderWidth: CSS.Property.BorderWidth;
  dropdownBorderRadius: CSS.Property.BorderRadius;
  dropdownElevation: CSS.Property.BoxShadow;
  dropdownColorPrimary: CSS.Property.Color;
  dropdownColorSecondary: CSS.Property.Color;
  dropdownFooterBg: CSS.Property.Background;

  // Radio select
  radioSelectBg: CSS.Property.Background;
  radioSelectBorderRadius: CSS.Property.BorderRadius;
  radioSelectBorderWidth: CSS.Property.BorderWidth;
  radioSelectBorderColor: CSS.Property.BorderColor;
  radioSelectHoverBg: CSS.Property.Background;
  radioSelectHoverBorderColor: CSS.Property.BorderColor;
  radioSelectSelectedBg: CSS.Property.Background;
  radioSelectSelectedBorderColor: CSS.Property.BorderColor;
  radioSelectComponentsIconBg: CSS.Property.Background;
  radioSelectComponentsIconHoverBg: CSS.Property.Background;
  radioSelectComponentsIconSelectedBg: CSS.Property.Background;
}>;

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
  pinInput: CSS.Properties;
  'pinInput:hover': CSS.Properties;
  'pinInput:focus': CSS.Properties;
  'pinInput:active': CSS.Properties;
  label: CSS.Properties;
  hint: CSS.Properties;
  link: CSS.Properties;
  'link:hover': CSS.Properties;
  'link:active': CSS.Properties;
  linkButton: CSS.Properties;
  'linkButton:hover': CSS.Properties;
  'linkButton:focus': CSS.Properties;
  'linkButton:active': CSS.Properties;
}>;

export type FootprintAppearance = {
  variant?: 'dialog' | 'drawer';
  fontSrc?: string;
  rules?: FootprintAppearanceRules;
  theme?: FootprintAppearanceTheme;
  variables?: FootprintAppearanceVariables;
};

export type OpenFootprint = {
  appearance?: FootprintAppearance;
  onCanceled?: () => void;
  onCompleted?: (validationToken: string) => void;
  publicKey?: string;
  userData?: FootprintUserData;
  options?: FootprintOptions;
};

export type Footprint = {
  open: (options: OpenFootprint) => Promise<void>;
  close: () => Promise<void>;
};

export enum FootprintPublicEvent {
  closed = 'closed',
  completed = 'completed',
  canceled = 'canceled',
}

export enum FootprintInternalEvent {
  bootstrapDataReceived = 'bootstrapDataReceived',
  optionsReceived = 'optionsReceived',
  started = 'started',
}

export const FOOTPRINT_OPTIONS_KEYS = ['showCompletionPage'];

export const FOOTPRINT_USER_DATA_KEYS = [
  'id.email',
  'id.phone_number',
  'id.first_name',
  'id.last_name',
  'id.dob',
  'id.address_line1',
  'id.address_line2',
  'id.city',
  'id.state',
  'id.country',
  'id.zip',
  'id.ssn9',
  'id.ssn4',
];

export type FootprintUserData = Partial<{
  'id.email': string;
  'id.phone_number': string;
  'id.first_name': string;
  'id.last_name': string;
  'id.dob': string;
  'id.address_line1': string;
  'id.address_line2': string;
  'id.city': string;
  'id.state': string;
  'id.country': string; // 2 letter country code
  'id.zip': string;
  'id.ssn9': string;
  'id.ssn4': string;
  'id.nationality': string; // 2 letter country code
}>;

export type IdentifyRequest = {
  identifier: { email: string } | { phone_number: string };
};

export type FootprintOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};
