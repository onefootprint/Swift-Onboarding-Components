import type { EntityKind } from './entity';

export type OrgTag = {
  id: string;
  kind: EntityKind;
  tag: string; // must be unique, enforced by backend
};
