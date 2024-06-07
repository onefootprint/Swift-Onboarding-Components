import type { OrgFrequentNote, OrgFrequentNoteKind } from '../data/org-frequent-note';

export type GetOrgFrequentNotesResponse = Array<OrgFrequentNote>;

export type CreateOrgFrequentNoteRequest = {
  kind: OrgFrequentNoteKind;
  content: string;
};

export type CreateOrgFrequentNoteResponse = OrgFrequentNote;
