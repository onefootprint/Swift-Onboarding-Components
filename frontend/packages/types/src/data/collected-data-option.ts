import { BusinessDI, IdDI } from './di';

export type CollectedDataOption =
  | CollectedKybDataOption
  | CollectedKycDataOption
  | CollectedInvestorProfileDataOption
  | CollectedDocumentDataOption
  | string; // Fixme: This "string" type makes the whole "CollectedDataOption" fallback to "string"

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
  address = 'full_address',
  email = 'email',
  phoneNumber = 'phone_number',
  nationality = 'nationality',
  usLegalStatus = 'us_legal_status',
  usTaxId = 'us_tax_id',
}

// TODO: update this
export enum CollectedDocumentDataOption {
  document = 'document',
  documentAndSelfie = 'document_and_selfie',
}

export const documentCdoFor = (collectDocument: boolean, collectSelfie: boolean) => {
  if (collectDocument && collectSelfie) {
    return CollectedDocumentDataOption.documentAndSelfie;
  }
  if (collectDocument) {
    return CollectedDocumentDataOption.document;
  }
  return null;
};

export const CollectedKybDataOptionToRequiredAttributes: Record<
  CollectedKybDataOption,
  Exclude<BusinessDI, BusinessDI.formationDate | BusinessDI.formationState>[] // We only get formation date and state from Middesk
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
  [CollectedKybDataOption.kycedBeneficialOwners]: [BusinessDI.kycedBeneficialOwners],
};

export const CollectedKycDataOptionToRequiredAttributes: Record<CollectedKycDataOption, IdDI[]> = {
  [CollectedKycDataOption.name]: [IdDI.firstName, IdDI.lastName],
  [CollectedKycDataOption.dob]: [IdDI.dob],
  [CollectedKycDataOption.ssn4]: [IdDI.ssn4],
  [CollectedKycDataOption.ssn9]: [IdDI.ssn9],
  [CollectedKycDataOption.address]: [IdDI.addressLine1, IdDI.city, IdDI.state, IdDI.zip, IdDI.country],
  [CollectedKycDataOption.email]: [IdDI.email],
  [CollectedKycDataOption.phoneNumber]: [IdDI.phoneNumber],
  [CollectedKycDataOption.nationality]: [IdDI.nationality],
  [CollectedKycDataOption.usLegalStatus]: [IdDI.usLegalStatus],
  [CollectedKycDataOption.usTaxId]: [IdDI.usTaxId],
};
