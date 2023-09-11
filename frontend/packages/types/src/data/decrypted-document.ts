import type { DocumentDI } from './di';

export type DecryptedDocument = {
  dataIdentifier: DocumentDI;
  content: Blob;
};
