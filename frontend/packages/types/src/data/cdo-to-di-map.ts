import {
  CollectedDataOption,
  CollectedIdDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from './collected-data-option';
import {
  BusinessDI,
  DataIdentifier,
  DocumentDI,
  IdDI,
  IdDocDI,
  InvestorProfileDI,
} from './di';

const CdoToDiMap: Record<CollectedDataOption, DataIdentifier[]> = {
  // Id
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

  // Id Documents
  [CollectedIdDocumentDataOption.document]: [
    IdDocDI.driverLicense,
    IdDocDI.passport,
    IdDocDI.idCard,
  ],
  [CollectedIdDocumentDataOption.documentAndSelfie]: [
    IdDocDI.driverLicense,
    IdDocDI.passport,
    IdDocDI.idCard,
    IdDocDI.selfieDriverLicense,
    IdDocDI.selfieIdCard,
    IdDocDI.selfiePassport,
  ],

  // Investor Profile
  [CollectedInvestorProfileDataOption.investorProfile]: [
    DocumentDI.finraComplianceLetter,
    ...Object.values(InvestorProfileDI).map(value => value),
  ],
};

export default CdoToDiMap;
