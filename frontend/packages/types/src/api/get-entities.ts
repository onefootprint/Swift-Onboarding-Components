import type { Entity, EntityKind } from '../data';

export type GetEntitiesRequest = {
  kind?: EntityKind;
  cursor?: number;
  search?: string;
  page_size: number;
  statuses?: string;
  timestamp_gte?: string | Date;
  timestamp_lte?: string;
  requires_manual_review?: boolean;
  watchlist_hit?: boolean;
  has_outstanding_workflow_request?: boolean;
  // When true, shows unverified vaults too
  show_all?: boolean;
};

export type GetEntitiesResponse = Entity[];
