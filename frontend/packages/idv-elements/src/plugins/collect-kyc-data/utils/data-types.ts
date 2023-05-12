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
