import { InsightEvent } from 'src/types';

export enum UserDataAttribute {
  firstName = 'firstName',
  lastName = 'lastName',
  dob = 'dob',
  email = 'email',
  phone = 'phone_number',
  ssn = 'ssn',
  streetAddress = 'streetAddress',
  streetAddress2 = 'streetAddress2',
  city = 'city',
  state = 'state',
  country = 'country',
  zip = 'zip',
}

export type AuthorizedOrgOnboarding = {
  canAccessDataKinds: UserDataAttribute[];
  insightEvent: InsightEvent;
  name: string;
  status: string;
  timestamp: string;
};

export type AuthorizedOrg = {
  id: string;
  logoUrl: string;
  name: string;
  onboardings: AuthorizedOrgOnboarding[];
  tenantId: string;
};
