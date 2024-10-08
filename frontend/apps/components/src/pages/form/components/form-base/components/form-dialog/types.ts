export type FormDialogButton = {
  disabled?: boolean;
  form?: string;
  label: string;
  loading?: boolean;
  loadingAriaLabel?: string;
  onClick?: (dataSubmitted?: unknown) => void;
  type?: 'button' | 'submit' | 'reset';
};
