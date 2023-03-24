import { DocumentsDI } from '../data';

export type UploadFileRequest = {
  authToken: string;
  file: File;
  documentKind: DocumentsDI.finraComplianceLetter;
};

export type UploadFileResponse = {
  data: string;
};
