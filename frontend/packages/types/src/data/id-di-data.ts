import { CountryCode } from './countries';
import { IdDI } from './di';

export type IdDIData = Partial<{ [K in IdDI]: ValueTypeForIdDI<K> }>;

export type ValueTypeForIdDI<K> = K extends IdDI.email
  ? string
  : K extends IdDI.phoneNumber
  ? string
  : K extends IdDI.firstName
  ? string
  : K extends IdDI.lastName
  ? string
  : K extends IdDI.dob
  ? string
  : K extends IdDI.ssn9
  ? string
  : K extends IdDI.ssn4
  ? string
  : K extends IdDI.addressLine1
  ? string
  : K extends IdDI.addressLine2
  ? string
  : K extends IdDI.city
  ? string
  : K extends IdDI.state
  ? string
  : K extends IdDI.country
  ? CountryCode
  : K extends IdDI.zip
  ? string
  : K extends IdDI.nationality
  ? CountryCode
  : K extends IdDI.usLegalStatus
  ? string
  : K extends IdDI.visaExpirationDate
  ? string
  : K extends IdDI.visaKind
  ? string
  : K extends IdDI.citizenships
  ? CountryCode[]
  : never;
