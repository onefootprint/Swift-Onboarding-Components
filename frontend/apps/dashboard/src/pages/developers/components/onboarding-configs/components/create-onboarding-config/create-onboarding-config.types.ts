import { CollectedDataOption } from '@onefootprint/types';

export type NameFormData = {
  name: string;
};

export type KycDataFormData = {
  [CollectedDataOption.email]: boolean;
  [CollectedDataOption.phoneNumber]: boolean;
  [CollectedDataOption.dob]?: boolean;
  [CollectedDataOption.ssn4]?: boolean;
  [CollectedDataOption.ssn9]?: boolean;
  [CollectedDataOption.fullAddress]?: boolean;
  [CollectedDataOption.partialAddress]?: boolean;
  [CollectedDataOption.name]?: boolean;
};

export type IdDocFormData = {
  idDoc: boolean;
};
