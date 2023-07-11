import { BusinessDI, IdDI } from './di';

export type CollectedDataOption =
  | CollectedKybDataOption
  | CollectedKycDataOption
  | CollectedInvestorProfileDataOption
  | CollectedDocumentDataOption
  | string;

export enum CollectedInvestorProfileDataOption {
  investorProfile = 'investor_profile',
}

export enum CollectedKybDataOption {
  name = 'business_name',
  tin = 'business_tin',
  address = 'business_address',
  phoneNumber = 'business_phone_number',
  website = 'business_website',
  corporationType = 'business_corporation_type',
  beneficialOwners = 'business_beneficial_owners',
  kycedBeneficialOwners = 'business_kyced_beneficial_owners',
}

export enum CollectedKycDataOption {
  name = 'name',
  dob = 'dob',
  ssn4 = 'ssn4',
  ssn9 = 'ssn9',
  fullAddress = 'full_address',
  partialAddress = 'partial_address',
  email = 'email',
  phoneNumber = 'phone_number',
  nationality = 'nationality',
}

// TODO: update this
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
  nationality: CollectedKycDataOption.nationality,
  document: CollectedDocumentDataOption.document,
  document_and_selfie: CollectedDocumentDataOption.documentAndSelfie,
  business_name: CollectedKybDataOption.name,
  business_tin: CollectedKybDataOption.tin,
  business_address: CollectedKybDataOption.address,
  business_phone_number: CollectedKybDataOption.phoneNumber,
  business_website: CollectedKybDataOption.website,
  business_beneficial_owners: CollectedKybDataOption.beneficialOwners,
  business_kyced_beneficial_owners:
    CollectedKybDataOption.kycedBeneficialOwners,
  investor_profile: CollectedInvestorProfileDataOption.investorProfile,
};

export const CollectedKybDataOptionToRequiredAttributes: Record<
  CollectedKybDataOption,
  BusinessDI[]
> = {
  [CollectedKybDataOption.name]: [BusinessDI.name],
  [CollectedKybDataOption.tin]: [BusinessDI.tin],
  [CollectedKybDataOption.address]: [
    BusinessDI.addressLine1,
    BusinessDI.city,
    BusinessDI.state,
    BusinessDI.zip,
    BusinessDI.country,
  ],
  [CollectedKybDataOption.phoneNumber]: [BusinessDI.phoneNumber],
  [CollectedKybDataOption.website]: [BusinessDI.website],
  [CollectedKybDataOption.corporationType]: [BusinessDI.corporationType],
  [CollectedKybDataOption.beneficialOwners]: [BusinessDI.beneficialOwners],
  [CollectedKybDataOption.kycedBeneficialOwners]: [
    BusinessDI.kycedBeneficialOwners,
  ],
};

export const CollectedKycDataOptionToRequiredAttributes: Record<
  CollectedKycDataOption,
  IdDI[]
> = {
  [CollectedKycDataOption.name]: [IdDI.firstName, IdDI.lastName],
  [CollectedKycDataOption.dob]: [IdDI.dob],
  [CollectedKycDataOption.ssn4]: [IdDI.ssn4],
  [CollectedKycDataOption.ssn9]: [IdDI.ssn9],
  [CollectedKycDataOption.fullAddress]: [
    IdDI.addressLine1,
    IdDI.city,
    IdDI.state,
    IdDI.zip,
    IdDI.country,
  ],
  [CollectedKycDataOption.partialAddress]: [IdDI.zip, IdDI.country],
  [CollectedKycDataOption.email]: [IdDI.email],
  [CollectedKycDataOption.phoneNumber]: [IdDI.phoneNumber],
  [CollectedKycDataOption.nationality]: [IdDI.nationality],
};
