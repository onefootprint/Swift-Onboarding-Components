export type StringOrNumber = string | number;

export type SelectOption<T extends StringOrNumber = string> = {
  label: string;
  value: T;
};
