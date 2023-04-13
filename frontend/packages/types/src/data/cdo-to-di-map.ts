import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import {
  BusinessDI,
  DataIdentifier,
  DocumentDI,
  IdDI,
  InvestorProfileDI,
} from './di';

const CdoToDiMap: Record<CollectedDataOption, DataIdentifier[]> = {
  // Id
  [CollectedKycDataOption.name]: [IdDI.firstName, IdDI.lastName],
  [CollectedKycDataOption.dob]: [IdDI.dob],
  [CollectedKycDataOption.ssn4]: [IdDI.ssn4],
  [CollectedKycDataOption.ssn9]: [IdDI.ssn9, IdDI.ssn4],
  [CollectedKycDataOption.fullAddress]: [
    IdDI.addressLine1,
    IdDI.addressLine2,
    IdDI.city,
    IdDI.state,
    IdDI.zip,
    IdDI.country,
  ],
  [CollectedKycDataOption.partialAddress]: [IdDI.zip, IdDI.country],
  [CollectedKycDataOption.email]: [IdDI.email],
  [CollectedKycDataOption.phoneNumber]: [IdDI.phoneNumber],

  // Business
  [CollectedKybDataOption.name]: [BusinessDI.name, BusinessDI.doingBusinessAs],
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
  [CollectedKybDataOption.beneficialOwners]: [BusinessDI.beneficialOwners],

  // Documents
  [CollectedDocumentDataOption.document]: [
    DocumentDI.finraComplianceLetter,
    DocumentDI.passport,
    DocumentDI.driversLicenseBack,
    DocumentDI.driversLicenseFront,
    DocumentDI.idCardBack,
    DocumentDI.idCardFront,
  ],
  [CollectedDocumentDataOption.documentAndSelfie]: [
    ...Object.values(DocumentDI).map(value => value),
  ],

  // Investor Profile
  [CollectedInvestorProfileDataOption.investorProfile]: [
    ...Object.values(InvestorProfileDI).map(value => value),
  ],
};

export default CdoToDiMap;
