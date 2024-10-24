import type { Document, DocumentUpload } from '@onefootprint/types';

export type UploadWithDocument = DocumentUpload & { document: Omit<Document, 'uploads'>; documentId: string };
