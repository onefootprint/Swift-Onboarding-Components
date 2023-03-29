import BusinessDataAttribute from './business-data-attribute';
import UserDataAttribute from './user-data-attribute';

export type CollectedDataOption =
  | CollectedKybDataOption
  | CollectedKycDataOption
  | CollectedIdDocumentDataOption
  | CollectedInvestorProfileDataOption
  | CollectedDocumentDataOption;

export enum CollectedInvestorProfileDataOption {
  investorProfile = 'investor_profile',
}

export enum CollectedKybDataOption {
  name = 'business_name',
  ein = 'business_ein',
  address = 'business_address',
  phoneNumber = 'business_phone_number',
  website = 'business_website',
  beneficialOwners = 'business_beneficial_owners',
}

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
}

export enum CollectedIdDocumentDataOption {
  document = 'document',
  documentAndSelfie = 'document_and_selfie',
}

export const documentCdoFor = (
  collectDocument: boolean,
  collectSelfie: boolean,
) => {
  if (collectDocument && collectSelfie) {
    return CollectedIdDocumentDataOption.documentAndSelfie;
  }
  if (collectDocument) {
    return CollectedIdDocumentDataOption.document;
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
  document: CollectedIdDocumentDataOption.document,
  document_and_selfie: CollectedIdDocumentDataOption.documentAndSelfie,
  business_name: CollectedKybDataOption.name,
  business_ein: CollectedKybDataOption.ein,
  business_address: CollectedKybDataOption.address,
  business_phone_number: CollectedKybDataOption.phoneNumber,
  business_website: CollectedKybDataOption.website,
  business_beneficial_owners: CollectedKybDataOption.beneficialOwners,
  investor_profile: CollectedInvestorProfileDataOption.investorProfile,
};

export const CollectedKybDataOptionToRequiredAttributes: Record<
  CollectedKybDataOption,
  BusinessDataAttribute[]
> = {
  [CollectedKybDataOption.name]: [BusinessDataAttribute.name],
  [CollectedKybDataOption.ein]: [BusinessDataAttribute.ein],
  [CollectedKybDataOption.address]: [
    BusinessDataAttribute.addressLine1,
    BusinessDataAttribute.city,
    BusinessDataAttribute.state,
    BusinessDataAttribute.zip,
    BusinessDataAttribute.country,
  ],
  [CollectedKybDataOption.phoneNumber]: [BusinessDataAttribute.phoneNumber],
  [CollectedKybDataOption.website]: [BusinessDataAttribute.website],
  [CollectedKybDataOption.beneficialOwners]: [
    BusinessDataAttribute.beneficialOwners,
  ],
};

export const CollectedKycDataOptionToRequiredAttributes: Record<
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
