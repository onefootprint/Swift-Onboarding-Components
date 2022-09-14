import { CollectedDataOption } from 'types';

export type NameFormData = {
  name: string;
};

export type DataKindForm = {
  [CollectedDataOption.dob]: boolean;
  [CollectedDataOption.email]: boolean;
  [CollectedDataOption.ssn4]: boolean;
  [CollectedDataOption.phoneNumber]: boolean;
  [CollectedDataOption.ssn9]: boolean;
  [CollectedDataOption.fullAddress]: boolean;
  [CollectedDataOption.partialAddress]: boolean;
  [CollectedDataOption.name]: boolean;
};
