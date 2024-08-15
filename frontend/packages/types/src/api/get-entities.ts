import type { Entity, EntityKind } from '../data';

export type GetEntitiesRequest = {
  cursor?: number;
  kind?: EntityKind;
  pageSize?: number;
  requiresManualReview?: boolean;
  search?: string;
  statuses?: string;
  timestampGte?: string | Date;
  timestampLte?: string;
  watchlistHit?: boolean;
  hasOutstandingWorkflowRequest?: boolean;
  // When true, shows unverified vaults too
  showAll?: boolean;
};

export type GetEntitiesResponse = Entity[];
