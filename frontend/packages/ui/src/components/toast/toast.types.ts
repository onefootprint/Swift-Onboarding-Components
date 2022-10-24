export type NextToast = {
  closeAriaLabel?: string;
  cta?: { label: string; onClick?: () => void };
  description: string;
  onClose?: () => void;
  testID?: string;
  title: string;
  variant?: 'default' | 'error';
};

export type ToastProps = NextToast & {
  id: string;
  leaving?: boolean;
};
