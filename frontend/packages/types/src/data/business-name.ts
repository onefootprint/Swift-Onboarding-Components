export type BusinessName = {
  kind: BusinessNameKind | null;
  name: string | null;
  sources: string | null;
  subStatus: string | null;
  submitted: boolean | null;
  verified: boolean | null;
  notes?: string | null;
};

export enum BusinessNameKind {
  dba = 'dba',
  legal = 'legal',
}
