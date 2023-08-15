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

export type DialogSize = 'compact' | 'default' | 'large' | 'full-screen';

export type DialogOnlyPrimaryButton = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton?: never;
};

export type DialogOnlyButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: never;
};

export type DialogPrimaryAndLinkButtons = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton: DialogLinkButton;
};

export type DialogNoButtons = {
  primaryButton?: never;
  secondaryButton?: never;
  linkButton?: never;
};

export type DialogAllButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: DialogButton;
};
