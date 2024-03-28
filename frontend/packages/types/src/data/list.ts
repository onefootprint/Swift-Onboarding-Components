import type { Actor } from './actor';
import type { Rule } from './rule';

export enum ListKind {
  emailAddress = 'email_address',
  emailDomain = 'email_domain',
  ssn9 = 'ssn9',
  phoneNumber = 'phone_number',
  phoneCountryCode = 'phone_country_code',
  ipAddress = 'ip_address',
}

export type ListPlaybookUsage = {
  id: string;
  key: string;
  name: string;
  rules: Rule[];
};

export type List = {
  id: string;
  actor: Actor;
  alias: string;
  entriesCount: number;
  usedInPlaybook: boolean;
  createdAt: string;
  kind: ListKind;
  name: string;
};

export type ListDetails = {
  id: string;
  actor: Actor;
  alias: string;
  createdAt: string;
  kind: ListKind;
  name: string;
  playbooks: ListPlaybookUsage[];
};

export type ListEntry = {
  id: string;
  data: string;
  createdAt: string;
  actor: Actor;
};
