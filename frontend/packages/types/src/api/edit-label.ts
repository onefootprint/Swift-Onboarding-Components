import type { EntityLabel } from '../data';

export type EditLabelRequest = {
  id: string;
  kind: EntityLabel | null;
};

export type EditLabelResponse = {
  id: string;
};
