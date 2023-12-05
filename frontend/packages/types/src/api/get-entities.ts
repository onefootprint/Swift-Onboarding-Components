import type { ApiEntityStatus, Entity, EntityKind } from '../data';

export type GetEntitiesRequest = {
  kind?: EntityKind;
  cursor?: string;
  search?: string;
  page_size: string;
  statuses?: string;
  timestamp_gte?: string | Date;
  timestamp_lte?: string;
  requires_manual_review?: string;
};

export type GetEntitiesResponse = Entity<ApiEntityStatus | undefined>[];
