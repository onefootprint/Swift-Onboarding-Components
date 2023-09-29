import type { CountryCode } from './countries';
import type { IdDI } from './di';
import type UsLegalStatus from './us-legal-status';
import type VisaKind from './visa-kind';

// TODO: expand in the future with KybBootstrapData and InvestorProfileBootstrapData
export type IdvBootstrapData = KycBootstrapData;
export type IdvOptions = {
  showCompletionPage?: boolean;
  showLogo?: boolean;
};

export type KycBootstrapData = Partial<{
  [IdDI.firstName]: string;
  [IdDI.middleName]: string;
  [IdDI.lastName]: string;
  [IdDI.email]: string;
  [IdDI.phoneNumber]: string;
  [IdDI.dob]: string;
  [IdDI.ssn9]: string;
  [IdDI.ssn4]: string;
  [IdDI.addressLine1]: string;
  [IdDI.addressLine2]: string;
  [IdDI.city]: string;
  [IdDI.state]: string;
  [IdDI.country]: CountryCode;
  [IdDI.zip]: string;
  [IdDI.usLegalStatus]: UsLegalStatus;
  [IdDI.nationality]: CountryCode;
  [IdDI.citizenships]: CountryCode[];
  [IdDI.visaKind]: VisaKind;
  [IdDI.visaExpirationDate]: string;
}>;

export type IdentifyBootstrapData = {
  email?: string;
  phoneNumber?: string;
};
