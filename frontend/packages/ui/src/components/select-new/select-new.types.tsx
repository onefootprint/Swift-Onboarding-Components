export type SelectNewProps = {
  size?: 'compact' | 'default';
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: SelectNewOption[];
  triggerWidth?: Width;
  contentWidth?: Width;
  label?: string;
  hint?: string;
  ariaLabel?: string;
};

export type SelectNewOption = {
  label: string;
  value: string;
  disabled?: boolean;
  disabledTooltipText?: string;
};

export type TriggerProps = {
  disabled?: boolean;
  placeholder?: string;
  size?: SelectNewProps['size'];
  value?: string;
  triggerWidth?: Width;
  ariaLabel?: string;
};

export type ContentProps = {
  options: SelectNewOption[];
  size?: SelectNewProps['size'];
  contentWidth?: Width;
};

export type ItemProps = {
  option: SelectNewOption;
  size?: SelectNewProps['size'];
};

type Width = 'full' | 'auto' | 'narrow' | 'default' | 'wide';
