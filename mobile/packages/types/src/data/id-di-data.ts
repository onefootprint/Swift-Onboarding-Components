import type { CountryCode } from './countries';
import type { IdDI } from './di';

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
