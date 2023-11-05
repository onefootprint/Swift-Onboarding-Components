export type FormDialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  onClick?: (dataSubmitted?: unknown) => void;
  type?: 'button' | 'submit' | 'reset';
};

export type AllButtons = {
  primaryButton: FormDialogButton;
  secondaryButton: FormDialogButton;
};

export type OnlyPrimaryButton = {
  primaryButton: FormDialogButton;
  secondaryButton?: never;
};
