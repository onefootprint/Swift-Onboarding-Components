import { Icon } from '@onefootprint/icons';

export type DialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (dataSubmitted?: any) => void;
  type?: 'button' | 'submit' | 'reset';
};

export type DialogHeaderIcon = {
  component?: Icon;
  onClick?: () => void;
  ariaLabel?: string;
};

export type DialogLinkButton = {
  form?: string;
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

export type Size = 'small' | 'compact' | 'default' | 'large';

export type OnlyPrimaryButton = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton?: never;
};

export type OnlyButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: never;
};

export type PrimaryAndLinkButtons = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton: DialogLinkButton;
};

export type NoButtons = {
  primaryButton?: never;
  secondaryButton?: never;
  linkButton?: never;
};

export type AllButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: DialogButton;
};
