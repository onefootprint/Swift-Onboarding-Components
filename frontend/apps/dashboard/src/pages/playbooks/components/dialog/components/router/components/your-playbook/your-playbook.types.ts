import {
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

export type FormData = {
  name: string;
  personalInformationAndDocs: PersonalInformationAndDocs;
};

export type PersonalInformationAndDocs = {
  email: boolean;
  phone: boolean;
  dob: boolean;
  nationality: boolean;
  address: boolean;
  ssn: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  idDoc: boolean;
  idDocKind: SupportedIdDocTypes[];
  selfie?: boolean;
  ssnOptional?: boolean;
};

export const defaultValues: FormData = {
  name: '',
  personalInformationAndDocs: {
    email: true,
    phone: true,
    dob: true,
    nationality: true,
    address: true,
    ssn: false,
    idDoc: false,
    ssnKind: CollectedKycDataOption.ssn9,
    idDocKind: [],
    selfie: true,
  },
};
