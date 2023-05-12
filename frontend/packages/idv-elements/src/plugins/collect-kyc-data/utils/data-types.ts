import { IdDI } from '@onefootprint/types';

export type KycData = Partial<{
  [IdDI.firstName]: DataValue;
  [IdDI.lastName]: DataValue;
  [IdDI.dob]: DataValue;
  [IdDI.email]: DataValue;
  [IdDI.ssn9]: DataValue;
  [IdDI.ssn4]: DataValue;
  [IdDI.addressLine1]: DataValue;
  [IdDI.addressLine2]: DataValue;
  [IdDI.city]: DataValue;
  [IdDI.state]: DataValue;
  [IdDI.country]: DataValue;
  [IdDI.zip]: DataValue;
  [IdDI.phoneNumber]: DataValue;
}>;

export type DataValue = {
  value: string;
  bootstrap?: boolean;
  decrypted?: boolean;
  fixed?: boolean;
};

export type EmailInformation = Pick<KycData, IdDI.email>;

export type BasicInformation =
  | NameInformation
  | NameAndDobInformation
  | DobInformation;

export type NameInformation = Required<
  Pick<KycData, IdDI.firstName | IdDI.lastName>
>;

export type DobInformation = Required<Pick<KycData, IdDI.dob>>;

export type NameAndDobInformation = Required<
  Pick<KycData, IdDI.firstName | IdDI.lastName | IdDI.dob>
>;

export type ResidentialAddress =
  | ResidentialZipCodeAndCountry
  | ResidentialAddressFull;

export type ResidentialZipCodeAndCountry = Required<
  Pick<KycData, IdDI.country | IdDI.zip>
>;

export type ResidentialAddressFull = Required<
  Pick<
    KycData,
    | IdDI.country
    | IdDI.addressLine1
    | IdDI.addressLine2
    | IdDI.city
    | IdDI.zip
    | IdDI.state
  >
>;

export type SSN4Information = Pick<KycData, IdDI.ssn4>;
export type SSN9Information = Pick<KycData, IdDI.ssn9>;
export type SSNInformation = SSN4Information | SSN9Information;
