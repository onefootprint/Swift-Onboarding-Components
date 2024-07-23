export type RawBusinessName = {
  kind: BusinessNameKind | null;
  name: string | null;
  sources: string | null;
  subStatus: string | null;
  submitted: boolean | null;
  verified: boolean | null;
  notes?: string | null;
};

export type BusinessName = {
  kind: BusinessNameKind | null;
  name: string;
  sources: string | null;
  subStatus: string;
  submitted: boolean | null;
  verified: boolean | null;
  notes?: string;
};

export enum BusinessNameKind {
  dba = 'dba',
  legal = 'legal',
}
