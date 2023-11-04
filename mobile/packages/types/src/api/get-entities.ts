import type { Entity, EntityKind } from '../data';

export type GetEntitiesRequest = {
  kind?: EntityKind;
  cursor?: string;
  search?: string;
  page_size: string;
  statuses?: string;
  timestamp_gte?: string | Date;
  timestamp_lte?: string;
};

export type GetEntitiesResponse = Entity[];
