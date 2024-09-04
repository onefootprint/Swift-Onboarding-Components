import type { OrgTag } from '../data';

export type GetOrgTagsResponse = (Omit<OrgTag, 'text'> & {
  tag: string; // On frontend this field is 'text', but backend uses 'tag'
})[];
