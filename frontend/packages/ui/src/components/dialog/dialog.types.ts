import type { Icon } from '@onefootprint/icons';

import type { ButtonSize, ButtonVariant } from '../button/button.types';

export type DialogProps = {
  onClose: () => void;
  open: boolean;
  size?: DialogSize;
  title: string;
  ariaLabel?: string;
  isConfirmation?: boolean;
  headerIcon?: DialogHeaderIcon;
  primaryButton?: DialogButton;
  secondaryButton?: DialogButton;
  linkButton?: DialogButton;
  disableResponsiveness?: boolean;
  onClickOutside?: () => void;
  children?: React.ReactNode;
  testID?: string;
};

export type DialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (dataSubmitted?: unknown) => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariant;
  size?: ButtonSize;
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

export type FooterProps = {
  primaryButton?: DialogButton;
  secondaryButton?: DialogButton;
  linkButton?: DialogButton;
};

export type HeaderProps = {
  headerIcon?: DialogHeaderIcon;
  title?: string;
};

export type DialogSizeWidthMap = Record<DialogSize, string>;
