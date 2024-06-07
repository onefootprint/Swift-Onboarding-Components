import type { Actor } from './actor';
import type { InsightEvent } from './insight-event';
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
  createList = 'create_list',
  updateList = 'update_list',
  createListEntry = 'create_list_entry',
  deleteListEntry = 'delete_list_entry',
}

// TODO: implement after backend is ready
export type ListCreatedEvent = {
  kind: ListTimelineEventKind.createList;
  data: unknown;
};

// TODO: implement after backend is ready
export type ListUpdatedEvent = {
  kind: ListTimelineEventKind.updateList;
  data: unknown;
};

export type ListEntryCreatedEvent = {
  kind: ListTimelineEventKind.createListEntry;
  data: {
    listEntryCreationId: string;
    entries: string[];
  };
};

export type ListEntryDeletedEvent = {
  kind: ListTimelineEventKind.deleteListEntry;
  data: {
    listEntryId: string;
    entry: string;
  };
};

export type ListTimelineEvent = {
  id: string;
  timestamp: string;
  tenantId: string;
  name: ListTimelineEventKind;
  principal: {
    kind: string;
    member: string;
  };
  insightEvent: InsightEvent;
  detail: ListCreatedEvent | ListUpdatedEvent | ListEntryCreatedEvent | ListEntryDeletedEvent;
};

export type ListTimeline = ListTimelineEvent[];
