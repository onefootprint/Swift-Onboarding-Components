import type { DocumentDI } from '../data/di';

export type UploadFileRequest = {
  authToken: string;
  file: File;
  documentKind: DocumentDI.finraComplianceLetter;
};

export type UploadFileResponse = {
  data: string;
};
