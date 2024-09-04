import type { EntityKind } from './entity';

export type OrgTag = {
  id: string;
  kind: EntityKind;
  text: string; // must be unique, enforced by backend
};
