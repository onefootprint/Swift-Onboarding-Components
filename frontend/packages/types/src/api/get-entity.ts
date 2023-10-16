import type { ApiEntityStatus, Entity } from '../data';

export type GetEntityRequest = {
  id: string;
};

export type GetEntityResponse = Entity<ApiEntityStatus | undefined>;
