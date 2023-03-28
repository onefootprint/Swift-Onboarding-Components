import { DocumentDI } from '../data';
import { DecryptedDocument } from '../data/decrypted-document';

export type DecryptDocumentRequest = {
  userId: string;
  kind: DocumentDI;
  reason: string;
};

export type DecryptDocumentResponse = DecryptedDocument;
