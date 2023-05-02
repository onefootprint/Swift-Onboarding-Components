import { CountryCode } from './countries';
import { IdDI } from './di';
import UserDataAttribute from './user-data-attribute';

export type UserData = Partial<{
  [UserDataAttribute.firstName]: string;
  [UserDataAttribute.lastName]: string;
  [UserDataAttribute.dob]: string;
  [UserDataAttribute.email]: string;
  [UserDataAttribute.ssn9]: string;
  [UserDataAttribute.ssn4]: string;
  [UserDataAttribute.addressLine1]: string;
  [UserDataAttribute.addressLine2]: string;
  [UserDataAttribute.city]: string;
  [UserDataAttribute.state]: string;
  [UserDataAttribute.country]: CountryCode;
  [UserDataAttribute.zip]: string;
  [UserDataAttribute.phoneNumber]: string;
}>;

export type IdDIData = Partial<{
  [IdDI.firstName]: string;
  [IdDI.lastName]: string;
  [IdDI.dob]: string;
  [IdDI.email]: string;
  [IdDI.ssn9]: string;
  [IdDI.ssn4]: string;
  [IdDI.addressLine1]: string;
  [IdDI.addressLine2]: string;
  [IdDI.city]: string;
  [IdDI.state]: string;
  [IdDI.country]: CountryCode;
  [IdDI.zip]: string;
  [IdDI.phoneNumber]: string;
}>;
