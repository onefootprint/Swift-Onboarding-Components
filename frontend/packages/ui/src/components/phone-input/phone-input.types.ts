import type { CountryCode } from '@onefootprint/types';

import type { BaseSelectOption } from '../internal/base-select/base-select.types';
import type { InputProps as BaseInputProps } from '../internal/input';

export type InputProps = Omit<BaseInputProps, 'mask' | 'placeholder'>;

export type PhoneInputProps = Omit<
  InputProps,
  'placeholder' | 'minLength' | 'maxLength' | 'type' | 'autoComplete'
> & {
  defaultValue?: string;
  onReset?: () => void;
  searchPlaceholder?: string;
  selectEmptyStateText?: string;
  value?: string;
};

export type PhoneSelectOption = BaseSelectOption<CountryCode>;
