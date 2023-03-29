import { Entity, EntityKind } from '../data';

export type GetEntitiesRequest = {
  kind?: EntityKind;
  cursor: string | undefined;
  search: string | undefined;
  page_size: string;
  statuses: string | undefined;
  timestamp_gte: string | Date | undefined;
  timestamp_lte: string | undefined;
};

export type GetEntitiesResponse = Entity[];
