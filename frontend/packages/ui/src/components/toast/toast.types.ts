export type NextToast = {
  closeAriaLabel?: string;
  cta?: { label: string; onClick?: () => void };
  description: string | React.ReactNode;
  onClose?: () => void;
  testID?: string;
  title: string;
  variant?: 'default' | 'error';
};

export type ToastProps = NextToast & {
  id: string;
  leaving?: boolean;
};
