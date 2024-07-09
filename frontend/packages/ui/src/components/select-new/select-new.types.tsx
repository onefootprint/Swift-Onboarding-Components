export type SelectNewProps = {
  size?: 'compact' | 'default';
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  onChange?: (value: string) => void;
  options: SelectNewOption[];
  triggerWidth?: string;
  contentWidth?: string;
  label?: string;
  hint?: string;
  ariaLabel?: string;
  value?: SelectNewOption['value'];
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
  triggerWidth?: string;
  ariaLabel?: string;
};

export type ContentProps = {
  options: SelectNewOption[];
  size?: SelectNewProps['size'];
  contentWidth?: string;
};

export type ItemProps = {
  option: SelectNewOption;
  size?: SelectNewProps['size'];
  isLast?: boolean;
  isFirst?: boolean;
};
