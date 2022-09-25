import type { CountryCode } from '@onefootprint/types';

import type { BaseSelectOption } from '../internal/base-select/base-select.types';
import { InputProps as BaseInputProps } from '../internal/input';

export type InputProps = Omit<BaseInputProps, 'mask' | 'placeholder'>;

export type PhoneInputProps = InputProps & {
  disableMask?: boolean;
  onReset?: () => void;
  placeholder?: string;
  searchPlaceholder?: string;
  selectEmptyStateText?: string;
};

export type PhoneSelectOption = BaseSelectOption<CountryCode>;
