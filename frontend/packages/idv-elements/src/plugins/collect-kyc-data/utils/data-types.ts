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
  [IdDI.nationality]: DataValue;
  [IdDI.usLegalStatus]: DataValue;
  [IdDI.visaExpirationDate]: DataValue;
  [IdDI.visaKind]: DataValue;
  [IdDI.citizenships]: DataValue;
}>;

export type DataValue = {
  value: string;
  bootstrap?: boolean;
  decrypted?: boolean; // True when populated from decrypted value in vault
  scrubbed?: boolean; // True when it exists in vault but we haven't yet decrypted it
  disabled?: boolean;
};

export const getDisplayValue = (v?: DataValue) => {
  if (v?.scrubbed) {
    return '•••••••••';
  }
  return v?.value;
};
