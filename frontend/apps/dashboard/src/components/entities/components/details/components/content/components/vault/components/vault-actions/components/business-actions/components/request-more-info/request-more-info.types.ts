export type AddBoFormValues = {
  boId: string;
  note: string;
};

export type UploadDocsFormValues = {
  boId: string;
  note: string;
  docs: Doc[];
};

export type Doc = {
  name: string;
  identifier: string;
  description: string;
};
