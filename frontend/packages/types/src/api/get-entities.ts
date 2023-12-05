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
  order_by: 'last_activity_at';
};

export type GetEntitiesResponse = Entity<ApiEntityStatus | undefined>[];
