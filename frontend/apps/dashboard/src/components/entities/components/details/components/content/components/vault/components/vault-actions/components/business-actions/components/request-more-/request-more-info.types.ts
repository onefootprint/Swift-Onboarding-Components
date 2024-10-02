export type FormValues = {
  beneficialOwner: string;
  note: string;
  docs: Doc[];
};

export type Doc = {
  name: string;
  identifier: string;
  description?: string;
};
