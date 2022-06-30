export type NextToast = {
  closeAriaLabel?: string;
  description: string;
  onHide?: () => void;
  testID?: string;
  title: string;
  variant?: 'default' | 'error';
};

export type ToastProps = NextToast & {
  id: string;
  leaving?: boolean;
};
