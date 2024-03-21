import type { Actor } from './actor';

export enum ListKind {
  emailAddress = 'email_address',
  emailDomain = 'email_domain',
  ssn9 = 'ssn9',
  phoneNumber = 'phone_number',
  phoneCountryCode = 'phone_country_code',
  ipAddress = 'ip_address',
}

export type List = {
  id: string;
  actor: Actor;
  alias: string;
  createdAt: string;
  kind: ListKind;
  name: string;
};
