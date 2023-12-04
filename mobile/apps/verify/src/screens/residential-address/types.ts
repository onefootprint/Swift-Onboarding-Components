import type { CountrySelectOption, SelectOption } from '@onefootprint/ui';

export type FormData = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: CountrySelectOption;
  state: SelectOption<{ value: string; label: string }>;
  zip: string;
};
