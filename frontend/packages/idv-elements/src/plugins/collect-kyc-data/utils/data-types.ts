import { IdDI, IdDIData } from '@onefootprint/types';

export type BasicInformation =
  | NameInformation
  | NameAndDobInformation
  | DobInformation;

export type NameInformation = Required<
  Pick<IdDIData, IdDI.firstName | IdDI.lastName>
>;

export type DobInformation = Required<Pick<IdDIData, IdDI.dob>>;

export type NameAndDobInformation = Required<
  Pick<IdDIData, IdDI.firstName | IdDI.lastName | IdDI.dob>
>;

export type ResidentialAddress =
  | ResidentialZipCodeAndCountry
  | ResidentialAddressFull;

export type ResidentialZipCodeAndCountry = Required<
  Pick<IdDIData, IdDI.country | IdDI.zip>
>;

export type ResidentialAddressFull = Required<
  Pick<
    IdDIData,
    | IdDI.country
    | IdDI.addressLine1
    | IdDI.addressLine2
    | IdDI.city
    | IdDI.zip
    | IdDI.state
  >
>;

export type SSN4Information = Pick<IdDIData, IdDI.ssn4>;
export type SSN9Information = Pick<IdDIData, IdDI.ssn9>;
export type SSNInformation = SSN4Information | SSN9Information;
