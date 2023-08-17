import {
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';

export { Kind } from '../../utils/machine/types';

export type FormData = {
  name: string;
  personalInformationAndDocs: PersonalInformationAndDocs;
  businessInformation?: BusinessInformation;
};

export type PersonalInformationAndDocs = {
  [CollectedKycDataOption.email]: boolean;
  [CollectedKycDataOption.phoneNumber]: boolean;
  [CollectedKycDataOption.dob]: boolean;
  [CollectedKycDataOption.nationality]: boolean;
  [CollectedKycDataOption.fullAddress]: boolean;
  ssn: boolean;
  ssnKind?: CollectedKycDataOption.ssn4 | CollectedKycDataOption.ssn9;
  idDoc: boolean;
  idDocKind: SupportedIdDocTypes[];
  selfie?: boolean;
  ssnOptional?: boolean;
};

export type BusinessInformation = {
  [CollectedKybDataOption.name]: boolean;
  [CollectedKybDataOption.beneficialOwners]: boolean;
  [CollectedKybDataOption.address]: boolean;
  [CollectedKybDataOption.tin]: boolean;
  [CollectedKybDataOption.corporationType]: boolean;
  [CollectedKybDataOption.website]: boolean;
  [CollectedKybDataOption.phoneNumber]: boolean;
  doingBusinessAs: boolean;
};

export const defaultBusinessInformation = {
  [CollectedKybDataOption.name]: true,
  [CollectedKybDataOption.beneficialOwners]: true,
  [CollectedKybDataOption.address]: true,
  [CollectedKybDataOption.tin]: true,
  [CollectedKybDataOption.corporationType]: false,
  [CollectedKybDataOption.website]: false,
  [CollectedKybDataOption.phoneNumber]: false,
  doingBusinessAs: true,
};

export const defaultValuesKYC: FormData = {
  name: '',
  personalInformationAndDocs: {
    email: true,
    [CollectedKycDataOption.phoneNumber]: true,
    [CollectedKycDataOption.dob]: true,
    [CollectedKycDataOption.nationality]: true,
    [CollectedKycDataOption.fullAddress]: true,
    ssn: false,
    idDoc: false,
    ssnKind: CollectedKycDataOption.ssn9,
    idDocKind: [],
    selfie: true,
  },
};

export const defaultValuesKYB: FormData = {
  ...defaultValuesKYC,
  businessInformation: defaultBusinessInformation,
};
