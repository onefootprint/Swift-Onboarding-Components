export type DialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (dataSubmitted?: unknown) => void;
  type?: 'button' | 'submit' | 'reset';
};

export type DialogLinkButton = {
  form?: string;
  label: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export type DialogFooter = {
  linkButton?: DialogLinkButton;
  primaryButton?: DialogButton;
  secondaryButton?: DialogButton;
  size: DialogSize;
};

export type FooterButtons = Omit<DialogFooter, 'size'>;

export type DialogSize = 'default' | 'compact' | 'full-screen';
