import { InputHTMLAttributes } from 'react';

export type BaseInputProps = {
  hasError?: boolean;
  hintText?: string;
  label?: string;
  mask?: string | (string | RegExp)[];
  maskPlaceholder?: string | null;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  testID?: string;
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;
