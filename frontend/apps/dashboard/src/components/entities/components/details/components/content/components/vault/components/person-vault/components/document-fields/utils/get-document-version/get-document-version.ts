import type { Document } from '@onefootprint/types';

const getDocumentVersion = (document: Document, documents: Document[]) => {
  if (document?.completedVersion) {
    return document.completedVersion.toString();
  }
  return `incomplete_${documents.indexOf(document)}`;
};

export default getDocumentVersion;
