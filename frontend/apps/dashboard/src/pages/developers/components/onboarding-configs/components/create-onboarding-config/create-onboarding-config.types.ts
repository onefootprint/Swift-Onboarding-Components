import { CollectedKycDataOption } from '@onefootprint/types';

export type NameFormData = {
  name: string;
};

export type KycDataFormData = {
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.dob]?: boolean;
  [CollectedKycDataOption.ssn4]?: boolean;
  [CollectedKycDataOption.ssn9]?: boolean;
  [CollectedKycDataOption.fullAddress]?: boolean;
  [CollectedKycDataOption.partialAddress]?: boolean;
  [CollectedKycDataOption.name]?: boolean;
};

export type DocumentsFormData = {
  idDoc: boolean;
  selfie?: boolean;
};
