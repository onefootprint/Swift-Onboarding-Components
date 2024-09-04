import type { EntityKind, OrgTag } from '../data';

export type CreateOrgTagRequest = {
  kind: EntityKind;
  text: string;
};

export type CreateOrgTagResponse = OrgTag;
