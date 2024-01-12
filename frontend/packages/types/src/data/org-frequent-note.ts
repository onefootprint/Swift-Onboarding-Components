export enum OrgFrequentNoteKind {
  ManualReview = 'manual_review',
  Annotation = 'annotation',
  Trigger = 'trigger',
}

export type OrgFrequentNote = {
  id: string;
  kind: OrgFrequentNoteKind;
  content: string;
};
