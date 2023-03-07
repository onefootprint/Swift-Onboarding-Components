import UserDataAttribute from './user-data-attribute';

export type CollectedDataOption =
  | CollectedKycDataOption
  | CollectedDocumentDataOption;

// TODO: the backend type for CDO has become more advanced and includes more than just KYC data
export enum CollectedKycDataOption {
  name = 'name',
  dob = 'dob',
  ssn4 = 'ssn4',
  ssn9 = 'ssn9',
  fullAddress = 'full_address',
  partialAddress = 'partial_address',
  email = 'email',
  phoneNumber = 'phone_number',
}

export enum CollectedDocumentDataOption {
  document = 'document',
  documentAndSelfie = 'document_and_selfie',
}

export const documentCdoFor = (
  collectDocument: boolean,
  collectSelfie: boolean,
) => {
  if (collectDocument && collectSelfie) {
    return CollectedDocumentDataOption.documentAndSelfie;
  }
  if (collectDocument) {
    return CollectedDocumentDataOption.document;
  }
  return null;
};

// Labels sent from the backend for each attribute
export const CollectedDataOptionLabels: Record<string, CollectedDataOption> = {
  name: CollectedKycDataOption.name,
  dob: CollectedKycDataOption.dob,
  email: CollectedKycDataOption.email,
  ssn9: CollectedKycDataOption.ssn9,
  ssn4: CollectedKycDataOption.ssn4,
  full_address: CollectedKycDataOption.fullAddress,
  partial_address: CollectedKycDataOption.partialAddress,
  phone_number: CollectedKycDataOption.phoneNumber,
  document: CollectedDocumentDataOption.document,
  document_and_selfie: CollectedDocumentDataOption.documentAndSelfie,
};

export const OptionToRequiredAttributes: Record<
  CollectedKycDataOption,
  UserDataAttribute[]
> = {
  [CollectedKycDataOption.name]: [
    UserDataAttribute.firstName,
    UserDataAttribute.lastName,
  ],
  [CollectedKycDataOption.dob]: [UserDataAttribute.dob],
  [CollectedKycDataOption.ssn4]: [UserDataAttribute.ssn4],
  [CollectedKycDataOption.ssn9]: [UserDataAttribute.ssn9],
  [CollectedKycDataOption.fullAddress]: [
    UserDataAttribute.addressLine1,
    UserDataAttribute.city,
    UserDataAttribute.state,
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.partialAddress]: [
    UserDataAttribute.zip,
    UserDataAttribute.country,
  ],
  [CollectedKycDataOption.email]: [UserDataAttribute.email],
  [CollectedKycDataOption.phoneNumber]: [UserDataAttribute.phoneNumber],
};
