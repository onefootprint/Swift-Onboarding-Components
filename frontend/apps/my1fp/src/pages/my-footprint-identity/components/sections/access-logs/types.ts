import { InsightEvent, UserDataAttribute } from 'types';

export const dataKindToDisplayName: Record<string, String> = {
  [UserDataAttribute.firstName]: 'First name',
  [UserDataAttribute.lastName]: 'Last name',
  [UserDataAttribute.email]: 'Email',
  [UserDataAttribute.phoneNumber]: 'Phone number',
  [UserDataAttribute.ssn9]: 'SSN',
  [UserDataAttribute.ssn4]: 'SSN last four',
  [UserDataAttribute.dob]: 'Date of birth',
  [UserDataAttribute.addressLine1]: 'Address line 1',
  [UserDataAttribute.addressLine2]: 'Address line 2',
  [UserDataAttribute.city]: 'City',
  [UserDataAttribute.state]: 'State',
  [UserDataAttribute.zip]: 'Zip code',
  [UserDataAttribute.country]: 'Country',
};

export enum AccessLogKind {
  Decrypt = 'decrypt',
  Update = 'update',
}

export type AccessLog = {
  targets: string[];
  kind: AccessLogKind;
  fpUserId: string;
  reason?: string;
  tenantId: string;
  timestamp: string;
  principal: string;
  insightEvent?: InsightEvent;
};
