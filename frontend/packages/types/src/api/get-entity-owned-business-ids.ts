import type { EntityStatus } from '../data';

export type GetEntityOwnedBusinessIdsRequest = {
  entityId: string;
};

export type GetEntityOwnedBusinessIdsResponse = {
  id: string;
  status: EntityStatus;
}[];
