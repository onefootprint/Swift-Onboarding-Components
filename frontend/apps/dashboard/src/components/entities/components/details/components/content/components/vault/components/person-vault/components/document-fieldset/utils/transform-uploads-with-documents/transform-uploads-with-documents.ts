import type { Document, DocumentUpload } from '@onefootprint/types';
import type { UploadWithDocument } from '../../types';

const transformUploadsWithDocuments = (documents: Document[]): UploadWithDocument[] => {
  return documents.flatMap(document => {
    const { uploads, ...documentWithoutUploads } = document;
    return uploads.map((upload: DocumentUpload) => ({
      ...upload,
      document: documentWithoutUploads,
      documentId: `${upload.identifier}-${upload.timestamp}`,
    }));
  });
};

export default transformUploadsWithDocuments;
