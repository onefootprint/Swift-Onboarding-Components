import type { CountrySelectOption, SelectOption } from '@onefootprint/ui';

export type FormData = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string | SelectOption;
  country: CountrySelectOption;
  zip: string;
};
