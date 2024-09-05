import type { EntityLabel } from '../data';

export type GetLabelResponse = {
  createdAt: string;
  kind: EntityLabel | null;
};
