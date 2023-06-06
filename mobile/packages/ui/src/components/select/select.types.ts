export type StringOrNumber = string | number;

export type BaseOption<T extends StringOrNumber = string> = {
  value: T;
  label: string;
};

export type SelectOption<T extends BaseOption> = T;
