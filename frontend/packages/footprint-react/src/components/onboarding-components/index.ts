export { CORPORATION_TYPES, COUNTRY_CODES } from './constants';
import Field from './components/field';
import FieldErrors from './components/field-errors';
import Form from './components/form';
import Input from './components/input';
import Label from './components/label';
import PinInput from './components/pin-input';
import Provider from './components/provider';
import Select from './components/select';

import type { FieldProps } from './components/field';
import type { FieldErrorsProps } from './components/field-errors';
import type { FormOptions, FormProps } from './components/form';
import type { InputProps } from './components/input';
import type { LabelProps } from './components/label';
import type { PinInputProps } from './components/pin-input';
import type { ContextData, ProviderProps } from './components/provider';
import type { SelectOption, SelectProps } from './components/select';

export type {
  ContextData,
  FieldErrorsProps,
  FieldProps,
  FormOptions,
  FormProps,
  InputProps,
  LabelProps,
  PinInputProps,
  ProviderProps,
  SelectOption,
  SelectProps,
};

export const Fp = {
  Field,
  FieldErrors,
  Form,
  Input,
  Label,
  PinInput,
  Provider,
  Select,
};

export { default as useFootprint } from './hooks/use-footprint';
export { default as AuthTokenStatus } from './types/auth-token-status';
