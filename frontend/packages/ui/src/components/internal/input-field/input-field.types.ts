import { InputHTMLAttributes } from 'react';

export type InputFieldProps = {
  error?: boolean;
  hintText?: string;
  label?: string;
  mask?: string | (string | RegExp)[];
  maskPlaceholder?: string | null;
  onChangeText?: (nextValue: string) => void;
  placeholder: string;
  testID?: string;
  value?: string;
} & InputHTMLAttributes<HTMLInputElement>;
