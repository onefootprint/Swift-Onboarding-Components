import type { CollectedDataOption } from './collected-data-option';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import type { DataIdentifier } from './di';
import { BusinessDI, DocumentDI, IdDI, InvestorProfileDI } from './di';

// Used as a comprehensive list of CDOs to all associated DIs
const CdoToAllDisMap: Record<CollectedDataOption, DataIdentifier[]> = {
  // Id
  [CollectedKycDataOption.name]: [IdDI.firstName, IdDI.middleName, IdDI.lastName],
  [CollectedKycDataOption.dob]: [IdDI.dob],
  [CollectedKycDataOption.ssn4]: [IdDI.ssn4],
  [CollectedKycDataOption.ssn9]: [IdDI.ssn9],
  [CollectedKycDataOption.address]: [
    IdDI.addressLine1,
    IdDI.addressLine2,
    IdDI.city,
    IdDI.state,
    IdDI.zip,
    IdDI.country,
  ],
  [CollectedKycDataOption.email]: [IdDI.email],
  [CollectedKycDataOption.phoneNumber]: [IdDI.phoneNumber],
  [CollectedKycDataOption.nationality]: [IdDI.nationality],
  [CollectedKycDataOption.usLegalStatus]: [
    IdDI.usLegalStatus,
    IdDI.visaKind,
    IdDI.visaExpirationDate,
    IdDI.citizenships,
    IdDI.nationality,
  ],

  // Business
  [CollectedKybDataOption.name]: [BusinessDI.name, BusinessDI.doingBusinessAs],
  [CollectedKybDataOption.tin]: [BusinessDI.tin],
  [CollectedKybDataOption.address]: [
    BusinessDI.addressLine1,
    BusinessDI.addressLine2,
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

  // Documents
  [CollectedDocumentDataOption.document]: [
    DocumentDI.latestPassport,
    DocumentDI.latestDriversLicenseBack,
    DocumentDI.latestDriversLicenseFront,
    DocumentDI.latestIdCardBack,
    DocumentDI.latestIdCardFront,
  ],
  [CollectedDocumentDataOption.documentAndSelfie]: [...Object.values(DocumentDI).map(value => value)],

  // Investor Profile
  [CollectedInvestorProfileDataOption.investorProfile]: [
    DocumentDI.finraComplianceLetter,
    ...Object.values(InvestorProfileDI).map(value => value),
  ],
  card: [],
};

export default CdoToAllDisMap;
