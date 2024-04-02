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

export enum ListTimelineEventKind {
  listCreated = 'list_created',
  listUpdated = 'list_updated',
  listEntryCreated = 'list_entry_created',
  listEntryDeleted = 'list_entry_deleted',
}

// TODO: fill these based on API types
export type ListCreatedEvent = {
  kind: ListTimelineEventKind.listCreated;
  data: unknown;
};

export type ListUpdatedEvent = {
  kind: ListTimelineEventKind.listUpdated;
  data: unknown;
};

export type ListEntryCreatedEvent = {
  kind: ListTimelineEventKind.listEntryCreated;
  data: unknown;
};

export type ListEntryDeletedEvent = {
  kind: ListTimelineEventKind.listEntryDeleted;
  data: unknown;
};

export type ListTimelineEvent = {
  event:
    | ListCreatedEvent
    | ListUpdatedEvent
    | ListEntryCreatedEvent
    | ListEntryDeletedEvent;
  timestamp: string;
};

export type ListTimeline = ListTimelineEvent[];
