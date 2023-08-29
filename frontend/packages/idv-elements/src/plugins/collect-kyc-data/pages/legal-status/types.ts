import { UsLegalStatus, VisaKind } from '@onefootprint/types';
import { CountrySelectOption } from '@onefootprint/ui';

export type FormData = {
  usLegalStatus: UsLegalStatus;
  nationality?: CountrySelectOption;
  citizenships?: CountrySelectOption[];
  visa?: {
    kind: { label: string; value: VisaKind };
    expirationDate: string;
  };
};
