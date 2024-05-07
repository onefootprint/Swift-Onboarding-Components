import type { Icon } from '@onefootprint/icons';

export type DialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (dataSubmitted?: unknown) => void;
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
  headerButton?: never;
};

export type DialogOnlyHeaderButton = {
  primaryButton?: never;
  secondaryButton?: never;
  linkButton?: never;
  headerButton: DialogButton;
};

export type DialogOnlyButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: never;
  headerButton?: never;
};

export type DialogPrimaryAndLinkButtons = {
  primaryButton: DialogButton;
  secondaryButton?: never;
  linkButton: DialogLinkButton;
  headerButton?: never;
};

export type DialogNoButtons = {
  primaryButton?: never;
  secondaryButton?: never;
  linkButton?: never;
  headerButton?: never;
};

export type DialogAllExceptHeaderButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: DialogButton;
  headerButton?: never;
};

export type DialogAllButtons = {
  primaryButton: DialogButton;
  secondaryButton: DialogButton;
  linkButton?: DialogButton;
  headerButton?: DialogButton;
};
