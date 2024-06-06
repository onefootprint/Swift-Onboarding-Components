import type { ApiEntityStatus } from '../data';

export type GetEntityOwnedBusinessIdsRequest = {
  entityId: string;
};

export type GetEntityOwnedBusinessIdsResponse = {
  id: string;
  status: ApiEntityStatus | undefined;
}[];
