import type { CollectedKycDataOption } from '@onefootprint/types';

export type KycPersonFormData = {
  person: {
    address: boolean;
    dob: boolean;
    email: boolean;
    phoneNumber: boolean;
    usLegalStatus: boolean;
    ssn: {
      collect: boolean;
      kind: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
      optional: boolean;
    };
    usTaxIdAcceptable: boolean;
  };
};
