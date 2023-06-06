import type { Icon } from '@onefootprint/icons';

export type StringOrNumber = string | number;

export type RadioSelectOption<T extends StringOrNumber = string> = {
  title: string;
  description: string;
  IconComponent: Icon;
  value: T;
};
