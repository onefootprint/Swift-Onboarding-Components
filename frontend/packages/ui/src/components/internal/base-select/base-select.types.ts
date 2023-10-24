type StringOrNumber = string | number;

export type BaseSelectOption<T extends StringOrNumber = string> = {
  label: string;
  value: T;
  description?: string;
};
